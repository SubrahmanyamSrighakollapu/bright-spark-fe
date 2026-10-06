'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui/Drawer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Copy,
  Check,
  Download,
  CreditCard,
  FileText,
  Clock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

import { ServiceInvoiceRenderer } from './ServiceInvoiceRenderer';

export interface InvoiceDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onMarkPaid?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

export const InvoiceDetailsDrawer: React.FC<InvoiceDetailsDrawerProps> = ({
  isOpen,
  onClose,
  invoice,
  onMarkPaid,
  onDownload,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SERVICE_TEMPLATE' | 'LINE_ITEMS' | 'PAYMENTS' | 'TIMELINE'>('OVERVIEW');

  if (!invoice) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(invoice.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isPaid = invoice.status === 'PAID';
  const isCancelled = invoice.status === 'CANCELLED';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Invoice Operational View" size="xl" className="w-full md:w-[880px] md:max-w-[92vw]">
      <div className="space-y-6 text-xs">
        {/* Sticky Identity Header */}
        <div className="sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-base md:text-lg text-[var(--primary)]">
                {invoice.id}
              </span>
              <StatusBadge status={invoice.status} size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {invoice.invoiceType}
              </span>
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Billed To: <strong>{invoice.entityName}</strong> ({invoice.entityCode}) | Billing Period: <strong>{invoice.billingPeriod}</strong>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleCopyId} className="whitespace-nowrap">
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {isCopied ? 'Copied' : 'Copy ID'}
            </Button>

            {onDownload && (
              <Button variant="outline" size="sm" onClick={() => onDownload(invoice)} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download PDF
              </Button>
            )}

            {!isPaid && !isCancelled && onMarkPaid && (
              <Button variant="primary" size="sm" onClick={() => onMarkPaid(invoice)} leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                Mark Paid
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Breakdown
          </button>
          <button
            onClick={() => setActiveTab('SERVICE_TEMPLATE')}
            className={`pb-2.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SERVICE_TEMPLATE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Service Invoice Template</span>
          </button>
          <button
            onClick={() => setActiveTab('LINE_ITEMS')}
            className={`pb-2.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'LINE_ITEMS'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Line Items ({invoice.lineItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`pb-2.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PAYMENTS'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments ({invoice.payments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`pb-2.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Timeline</span>
          </button>
        </div>

        {/* Tab 1: Overview & Breakdown */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Billing Entity & Issuer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title="Billed To (Customer Entity)" subtitle="Recipient business details">
                <div className="space-y-1.5 text-slate-700">
                  <div className="font-bold text-sm text-slate-900">{invoice.entityName}</div>
                  <div className="text-[11px] font-mono text-purple-700 font-semibold">{invoice.entityType} • {invoice.entityCode}</div>
                  <div>GSTIN: <strong className="font-mono text-slate-900">{invoice.gstin || '36ABCDE1234F1Z5'}</strong></div>
                  <div className="text-slate-500">{invoice.billingAddress || 'Hitech City, Hyderabad, Telangana'}</div>
                </div>
              </Card>

              <Card title="Issuer (Platform Operations)" subtitle="Billing issuing authority">
                <div className="space-y-1.5 text-slate-700">
                  <div className="font-bold text-sm text-slate-900">Qin Star Pay Operations Engine Ltd.</div>
                  <div className="text-[11px] font-mono text-slate-500">CIN: U72900TG2026PTC189912</div>
                  <div>GSTIN: <strong className="font-mono text-slate-900">36QSPAY9981P1Z0</strong></div>
                  <div className="text-slate-500">Corporate Finance Tower, Financial District, Gachibowli, Hyderabad - 500032</div>
                </div>
              </Card>
            </div>

            {/* Financial Breakdown Card */}
            <Card title="Configurable Financial Breakdown" subtitle="Exact GST & TDS calculation engine">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-mono">
                <div className="flex justify-between text-slate-700">
                  <span>Platform / Service Taxable Fee:</span>
                  <span className="font-bold">{formatCurrency(invoice.taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>GST (@{invoice.gstRate}%):</span>
                  <span className="font-bold">+{formatCurrency(invoice.gstAmount)}</span>
                </div>

                {invoice.cgstAmount > 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                    <span>CGST (@{invoice.gstRate / 2}%):</span>
                    <span>{formatCurrency(invoice.cgstAmount)}</span>
                  </div>
                )}
                {invoice.sgstAmount > 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                    <span>SGST (@{invoice.gstRate / 2}%):</span>
                    <span>{formatCurrency(invoice.sgstAmount)}</span>
                  </div>
                )}
                {invoice.igstAmount > 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                    <span>IGST (@{invoice.gstRate}%):</span>
                    <span>{formatCurrency(invoice.igstAmount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 my-1 pt-1 flex justify-between font-bold text-slate-900">
                  <span>Gross Invoice Amount:</span>
                  <span>{formatCurrency(invoice.grossAmount)}</span>
                </div>

                {invoice.tdsApplicable && (
                  <div className="flex justify-between text-amber-700">
                    <span>TDS Deducted (@{invoice.tdsRate}%):</span>
                    <span className="font-bold">-{formatCurrency(invoice.tdsAmount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-extrabold text-[var(--primary)]">
                  <span>Net Receivable Amount:</span>
                  <span>{formatCurrency(invoice.netReceivable)}</span>
                </div>

                <div className="flex justify-between text-xs text-emerald-700 pt-1">
                  <span>Total Received / Paid:</span>
                  <span className="font-bold">{formatCurrency(invoice.paidAmount)}</span>
                </div>

                <div className="flex justify-between text-xs text-rose-700 font-bold">
                  <span>Outstanding Balance Due:</span>
                  <span>{formatCurrency(invoice.outstandingAmount)}</span>
                </div>
              </div>
            </Card>

            {/* Financial References Card */}
            <Card title="Cross-Module Financial References" subtitle="Linked transaction, settlement & ledger identifiers">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Target Wallet</span>
                  <span className="font-mono font-bold text-xs text-[var(--primary)] block">{invoice.walletId}</span>
                  <Link href="/admin/wallet/balances">
                    <span className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline mt-1">
                      <span>View Wallet</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Linked Transaction</span>
                  <span className="font-mono font-bold text-xs text-[var(--primary)] block">
                    {invoice.transactionIds[0] || 'QSP20260903001'}
                  </span>
                  <Link href={`/admin/transactions/${invoice.transactionIds[0] || 'QSP20260903001'}`}>
                    <span className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline mt-1">
                      <span>View Transaction</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Linked Settlement</span>
                  <span className="font-mono font-bold text-xs text-[var(--primary)] block">
                    {invoice.settlementIds[0] || 'SET_20260903_001'}
                  </span>
                  <Link href="/admin/settlements">
                    <span className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline mt-1">
                      <span>View Settlement</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Ledger Reference</span>
                  <span className="font-mono font-bold text-xs text-[var(--primary)] block">
                    {invoice.ledgerEntryIds[0] || 'led_001'}
                  </span>
                  <Link href={`/admin/wallet/ledger?searchQuery=${invoice.walletId}`}>
                    <span className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline mt-1">
                      <span>View Ledger Log</span>
                      <BookOpen className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Service Template View */}
        {activeTab === 'SERVICE_TEMPLATE' && (
          <ServiceInvoiceRenderer invoice={invoice} />
        )}

        {/* Tab 3: Line Items */}
        {activeTab === 'LINE_ITEMS' && (
          <Card title="Invoice Line Item Details" subtitle="Billed services and platform fee items">
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Reference ID</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Taxable</th>
                    <th className="p-2.5 text-right">GST (@{invoice.gstRate}%)</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-sans font-medium text-slate-900">{item.description}</td>
                      <td className="p-2.5 text-slate-500">{item.referenceId || 'N/A'}</td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.rate)}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.taxableAmount)}</td>
                      <td className="p-2.5 text-right text-purple-700">+{formatCurrency(item.gstAmount)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'PAYMENTS' && (
          <Card title="Payment Clearance Records" subtitle="Received collections and UTR confirmations">
            {invoice.payments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No payment receipts recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoice.payments.map((pmt) => (
                  <div key={pmt.paymentId} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono font-bold text-xs text-emerald-700">
                        Received: {formatCurrency(pmt.amount)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        UTR: <strong className="font-mono text-slate-800">{pmt.utr}</strong> • Received by {pmt.receivedBy}
                      </div>
                      {pmt.remarks && <div className="text-[11px] text-slate-600 italic mt-0.5">{pmt.remarks}</div>}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-mono block">{formatDate(pmt.paymentDate)}</span>
                      <StatusBadge status="PAID" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tab 4: Timeline */}
        {activeTab === 'TIMELINE' && (
          <Card title="Invoice Lifecycle Timeline" subtitle="Chronological audit trail">
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 py-2">
              {invoice.timeline.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[var(--primary)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{evt.event}</span>
                      <span className="text-[11px] font-mono text-slate-400">{formatDate(evt.timestamp)}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-purple-700">By: {evt.actor}</div>
                    <p className="text-slate-600 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Drawer>
  );
};
