'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { walletService } from '@/services/walletService';
import { ledgerService } from '@/services/ledgerService';
import { WalletAccount, LedgerEntry } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

// Financial Foundation Components
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { FinancialEmptyState } from '@/components/features/financial/FinancialEmptyState';

import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  BookOpen,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function RetailerWalletPage() {
  const { session } = useAuth();

  const retailerId = session?.entityId || 'ret_001';

  // State
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [recentEntries, setRecentEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [wltRes, ledRes] = await Promise.all([
        walletService.getRetailerWallet(retailerId),
        ledgerService.getRetailerLedger(retailerId, {}, 1, 10),
      ]);

      if (wltRes.success && wltRes.data) {
        setWallet(wltRes.data);
      }
      if (ledRes.success && ledRes.data) {
        setRecentEntries(ledRes.data.items);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [retailerId]);

  const availableBalance = wallet?.availableBalance ?? 0;
  const holdBalance = wallet?.holdBalance ?? 0;
  const ledgerBalance = wallet?.ledgerBalance ?? (availableBalance + holdBalance);

  // Calculate activity totals from actual ledger items
  const totalCredits = recentEntries
    .filter((e) => e.direction === 'CREDIT')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebits = recentEntries
    .filter((e) => e.direction === 'DEBIT')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <PageContainer>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Retailer Operating Wallet"
          subtitle="Inspect your spendable wallet balance, reserved holds, and immutable ledger posting history."
          statusBadge={<StatusBadge status={wallet?.status || 'ACTIVE'} label={wallet?.status || 'Active Wallet'} />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWalletData}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          }
        />

        {/* Dominant Wallet Hero Surface (Light Blue Atmospheric Design) */}
        <div className="rounded-2xl border border-[#D4E1AE]/80 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 p-6 md:p-8 shadow-xs relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Primary Available Balance Hero */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2F6F5E]">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-[#2F6F5E] flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <span>RETAILER OPERATING WALLET</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold font-mono">
                  Spendable
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Available Balance</span>
                <div className="text-4xl md:text-5xl font-extrabold font-mono text-[#2F6F5E] tracking-tight">
                  {formatCurrency(availableBalance)}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Immediately spendable for customer Pay-Out disbursements & settlement
              </p>
            </div>

            {/* Contextual Wallet Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/retailer/pay-in">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-[#2F6F5E] hover:bg-[#1B4339] text-white font-bold px-5 shadow-xs"
                  leftIcon={<ArrowDownLeft className="w-4 h-4" />}
                >
                  Pay-In Collection
                </Button>
              </Link>

              <Link href="/retailer/pay-out">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-[#F97316] hover:bg-orange-600 text-white font-bold px-5 shadow-xs"
                  leftIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Pay-Out Disbursement
                </Button>
              </Link>

              <Link href="/retailer/wallet/ledger">
                <Button
                  variant="outline"
                  size="md"
                  className="bg-white hover:bg-slate-50 font-bold"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  View Full Ledger
                </Button>
              </Link>
            </div>
          </div>

          {/* Wallet Reconciliation Visibility Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-indigo-100/80">
            {/* Available Balance Tile */}
            <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Available Balance</span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Spendable
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-[#2F6F5E]">{formatCurrency(availableBalance)}</p>
            </div>

            {/* Hold Balance Tile */}
            <div className="p-4 rounded-xl bg-white border border-amber-200/80 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" /> Hold / Lien Balance
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Reserved
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-amber-700">{formatCurrency(holdBalance)}</p>
              <p className="text-[10px] text-slate-400">Reserved for pending disbursements</p>
            </div>

            {/* Total Ledger Balance Tile */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">Total Ledger Balance</span>
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  Available + Hold
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">{formatCurrency(ledgerBalance)}</p>
              <p className="text-[10px] text-slate-400">Total immutable posted accounting value</p>
            </div>
          </div>
        </div>

        {/* Recent Wallet Activity Ledger Preview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Wallet Activity</h2>
              <p className="text-xs text-slate-500">Immutable ledger postings and balance movements</p>
            </div>
            <Link href="/retailer/wallet/ledger">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Ledger Entries
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading ledger preview...</div>
            ) : recentEntries.length === 0 ? (
              <FinancialEmptyState
                title="No recent wallet activity"
                description="Wallet postings will appear here automatically when transactions or commissions are processed."
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date / Ledger ID</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Movement</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Credit / Debit</th>
                    <th className="py-3 px-4 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {recentEntries.map((e) => {
                    const entryType = (e as any).type || e.entryType || (e.direction === 'CREDIT' ? 'CREDIT' : 'DEBIT');
                    const isCredit = e.direction === 'CREDIT' || entryType === 'CREDIT' || entryType === 'RELEASE' || entryType === 'PAY_IN' || entryType === 'WALLET_CREDIT';
                    const formattedTxId = e.id && e.id.length > 20 ? `TX-${e.id.split('-').pop()?.toUpperCase()}` : e.id;
                    const refText = e.referenceId || (e as any).reference_id || e.transactionId || 'SYSTEM';
                    const desc = e.description || (e as any).narration || (entryType === 'HOLD' ? 'Security Hold on Wallet' : entryType === 'RELEASE' ? 'Release of Security Hold' : 'Wallet Adjustment');
                    const balanceAfter = (e as any).availableBalanceAfter ?? e.closingBalance ?? 0;

                    return (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block font-mono" title={e.id}>
                            {formattedTxId}
                          </span>
                          <span className="text-[11px] text-slate-400 font-sans">{formatDateTime(e.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {refText}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {entryType === 'HOLD' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              🔒 HOLD
                            </span>
                          ) : entryType === 'RELEASE' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-[#D4E1AE]">
                              🔓 RELEASE
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCredit
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {isCredit ? '↓ CREDIT' : '↑ DEBIT'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-600 truncate max-w-[200px]" title={desc}>
                          {desc}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                            {isCredit ? '+' : '-'}{formatCurrency(e.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(balanceAfter)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
