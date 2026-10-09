'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KYCDocument } from '@/types/domain';
import { kycService } from '@/services/kycService';
import { AlertCircle, CheckCircle2, ExternalLink, FileText, Loader2, ZoomIn, ZoomOut } from 'lucide-react';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: KYCDocument | null;
  onVerify: (docId: string) => void | Promise<void>;
  onReject: (docId: string, reason: string) => void | Promise<void>;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document: doc, onVerify, onReject }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !doc) return;
    let active = true;
    let objectUrl = '';
    setLoading(true); setError(''); setZoom(1); setIsRejecting(false); setReason('');
    void kycService.getDocumentBlob(doc.id).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }).catch((err: Error) => active && setError(err.message || 'Unable to load this document.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); setPreviewUrl(null); };
  }, [isOpen, doc]);

  if (!doc) return null;
  const mime = doc.mimeType || (doc.fileName?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
  const isPdf = mime.includes('pdf');

  const verify = async () => { setSubmitting(true); try { await onVerify(doc.id); onClose(); } finally { setSubmitting(false); } };
  const reject = async (event: React.FormEvent) => {
    event.preventDefault(); if (!reason.trim()) return;
    setSubmitting(true); try { await onReject(doc.id, reason.trim()); onClose(); } finally { setSubmitting(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={`Review ${doc.title}`} size="xl">
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-900">{doc.fileName || doc.title}</div><div className="text-xs text-slate-500">{mime}{doc.sizeBytes ? ` • ${(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB` : ''}</div></div>
        <div className="flex items-center gap-2"><StatusBadge status={doc.status} size="sm" />{previewUrl && <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}>Open</Button>}</div>
      </div>

      <div className="relative flex min-h-[420px] max-h-[62vh] items-center justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-100/70 p-3">
        {loading && <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />Loading uploaded document…</div>}
        {!loading && error && <div className="max-w-md text-center text-sm text-rose-700"><AlertCircle className="mx-auto mb-2 h-8 w-8" />{error}</div>}
        {!loading && !error && previewUrl && (isPdf ? <iframe title={doc.title} src={previewUrl} className="h-[58vh] min-h-[420px] w-full rounded-lg bg-white" /> : <img src={previewUrl} alt={doc.title} className="max-h-[58vh] max-w-full rounded-lg object-contain shadow-sm transition-transform" style={{ transform: `scale(${zoom})` }} />)}
        {!loading && !error && !previewUrl && <div className="text-center text-sm text-slate-500"><FileText className="mx-auto mb-2 h-8 w-8" />Preview unavailable.</div>}
      </div>

      {!isPdf && previewUrl && <div className="flex justify-center gap-2"><Button variant="outline" size="sm" onClick={() => setZoom((v) => Math.max(.5, v - .25))} leftIcon={<ZoomOut className="h-4 w-4" />}>Zoom out</Button><span className="self-center text-xs font-semibold text-slate-600">{Math.round(zoom * 100)}%</span><Button variant="outline" size="sm" onClick={() => setZoom((v) => Math.min(3, v + .25))} leftIcon={<ZoomIn className="h-4 w-4" />}>Zoom in</Button></div>}

      {isRejecting ? <form onSubmit={reject} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <Input label="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Clearly explain why this document is rejected" required />
        <div className="mt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button><Button type="submit" variant="danger" isLoading={submitting} disabled={!reason.trim()}>Confirm rejection</Button></div>
      </form> : <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button variant="outline" onClick={() => setIsRejecting(true)} disabled={submitting}>Reject document</Button><Button variant="primary" onClick={() => void verify()} isLoading={submitting} leftIcon={<CheckCircle2 className="h-4 w-4" />}>Verify document</Button></div>}
    </div>
  </Modal>;
};
