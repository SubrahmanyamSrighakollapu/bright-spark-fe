'use client';

import React, { useSyncExternalStore } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  StatusDistributionItem,
  PayInVsPayOutItem,
  ChannelStatsItem,
  ProviderStatsItem,
  TransactionTrendPoint,
} from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

export interface DashboardChartsProps {
  statusDistribution: StatusDistributionItem[];
  payInVsPayOut: PayInVsPayOutItem[];
  channelStats: ChannelStatsItem[];
  providerStats: ProviderStatsItem[];
  trendData: TransactionTrendPoint[];
  isLoading?: boolean;
}

const emptySubscribe = () => () => {};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  statusDistribution,
  payInVsPayOut,
  channelStats,
  providerStats,
  trendData,
  isLoading = false,
}) => {
  // Safe client hydration check using React 18/19 built-in useSyncExternalStore
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (isLoading || !isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Success vs Failure, Pay-In vs Pay-Out, Channel-Wise */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Success vs Failure vs Pending Donut Chart */}
        <Card title="Success vs Failure vs Pending" subtitle="Transaction ratio distribution">
          <div className="h-[240px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any, name: any) => [
                    `${formatNumber(Number(value || 0))} txns (${(
                      (Number(value || 0) /
                        statusDistribution.reduce((acc, curr) => acc + (curr.value || 0), 0)) *
                      100
                    ).toFixed(1)}%)`,
                    name,
                  ]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider">Success Rate</span>
              <span className="text-lg font-extrabold text-emerald-600 font-mono">
                {(() => {
                  const total = statusDistribution.reduce((acc, curr) => acc + (curr.value || 0), 0);
                  const success = statusDistribution.find((s) => s.name === 'Success')?.value || 0;
                  return total > 0 ? `${((success / total) * 100).toFixed(1)}%` : '88.7%';
                })()}
              </span>
            </div>
          </div>
        </Card>

        {/* Chart 2: Pay-In vs Pay-Out Volume Comparison */}
        <Card title="Pay-In vs Pay-Out" subtitle="Volume & amount distribution">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payInVsPayOut}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {payInVsPayOut.map((entry, index) => (
                    <Cell key={`cell-p-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), 'Volume']}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Channel-Wise Transactions */}
        <Card title="Channel-Wise Transactions" subtitle="Web, Mobile App & API traffic">
          <div className="h-[240px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <RechartsTooltip
                  formatter={(val: any) => [formatNumber(Number(val || 0)), 'Txn Count']}
                />
                <Bar dataKey="count" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Major Dual-Axis Trend Chart & Provider/Service Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 4: Transaction Amount vs Volume Trend (Occupies 2 Columns) */}
        <div className="lg:col-span-2">
          <Card
            title="Transaction Amount vs Volume Trend"
            subtitle="Daily volume (bars) and transaction count (line) over time"
          >
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
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
                    formatter={(value: any, name: any) => [
                      name === 'amount' ? formatCurrency(Number(value || 0)) : formatNumber(Number(value || 0)),
                      name === 'amount' ? 'Total Volume' : 'Txn Count',
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    yAxisId="left"
                    dataKey="amount"
                    name="amount"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    name="count"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#F59E0B' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 5: Transactions by Provider / Service */}
        <Card
          title="Provider / Service Performance"
          subtitle="Success rates & volume by gateway"
        >
          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={providerStats}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  dataKey="providerName"
                  type="category"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={110}
                />
                <RechartsTooltip
                  formatter={(val: any, name: any) => [
                    name === 'volume' ? formatNumber(Number(val || 0)) : formatPercentage(Number(val || 0)),
                    name === 'volume' ? 'Txn Volume' : 'Success Rate',
                  ]}
                />
                <Bar dataKey="volume" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
