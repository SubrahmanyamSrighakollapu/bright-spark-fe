import type { Distributor, Retailer, AccountStatus, ApprovalStatus, KYCStatus, UserRole } from '@/types/domain';
import type { NetworkUserItem } from './userService';

const accountStatus = (value: string): AccountStatus =>
  (value === 'DISABLED' || value === 'BLOCKED' ? 'INACTIVE' : value) as AccountStatus;

export function networkUserToDistributor(user: NetworkUserItem): Distributor {
  return {
    id: user.id, userId: user.id, code: user.code, masterDistributorId: user.parentId || '',
    name: user.fullName, businessName: user.displayName, email: user.email, mobile: user.mobile,
    kycStatus: user.kycStatus as KYCStatus, approvalStatus: user.approvalStatus as ApprovalStatus,
    status: accountStatus(user.accountStatus), walletId: user.walletId || '',
    createdByUserId: user.createdByUserId || undefined,
    createdByRole: (user.createdByRole || undefined) as UserRole | undefined,
    createdByEntityId: user.parentId || undefined, createdAt: user.createdAt,
  };
}

export function networkUserToRetailer(user: NetworkUserItem): Retailer {
  return {
    id: user.id, userId: user.id, code: user.code,
    masterDistributorId: user.masterDistributorId || '', distributorId: user.parentId || '', planId: user.planId || '',
    name: user.fullName, businessName: user.displayName, email: user.email, mobile: user.mobile,
    kycStatus: user.kycStatus as KYCStatus, approvalStatus: user.approvalStatus as ApprovalStatus,
    accountStatus: accountStatus(user.accountStatus), walletId: user.walletId || '',
    createdByUserId: user.createdByUserId || '', createdByRole: (user.createdByRole || 'ADMIN') as UserRole,
    createdByEntityId: user.parentId || '', createdAt: user.createdAt,
  };
}
