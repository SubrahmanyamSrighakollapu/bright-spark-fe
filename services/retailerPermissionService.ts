export type RetailerModulePermission =
  | 'aeps'
  | 'pay-in'
  | 'pay-out'
  | 'transactions'
  | 'wallet-ledger'
  | 'commissions'
  | 'reports'
  | 'notifications'
  | 'profile';

const STORAGE_KEY = 'bright-spark-retailer-module-permissions';
const AEPS_MIGRATION_KEY = 'bright-spark-retailer-aeps-permission-migrated';

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
    const stored = readAll()[retailerId];
    if (!stored) return defaults;
    const migrationKey = `${AEPS_MIGRATION_KEY}:${retailerId}`;
    if (typeof window !== 'undefined' && !localStorage.getItem(migrationKey)) {
      const migrated: RetailerModulePermission[] = stored.includes('aeps') ? stored : ['aeps', ...stored];
      const settings = readAll();
      settings[retailerId] = migrated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      localStorage.setItem(migrationKey, '1');
      return migrated;
    }
    return stored;
  },

  saveEnabledModules(retailerId: string, permissions: RetailerModulePermission[]): void {
    if (typeof window === 'undefined') return;
    const settings = readAll();
    settings[retailerId] = permissions;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },

  canAccessNavigationItem(retailerId: string, navigationId: string): boolean {
    const navigationPermissionMap: Partial<Record<string, RetailerModulePermission>> = {
      'ret-aeps': 'aeps',
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
    const defaults: RetailerModulePermission[] = ['aeps', 'pay-in', 'pay-out', 'transactions', 'wallet-ledger', 'commissions', 'reports', 'notifications', 'profile'];
    return this.getEnabledModules(retailerId, defaults).includes(requiredPermission);
  },
};
