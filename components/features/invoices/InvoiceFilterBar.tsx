'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { InvoiceFilters, EntityType, InvoiceType, InvoiceStatus } from '@/types/domain';
import { Search, Filter, RotateCcw } from 'lucide-react';

export interface InvoiceFilterBarProps {
  onFilterChange: (filters: InvoiceFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const InvoiceFilterBar: React.FC<InvoiceFilterBarProps> = ({
  onFilterChange,
  onReset,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState<'ALL' | EntityType>('ALL');
  const [invoiceType, setInvoiceType] = useState<'ALL' | InvoiceType>('ALL');
  const [status, setStatus] = useState<'ALL' | InvoiceStatus>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchQuery, entityType, invoiceType, status });
  };

  const handleReset = () => {
    setSearchQuery('');
    setEntityType('ALL');
    setInvoiceType('ALL');
    setStatus('ALL');
    onReset();
  };

  return (
    <Card className="p-4 bg-white border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Search Invoices (Multi-Field)"
            placeholder="Search Name, Mobile, Amount, Txn ID, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <Select
            label="Entity Type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as 'ALL' | EntityType)}
            options={[
              { value: 'ALL', label: 'All Entity Types' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'RETAILER', label: 'Retailer' },
              { value: 'MERCHANT', label: 'Retailer' },
            ]}
          />

          <Select
            label="Invoice Type"
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value as 'ALL' | InvoiceType)}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'PLATFORM_FEE', label: 'Platform Fee' },
              { value: 'SERVICE_FEE', label: 'Service Fee' },
              { value: 'SETTLEMENT_INVOICE', label: 'Settlement Invoice' },
              { value: 'ADJUSTMENT_INVOICE', label: 'Adjustment Invoice' },
            ]}
          />

          <Select
            label="Invoice Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ALL' | InvoiceStatus)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'GENERATED', label: 'Generated' },
              { value: 'ISSUED', label: 'Issued' },
              { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
              { value: 'PAID', label: 'Paid' },
              { value: 'OVERDUE', label: 'Overdue' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">Filter invoices across retailers, settlements, and billing periods.</span>
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
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} leftIcon={<Filter className="w-3.5 h-3.5" />}>
              Apply Filters
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
