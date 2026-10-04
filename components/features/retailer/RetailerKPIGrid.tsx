'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { RetailerDashboardSummary } from '@/services/retailerDashboardService';

interface RetailerKPIGridProps {
  summary: RetailerDashboardSummary;
  isLoading?: boolean;
}

export const RetailerKPIGrid: React.FC<RetailerKPIGridProps> = ({ summary, isLoading = false }) => {
  const { transactionSummary } = summary;

  if (isLoading) {
    return <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />;
  }

  const totalVolume = transactionSummary.todayPayInVolume + transactionSummary.todayPayOutVolume;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[11px]">
            Today&apos;s Business Summary
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 w-full sm:w-auto">
          {/* Total Transactions */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <span className="text-slate-500 font-medium">Transactions:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatNumber(transactionSummary.todayCount)}
            </span>
          </div>

          {/* Combined Volume */}
          <div className="flex items-center gap-2 sm:pl-6 pt-2 sm:pt-0">
            <span className="text-slate-500 font-medium">Turnover Volume:</span>
            <span className="font-mono font-bold text-[var(--primary)] tabular-nums">
              {formatCurrency(totalVolume)}
            </span>
          </div>

          {/* Successful Count */}
          <div className="flex items-center gap-2 sm:pl-6 pt-2 sm:pt-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 font-medium">Successful:</span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              {transactionSummary.successfulCount} ({transactionSummary.successRate}%)
            </span>
          </div>

          {/* Failed Count */}
          <div className="flex items-center gap-2 sm:pl-6 pt-2 sm:pt-0">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="text-slate-500 font-medium">Failed:</span>
            <span className="font-mono font-bold text-rose-700 tabular-nums">
              {transactionSummary.failedCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
