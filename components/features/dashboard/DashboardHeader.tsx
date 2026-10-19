'use client';

import React from 'react';
import { RefreshCw, Clock, ShieldCheck, Clock3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/formatters';

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  lastRefreshedAt: string;
  onRefresh: () => void;
  isLoading?: boolean;
  networkCount?: number;
  pendingApprovalsCount?: number;
  todayTxnCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = 'Operations Command Center',
  subtitle = 'Platform Governance, Financial Operations & Network Control',
  lastRefreshedAt,
  onRefresh,
  isLoading = false,
  networkCount,
  pendingApprovalsCount,
  todayTxnCount,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--primary)] text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-[#D4E1AE]/60 px-2 py-0.5 rounded-full">
                Bright Spark Admin
              </span>
              <span className="text-xs text-slate-500 font-medium">Platform Administrator</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {title}
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium pl-10">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        {networkCount !== undefined && (
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-semibold">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Entities: <strong className="text-slate-900">{networkCount}</strong></span>
          </div>
        )}

        {pendingApprovalsCount !== undefined && (
          <div className="hidden sm:flex items-center gap-2 text-xs bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-800 font-semibold">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Approvals: <strong className="text-amber-900">{pendingApprovalsCount}</strong></span>
          </div>
        )}

        {todayTxnCount !== undefined && (
          <div className="hidden sm:flex items-center gap-2 text-xs bg-blue-50/80 border border-blue-200 px-3 py-1.5 rounded-xl text-blue-800 font-semibold">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Today Txns: <strong className="text-blue-900">{todayTxnCount}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Refreshed: <strong>{formatDateTime(lastRefreshedAt)}</strong></span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

