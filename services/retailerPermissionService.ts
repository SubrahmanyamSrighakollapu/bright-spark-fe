export type RetailerModulePermission =
  | 'pay-in'
  | 'pay-out'
  | 'transactions'
  | 'wallet-ledger'
  | 'commissions'
  | 'reports'
  | 'notifications'
  | 'profile';

const STORAGE_KEY = 'qin-star-pay-retailer-module-permissions';

function readAll(): Record<string, RetailerModulePermission[]> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export const retailerPermissionService = {
  getEnabledModules(retailerId: string, defaults: RetailerModulePermission[]): RetailerModulePermission[] {
    return readAll()[retailerId] || defaults;
  },

  saveEnabledModules(retailerId: string, permissions: RetailerModulePermission[]): void {
    if (typeof window === 'undefined') return;
    const settings = readAll();
    settings[retailerId] = permissions;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },

  canAccessNavigationItem(retailerId: string, navigationId: string): boolean {
    const navigationPermissionMap: Partial<Record<string, RetailerModulePermission>> = {
      'ret-payin': 'pay-in',
      'ret-payout': 'pay-out',
      'ret-transactions': 'transactions',
      'ret-wallet': 'wallet-ledger',
      'ret-wallet-overview': 'wallet-ledger',
      'ret-wallet-ledger': 'wallet-ledger',
      'ret-commissions': 'commissions',
      'ret-reports': 'reports',
      'ret-notifications': 'notifications',
      'ret-profile': 'profile',
    };
    const requiredPermission = navigationPermissionMap[navigationId];
    if (!requiredPermission) return true;
    const defaults: RetailerModulePermission[] = ['pay-in', 'pay-out', 'transactions', 'wallet-ledger', 'commissions', 'reports', 'notifications', 'profile'];
    return this.getEnabledModules(retailerId, defaults).includes(requiredPermission);
  },
};
