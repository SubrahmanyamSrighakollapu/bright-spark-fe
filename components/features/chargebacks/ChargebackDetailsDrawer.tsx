'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui/Drawer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Chargeback } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Copy,
  Check,
  UserCheck,
  ShieldCheck,
  Send,
  Upload,
  Clock,
  Eye,
  FileText,
} from 'lucide-react';

export interface ChargebackDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chargeback: Chargeback | null;
  onAssign?: (chargeback: Chargeback) => void;
  onResolve?: (chargeback: Chargeback) => void;
  onAddEvidence?: (chargebackId: string, docType: string, fileName: string) => Promise<void>;
  onSubmitResponse?: (chargebackId: string, summary: string, explanation: string) => Promise<void>;
}

export const ChargebackDetailsDrawer: React.FC<ChargebackDetailsDrawerProps> = ({
  isOpen,
  onClose,
  chargeback,
  onAssign,
  onResolve,
  onAddEvidence,
  onSubmitResponse,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVIDENCE' | 'RESPONSE' | 'TIMELINE'>('OVERVIEW');

  // Evidence Form State
  const [docType, setDocType] = useState('Proof of Delivery');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Response Form State
  const [responseSummary, setResponseSummary] = useState('');
  const [merchantExplanation, setMerchantExplanation] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  if (!chargeback) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(chargeback.chargebackId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !onAddEvidence) return;
    setIsUploading(true);
    await onAddEvidence(chargeback.chargebackId, docType, fileName);
    setFileName('');
    setIsUploading(false);
  };

  const handleSubmitRepresentment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseSummary.trim() || !onSubmitResponse) return;
    setIsSubmittingResponse(true);
    await onSubmitResponse(chargeback.chargebackId, responseSummary, merchantExplanation);
    setIsSubmittingResponse(false);
  };

  const isClosed = chargeback.status === 'WON' || chargeback.status === 'LOST' || chargeback.status === 'CLOSED';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Dispute Case Operational View" size="xl" className="w-full md:w-[880px] md:max-w-[92vw]">
      <div className="space-y-6 text-xs">
        {/* Sticky Identity Header */}
        <div className="sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-base md:text-lg text-[var(--primary)]">
                {chargeback.chargebackId}
              </span>
              <StatusBadge status={chargeback.status} size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                {chargeback.priority}
              </span>
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Retailer: <strong>{chargeback.entityName}</strong> | Disputed Amount: <strong className="text-rose-700 font-mono">{formatCurrency(chargeback.disputedAmount)}</strong>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleCopyId} className="whitespace-nowrap">
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {isCopied ? 'Copied' : 'Copy ID'}
            </Button>

            {!isClosed && onAssign && (
              <Button variant="outline" size="sm" onClick={() => onAssign(chargeback)} leftIcon={<UserCheck className="w-3.5 h-3.5" />}>
                Assign
              </Button>
            )}

            {!isClosed && onResolve && (
              <Button variant="primary" size="sm" onClick={() => onResolve(chargeback)} leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Resolve Case
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Financials
          </button>
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence ({chargeback.evidence.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RESPONSE')}
            className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'RESPONSE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Representment Response</span>
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Case Timeline</span>
          </button>
        </div>

        {/* Tab 1: Overview & Financials */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Linked Transaction Card */}
            <Card title="Linked Transaction Information" subtitle="Original payment record details">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[var(--primary)]">{chargeback.transactionId}</span>
                    <span className="text-[11px] font-mono text-slate-500">Order: {chargeback.orderId || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Provider: <strong>{chargeback.provider}</strong> • Network: <strong>{chargeback.cardNetworkOrSource || 'Visa/Mastercard'}</strong>
                  </div>
                </div>

                <Link href={`/transactions/${chargeback.transactionId}`}>
                  <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    View Transaction Details
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Financial Impact Breakdown */}
            <Card title="Financial Impact & Lien Hold Status" subtitle="Wallet balance hold allocation">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500">Disputed Amount</span>
                  <div className="mt-1 text-base font-extrabold text-rose-700">{formatCurrency(chargeback.disputedAmount)}</div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-amber-800">Lien Hold Balance</span>
                  <div className="mt-1 text-base font-extrabold text-amber-900">{formatCurrency(chargeback.holdAmount)}</div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-emerald-800">Recovered Amount</span>
                  <div className="mt-1 text-base font-extrabold text-emerald-900">{formatCurrency(chargeback.recoveredAmount)}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500">Final Booked Loss</span>
                  <div className="mt-1 text-base font-extrabold text-slate-900">{formatCurrency(chargeback.finalLoss)}</div>
                </div>
              </div>
            </Card>

            {/* Dispute Case Summary */}
            <Card title="Dispute Case Metadata" subtitle="Issuer filing details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Reason Code:</span>
                    <span className="font-bold text-slate-900">{chargeback.reasonCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Filing Date:</span>
                    <span className="font-mono text-slate-800">{formatDate(chargeback.filingDate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Response Deadline:</span>
                    <span className="font-mono font-bold text-rose-700">{formatDate(chargeback.responseDueDate)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Assigned Team Lead:</span>
                    <span className="font-semibold text-slate-900">{chargeback.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Target Wallet ID:</span>
                    <span className="font-mono text-slate-800">{chargeback.walletId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Gateway Provider:</span>
                    <span className="font-semibold text-slate-800">{chargeback.provider}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                <span className="font-bold block text-slate-900 mb-0.5">Dispute Reason Details:</span>
                {chargeback.reason}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Evidence Management */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-6">
            {!isClosed && (
              <Card title="Attach Representment Evidence" subtitle="Upload proof of delivery, customer communications, or invoice">
                <form onSubmit={handleUploadEvidence} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Document Category"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      options={[
                        { value: 'Proof of Delivery', label: 'Proof of Delivery (POD)' },
                        { value: 'Invoice', label: 'Order Invoice' },
                        { value: 'Customer Communication', label: 'Customer Email/Chat Thread' },
                        { value: 'KYC / Verification Proof', label: 'KYC / Customer Verification' },
                        { value: 'Service Completion Proof', label: 'Service Completion Receipt' },
                      ]}
                    />

                    <Input
                      label="File Name"
                      placeholder="e.g. Delivery_Receipt_9901.pdf"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" type="submit" isLoading={isUploading} leftIcon={<Upload className="w-3.5 h-3.5" />}>
                      Upload Document Evidence
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card title="Attached Evidence Documents" subtitle="Evidence payload to be submitted to card issuer">
              {chargeback.evidence.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No evidence documents uploaded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {chargeback.evidence.map((ev) => (
                    <div key={ev.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{ev.fileName}</div>
                          <div className="text-[11px] text-slate-400">
                            {ev.documentType} • {ev.fileSize || '500 KB'} • Uploaded by {ev.uploadedBy}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={ev.status} size="sm" />
                        <Button variant="outline" size="sm" className="px-2" title="Preview Document">
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 3: Representment Response */}
        {activeTab === 'RESPONSE' && (
          <div className="space-y-6">
            {!isClosed && chargeback.status !== 'RESPONDED' ? (
              <Card title="Submit Representment Package" subtitle="Formal dispute response to card network">
                <form onSubmit={handleSubmitRepresentment} className="space-y-4">
                  <Input
                    label="Response Summary Title"
                    placeholder="e.g. Valid delivery confirmation and customer authorization provided."
                    value={responseSummary}
                    onChange={(e) => setResponseSummary(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Retailer Detailed Explanation</label>
                    <textarea
                      placeholder="State detailed transaction history, delivery carrier tracking URL, customer interaction log..."
                      value={merchantExplanation}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMerchantExplanation(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans text-slate-900 focus:outline-hidden focus:border-[var(--primary)]"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingResponse} leftIcon={<Send className="w-3.5 h-3.5" />}>
                      Submit Representment Response
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card title="Submitted Representment Package" subtitle="Official response payload sent to provider">
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Summary:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{chargeback.responseSummary || 'Representment submitted.'}</p>
                  </div>
                  {chargeback.merchantExplanation && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Retailer Explanation:</span>
                      <p className="text-slate-700 mt-0.5">{chargeback.merchantExplanation}</p>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                    Submitted by <strong>{chargeback.submittedBy || 'Risk Manager'}</strong> on {formatDate(chargeback.submittedAt || chargeback.createdAt)}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 4: Case Timeline */}
        {activeTab === 'TIMELINE' && (
          <Card title="Dispute Case History Timeline" subtitle="Chronological audit record">
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 py-2">
              {chargeback.timeline.map((evt, idx) => (
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
