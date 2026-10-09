'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DocumentViewerModal } from './DocumentViewerModal';
import { KYCApplication, KYCDocument } from '@/types/domain';
import { kycService } from '@/services/kycService';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/components/ui/Toast';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export interface KYCReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: KYCApplication | null;
  onRefresh?: () => void;
}

export const KYCReviewDrawer: React.FC<KYCReviewDrawerProps> = ({
  isOpen,
  onClose,
  application: initialApp,
  onRefresh,
}) => {
  const { toastSuccess, toastError } = useToast();
  const [app, setApp] = useState<KYCApplication | null>(initialApp);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);

  useEffect(() => { setApp(initialApp); }, [initialApp]);

  if (!app) return null;

  const handleVerifyDoc = async (docId: string) => {
    try {
      const res = await kycService.verifyDocument(app.id, docId);
      if (!res.success || !res.data) throw new Error('Document verification failed.');
      setApp(res.data); toastSuccess('Document verified.'); onRefresh?.();
    } catch (error: any) { toastError(error?.message || 'Document verification failed.'); throw error; }
  };

  const handleRejectDoc = async (docId: string, reason: string) => {
    try {
      const res = await kycService.rejectDocument(app.id, docId, reason);
      if (!res.success || !res.data) throw new Error('Document rejection failed.');
      setApp(res.data); toastSuccess('Document rejected.'); onRefresh?.();
    } catch (error: any) { toastError(error?.message || 'Document rejection failed.'); throw error; }
  };

  const handleFinalDecision = async () => {
    if (!decisionMode) return;
    if (!remarks.trim()) { toastError('Reviewer remarks are required.'); return; }
    setIsSubmitting(true);
    try {
      if (decisionMode === 'APPROVE') {
        const res = await kycService.approveKYC(app.id, remarks.trim());
        if (!res.success || !res.data) throw new Error('KYC approval failed.');
        setApp(res.data); toastSuccess('KYC approved and the user account is now active.');
      } else if (decisionMode === 'REJECT') {
        const res = await kycService.rejectKYC(app.id, remarks.trim());
        if (!res.success || !res.data) throw new Error('KYC rejection failed.');
        setApp(res.data); toastSuccess('KYC rejected and account access remains disabled.');
      }
      onRefresh?.();
      setDecisionMode(null);
      setRemarks('');
    } catch (error: any) {
      toastError(error?.message || 'Unable to save the KYC decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`KYC Review — ${app.entityName}`}
      size="lg"
      className="p-0 bg-[var(--bg-app)] w-full md:w-[880px] md:max-w-[92vw]"
    >
      <div className="space-y-6">
        {/* Sticky Identity Header */}
        <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-base md:text-lg text-slate-900">{app.entityName}</span>
              {app.entityCode && <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[10px] font-bold text-[var(--primary)]">{app.entityCode}</span>}
              <StatusBadge status={app.status} size="sm" />
              {app.riskLevel && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    app.riskLevel === 'LOW'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {app.riskLevel} RISK
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {app.entityType.replaceAll('_', ' ')} · Submitted <strong>{formatDate(app.submittedAt)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {app.status !== 'APPROVED' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setDecisionMode('REJECT')}>
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" /> Reject
                </Button>
                <Button variant="primary" size="sm" onClick={() => setDecisionMode('APPROVE')}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Approve KYC
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Decision Form Block (if triggered) */}
        {decisionMode && (
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg space-y-3 text-xs">
            <div className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
              Confirm KYC {decisionMode} Decision
            </div>
            <Input
              label="Reviewer Remarks / Feedback *"
              placeholder="Provide approval or rejection notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDecisionMode(null)}>
                Cancel
              </Button>
              <Button
                variant={decisionMode === 'APPROVE' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleFinalDecision}
                isLoading={isSubmitting}
                disabled={!remarks.trim()}
              >
                Confirm {decisionMode}
              </Button>
            </div>
          </div>
        )}

        {/* Main Grid: Details & Documents */}
        <div className="text-xs">
          <Card title="User Details" subtitle="Account being reviewed">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">User Name:</span>
                <span className="font-semibold">{app.entityName}</span>
              </div>
              <div className={`flex justify-between py-1 border-b border-slate-100 ${app.businessName === app.entityName ? 'hidden' : ''}`}>
                <span className="text-slate-500">Business Name:</span>
                <span className="font-semibold">{app.businessName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold">{app.entityType.replaceAll('_', ' ')}</span>
              </div>
              <div className="hidden">
                <span className="text-slate-500">PAN Number:</span>
                <span className="font-mono">{app.panNumberMasked}</span>
              </div>
              <div className="hidden">
                <span className="text-slate-500">GST Number:</span>
                <span className="font-mono">{app.gstNumber || '—'}</span>
              </div>
            </div>
          </Card>

          <Card title="Review Status & Assigned Officer" subtitle="Compliance audit track" className="hidden">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Review Status:</span>
                <StatusBadge status={app.status} size="sm" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assigned Officer:</span>
                <span className="font-semibold">{app.assignedTo || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reviewed By:</span>
                <span>{app.reviewedBy || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Review Remarks:</span>
                <span className="font-semibold text-slate-800">{app.remarks || '—'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Documents Review Section */}
        <Card title="Uploaded KYC Documents" subtitle="Inspect and verify each required onboarding document">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {app.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                    <FileText className="w-4 h-4 text-[var(--primary)] shrink-0" />
                    <span>{doc.title.replaceAll('_', ' ')}</span>
                  </div>
                  {doc.documentNumberMasked && <div className="font-mono text-[11px] text-slate-500">{doc.documentNumberMasked}</div>}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <StatusBadge status={doc.status} size="sm" />
                  <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)}>
                    Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Review Timeline */}
        <Card title="KYC Audit Timeline" subtitle="Chronological review events">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
            {app.timeline.map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 bg-white p-0.5 rounded-full ring-2 ring-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{event.event}</span>
                    <span className="font-mono text-[10px] text-slate-400">{event.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{event.remarks} (by {event.user})</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Document Inspector Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onVerify={handleVerifyDoc}
        onReject={handleRejectDoc}
      />
    </Drawer>
  );
};
