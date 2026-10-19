'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { MaskedValue } from '@/components/ui/MaskedValue';
import { ColumnDefinition } from '@/types/common';
import { Transaction } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { mockTransactions } from '@/mocks/mockTransactions';
import { useModal } from '@/hooks/useModal';

export interface RecentTransactionsTableProps {
  isLoading?: boolean;
  transactionType: 'PAY_IN' | 'PAY_OUT';
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  isLoading = false,
  transactionType,
}) => {
  const detailDrawer = useModal<Transaction>();
  const transactions = mockTransactions
    .filter((transaction) => transaction.type === transactionType)
    .slice(0, 6);
  const isPayIn = transactionType === 'PAY_IN';
  const listPath = isPayIn ? '/admin/transactions/payin' : '/admin/transactions/payout';
  const transactionLabel = isPayIn ? 'Pay-In' : 'Pay-Out';

  const renderStatusDot = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'SETTLED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Success
        </span>
      );
    }
    if (s === 'PROCESSING' || s === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Processing
        </span>
      );
    }
    if (s === 'PENDING' || s === 'INITIATED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {status}
      </span>
    );
  };

  const columns: ColumnDefinition<Transaction>[] = [
    {
      key: 'transactionRef',
      header: 'Transaction ID',
      render: (row) => (
        <button
          type="button"
          onClick={() => detailDrawer.open(row)}
          className="font-mono font-semibold text-[#2F6F5E] hover:underline text-xs cursor-pointer text-left"
        >
          {row.transactionRef}
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      align: 'center',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            row.type === 'PAY_IN'
              ? 'bg-blue-50 text-[#2F6F5E] border border-blue-100'
              : row.type === 'PAY_OUT'
              ? 'bg-slate-100 text-[#334155] border border-slate-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
          }`}
        >
          {row.type}
        </span>
      ),
    },
    {
      key: 'merchantName',
      header: 'Retailer',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{row.merchantName}</div>
          <div className="text-[11px] text-[#64748B]">{row.distributorName || 'Direct Retailer'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-[#0F172A] tabular-nums">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (row) => (
        <span className="text-xs text-[#334155] font-medium whitespace-nowrap">
          {row.provider || 'Provider A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => renderStatusDot(row.status),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-[#64748B] whitespace-nowrap font-mono">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Card
        title={`Recent ${transactionLabel} Transactions`}
        subtitle={
          isPayIn
            ? 'Latest collection transactions received through Pay-In channels'
            : 'Latest disbursement transactions submitted through Pay-Out channels'
        }
        noPadding
        action={
          <Link href={listPath}>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All {transactionLabel}
            </Button>
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={transactions}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            renderActions={(row) => (
              <Link
                href={`/admin/transactions/${row.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#334155] hover:text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E5EAF1] rounded-md transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                <span>View</span>
              </Link>
            )}
          />
        </div>
      </Card>

      {/* Transaction Quick Detail Drawer */}
      <Drawer
        isOpen={detailDrawer.isOpen}
        onClose={detailDrawer.close}
        title="Transaction Detail Preview"
        description="Operational audit details and raw logs"
        footer={
          <div className="flex items-center justify-between w-full">
            <Link href={`/admin/transactions/${detailDrawer.data?.id || ''}`}>
              <Button variant="outline" size="sm" onClick={detailDrawer.close}>
                Open Full Details
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={detailDrawer.close}>
              Close
            </Button>
          </div>
        }
      >
        {detailDrawer.data && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5EAF1] space-y-1">
              <span className="text-[#64748B]">Reference Number:</span>
              <div className="font-mono font-extrabold text-sm text-[#2F6F5E]">
                {detailDrawer.data.transactionRef}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Transaction Type:</span>
                <span className="font-bold text-[#0F172A]">{detailDrawer.data.type}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Retailer Name:</span>
                <span className="font-semibold text-[#0F172A]">{detailDrawer.data.merchantName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Provider Gateway:</span>
                <span className="font-semibold text-[#0F172A]">{detailDrawer.data.provider || 'Provider A'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Amount:</span>
                <span className="font-mono font-bold text-[#2F6F5E]">
                  {formatCurrency(detailDrawer.data.amount)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Platform Fee:</span>
                <span className="font-mono">{formatCurrency(detailDrawer.data.fee)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Net Settlement:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{formatCurrency(detailDrawer.data.netAmount)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Status:</span>
                {renderStatusDot(detailDrawer.data.status)}
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Payment Mode:</span>
                <span className="font-semibold text-[#0F172A]">{detailDrawer.data.paymentMode}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E5EAF1]">
                <span className="text-[#64748B]">Masked Account:</span>
                <MaskedValue value={detailDrawer.data.accountNumberMasked || '123456784582'} type="bankAccount" />
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B]">Created At:</span>
                <span className="font-mono">{formatDateTime(detailDrawer.data.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

