'use client';

import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { walletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/formatters';
import { getBreadcrumbsForPath } from '@/utils/breadcrumbs';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { UserContext, UserRole } from '@/config/roles';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuth } from '@/context/AuthContext';

export interface HeaderProps {
  onToggleSidebar: () => void;
  currentUser: UserContext;
  onRoleChange: (newRole: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentUser,
  onRoleChange,
}) => {
  const pathname = usePathname();
  const { session } = useAuth();
  const [balance, setBalance] = useState<number | null>(9953681.66);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  const breadcrumbs = getBreadcrumbsForPath(pathname || '/dashboard');
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  const loadBalance = async () => {
    try {
      if (session?.role === 'RETAILER' && session.entityId) {
        const res = await walletService.getRetailerWallet(session.entityId);
        if (res.success && res.data) {
          setBalance(res.data.availableBalance);
          return;
        }
      } else if (session?.role === 'DISTRIBUTOR' && session.entityId) {
        const res = await walletService.getDistributorWallet(session.entityId);
        if (res.success && res.data) {
          setBalance(res.data.availableBalance);
          return;
        }
      } else if (session?.role === 'MASTER_DISTRIBUTOR' && session.entityId) {
        const res = await walletService.getMasterDistributorWallet(session.entityId);
        if (res.success && res.data) {
          setBalance(res.data.availableBalance);
          return;
        }
      }
      const res = await walletService.getBalance();
      if (res.success && res.data) {
        setBalance(res.data.availableBalance);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadBalance();
  }, [session]);

  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true);
    await loadBalance();
    setTimeout(() => setIsRefreshingBalance(false), 300);
  };

  return (
    <header className="h-[68px] bg-white border-b border-[#E5EAF1] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-none">
      {/* Left Area: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbs} showHomeIcon={false} />
          </div>
          <h1 className="text-sm font-semibold text-slate-900 leading-tight tracking-tight truncate md:hidden">
            {currentPageTitle}
          </h1>
        </div>
      </div>

      {/* Right Area: Wallet Balance (for Wallet Roles), Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Wallet Balance Indicator for Wallet Roles */}
        {(session?.role === 'RETAILER' || session?.role === 'DISTRIBUTOR' || session?.role === 'MASTER_DISTRIBUTOR') && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs">
            <Wallet className="w-4 h-4 text-[#155EEF] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 leading-none">
                Wallet Balance
              </span>
              <span className="font-mono font-bold text-xs text-[#155EEF] tabular-nums leading-tight">
                {formatCurrency(balance)}
              </span>
            </div>

            <Tooltip content="Refresh Balance">
              <button
                type="button"
                onClick={handleRefreshBalance}
                disabled={isRefreshingBalance}
                className="p-1 text-blue-700 hover:text-blue-900 rounded transition-colors cursor-pointer ml-1"
                aria-label="Refresh balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Notifications Menu */}
        <NotificationMenu />

        {/* User Menu */}
        <UserMenu currentUser={currentUser} onRoleChange={onRoleChange} />
      </div>
    </header>
  );
};
