'use client';

import React, { useState } from 'react';
import { FilterBar } from '@/components/ui/FilterBar';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { TransactionFilters } from '@/types/domain';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';

export interface TransactionFilterBarProps {
  onApplyFilters: (filters: TransactionFilters) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  hideTypeFilter?: boolean;
}

export const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
  onApplyFilters,
  onResetFilters,
  isLoading = false,
  hideTypeFilter = false,
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'ALL',
    status: 'ALL',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCount = Object.values(filters).filter(
    (val) => val && val !== 'ALL' && val !== ''
  ).length;

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({ type: 'ALL', status: 'ALL' });
    onResetFilters();
  };

  return (
    <div className="space-y-3">
      <FilterBar
        title="Transaction Filters"
        activeFilterCount={activeCount}
        onReset={handleReset}
      >
        {!hideTypeFilter && (
          <Select
            label="Transaction Type"
            value={filters.type || 'ALL'}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as 'ALL' | 'PAY_IN' | 'PAY_OUT' }))}
            options={[
              { value: 'ALL', label: 'All Types (Pay-In & Pay-Out)' },
              { value: 'PAY_IN', label: 'Pay-In Collections' },
              { value: 'PAY_OUT', label: 'Pay-Out Disbursements' },
            ]}
          />
        )}

        <Select
          label="Transaction Status"
          value={filters.status || 'ALL'}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'SUCCESS', label: 'Success Only' },
            { value: 'FAILED', label: 'Failed Only' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'PROCESSING', label: 'Processing' },
            { value: 'REVERSED', label: 'Reversed' },
            { value: 'REFUNDED', label: 'Refunded' },
          ]}
        />

        <Input
          label="Search Keyword / ID"
          placeholder="Txn ID, Order ID, UTR..."
          value={filters.searchQuery || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">Date Range Filter</label>
          <DateRangeDropdown
            value={filters.dateRange ? 'custom' : 'today'}
            onChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: val.startDate ? `${val.startDate}_to_${val.endDate || ''}` : val.preset,
              }))
            }
            align="left"
            size="md"
            className="w-full"
          />
        </div>

        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleApply}
            isLoading={isLoading}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowAdvanced((prev) => !prev)}
            title="Toggle Advanced Filters"
            className="px-3 shrink-0 text-xs"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleReset}
            disabled={isLoading}
            title="Reset Filters"
            className="px-3 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </Button>
        </div>
      </FilterBar>

      {/* Expandable Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[var(--radius-lg)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-150">
          <Select
            label="Retailer"
            value={filters.merchantId || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, merchantId: e.target.value }))}
            placeholder="All Retailers"
            options={[
              { value: 'Apex Pay Solutions', label: 'Apex Pay Solutions' },
              { value: 'Zenith Retail', label: 'Zenith Retail' },
              { value: 'Global Fintech Ltd', label: 'Global Fintech Ltd' },
              { value: 'Swift Commerce', label: 'Swift Commerce' },
            ]}
          />

          <Select
            label="Provider"
            value={filters.providerId || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, providerId: e.target.value }))}
            placeholder="All Providers"
            options={[
              { value: 'Provider A', label: 'Provider A (Primary)' },
              { value: 'Provider B', label: 'Provider B (Payout Switch)' },
              { value: 'Provider C', label: 'Provider C (Bank Direct)' },
            ]}
          />

          <Input
            label="Min Amount (₹)"
            type="number"
            placeholder="0"
            value={filters.minAmount || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value ? Number(e.target.value) : undefined }))}
          />

          <Input
            label="Max Amount (₹)"
            type="number"
            placeholder="1000000"
            value={filters.maxAmount || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value ? Number(e.target.value) : undefined }))}
          />
        </div>
      )}
    </div>
  );
};
