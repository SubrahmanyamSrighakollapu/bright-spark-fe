'use client';

import React from 'react';
import {
  Clock,
  RefreshCw,
  Store,
  Building2,
  Award,
  AlertTriangle,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { MemberType } from '@/components/features/users/AddMemberModal';
import { formatDateTime } from '@/utils/formatters';

export interface AdminHeroGreetingCardProps {
  adminName?: string;
  lastLoginAt?: string;
  onRefresh: () => void;
  isLoading?: boolean;
  pendingApprovalsCount: number;
  activeFilterCount?: number;
  onOpenAddMember: (role: MemberType) => void;
  onOpenFilterDrawer: () => void;
  onSelectTab?: (tab: 'PAY_IN' | 'PAY_OUT' | 'NETWORK_KYC') => void;
}

export const AdminHeroGreetingCard: React.FC<AdminHeroGreetingCardProps> = ({
  adminName = 'Admin',
  lastLoginAt,
  onRefresh,
  isLoading = false,
  pendingApprovalsCount,
  activeFilterCount = 0,
  onOpenAddMember,
  onOpenFilterDrawer,
  onSelectTab,
}) => {
  const lastLoginFormatted = formatDateTime(lastLoginAt);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_35px_-18px_rgba(15,23,42,0.28)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-100/55 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-50/80 blur-3xl" />
        <div className="h-1 w-full bg-gradient-to-r from-[#155EEF] via-indigo-500 to-sky-400" />

        <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#155EEF]">
              Admin workspace
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-[28px]">
              Welcome, {adminName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-[#64748B]">
              Here is today&apos;s transaction, wallet and network overview.
            </p>

            <div className="mt-5 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#155EEF] shadow-xs ring-1 ring-slate-200">
                <Clock className="h-4 w-4" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">Last login</span>
                <span className="mt-0.5 block truncate text-xs font-bold text-[#334155]">{lastLoginFormatted}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenFilterDrawer}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-xs transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#155EEF] cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#155EEF] text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-slate-200 bg-white p-2 text-[#64748B] shadow-xs transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#155EEF] cursor-pointer"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

            <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              onClick={() => onOpenAddMember('RETAILER')}
              className="flex items-center gap-1.5 rounded-lg bg-[#155EEF] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_6px_16px_-6px_rgba(21,94,239,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#1149B8] cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              + Add Retailer
            </button>

            <button
              type="button"
              onClick={() => onOpenAddMember('DISTRIBUTOR')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
              + Add Distributor
            </button>

            <button
              type="button"
              onClick={() => onOpenAddMember('MASTER_DISTRIBUTOR')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-[#64748B]" />
              + Add Master Dist
            </button>
          </div>
        </div>
      </div>

      {/* Compact Pending KYC Actionable Attention Chip */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingApprovalsCount} KYC applications</strong> require operational review and verification.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('NETWORK_KYC')}
            className="inline-flex items-center gap-1 text-amber-900 hover:text-amber-950 font-bold transition-colors cursor-pointer shrink-0"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
