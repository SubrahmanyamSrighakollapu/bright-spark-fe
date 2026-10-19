'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronsLeft, ChevronsRight, Shield, LogOut, ArrowRight, HelpCircle } from 'lucide-react';
import { filterNavigationByRole, getNavigationForRole, NavigationItem } from '@/config/navigation';
import { UserContext } from '@/config/roles';
import { SidebarItem } from './SidebarItem';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { retailerPermissionService } from '@/services/retailerPermissionService';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: UserContext;
  onNavigate?: () => void;
  className?: string;
}

function getCategoryForNavItem(id: string): string | null {
  if (id === 'dashboard' || id === 'md-dashboard' || id === 'dst-dashboard' || id === 'ret-dashboard') return 'MAIN';
  if (id === 'transactions' || id === 'users' || id === 'employees' || id === 'kyc' || id === 'help-desk-admin' || id === 'ops-help-desk' || id === 'ret-bbps' || id === 'ret-aeps' || id === 'ret-payin' || id === 'ret-qr-payin' || id === 'ret-payment-links' || id === 'ret-payout' || id === 'ret-transactions' || id === 'md-distributors' || id === 'md-retailers' || id === 'dst-retailers' || id === 'md-kyc-documents' || id === 'dst-kyc-documents') return 'OPERATIONS';
  if (id === 'wallet' || id === 'wallet-management' || id === 'topup-approvals' || id === 'settlements' || id === 'reports' || id === 'chargebacks' || id === 'invoices' || id === 'ret-topup' || id === 'md-wallet' || id === 'dst-wallet' || id === 'ret-wallet' || id === 'md-commissions' || id === 'dst-commissions' || id === 'ret-commissions' || id === 'md-reports' || id === 'dst-reports' || id === 'ret-reports') return 'FINANCE';
  if (id === 'notifications' || id === 'md-notifications' || id === 'dst-notifications' || id === 'ret-notifications') return 'COMMUNICATIONS';
  if (id === 'integrations' || id === 'administration' || id === 'website') return 'SYSTEM';
  if (id === 'md-profile' || id === 'dst-profile' || id === 'ret-profile') return 'ACCOUNT';
  return null;
}

const ADMIN_CATEGORY_ORDER: Record<string, number> = {
  MAIN: 0,
  OPERATIONS: 1,
  FINANCE: 2,
  COMMUNICATIONS: 3,
  SYSTEM: 4,
  ACCOUNT: 5,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  currentUser,
  onNavigate,
  className,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [currentUser?.profilePhotoUrl]);

  const baseNav = getNavigationForRole(currentUser.role);
  const roleFilteredItems = filterNavigationByRole(baseNav, currentUser);
  const navItems = currentUser.role === 'RETAILER' && currentUser.entityId
    ? roleFilteredItems
        .filter((item) => retailerPermissionService.canAccessNavigationItem(currentUser.entityId!, item.id))
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => retailerPermissionService.canAccessNavigationItem(currentUser.entityId!, child.id)),
        }))
    : roleFilteredItems;

  // Keep the administrator menu in coherent, non-repeating sections while
  // retaining the configured order inside each section.
  const displayedNavItems = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'
    ? navItems
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
          const aOrder = ADMIN_CATEGORY_ORDER[getCategoryForNavItem(a.item.id) || 'ACCOUNT'] ?? 99;
          const bOrder = ADMIN_CATEGORY_ORDER[getCategoryForNavItem(b.item.id) || 'ACCOUNT'] ?? 99;
          return aOrder - bOrder || a.index - b.index;
        })
        .map(({ item }) => item)
    : navItems;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { toastSuccess } = useToast();

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toastSuccess('Signed out successfully.');
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'bg-white text-slate-800 h-screen flex flex-col transition-all duration-200 z-40 border-r border-[#E5EAF1] shadow-none shrink-0 overflow-hidden select-none',
        isCollapsed ? 'w-[72px]' : 'w-[260px]',
        className
      )}
    >
      {/* Brand Header with Compact Branding */}
      <div className="h-[68px] px-4 border-b border-[#E5EAF1] flex items-center justify-between shrink-0 bg-white">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 overflow-hidden cursor-pointer group py-1',
            isCollapsed ? 'mx-auto justify-center' : ''
          )}
        >
          <div className={cn('h-10 overflow-hidden rounded-lg bg-white flex items-center shrink-0 transition-all duration-200', isCollapsed ? 'w-10' : 'w-[190px]')}>
            <Image
              src="/bright-spark-logo.jpg"
              alt="Bright Spark Innovations Pvt Ltd"
              width={1237}
              height={312}
              className={cn('h-full max-w-none', isCollapsed ? 'w-[158px] object-cover object-left' : 'w-full object-contain')}
              priority
            />
          </div>
        </Link>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand Button for Collapsed Mode */}
      {isCollapsed && (
        <div className="hidden md:flex justify-center py-2 border-b border-[#E5EAF1] bg-slate-50/50">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation List with Category Headings */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
        {displayedNavItems.map((item: NavigationItem, index: number) => {
          const category = getCategoryForNavItem(item.id);
          const prevCategory = index > 0 ? getCategoryForNavItem(displayedNavItems[index - 1].id) : null;
          const showCategoryHeader = !isCollapsed && category && category !== prevCategory;

          return (
            <React.Fragment key={item.id}>
              {showCategoryHeader && (
                <div className="px-3 pt-4 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase select-none">
                  {category}
                </div>
              )}
              <SidebarItem
                item={item}
                isCollapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            </React.Fragment>
          );
        })}
      </div>



      {/* User Profile Block at Bottom */}
      <div className="p-3 border-t border-[#E5EAF1] bg-white shrink-0">
        <div className={cn('flex items-center gap-2.5', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser.profilePhotoUrl && !imageError ? (
              <img
                src={currentUser.profilePhotoUrl}
                alt={currentUser.name}
                onError={() => setImageError(true)}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-blue-200 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2F6F5E] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                <Shield className="w-4 h-4 text-[#2F6F5E]" />
              </div>
            )}

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 truncate">
                <span className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 tracking-wider">
                  {currentUser.role}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        title="Sign Out of Bright Spark?"
        message="Are you sure you want to sign out of your session? Unsaved changes will be discarded."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="warning"
      />
    </aside>
  );
};
