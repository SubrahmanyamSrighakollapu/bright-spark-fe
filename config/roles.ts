/**
 * Role-Based Access Control (RBAC) foundation for Qin Star Pay.
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MASTER_DISTRIBUTOR: 'MASTER_DISTRIBUTOR',
  DISTRIBUTOR: 'DISTRIBUTOR',
  RETAILER: 'RETAILER',
  SALES: 'SALES',
  KYC: 'KYC',
  ACCOUNTS: 'ACCOUNTS',
  OPERATIONS: 'OPERATIONS',
  SUPPORT: 'SUPPORT',
  MERCHANT: 'MERCHANT',
} as const;

/** Backend role classification. Network roles are protected; Admin-created roles are EMPLOYEE roles. */
export const ROLE_CATEGORIES = {
  SYSTEM: 'SYSTEM',
  NETWORK: 'NETWORK',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export const PROTECTED_ROLE_CODES = ['ADMIN', 'MASTER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'] as const;
export const DEFAULT_EMPLOYEE_ROLE_CODES = ['OPERATIONS', 'ACCOUNTS', 'KYC', 'SALES'] as const;

export type UserRole = keyof typeof USER_ROLES;

export const ROLE_HIERARCHY_LEVELS: Record<UserRole, number> = {
  ADMIN: 1,
  SUPER_ADMIN: 1,
  MASTER_DISTRIBUTOR: 2,
  DISTRIBUTOR: 3,
  RETAILER: 4,
  OPERATIONS: 2,
  ACCOUNTS: 2,
  KYC: 2,
  SALES: 3,
  SUPPORT: 3,
  MERCHANT: 4,
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  MASTER_DISTRIBUTOR: 'Master Distributor',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  SALES: 'Sales Executive',
  KYC: 'KYC Analyst',
  ACCOUNTS: 'Accounts Manager',
  OPERATIONS: 'Operations Lead',
  SUPPORT: 'Support Executive',
  MERCHANT: 'Merchant',
};

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export const MOCK_CURRENT_USER: UserContext = {
  id: 'usr_admin_01',
  name: 'Qin Star Admin',
  email: 'admin@qinstarpay.com',
  role: 'SUPER_ADMIN',
  permissions: ['*'],
};

/**
 * Checks if a user has a specific permission.
 */
export function hasPermission(user: UserContext, requiredPermission: string): boolean {
  if (!user) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(requiredPermission);
}

/**
 * Checks if a user can access a route based on their role and permissions.
 */
export function canAccessRoute(
  user: UserContext,
  allowedRoles?: UserRole[],
  requiredPermissions?: string[]
): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return false;
    }
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => hasPermission(user, perm));
    if (!hasAll) return false;
  }

  return true;
}

