'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MaskedValue } from '@/components/ui/MaskedValue';
import { TransactionTimeline } from './TransactionTimeline';
import { Transaction } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { transactionService } from '@/services/transactionService';
import {
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Server,
} from 'lucide-react';

export interface TransactionDetailsViewProps {
  transaction: Transaction;
  onRefresh?: () => void;
  isInsideDrawer?: boolean;
}

export const TransactionDetailsView: React.FC<TransactionDetailsViewProps> = ({
  transaction: initialTx,
  onRefresh,
  isInsideDrawer = false,
}) => {
  const [tx, setTx] = useState<Transaction>(initialTx);
  const [isCopied, setIsCopied] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const isPayIn = tx.type === 'PAY_IN';
  const isFailed = tx.status === 'FAILED';

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.transactionRef);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await transactionService.getTransactionById(tx.id);
      if (res.success && res.data) {
        setTx(res.data);
        if (onRefresh) onRefresh();
      }
    } catch {
      // Fallback
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Sticky Drawer/Page Header Identity Area */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
        <div className="flex items-center gap-3">
          {!isInsideDrawer && (
            <Link href="/admin/transactions/all">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-base md:text-lg text-[var(--primary)] tracking-tight">
                {tx.transactionRef}
              </span>
              <StatusBadge status={tx.status} size="sm" />
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Created: <strong>{formatDateTime(tx.createdAt)}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={
              isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )
            }
          >
            {isCopied ? 'Copied' : 'Copy ID'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCheckStatus}
            isLoading={isCheckingStatus}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />}
          >
            Check Latest Status
          </Button>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT MAIN COLUMN (7/12 = ~60% width) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Transaction Summary */}
          <Card title="Transaction Summary" subtitle="Core audit identifiers & gateway routing">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Transaction ID</span>
                <span className="font-mono font-bold text-[var(--primary)]">{tx.transactionRef}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Order ID</span>
                <span className="font-mono font-semibold text-slate-800">{tx.orderId || '—'}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">UTR / Bank Ref</span>
                <span className="font-mono font-semibold text-slate-800">{tx.utr || '—'}</span>
              </div>

              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Type</span>
                <span className="font-bold text-slate-900">{tx.type}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Payment Mode</span>
                <span className="font-semibold text-slate-800">{tx.paymentMode}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Channel</span>
                <span className="text-slate-800">{tx.channel || '—'}</span>
              </div>

              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Provider Switch</span>
                <span className="font-semibold text-slate-800">{tx.provider || '—'}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Service API</span>
                <span className="text-slate-800">{tx.service || '—'}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium block mb-0.5">Last Updated</span>
                <span className="text-slate-700">
                  {tx.updatedAt ? formatDateTime(tx.updatedAt) : formatDateTime(tx.createdAt)}
                </span>
              </div>
            </div>
          </Card>

          {/* Section B: Transaction Parties */}
          <Card title="Transaction Parties" subtitle="Requesting entity & counterpart details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block border-b border-slate-200 pb-1">
                  Requesting Entity
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retailer:</span>
                    <span className="font-semibold text-slate-900">{tx.merchantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Master Distributor:</span>
                    <span className="font-semibold text-slate-800">
                      {String((tx as unknown as Record<string, unknown>).masterDistributorName || tx.masterDistributorId || '—')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distributor:</span>
                    <span className="text-slate-800">{tx.distributorName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retailer:</span>
                    <span className="text-slate-800">{tx.retailerName || tx.merchantName || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block border-b border-slate-200 pb-1">
                  {isPayIn ? 'Payer / Customer' : 'Beneficiary Details'}
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-bold text-slate-900">
                      {isPayIn ? tx.customerName || '—' : tx.beneficiaryName || '—'}
                    </span>
                  </div>
                  {!isPayIn && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank:</span>
                      <span className="font-semibold">{tx.beneficiaryBank || '—'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isPayIn ? 'Mobile:' : 'Account / VPA:'}</span>
                    {isPayIn ? (
                      <span>{tx.customerMobile || '—'}</span>
                    ) : (
                      <MaskedValue
                        value={tx.accountNumberMasked || tx.beneficiaryAccount || '—'}
                        type="bankAccount"
                      />
                    )}
                  </div>
                  {!isPayIn && tx.beneficiaryIfsc && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono">{tx.beneficiaryIfsc}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Section C: Transaction Lifecycle Timeline */}
          <Card title="Transaction Lifecycle Timeline" subtitle="Chronological gateway audit events">
            <TransactionTimeline timeline={tx.timeline} />
          </Card>

          {/* Section D: Provider Information */}
          <Card title="Provider Information" subtitle="Gateway routing & response details">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Provider Switch</span>
                <span className="font-semibold text-slate-800">{tx.provider || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Service API</span>
                <span>{tx.service || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Provider Status</span>
                <span className="font-bold text-slate-900">{tx.status}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Request Sent At</span>
                <span>{formatDateTime(tx.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Response Received At</span>
                <span>{tx.updatedAt ? formatDateTime(tx.updatedAt) : '—'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT SIDEBAR COLUMN (5/12 = ~40% width) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Amount & Tax Breakdown */}
          <Card title="Financial & Commission Ledger" subtitle="Principal, Charges, Taxes & Network Allocations">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Principal Amount</span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">
                  {formatCurrency(tx.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Service Charges / Fee</span>
                <span className="font-mono tabular-nums">{formatCurrency(tx.fee)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">GST (18%)</span>
                <span className="font-mono tabular-nums">
                  {tx.gst !== undefined ? formatCurrency(tx.gst) : '—'}
                </span>
              </div>

              {tx.tds !== undefined && <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">TDS Deduction</span>
                <span className="font-mono tabular-nums">{formatCurrency(tx.tds)}</span>
              </div>}

              {tx.commissionSnapshot && <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Commission Distribution
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Distributor Commission</span>
                    <span className="font-mono text-emerald-700">{formatCurrency(tx.commissionSnapshot.distributorCommissionAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Master Distributor Commission</span>
                    <span className="font-mono text-emerald-700">{formatCurrency(tx.commissionSnapshot.masterDistributorCommissionAmount || 0)}</span>
                  </div>
                </div>
              </div>}

              <div className="flex justify-between items-center py-2.5 border-t-2 border-slate-200 font-bold text-sm text-[var(--primary)]">
                <span>{isPayIn ? 'Net Settlement Credit' : 'Total Wallet Debit'}</span>
                <span className="font-mono tabular-nums">{formatCurrency(tx.netAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Callback / Webhook Summary */}
          {tx.callbackSummary && <Card title="Callback / Webhook Summary" subtitle="Third-party callback log summary">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Callback Received</span>
                <span className="font-bold flex items-center gap-1.5">
                  {tx.callbackSummary?.callbackReceived ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Yes</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">Awaiting Callback</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Received At</span>
                <span className="text-slate-800">
                  {tx.callbackSummary?.callbackReceived && tx.callbackSummary?.receivedAt
                    ? formatDateTime(tx.callbackSummary.receivedAt)
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Processing Status</span>
                <span className="font-semibold text-slate-900">
                  {tx.callbackSummary.processingStatus || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Retry Count</span>
                <span className="font-mono">{tx.callbackSummary.retryCount ?? '—'}</span>
              </div>

              <div className="pt-2">
                <Link href="/admin/logs/callbacks">
                  <Button variant="ghost" size="sm" fullWidth className="text-[11px]">
                    View Full Callback Log →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>}

          {/* Failure Information (ONLY rendered when status === 'FAILED') */}
          {isFailed && (
            <Card title="Failure Details" subtitle="Provider error response">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5 text-xs text-rose-950">
                <div className="font-bold text-rose-700">
                  Failure Code: {tx.failureCode || '—'}
                </div>
                <p className="text-[11px] leading-relaxed text-rose-900">
                  {tx.failureReason || 'No failure reason was recorded.'}
                </p>
                <div className="text-[10px] text-rose-600 pt-1">
                  Failed At: {tx.updatedAt ? formatDateTime(tx.updatedAt) : formatDateTime(tx.createdAt)}
                </div>
              </div>
            </Card>
          )}

          {/* Technical Details Expandable */}
          {tx.providerResponse && <Card title="Technical Audit Payload">
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails((prev) => !prev)}
                className="w-full flex items-center justify-between p-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-800 font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-600" />
                  <span>Gateway Request / Response JSON</span>
                </div>
                {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTechnicalDetails && (
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(
                    tx.providerResponse,
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </Card>}
        </div>
      </div>
    </div>
  );
};
