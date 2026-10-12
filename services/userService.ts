import {
  BusinessEntity,
  EntityMapping,
  UserFilters,
  PaginationState,
  EntityType,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockEntities, mockEntityMappings } from '@/mocks/mockUsers';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';
import { hierarchyService } from './hierarchyService';

const inMemoryEntities: BusinessEntity[] = [...mockEntities];
const inMemoryMappings: EntityMapping[] = [...mockEntityMappings];

export interface NetworkUserItem {
  id: string;
  userId: string;
  partyId: string;
  code: string;
  fullName: string;
  name: string;
  email: string;
  mobile: string;
  contactNo: string;
  displayName: string;
  businessName: string;
  legalName?: string | null;
  role: string;
  roleName: 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER' | string;
  parentId?: string | null;
  parentName?: string | null;
  parentCode?: string | null;
  parentType?: string | null;
  masterDistributorId?: string | null;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE' | 'DISABLED' | 'BLOCKED' | string;
  accountStatus: string;
  approvalStatus: string;
  kycStatus: string;
  isAadharVerify: boolean;
  panNoVerify: boolean;
  walletId?: string | null;
  availableBalance: number;
  holdBalance: number;
  ledgerBalance: number;
  version: number;
  createdAt: string;
  createdByUserId?: string | null;
  createdByRole?: string | null;
  createdBy?: string;
  planId?: string | null;
}

export interface NetworkUserListResult {
  items: NetworkUserItem[];
  pagination: PaginationState;
}

export type AuthorityType = 'PLATFORM' | 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR';

export interface EligibleAuthorityItem {
  partyId: string;
  authorityType: AuthorityType;
  code: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  parentPartyId?: string | null;
  isCurrent: boolean;
}

export interface EligibleAuthoritiesResult {
  user: { id: string; partyId: string; role: string; parentId?: string | null; name: string };
  allowedAuthorityTypes: AuthorityType[];
  items: EligibleAuthorityItem[];
}

export interface CreateUserInput {
  role: 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
  fullName: string;
  email: string;
  mobile: string;
  displayName: string;
  legalName?: string;
  parentPartyId?: string;
  password?: string;
}

export interface WalletTransactionResult {
  user: NetworkUserItem;
  transaction: {
    transId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    remarks: string;
    status: 'SUCCESS' | 'FAILED';
    wallet: {
      availableBalance: number;
      ledgerBalance: number;
      holdBalance: number;
    };
  };
}

export interface WalletHoldResult {
  user: NetworkUserItem;
  holdRecord: {
    action: 'HOLD' | 'RELEASE';
    amount: number;
    remarks: string;
    status: 'ACTIVE_HOLD' | 'RELEASED';
    wallet: {
      availableBalance: number;
      ledgerBalance: number;
      holdBalance: number;
    };
  };
}

export interface EntityListResult {
  items: BusinessEntity[];
  pagination: PaginationState;
}

export interface MappingListResult {
  items: EntityMapping[];
  pagination: PaginationState;
}

export const userService = {
  /**
   * Fetch paginated list of network members (MD, Distributor, Retailer).
   */
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    status?: string;
    search?: string;
    parentPartyId?: string;
  }): Promise<ApiResponse<NetworkUserListResult>> {
    try {
      if (!APP_CONFIG.useMockData) {
        const response = await apiClient.get<ApiResponse<NetworkUserListResult>>('/users', {
          params,
        });
        if (response && response.data) return response;
      }
    } catch (err) {
      if (!APP_CONFIG.useMockData) throw err;
      console.warn('Backend /users API unavailable, serving fallback user list:', err);
    }

    // Fallback Mock Response
    return {
      success: true,
      data: {
        items: [
          {
            id: 'usr_1',
            userId: 'MD901',
            partyId: 'pty_md901',
            code: 'MD901',
            fullName: 'Ramesh Kumar Hub',
            name: 'Ramesh Kumar Hub',
            email: 'ramesh.md@qinstarpay.com',
            mobile: '9876543210',
            contactNo: '9876543210',
            displayName: 'Ramesh Hub & Services',
            businessName: 'Ramesh Hub & Services',
            role: 'MASTER_DISTRIBUTOR',
            roleName: 'MASTER_DISTRIBUTOR',
            status: 'ACTIVE',
            accountStatus: 'ACTIVE',
            approvalStatus: 'APPROVED',
            kycStatus: 'APPROVED',
            isAadharVerify: true,
            panNoVerify: true,
            availableBalance: 125000.0,
            holdBalance: 0,
            ledgerBalance: 125000.0,
            version: 1,
            createdAt: '2026-09-01T10:30:00Z',
          },
          {
            id: 'usr_2',
            userId: 'DST402',
            partyId: 'pty_dst402',
            code: 'DST402',
            fullName: 'Apex Distro Agency',
            name: 'Apex Distro Agency',
            email: 'apex.dist@qinstarpay.com',
            mobile: '9812345678',
            contactNo: '9812345678',
            displayName: 'Apex Distro Agency',
            businessName: 'Apex Distro Agency',
            role: 'DISTRIBUTOR',
            roleName: 'DISTRIBUTOR',
            parentId: 'usr_1',
            parentName: 'Ramesh Kumar Hub',
            status: 'ACTIVE',
            accountStatus: 'ACTIVE',
            approvalStatus: 'APPROVED',
            kycStatus: 'APPROVED',
            isAadharVerify: true,
            panNoVerify: true,
            availableBalance: 48000.0,
            holdBalance: 12500.0,
            ledgerBalance: 60500.0,
            version: 1,
            createdAt: '2026-09-05T14:15:00Z',
          },
          {
            id: 'usr_3',
            userId: 'RET2045',
            partyId: 'pty_ret2045',
            code: 'RET2045',
            fullName: 'Zenith Retail Mart',
            name: 'Zenith Retail Mart',
            email: 'zenith.retail@gmail.com',
            mobile: '9988776655',
            contactNo: '9988776655',
            displayName: 'Zenith Retail Mart',
            businessName: 'Zenith Retail Mart',
            role: 'RETAILER',
            roleName: 'RETAILER',
            parentId: 'usr_2',
            parentName: 'Apex Distro Agency',
            status: 'PENDING',
            accountStatus: 'PENDING',
            approvalStatus: 'PENDING_APPROVAL',
            kycStatus: 'UNDER_REVIEW',
            isAadharVerify: true,
            panNoVerify: false,
            availableBalance: 14000.0,
            holdBalance: 5000.0,
            ledgerBalance: 19000.0,
            version: 1,
            createdAt: '2026-09-12T09:45:00Z',
          },
          {
            id: 'usr_4',
            userId: 'RET2046',
            partyId: 'pty_ret2046',
            code: 'RET2046',
            fullName: 'Swift Commerce Point',
            name: 'Swift Commerce Point',
            email: 'swift.store@gmail.com',
            mobile: '9765432109',
            contactNo: '9765432109',
            displayName: 'Swift Commerce Point',
            businessName: 'Swift Commerce Point',
            role: 'RETAILER',
            roleName: 'RETAILER',
            parentId: 'usr_2',
            parentName: 'Apex Distro Agency',
            status: 'SUSPENDED',
            accountStatus: 'SUSPENDED',
            approvalStatus: 'APPROVED',
            kycStatus: 'APPROVED',
            isAadharVerify: false,
            panNoVerify: false,
            availableBalance: 8500.0,
            holdBalance: 0,
            ledgerBalance: 8500.0,
            version: 1,
            createdAt: '2026-09-15T16:20:00Z',
          },
        ],
        pagination: { page: params?.page || 1, pageSize: params?.pageSize || 10, totalItems: 4, totalPages: 1 },
      },
      timestamp: new Date().toISOString(),
    };
  },

  async createUser(input: CreateUserInput): Promise<ApiResponse<NetworkUserItem>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const newId = `usr_${Date.now()}`;
      const newUser: NetworkUserItem = {
        id: newId,
        userId: `${input.role.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`,
        partyId: `pty_${newId}`,
        code: `${input.role.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: input.fullName,
        name: input.fullName,
        email: input.email,
        mobile: input.mobile,
        contactNo: input.mobile,
        displayName: input.displayName || input.fullName,
        businessName: input.displayName || input.fullName,
        role: input.role,
        roleName: input.role,
        status: 'ACTIVE',
        accountStatus: 'ACTIVE',
        approvalStatus: 'APPROVED',
        kycStatus: 'APPROVED',
        isAadharVerify: true,
        panNoVerify: true,
        availableBalance: 0,
        holdBalance: 0,
        ledgerBalance: 0,
        version: 1,
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: newUser, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<NetworkUserItem>>('/users', input);
  },

  async getUser(id: string): Promise<ApiResponse<NetworkUserItem>> {
    return apiClient.get<ApiResponse<NetworkUserItem>>(`/users/${id}`);
  },

  async assignUserPlan(userId: string, planId: string): Promise<void> {
    if (APP_CONFIG.useMockData || !planId) return;
    await apiClient.post('/plans/user-plan-mapping', { userId, planId });
  },

  /**
   * Edit user details (Full Name, Email, Mobile, Display Name).
   */
  async updateUser(
    id: string,
    data: { fullName?: string; email?: string; mobile?: string; displayName?: string; legalName?: string; status?: string }
  ): Promise<ApiResponse<NetworkUserItem>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      return { success: true, timestamp: new Date().toISOString() };
    }
    return apiClient.put<ApiResponse<NetworkUserItem>>(`/users/${id}`, data);
  },

  async getEligibleAuthorities(
    id: string,
    authorityType?: AuthorityType,
    search?: string,
  ): Promise<ApiResponse<EligibleAuthoritiesResult>> {
    return apiClient.get<ApiResponse<EligibleAuthoritiesResult>>(`/users/${id}/eligible-authorities`, {
      params: { authorityType, search }, cache: 'no-store',
    });
  },

  async transferUserAuthority(
    id: string,
    targetParentPartyId: string,
    reason: string,
  ): Promise<ApiResponse<NetworkUserItem>> {
    return apiClient.patch<ApiResponse<NetworkUserItem>>(`/users/${id}/authority`, { targetParentPartyId, reason });
  },

  /**
   * Update account status (Activate / Suspend / Pending).
   */
  async updateUserStatus(
    id: string,
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE' | 'DISABLED' | 'BLOCKED',
    reason?: string
  ): Promise<ApiResponse<NetworkUserItem>> {
    return apiClient.patch<ApiResponse<NetworkUserItem>>(`/users/${id}/status`, { status, reason });
  },

  /**
   * Add wallet balance (Credit).
   */
  async creditWallet(
    id: string,
    amount: number,
    remarks?: string,
    referenceNumber?: string
  ): Promise<ApiResponse<WalletTransactionResult>> {
    return apiClient.post<ApiResponse<WalletTransactionResult>>(`/users/${id}/wallet/credit`, {
      amount,
      remarks,
      referenceNumber,
    });
  },

  /**
   * Deduct wallet balance (Debit).
   */
  async debitWallet(
    id: string,
    amount: number,
    remarks?: string,
    referenceNumber?: string
  ): Promise<ApiResponse<WalletTransactionResult>> {
    return apiClient.post<ApiResponse<WalletTransactionResult>>(`/users/${id}/wallet/debit`, {
      amount,
      remarks,
      referenceNumber,
    });
  },

  /**
   * Hold or release funds.
   */
  async holdWalletFunds(
    id: string,
    amount: number,
    action: 'HOLD' | 'RELEASE',
    remarks?: string
  ): Promise<ApiResponse<WalletHoldResult>> {
    return apiClient.post<ApiResponse<WalletHoldResult>>(`/users/${id}/wallet/hold`, {
      amount,
      action,
      remarks,
    });
  },

  /**
   * Fetch entities by type with filtering and pagination.
   */
  async getEntities(
    type: EntityType,
    filters?: UserFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<EntityListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = inMemoryEntities.filter((e) => e.type === type);

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((e) => e.status === filters.status);
      }

      if (filters?.kycStatus && filters.kycStatus !== 'ALL') {
        filtered = filtered.filter((e) => e.kycStatus === filters.kycStatus);
      }

      if (filters?.role && filters.role !== 'ALL') {
        filtered = filtered.filter((e) => e.role === filters.role);
      }

      if (filters?.distributorId && filters.distributorId !== 'ALL') {
        filtered = filtered.filter(
          (e) => e.parentId === filters.distributorId || e.parentName === filters.distributorId
        );
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.code.toLowerCase().includes(q) ||
            e.name.toLowerCase().includes(q) ||
            e.businessName.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.mobile.includes(q)
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<ApiResponse<EntityListResult>>('/users', {
      params: { type, ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async getDistributors(filters?: UserFilters, page = 1, pageSize = 10) {
    return this.getEntities('DISTRIBUTOR', filters, page, pageSize);
  },

  async getRetailers(filters?: UserFilters, page = 1, pageSize = 10) {
    return this.getEntities('RETAILER', filters, page, pageSize);
  },

  async getMerchants(filters?: UserFilters, page = 1, pageSize = 10) {
    return this.getEntities('MERCHANT', filters, page, pageSize);
  },

  async getBackOfficeUsers(filters?: UserFilters, page = 1, pageSize = 10) {
    return this.getEntities('BACK_OFFICE', filters, page, pageSize);
  },

  async getUserById(id: string): Promise<ApiResponse<BusinessEntity | null>> {
    try {
      if (!APP_CONFIG.useMockData) {
        return await apiClient.get<ApiResponse<BusinessEntity>>(`/users/${id}`);
      }
    } catch {
      // Fallback to local memory lookup
    }

    await new Promise((res) => setTimeout(res, 100));
    const cleanId = (id || '').trim().toLowerCase();

    // 1. Check inMemoryEntities by id or code
    let entity = inMemoryEntities.find(
      (e) => e.id.toLowerCase() === cleanId || e.code.toLowerCase() === cleanId
    );

    // 2. Check hierarchyService records
    if (!entity) {
      const retailer = hierarchyService.getRetailerById(id) || hierarchyService.getAllRetailers().find((r: any) => r.id.toLowerCase() === cleanId || r.code.toLowerCase() === cleanId);
      if (retailer) {
        entity = {
          id: retailer.id,
          code: retailer.code,
          name: retailer.name,
          type: 'RETAILER',
          businessName: retailer.businessName || retailer.name,
          businessType: 'Sole Proprietorship',
          email: retailer.email,
          mobile: retailer.mobile,
          status: retailer.accountStatus || 'ACTIVE',
          kycStatus: retailer.kycStatus || 'APPROVED',
          parentId: retailer.distributorId,
          parentName: retailer.distributorName || 'North Zone Distributor',
          parentType: 'DISTRIBUTOR',
          createdAt: retailer.createdAt || new Date().toISOString(),
        } as unknown as BusinessEntity;
      } else {
        const dst = hierarchyService.getDistributorById(id) || hierarchyService.getAllDistributors().find((d: any) => d.id.toLowerCase() === cleanId || d.code.toLowerCase() === cleanId);
        if (dst) {
          entity = {
            id: dst.id,
            code: dst.code,
            name: dst.name,
            type: 'DISTRIBUTOR',
            businessName: dst.businessName || dst.name,
            businessType: 'Private Limited',
            email: dst.email,
            mobile: dst.mobile,
            status: dst.status || 'ACTIVE',
            kycStatus: 'APPROVED',
            parentId: dst.masterDistributorId,
            parentName: (dst as any).masterDistributorName || 'Apex National Network',
            parentType: 'DISTRIBUTOR',
            createdAt: dst.createdAt || new Date().toISOString(),
          } as unknown as BusinessEntity;
        }
      }
    }

    // 3. Fallback to default entity of appropriate type (matching role)
    if (!entity) {
      if (cleanId.includes('ret') || cleanId.includes('retailer')) {
        const defaultRet = inMemoryEntities.find((e) => e.type === 'RETAILER');
        if (defaultRet) entity = defaultRet;
      } else if (cleanId.includes('dst') || cleanId.includes('distributor')) {
        const defaultDst = inMemoryEntities.find((e) => e.type === 'DISTRIBUTOR');
        if (defaultDst) entity = defaultDst;
      }
    }

    return {
      success: !!entity,
      data: entity || null,
      timestamp: new Date().toISOString(),
    };
  },

  async blockUser(id: string, reason?: string): Promise<ApiResponse<BusinessEntity>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const entity = inMemoryEntities.find((e) => e.id === id || e.code === id);
      if (entity) {
        entity.status = 'BLOCKED';
        entity.blockedAt = new Date().toISOString();
        entity.blockedBy = 'Super Admin';
        entity.blockedReason = reason || 'Admin security lock';
        return {
          success: true,
          data: { ...entity },
          timestamp: new Date().toISOString(),
        };
      }
      return { success: false, data: null as unknown as BusinessEntity, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<BusinessEntity>>(`/users/${id}/block`, { reason });
  },

  async unblockUser(id: string): Promise<ApiResponse<BusinessEntity>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const entity = inMemoryEntities.find((e) => e.id === id || e.code === id);
      if (entity) {
        entity.status = 'ACTIVE';
        entity.blockedAt = undefined;
        entity.blockedBy = undefined;
        entity.blockedReason = undefined;
        return {
          success: true,
          data: { ...entity },
          timestamp: new Date().toISOString(),
        };
      }
      return { success: false, data: null as unknown as BusinessEntity, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<BusinessEntity>>(`/users/${id}/unblock`);
  },

  async requestPasswordReset(
    id: string,
    mode: 'LINK' | 'TEMP_PASSWORD'
  ): Promise<ApiResponse<{ message: string; tempPassword?: string }>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      if (mode === 'TEMP_PASSWORD') {
        const tempPassword = `QinStar@${Math.floor(100000 + Math.random() * 900000)}`;
        return {
          success: true,
          data: {
            message: 'Temporary password generated successfully.',
            tempPassword,
          },
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        data: { message: 'Password reset link sent to user email & SMS.' },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<ApiResponse<{ message: string }>>(`/users/${id}/reset-password`, { mode });
  },

  async getMappings(): Promise<ApiResponse<MappingListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      return {
        success: true,
        data: {
          items: inMemoryMappings,
          pagination: { page: 1, pageSize: 10, totalItems: inMemoryMappings.length, totalPages: 1 },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<MappingListResult>>('/users/mappings');
  },

  async updateMapping(
    mappingId: string,
    newParentId: string,
    newParentName: string
  ): Promise<ApiResponse<EntityMapping>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const mapItem = inMemoryMappings.find((m) => m.id === mappingId);
      if (mapItem) {
        mapItem.mappedParentId = newParentId;
        mapItem.mappedParentName = newParentName;
        mapItem.effectiveDate = new Date().toISOString().split('T')[0];

        const entity = inMemoryEntities.find((e) => e.id === mapItem.entityId);
        if (entity) {
          entity.parentId = newParentId;
          entity.parentName = newParentName;
        }

        return { success: true, data: { ...mapItem }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as EntityMapping, timestamp: new Date().toISOString() };
    }
    return apiClient.put<ApiResponse<EntityMapping>>(`/users/mappings/${mappingId}`, { newParentId });
  },
};
