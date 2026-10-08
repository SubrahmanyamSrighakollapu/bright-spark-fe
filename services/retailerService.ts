import { Retailer, AccountStatus, KYCStatus, ApiResponse, ApprovalStatus } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { approvalService } from '@/services/approvalService';
import { APP_CONFIG } from '@/config';
import { userService } from './userService';
import { networkUserToDistributor, networkUserToRetailer } from './networkUserMapper';

export interface CreateRetailerInput {
  distributorId: string;
  planId: string;
  name: string;
  code?: string;
  businessName: string;
  email: string;
  mobile: string;
  kycStatus?: KYCStatus;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateRetailerInput {
  name?: string;
  businessName?: string;
  email?: string;
  mobile?: string;
  planId?: string;
  kycStatus?: KYCStatus;
  accountStatus?: AccountStatus;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ScopedRetailerSummary {
  totalRetailers: number;
  activeRetailers: number;
  pendingApprovalRetailers: number;
  inactiveRetailers: number;
}

function summarizeRetailers(retailers: Retailer[]): ScopedRetailerSummary {
  return {
    totalRetailers: retailers.length,
    activeRetailers: retailers.filter((item) => item.approvalStatus === 'APPROVED' && item.accountStatus === 'ACTIVE').length,
    pendingApprovalRetailers: retailers.filter((item) => item.approvalStatus === 'PENDING_APPROVAL').length,
    inactiveRetailers: retailers.filter((item) => item.accountStatus !== 'ACTIVE' && item.approvalStatus !== 'PENDING_APPROVAL').length,
  };
}

class RetailerService {
  async getRetailersForMasterDistributor(
    masterDistributorId: string
  ): Promise<ApiResponse<Retailer[]>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUsers({ role: 'RETAILER', pageSize: 100 });
      return { ...response, data: response.data?.items.map(networkUserToRetailer) || [] };
    }
    const retailers = hierarchyService.getMasterDistributorRetailers(masterDistributorId);
    return {
      success: true,
      data: retailers,
      timestamp: new Date().toISOString(),
    };
  }

  async getRetailerByIdForMasterDistributor(
    masterDistributorId: string,
    retailerId: string
  ): Promise<ApiResponse<Retailer | null>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUser(retailerId);
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : null };
    }
    const retailer = hierarchyService.getRetailerById(retailerId);

    // Security Scoping: Guarantee retailer belongs to the authenticated Master Distributor
    if (!retailer || retailer.masterDistributorId !== masterDistributorId) {
      return {
        success: false,
        error: {
          code: 'RETAILER_NOT_FOUND',
          message: 'Retailer record not found or access denied for your Master Distributor account.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: retailer,
      timestamp: new Date().toISOString(),
    };
  }

  async getEligibleDistributorsForRetailerCreation(masterDistributorId: string) {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUsers({ role: 'DISTRIBUTOR', pageSize: 100 });
      return (response.data?.items || []).map(networkUserToDistributor)
        .filter((item) => item.status === 'ACTIVE' && item.approvalStatus === 'APPROVED');
    }
    const networkDistributors = hierarchyService.getMasterDistributorDistributors(masterDistributorId);
    // Operationally eligible: APPROVED & ACTIVE
    return networkDistributors.filter(
      (d) => (d.approvalStatus || 'APPROVED') === 'APPROVED' && d.status === 'ACTIVE'
    );
  }

  async createRetailerForMasterDistributor(
    masterDistributorId: string,
    input: CreateRetailerInput,
    createdByUserId: string = 'usr_md_01'
  ): Promise<ApiResponse<Retailer>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.createUser({ role: 'RETAILER', fullName: input.name,
        displayName: input.businessName, email: input.email, mobile: input.mobile, parentPartyId: input.distributorId });
      if (response.data) await userService.assignUserPlan(response.data.id, input.planId);
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : undefined };
    }
    // 1. Validate Parent Distributor ownership & operational status
    const parentDst = hierarchyService.getDistributorById(input.distributorId);
    if (
      !parentDst ||
      parentDst.masterDistributorId !== masterDistributorId ||
      (parentDst.approvalStatus || 'APPROVED') !== 'APPROVED' ||
      parentDst.status !== 'ACTIVE'
    ) {
      return {
        success: false,
        error: {
          code: 'INVALID_DISTRIBUTOR',
          message: 'Selected parent distributor is not eligible or active within your network.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Validate Selected Retailer Plan
    const planRes = await retailerPlanService.getPlanById(input.planId);
    if (!planRes.success || !planRes.data || planRes.data.status !== 'ACTIVE') {
      return {
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'Selected Retailer Plan is inactive or invalid.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Retailer Code Uniqueness Check
    const cleanCode = (
      input.code || `RET${Date.now().toString().slice(-4)}`
    ).trim().toUpperCase();

    const existingCode = hierarchyService
      .getAllRetailers()
      .find((r) => r.code.toUpperCase() === cleanCode);

    if (existingCode) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_CODE',
          message: `Retailer code "${cleanCode}" is already in use. Please specify a unique code.`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Initial Creator Approval Rule State
    // Master Distributor created -> PENDING_APPROVAL & INACTIVE
    const initialApprovalState = approvalService.getInitialApprovalState('RETAILER', 'MASTER_DISTRIBUTOR');

    // 5. Build New Retailer Entity
    const newRetailer: Retailer = {
      id: `ret_${Date.now().toString(36)}`,
      code: cleanCode,
      masterDistributorId: masterDistributorId, // FORCED FROM AUTHENTICATED SESSION
      distributorId: input.distributorId,
      userId: `usr_ret_${Date.now().toString(36)}`,
      planId: input.planId,
      name: input.name.trim(),
      businessName: input.businessName.trim(),
      email: input.email.trim().toLowerCase(),
      mobile: input.mobile.trim(),
      kycStatus: input.kycStatus || 'APPROVED',
      approvalStatus: initialApprovalState.approvalStatus,
      accountStatus: initialApprovalState.accountStatus,
      walletId: `wlt_ret_${Date.now().toString(36)}`,
      createdByUserId: createdByUserId,
      createdByRole: 'MASTER_DISTRIBUTOR',
      createdByEntityId: masterDistributorId,
      createdAt: new Date().toISOString(),
    };

    hierarchyService.addRetailerRecord(newRetailer);

    return {
      success: true,
      data: newRetailer,
      message: 'Retailer submitted successfully and is awaiting Admin approval.',
      timestamp: new Date().toISOString(),
    };
  }

  async updateRetailerForMasterDistributor(
    masterDistributorId: string,
    retailerId: string,
    updates: UpdateRetailerInput
  ): Promise<ApiResponse<Retailer>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.updateUser(retailerId, { fullName: updates.name,
        displayName: updates.businessName, email: updates.email, mobile: updates.mobile, status: updates.accountStatus });
      if (updates.planId) await userService.assignUserPlan(retailerId, updates.planId);
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : undefined };
    }
    const check = await this.getRetailerByIdForMasterDistributor(masterDistributorId, retailerId);
    if (!check.success || !check.data) {
      return {
        success: false,
        error: check.error || { code: 'NOT_FOUND', message: 'Retailer not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateRetailerRecord(retailerId, {
      name: updates.name ? updates.name.trim() : check.data.name,
      businessName: updates.businessName ? updates.businessName.trim() : check.data.businessName,
      email: updates.email ? updates.email.trim().toLowerCase() : check.data.email,
      mobile: updates.mobile ? updates.mobile.trim() : check.data.mobile,
      planId: updates.planId || check.data.planId,
      kycStatus: updates.kycStatus || check.data.kycStatus,
      accountStatus: updates.accountStatus || check.data.accountStatus,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to update retailer.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async toggleRetailerStatus(
    masterDistributorId: string,
    retailerId: string
  ): Promise<ApiResponse<Retailer>> {
    if (!APP_CONFIG.useMockData) {
      const current = await this.getRetailerByIdForMasterDistributor(masterDistributorId, retailerId);
      if (!current.success || !current.data) return current as ApiResponse<Retailer>;
      const next = current.data.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await userService.updateUserStatus(retailerId, next, 'Master Distributor retailer status change');
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : undefined };
    }
    const check = await this.getRetailerByIdForMasterDistributor(masterDistributorId, retailerId);
    if (!check.success || !check.data) {
      return {
        success: false,
        error: check.error || { code: 'NOT_FOUND', message: 'Retailer not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    // Action restriction: Cannot toggle status if pending approval or rejected!
    if (check.data.approvalStatus === 'PENDING_APPROVAL') {
      return {
        success: false,
        error: {
          code: 'ACTION_BLOCKED',
          message: 'Cannot toggle account status while retailer is awaiting Admin approval.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (check.data.approvalStatus === 'REJECTED') {
      return {
        success: false,
        error: {
          code: 'ACTION_BLOCKED',
          message: 'Cannot toggle account status for a rejected retailer.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const currentStatus = check.data.accountStatus;
    const newStatus: AccountStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    return this.updateRetailerForMasterDistributor(masterDistributorId, retailerId, {
      accountStatus: newStatus,
    });
  }

  async getRetailerSummaryForMasterDistributor(
    masterDistributorId: string
  ): Promise<ScopedRetailerSummary> {
    if (!APP_CONFIG.useMockData) {
      const response = await this.getRetailersForMasterDistributor(masterDistributorId);
      return summarizeRetailers(response.data || []);
    }
    const retailers = hierarchyService.getMasterDistributorRetailers(masterDistributorId);

    const totalRetailers = retailers.length;
    const activeRetailers = retailers.filter(
      (r) => r.approvalStatus === 'APPROVED' && r.accountStatus === 'ACTIVE'
    ).length;
    const pendingApprovalRetailers = retailers.filter(
      (r) => r.approvalStatus === 'PENDING_APPROVAL'
    ).length;
    const inactiveRetailers = retailers.filter(
      (r) => r.accountStatus !== 'ACTIVE' && r.approvalStatus !== 'PENDING_APPROVAL'
    ).length;

    return {
      totalRetailers,
      activeRetailers,
      pendingApprovalRetailers,
      inactiveRetailers,
    };
  }

  async getRetailersForDistributor(
    distributorId: string
  ): Promise<ApiResponse<Retailer[]>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUsers({ role: 'RETAILER', pageSize: 100 });
      return { ...response, data: response.data?.items.map(networkUserToRetailer) || [] };
    }
    const retailers = hierarchyService.getDistributorRetailers(distributorId);
    return {
      success: true,
      data: retailers,
      timestamp: new Date().toISOString(),
    };
  }

  async getRetailerByIdForDistributor(
    distributorId: string,
    retailerId: string
  ): Promise<ApiResponse<Retailer | null>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUser(retailerId);
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : null };
    }
    const retailer = hierarchyService.getRetailerById(retailerId);

    // Security Scoping: Guarantee retailer belongs to the authenticated Distributor
    if (!retailer || retailer.distributorId !== distributorId) {
      return {
        success: false,
        error: {
          code: 'RETAILER_NOT_FOUND',
          message: 'Retailer record not found or access denied for your Distributor account.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: retailer,
      timestamp: new Date().toISOString(),
    };
  }

  async createRetailerForDistributor(
    distributorId: string,
    input: CreateRetailerInput,
    createdByUserId: string = 'usr_dst_01'
  ): Promise<ApiResponse<Retailer>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.createUser({ role: 'RETAILER', fullName: input.name,
        displayName: input.businessName, email: input.email, mobile: input.mobile, parentPartyId: distributorId });
      if (response.data) await userService.assignUserPlan(response.data.id, input.planId);
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : undefined };
    }
    // 1. Resolve parent Distributor & Master Distributor from hierarchy
    const parentDst = hierarchyService.getDistributorById(distributorId);
    if (!parentDst || parentDst.status !== 'ACTIVE' || (parentDst.approvalStatus || 'APPROVED') !== 'APPROVED') {
      return {
        success: false,
        error: {
          code: 'INVALID_DISTRIBUTOR',
          message: 'Distributor account is not active or approved for retailer creation.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const masterDistributorId = parentDst.masterDistributorId;

    // 2. Validate Selected Retailer Plan
    const planRes = await retailerPlanService.getPlanById(input.planId);
    if (!planRes.success || !planRes.data || planRes.data.status !== 'ACTIVE') {
      return {
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'Selected Retailer Plan is inactive or invalid.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Retailer Code Uniqueness Check
    const cleanCode = (
      input.code || `RET${Date.now().toString().slice(-4)}`
    ).trim().toUpperCase();

    const existingCode = hierarchyService
      .getAllRetailers()
      .find((r) => r.code.toUpperCase() === cleanCode);

    if (existingCode) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_CODE',
          message: `Retailer code "${cleanCode}" is already in use. Please specify a unique code.`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Initial Creator Approval Rule State for DISTRIBUTOR creator
    const initialApprovalState = approvalService.getInitialApprovalState('RETAILER', 'DISTRIBUTOR');

    // 5. Build New Retailer Entity
    const newRetailer: Retailer = {
      id: `ret_${Date.now().toString(36)}`,
      code: cleanCode,
      masterDistributorId: masterDistributorId,
      distributorId: distributorId,
      userId: `usr_ret_${Date.now().toString(36)}`,
      planId: input.planId,
      name: input.name.trim(),
      businessName: input.businessName.trim(),
      email: input.email.trim().toLowerCase(),
      mobile: input.mobile.trim(),
      kycStatus: input.kycStatus || 'APPROVED',
      approvalStatus: initialApprovalState.approvalStatus,
      accountStatus: initialApprovalState.accountStatus,
      walletId: `wlt_ret_${Date.now().toString(36)}`,
      createdByUserId: createdByUserId,
      createdByRole: 'DISTRIBUTOR',
      createdByEntityId: distributorId,
      createdAt: new Date().toISOString(),
    };

    hierarchyService.addRetailerRecord(newRetailer);

    return {
      success: true,
      data: newRetailer,
      message: 'Retailer submitted successfully and is awaiting Admin approval.',
      timestamp: new Date().toISOString(),
    };
  }

  async updateRetailerForDistributor(
    distributorId: string,
    retailerId: string,
    updates: UpdateRetailerInput
  ): Promise<ApiResponse<Retailer>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.updateUser(retailerId, { fullName: updates.name,
        displayName: updates.businessName, email: updates.email, mobile: updates.mobile, status: updates.accountStatus });
      if (updates.planId) await userService.assignUserPlan(retailerId, updates.planId);
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : undefined };
    }
    const check = await this.getRetailerByIdForDistributor(distributorId, retailerId);
    if (!check.success || !check.data) {
      return {
        success: false,
        error: check.error || { code: 'NOT_FOUND', message: 'Retailer not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateRetailerRecord(retailerId, {
      name: updates.name ? updates.name.trim() : check.data.name,
      businessName: updates.businessName ? updates.businessName.trim() : check.data.businessName,
      email: updates.email ? updates.email.trim().toLowerCase() : check.data.email,
      mobile: updates.mobile ? updates.mobile.trim() : check.data.mobile,
      planId: updates.planId || check.data.planId,
      kycStatus: updates.kycStatus || check.data.kycStatus,
      accountStatus: updates.accountStatus || check.data.accountStatus,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to update retailer.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async toggleRetailerStatusForDistributor(
    distributorId: string,
    retailerId: string
  ): Promise<ApiResponse<Retailer>> {
    if (!APP_CONFIG.useMockData) {
      const current = await this.getRetailerByIdForDistributor(distributorId, retailerId);
      if (!current.success || !current.data) return current as ApiResponse<Retailer>;
      const next = current.data.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await userService.updateUserStatus(retailerId, next, 'Distributor retailer status change');
      return { ...response, data: response.data ? networkUserToRetailer(response.data) : undefined };
    }
    const check = await this.getRetailerByIdForDistributor(distributorId, retailerId);
    if (!check.success || !check.data) {
      return {
        success: false,
        error: check.error || { code: 'NOT_FOUND', message: 'Retailer not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    if (check.data.approvalStatus === 'PENDING_APPROVAL') {
      return {
        success: false,
        error: {
          code: 'ACTION_BLOCKED',
          message: 'Cannot toggle account status while retailer is awaiting Admin approval.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (check.data.approvalStatus === 'REJECTED') {
      return {
        success: false,
        error: {
          code: 'ACTION_BLOCKED',
          message: 'Cannot toggle account status for a rejected retailer.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const currentStatus = check.data.accountStatus;
    const newStatus: AccountStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    return this.updateRetailerForDistributor(distributorId, retailerId, {
      accountStatus: newStatus,
    });
  }

  async getRetailerSummaryForDistributor(
    distributorId: string
  ): Promise<ScopedRetailerSummary> {
    if (!APP_CONFIG.useMockData) {
      const response = await this.getRetailersForDistributor(distributorId);
      return summarizeRetailers(response.data || []);
    }
    const retailers = hierarchyService.getDistributorRetailers(distributorId);

    const totalRetailers = retailers.length;
    const activeRetailers = retailers.filter(
      (r) => r.approvalStatus === 'APPROVED' && r.accountStatus === 'ACTIVE'
    ).length;
    const pendingApprovalRetailers = retailers.filter(
      (r) => r.approvalStatus === 'PENDING_APPROVAL'
    ).length;
    const inactiveRetailers = retailers.filter(
      (r) => r.accountStatus !== 'ACTIVE' && r.approvalStatus !== 'PENDING_APPROVAL'
    ).length;

    return {
      totalRetailers,
      activeRetailers,
      pendingApprovalRetailers,
      inactiveRetailers,
    };
  }

  // Scoped Financial & Activity Summaries for Retailer Detail Drawer
  getRetailerWalletSummary(retailerId: string) {
    return {
      walletId: `wlt_${retailerId}`,
      balance: 24850.75,
      holdBalance: 1000.0,
      status: 'ACTIVE',
      lastUpdated: new Date().toISOString(),
    };
  }

  getRetailerTransactionSummary(retailerId: string) {
    return {
      todayTxnsCount: 48,
      todayPayInVolume: 124500,
      todayPayOutVolume: 65000,
      successfulCount: 45,
      failedCount: 3,
    };
  }

  getRetailerCommissionSummary(retailerId: string) {
    return {
      todayEarned: 845.5,
      monthlyEarned: 14200.0,
      pendingSettlement: 450.0,
    };
  }
}

export const retailerService = new RetailerService();
