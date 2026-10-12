'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LedgerEntry } from '@/types/domain';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Copy, Check, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

export interface LedgerDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entry: LedgerEntry | null;
}

export const LedgerDetailsDrawer: React.FC<LedgerDetailsDrawerProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!entry) return null;

  const entryType = (entry as any).type || entry.entryType || 'ADJUSTMENT';
  const isCredit = entry.direction === 'CREDIT' || entryType === 'CREDIT' || entryType === 'RELEASE' || entryType === 'PAY_IN' || entryType === 'WALLET_CREDIT';
  const formattedId = entry.id && entry.id.length > 20 ? `TX-${entry.id.split('-').pop()?.toUpperCase()}` : entry.id;
  const openBal = entry.openingBalance ?? (entry as any).availableBalanceBefore ?? 0;
  const closeBal = entry.closingBalance ?? (entry as any).availableBalanceAfter ?? 0;
  const description = entry.description || (entry as any).narration || (entryType === 'HOLD' ? 'Security Hold on Wallet' : entryType === 'RELEASE' ? 'Release of Security Hold' : 'Wallet Adjustment');

  const handleCopyId = () => {
    navigator.clipboard.writeText(entry.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getReferenceLabel = () => {
    if (entry.referenceId?.startsWith('dbt_req_') || entry.referenceId?.startsWith('DBT_REQ_')) {
      return 'Debit Request Reference';
    }
    switch (entryType) {
      case 'PAY_IN':
      case 'PAY_OUT':
        return 'Transaction Reference';
      case 'WALLET_CREDIT':
      case 'WALLET_DEBIT':
      case 'ADJUSTMENT':
        return 'Adjustment Reference';
      case 'SETTLEMENT':
        return 'Settlement Reference';
      default:
        return 'Reference ID';
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Ledger Entry Details — ${formattedId}`}
      size="md"
      className="p-0 bg-[var(--bg-app)] w-full md:w-[640px]"
    >
      <div className="space-y-6">
        {/* Sticky Identity Header */}
        <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-base md:text-lg text-[var(--primary)]" title={entry.id}>
                {formattedId}
              </span>
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
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Entry Type: <strong className="uppercase">{entryType}</strong> | Date: <strong>{formatDateTime(entry.createdAt)}</strong>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopyId}>
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {isCopied ? 'Copied' : 'Copy ID'}
          </Button>
        </div>

        {/* Balance Impact Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
            <span className="text-slate-500 block text-[11px]">Opening Balance</span>
            <span className="font-mono font-bold text-slate-800">{formatCurrency(openBal)}</span>
          </div>

          <div
            className={`p-3 border rounded-lg space-y-0.5 ${
              isCredit
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/60 border-rose-200 text-rose-950'
            }`}
          >
            <span className="text-slate-500 block text-[11px]">Transaction Amount</span>
            <span className="font-mono font-extrabold text-sm">
              {isCredit ? '+' : '-'}{formatCurrency(entry.amount)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
            <span className="text-slate-500 block text-[11px]">Closing Balance</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrency(closeBal)}</span>
          </div>
        </div>

        {/* Metadata Details Card */}
        <Card title="Ledger Metadata & Audit Reference" subtitle="Immutable audit traceability record">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Entity Name:</span>
              <span className="font-semibold">{entry.entityName || (entry as any).partyName || 'Wallet Holder'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Target Wallet ID:</span>
              <span className="font-mono font-bold text-[var(--primary)]">{entry.walletId || (entry as any).partyCode || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">{getReferenceLabel()}:</span>
              <span className="font-mono text-slate-800">{entry.referenceId || (entry as any).reference_id || '—'}</span>
            </div>
            {entry.transactionId && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Linked Transaction:</span>
                <Link
                  href={`/admin/transactions/${entry.transactionId}`}
                  className="font-mono font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                >
                  <span>{entry.transactionId}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Created By:</span>
              <span className="font-semibold">{entry.createdBy || 'System'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Description / Reason:</span>
              <span className="font-medium text-slate-900">{description}</span>
            </div>
          </div>
        </Card>
      </div>
    </Drawer>
  );
};
