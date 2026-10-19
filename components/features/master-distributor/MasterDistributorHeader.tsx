'use client';

import React, { useState } from 'react';
import { RefreshCw, Building2, Network, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DateRangeDropdown, DateRangeValue } from '@/components/ui/DateRangeDropdown';
import { formatDateTime } from '@/utils/formatters';

export interface MasterDistributorHeaderProps {
  name: string;
  code: string;
  businessName: string;
  lastRefreshedAt: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const MasterDistributorHeader: React.FC<MasterDistributorHeaderProps> = ({
  name,
  code,
  businessName,
  lastRefreshedAt,
  onRefresh,
  isLoading = false,
}) => {
  const [selectedRange, setSelectedRange] = useState<DateRangeValue>({ preset: 'today' });

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/60 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-[#2F6F5E] text-white shadow-lg shadow-indigo-900/20">
          <Network className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {name}
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#2F6F5E] border border-[#D4E1AE]">
              {code}
            </span>
            <StatusBadge status="ACTIVE" label="Network Portal Active" size="sm" />
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {businessName}
            </span>
            <span>•</span>
            <span>Master Distributor Network Operations</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5" /> Updated {formatDateTime(lastRefreshedAt)}
        </span>
        <DateRangeDropdown value={selectedRange} onChange={setSelectedRange} size="sm" />

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>
      </div>
    </div>
  );
};
