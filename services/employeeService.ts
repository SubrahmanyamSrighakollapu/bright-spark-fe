import { ApiResponse } from '@/types/common';
import { PaginationState } from '@/types/domain';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

export interface EmployeeMetaDepartment {
  code: string;
  label: string;
  description: string | null;
}

export interface EmployeeMetaRole {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface EmployeeMetaResponse {
  departments: EmployeeMetaDepartment[];
  roles: EmployeeMetaRole[];
}

export interface BackendEmployeeItem {
  id: string;
  userId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  mobile: string | null;
  accountStatus: string;
  departmentCode: string;
  designation: string | null;
  managerUserId: string | null;
  joiningDate: string | null;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
  role: {
    id: number;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListFilters {
  search?: string;
  departmentCode?: string;
  roleId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface EmployeeListResult {
  items: BackendEmployeeItem[];
  pagination: PaginationState;
}

export interface CreateEmployeeInput {
  employeeCode: string;
  fullName: string;
  email: string;
  mobile?: string;
  password?: string;
  departmentCode: string;
  roleId: number;
  designation?: string;
  joiningDate?: string;
}

// Default departments list fallback in case backend meta is offline
export const DEFAULT_DEPARTMENTS: EmployeeMetaDepartment[] = [
  { code: 'OPERATIONS', label: 'Operations', description: 'Operations & Support Department' },
  { code: 'ACCOUNTS', label: 'Accounts', description: 'Finance & Accounts Department' },
  { code: 'KYC', label: 'KYC', description: 'KYC & Verification Department' },
  { code: 'SALES', label: 'Sales', description: 'Sales & Growth Department' },
];

export const employeeService = {
  async getEmployeeMeta(): Promise<EmployeeMetaResponse> {
    if (APP_CONFIG.useMockData) {
      return {
        departments: DEFAULT_DEPARTMENTS,
        roles: [
          { id: 5, code: 'OPERATIONS', name: 'Operations', description: null },
          { id: 6, code: 'ACCOUNTS', name: 'Accounts', description: null },
          { id: 7, code: 'KYC', name: 'KYC', description: null },
          { id: 8, code: 'SALES', name: 'Sales', description: null },
        ],
      };
    }

    try {
      const response = await apiClient.get<ApiResponse<EmployeeMetaResponse>>('/employees/meta');
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Failed to fetch employee meta, using defaults', err);
    }

    return {
      departments: DEFAULT_DEPARTMENTS,
      roles: [
        { id: 5, code: 'OPERATIONS', name: 'Operations', description: null },
        { id: 6, code: 'ACCOUNTS', name: 'Accounts', description: null },
        { id: 7, code: 'KYC', name: 'KYC', description: null },
        { id: 8, code: 'SALES', name: 'Sales', description: null },
      ],
    };
  },

  async getEmployees(filters: EmployeeListFilters = {}): Promise<EmployeeListResult> {
    if (APP_CONFIG.useMockData) {
      return {
        items: [],
        pagination: { page: filters.page || 1, pageSize: filters.pageSize || 20, totalItems: 0, totalPages: 0 },
      };
    }

    const params: Record<string, any> = {};
    if (filters.search) params.search = filters.search;
    if (filters.departmentCode && filters.departmentCode !== 'ALL') params.departmentCode = filters.departmentCode;
    if (filters.roleId) params.roleId = filters.roleId;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await apiClient.get<ApiResponse<{ items: BackendEmployeeItem[]; pagination: PaginationState }>>(
      '/employees',
      { params }
    );

    if (!response || !response.success || !response.data) {
      throw new Error(response?.message || 'Failed to fetch employee list');
    }

    return response.data;
  },

  async createEmployee(input: CreateEmployeeInput): Promise<BackendEmployeeItem> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      return {
        id: `emp_${Date.now()}`,
        userId: `usr_emp_${Date.now()}`,
        employeeCode: input.employeeCode || `EMP_${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: input.fullName,
        email: input.email,
        mobile: input.mobile || null,
        accountStatus: 'ACTIVE',
        departmentCode: input.departmentCode,
        designation: input.designation || 'Staff',
        joiningDate: input.joiningDate || new Date().toISOString().split('T')[0],
        employmentStatus: 'ACTIVE',
        role: { id: input.roleId, code: 'EMPLOYEE', name: 'Employee' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const defaultPassword = input.password || 'Demo@1234567';
    const payload = {
      ...input,
      password: defaultPassword,
    };

    const response = await apiClient.post<ApiResponse<BackendEmployeeItem>>('/employees', payload);
    if (!response || !response.success || !response.data) {
      throw new Error(response?.message || 'Failed to create employee');
    }

    return response.data;
  },

  async updateEmployeeStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED'): Promise<BackendEmployeeItem> {
    const response = await apiClient.patch<ApiResponse<BackendEmployeeItem>>(`/employees/${id}/status`, { status });
    if (!response || !response.success || !response.data) {
      throw new Error(response?.message || 'Failed to update employee status');
    }
    return response.data;
  },
};
