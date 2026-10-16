'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import { UserContext, UserRole, MOCK_CURRENT_USER, USER_ROLE_LABELS } from '@/config/roles';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChangePasswordModal } from '@/components/features/auth/ChangePasswordModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export interface UserMenuProps {
  currentUser?: UserContext;
  onRoleChange?: (newRole: UserRole) => void;
}

const DISPLAYED_DEV_ROLES: UserRole[] = [
  'SALES',
  'KYC',
  'ACCOUNTS',
  'OPERATIONS',
  'SUPPORT',
  'MERCHANT',
];

export const UserMenu: React.FC<UserMenuProps> = ({
  currentUser = MOCK_CURRENT_USER,
  onRoleChange,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toastSuccess } = useToast();

  const profilePath = currentUser.role === 'DISTRIBUTOR'
    ? '/distributor/profile'
    : currentUser.role === 'MASTER_DISTRIBUTOR'
    ? '/master-distributor/profile'
    : currentUser.role === 'RETAILER'
    ? '/retailer/profile'
    : null;

  useEffect(() => {
    setImageError(false);
  }, [currentUser?.profilePhotoUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toastSuccess('Signed out successfully.');
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
        aria-label="User menu"
      >
        {currentUser.profilePhotoUrl && !imageError ? (
          <img
            src={currentUser.profilePhotoUrl}
            alt={currentUser.name}
            onError={() => setImageError(true)}
            className="w-8 h-8 rounded-full object-cover shadow-xs shrink-0 ring-2 ring-indigo-500/20 border border-indigo-100"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
            {currentUser.name}
          </span>
          <span className="text-[10px] font-bold text-[var(--primary)] tracking-wide">
            {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
          </span>
        </div>

        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* User Header Info */}
          <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-center gap-3">
            {currentUser.profilePhotoUrl && !imageError ? (
              <img
                src={currentUser.profilePhotoUrl}
                alt={currentUser.name}
                onError={() => setImageError(true)}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0 border border-indigo-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <div className="font-semibold text-xs text-[var(--text-primary)] truncate">{currentUser.name}</div>
              <div className="text-[11px] text-[var(--text-muted)] truncate">{currentUser.email}</div>
              <div className="pt-0.5">
                <StatusBadge status="ACTIVE" label={USER_ROLE_LABELS[currentUser.role] || currentUser.role} size="sm" />
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="py-1 text-xs text-[var(--text-secondary)]">
            {profilePath && <button
              type="button"
              onClick={() => {
                router.push(profilePath);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-[var(--text-muted)]" />
              <span>My Profile</span>
            </button>}

            <button
              type="button"
              onClick={() => {
                setShowChangePassword(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Change Password</span>
            </button>

          </div>

          {/* Logout Button */}
          <div className="border-t border-[var(--border-subtle)] p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setShowLogoutConfirmation(true); }}
              className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-rose-700 font-semibold hover:bg-rose-100/60 rounded-md transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => toastSuccess('Password changed successfully.')}
      />
      <ConfirmationDialog
        isOpen={showLogoutConfirmation}
        onCancel={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogout}
        title="Sign out of Qin Star Pay?"
        message="You will need to sign in again to access your account."
        confirmText="Sign Out"
        variant="danger"
      />
    </div>
  );
};
