'use client';

import React from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TransactionReportRecord } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';

export interface TransactionReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: TransactionReportRecord | null;
}

export const TransactionReportDrawer: React.FC<TransactionReportDrawerProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!record) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Report Details"
      size="md"
    >
      <div className="space-y-6 text-xs">
        {/* RETAILER DETAILS */}
        <Card title="Retailer Details" subtitle="Associated retailer entity information">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Retailer Name</span>
              <span className="font-bold text-slate-900">{record.retailerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Retailer ID</span>
              <span className="font-mono font-bold text-[var(--primary)]">{record.retailerId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Mobile Number</span>
              <span className="font-mono font-semibold text-slate-800">{record.mobileNumber}</span>
            </div>
          </div>
        </Card>

        {/* TRANSACTION DETAILS */}
        <Card title="Transaction Details" subtitle="Core operational parameters and status">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Transaction ID</span>
              <span className="font-mono font-extrabold text-[var(--primary)] text-sm">{record.transactionId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">API Reference ID</span>
              <span className="font-mono text-slate-800 font-semibold">{record.apiReferenceId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Service Type</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 inline-block mt-0.5">
                {record.serviceType}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Payment Mode</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 inline-block mt-0.5">
                {record.paymentMode}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold mb-1">Transaction Status</span>
              <StatusBadge status={record.status} size="sm" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Failure / Response Message</span>
              <span className={`font-semibold ${record.status === 'FAILED' ? 'text-rose-700' : 'text-slate-700'}`}>
                {record.responseMessage}
              </span>
            </div>
          </div>
        </Card>

        {/* FINANCIAL DETAILS */}
        <Card title="Financial Breakdown" subtitle="Principal amount, charges, GST and total amount">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] font-semibold">Transaction Amount</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm">{formatCurrency(record.transactionAmount)}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] font-semibold">Transaction Charges</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(record.transactionCharges)}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[10px] font-semibold">GST / Tax</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(record.gstAmount)}</span>
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-purple-700 block text-[10px] font-bold">Total Amount</span>
              <span className="font-mono font-extrabold text-purple-900 text-sm">{formatCurrency(record.totalAmount)}</span>
            </div>
          </div>
        </Card>

        {/* BANK / PROVIDER REFERENCES */}
        <Card title="Bank / Provider References" subtitle="Gateway and switch reference identifiers">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">RRN / UTR Number</span>
              <span className="font-mono font-bold text-slate-900">{record.rrnOrUtr || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Bank Reference Number</span>
              <span className="font-mono font-bold text-slate-900">{record.bankReferenceNumber || '-'}</span>
            </div>
          </div>
        </Card>

        {/* SETTLEMENT DETAILS */}
        <Card title="Settlement Details" subtitle="Retailer settlement clearance state">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold mb-1">Settlement Status</span>
              <StatusBadge status={record.settlementStatus} size="sm" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Settlement Date</span>
              <span className="font-mono font-semibold text-slate-800">
                {record.settlementDate ? formatDate(record.settlementDate) : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* TIMELINE & OTHER */}
        <Card title="Timeline & Remarks" subtitle="Lifecycle timestamps and operational notes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Request Date & Time</span>
              <span className="font-mono font-semibold text-slate-800">{formatDate(record.requestedAt)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Updated Date & Time</span>
              <span className="font-mono font-semibold text-slate-800">{formatDate(record.updatedAt)}</span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Remarks</span>
              <span className="text-slate-800 font-medium">{record.remarks || '-'}</span>
            </div>
          </div>
        </Card>
      </div>
    </Drawer>
  );
};
