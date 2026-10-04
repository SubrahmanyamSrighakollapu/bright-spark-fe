'use client';

import React, { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';
import { DashboardFilters, TransactionTypeFilter, StatusFilter } from '@/types/dashboard';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';

export interface DashboardFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: DashboardFilters) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export const DashboardFilterDrawer: React.FC<DashboardFilterDrawerProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<DashboardFilters>({
    type: 'ALL',
    status: 'ALL',
  });

  const activeCount = Object.values(filters).filter(
    (val) => val && val !== 'ALL' && val !== ''
  ).length;

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({ type: 'ALL', status: 'ALL' });
    onResetFilters();
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Operational Dashboard Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {activeCount} Active
            </span>
          )}
        </div>
      }
      description="Filter transaction streams, gateway providers, date ranges, and merchants."
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            className="w-full sm:w-auto"
          >
            Reset Filters
          </Button>

          <Button
            variant="primary"
            onClick={handleApply}
            isLoading={isLoading}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto"
          >
            Apply Operational Filters
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <Select
          label="Transaction Type"
          value={filters.type || 'ALL'}
          onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as TransactionTypeFilter }))}
          options={[
            { value: 'ALL', label: 'All Types (Pay-In & Pay-Out)' },
            { value: 'PAY_IN', label: 'Pay-In Collections' },
            { value: 'PAY_OUT', label: 'Pay-Out Disbursements' },
          ]}
        />

        <Select
          label="Transaction Status"
          value={filters.status || 'ALL'}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as StatusFilter }))}
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

        <Select
          label="Merchant Entity"
          value={filters.merchantId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, merchantId: e.target.value }))}
          placeholder="All Merchants"
          options={[
            { value: 'mch_01', label: 'Apex Pay Solutions' },
            { value: 'mch_02', label: 'Zenith Retail' },
            { value: 'mch_03', label: 'Global Fintech Ltd' },
          ]}
        />

        <Select
          label="Gateway Provider"
          value={filters.providerId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, providerId: e.target.value }))}
          placeholder="All Providers"
          options={[
            { value: 'p_01', label: 'Provider A (Primary Gateway)' },
            { value: 'p_02', label: 'Provider B (Payout Switch)' },
            { value: 'p_03', label: 'Provider C (Bank IMPS Direct)' },
          ]}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#334155]">Date Range Selection</label>
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
      </div>
    </Drawer>
  );
};
