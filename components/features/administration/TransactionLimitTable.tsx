'use client';

import React from 'react';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TransactionLimit } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';

export interface TransactionLimitTableProps {
  data: TransactionLimit[];
  isLoading?: boolean;
}

export const TransactionLimitTable: React.FC<TransactionLimitTableProps> = ({
  data,
  isLoading = false,
}) => {
  const columns = [
    {
      key: 'id',
      header: 'Limit ID / Scope',
      render: (row: TransactionLimit) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.id}</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
            row.scopeType === 'MERCHANT' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-blue-100 text-blue-900 border border-blue-200'
          }`}>
            {row.scopeType === 'MERCHANT' ? 'RETAILER' : row.scopeType} {row.scopeName ? `(${row.scopeName})` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'transactionType',
      header: 'Type / Mode',
      render: (row: TransactionLimit) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{row.transactionType}</span>
          <div className="font-mono text-[11px] text-purple-700">{row.paymentMode}</div>
        </div>
      ),
    },
    {
      key: 'minMax',
      header: 'Min / Max Per Transaction',
      align: 'right' as const,
      render: (row: TransactionLimit) => (
        <div className="font-mono text-xs">
          <span className="text-slate-500">Min: {formatCurrency(row.minPerTransaction)}</span>
          <div className="font-bold text-slate-900">Max: {formatCurrency(row.maxPerTransaction)}</div>
        </div>
      ),
    },
    {
      key: 'dailyLimit',
      header: 'Daily Amount / Count Limit',
      align: 'right' as const,
      render: (row: TransactionLimit) => (
        <div className="font-mono text-xs">
          <div className="font-bold text-emerald-800">{formatCurrency(row.dailyAmountLimit)}</div>
          <span className="text-[10px] text-slate-500">{row.dailyCountLimit} txns / day</span>
        </div>
      ),
    },
    {
      key: 'monthlyLimit',
      header: 'Monthly Limit',
      align: 'right' as const,
      render: (row: TransactionLimit) => (
        <div className="font-mono text-xs">
          <div className="font-bold text-slate-900">{formatCurrency(row.monthlyAmountLimit)}</div>
          <span className="text-[10px] text-slate-500">{row.monthlyCountLimit} txns / month</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: TransactionLimit) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
      <Table
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
      />
    </div>
  );
};
