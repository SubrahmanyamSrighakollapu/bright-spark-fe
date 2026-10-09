'use client';

import React from 'react';
import Link from 'next/link';
import { WalletAccount, RetailerPlan } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wallet, ArrowDownLeft, ArrowUpRight, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface RetailerWalletHeroProps {
  wallet: WalletAccount;
  plan?: RetailerPlan | null;
  retailerName?: string;
  retailerCode?: string;
  kycStatus?: string;
  isLoading?: boolean;
}

export const RetailerWalletHero: React.FC<RetailerWalletHeroProps> = ({
  wallet,
  plan,
  retailerName,
  retailerCode,
  kycStatus = 'APPROVED',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6 shadow-xs animate-pulse">
        <div className="h-24 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  const availableBalance = wallet?.availableBalance ?? 0;
  const holdBalance = wallet?.holdBalance ?? 1000;
  const ledgerBalance = wallet?.ledgerBalance ?? (availableBalance + holdBalance);

  const planName = plan?.name || 'Standard Retailer Plan';
  const payinRules = plan?.commissionRules?.filter((r) => r.serviceType === 'PAY_IN') || [];
  const payoutRules = plan?.commissionRules?.filter((r) => r.serviceType === 'PAY_OUT') || [];

  const payInFee = payinRules.length > 0
    ? payinRules.map((r) => r.commissionType === 'PERCENTAGE' ? `${r.value}%` : `₹${r.value}`).join(', ')
    : '0.25%';

  const payOutFee = payoutRules.length > 0
    ? payoutRules.map((r) => r.commissionType === 'PERCENTAGE' ? `${r.value}%` : `₹${r.value.toFixed(2)} Fixed`).join(', ')
    : '₹3.50 Fixed';

  return (
    <div
      className="border border-[#E5EBF2] rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden space-y-6"
      style={{
        background: 'linear-gradient(120deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.97) 55%, rgba(255, 247, 237, 0.75))',
      }}
    >
      {/* Top Refined Brand Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary)] via-blue-500 to-[var(--secondary)]" />

      {/* Top Header Row: Retailer Store Identity & KYC Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[var(--primary)] font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
            <Wallet className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                {retailerName || 'Metro Store #01'}
              </h2>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                {retailerCode || 'RET001'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span className="font-extrabold">
                <span className="text-[var(--primary)]">Small Payments.</span>{' '}
                <span className="text-[var(--secondary)]">Bigger Possibilities.</span>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active Counter
              </span>
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <StatusBadge status={kycStatus} label={`KYC ${kycStatus}`} size="md" />
        </div>
      </div>

      {/* Middle Financial Hero Balance Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Available Operating Balance
          </span>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Ready for Instant Payout
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--primary)] font-mono tabular-nums tracking-tight">
            {formatCurrency(availableBalance)}
          </h1>
        </div>
      </div>

      {/* Sub-Metrics Breakdown Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Available Balance</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(availableBalance)}</span>
        </div>
        <div className="space-y-0.5 sm:border-l sm:border-slate-200/80 sm:pl-4">
          <span className="text-[10px] text-amber-700 uppercase font-bold block">On Hold / Lien</span>
          <span className="font-mono font-bold text-amber-800 text-sm">{formatCurrency(holdBalance)}</span>
        </div>
        <div className="space-y-0.5 sm:border-l sm:border-slate-200/80 sm:pl-4">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Ledger Balance</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(ledgerBalance)}</span>
        </div>
      </div>

      {/* Embedded Action CTAs Row */}
      <div className="flex items-center gap-3 flex-wrap pt-1">
        <Link href="/retailer/pay-in">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowDownLeft className="w-4 h-4 text-white" />}
            className="shadow-xs font-bold px-5"
          >
            Pay-In (Collection)
          </Button>
        </Link>

        <Link href="/retailer/pay-out">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ArrowUpRight className="w-4 h-4 text-[var(--secondary)]" />}
            className="border-[var(--secondary)]/40 hover:bg-orange-50 text-slate-900 font-bold px-5"
          >
            Pay-Out (Disbursement)
          </Button>
        </Link>

        <Link href="/retailer/wallet/ledger">
          <Button
            variant="outline"
            size="md"
            leftIcon={<FileText className="w-4 h-4 text-slate-500" />}
            className="text-slate-700 font-medium"
          >
            View Statement
          </Button>
        </Link>
      </div>

      {/* Hero Footer: Plan Info & Active State */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--secondary)]" />
          <span>Assigned Plan: <strong className="text-[var(--primary)] font-bold">{planName}</strong></span>
          <span className="text-slate-400 font-mono text-[11px]">(Pay-In: {payInFee} • Pay-Out: {payOutFee})</span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};
