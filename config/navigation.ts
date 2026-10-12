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
    label: 'User Management',
    iconName: 'Users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT', 'OPERATIONS'],
    children: [
      { id: 'user-list', label: 'User List', path: '/admin/users' },
      { id: 'add-user', label: 'Add User', path: '/admin/users/add' },
      { id: 'user-settings', label: 'Retailer Settings', path: '/admin/users/settings' },
    ],
  },
  {
    id: 'employees',
    label: 'Employee Management',
    iconName: 'UserCheck',
    roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS'],
    children: [
      { id: 'employee-list', label: 'Employees List', path: '/admin/employees' },
      { id: 'add-employee', label: 'Add Employee', path: '/admin/employees/add' },
    ],
  },
  {
    id: 'kyc',
    label: 'KYC & Onboarding',
    iconName: 'ShieldCheck',
    path: '/admin/kyc',
    roles: ['SUPER_ADMIN', 'ADMIN', 'KYC', 'OPERATIONS'],
    children: [
      { id: 'kyc-review', label: 'KYC Review', path: '/admin/kyc', roles: ['SUPER_ADMIN', 'ADMIN', 'KYC', 'OPERATIONS'] },
      { id: 'network-approvals', label: 'Network Approvals', path: '/admin/network/approvals', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    id: 'wallet-management',
    label: 'Wallet Management',
    iconName: 'Wallet',
    path: '/admin/wallet-management',
    roles: ['SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'],
  },
  {
    id: 'topup-approvals',
    label: 'Top-Up Approvals',
    iconName: 'BadgeIndianRupee',
    path: '/admin/top-up-requests',
    roles: ['SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'],
  },
  {
    id: 'settlements',
    label: 'Settlements',
    iconName: 'Landmark',
    path: '/admin/settlements',
    roles: ['SUPER_ADMIN', 'ACCOUNTS', 'OPERATIONS'],
  },
  {
    id: 'logs-audit',
    label: 'Logs & Audit',
    iconName: 'ClipboardList',
    roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'ACCOUNTS'],
    children: [
      { id: 'activity-logs', label: 'Activity Logs', path: '/admin/logs/activity', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'ACCOUNTS'] },
      { id: 'api-performance-logs', label: 'API Performance Logs', path: '/admin/logs/api', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'ACCOUNTS'] },
    ],
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
    id: 'integrations',
    label: 'Integration Module',
    iconName: 'Plug',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { id: 'add-payment-gateway', label: 'Add Payment Gateway', path: '/admin/integrations' },
      { id: 'gateway-setup', label: 'Gateway Setup & Mapping', path: '/admin/integrations/setup' },
      { id: 'charge-configuration', label: 'Charge Configuration', path: '/admin/integrations/charges' },
    ],
  },
  {
    id: 'administration',
    label: 'Admin Settings',
    iconName: 'Settings',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { id: 'service-categories', label: 'Service Categories & Products', path: '/admin/administration/service-categories' },
      { id: 'roles-management', label: 'Roles Management', path: '/admin/administration/roles' },
      { id: 'plans-management', label: 'Plans Management', path: '/admin/administration/plans' },
      { id: 'plan-configurations', label: 'Plan Configuration', path: '/admin/administration/plan-configuration' },
      { id: 'plan-commissions', label: 'Commission Configuration', path: '/admin/administration/commissions' },
      { id: 'scroll-text', label: 'Scroll Text Manager', path: '/admin/administration/ticker' },
      { id: 'notice-board', label: 'Notice Board Manager', path: '/admin/administration/notice-board' },
      { id: 'payout-charges', label: 'Payout Charges Manager', path: '/admin/administration/payout-charges' },
      { id: 'min-balance', label: 'Min Wallet Balance Req', path: '/admin/administration/balance-requirement' },
      { id: 'payment-methods', label: 'Payment Methods Manager', path: '/admin/administration/payment-methods' },
      { id: 'invoice-details', label: 'Invoice Details Setup', path: '/admin/administration/invoice-details' },
    ],
  },
  {
    id: 'website',
    label: 'Website Settings',
    iconName: 'Globe',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { id: 'privacy-policy', label: 'Privacy Policy', path: '/admin/website/privacy-policy' },
      { id: 'terms-conditions', label: 'Terms & Conditions', path: '/admin/website/terms' },
      { id: 'refund-policy', label: 'Refund Policy', path: '/admin/website/refund-policy' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    iconName: 'Bell',
    path: '/admin/notifications',
    roles: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'ACCOUNTS'],
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
    { id: 'md-kyc-documents', label: 'KYC & Documents', iconName: 'ShieldCheck', path: '/kyc/documents' },
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
    { id: 'dst-kyc-documents', label: 'KYC & Documents', iconName: 'ShieldCheck', path: '/kyc/documents' },
    { id: 'dst-notifications', label: 'Notifications', iconName: 'Bell', path: '/distributor/notifications' },
    { id: 'dst-profile', label: 'Profile', iconName: 'User', path: '/distributor/profile' },
  ],
  RETAILER: [
    { id: 'ret-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/retailer/dashboard' },
    { id: 'ret-bbps', label: 'BBPS', iconName: 'Receipt', path: '/retailer/bbps' },
    { id: 'ret-payin', label: 'Pay-In', iconName: 'ArrowDownLeft', path: '/retailer/pay-in' },
    { id: 'ret-qr-payin', label: 'QR Pay-In', iconName: 'QrCode', path: '/retailer/qr-pay-in' },
    { id: 'ret-payment-links', label: 'Payment Links', iconName: 'Link2', path: '/retailer/payment-links' },
    { id: 'ret-topup', label: 'Top-Up Request', iconName: 'BadgeIndianRupee', path: '/retailer/top-up' },
    { id: 'ret-payout', label: 'Settlement / Pay-Out', iconName: 'ArrowUpRight', path: '/retailer/pay-out' },
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
    { id: 'ret-reports', label: 'Reports', iconName: 'BarChart3', path: '/retailer/reports', children: [
      { id: 'ret-all-reports', label: 'All Reports', path: '/retailer/reports' },
      { id: 'ret-unsettled', label: 'Unsettled (T+1)', path: '/retailer/reports/unsettled' },
      { id: 'ret-chargebacks', label: 'Chargebacks', path: '/retailer/reports/chargebacks' },
    ] },
    { id: 'ret-kyc-documents', label: 'KYC & Documents', iconName: 'ShieldCheck', path: '/kyc/documents' },
    { id: 'ret-notifications', label: 'Notifications', iconName: 'Bell', path: '/retailer/notifications' },
    { id: 'ret-profile', label: 'Profile', iconName: 'User', path: '/retailer/profile' },
  ],
  OPERATIONS: [
    { id: 'ops-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/operations/dashboard' },
    {
      id: 'transactions',
      label: 'Transactions',
      iconName: 'ArrowLeftRight',
      children: [
        { id: 'payin', label: 'Pay-In', path: '/admin/transactions/payin' },
        { id: 'payout', label: 'Pay-Out', path: '/admin/transactions/payout' },
        { id: 'all-txns', label: 'All Transactions', path: '/admin/transactions/all' },
        { id: 'txn-search', label: 'Transaction Search', path: '/admin/transactions/search' },
      ],
    },
    { id: 'chargebacks', label: 'Chargebacks & Disputes', iconName: 'RotateCcw', path: '/admin/chargebacks' },
    {
      id: 'logs-audit',
      label: 'Logs & Audit',
      iconName: 'ClipboardList',
      children: [
        { id: 'activity-logs', label: 'Activity Logs', path: '/admin/logs/activity' },
        { id: 'api-performance-logs', label: 'API Performance Logs', path: '/admin/logs/api' },
      ],
    },
    { id: 'notifications', label: 'Notifications', iconName: 'Bell', path: '/admin/notifications' },
  ],
  ACCOUNTS: [
    { id: 'acc-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/accounts/dashboard' },
    {
      id: 'wallet-management',
      label: 'Wallet Management',
      iconName: 'Wallet',
      path: '/admin/wallet-management',
    },
    { id: 'settlements', label: 'Settlements', iconName: 'Landmark', path: '/admin/settlements' },
    {
      id: 'logs-audit',
      label: 'Logs & Audit',
      iconName: 'ClipboardList',
      children: [
        { id: 'activity-logs', label: 'Activity Logs', path: '/admin/logs/activity' },
        { id: 'api-performance-logs', label: 'API Performance Logs', path: '/admin/logs/api' },
      ],
    },
    {
      id: 'invoices',
      label: 'Invoices & Tax',
      iconName: 'Receipt',
      children: [
        { id: 'invoices-list', label: 'Invoices', path: '/admin/invoices' },
        { id: 'tax-summary', label: 'GST & Tax Summary', path: '/admin/invoices/tax-summary' },
        { id: 'tds', label: 'TDS Management', path: '/admin/invoices/tds' },
      ],
    },
    {
      id: 'reports',
      label: 'Financial Reports',
      iconName: 'BarChart3',
      children: [
        { id: 'txn-report', label: 'Transaction Report', path: '/admin/reports/transactions' },
        { id: 'ledger-report', label: 'Ledger Report', path: '/admin/reports/ledger' },
        { id: 'settlement-report', label: 'Settlement Report', path: '/admin/reports/settlements' },
        { id: 'balance-report', label: 'Balance Report', path: '/admin/reports/balance' },
      ],
    },
  ],
  KYC: [
    { id: 'kyc-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/kyc/dashboard' },
    { id: 'kyc-desk', label: 'KYC & Onboarding Desk', iconName: 'ShieldCheck', path: '/admin/kyc' },
    { id: 'notifications', label: 'Notifications', iconName: 'Bell', path: '/admin/notifications' },
  ],
  SALES: [
    { id: 'sales-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/sales/dashboard' },
    {
      id: 'users',
      label: 'Network Users',
      iconName: 'Users',
      children: [
        { id: 'user-list', label: 'User List', path: '/admin/users' },
      ],
    },
    {
      id: 'reports',
      label: 'Sales Reports',
      iconName: 'BarChart3',
      children: [
        { id: 'txn-report', label: 'Transaction Growth', path: '/admin/reports/transactions' },
        { id: 'balance-report', label: 'Network Balance Summary', path: '/admin/reports/balance' },
      ],
    },
  ],
  SUPPORT: [
    { id: 'ops-dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', path: '/operations/dashboard' },
    { id: 'support-txns', label: 'Transactions Search', iconName: 'ArrowLeftRight', path: '/admin/transactions/search' },
    { id: 'support-chargebacks', label: 'Support Tickets / Disputes', iconName: 'RotateCcw', path: '/admin/chargebacks' },
    { id: 'notifications', label: 'Notifications', iconName: 'Bell', path: '/admin/notifications' },
  ],
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

