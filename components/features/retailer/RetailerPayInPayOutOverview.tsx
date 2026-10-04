'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export interface RetailerPayInPayOutOverviewProps {
  transactions: Transaction[];
  selectedPeriod: 'today' | '7d' | '30d';
  onOpenDrillDown: (type: 'PAY_IN' | 'PAY_OUT') => void;
  isLoading?: boolean;
}

interface OverviewData {
  totalCount: number;
  totalVolume: number;
  successCount: number;
  successVolume: number;
  pendingCount: number;
  pendingVolume: number;
  failedCount: number;
  failedVolume: number;
  successRate: number;
}

interface MethodShare {
  mode: string;
  label: string;
  count: number;
  amount: number;
  percent: number;
}

const COLORS = {
  success: '#059669', // Emerald 600
  pending: '#D97706', // Amber 600
  failed: '#DC2626',  // Rose 600
};

export const RetailerPayInPayOutOverview: React.FC<RetailerPayInPayOutOverviewProps> = ({
  transactions,
  selectedPeriod,
  onOpenDrillDown,
  isLoading = false,
}) => {
  void selectedPeriod;

  // Calculate Pay-In Overview Metrics
  const payInData: OverviewData = useMemo(() => {
    const txs = transactions.filter((t) => t.type === 'PAY_IN');
    const totalCount = txs.length;
    const totalVolume = txs.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);

    const successTxs = txs.filter((t) => t.status === 'SUCCESS');
    const pendingTxs = txs.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
    const failedTxs = txs.filter((t) => t.status === 'FAILED');

    const successCount = successTxs.length;
    const successVolume = successTxs.reduce((sum, t) => sum + t.amount, 0);

    const pendingCount = pendingTxs.length;
    const pendingVolume = pendingTxs.reduce((sum, t) => sum + t.amount, 0);

    const failedCount = failedTxs.length;
    const failedVolume = failedTxs.reduce((sum, t) => sum + t.amount, 0);

    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 1000) / 10 : 100;

    return {
      totalCount,
      totalVolume,
      successCount,
      successVolume,
      pendingCount,
      pendingVolume,
      failedCount,
      failedVolume,
      successRate,
    };
  }, [transactions]);

  // Calculate Pay-Out Overview Metrics
  const payOutData: OverviewData = useMemo(() => {
    const txs = transactions.filter((t) => t.type === 'PAY_OUT');
    const totalCount = txs.length;
    const totalVolume = txs.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);

    const successTxs = txs.filter((t) => t.status === 'SUCCESS');
    const pendingTxs = txs.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
    const failedTxs = txs.filter((t) => t.status === 'FAILED');

    const successCount = successTxs.length;
    const successVolume = successTxs.reduce((sum, t) => sum + t.amount, 0);

    const pendingCount = pendingTxs.length;
    const pendingVolume = pendingTxs.reduce((sum, t) => sum + t.amount, 0);

    const failedCount = failedTxs.length;
    const failedVolume = failedTxs.reduce((sum, t) => sum + t.amount, 0);

    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 1000) / 10 : 100;

    return {
      totalCount,
      totalVolume,
      successCount,
      successVolume,
      pendingCount,
      pendingVolume,
      failedCount,
      failedVolume,
      successRate,
    };
  }, [transactions]);

  // Top Payment Methods breakdown for Pay-In
  const payInMethods: MethodShare[] = useMemo(() => {
    const txs = transactions.filter((t) => t.type === 'PAY_IN');
    const totalVol = txs.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);
    const groups: Record<string, { count: number; amount: number }> = {
      UPI: { count: 0, amount: 0 },
      QR: { count: 0, amount: 0 },
      CARD: { count: 0, amount: 0 },
      NET_BANKING: { count: 0, amount: 0 },
    };

    txs.forEach((t) => {
      const rawMode = t.paymentMode || 'UPI';
      const mode = ['NEFT', 'IMPS', 'RTGS', 'NETBANKING'].includes(rawMode) ? 'NET_BANKING' : rawMode;
      const resolvedMode = groups[mode] ? mode : 'UPI';
      groups[resolvedMode].count += 1;
      if (t.status === 'SUCCESS') groups[resolvedMode].amount += t.amount;
    });

    return Object.entries(groups)
      .map(([mode, data]) => ({
        mode,
        label: mode === 'NET_BANKING' ? 'Net Banking' : mode,
        count: data.count,
        amount: data.amount,
        percent: totalVol > 0 ? Math.round((data.amount / totalVol) * 100) : 25,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Top Payment Methods breakdown for Pay-Out
  const payOutMethods: MethodShare[] = useMemo(() => {
    const txs = transactions.filter((t) => t.type === 'PAY_OUT');
    const totalVol = txs.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);
    const groups: Record<string, { count: number; amount: number }> = {
      IMPS: { count: 0, amount: 0 },
      NEFT: { count: 0, amount: 0 },
      UPI: { count: 0, amount: 0 },
      RTGS: { count: 0, amount: 0 },
    };

    txs.forEach((t) => {
      const mode = t.paymentMode || 'IMPS';
      const resolvedMode = groups[mode] ? mode : 'IMPS';
      groups[resolvedMode].count += 1;
      if (t.status === 'SUCCESS') groups[resolvedMode].amount += t.amount;
    });

    return Object.entries(groups)
      .map(([mode, data]) => ({
        mode,
        label: mode,
        count: data.count,
        amount: data.amount,
        percent: totalVol > 0 ? Math.round((data.amount / totalVol) * 100) : 25,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-80 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="h-80 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const renderDonutChart = (data: OverviewData) => {
    const chartPieData = [
      { name: 'Success', value: data.successCount || 1, amount: data.successVolume, color: COLORS.success },
      { name: 'Pending', value: data.pendingCount || 0, amount: data.pendingVolume, color: COLORS.pending },
      { name: 'Failed', value: data.failedCount || 0, amount: data.failedVolume, color: COLORS.failed },
    ].filter((item) => item.value > 0);

    return (
      <div className="relative w-44 h-44 mx-auto shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartPieData}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={76}
              paddingAngle={4}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any, name: any, item: any) => [
                `${val} txns (${formatCurrency(item.payload.amount)})`,
                name,
              ]}
              contentStyle={{
                borderRadius: '10px',
                fontSize: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Modern Donut Center Display: Total Volume & Transaction Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 leading-none tabular-nums tracking-tight">
            {formatCurrency(data.totalVolume)}
          </span>
          <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase mt-1">
            Total Volume
          </span>
          <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {data.totalCount} Txns
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Pay-In Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 grid grid-rows-[auto_1fr_auto] gap-5">
        {/* Modern Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Pay-In
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-[var(--primary)] border border-blue-100 uppercase tracking-wider">
                Collections
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer payments to your account
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenDrillDown('PAY_IN')}
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Analytics Body Layout: Left Donut + Right Lightweight Status Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Left: Modern Donut Chart */}
          <div className="sm:col-span-5 flex items-center justify-center">
            {renderDonutChart(payInData)}
          </div>

          {/* Right: Lightweight Status Breakdown List */}
          <div className="sm:col-span-7 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
              <span>Status</span>
              <div className="flex items-center gap-3">
                <span>Share</span>
                <span className="w-20 text-right">Amount</span>
              </div>
            </div>

            {/* Success Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Success</span>
                <span className="text-[11px] text-slate-400 font-mono">({payInData.successCount})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-900 tabular-nums">
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                  {payInData.totalCount > 0 ? Math.round((payInData.successCount / payInData.totalCount) * 100) : 100}%
                </span>
                <span className="w-20 text-right whitespace-nowrap">{formatCurrency(payInData.successVolume)}</span>
              </div>
            </div>

            {/* Pending Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                <span className="font-semibold text-slate-800">Pending</span>
                <span className="text-[11px] text-slate-400 font-mono">({payInData.pendingCount})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-900 tabular-nums">
                <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-sans">
                  {payInData.totalCount > 0 ? Math.round((payInData.pendingCount / payInData.totalCount) * 100) : 0}%
                </span>
                <span className="w-20 text-right whitespace-nowrap">{formatCurrency(payInData.pendingVolume)}</span>
              </div>
            </div>

            {/* Failed Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <span className="font-semibold text-slate-800">Failed</span>
                <span className="text-[11px] text-slate-400 font-mono">({payInData.failedCount})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-900 tabular-nums">
                <span className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-sans">
                  {payInData.totalCount > 0 ? Math.round((payInData.failedCount / payInData.totalCount) * 100) : 0}%
                </span>
                <span className="w-20 text-right whitespace-nowrap">{formatCurrency(payInData.failedVolume)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Compact Top Payment Methods Strip */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Top Payment Methods
            </span>
            <button
              type="button"
              onClick={() => onOpenDrillDown('PAY_IN')}
              className="text-[11px] font-bold text-[var(--primary)] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>View Full Breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {payInMethods.map((m) => (
              <div key={m.mode} className="min-w-0 bg-slate-50 border border-slate-200/60 rounded-lg p-2 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 truncate">{m.label}</span>
                <span className="font-mono font-bold text-[var(--primary)] shrink-0 ml-1">
                  {m.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Pay-Out Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 grid grid-rows-[auto_1fr_auto] gap-5">
        {/* Modern Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Pay-Out
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-50 text-[var(--secondary)] border border-orange-100 uppercase tracking-wider">
                Disbursements
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Transfers to bank accounts / wallets
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenDrillDown('PAY_OUT')}
            className="text-xs font-bold text-[var(--secondary)] hover:underline flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Analytics Body Layout: Left Donut + Right Lightweight Status Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Left: Modern Donut Chart */}
          <div className="sm:col-span-5 flex items-center justify-center">
            {renderDonutChart(payOutData)}
          </div>

          {/* Right: Lightweight Status Breakdown List */}
          <div className="sm:col-span-7 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
              <span>Status</span>
              <div className="flex items-center gap-3">
                <span>Share</span>
                <span className="w-20 text-right">Amount</span>
              </div>
            </div>

            {/* Success Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Success</span>
                <span className="text-[11px] text-slate-400 font-mono">({payOutData.successCount})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-900 tabular-nums">
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                  {payOutData.totalCount > 0 ? Math.round((payOutData.successCount / payOutData.totalCount) * 100) : 100}%
                </span>
                <span className="w-20 text-right whitespace-nowrap">{formatCurrency(payOutData.successVolume)}</span>
              </div>
            </div>

            {/* Pending Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                <span className="font-semibold text-slate-800">Pending</span>
                <span className="text-[11px] text-slate-400 font-mono">({payOutData.pendingCount})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-900 tabular-nums">
                <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-sans">
                  {payOutData.totalCount > 0 ? Math.round((payOutData.pendingCount / payOutData.totalCount) * 100) : 0}%
                </span>
                <span className="w-20 text-right whitespace-nowrap">{formatCurrency(payOutData.pendingVolume)}</span>
              </div>
            </div>

            {/* Failed Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <span className="font-semibold text-slate-800">Failed</span>
                <span className="text-[11px] text-slate-400 font-mono">({payOutData.failedCount})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-900 tabular-nums">
                <span className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-sans">
                  {payOutData.totalCount > 0 ? Math.round((payOutData.failedCount / payOutData.totalCount) * 100) : 0}%
                </span>
                <span className="w-20 text-right whitespace-nowrap">{formatCurrency(payOutData.failedVolume)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Compact Top Payment Methods Strip */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Top Payment Methods
            </span>
            <button
              type="button"
              onClick={() => onOpenDrillDown('PAY_OUT')}
              className="text-[11px] font-bold text-[var(--secondary)] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>View Full Breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {payOutMethods.map((m) => (
              <div key={m.mode} className="min-w-0 bg-slate-50 border border-slate-200/60 rounded-lg p-2 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 truncate">{m.label}</span>
                <span className="font-mono font-bold text-[var(--secondary)] shrink-0 ml-1">
                  {m.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
