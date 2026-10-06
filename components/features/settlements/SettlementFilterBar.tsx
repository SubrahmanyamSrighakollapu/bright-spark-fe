'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { SettlementFilters, EntityType, SettlementStatus, SettlementCycle } from '@/types/domain';

export interface SettlementFilterBarProps {
  onApplyFilters: (filters: SettlementFilters) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  hideStatusFilter?: boolean;
}

export const SettlementFilterBar: React.FC<SettlementFilterBarProps> = ({
  onApplyFilters,
  onResetFilters,
  isLoading = false,
  hideStatusFilter = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState<'ALL' | EntityType>('ALL');
  const [status, setStatus] = useState<'ALL' | SettlementStatus>('ALL');
  const [settlementCycle, setSettlementCycle] = useState<'ALL' | SettlementCycle>('ALL');
  const [provider, setProvider] = useState('ALL');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({
      searchQuery,
      entityType,
      status: hideStatusFilter ? undefined : status,
      settlementCycle,
      provider: provider === 'ALL' ? undefined : provider,
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setEntityType('ALL');
    setStatus('ALL');
    setSettlementCycle('ALL');
    setProvider('ALL');
    onResetFilters();
  };

  return (
    <Card className="p-4 bg-white border border-slate-200">
      <form onSubmit={handleApply} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Operational Search */}
          <div className="lg:col-span-2">
            <Input
              label="Search Settlement"
              placeholder="Search Settlement ID, UTR, Entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* 2. Entity Type Filter */}
          <Select
            label="Entity Type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as 'ALL' | EntityType)}
            options={[
              { value: 'ALL', label: 'All Entity Types' },
              { value: 'MASTER', label: 'Master Treasury' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'RETAILER', label: 'Retailer' },
              { value: 'MERCHANT', label: 'Retailer' },
            ]}
          />

          {/* 3. Status Filter (optional) */}
          {!hideStatusFilter && (
            <Select
              label="Settlement Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ALL' | SettlementStatus)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ELIGIBLE', label: 'Eligible' },
                { value: 'QUEUED', label: 'Queued' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'SETTLED', label: 'Settled' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'ON_HOLD', label: 'On Hold' },
              ]}
            />
          )}

          {/* 4. Settlement Cycle Filter */}
          <Select
            label="Settlement Cycle"
            value={settlementCycle}
            onChange={(e) => setSettlementCycle(e.target.value as 'ALL' | SettlementCycle)}
            options={[
              { value: 'ALL', label: 'All Cycles' },
              { value: 'T+0', label: 'T+0 Instant' },
              { value: 'T+1', label: 'T+1 Standard' },
              { value: 'T+2', label: 'T+2 Delayed' },
              { value: 'MANUAL', label: 'Manual' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 font-medium">
            Filters refine settlement queues, batches, and audit records.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
