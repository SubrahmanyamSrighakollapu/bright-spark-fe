'use client';

import React, { useState, useSyncExternalStore } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Line,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { RecentTransactionsTable } from '@/components/features/dashboard/RecentTransactionsTable';
import { BalanceOverviewCard } from '@/components/features/dashboard/BalanceOverviewCard';
import { CardDateFilter, CardDatePreset } from '@/components/ui/CardDateFilter';
import {
  DashboardSummaryMetrics as DashboardMetrics,
  TransactionTrendPoint,
  BalanceOverview,
} from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ArrowUpRight, CheckCircle2, Clock, Landmark } from 'lucide-react';

export interface PayOutDashboardViewProps {
  metrics: DashboardMetrics;
  trendData: TransactionTrendPoint[];
  balanceOverview?: BalanceOverview;
  isLoading?: boolean;
}

const emptySubscribe = () => () => {};

// Helper data generators per range for Payouts
function getPayOutMetricsForRange(preset: CardDatePreset, base: DashboardMetrics, customDates?: { startDate: string; endDate: string }) {
  switch (preset) {
    case 'today':
      return {
        volume: base.totalPayOut || 3120000,
        dispatches: 4215,
        pendingSettlements: base.pendingSettlement || 375000,
        successRate: 99.2,
        subtext: 'Processed Retailer Dispatches',
      };
    case 'yesterday':
      return {
        volume: 2850000,
        dispatches: 3920,
        pendingSettlements: 310000,
        successRate: 98.9,
        subtext: 'Completed Yesterday',
      };
    case '7d':
      return {
        volume: 21800000,
        dispatches: 28450,
        pendingSettlements: 1850000,
        successRate: 99.1,
        subtext: '+10.4% past 7 days',
      };
    case '30d':
      return {
        volume: 94500000,
        dispatches: 118000,
        pendingSettlements: 6200000,
        successRate: 99.4,
        subtext: '+14.8% past month',
      };
    case 'custom':
    default:
      return {
        volume: 42100000,
        dispatches: 52400,
        pendingSettlements: 2800000,
        successRate: 99.3,
        subtext: customDates?.startDate && customDates?.endDate ? `${customDates.startDate} to ${customDates.endDate}` : 'Custom Date Range',
      };
  }
}

function getPayOutTrendForRange(preset: CardDatePreset, baseTrend: TransactionTrendPoint[]): TransactionTrendPoint[] {
  switch (preset) {
    case 'today':
      return [
        { date: '08:00 AM', amount: 250000, payinAmount: 180000, payoutAmount: 250000, count: 420 },
        { date: '11:00 AM', amount: 680000, payinAmount: 420000, payoutAmount: 680000, count: 1150 },
        { date: '02:00 PM', amount: 950000, payinAmount: 680000, payoutAmount: 950000, count: 1480 },
        { date: '05:00 PM', amount: 780000, payinAmount: 590000, payoutAmount: 780000, count: 1020 },
        { date: '08:00 PM', amount: 460000, payinAmount: 350000, payoutAmount: 460000, count: 680 },
      ];
    case 'yesterday':
      return [
        { date: '08:00 AM', amount: 220000, payinAmount: 150000, payoutAmount: 220000, count: 380 },
        { date: '11:00 AM', amount: 610000, payinAmount: 380000, payoutAmount: 610000, count: 1040 },
        { date: '02:00 PM', amount: 890000, payinAmount: 610000, payoutAmount: 890000, count: 1360 },
        { date: '05:00 PM', amount: 710000, payinAmount: 510000, payoutAmount: 710000, count: 950 },
        { date: '08:00 PM', amount: 420000, payinAmount: 310000, payoutAmount: 420000, count: 590 },
      ];
    case '7d':
      return baseTrend;
    case '30d':
      return [
        { date: 'Week 1', amount: 21500000, payinAmount: 18000000, payoutAmount: 21500000, count: 26000 },
        { date: 'Week 2', amount: 23800000, payinAmount: 21000000, payoutAmount: 23800000, count: 29500 },
        { date: 'Week 3', amount: 24600000, payinAmount: 22000000, payoutAmount: 24600000, count: 31000 },
        { date: 'Week 4', amount: 24600000, payinAmount: 21500000, payoutAmount: 24600000, count: 31500 },
      ];
    case 'custom':
    default:
      return [
        { date: 'Period A', amount: 11500000, payinAmount: 9000000, payoutAmount: 11500000, count: 14000 },
        { date: 'Period B', amount: 14200000, payinAmount: 11000000, payoutAmount: 14200000, count: 18200 },
        { date: 'Period C', amount: 16400000, payinAmount: 12500000, payoutAmount: 16400000, count: 20200 },
      ];
  }
}

function getPayOutStatusForRange(preset: CardDatePreset) {
  switch (preset) {
    case 'today':
      return [
        { name: 'Dispatched & Settled', value: 3850, pct: '91.3%', color: '#155EEF' },
        { name: 'Pending Bank ACK', value: 240, pct: '5.7%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 85, pct: '2.0%', color: '#DC2626' },
        { name: 'On Hold (SLA Hold)', value: 40, pct: '1.0%', color: '#94A3B8' },
      ];
    case 'yesterday':
      return [
        { name: 'Dispatched & Settled', value: 3520, pct: '89.8%', color: '#155EEF' },
        { name: 'Pending Bank ACK', value: 260, pct: '6.6%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 95, pct: '2.4%', color: '#DC2626' },
        { name: 'On Hold (SLA Hold)', value: 45, pct: '1.2%', color: '#94A3B8' },
      ];
    case '7d':
      return [
        { name: 'Dispatched & Settled', value: 25740, pct: '90.5%', color: '#155EEF' },
        { name: 'Pending Bank ACK', value: 1680, pct: '5.9%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 740, pct: '2.6%', color: '#DC2626' },
        { name: 'On Hold (SLA Hold)', value: 290, pct: '1.0%', color: '#94A3B8' },
      ];
    case '30d':
      return [
        { name: 'Dispatched & Settled', value: 107600, pct: '91.2%', color: '#155EEF' },
        { name: 'Pending Bank ACK', value: 5660, pct: '4.8%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 2830, pct: '2.4%', color: '#DC2626' },
        { name: 'On Hold (SLA Hold)', value: 1910, pct: '1.6%', color: '#94A3B8' },
      ];
    case 'custom':
    default:
      return [
        { name: 'Dispatched & Settled', value: 47600, pct: '90.8%', color: '#155EEF' },
        { name: 'Pending Bank ACK', value: 2620, pct: '5.0%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 1360, pct: '2.6%', color: '#DC2626' },
        { name: 'On Hold (SLA Hold)', value: 820, pct: '1.6%', color: '#94A3B8' },
      ];
  }
}

function getPayOutChannelsForRange(preset: CardDatePreset) {
  switch (preset) {
    case 'today':
      return [
        { mode: 'IMPS Instant Payout', count: 2020, pct: 48.0, amount: 1490000, color: '#155EEF' },
        { mode: 'UPI Payout Direct', count: 1240, pct: 29.5, amount: 920000, color: '#2563EB' },
        { mode: 'NEFT Batch Transfer', count: 660, pct: 15.7, amount: 490000, color: '#3B82F6' },
        { mode: 'RTGS High-Value', count: 295, pct: 6.8, amount: 220000, color: '#60A5FA' },
      ];
    case 'yesterday':
      return [
        { mode: 'IMPS Instant Payout', count: 1850, pct: 47.2, amount: 1340000, color: '#155EEF' },
        { mode: 'UPI Payout Direct', count: 1180, pct: 30.1, amount: 850000, color: '#2563EB' },
        { mode: 'NEFT Batch Transfer', count: 610, pct: 15.6, amount: 440000, color: '#3B82F6' },
        { mode: 'RTGS High-Value', count: 280, pct: 7.1, amount: 220000, color: '#60A5FA' },
      ];
    case '7d':
      return [
        { mode: 'IMPS Instant Payout', count: 13650, pct: 48.0, amount: 10450000, color: '#155EEF' },
        { mode: 'UPI Payout Direct', count: 8390, pct: 29.5, amount: 6430000, color: '#2563EB' },
        { mode: 'NEFT Batch Transfer', count: 4460, pct: 15.7, amount: 3420000, color: '#3B82F6' },
        { mode: 'RTGS High-Value', count: 1950, pct: 6.8, amount: 1500000, color: '#60A5FA' },
      ];
    case '30d':
      return [
        { mode: 'IMPS Instant Payout', count: 56640, pct: 48.0, amount: 45360000, color: '#155EEF' },
        { mode: 'UPI Payout Direct', count: 34810, pct: 29.5, amount: 27870000, color: '#2563EB' },
        { mode: 'NEFT Batch Transfer', count: 18520, pct: 15.7, amount: 14830000, color: '#3B82F6' },
        { mode: 'RTGS High-Value', count: 8030, pct: 6.8, amount: 6440000, color: '#60A5FA' },
      ];
    case 'custom':
    default:
      return [
        { mode: 'IMPS Instant Payout', count: 25150, pct: 48.0, amount: 20208000, color: '#155EEF' },
        { mode: 'UPI Payout Direct', count: 15450, pct: 29.5, amount: 12419000, color: '#2563EB' },
        { mode: 'NEFT Batch Transfer', count: 8220, pct: 15.7, amount: 6609000, color: '#3B82F6' },
        { mode: 'RTGS High-Value', count: 3580, pct: 6.8, amount: 2864000, color: '#60A5FA' },
      ];
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const PayOutDashboardView: React.FC<PayOutDashboardViewProps> = ({
  metrics,
  trendData,
  balanceOverview,
  isLoading = false,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Card Date Filter States
  const [metricRange, setMetricRange] = useState<CardDatePreset>('today');
  const [customMetricDates, setCustomMetricDates] = useState<{ startDate: string; endDate: string }>();

  const [trendRange, setTrendRange] = useState<CardDatePreset>('7d');
  const [statusRange, setStatusRange] = useState<CardDatePreset>('7d');
  const [channelsRange, setChannelsRange] = useState<CardDatePreset>('7d');

  if (isLoading || !isMounted) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  // Dynamic Data based on Filter States
  const currentMetrics = getPayOutMetricsForRange(metricRange, metrics, customMetricDates);
  const currentTrend = getPayOutTrendForRange(trendRange, trendData);
  const currentStatusData = getPayOutStatusForRange(statusRange);
  const currentChannelsData = getPayOutChannelsForRange(channelsRange);

  const totalStatusCount = currentStatusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Section Header with Global Card Filter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Pay-Out Summary Metrics
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B]">Metric Range:</span>
          <CardDateFilter
            value={metricRange}
            onChange={(preset, custom) => {
              setMetricRange(preset);
              if (custom) setCustomMetricDates(custom);
            }}
          />
        </div>
      </div>

      {/* 1. Pay-Out Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          label="Total Pay-Out Volume"
          value={formatCurrency(currentMetrics.volume)}
          subtext={currentMetrics.subtext}
          icon={<ArrowUpRight className="w-4 h-4 text-amber-600" />}
          variant="payout"
        />
        <FinancialMetricCard
          label="Successful Payout Dispatches"
          value={formatNumber(currentMetrics.dispatches)}
          subtext="Completed Bank Transfers"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          variant="success"
        />
        <FinancialMetricCard
          label="Pending Settlements"
          value={formatCurrency(currentMetrics.pendingSettlements)}
          subtext="Awaiting Bank Confirmation"
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          variant="warning"
        />
        <FinancialMetricCard
          label="Payout SLA Success Rate"
          value={`${currentMetrics.successRate}%`}
          subtext="Avg Latency: 1.2s instant"
          icon={<Landmark className="w-4 h-4 text-[#155EEF]" />}
          variant="primary"
        />
      </div>

      {/* 2. Main Charts Row: Trend & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 h-full flex flex-col justify-between">
          <Card
            title="Pay-Out Settlement & Dispatch Trend"
            subtitle="Real-time retailer payout volume and dispatch count over time"
            className="h-full flex flex-col justify-between"
            action={
              <CardDateFilter value={trendRange} onChange={(preset) => setTrendRange(preset)} />
            }
          >
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="payOutAmberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#155EEF" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#155EEF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E5EAF1',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'payoutAmount' || name === 'amount'
                        ? formatCurrency(Number(value || 0))
                        : formatNumber(Number(value || 0)),
                      name === 'payoutAmount' || name === 'amount' ? 'Payout Volume' : 'Dispatch Count',
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="payoutAmount"
                    name="Payout Volume"
                    stroke="#155EEF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#payOutAmberGradient)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    name="Dispatch Count"
                    stroke="#D97706"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#D97706' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Donut Status Distribution Chart */}
        <div className="h-full flex flex-col justify-between">
          <Card
            title="Pay-Out Status Distribution"
            subtitle="Dispatched vs Pending ACK vs Failed"
            className="h-full flex flex-col justify-between"
            action={
              <CardDateFilter value={statusRange} onChange={(preset) => setStatusRange(preset)} />
            }
          >
            <div className="flex flex-col items-center justify-between my-auto py-2">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={86}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {currentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E5EAF1',
                        boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, name: any) => [
                        `${formatNumber(Number(value))} txns`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stats Ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-extrabold tracking-wider text-[#64748B] uppercase">TOTAL</span>
                  <span className="text-base font-extrabold text-[#0F172A]">
                    {formatNumber(totalStatusCount)}
                  </span>
                </div>
              </div>

              {/* Status Legend List */}
              <div className="w-full space-y-2 pt-4 border-t border-[#F1F5F9]">
                {currentStatusData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-[#334155] truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[#0F172A]">{formatNumber(item.value)}</span>
                      <span className="text-[11px] font-semibold text-[#64748B] w-11 text-right">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Transfer Channels Breakdown */}
      <Card
        title="Pay-Out Transfer Channels Breakdown"
        subtitle="IMPS, UPI Payout, NEFT Batch & RTGS Transfers"
        action={
          <CardDateFilter value={channelsRange} onChange={(preset) => setChannelsRange(preset)} />
        }
      >
        <div className="space-y-4 py-2">
          {currentChannelsData.map((pm, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F172A] text-xs">{pm.mode}</span>
                  <span className="text-[11px] font-semibold text-[#64748B]">({pm.pct}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748B]">{formatNumber(pm.count)} txns</span>
                  <span className="font-bold text-[#0F172A]">{formatCurrency(pm.amount)}</span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pm.pct}%`, backgroundColor: pm.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Balance Overview & Nodal Escrow Safeguard */}
      {balanceOverview && <BalanceOverviewCard balance={balanceOverview} />}

      {/* 5. Recent Payout Transactions */}
      <RecentTransactionsTable transactionType="PAY_OUT" isLoading={isLoading} />
    </div>
  );
};
