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
  SALES: 'Sales Lead',
  KYC: 'KYC & Onboarding Approval',
  ACCOUNTS: 'Accountant',
  OPERATIONS: 'Operations (Support Tickets)',
  SUPPORT: 'Support Executive',
  MERCHANT: 'Retailer',
};

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  entityId?: string;
  mappedParentRole?: string;
  profilePhotoUrl?: string | null;
}

export const ROLE_MAPPED_PARENTS: Record<UserRole, string> = {
  ADMIN: 'Qin Star Pay Admin',
  SUPER_ADMIN: 'Qin Star Pay Platform',
  MASTER_DISTRIBUTOR: 'Master Distributor Network',
  DISTRIBUTOR: 'Distributor Network',
  RETAILER: 'Retailer Operations',
  SALES: 'Sales & Business Development',
  KYC: 'KYC & Onboarding Desk',
  ACCOUNTS: 'Operations & Finance Control',
  OPERATIONS: 'Operations & Finance Control',
  SUPPORT: 'Support & Operations Desk',
  MERCHANT: 'Retailer Network',
};

export const MOCK_CURRENT_USER: UserContext = {
  id: 'usr_admin_01',
  name: 'Qin Star Admin',
  email: 'admin@qinstarpay.com',
  role: 'SUPER_ADMIN',
  permissions: ['*'],
  mappedParentRole: 'Qin Star Pay Admin',
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

/**
 * Evaluates whether a route pathname is authorized for a given user role.
 */
export function isRouteAuthorizedForRole(role: UserRole | string, pathname: string): boolean {
  if (!pathname || pathname === '/' || pathname === '/login') return true;

  // 1. Super Admin & Admin have platform-wide access
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return true;
  }

  // Universal account-level routes
  if (pathname === '/dashboard' || pathname.startsWith('/profile') || pathname.startsWith('/notifications')) {
    return true;
  }

  // 2. KYC & Onboarding Approval
  if (role === 'KYC') {
    return (
      pathname.startsWith('/kyc') ||
      pathname.startsWith('/admin/kyc') ||
      pathname.startsWith('/admin/users/merchants') ||
      pathname.startsWith('/admin/notifications')
    );
  }

  // 3. Sales Lead
  if (role === 'SALES') {
    return (
      pathname.startsWith('/sales') ||
      pathname.startsWith('/admin/sales') ||
      pathname.startsWith('/admin/network/approvals') ||
      pathname.startsWith('/admin/users/distributors') ||
      pathname.startsWith('/admin/users/retailers') ||
      pathname.startsWith('/admin/users/merchants') ||
      pathname.startsWith('/admin/users/mapping') ||
      pathname.startsWith('/admin/reports/transactions') ||
      pathname.startsWith('/admin/reports/balance') ||
      pathname.startsWith('/admin/notifications')
    );
  }

  // 4. Accountant (Finance & Settlements)
  if (role === 'ACCOUNTS') {
    return (
      pathname.startsWith('/accounts') ||
      pathname.startsWith('/admin/accounts') ||
      pathname.startsWith('/admin/wallet') ||
      pathname.startsWith('/admin/settlements') ||
      pathname.startsWith('/admin/invoices') ||
      pathname.startsWith('/admin/reports') ||
      pathname.startsWith('/admin/notifications')
    );
  }

  // 5. Operations & Support Executive
  if (role === 'OPERATIONS' || role === 'SUPPORT') {
    return (
      pathname.startsWith('/operations') ||
      pathname.startsWith('/admin/operations') ||
      pathname.startsWith('/admin/transactions') ||
      pathname.startsWith('/admin/chargebacks') ||
      pathname.startsWith('/admin/integrations') ||
      pathname.startsWith('/admin/logs') ||
      pathname.startsWith('/admin/notifications')
    );
  }

  // 6. Master Distributor
  if (role === 'MASTER_DISTRIBUTOR') {
    return pathname.startsWith('/master-distributor') || pathname.startsWith('/help-desk');
  }

  // 7. Distributor
  if (role === 'DISTRIBUTOR') {
    return pathname.startsWith('/distributor') || pathname.startsWith('/help-desk');
  }

  // 8. Retailer
  if (role === 'RETAILER') {
    return pathname.startsWith('/retailer') || pathname.startsWith('/help-desk');
  }

  return false;
}
