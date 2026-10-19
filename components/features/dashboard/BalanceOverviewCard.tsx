'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LockKeyhole, WalletCards } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BalanceOverview } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

export interface BalanceOverviewCardProps {
  balance: BalanceOverview;
}

export const BalanceOverviewCard: React.FC<BalanceOverviewCardProps> = ({ balance }) => {
  const managedFunds = balance.availableBalance + balance.holdBalance;
  const availablePercentage = managedFunds > 0
    ? Math.min(100, Math.max(0, (balance.availableBalance / managedFunds) * 100))
    : 0;
  const holdPercentage = 100 - availablePercentage;

  return (
    <Card
      title="Balance Overview"
      subtitle="Current wallet liquidity and reserved-fund position"
      action={
        <Link href="/admin/wallet/balances">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Manage Wallet
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 text-xs lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-semibold">Available Balance</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#2F6F5E] ring-1 ring-blue-100">
                <WalletCards className="h-4 w-4" />
              </span>
            </div>
            <div className="text-lg font-extrabold text-[var(--primary)] font-mono tabular-nums">
              {formatCurrency(balance.availableBalance)}
            </div>
            <p className="text-[11px] font-medium text-blue-700">Immediately available for wallet operations</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-semibold">Lien / Hold Reserve</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                <LockKeyhole className="h-4 w-4" />
              </span>
            </div>
            <div className="text-lg font-bold text-slate-800 font-mono tabular-nums">
              {formatCurrency(balance.holdBalance)}
            </div>
            <p className="text-[11px] font-medium text-slate-500">Protected funds unavailable for new debits</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5EAF1] bg-white p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-bold text-[#0F172A]">Funds Availability</span>
              <p className="mt-1 text-[11px] text-[#64748B]">Share of managed wallet funds ready for use</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Healthy
            </span>
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <span className="font-mono text-2xl font-extrabold text-[#0F172A]">{availablePercentage.toFixed(1)}%</span>
              <span className="text-[11px] font-semibold text-[#64748B]">Managed: {formatCurrency(managedFunds, { compact: true })}</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${availablePercentage.toFixed(1)} percent available and ${holdPercentage.toFixed(1)} percent held`}>
              <div className="h-full bg-[#2F6F5E]" style={{ width: `${availablePercentage}%` }} />
              <div className="h-full bg-slate-400" style={{ width: `${holdPercentage}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2F6F5E]" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Available</span>
                <span className="font-bold text-[#334155]">{availablePercentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Reserved</span>
                <span className="font-bold text-[#334155]">{holdPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
