'use client';

import React, { useSyncExternalStore } from 'react';
import {
  ResponsiveContainer,
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
import { formatCurrency, formatNumber } from '@/utils/formatters';

export interface DistributorTrendPoint {
  date: string;
  payinVolume: number;
  payoutVolume: number;
  commission: number;
  count: number;
}

export interface DistributorNetworkOverviewProps {
  trendData: DistributorTrendPoint[];
  isLoading?: boolean;
}

const emptySubscribe = () => () => {};

export const DistributorNetworkOverview: React.FC<DistributorNetworkOverviewProps> = ({
  trendData,
  isLoading = false,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (isLoading || !isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: 7-Day Pay-In vs Pay-Out Volume Trend */}
      <Card title="7-Day Network Volume Trend" subtitle="Daily Pay-In vs Pay-Out volume for assigned Retailers (₹)">
        <div className="h-[250px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val / 1000}k`} />
              <RechartsTooltip
                formatter={(val: unknown) => [formatCurrency(Number(val || 0)), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="payinVolume" name="Pay-In Volume" fill="#2F6F5E" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="payoutVolume" name="Pay-Out Volume" fill="#F97316" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: 7-Day Commission & Transaction Trend */}
      <Card title="7-Day Commission & Activity Trend" subtitle="Distributor commission margin & transaction count">
        <div className="h-[250px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <RechartsTooltip
                formatter={(val: unknown, name: unknown) => [
                  name === 'Distributor Margin' ? formatCurrency(Number(val || 0)) : formatNumber(Number(val || 0)),
                  name === 'Distributor Margin' ? 'Earning' : 'Txn Count',
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="commission" name="Distributor Margin" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={18} />
              <Line yAxisId="right" type="monotone" dataKey="count" name="Transaction Count" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
