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
import { CardDateFilter, CardDatePreset } from '@/components/ui/CardDateFilter';
import {
  DashboardSummaryMetrics as DashboardMetrics,
  ChannelStatsItem,
  ProviderStatsItem,
  TransactionTrendPoint,
} from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ArrowDownLeft, CheckCircle2, CreditCard, Zap } from 'lucide-react';

export interface PayInDashboardViewProps {
  metrics: DashboardMetrics;
  trendData: TransactionTrendPoint[];
  channelStats: ChannelStatsItem[];
  providerStats: ProviderStatsItem[];
  isLoading?: boolean;
}

const emptySubscribe = () => () => {};

// Helper data generators per range
function getPayInMetricsForRange(preset: CardDatePreset, base: DashboardMetrics, customDates?: { startDate: string; endDate: string }) {
  switch (preset) {
    case 'today':
      return {
        volume: base.totalPayIn || 4275000,
        txns: base.successfulTransactions || 12842,
        successRate: base.successRate || 94.58,
        fee: 17955,
        subtext: '+8.4% growth today',
      };
    case 'yesterday':
      return {
        volume: 3840000,
        txns: 11200,
        successRate: 93.2,
        fee: 16128,
        subtext: 'Completed yesterday',
      };
    case '7d':
      return {
        volume: 29500000,
        txns: 84200,
        successRate: 94.1,
        fee: 123900,
        subtext: '+12.1% past 7 days',
      };
    case '30d':
      return {
        volume: 124000000,
        txns: 350000,
        successRate: 94.8,
        fee: 520800,
        subtext: '+15.4% past month',
      };
    case 'custom':
      return {
        volume: 48900000,
        txns: 142000,
        successRate: 95.1,
        fee: 205380,
        subtext: customDates?.startDate && customDates?.endDate ? `${customDates.startDate} to ${customDates.endDate}` : 'Custom Date Range',
      };
  }
}

function getPayInTrendForRange(preset: CardDatePreset, baseTrend: TransactionTrendPoint[]): TransactionTrendPoint[] {
  switch (preset) {
    case 'today':
      return [
        { date: '08:00 AM', amount: 350000, payinAmount: 350000, payoutAmount: 180000, count: 850 },
        { date: '11:00 AM', amount: 820000, payinAmount: 820000, payoutAmount: 420000, count: 2400 },
        { date: '02:00 PM', amount: 1250000, payinAmount: 1250000, payoutAmount: 680000, count: 3900 },
        { date: '05:00 PM', amount: 1100000, payinAmount: 1100000, payoutAmount: 590000, count: 3200 },
        { date: '08:00 PM', amount: 755000, payinAmount: 755000, payoutAmount: 350000, count: 2492 },
      ];
    case 'yesterday':
      return [
        { date: '08:00 AM', amount: 310000, payinAmount: 310000, payoutAmount: 150000, count: 780 },
        { date: '11:00 AM', amount: 740000, payinAmount: 740000, payoutAmount: 380000, count: 2100 },
        { date: '02:00 PM', amount: 1120000, payinAmount: 1120000, payoutAmount: 610000, count: 3400 },
        { date: '05:00 PM', amount: 980000, payinAmount: 980000, payoutAmount: 510000, count: 2820 },
        { date: '08:00 PM', amount: 690000, payinAmount: 690000, payoutAmount: 310000, count: 2100 },
      ];
    case '7d':
      return baseTrend;
    case '30d':
      return [
        { date: 'Week 1', amount: 28000000, payinAmount: 28000000, payoutAmount: 18000000, count: 78000 },
        { date: 'Week 2', amount: 31000000, payinAmount: 31000000, payoutAmount: 21000000, count: 86000 },
        { date: 'Week 3', amount: 32500000, payinAmount: 32500000, payoutAmount: 22000000, count: 91000 },
        { date: 'Week 4', amount: 32500000, payinAmount: 32500000, payoutAmount: 21500000, count: 95000 },
      ];
    case 'custom':
      return [
        { date: 'Period A', amount: 12000000, payinAmount: 12000000, payoutAmount: 7000000, count: 35000 },
        { date: 'Period B', amount: 15500000, payinAmount: 15500000, payoutAmount: 9200000, count: 44000 },
        { date: 'Period C', amount: 21400000, payinAmount: 21400000, payoutAmount: 12800000, count: 63000 },
      ];
  }
}

function getPayInStatusForRange(preset: CardDatePreset) {
  switch (preset) {
    case 'today':
      return [
        { name: 'Successful', value: 12842, pct: '89.3%', color: '#2F6F5E' },
        { name: 'Pending', value: 800, pct: '5.6%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 736, pct: '5.1%', color: '#DC2626' },
      ];
    case 'yesterday':
      return [
        { name: 'Successful', value: 11200, pct: '87.5%', color: '#2F6F5E' },
        { name: 'Pending', value: 950, pct: '7.4%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 650, pct: '5.1%', color: '#DC2626' },
      ];
    case '7d':
      return [
        { name: 'Successful', value: 84200, pct: '89.1%', color: '#2F6F5E' },
        { name: 'Pending', value: 5200, pct: '5.5%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 5100, pct: '5.4%', color: '#DC2626' },
      ];
    case '30d':
      return [
        { name: 'Successful', value: 350000, pct: '90.2%', color: '#2F6F5E' },
        { name: 'Pending', value: 18000, pct: '4.6%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 20000, pct: '5.2%', color: '#DC2626' },
      ];
    case 'custom':
      return [
        { name: 'Successful', value: 142000, pct: '90.5%', color: '#2F6F5E' },
        { name: 'Pending', value: 7800, pct: '5.0%', color: '#D97706' },
        { name: 'Failed / Rejected', value: 7100, pct: '4.5%', color: '#DC2626' },
      ];
  }
}

function getPayInModesForRange(preset: CardDatePreset) {
  switch (preset) {
    case 'today':
      return [
        { mode: 'UPI QR / Intent', count: 6850, pct: 48.6, amount: 2450000, color: '#2F6F5E' },
        { mode: 'Net Banking Direct', count: 2900, pct: 20.6, amount: 1210000, color: '#2563EB' },
        { mode: 'Credit / Debit Cards', count: 1850, pct: 13.1, amount: 840000, color: '#3B82F6' },
        { mode: 'PPI / Wallets', count: 1250, pct: 8.9, amount: 420000, color: '#60A5FA' },
      ];
    case 'yesterday':
      return [
        { mode: 'UPI QR / Intent', count: 5900, pct: 51.2, amount: 2100000, color: '#2F6F5E' },
        { mode: 'Net Banking Direct', count: 2400, pct: 19.4, amount: 980000, color: '#2563EB' },
        { mode: 'Credit / Debit Cards', count: 1600, pct: 14.0, amount: 620000, color: '#3B82F6' },
        { mode: 'PPI / Wallets', count: 900, pct: 7.4, amount: 280000, color: '#60A5FA' },
      ];
    case '7d':
      return [
        { mode: 'UPI QR / Intent', count: 42500, pct: 50.5, amount: 14800000, color: '#2F6F5E' },
        { mode: 'Net Banking Direct', count: 17800, pct: 21.0, amount: 8200000, color: '#2563EB' },
        { mode: 'Credit / Debit Cards', count: 11400, pct: 13.5, amount: 4500000, color: '#3B82F6' },
        { mode: 'PPI / Wallets', count: 6800, pct: 8.0, amount: 2000000, color: '#60A5FA' },
      ];
    case '30d':
      return [
        { mode: 'UPI QR / Intent', count: 182000, pct: 52.0, amount: 64400000, color: '#2F6F5E' },
        { mode: 'Net Banking Direct', count: 71750, pct: 20.5, amount: 32000000, color: '#2563EB' },
        { mode: 'Credit / Debit Cards', count: 46200, pct: 13.2, amount: 17600000, color: '#3B82F6' },
        { mode: 'PPI / Wallets', count: 29050, pct: 8.3, amount: 10000000, color: '#60A5FA' },
      ];
    case 'custom':
      return [
        { mode: 'UPI QR / Intent', count: 73840, pct: 52.0, amount: 25428000, color: '#2F6F5E' },
        { mode: 'Net Banking Direct', count: 29820, pct: 21.0, amount: 10269000, color: '#2563EB' },
        { mode: 'Credit / Debit Cards', count: 18460, pct: 13.0, amount: 6357000, color: '#3B82F6' },
        { mode: 'PPI / Wallets', count: 11360, pct: 8.0, amount: 3912000, color: '#60A5FA' },
      ];
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const PayInDashboardView: React.FC<PayInDashboardViewProps> = ({
  metrics,
  trendData,
  channelStats,
  providerStats,
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
  const [modesRange, setModesRange] = useState<CardDatePreset>('7d');

  if (isLoading || !isMounted) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  // Dynamic Data based on Filter States
  const currentMetrics = getPayInMetricsForRange(metricRange, metrics, customMetricDates);
  const currentTrend = getPayInTrendForRange(trendRange, trendData);
  const currentStatusData = getPayInStatusForRange(statusRange);
  const currentModesData = getPayInModesForRange(modesRange);

  const totalStatusCount = currentStatusData.reduce((acc, curr) => acc + curr.value, 0);
  const avgTicket = currentMetrics.txns > 0 ? Math.round(currentMetrics.volume / currentMetrics.txns) : 512;

  return (
    <div className="space-y-6">
      {/* Top Section Header with Global Card Filter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Pay-In Summary Metrics
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

      {/* 1. Pay-In Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          label="Total Pay-In Collection Volume"
          value={formatCurrency(currentMetrics.volume)}
          subtext={currentMetrics.subtext}
          icon={<ArrowDownLeft className="w-4 h-4 text-[#2F6F5E]" />}
          variant="primary"
        />
        <FinancialMetricCard
          label="Successful Pay-In Txns"
          value={formatNumber(currentMetrics.txns)}
          subtext="Processed Collection Txns"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          variant="success"
        />
        <FinancialMetricCard
          label="Pay-In Success Rate"
          value={`${currentMetrics.successRate}%`}
          subtext="Acquiring SLA Health"
          icon={<Zap className="w-4 h-4 text-emerald-600" />}
          variant="payin"
        />
        <FinancialMetricCard
          label="Est. Gateway Fee Revenue"
          value={formatCurrency(currentMetrics.fee)}
          subtext={`Avg Ticket: ₹${avgTicket}`}
          icon={<CreditCard className="w-4 h-4 text-[#2F6F5E]" />}
          variant="neutral"
        />
      </div>

      {/* 2. Main Charts Row: Trend & Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 h-full flex flex-col justify-between">
          <Card
            title="Pay-In Collection Trend"
            subtitle="Payment volume and transaction activity"
            className="h-full flex flex-col justify-between"
            action={
              <CardDateFilter value={trendRange} onChange={(preset) => setTrendRange(preset)} />
            }
          >
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="payInBlueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F6F5E" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#2F6F5E" stopOpacity={0.0} />
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
                      name === 'payinAmount' || name === 'amount'
                        ? formatCurrency(Number(value || 0))
                        : formatNumber(Number(value || 0)),
                      name === 'payinAmount' || name === 'amount' ? 'Collection Volume' : 'Transaction Count',
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="payinAmount"
                    name="Collection Volume"
                    stroke="#2F6F5E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#payInBlueGradient)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    name="Transaction Count"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#059669' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Modern Donut Status Distribution Chart */}
        <div className="h-full flex flex-col justify-between">
          <Card
            title="Pay-In Status Distribution"
            subtitle="Success vs Pending vs Failed Collections"
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

      {/* 3. Payment Modes Breakdown */}
      <Card
        title="Pay-In Payment Modes Breakdown"
        subtitle="UPI, Net Banking, Cards & Digital Wallets"
        action={
          <CardDateFilter value={modesRange} onChange={(preset) => setModesRange(preset)} />
        }
      >
        <div className="space-y-4 py-2">
          {currentModesData.map((pm, idx) => (
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

      {/* 4. Recent Pay-In Transactions */}
      <RecentTransactionsTable transactionType="PAY_IN" isLoading={isLoading} />
    </div>
  );
};
