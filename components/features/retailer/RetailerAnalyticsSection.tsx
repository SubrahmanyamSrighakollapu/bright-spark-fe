'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export interface RetailerAnalyticsSectionProps {
  trendData: {
    date: string;
    payInVolume: number;
    payOutVolume: number;
    transactionsCount: number;
  }[];
  transactionSummary: {
    todayCount: number;
    todayPayInVolume: number;
    todayPayOutVolume: number;
    successfulCount: number;
    pendingCount: number;
    failedCount: number;
    successRate: number;
  };
  isLoading?: boolean;
}

export const RetailerAnalyticsSection: React.FC<RetailerAnalyticsSectionProps> = ({
  trendData,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <Card
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--primary)] border border-blue-100 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Transaction Trend
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Pay-In vs Pay-Out volume over the last 7 days
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-600 shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-[var(--primary)]" />
              <span>Pay-In Collection</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-[var(--secondary)]" />
              <span>Pay-Out Disbursement</span>
            </div>
          </div>
        </div>
      }
      className="shadow-xs hover:shadow-md transition-shadow rounded-2xl overflow-hidden"
    >
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="payInGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="payOutGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                `₹${Number(val).toLocaleString('en-IN')}`,
                name === 'payInVolume' ? 'Pay-In Volume' : 'Pay-Out Volume',
              ]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)' }}
            />
            <Area
              type="monotone"
              dataKey="payInVolume"
              stroke="#0F4C81"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#payInGradient)"
            />
            <Area
              type="monotone"
              dataKey="payOutVolume"
              stroke="#F97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#payOutGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
