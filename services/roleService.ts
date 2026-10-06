import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/common';
import { APP_CONFIG } from '@/config';

export interface BackendRole {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: 'SYSTEM' | 'NETWORK' | 'EMPLOYEE';
  isSystem: boolean;
  isActive: boolean;
  assignedUserCount: number;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendPermission {
  code: string;
  module: string;
  action: string;
  description: string | null;
}

export interface CreateRoleInput {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionCodes?: string[];
  reason?: string;
}

export const roleService = {
  /**
   * Fetch all system, network, and employee roles.
   */
  async getRoles(category?: string): Promise<ApiResponse<BackendRole[]>> {
    try {
      if (!APP_CONFIG.useMockData) {
        const response = await apiClient.get<ApiResponse<BackendRole[]>>('/roles', {
          params: category ? { category } : undefined,
        });
        if (response && response.data) return response;
      }
    } catch (err) {
      console.warn('Backend /roles API unavailable, serving fallback roles:', err);
    }

    // Fallback UI data
    return {
      success: true,
      data: [
        {
          id: 1,
          code: 'ADMIN',
          name: 'Super Admin',
          description: 'Full platform administrative control',
          category: 'SYSTEM',
          isSystem: true,
          isActive: true,
          assignedUserCount: 1,
          permissions: ['PARTY_READ', 'PARTY_CREATE', 'USER_READ', 'USER_WRITE', 'KYC_READ', 'REPORT_READ', 'ROLE_READ', 'EMPLOYEE_READ'],
        },
        {
          id: 2,
          code: 'MASTER_DISTRIBUTOR',
          name: 'Master Distributor',
          description: 'Network top-level distributor entity',
          category: 'NETWORK',
          isSystem: true,
          isActive: true,
          assignedUserCount: 1,
          permissions: ['PARTY_READ', 'PARTY_CREATE', 'USER_READ', 'USER_WRITE', 'KYC_READ', 'REPORT_READ'],
        },
        {
          id: 3,
          code: 'DISTRIBUTOR',
          name: 'Distributor',
          description: 'Mid-tier network distributor',
          category: 'NETWORK',
          isSystem: true,
          isActive: true,
          assignedUserCount: 1,
          permissions: ['PARTY_READ', 'PARTY_CREATE', 'USER_READ', 'USER_WRITE', 'KYC_READ', 'REPORT_READ'],
        },
        {
          id: 4,
          code: 'RETAILER',
          name: 'Retailer',
          description: 'Agent merchant point of sale',
          category: 'NETWORK',
          isSystem: true,
          isActive: true,
          assignedUserCount: 1,
          permissions: ['PARTY_READ', 'USER_READ', 'REPORT_READ'],
        },
        {
          id: 5,
          code: 'EMPLOYEE',
          name: 'Employee Staff',
          description: 'Internal staff role encompassing Operations, Accounts, KYC, and Sales departments',
          category: 'EMPLOYEE',
          isSystem: false,
          isActive: true,
          assignedUserCount: 4,
          permissions: ['EMPLOYEE_READ', 'EMPLOYEE_CREATE', 'KYC_READ', 'KYC_REVIEW', 'PARTY_READ', 'REPORT_READ'],
        },
      ],
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Fetch system permission catalog grouped by module.
   */
  async getPermissions(): Promise<ApiResponse<BackendPermission[]>> {
    try {
      if (!APP_CONFIG.useMockData) {
        const response = await apiClient.get<ApiResponse<BackendPermission[]>>('/roles/permissions');
        if (response && response.data) return response;
      }
    } catch (err) {
      console.warn('Backend /roles/permissions API unavailable, serving fallback permissions:', err);
    }

    return {
      success: true,
      data: [
        { code: 'PARTY_READ', module: 'PARTY', action: 'READ', description: 'Read network parties' },
        { code: 'PARTY_CREATE', module: 'PARTY', action: 'CREATE', description: 'Create network parties' },
        { code: 'PARTY_STATUS_UPDATE', module: 'PARTY', action: 'STATUS_UPDATE', description: 'Update party status' },
        { code: 'USER_READ', module: 'USER', action: 'READ', description: 'Read user accounts' },
        { code: 'USER_WRITE', module: 'USER', action: 'WRITE', description: 'Write user details' },
        { code: 'KYC_READ', module: 'KYC', action: 'READ', description: 'Read KYC documents' },
        { code: 'KYC_REVIEW', module: 'KYC', action: 'REVIEW', description: 'Review & approve KYC' },
        { code: 'EMPLOYEE_READ', module: 'EMPLOYEE', action: 'READ', description: 'Read staff profiles' },
        { code: 'EMPLOYEE_CREATE', module: 'EMPLOYEE', action: 'CREATE', description: 'Onboard staff members' },
        { code: 'ROLE_READ', module: 'ROLE', action: 'READ', description: 'View role definitions' },
        { code: 'ROLE_CREATE', module: 'ROLE', action: 'CREATE', description: 'Create custom roles' },
        { code: 'ROLE_UPDATE', module: 'ROLE', action: 'UPDATE', description: 'Update role permissions' },
        { code: 'REPORT_READ', module: 'REPORT', action: 'READ', description: 'View audit reports' },
      ],
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Create a new custom role or employee sub-role under EMPLOYEE category.
   */
  async createRole(input: CreateRoleInput): Promise<ApiResponse<BackendRole>> {
    return apiClient.post<ApiResponse<BackendRole>>('/roles', input);
  },

  /**
   * Update an existing role definition and permission set.
   */
  async updateRole(id: number, input: UpdateRoleInput): Promise<ApiResponse<BackendRole>> {
    return apiClient.patch<ApiResponse<BackendRole>>(`/roles/${id}`, input);
  },
};
