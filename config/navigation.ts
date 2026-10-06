import { UserContext, canAccessRoute, UserRole } from './roles';

export interface NavigationItem {
  id: string;
  label: string;
  iconName?: string;
  path?: string;
  roles?: UserRole[];
  requiredPermissions?: string[];
  children?: NavigationItem[];
  badge?: string | number;
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    path: '/admin/dashboard',
  },
  {
    id: 'network-management',
    label: 'Network Management',
    iconName: 'Network',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { id: 'admin-mds', label: 'Master Distributors', path: '/admin/network/master-distributors' },
      { id: 'admin-dsts', label: 'Distributors', path: '/admin/network/distributors' },
      { id: 'admin-retailers', label: 'Retailers', path: '/admin/network/retailers' },
      { id: 'admin-approvals', label: 'Approvals Center', path: '/admin/network/approvals' },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    iconName: 'ArrowLeftRight',
    roles: ['SUPER_ADMIN', 'OPERATIONS', 'ACCOUNTS', 'SUPPORT'],
    children: [
      { id: 'payin', label: 'Pay-In', path: '/admin/transactions/payin' },
      { id: 'payout', label: 'Pay-Out', path: '/admin/transactions/payout' },
      { id: 'all-txns', label: 'All Transactions', path: '/admin/transactions/all' },
      { id: 'txn-search', label: 'Transaction Search', path: '/admin/transactions/search' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    iconName: 'Users',
    roles: ['SUPER_ADMIN', 'SALES', 'SUPPORT', 'OPERATIONS'],
    children: [
      { id: 'distributors', label: 'Distributors', path: '/admin/users/distributors' },
      { id: 'retailers', label: 'Retailers', path: '/admin/users/retailers' },
      { id: 'merchants', label: 'Merchants', path: '/admin/users/merchants' },
      { id: 'backoffice', label: 'Back Office Users', path: '/admin/users/backoffice' },
      { id: 'mapping', label: 'User Mapping', path: '/admin/users/mapping' },
    ],
  },
  {
    id: 'kyc',
    label: 'KYC & Onboarding',
    iconName: 'ShieldCheck',
    path: '/admin/kyc',
    roles: ['SUPER_ADMIN', 'KYC', 'OPERATIONS'],
  },
  {
    id: 'wallet',
    label: 'Wallet & Ledger',
    iconName: 'Wallet',
    roles: ['SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'],
    children: [
      { id: 'balances', label: 'Available Balances', path: '/admin/wallet/balances' },
      { id: 'credit-debit', label: 'Credit / Debit', path: '/admin/wallet/credit-debit' },
      { id: 'debit-requests', label: 'Debit Requests', path: '/admin/wallet/debit-requests' },
      { id: 'ledger', label: 'Ledger', path: '/admin/wallet/ledger' },
    ],
  },
  {
    id: 'settlements',
    label: 'Settlements',
    iconName: 'Landmark',
    path: '/admin/settlements',
    roles: ['SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'],
  },
  {
    id: 'reports',
    label: 'Reports',
    iconName: 'BarChart3',
    roles: ['SUPER_ADMIN', 'ACCOUNTS', 'SALES', 'OPERATIONS'],
    children: [
      { id: 'txn-report', label: 'Transaction Report', path: '/admin/reports/transactions' },
      { id: 'ledger-report', label: 'Ledger Report', path: '/admin/reports/ledger' },
      { id: 'settlement-report', label: 'Settlement Report', path: '/admin/reports/settlements' },
      { id: 'balance-report', label: 'Balance Report', path: '/admin/reports/balance' },
      { id: 'chargeback-report', label: 'Chargeback Report', path: '/admin/reports/chargebacks' },
      { id: 'api-perf-report', label: 'API Performance', path: '/admin/reports/api-performance' },
    ],
  },
  {
    id: 'chargebacks',
    label: 'Chargebacks',
    iconName: 'RotateCcw',
    path: '/admin/chargebacks',
    roles: ['SUPER_ADMIN', 'OPERATIONS', 'ACCOUNTS'],
  },
  {
    id: 'invoices',
    label: 'Invoices & Tax',
    iconName: 'Receipt',
    roles: ['SUPER_ADMIN', 'ACCOUNTS'],
    children: [
      { id: 'invoices-list', label: 'Invoices', path: '/admin/invoices' },
      { id: 'service-templates', label: 'Service Templates', path: '/admin/invoices/service-templates' },
      { id: 'notes', label: 'Credit / Debit Notes', path: '/admin/invoices/notes' },
      { id: 'tax-summary', label: 'GST & Tax Summary', path: '/admin/invoices/tax-summary' },
      { id: 'tds', label: 'TDS Management', path: '/admin/invoices/tds' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    iconName: 'Bell',
    path: '/admin/notifications',
    roles: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'ACCOUNTS'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    iconName: 'Plug',
    roles: ['SUPER_ADMIN', 'OPERATIONS'],
    children: [
      { id: 'providers', label: 'Providers', path: '/admin/integrations/providers' },
      { id: 'api-config', label: 'API Configuration', path: '/admin/integrations/api-config' },
      { id: 'service-config', label: 'Service Configuration', path: '/admin/integrations/service-config' },
      { id: 'routing', label: 'Transaction Routing', path: '/admin/integrations/routing' },
      { id: 'webhooks', label: 'Webhooks', path: '/admin/integrations/webhooks' },
    ],
  },
  {
    id: 'logs',
    label: 'Logs',
    iconName: 'Terminal',
    roles: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'],
    children: [
      { id: 'api-logs', label: 'API Logs', path: '/admin/logs/api' },
      { id: 'client-logs', label: 'Client Logs', path: '/admin/logs/client' },
      { id: 'callback-logs', label: 'Callback Logs', path: '/admin/logs/callbacks' },
      { id: 'webhook-logs', label: 'Webhook Logs', path: '/admin/logs/webhooks' },
      { id: 'login-logs', label: 'Login Logs', path: '/admin/logs/login' },
      { id: 'activity-logs', label: 'Activity Logs', path: '/admin/logs/activity' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    iconName: 'Settings',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { id: 'admin-users', label: 'Admin Users', path: '/admin/administration/users' },
      { id: 'roles', label: 'Roles & Permissions', path: '/admin/administration/roles' },
      { id: 'retailer-plans', label: 'Retailer Plans', path: '/admin/administration/retailer-plans' },
      { id: 'limits', label: 'Transaction Limits', path: '/admin/administration/limits' },
      { id: 'fees', label: 'Fee & Charge Master', path: '/admin/administration/fees' },
      { id: 'tax', label: 'Tax Configuration', path: '/admin/administration/tax' },
      { id: 'payment-masters', label: 'Payment Masters', path: '/admin/administration/config' },
      { id: 'reason-codes', label: 'Reason Code Master', path: '/admin/administration/reason-codes' },
      { id: 'settings', label: 'Platform Settings', path: '/admin/administration/settings' },
      { id: 'branding', label: 'Branding', path: '/admin/administration/branding' },
      { id: 'security', label: 'Security Settings', path: '/admin/administration/security' },
    ],
  },
];

/**
 * Role-based navigation configurations for future role layouts.
 */
export const ROLE_NAVIGATION_MAPS: Record<UserRole, NavigationItem[]> = {
  ADMIN: NAVIGATION_CONFIG,
  SUPER_ADMIN: NAVIGATION_CONFIG,
  MASTER_DISTRIBUTOR: [
    { id: 'md-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/master-distributor/dashboard' },
    { id: 'md-distributors', label: 'Distributors', iconName: 'Users', path: '/master-distributor/distributors' },
    { id: 'md-retailers', label: 'Retailers', iconName: 'Store', path: '/master-distributor/retailers' },
    {
      id: 'md-transactions',
      label: 'Transactions',
      iconName: 'ArrowLeftRight',
      path: '/master-distributor/transactions',
      children: [
        { id: 'md-txns-all', label: 'All Transactions', path: '/master-distributor/transactions' },
        { id: 'md-txns-payin', label: 'Pay-In', path: '/master-distributor/transactions?type=PAY_IN' },
        { id: 'md-txns-payout', label: 'Pay-Out', path: '/master-distributor/transactions?type=PAY_OUT' },
      ],
    },
    {
      id: 'md-wallet',
      label: 'Wallet & Ledger',
      iconName: 'Wallet',
      path: '/master-distributor/wallet',
      children: [
        { id: 'md-wallet-overview', label: 'Wallet Overview', path: '/master-distributor/wallet' },
        { id: 'md-wallet-ledger', label: 'Ledger', path: '/master-distributor/wallet/ledger' },
      ],
    },
    {
      id: 'md-commissions',
      label: 'Commissions',
      iconName: 'Percent',
      path: '/master-distributor/commissions',
      children: [
        { id: 'md-comm-summary', label: 'Commission Summary', path: '/master-distributor/commissions' },
      ],
    },
    { id: 'md-reports', label: 'Reports', iconName: 'BarChart3', path: '/master-distributor/reports' },
    { id: 'md-notifications', label: 'Notifications', iconName: 'Bell', path: '/notifications' },
  ],
  DISTRIBUTOR: [
    { id: 'dst-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/distributor/dashboard' },
    {
      id: 'dst-retailers',
      label: 'Retailers',
      iconName: 'Store',
      path: '/distributor/retailers',
      children: [
        { id: 'dst-retailers-all', label: 'All Retailers', path: '/distributor/retailers' },
      ],
    },
    {
      id: 'dst-transactions',
      label: 'Transactions',
      iconName: 'ArrowLeftRight',
      path: '/distributor/transactions',
      children: [
        { id: 'dst-txns-all', label: 'All Transactions', path: '/distributor/transactions' },
        { id: 'dst-txns-payin', label: 'Pay-In', path: '/distributor/transactions?type=PAY_IN' },
        { id: 'dst-txns-payout', label: 'Pay-Out', path: '/distributor/transactions?type=PAY_OUT' },
      ],
    },
    {
      id: 'dst-wallet',
      label: 'Wallet & Ledger',
      iconName: 'Wallet',
      path: '/distributor/wallet',
      children: [
        { id: 'dst-wallet-overview', label: 'Wallet Overview', path: '/distributor/wallet' },
        { id: 'dst-wallet-ledger', label: 'Ledger', path: '/distributor/wallet/ledger' },
      ],
    },
    { id: 'dst-commissions', label: 'Commissions', iconName: 'Percent', path: '/distributor/commissions' },
    { id: 'dst-reports', label: 'Reports', iconName: 'BarChart3', path: '/distributor/reports' },
    { id: 'dst-notifications', label: 'Notifications', iconName: 'Bell', path: '/distributor/notifications' },
    { id: 'dst-profile', label: 'Profile', iconName: 'User', path: '/distributor/profile' },
  ],
  RETAILER: [
    { id: 'ret-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/retailer/dashboard' },
    { id: 'ret-payin', label: 'Pay-In', iconName: 'ArrowDownLeft', path: '/retailer/pay-in' },
    { id: 'ret-payout', label: 'Pay-Out', iconName: 'ArrowUpRight', path: '/retailer/pay-out' },
    { id: 'ret-transactions', label: 'Transactions', iconName: 'ArrowLeftRight', path: '/retailer/transactions' },
    {
      id: 'ret-wallet',
      label: 'Wallet & Ledger',
      iconName: 'Wallet',
      path: '/retailer/wallet',
      children: [
        { id: 'ret-wallet-overview', label: 'Wallet Overview', path: '/retailer/wallet' },
        { id: 'ret-wallet-ledger', label: 'Ledger', path: '/retailer/wallet/ledger' },
      ],
    },
    { id: 'ret-commissions', label: 'Commissions', iconName: 'Percent', path: '/retailer/commissions' },
    { id: 'ret-reports', label: 'Reports', iconName: 'BarChart3', path: '/retailer/reports' },
    { id: 'ret-notifications', label: 'Notifications', iconName: 'Bell', path: '/retailer/notifications' },
    { id: 'ret-profile', label: 'Profile', iconName: 'User', path: '/retailer/profile' },
  ],
  OPERATIONS: NAVIGATION_CONFIG,
  ACCOUNTS: NAVIGATION_CONFIG,
  KYC: NAVIGATION_CONFIG,
  SALES: NAVIGATION_CONFIG,
  SUPPORT: NAVIGATION_CONFIG,
  MERCHANT: NAVIGATION_CONFIG,
};

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return ROLE_NAVIGATION_MAPS[role] || NAVIGATION_CONFIG;
}

/**
 * Recursively filters navigation items based on current user role and permissions.
 */
export function filterNavigationByRole(
  items: NavigationItem[],
  user: UserContext
): NavigationItem[] {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return items;

  return items
    .filter((item) => canAccessRoute(user, item.roles, item.requiredPermissions))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterNavigationByRole(item.children, user),
        };
      }
      return item;
    })
    .filter((item) => !item.children || item.children.length > 0);
}

