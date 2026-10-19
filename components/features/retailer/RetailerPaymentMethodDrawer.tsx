'use client';

import React, { useState, useMemo } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Transaction } from '@/types/domain';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  BarChart3,
  Layers,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface RetailerPaymentMethodDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'PAY_IN' | 'PAY_OUT';
  periodLabel: string;
  transactions: Transaction[];
}

interface MethodStat {
  mode: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  totalCount: number;
  totalAmount: number;
  sharePercent: number;
  successCount: number;
  successAmount: number;
  pendingCount: number;
  pendingAmount: number;
  failedCount: number;
  failedAmount: number;
  successRate: number;
}

const METHOD_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  UPI: { label: 'UPI Collect & VPA', icon: <Zap className="w-4 h-4 text-amber-500" />, color: '#F59E0B' },
  QR: { label: 'Dynamic QR Code', icon: <QrCode className="w-4 h-4 text-blue-500" />, color: '#3B82F6' },
  CARD: { label: 'Debit & Credit Cards', icon: <CreditCard className="w-4 h-4 text-indigo-500" />, color: '#6366F1' },
  NET_BANKING: { label: 'Net Banking', icon: <Building2 className="w-4 h-4 text-emerald-500" />, color: '#10B981' },
  IMPS: { label: 'IMPS Instant Direct', icon: <Zap className="w-4 h-4 text-orange-500" />, color: '#F97316' },
  NEFT: { label: 'NEFT National Transfer', icon: <Building2 className="w-4 h-4 text-cyan-500" />, color: '#06B6D4' },
  RTGS: { label: 'RTGS High Value', icon: <Building2 className="w-4 h-4 text-purple-500" />, color: '#A855F7' },
};

export const RetailerPaymentMethodDrawer: React.FC<RetailerPaymentMethodDrawerProps> = ({
  isOpen,
  onClose,
  type,
  periodLabel,
  transactions,
}) => {
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | null>(null);

  const isPayIn = type === 'PAY_IN';
  const typeLabel = isPayIn ? 'Pay-In (Collection)' : 'Pay-Out (Disbursement)';
  const accentColor = isPayIn ? 'var(--primary)' : 'var(--secondary)';

  // Filter transactions for this specific type
  const typeTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === type);
  }, [transactions, type]);

  const totalVolume = useMemo(() => {
    return typeTransactions.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);
  }, [typeTransactions]);

  const totalCount = typeTransactions.length;

  // Compute breakdown by Payment Method
  const methodStats: MethodStat[] = useMemo(() => {
    const defaultModes = isPayIn
      ? ['UPI', 'QR', 'CARD', 'NET_BANKING']
      : ['IMPS', 'NEFT', 'RTGS', 'UPI'];

    const modeGroups: Record<string, Transaction[]> = {};
    defaultModes.forEach((m) => (modeGroups[m] = []));

    typeTransactions.forEach((t) => {
      const modeKey = t.paymentMode || (isPayIn ? 'UPI' : 'IMPS');
      if (!modeGroups[modeKey]) {
        modeGroups[modeKey] = [];
      }
      modeGroups[modeKey].push(t);
    });

    return Object.entries(modeGroups).map(([mode, txs]) => {
      const successTxs = txs.filter((t) => t.status === 'SUCCESS');
      const pendingTxs = txs.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
      const failedTxs = txs.filter((t) => t.status === 'FAILED');

      const successAmount = successTxs.reduce((sum, t) => sum + t.amount, 0);
      const pendingAmount = pendingTxs.reduce((sum, t) => sum + t.amount, 0);
      const failedAmount = failedTxs.reduce((sum, t) => sum + t.amount, 0);
      const modeTotalAmount = txs.reduce((sum, t) => sum + t.amount, 0);

      const modeTotalCount = txs.length;
      const sharePercent = totalVolume > 0 ? Math.round((successAmount / totalVolume) * 1000) / 10 : 0;
      const successRate = modeTotalCount > 0 ? Math.round((successTxs.length / modeTotalCount) * 1000) / 10 : 100;

      const cfg = METHOD_CONFIG[mode] || {
        label: mode,
        icon: <Smartphone className="w-4 h-4 text-slate-500" />,
        color: '#64748B',
      };

      return {
        mode,
        label: cfg.label,
        icon: cfg.icon,
        color: cfg.color,
        totalCount: modeTotalCount,
        totalAmount: modeTotalAmount,
        sharePercent,
        successCount: successTxs.length,
        successAmount,
        pendingCount: pendingTxs.length,
        pendingAmount,
        failedCount: failedTxs.length,
        failedAmount,
        successRate,
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [typeTransactions, isPayIn, totalVolume]);

  const topMethod = methodStats[0];

  const chartData = useMemo(() => {
    return methodStats.map((ms) => ({
      name: ms.mode,
      amount: ms.successAmount,
      txCount: ms.totalCount,
      share: ms.sharePercent,
    }));
  }, [methodStats]);

  // Selected method filtered transactions list
  const activeMethodStat = useMemo(() => {
    if (!selectedModeFilter) return null;
    return methodStats.find((ms) => ms.mode === selectedModeFilter) || null;
  }, [methodStats, selectedModeFilter]);

  const filteredTxs = useMemo(() => {
    if (!selectedModeFilter) return typeTransactions.slice(0, 8);
    return typeTransactions.filter((t) => t.paymentMode === selectedModeFilter).slice(0, 8);
  }, [typeTransactions, selectedModeFilter]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
              isPayIn ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'
            }`}
          >
            {isPayIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {typeLabel} — Payment Method Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Channel share, transaction counts & status distribution ({periodLabel})
            </p>
          </div>
        </div>
      }
      className="p-0 bg-slate-50/50 w-full md:w-[720px] max-w-full"
    >
      <div className="p-5 space-y-6">
        {/* Top Operational Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Volume
            </span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block tabular-nums">
              {formatCurrency(totalVolume)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Successful volume
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Transactions
            </span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block tabular-nums">
              {formatNumber(totalCount)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Total attempted
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Top Channel
            </span>
            <span className="text-base font-extrabold text-[var(--primary)] mt-1 block truncate">
              {topMethod?.mode || 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">
              {topMethod?.sharePercent || 0}% volume share
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Txn Size
            </span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block tabular-nums">
              {formatCurrency(totalCount > 0 ? Math.round(totalVolume / totalCount) : 0)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Per transaction
            </span>
          </div>
        </div>

        {/* Volume Share Distribution Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
              <h4 className="text-xs font-bold text-slate-900">Volume Share by Payment Mode</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {periodLabel} Share %
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 15, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Volume']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} fill={isPayIn ? '#2F6F5E' : '#F97316'} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Interactive Table List */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-900">Payment Modes & Performance</h4>
            </div>
            {selectedModeFilter && (
              <button
                type="button"
                onClick={() => setSelectedModeFilter(null)}
                className="text-xs text-[#2F6F5E] font-bold hover:underline cursor-pointer"
              >
                Clear Filter ({selectedModeFilter})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {methodStats.map((ms) => {
              const isSelected = selectedModeFilter === ms.mode;

              return (
                <div
                  key={ms.mode}
                  onClick={() => setSelectedModeFilter(isSelected ? null : ms.mode)}
                  className={`border rounded-xl p-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--primary)] bg-blue-50/40 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: `${ms.color}15`, borderColor: `${ms.color}30` }}
                      >
                        {ms.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{ms.mode}</span>
                          <span className="text-[11px] text-slate-500 font-medium">({ms.label})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatNumber(ms.totalCount)} transactions • {ms.sharePercent}% share
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold font-mono text-slate-900 block tabular-nums">
                        {formatCurrency(ms.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200">
                        {ms.successRate}% Success
                      </span>
                    </div>
                  </div>

                  {/* Status Breakdown Bar inside card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Success: <strong>{ms.successCount}</strong> ({formatCurrency(ms.successAmount)})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Pending: <strong>{ms.pendingCount}</strong> ({formatCurrency(ms.pendingAmount)})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Failed: <strong>{ms.failedCount}</strong> ({formatCurrency(ms.failedAmount)})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Mode Transaction Feed Preview */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {selectedModeFilter
                  ? `Recent ${selectedModeFilter} Transactions`
                  : 'Recent Transactions Preview'}
              </span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Showing top {filteredTxs.length} items
            </span>
          </div>

          {filteredTxs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No transactions recorded for this method in the selected timeframe.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTxs.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700 font-mono shrink-0">
                      {tx.paymentMode || 'UPI'}
                    </div>
                    <div className="truncate">
                      <span className="font-mono font-bold text-slate-800 block truncate">
                        {tx.transactionRef}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {tx.customerName || tx.beneficiaryName || 'Customer'} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={tx.status} />
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
