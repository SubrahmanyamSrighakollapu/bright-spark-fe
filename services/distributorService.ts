import { Distributor, AccountStatus, KYCStatus, ApiResponse, ApprovalStatus, UserRole } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { APP_CONFIG } from '@/config';
import { userService } from './userService';
import { networkUserToDistributor } from './networkUserMapper';

export interface CreateDistributorInput {
  name: string;
  code: string;
  businessName: string;
  email: string;
  mobile: string;
  businessType?: string;
  registrationNumber?: string;
  gstNumber?: string;
  panNumberMasked?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  kycStatus?: KYCStatus;
  status?: AccountStatus;
}

export interface UpdateDistributorInput {
  name?: string;
  businessName?: string;
  email?: string;
  mobile?: string;
  businessType?: string;
  registrationNumber?: string;
  gstNumber?: string;
  panNumberMasked?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  kycStatus?: KYCStatus;
  status?: AccountStatus;
}

export interface ScopedDistributorSummary {
  totalDistributors: number;
  activeDistributors: number;
  pendingApprovalDistributors: number;
  inactiveDistributors: number;
  totalRetailers: number;
}

class DistributorService {
  async getDistributorsForMasterDistributor(
    masterDistributorId: string
  ): Promise<ApiResponse<Distributor[]>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUsers({ role: 'DISTRIBUTOR', pageSize: 100 });
      return { ...response, data: response.data?.items.map(networkUserToDistributor) || [] };
    }
    const distributors = hierarchyService.getMasterDistributorDistributors(masterDistributorId);
    return {
      success: true,
      data: distributors,
      timestamp: new Date().toISOString(),
    };
  }

  async getDistributorById(
    masterDistributorId: string,
    distributorId: string
  ): Promise<ApiResponse<Distributor | null>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.getUser(distributorId);
      return { ...response, data: response.data ? networkUserToDistributor(response.data) : null };
    }
    const distributor = hierarchyService.getDistributorById(distributorId);

    // Security check: Ensure distributor belongs to the authenticated Master Distributor
    if (!distributor || distributor.masterDistributorId !== masterDistributorId) {
      return {
        success: false,
        error: {
          code: 'DISTRIBUTOR_NOT_FOUND',
          message: 'Distributor record not found or access denied for your account.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: distributor,
      timestamp: new Date().toISOString(),
    };
  }

  async createDistributor(
    masterDistributorId: string,
    input: CreateDistributorInput,
    createdByUserId: string = 'usr_md_01',
    createdByRole: UserRole = 'MASTER_DISTRIBUTOR'
  ): Promise<ApiResponse<Distributor>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.createUser({ role: 'DISTRIBUTOR', fullName: input.name,
        displayName: input.businessName, email: input.email, mobile: input.mobile, parentPartyId: masterDistributorId });
      return { ...response, data: response.data ? networkUserToDistributor(response.data) : undefined };
    }
    // 1. Code Uniqueness Validation
    const cleanCode = input.code.trim().toUpperCase();
    const existing = hierarchyService
      .getAllDistributors()
      .find((d) => d.code.toUpperCase() === cleanCode);

    if (existing) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_CODE',
          message: `Distributor code "${cleanCode}" is already in use. Please specify a unique code.`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Creator Approval Rule Engine:
    // Admin created -> APPROVED & ACTIVE
    // MD created -> PENDING_APPROVAL & INACTIVE
    const isCreatedByAdmin = createdByRole === 'ADMIN' || createdByRole === 'SUPER_ADMIN';
    const initialApprovalStatus: ApprovalStatus = isCreatedByAdmin ? 'APPROVED' : 'PENDING_APPROVAL';
    const initialAccountStatus: AccountStatus = isCreatedByAdmin ? 'ACTIVE' : 'INACTIVE';

    // 3. Build Distributor Object
    const newDistributor: Distributor = {
      id: `dst_${Date.now().toString(36)}`,
      code: cleanCode,
      masterDistributorId: masterDistributorId,
      userId: `usr_${Date.now().toString(36)}`,
      name: input.name.trim(),
      businessName: input.businessName.trim(),
      email: input.email.trim().toLowerCase(),
      mobile: input.mobile.trim(),
      businessType: input.businessType || 'Private Limited',
      registrationNumber: input.registrationNumber,
      gstNumber: input.gstNumber,
      panNumberMasked: input.panNumberMasked,
      kycStatus: input.kycStatus || 'APPROVED',
      approvalStatus: initialApprovalStatus,
      status: initialAccountStatus,
      walletId: `wlt_dst_${Date.now().toString(36)}`,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      createdByUserId: createdByUserId,
      createdByRole: createdByRole,
      createdByEntityId: masterDistributorId,
      createdAt: new Date().toISOString(),
    };

    hierarchyService.addDistributorRecord(newDistributor);

    return {
      success: true,
      data: newDistributor,
      message: isCreatedByAdmin
        ? 'Distributor created successfully.'
        : 'Distributor submitted successfully and is awaiting Admin approval.',
      timestamp: new Date().toISOString(),
    };
  }

  async updateDistributor(
    masterDistributorId: string,
    distributorId: string,
    updates: UpdateDistributorInput
  ): Promise<ApiResponse<Distributor>> {
    if (!APP_CONFIG.useMockData) {
      const response = await userService.updateUser(distributorId, { fullName: updates.name,
        displayName: updates.businessName, email: updates.email, mobile: updates.mobile, status: updates.status });
      return { ...response, data: response.data ? networkUserToDistributor(response.data) : undefined };
    }
    const check = await this.getDistributorById(masterDistributorId, distributorId);
    if (!check.success || !check.data) {
      return {
        success: false,
        error: check.error || { code: 'NOT_FOUND', message: 'Distributor not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateDistributorRecord(distributorId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to update distributor.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async toggleDistributorStatus(
    masterDistributorId: string,
    distributorId: string
  ): Promise<ApiResponse<Distributor>> {
    if (!APP_CONFIG.useMockData) {
      const current = await this.getDistributorById(masterDistributorId, distributorId);
      if (!current.success || !current.data) return current as ApiResponse<Distributor>;
      const next = current.data.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await userService.updateUserStatus(distributorId, next, 'Master Distributor status change');
      return { ...response, data: response.data ? networkUserToDistributor(response.data) : undefined };
    }
    const check = await this.getDistributorById(masterDistributorId, distributorId);
    if (!check.success || !check.data) {
      return {
        success: false,
        error: check.error || { code: 'NOT_FOUND', message: 'Distributor not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    // Action restriction: Cannot toggle status if pending approval or rejected!
    if (check.data.approvalStatus === 'PENDING_APPROVAL') {
      return {
        success: false,
        error: {
          code: 'ACTION_BLOCKED',
          message: 'Cannot toggle account status while distributor is awaiting Admin approval.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (check.data.approvalStatus === 'REJECTED') {
      return {
        success: false,
        error: {
          code: 'ACTION_BLOCKED',
          message: 'Cannot toggle account status for a rejected distributor.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const currentStatus = check.data.status;
    const newStatus: AccountStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    return this.updateDistributor(masterDistributorId, distributorId, { status: newStatus });
  }

  async getDistributorSummary(masterDistributorId: string): Promise<ScopedDistributorSummary> {
    if (!APP_CONFIG.useMockData) {
      const [distributorResponse, retailerResponse] = await Promise.all([
        this.getDistributorsForMasterDistributor(masterDistributorId), userService.getUsers({ role: 'RETAILER', pageSize: 100 }),
      ]);
      const distributors = distributorResponse.data || [];
      return { totalDistributors: distributors.length,
        activeDistributors: distributors.filter((item) => item.status === 'ACTIVE' && item.approvalStatus === 'APPROVED').length,
        pendingApprovalDistributors: distributors.filter((item) => item.approvalStatus === 'PENDING_APPROVAL').length,
        inactiveDistributors: distributors.filter((item) => item.status !== 'ACTIVE' && item.approvalStatus !== 'PENDING_APPROVAL').length,
        totalRetailers: retailerResponse.data?.items.length || 0 };
    }
    const distributors = hierarchyService.getMasterDistributorDistributors(masterDistributorId);
    const retailers = hierarchyService.getMasterDistributorRetailers(masterDistributorId);

    const totalDistributors = distributors.length;
    const activeDistributors = distributors.filter(
      (d) => (d.approvalStatus || 'APPROVED') === 'APPROVED' && d.status === 'ACTIVE'
    ).length;
    const pendingApprovalDistributors = distributors.filter(
      (d) => d.approvalStatus === 'PENDING_APPROVAL'
    ).length;
    const inactiveDistributors = distributors.filter(
      (d) => d.status !== 'ACTIVE' && d.approvalStatus !== 'PENDING_APPROVAL'
    ).length;
    const totalRetailers = retailers.length;

    return {
      totalDistributors,
      activeDistributors,
      pendingApprovalDistributors,
      inactiveDistributors,
      totalRetailers,
    };
  }
}

export const distributorService = new DistributorService();
