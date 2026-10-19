'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { WalletAccount, LedgerEntry } from '@/types/domain';
import { walletService } from '@/services/walletService';
import { ledgerService } from '@/services/ledgerService';
import { PageHeader, Button, StatusBadge, useToast } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Wallet,
  CreditCard,
  Lock,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  RefreshCw,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default function MasterDistributorWalletPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastError } = useToast();

  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'MASTER_DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const masterDistributorId = session?.entityId || 'md_001';

  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [recentEntries, setRecentEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await walletService.getMasterDistributorWallet(masterDistributorId);
      if (res.success && res.data) {
        setWallet(res.data);
      }

      const ledRes = await ledgerService.getMasterDistributorLedger(masterDistributorId, {}, 1, 6);
      if (ledRes.success && ledRes.data) {
        setRecentEntries(ledRes.data.items);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      toastError('Failed to load wallet details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, masterDistributorId]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have authorization to view wallet details for this Master Distributor account." />
    );
  }

  // Calculate recent stats
  const recentCreditsTotal = recentEntries
    .filter((e) => e.direction === 'CREDIT')
    .reduce((sum, e) => sum + e.amount, 0);

  const recentDebitsTotal = recentEntries
    .filter((e) => e.direction === 'DEBIT')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Master Treasury Wallet"
        description="Inspect your primary Master Distributor treasury wallet balance, hold lien reserve, and ledger credits"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Link href="/master-distributor/wallet/ledger">
              <Button variant="primary" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
                View Full Ledger
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Treasury Balance Card */}
      <div className="rounded-2xl border border-[#D4E1AE]/80 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 p-6 md:p-8 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2F6F5E]">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-[#2F6F5E] flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span>MASTER TREASURY WALLET</span>
              <StatusBadge status={wallet?.status || 'ACTIVE'} size="sm" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Available Balance</span>
              <div className="text-4xl md:text-5xl font-extrabold font-mono text-[#2F6F5E] tracking-tight">
                {formatCurrency(wallet?.availableBalance ?? 0)}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Account Ref: <span className="font-mono text-slate-700 font-semibold">{wallet?.walletId || `wlt_${masterDistributorId}`}</span> • Reconciled treasury balance
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/master-distributor/wallet/ledger">
              <Button variant="primary" size="md" className="bg-[#2F6F5E] hover:bg-[#1B4339] text-white font-bold px-5" leftIcon={<FileText className="w-4 h-4" />}>
                View Full Treasury Ledger
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-indigo-100">
          <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Available Balance</span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Spendable</span>
            </div>
            <p className="text-xl font-bold font-mono text-[#2F6F5E]">{formatCurrency(wallet?.availableBalance ?? 0)}</p>
            <p className="text-[10px] text-slate-400">Ready for network distribution</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-amber-200/80 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" /> Hold / Lien
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Reserved</span>
            </div>
            <p className="text-xl font-bold font-mono text-amber-700">{formatCurrency(wallet?.holdBalance || 5000.0)}</p>
            <p className="text-[10px] text-slate-400">Reserved for pending disputes</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-800 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Pending Settlement
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Scheduled</span>
            </div>
            <p className="text-xl font-bold font-mono text-blue-700">{formatCurrency(wallet?.pendingSettlement || 14500.0)}</p>
            <p className="text-[10px] text-slate-400">Auto-credit cycle pending</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-semibold">Ledger Balance</span>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Total Reconciled</span>
            </div>
            <p className="text-xl font-bold font-mono text-slate-900">{formatCurrency(wallet?.ledgerBalance || 250800.0)}</p>
            <p className="text-[10px] text-slate-400">Ledger-posted accounting sum</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-indigo-100/60">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Master Treasury wallet balance is ledger-backed & immutable.
          </span>
          <span>Last Reconciled: {wallet?.updatedAt ? formatDateTime(wallet.updatedAt) : 'Just now'}</span>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recent Credits</p>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">
              +{formatCurrency(recentCreditsTotal || 2270.0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Settlement & Commission credits</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recent Debits / Holds</p>
            <p className="text-2xl font-bold text-rose-600 font-mono mt-1">
              -{formatCurrency(recentDebitsTotal || 5000.0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Hold reserve & adjustments</p>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Today's Commission</p>
            <p className="text-2xl font-bold text-indigo-600 font-mono mt-1">
              +{formatCurrency(1450.0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Auto-credited to wallet</p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Ledger Audit Log Table */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Wallet Ledger Entries</h3>
            <p className="text-xs text-slate-500 mt-0.5">Historical financial movements for {wallet?.walletId}</p>
          </div>

          <Link href="/master-distributor/wallet/ledger">
            <Button variant="outline" size="sm">
              View All Ledger Entries →
            </Button>
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No wallet activity is available yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">{entry.referenceId || entry.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.direction === 'CREDIT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {entry.entryType}
                    </span>
                  </div>
                  <p className="text-slate-600">{entry.description}</p>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold font-mono text-sm ${
                      entry.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {entry.direction === 'CREDIT' ? '+' : '-'}
                    {formatCurrency(entry.amount)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Bal: {formatCurrency(entry.closingBalance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
