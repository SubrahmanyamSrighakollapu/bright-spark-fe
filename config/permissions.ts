import { UserContext } from './roles';

/**
 * Standardized Permission Tokens for Bright Spark
 * Format: MODULE_ACTION
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  // Transactions
  TRANSACTION_VIEW: 'TRANSACTION_VIEW',
  TRANSACTION_EXPORT: 'TRANSACTION_EXPORT',
  TRANSACTION_STATUS_CHECK: 'TRANSACTION_STATUS_CHECK',

  // Users & Hierarchy
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_BLOCK: 'USER_BLOCK',

  // KYC & Onboarding
  KYC_VIEW: 'KYC_VIEW',
  KYC_APPROVE: 'KYC_APPROVE',
  KYC_REJECT: 'KYC_REJECT',

  // Wallet & Ledger
  WALLET_VIEW: 'WALLET_VIEW',
  WALLET_CREDIT: 'WALLET_CREDIT',
  WALLET_DEBIT: 'WALLET_DEBIT',
  WALLET_HOLD: 'WALLET_HOLD',
  WALLET_RELEASE: 'WALLET_RELEASE',

  // Settlements
  SETTLEMENT_VIEW: 'SETTLEMENT_VIEW',
  SETTLEMENT_PROCESS: 'SETTLEMENT_PROCESS',
  SETTLEMENT_RECONCILE: 'SETTLEMENT_RECONCILE',

  // Reports
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_EXPORT: 'REPORT_EXPORT',

  // Chargebacks
  CHARGEBACK_VIEW: 'CHARGEBACK_VIEW',
  CHARGEBACK_ASSIGN: 'CHARGEBACK_ASSIGN',
  CHARGEBACK_RESOLVE: 'CHARGEBACK_RESOLVE',

  // Invoices & Tax
  INVOICE_VIEW: 'INVOICE_VIEW',
  INVOICE_CREATE: 'INVOICE_CREATE',
  INVOICE_EXPORT: 'INVOICE_EXPORT',

  // Notifications
  NOTIFICATION_VIEW: 'NOTIFICATION_VIEW',
  NOTIFICATION_MANAGE: 'NOTIFICATION_MANAGE',

  // Integrations & Routing
  PROVIDER_VIEW: 'PROVIDER_VIEW',
  PROVIDER_CREATE: 'PROVIDER_CREATE',
  PROVIDER_EDIT: 'PROVIDER_EDIT',
  PROVIDER_DISABLE: 'PROVIDER_DISABLE',
  ROUTING_VIEW: 'ROUTING_VIEW',
  ROUTING_EDIT: 'ROUTING_EDIT',
  WEBHOOK_VIEW: 'WEBHOOK_VIEW',
  WEBHOOK_EDIT: 'WEBHOOK_EDIT',
  WEBHOOK_RETRY: 'WEBHOOK_RETRY',

  // Logs & Audit
  LOG_VIEW: 'LOG_VIEW',
  LOG_EXPORT: 'LOG_EXPORT',

  // Administration
  ADMIN_USER_VIEW: 'ADMIN_USER_VIEW',
  ADMIN_USER_CREATE: 'ADMIN_USER_CREATE',
  ADMIN_USER_EDIT: 'ADMIN_USER_EDIT',
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_EDIT: 'ROLE_EDIT',
  LIMITS_VIEW: 'LIMITS_VIEW',
  LIMITS_EDIT: 'LIMITS_EDIT',
  FEES_VIEW: 'FEES_VIEW',
  FEES_EDIT: 'FEES_EDIT',
  SYSTEM_SETTINGS_VIEW: 'SYSTEM_SETTINGS_VIEW',
  SYSTEM_SETTINGS_EDIT: 'SYSTEM_SETTINGS_EDIT',
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export interface PermissionGroup {
  moduleName: string;
  permissions: { code: PermissionCode; label: string; description: string; requires?: PermissionCode }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    moduleName: 'Dashboard',
    permissions: [
      { code: 'DASHBOARD_VIEW', label: 'View Dashboard', description: 'Access dashboard metrics and live telemetry' },
    ],
  },
  {
    moduleName: 'Transactions',
    permissions: [
      { code: 'TRANSACTION_VIEW', label: 'View Transactions', description: 'View Pay-In and Pay-Out transaction records' },
      { code: 'TRANSACTION_EXPORT', label: 'Export Transactions', description: 'Export transaction search results to CSV', requires: 'TRANSACTION_VIEW' },
      { code: 'TRANSACTION_STATUS_CHECK', label: 'Manual Status Check', description: 'Trigger bank status inquiry API calls', requires: 'TRANSACTION_VIEW' },
    ],
  },
  {
    moduleName: 'Users & Hierarchy',
    permissions: [
      { code: 'USER_VIEW', label: 'View Users', description: 'View distributors, retailers, and back office users' },
      { code: 'USER_CREATE', label: 'Create Users', description: 'Onboard new commercial entities', requires: 'USER_VIEW' },
      { code: 'USER_EDIT', label: 'Edit Users', description: 'Modify commercial user details and mappings', requires: 'USER_VIEW' },
      { code: 'USER_BLOCK', label: 'Block / Unblock Users', description: 'Suspend or activate user accounts', requires: 'USER_VIEW' },
    ],
  },
  {
    moduleName: 'KYC & Onboarding',
    permissions: [
      { code: 'KYC_VIEW', label: 'View KYC Applications', description: 'View retailer onboarding documents' },
      { code: 'KYC_APPROVE', label: 'Approve KYC', description: 'Approve submitted retailer KYC dossiers', requires: 'KYC_VIEW' },
      { code: 'KYC_REJECT', label: 'Reject KYC', description: 'Reject KYC applications with reason codes', requires: 'KYC_VIEW' },
    ],
  },
  {
    moduleName: 'Wallet & Ledger',
    permissions: [
      { code: 'WALLET_VIEW', label: 'View Wallets & Ledger', description: 'Inspect available balances and financial ledger entries' },
      { code: 'WALLET_CREDIT', label: 'Credit Wallet', description: 'Execute manual credit top-up adjustments', requires: 'WALLET_VIEW' },
      { code: 'WALLET_DEBIT', label: 'Debit Wallet', description: 'Approve or process debit request adjustments', requires: 'WALLET_VIEW' },
      { code: 'WALLET_HOLD', label: 'Place Balance Hold', description: 'Place lien holds on available balances', requires: 'WALLET_VIEW' },
      { code: 'WALLET_RELEASE', label: 'Release Hold', description: 'Release lien holds back to available balance', requires: 'WALLET_VIEW' },
    ],
  },
  {
    moduleName: 'Settlements',
    permissions: [
      { code: 'SETTLEMENT_VIEW', label: 'View Settlements', description: 'Inspect settlement batches and reconciliation queues' },
      { code: 'SETTLEMENT_PROCESS', label: 'Process Settlements', description: 'Disburse nodal payouts to retailers', requires: 'SETTLEMENT_VIEW' },
      { code: 'SETTLEMENT_RECONCILE', label: 'Reconcile Settlements', description: 'Perform manual reconciliation checks', requires: 'SETTLEMENT_VIEW' },
    ],
  },
  {
    moduleName: 'Reports & Analytics',
    permissions: [
      { code: 'REPORT_VIEW', label: 'View Reports', description: 'Access financial and volume analytics' },
      { code: 'REPORT_EXPORT', label: 'Export Reports', description: 'Download CSV and Excel report exports', requires: 'REPORT_VIEW' },
    ],
  },
  {
    moduleName: 'Chargebacks & Disputes',
    permissions: [
      { code: 'CHARGEBACK_VIEW', label: 'View Chargebacks', description: 'View dispute cases and evidence requests' },
      { code: 'CHARGEBACK_ASSIGN', label: 'Assign Chargebacks', description: 'Assign dispute cases to operations agents', requires: 'CHARGEBACK_VIEW' },
      { code: 'CHARGEBACK_RESOLVE', label: 'Resolve Chargebacks', description: 'Mark dispute cases as WON or LOST', requires: 'CHARGEBACK_VIEW' },
    ],
  },
  {
    moduleName: 'Invoices & Tax',
    permissions: [
      { code: 'INVOICE_VIEW', label: 'View Invoices & Tax', description: 'Inspect tax summaries, GST, and TDS certificates' },
      { code: 'INVOICE_CREATE', label: 'Generate Invoices', description: 'Generate platform billing invoices', requires: 'INVOICE_VIEW' },
      { code: 'INVOICE_EXPORT', label: 'Export Tax Data', description: 'Export GST/TDS tax records', requires: 'INVOICE_VIEW' },
    ],
  },
  {
    moduleName: 'Integrations & Providers',
    permissions: [
      { code: 'PROVIDER_VIEW', label: 'View Providers & Rules', description: 'View payment gateways and failover rules' },
      { code: 'PROVIDER_CREATE', label: 'Add Provider', description: 'Configure new payment gateway integrations', requires: 'PROVIDER_VIEW' },
      { code: 'PROVIDER_EDIT', label: 'Edit Provider', description: 'Modify provider credentials and service parameters', requires: 'PROVIDER_VIEW' },
      { code: 'PROVIDER_DISABLE', label: 'Disable Provider', description: 'Toggle provider health or operational state', requires: 'PROVIDER_VIEW' },
      { code: 'ROUTING_EDIT', label: 'Manage Routing Rules', description: 'Update smart routing and failover cascades', requires: 'PROVIDER_VIEW' },
      { code: 'WEBHOOK_RETRY', label: 'Retry Webhooks', description: 'Trigger webhook redeliveries', requires: 'PROVIDER_VIEW' },
    ],
  },
  {
    moduleName: 'Logs & Audit',
    permissions: [
      { code: 'LOG_VIEW', label: 'View Operational Logs', description: 'Access API, Callback, Webhook, and Login logs' },
      { code: 'LOG_EXPORT', label: 'Export Audit Logs', description: 'Export activity audit trails', requires: 'LOG_VIEW' },
    ],
  },
  {
    moduleName: 'Administration',
    permissions: [
      { code: 'ADMIN_USER_VIEW', label: 'View Admin Users', description: 'View internal operational administrative staff' },
      { code: 'ADMIN_USER_CREATE', label: 'Create Admin User', description: 'Invite new administrative staff', requires: 'ADMIN_USER_VIEW' },
      { code: 'ADMIN_USER_EDIT', label: 'Edit Admin User', description: 'Modify staff details, roles, and status', requires: 'ADMIN_USER_VIEW' },
      { code: 'ROLE_VIEW', label: 'View Roles & Permissions', description: 'Inspect RBAC role matrices' },
      { code: 'ROLE_CREATE', label: 'Create Role', description: 'Create new administrative roles', requires: 'ROLE_VIEW' },
      { code: 'ROLE_EDIT', label: 'Edit Role', description: 'Modify permissions assigned to roles', requires: 'ROLE_VIEW' },
      { code: 'LIMITS_VIEW', label: 'View Transaction Limits', description: 'Inspect transaction limit rules' },
      { code: 'LIMITS_EDIT', label: 'Edit Transaction Limits', description: 'Update min/max and daily limit rules', requires: 'LIMITS_VIEW' },
      { code: 'FEES_VIEW', label: 'View Fee Masters', description: 'Inspect platform fee and charge masters' },
      { code: 'FEES_EDIT', label: 'Edit Fee Masters', description: 'Update platform fee calculations', requires: 'FEES_VIEW' },
      { code: 'SYSTEM_SETTINGS_VIEW', label: 'View Platform Settings', description: 'View system, branding, and security settings' },
      { code: 'SYSTEM_SETTINGS_EDIT', label: 'Edit Platform Settings', description: 'Update platform branding and security settings', requires: 'SYSTEM_SETTINGS_VIEW' },
    ],
  },
];

/**
 * Check if a user has a specific permission.
 */
export function checkPermission(user: UserContext | null, requiredPermission: string): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.permissions.includes('*')) return true;
  return user.permissions.includes(requiredPermission);
}

/**
 * Check if a user has ANY of the required permissions.
 */
export function checkAnyPermission(user: UserContext | null, requiredPermissions: string[]): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.permissions.includes('*')) return true;
  return requiredPermissions.some((perm) => user.permissions.includes(perm));
}

/**
 * Check if a user has ALL of the required permissions.
 */
export function checkAllPermissions(user: UserContext | null, requiredPermissions: string[]): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.permissions.includes('*')) return true;
  return requiredPermissions.every((perm) => user.permissions.includes(perm));
}

/**
 * Resolve permission dependencies (e.g. WALLET_CREDIT -> requires WALLET_VIEW).
 */
export function resolvePermissionDependencies(selectedPermissions: string[]): string[] {
  const result = new Set<string>(selectedPermissions);

  PERMISSION_GROUPS.forEach((group) => {
    group.permissions.forEach((perm) => {
      if (result.has(perm.code) && perm.requires) {
        result.add(perm.requires);
      }
    });
  });

  return Array.from(result);
}
