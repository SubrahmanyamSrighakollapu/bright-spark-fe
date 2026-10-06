'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ChargebackFilters, ChargebackStatus, ChargebackPriority, ChargebackReasonCode } from '@/types/domain';
import { Search, Filter, RotateCcw } from 'lucide-react';

export interface ChargebackFilterBarProps {
  onFilterChange: (filters: ChargebackFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const ChargebackFilterBar: React.FC<ChargebackFilterBarProps> = ({
  onFilterChange,
  onReset,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | ChargebackStatus>('ALL');
  const [priority, setPriority] = useState<'ALL' | ChargebackPriority>('ALL');
  const [reasonCode, setReasonCode] = useState<'ALL' | ChargebackReasonCode>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchQuery, status, priority, reasonCode });
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatus('ALL');
    setPriority('ALL');
    setReasonCode('ALL');
    onReset();
  };

  return (
    <Card className="p-4 bg-white border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Search Dispute"
            placeholder="Search Chargeback ID, Txn ID, Retailer, Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <Select
            label="Dispute Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ALL' | ChargebackStatus)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'RAISED', label: 'Raised' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
              { value: 'EVIDENCE_REQUIRED', label: 'Evidence Required' },
              { value: 'RESPONDED', label: 'Responded' },
              { value: 'WON', label: 'Won' },
              { value: 'LOST', label: 'Lost' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'ALL' | ChargebackPriority)}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
          />

          <Select
            label="Dispute Reason"
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value as 'ALL' | ChargebackReasonCode)}
            options={[
              { value: 'ALL', label: 'All Reason Codes' },
              { value: 'FRAUD', label: 'Fraudulent Transaction' },
              { value: 'SERVICE_NOT_RECEIVED', label: 'Service Not Received' },
              { value: 'DUPLICATE', label: 'Duplicate Charge' },
              { value: 'PROCESSING_ERROR', label: 'Processing Error' },
              { value: 'UNRECOGNIZED_TRANSACTION', label: 'Unrecognized Charge' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">Filter disputes across retailer accounts and provider gateways.</span>
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
