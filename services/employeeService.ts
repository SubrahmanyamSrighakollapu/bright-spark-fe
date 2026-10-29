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
  shiftCode: 'MORNING' | 'EVENING' | 'NIGHT';
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
  fullName: string;
  email: string;
  mobile: string;
  departmentCode: string;
  joiningDate: string;
  shiftCode?: 'MORNING' | 'EVENING' | 'NIGHT';
}

export interface UpdateEmployeeInput {
  fullName: string;
  email: string;
  mobile?: string | null;
  departmentCode: string;
  roleId: number;
  designation?: string | null;
  joiningDate?: string | null;
  shiftCode: 'MORNING' | 'EVENING' | 'NIGHT';
  reason: string;
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

    const response = await apiClient.get<ApiResponse<EmployeeMetaResponse>>('/employees/meta');
    if (!response?.success || !response.data) throw new Error(response?.message || 'Failed to load employee configuration');
    return response.data;
  },

  async getEmployees(filters: EmployeeListFilters = {}): Promise<EmployeeListResult> {
    if (APP_CONFIG.useMockData) {
      return {
        items: [],
        pagination: { page: filters.page || 1, pageSize: filters.pageSize || 20, totalItems: 0, totalPages: 0 },
      };
    }

    const params: Record<string, string | number | boolean | undefined> = {};
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
        employeeCode: `EMP${({ OPERATIONS: 'OPS', ACCOUNTS: 'ACC', KYC: 'KYC', SALES: 'SAL' } as Record<string, string>)[input.departmentCode] ?? input.departmentCode.slice(0, 3).replace(/_/g, '')}${Math.floor(100 + Math.random() * 900)}`,
        fullName: input.fullName,
        email: input.email,
        mobile: input.mobile || null,
        accountStatus: 'ACTIVE',
        departmentCode: input.departmentCode,
        designation: null,
        managerUserId: null,
        joiningDate: input.joiningDate || new Date().toISOString().split('T')[0],
        shiftCode: input.shiftCode || 'MORNING',
        employmentStatus: 'ACTIVE',
        role: { id: 0, code: input.departmentCode, name: input.departmentCode },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const response = await apiClient.post<ApiResponse<BackendEmployeeItem>>('/employees', input);
    if (!response || !response.success || !response.data) {
      throw new Error(response?.message || 'Failed to create employee');
    }

    return response.data;
  },

  async updateEmployeeStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED'): Promise<BackendEmployeeItem> {
    const response = await apiClient.patch<ApiResponse<BackendEmployeeItem>>(`/employees/${id}/status`, { status, reason: `Status changed to ${status} from employee management` });
    if (!response || !response.success || !response.data) {
      throw new Error(response?.message || 'Failed to update employee status');
    }
    return response.data;
  },

  async getEmployee(id: string): Promise<BackendEmployeeItem> {
    const response = await apiClient.get<ApiResponse<BackendEmployeeItem>>(`/employees/${id}`);
    if (!response.success || !response.data) throw new Error(response.message || 'Failed to fetch employee');
    return response.data;
  },

  async updateEmployee(id: string, input: UpdateEmployeeInput): Promise<BackendEmployeeItem> {
    const response = await apiClient.put<ApiResponse<BackendEmployeeItem>>(`/employees/${id}`, input);
    if (!response.success || !response.data) throw new Error(response.message || 'Failed to update employee');
    return response.data;
  },

  async resetEmployeePassword(id: string, reason: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ temporaryPassword: string }>>(`/employees/${id}/reset-password`, { reason });
    if (!response.success || !response.data) throw new Error(response.message || 'Failed to reset password');
    return response.data.temporaryPassword;
  },
};
