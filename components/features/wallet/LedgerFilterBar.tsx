'use client';

import React, { useState } from 'react';
import { FilterBar } from '@/components/ui/FilterBar';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';
import { Filter, RotateCcw } from 'lucide-react';
import { LedgerFilters } from '@/types/domain';

export interface LedgerFilterBarProps {
  onApplyFilters: (filters: LedgerFilters) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export const LedgerFilterBar: React.FC<LedgerFilterBarProps> = ({
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<LedgerFilters>({
    direction: 'ALL',
    entryType: 'ALL',
    entityType: 'ALL',
  });
  const [dateRange, setDateRange] = useState<any>({ preset: '7d' });

  const activeCount = Object.values(filters).filter(
    (val) => val && val !== 'ALL' && val !== ''
  ).length;

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({ direction: 'ALL', entryType: 'ALL', entityType: 'ALL' });
    onResetFilters();
  };

  return (
    <FilterBar
      title="Ledger Filters"
      activeFilterCount={activeCount}
      onReset={handleReset}
    >
      <Input
        label="Search Reference / ID"
        placeholder="Ledger ID, Wallet ID, Transaction ID..."
        value={filters.searchQuery || ''}
        onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
      />

      <Select
        label="Direction"
        value={filters.direction || 'ALL'}
        onChange={(e) => setFilters((prev) => ({ ...prev, direction: e.target.value as LedgerFilters['direction'] }))}
        options={[
          { value: 'ALL', label: 'All Directions' },
          { value: 'CREDIT', label: 'Credit (+)' },
          { value: 'DEBIT', label: 'Debit (-)' },
        ]}
      />

      <Select
        label="Entry Type"
        value={filters.entryType || 'ALL'}
        onChange={(e) => setFilters((prev) => ({ ...prev, entryType: e.target.value as LedgerFilters['entryType'] }))}
        options={[
          { value: 'ALL', label: 'All Entry Types' },
          { value: 'PAY_IN', label: 'Pay-In' },
          { value: 'PAY_OUT', label: 'Pay-Out' },
          { value: 'WALLET_CREDIT', label: 'Wallet Credit' },
          { value: 'WALLET_DEBIT', label: 'Wallet Debit' },
          { value: 'CHARGE', label: 'Charge' },
          { value: 'TAX', label: 'Tax' },
          { value: 'SETTLEMENT', label: 'Settlement' },
        ]}
      />

      <Select
        label="Entity Type"
        value={filters.entityType || 'ALL'}
        onChange={(e) => setFilters((prev) => ({ ...prev, entityType: e.target.value as LedgerFilters['entityType'] }))}
        options={[
          { value: 'ALL', label: 'All Entities' },
          { value: 'MASTER', label: 'Master' },
          { value: 'DISTRIBUTOR', label: 'Distributor' },
          { value: 'RETAILER', label: 'Retailer' },
          { value: 'MERCHANT', label: 'Retailer' },
        ]}
      />

      <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-slate-700">Date Range</label>
        <DateRangeDropdown
          value={dateRange}
          onChange={(val) => setDateRange(val)}
          size="md"
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
          onClick={handleReset}
          disabled={isLoading}
          title="Reset Filters"
          className="px-3 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        </Button>
      </div>
    </FilterBar>
  );
};
