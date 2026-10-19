'use client';

import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Wallet, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { session } = useAuth();
  const [walletInfo, setWalletInfo] = useState<{ available: number; hold: number; ledger: number } | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  const breadcrumbs = getBreadcrumbsForPath(pathname || '/dashboard');
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  const loadBalance = async () => {
    try {
      if (session?.role === 'RETAILER' && session.entityId) {
        const res = await walletService.getRetailerWallet(session.entityId);
        if (res.success && res.data) {
          setWalletInfo({
            available: res.data.availableBalance,
            hold: res.data.holdBalance,
            ledger: res.data.ledgerBalance,
          });
          return;
        }
      } else if (session?.role === 'DISTRIBUTOR' && session.entityId) {
        const res = await walletService.getDistributorWallet(session.entityId);
        if (res.success && res.data) {
          setWalletInfo({
            available: res.data.availableBalance,
            hold: res.data.holdBalance,
            ledger: res.data.ledgerBalance,
          });
          return;
        }
      } else if (session?.role === 'MASTER_DISTRIBUTOR' && session.entityId) {
        const res = await walletService.getMasterDistributorWallet(session.entityId);
        if (res.success && res.data) {
          setWalletInfo({
            available: res.data.availableBalance,
            hold: res.data.holdBalance,
            ledger: res.data.ledgerBalance,
          });
          return;
        }
      }
      const res = await walletService.getBalance();
      if (res.success && res.data) {
        const d = res.data as any;
        setWalletInfo({
          available: d.availableBalance || 0,
          hold: d.holdBalance ?? d.lienAmount ?? 0,
          ledger: d.ledgerBalance ?? ((d.availableBalance || 0) + (d.holdBalance ?? d.lienAmount ?? 0)),
        });
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadBalance();
  }, [session]);

  useEffect(() => {
    const refreshOnFocus = () => void loadBalance();
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [session]);

  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true);
    await loadBalance();
    setTimeout(() => setIsRefreshingBalance(false), 300);
  };

  const walletPath = session?.role === 'RETAILER'
    ? '/retailer/wallet'
    : session?.role === 'DISTRIBUTOR'
    ? '/distributor/wallet'
    : session?.role === 'MASTER_DISTRIBUTOR'
    ? '/master-distributor/wallet'
    : null;

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
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs">
            <Wallet className="w-4 h-4 text-[#2F6F5E] shrink-0" />
            <button type="button" onClick={() => walletPath && router.push(walletPath)} className="flex items-center gap-3 text-left cursor-pointer" aria-label="Open wallet">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">
                  Available Balance
                </span>
                <span className="font-mono font-bold text-xs text-[#2F6F5E] tabular-nums leading-tight">
                  {formatCurrency(walletInfo?.available ?? 0)}
                </span>
              </div>

              {Boolean(walletInfo?.hold && walletInfo.hold > 0) && (
                <Tooltip content={`₹${walletInfo?.hold} is currently on Security Hold / Lien by Admin. Total Ledger Balance: ₹${walletInfo?.ledger}`}>
                  <div className="flex flex-col border-l border-amber-200 pl-2.5">
                    <span className="text-[9px] uppercase font-extrabold text-amber-800 leading-none flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5 text-amber-600" /> Hold
                    </span>
                    <span className="font-mono font-bold text-xs text-amber-700 tabular-nums leading-tight">
                      {formatCurrency(walletInfo?.hold)}
                    </span>
                  </div>
                </Tooltip>
              )}
            </button>

            <Tooltip content="Refresh Balance">
              <button
                type="button"
                onClick={handleRefreshBalance}
                disabled={isRefreshingBalance}
                className="p-1 text-blue-700 hover:text-[#25594C] rounded transition-colors cursor-pointer ml-1"
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
