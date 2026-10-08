import { MockAccount, RetailerApprovalStatus, AccountStatus } from '@/types/domain';
import { UserRole } from '@/config/roles';
import { MOCK_ACCOUNTS } from '@/mocks/mockAuth';
import { ApiResponse } from '@/types/common';
import { hierarchyService } from './hierarchyService';
import { normalizeEntityId, entityIdsEqual } from '@/utils/identity';

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  entityId?: string;
  approvalStatus?: RetailerApprovalStatus;
  accountStatus?: AccountStatus;
  permissions: string[];
  accessToken?: string;
  refreshToken?: string;
  mustChangePassword?: boolean;
  loggedInAt: string;
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    case 'KYC':
      return '/kyc/dashboard';
    case 'SALES':
      return '/sales/dashboard';
    case 'ACCOUNTS':
      return '/accounts/dashboard';
    case 'OPERATIONS':
    case 'SUPPORT':
      return '/operations/dashboard';
    case 'MASTER_DISTRIBUTOR':
      return '/master-distributor/dashboard';
    case 'DISTRIBUTOR':
      return '/distributor/dashboard';
    case 'RETAILER':
      return '/retailer/dashboard';
    default:
      return '/admin/dashboard';
  }
}

/**
 * Centralized account login eligibility check for all hierarchy roles.
 */
export function canAccountLogin(account: Partial<MockAccount> | null | undefined): { eligible: boolean; reason?: string } {
  if (!account) return { eligible: false, reason: 'Account not found.' };

  // Admin & Super Admin
  if (account.role === 'ADMIN' || account.role === 'SUPER_ADMIN') {
    if (account.accountStatus === 'SUSPENDED') {
      return { eligible: false, reason: 'Your administrator account is currently suspended.' };
    }
    return { eligible: true };
  }

  // Master Distributor
  if (account.role === 'MASTER_DISTRIBUTOR') {
    if (account.accountStatus === 'SUSPENDED') {
      return { eligible: false, reason: 'Your account is currently suspended. Please contact support for assistance.' };
    }
    if (account.accountStatus === 'INACTIVE') {
      return { eligible: false, reason: 'Your Master Distributor account is currently inactive.' };
    }
    return { eligible: true };
  }

  // Distributor
  if (account.role === 'DISTRIBUTOR') {
    if (account.approvalStatus === 'PENDING_APPROVAL') {
      return {
        eligible: false,
        reason:
          'Your distributor account is awaiting administrator approval. You will be able to sign in once your account has been approved.',
      };
    }
    if (account.approvalStatus === 'REJECTED') {
      return {
        eligible: false,
        reason:
          'Your distributor account has not been approved. Please contact your Master Distributor or support team for assistance.',
      };
    }
    if (account.accountStatus === 'SUSPENDED') {
      return { eligible: false, reason: 'Your account is currently suspended. Please contact support for assistance.' };
    }
    if (account.accountStatus === 'INACTIVE') {
      return { eligible: false, reason: 'Your distributor account is currently inactive.' };
    }
    return { eligible: true };
  }

  // Retailer
  if (account.role === 'RETAILER') {
    if (account.approvalStatus === 'PENDING_APPROVAL') {
      return {
        eligible: false,
        reason:
          'Your retailer account is awaiting administrator approval. You will be able to sign in once your account has been approved.',
      };
    }
    if (account.approvalStatus === 'REJECTED') {
      return {
        eligible: false,
        reason:
          'Your retailer account has not been approved. Please contact your distributor or support team for assistance.',
      };
    }
    if (account.accountStatus === 'SUSPENDED') {
      return { eligible: false, reason: 'Your account is currently suspended. Please contact support for assistance.' };
    }
    if (account.accountStatus === 'INACTIVE') {
      return { eligible: false, reason: 'Your retailer account is currently inactive.' };
    }
    return { eligible: true };
  }

  return { eligible: true };
}

export function canRetailerLogin(account: Partial<MockAccount> | null | undefined): boolean {
  return canAccountLogin(account).eligible;
}

class MockAuthService {
  private accounts: Record<string, MockAccount> = { ...MOCK_ACCOUNTS };

  getMockAccountByRole(roleKey: string): MockAccount | null {
    return this.accounts[roleKey] || null;
  }

  getMockAccountByEmail(email: string): MockAccount | null {
    return (
      Object.values(this.accounts).find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  }

  getAllMockAccounts(): MockAccount[] {
    return Object.values(this.accounts);
  }

  verifyLoginEligibility(account: MockAccount): { eligible: boolean; reason?: string } {
    return canAccountLogin(account);
  }

  async authenticate(identifier: string): Promise<ApiResponse<AuthSession>> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Try matching existing mock account first
    let matchedAccount = Object.values(this.accounts).find(
      (acc) =>
        acc.username.toLowerCase() === cleanId ||
        acc.email.toLowerCase() === cleanId ||
        acc.mobile === cleanId ||
        (acc.entityId && entityIdsEqual(acc.entityId, cleanId))
    );

    // 2. If not found in mock accounts, check dynamic hierarchy records
    if (!matchedAccount) {
      const retailer = hierarchyService.getRetailerById(cleanId) || hierarchyService.getAllRetailers().find(r => r.email.toLowerCase() === cleanId || r.code.toLowerCase() === cleanId);
      if (retailer) {
        matchedAccount = {
          userId: `usr_${retailer.id}`,
          username: retailer.email,
          name: retailer.name,
          email: retailer.email,
          mobile: retailer.mobile,
          role: 'RETAILER',
          entityId: retailer.id,
          approvalStatus: retailer.approvalStatus,
          accountStatus: retailer.accountStatus,
          permissions: ['payin:create', 'payout:create', 'transactions:read', 'wallet:read', 'commissions:read', 'reports:read'],
        };
      } else {
        const dst = hierarchyService.getDistributorById(cleanId) || hierarchyService.getAllDistributors().find(d => d.email.toLowerCase() === cleanId || d.code.toLowerCase() === cleanId);
        if (dst) {
          matchedAccount = {
            userId: `usr_${dst.id}`,
            username: dst.email,
            name: dst.name,
            email: dst.email,
            mobile: dst.mobile,
            role: 'DISTRIBUTOR',
            entityId: dst.id,
            approvalStatus: dst.approvalStatus || 'APPROVED',
            accountStatus: dst.status,
            permissions: ['retailers:read', 'retailers:create', 'wallet:read', 'reports:read', 'commissions:read'],
          };
        }
      }
    }

    if (!matchedAccount) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Dynamically sync status from hierarchy store to ensure live Admin approvals immediately take effect
    if (matchedAccount.entityId) {
      if (matchedAccount.role === 'RETAILER') {
        const liveRetailer = hierarchyService.getRetailerById(matchedAccount.entityId);
        if (liveRetailer) {
          matchedAccount.approvalStatus = liveRetailer.approvalStatus;
          matchedAccount.accountStatus = liveRetailer.accountStatus;
        }
      } else if (matchedAccount.role === 'DISTRIBUTOR') {
        const liveDistributor = hierarchyService.getDistributorById(matchedAccount.entityId);
        if (liveDistributor) {
          matchedAccount.approvalStatus = liveDistributor.approvalStatus || 'APPROVED';
          matchedAccount.accountStatus = liveDistributor.status;
        }
      } else if (matchedAccount.role === 'MASTER_DISTRIBUTOR') {
        const liveMD = hierarchyService.getMasterDistributorById(matchedAccount.entityId);
        if (liveMD) {
          matchedAccount.accountStatus = liveMD.status;
        }
      }
    }

    // 4. Check account status & approval eligibility
    const eligibility = this.verifyLoginEligibility(matchedAccount);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_RESTRICTED',
          message: eligibility.reason || 'Account is not eligible to log in.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 5. Construct safe AuthSession with normalized entity ID (NO passwords stored)
    const session: AuthSession = {
      userId: matchedAccount.userId,
      name: matchedAccount.name,
      email: matchedAccount.email,
      mobile: matchedAccount.mobile,
      role: matchedAccount.role,
      entityId: normalizeEntityId(matchedAccount.entityId),
      approvalStatus: matchedAccount.approvalStatus,
      accountStatus: matchedAccount.accountStatus,
      permissions: matchedAccount.permissions,
      loggedInAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };
  }
}

export const mockAuthService = new MockAuthService();
