import { UserRole } from '@/config/roles';
import { Distributor, Retailer, ApprovalStatus, AccountStatus, ApiResponse } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';

export interface PendingApprovalItem {
  id: string;
  entityType: 'DISTRIBUTOR' | 'RETAILER';
  code: string;
  name: string;
  businessName: string;
  email: string;
  mobile: string;
  kycStatus: string;
  approvalStatus: ApprovalStatus;
  accountStatus: AccountStatus;
  parentMasterDistributorName?: string;
  parentMasterDistributorCode?: string;
  parentDistributorName?: string;
  parentDistributorCode?: string;
  createdByUserId?: string;
  createdByRole?: UserRole;
  createdByEntityId?: string;
  createdAt: string;
  planId?: string;
  rawEntity: Distributor | Retailer;
}

export interface ApprovalSummary {
  totalPending: number;
  pendingDistributors: number;
  pendingRetailers: number;
  recentlyApproved: number;
  recentlyRejected: number;
}

class ApprovalService {
  requiresAdminApproval(
    entityType: 'DISTRIBUTOR' | 'RETAILER' | 'MASTER_DISTRIBUTOR',
    createdByRole: UserRole
  ): boolean {
    if (createdByRole === 'ADMIN' || createdByRole === 'SUPER_ADMIN') {
      return false;
    }
    if (entityType === 'MASTER_DISTRIBUTOR') {
      return false;
    }
    return true;
  }

  getInitialApprovalState(
    entityType: 'DISTRIBUTOR' | 'RETAILER' | 'MASTER_DISTRIBUTOR',
    createdByRole: UserRole
  ): { approvalStatus: ApprovalStatus; accountStatus: AccountStatus } {
    if (this.requiresAdminApproval(entityType, createdByRole)) {
      return { approvalStatus: 'PENDING_APPROVAL', accountStatus: 'INACTIVE' };
    }
    return { approvalStatus: 'APPROVED', accountStatus: 'ACTIVE' };
  }

  getPendingApprovalsSummary(): ApprovalSummary {
    const distributors = hierarchyService.getAllDistributors();
    const retailers = hierarchyService.getAllRetailers();

    const pendingDistributors = distributors.filter(
      (d) => d.approvalStatus === 'PENDING_APPROVAL'
    ).length;

    const pendingRetailers = retailers.filter(
      (r) => r.approvalStatus === 'PENDING_APPROVAL'
    ).length;

    const recentlyApprovedDistributors = distributors.filter(
      (d) => d.approvalStatus === 'APPROVED' && d.approvedAt
    ).length;

    const recentlyApprovedRetailers = retailers.filter(
      (r) => r.approvalStatus === 'APPROVED' && r.approvedAt
    ).length;

    const recentlyRejectedDistributors = distributors.filter(
      (d) => d.approvalStatus === 'REJECTED'
    ).length;

    const recentlyRejectedRetailers = retailers.filter(
      (r) => r.approvalStatus === 'REJECTED'
    ).length;

    return {
      totalPending: pendingDistributors + pendingRetailers,
      pendingDistributors,
      pendingRetailers,
      recentlyApproved: recentlyApprovedDistributors + recentlyApprovedRetailers,
      recentlyRejected: recentlyRejectedDistributors + recentlyRejectedRetailers,
    };
  }

  getApprovalItems(
    statusTab: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED' = 'ALL',
    typeFilter: 'ALL' | 'DISTRIBUTOR' | 'RETAILER' = 'ALL'
  ): PendingApprovalItem[] {
    const items: PendingApprovalItem[] = [];

    // Process Distributors
    if (typeFilter === 'ALL' || typeFilter === 'DISTRIBUTOR') {
      const distributors = hierarchyService.getAllDistributors();
      distributors.forEach((d) => {
        const approvalStat = d.approvalStatus || 'APPROVED';
        const kycStat = d.kycStatus || 'APPROVED';
        const accountStat = d.status || 'ACTIVE';

        let matchesStatus = false;
        if (statusTab === 'ALL') {
          matchesStatus = true;
        } else if (statusTab === 'PENDING') {
          matchesStatus = approvalStat === 'PENDING_APPROVAL' || kycStat === 'PROCESSING' || kycStat === 'PENDING' || kycStat === 'UNDER_REVIEW';
        } else if (statusTab === 'APPROVED') {
          matchesStatus = approvalStat === 'APPROVED' && kycStat === 'APPROVED' && accountStat !== 'SUSPENDED';
        } else if (statusTab === 'REJECTED') {
          matchesStatus = approvalStat === 'REJECTED' || kycStat === 'REJECTED';
        } else if (statusTab === 'BLOCKED') {
          matchesStatus = kycStat === 'BLOCKED' || accountStat === 'SUSPENDED';
        }

        if (matchesStatus) {
          const parentMD = hierarchyService.getMasterDistributorById(d.masterDistributorId);
          items.push({
            id: d.id,
            entityType: 'DISTRIBUTOR',
            code: d.code,
            name: d.name,
            businessName: d.businessName,
            email: d.email,
            mobile: d.mobile,
            kycStatus: kycStat,
            approvalStatus: approvalStat,
            accountStatus: accountStat,
            parentMasterDistributorName: parentMD?.name || 'Apex National Network',
            parentMasterDistributorCode: parentMD?.code || 'MD001',
            createdByUserId: d.createdByUserId || 'usr_md_01',
            createdByRole: d.createdByRole || 'MASTER_DISTRIBUTOR',
            createdByEntityId: d.createdByEntityId || d.masterDistributorId,
            createdAt: d.createdAt,
            rawEntity: d,
          });
        }
      });
    }

    // Process Retailers
    if (typeFilter === 'ALL' || typeFilter === 'RETAILER') {
      const retailers = hierarchyService.getAllRetailers();
      retailers.forEach((r) => {
        const approvalStat = r.approvalStatus || 'APPROVED';
        const kycStat = r.kycStatus || 'APPROVED';
        const accountStat = r.accountStatus || 'ACTIVE';

        let matchesStatus = false;
        if (statusTab === 'ALL') {
          matchesStatus = true;
        } else if (statusTab === 'PENDING') {
          matchesStatus = approvalStat === 'PENDING_APPROVAL' || kycStat === 'PROCESSING' || kycStat === 'PENDING' || kycStat === 'UNDER_REVIEW';
        } else if (statusTab === 'APPROVED') {
          matchesStatus = approvalStat === 'APPROVED' && kycStat === 'APPROVED' && accountStat !== 'SUSPENDED';
        } else if (statusTab === 'REJECTED') {
          matchesStatus = approvalStat === 'REJECTED' || kycStat === 'REJECTED';
        } else if (statusTab === 'BLOCKED') {
          matchesStatus = kycStat === 'BLOCKED' || accountStat === 'SUSPENDED';
        }

        if (matchesStatus) {
          const parentMD = hierarchyService.getMasterDistributorById(r.masterDistributorId);
          const parentDst = hierarchyService.getDistributorById(r.distributorId);
          items.push({
            id: r.id,
            entityType: 'RETAILER',
            code: r.code,
            name: r.name,
            businessName: r.businessName,
            email: r.email,
            mobile: r.mobile,
            kycStatus: kycStat,
            approvalStatus: approvalStat,
            accountStatus: accountStat,
            parentMasterDistributorName: parentMD?.name || 'Apex National Network',
            parentMasterDistributorCode: parentMD?.code || 'MD001',
            parentDistributorName: parentDst?.name || 'North Zone Distributor',
            parentDistributorCode: parentDst?.code || 'DST001',
            createdByUserId: r.createdByUserId,
            createdByRole: r.createdByRole,
            createdByEntityId: r.createdByEntityId,
            createdAt: r.createdAt,
            planId: r.planId,
            rawEntity: r,
          });
        }
      });
    }

    // Sort by created date descending
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async approveDistributor(
    distributorId: string,
    adminUserId: string = 'usr_admin_01'
  ): Promise<ApiResponse<Distributor>> {
    const distributor = hierarchyService.getDistributorById(distributorId);
    if (!distributor) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Distributor record not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateDistributorRecord(distributorId, {
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      approvedByUserId: adminUserId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to approve distributor.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async rejectDistributor(
    distributorId: string,
    rejectionReason: string,
    adminUserId: string = 'usr_admin_01'
  ): Promise<ApiResponse<Distributor>> {
    const distributor = hierarchyService.getDistributorById(distributorId);
    if (!distributor) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Distributor record not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateDistributorRecord(distributorId, {
      approvalStatus: 'REJECTED',
      status: 'INACTIVE',
      rejectedByUserId: adminUserId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionReason.trim(),
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to reject distributor.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async approveRetailer(
    retailerId: string,
    adminUserId: string = 'usr_admin_01'
  ): Promise<ApiResponse<Retailer>> {
    const retailer = hierarchyService.getRetailerById(retailerId);
    if (!retailer) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Retailer record not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateRetailerRecord(retailerId, {
      approvalStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      approvedByUserId: adminUserId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to approve retailer.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async rejectRetailer(
    retailerId: string,
    rejectionReason: string,
    adminUserId: string = 'usr_admin_01'
  ): Promise<ApiResponse<Retailer>> {
    const retailer = hierarchyService.getRetailerById(retailerId);
    if (!retailer) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Retailer record not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = hierarchyService.updateRetailerRecord(retailerId, {
      approvalStatus: 'REJECTED',
      accountStatus: 'INACTIVE',
      rejectedByUserId: adminUserId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionReason.trim(),
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to reject retailer.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }
  async blockEntity(
    entityId: string,
    entityType: 'DISTRIBUTOR' | 'RETAILER',
    reason: string = 'Security Compliance Hold',
    adminUserId: string = 'usr_admin_01'
  ): Promise<ApiResponse<any>> {
    if (entityType === 'DISTRIBUTOR') {
      const updated = hierarchyService.updateDistributorRecord(entityId, {
        kycStatus: 'BLOCKED',
        status: 'SUSPENDED',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      });
      return { success: !!updated, data: updated, timestamp: new Date().toISOString() };
    } else {
      const updated = hierarchyService.updateRetailerRecord(entityId, {
        kycStatus: 'BLOCKED',
        accountStatus: 'SUSPENDED',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      });
      return { success: !!updated, data: updated, timestamp: new Date().toISOString() };
    }
  }

  async unblockEntity(
    entityId: string,
    entityType: 'DISTRIBUTOR' | 'RETAILER',
    adminUserId: string = 'usr_admin_01'
  ): Promise<ApiResponse<any>> {
    if (entityType === 'DISTRIBUTOR') {
      const updated = hierarchyService.updateDistributorRecord(entityId, {
        kycStatus: 'APPROVED',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        updatedAt: new Date().toISOString(),
      });
      return { success: !!updated, data: updated, timestamp: new Date().toISOString() };
    } else {
      const updated = hierarchyService.updateRetailerRecord(entityId, {
        kycStatus: 'APPROVED',
        accountStatus: 'ACTIVE',
        approvalStatus: 'APPROVED',
        updatedAt: new Date().toISOString(),
      });
      return { success: !!updated, data: updated, timestamp: new Date().toISOString() };
    }
  }
}

export const approvalService = new ApprovalService();
