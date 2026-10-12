'use client';

import React from 'react';
import Link from 'next/link';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ColumnDefinition } from '@/types/common';
import { LedgerEntry, PaginationState } from '@/types/domain';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Eye, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

export interface LedgerTableProps {
  entries: LedgerEntry[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onViewDetails: (entry: LedgerEntry) => void;
  isLoading?: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  pagination,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  isLoading = false,
}) => {
  const columns: ColumnDefinition<LedgerEntry>[] = [
    {
      key: 'id',
      header: 'Ledger ID',
      render: (row) => {
        const formattedId = row.id && row.id.length > 20 ? `TX-${row.id.split('-').pop()?.toUpperCase()}` : row.id;
        return (
          <span className="font-mono font-bold text-[var(--primary)] text-xs" title={row.id}>
            {formattedId}
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
    {
      key: 'entityName',
      header: 'Entity / Wallet',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[var(--text-primary)]">{row.entityName || (row as any).partyName || 'Wallet Holder'}</div>
          <div className="text-[11px] font-mono text-slate-500">{row.walletId || (row as any).partyCode || '—'}</div>
        </div>
      ),
    },
    {
      key: 'entryType',
      header: 'Entry Type',
      align: 'center',
      render: (row) => {
        const type = (row as any).type || row.entryType || 'ADJUSTMENT';
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
            {type}
          </span>
        );
      },
    },
    {
      key: 'direction',
      header: 'Direction',
      align: 'center',
      render: (row) => {
        const type = (row as any).type || row.entryType || '';
        const isCredit = row.direction === 'CREDIT' || type === 'CREDIT' || type === 'RELEASE' || type === 'PAY_IN' || type === 'WALLET_CREDIT';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isCredit
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isCredit ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownLeft className="w-3.5 h-3.5" />
            )}
            {isCredit ? 'CREDIT' : 'DEBIT'}
          </span>
        );
      },
    },
    {
      key: 'referenceId',
      header: 'Reference / Txn',
      render: (row) => (
        <div>
          {row.transactionId ? (
            <Link
              href={`/admin/transactions/${row.transactionId}`}
              className="font-mono text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>{row.transactionId}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <span className="font-mono text-xs text-slate-700">{row.referenceId || (row as any).reference_id || 'SYSTEM'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'openingBalance',
      header: 'Opening Bal',
      align: 'right',
      render: (row) => {
        const openBal = row.openingBalance ?? (row as any).availableBalanceBefore ?? 0;
        return <span className="font-mono text-xs text-slate-600">{formatCurrency(openBal)}</span>;
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => {
        const type = (row as any).type || row.entryType || '';
        const isCredit = row.direction === 'CREDIT' || type === 'CREDIT' || type === 'RELEASE' || type === 'PAY_IN' || type === 'WALLET_CREDIT';
        return (
          <span
            className={`font-mono font-extrabold text-xs ${
              isCredit ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isCredit ? '+' : '-'}{formatCurrency(row.amount)}
          </span>
        );
      },
    },
    {
      key: 'closingBalance',
      header: 'Closing Bal',
      align: 'right',
      render: (row) => {
        const closeBal = row.closingBalance ?? (row as any).availableBalanceAfter ?? 0;
        return (
          <span className="font-mono font-bold text-xs text-slate-900">
            {formatCurrency(closeBal)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
        <Table
          columns={columns}
          data={entries}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          renderActions={(row) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(row)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}
        />
      </div>

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
