'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KYCDocument } from '@/types/domain';
import { ShieldCheck, ShieldAlert, CheckCircle2, QrCode, User, Building, Landmark, ZoomIn, ZoomOut } from 'lucide-react';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: KYCDocument | null;
  onVerify: (docId: string) => void;
  onReject: (docId: string, reason: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onVerify,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [aadhaarSide, setAadhaarSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!doc) return null;

  const handleVerify = () => {
    onVerify(doc.id);
    onClose();
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onReject(doc.id, rejectionReason.trim());
    setRejectionReason('');
    setIsRejecting(false);
    onClose();
  };

  const renderDocumentVisual = () => {
    if (doc.type === 'AADHAAR' || doc.title.toLowerCase().includes('aadhaar')) {
      return (
        <div className="space-y-3">
          <div className="flex justify-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setAadhaarSide('FRONT')}
              className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                aadhaarSide === 'FRONT' ? 'bg-[var(--primary)] text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Front Side
            </button>
            <button
              type="button"
              onClick={() => setAadhaarSide('BACK')}
              className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                aadhaarSide === 'BACK' ? 'bg-[var(--primary)] text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Back Side
            </button>
          </div>

          <div
            className="w-full max-w-md mx-auto p-4 bg-white border-2 border-amber-300 rounded-xl shadow-md text-slate-900 font-sans transition-transform"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* Tricolor Header */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-t mb-2" />
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-extrabold">
                  🇮🇳
                </div>
                <div className="text-[10px] leading-tight font-extrabold text-slate-800">
                  <div>भारत सरकार</div>
                  <div className="text-[9px] text-slate-600">Government of India</div>
                </div>
              </div>
              <div className="text-right text-[9px] font-bold text-slate-500">
                UIDAI Identity Proof
              </div>
            </div>

            {aadhaarSide === 'FRONT' ? (
              <div className="flex gap-4 items-center">
                <div className="w-24 h-28 bg-slate-100 border border-slate-300 rounded-md flex flex-col items-center justify-center shrink-0">
                  <User className="w-10 h-10 text-slate-400" />
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Photo</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 text-sm">Verified Applicant</div>
                  <div className="text-slate-500 text-[11px]">DOB: 14/08/1988</div>
                  <div className="text-slate-500 text-[11px]">Gender: MALE / पुरुष</div>
                  <div className="pt-2 font-mono font-extrabold text-base tracking-widest text-[var(--primary)]">
                    {doc.documentNumberMasked || 'XXXX XXXX 8912'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Aadhaar OTP Verified
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-1 max-w-[240px]">
                  <div className="font-bold text-slate-700 text-[11px]">Address / पता:</div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Plot No. 42, Sector 18, Commercial Hub, Gurgaon, Haryana - 122001
                  </p>
                  <div className="pt-2 font-mono font-extrabold text-xs text-slate-800">
                    {doc.documentNumberMasked}
                  </div>
                </div>
                <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-800" />
                </div>
              </div>
            )}
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-b mt-3" />
          </div>
        </div>
      );
    }

    if (doc.type === 'PAN' || doc.title.toLowerCase().includes('pan')) {
      return (
        <div
          className="w-full max-w-md mx-auto p-4 bg-sky-50 border-2 border-sky-400 rounded-xl shadow-md text-slate-900 font-sans transition-transform"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <div className="flex items-center justify-between border-b border-sky-200 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] leading-tight font-extrabold text-sky-950">
                <div>INCOME TAX DEPARTMENT</div>
                <div className="text-[9px] text-sky-700">GOVT. OF INDIA / आयकर विभाग</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center text-[9px] font-bold">
              PAN
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-20 h-24 bg-white border border-sky-300 rounded flex flex-col items-center justify-center shrink-0">
              <User className="w-8 h-8 text-sky-400" />
              <div className="mt-2 w-14 h-4 bg-slate-200 border-t border-slate-300 rounded-xs flex items-center justify-center text-[7px] text-slate-500 font-mono">
                Sign
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Permanent Account Number</div>
              <div className="font-mono font-extrabold text-base tracking-wider text-sky-950 bg-white px-2 py-0.5 rounded border border-sky-200 inline-block">
                {doc.documentNumberMasked || 'ABCDE****F'}
              </div>
              <div className="font-bold text-slate-800 text-xs">COMMERCIAL ENTITY HOLDER</div>
              <div className="text-[11px] text-slate-600">Father&apos;s Name: R. K. SHARMA</div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> NSDL Database Matched
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (doc.type === 'GST_CERTIFICATE' || doc.title.toLowerCase().includes('gst')) {
      return (
        <div
          className="w-full max-w-md mx-auto p-4 bg-white border-2 border-emerald-300 rounded-xl shadow-md text-slate-900 font-sans transition-transform"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <div className="text-center border-b border-emerald-200 pb-2 mb-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-emerald-900">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>Government of India — GST Registration Certificate</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">Form GST REG-06</div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Registration Number (GSTIN):</span>
              <span className="font-mono font-bold text-emerald-800">{doc.documentNumberMasked || '07AAAAA0000A1Z5'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Legal Name of Business:</span>
              <span className="font-semibold text-slate-900">Qin Star Retailer Services LLP</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Constitution of Business:</span>
              <span className="text-slate-700">Limited Liability Partnership</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Date of Liability:</span>
              <span className="font-mono text-slate-700">01/04/2024</span>
            </div>
          </div>
        </div>
      );
    }

    // Default Bank Account / Cheque View
    return (
      <div
        className="w-full max-w-md mx-auto p-4 bg-slate-50 border-2 border-slate-300 rounded-xl shadow-md text-slate-900 font-sans transition-transform"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-bold text-xs text-slate-800">Bank Verification Proof / Cancelled Cheque</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">CTS-2010</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Bank Name:</span>
            <span className="font-semibold text-slate-800">HDFC Bank Ltd</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Account Number:</span>
            <span className="font-mono font-bold text-slate-900">{doc.documentNumberMasked || 'XXXXXX8910'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">IFSC Code:</span>
            <span className="font-mono font-semibold text-slate-700">HDFC0001234</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verify ${doc.title}`}
      description={`Document Reference: ${doc.documentNumberMasked}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Zoom Controls */}
        <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
          <span className="font-bold text-[11px]">Inspection Preview (Zoom: {Math.round(zoomLevel * 100)}%)</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.1))}
              className="p-1 hover:bg-slate-200 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-1.5 py-0.5 text-[10px] hover:bg-slate-200 rounded cursor-pointer font-mono"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.1))}
              className="p-1 hover:bg-slate-200 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Document Component */}
        <div className="p-4 bg-slate-100/60 rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center">
          {renderDocumentVisual()}
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <span className="text-slate-500 block text-[11px]">Verification Status</span>
            <StatusBadge status={doc.status} size="sm" />
          </div>
          {doc.rejectionReason && (
            <div className="text-rose-800 text-right text-xs">
              <strong>Rejection Reason:</strong> {doc.rejectionReason}
            </div>
          )}
        </div>

        {/* Action Controls */}
        {isRejecting ? (
          <form onSubmit={handleConfirmReject} className="space-y-3 pt-2 border-t border-slate-200">
            <Input
              label="Reason for Document Rejection *"
              placeholder="e.g. Image blur, details mismatched, document expired"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsRejecting(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit">
                Confirm Rejection
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <Button variant="outline" size="sm" onClick={() => setIsRejecting(true)}>
              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Reject Document
            </Button>

            <Button variant="primary" size="sm" onClick={handleVerify}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Mark Document Verified
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
