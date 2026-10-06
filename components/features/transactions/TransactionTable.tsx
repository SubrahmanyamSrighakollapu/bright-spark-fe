'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Copy, Check } from 'lucide-react';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ColumnDefinition } from '@/types/common';
import { Transaction, PaginationState } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export interface TransactionTableProps {
  transactions: Transaction[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onViewDetails: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  pagination,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  isLoading = false,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyRef = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedId(ref);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: ColumnDefinition<Transaction>[] = [
    {
      key: 'transactionRef',
      header: 'Transaction ID',
      render: (row) => (
        <div className="flex flex-col gap-0.5 group">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/admin/transactions/${row.id}`}
              className="font-mono font-extrabold text-[var(--primary)] text-xs hover:underline"
            >
              {row.transactionRef}
            </Link>
            <button
              type="button"
              onClick={(e) => handleCopyRef(row.transactionRef, e)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity cursor-pointer"
              title="Copy Transaction ID"
            >
              {copiedId === row.transactionRef ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          {row.orderId && (
            <span className="font-mono text-[10px] text-slate-400">Ord: {row.orderId}</span>
          )}
        </div>
      ),
    },
    {
      key: 'merchantName',
      header: 'Retailer',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[var(--text-primary)]">
            {row.retailerName || row.merchantName || 'Direct Account'}
          </div>
          {row.customerMobile && (
            <div className="text-[11px] text-[var(--text-muted)] font-mono">{row.customerMobile}</div>
          )}
        </div>
      ),
    },
    {
      key: 'distributorName',
      header: 'Network Hierarchy',
      render: (row) => {
        const mdName = (row as unknown as Record<string, unknown>).masterDistributorName || row.masterDistributorId;
        return (
          <div className="text-xs space-y-0.5">
            <div className="text-slate-800 font-medium truncate max-w-[140px]">
              {row.distributorName ? `Dist: ${row.distributorName}` : 'Direct Network'}
            </div>
            {mdName && (
              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                MD: {String(mdName)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      align: 'center',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            row.type === 'PAY_IN'
              ? 'bg-blue-50 text-[var(--primary)] border border-blue-200'
              : row.type === 'PAY_OUT'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-purple-50 text-purple-700 border border-purple-200'
          }`}
        >
          {row.type === 'PAY_IN' ? 'Pay-In' : row.type === 'PAY_OUT' ? 'Pay-Out' : row.type}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Service / Mode',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">{row.paymentMode || 'UPI'}</span>
          <span className="text-[10px] text-slate-400 block">{row.provider || row.service || 'Default Switch'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <div className="font-bold text-xs text-[var(--text-primary)] tabular-nums">
            {formatCurrency(row.amount)}
          </div>
          {row.fee > 0 && (
            <div className="text-[10px] text-slate-400 tabular-nums">
              Fee: {formatCurrency(row.fee)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'utr',
      header: 'Reference (RRN / UTR)',
      render: (row) => (
        <div className="font-mono text-xs text-slate-700">
          {row.utr || row.referenceId ? (
            <span className="truncate max-w-[130px] block" title={row.utr || row.referenceId}>
              {row.utr || row.referenceId}
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'settlementStatus',
      header: 'Settlement',
      align: 'center',
      render: (row) => {
        const sStatus = (row as unknown as Record<string, unknown>).settlementStatus || (row.status === 'SUCCESS' ? 'SETTLED' : 'PENDING');
        return (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              sStatus === 'SETTLED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : sStatus === 'PROCESSING'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {String(sStatus)}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
        <Table
          columns={columns}
          data={transactions}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          renderActions={(row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(row)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View
              </Button>
            </div>
          )}
        />
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
