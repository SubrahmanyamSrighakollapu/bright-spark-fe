'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Percent, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface RetailerCommissionSummaryProps {
  commissionSummary: {
    todayCommission: number;
    yesterdayCommission: number;
    thisMonthCommission: number;
    previousMonthCommission: number;
    pendingCommission: number;
    creditedCommission: number;
  };
  planName?: string;
  isLoading?: boolean;
}

export const RetailerCommissionSummary: React.FC<RetailerCommissionSummaryProps> = ({
  commissionSummary,
  planName = 'Standard Plan',
  isLoading = false,
}) => {
  if (isLoading) {
    return <Card title="Commission Earnings"><div className="h-36 bg-slate-100 rounded-lg animate-pulse" /></Card>;
  }

  const { todayCommission, thisMonthCommission, creditedCommission } = commissionSummary;

  return (
    <Card
      title={
          <div className="flex items-center gap-2 min-w-0">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Commission Earnings</span>
          </div>
      }
      subtitle="Direct commission earnings credited to your wallet"
      action={
        <Link href="/retailer/commissions">
          <Button variant="ghost" size="sm" className="whitespace-nowrap" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View All
          </Button>
        </Link>
      }
      className="h-full"
    >
      <div className="space-y-4 pt-1 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-xl">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Today&apos;s Earned</span>
            <span className="block text-lg xl:text-xl font-extrabold text-emerald-700 font-mono tabular-nums truncate">
              +{formatCurrency(todayCommission)}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">This Month (MTD)</span>
            <span className="block text-lg xl:text-xl font-extrabold text-[var(--primary)] font-mono tabular-nums truncate">
              +{formatCurrency(thisMonthCommission)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100">
          <span className="text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Credited to Wallet:
          </span>
          <span className="font-mono font-bold text-slate-900 shrink-0">{formatCurrency(creditedCommission)}</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-500">
          <span>Growth Trend:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ↑ 12.4% MTD
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500">Commercial Plan:</span>
          <span className="font-bold text-[var(--primary)] text-right truncate" title={planName}>{planName}</span>
        </div>
      </div>
    </Card>
  );
};
