import React, { useState } from 'react';
import { PendingApprovalItem } from '@/services/approvalService';
import { Drawer, StatusBadge, Button, ConfirmationDialog } from '@/components/ui';
import { DocumentViewerModal } from '@/components/features/kyc/DocumentViewerModal';
import { KYCDocument } from '@/types/domain';
import { formatDateTime } from '@/utils/formatters';
import {
  Building2,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
} from 'lucide-react';

interface ApprovalDetailDrawerProps {
  item: PendingApprovalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (item: PendingApprovalItem) => void;
  onReject: (item: PendingApprovalItem) => void;
  onRefresh?: () => void;
}

export const ApprovalDetailDrawer: React.FC<ApprovalDetailDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);

  if (!item) return null;

  const handleConfirmApprove = () => {
    setConfirmApproveOpen(false);
    onClose();
    onApprove(item);
  };

  const fallbackDocs: KYCDocument[] = [
    {
      id: `doc_aadhaar_${item.id}`,
      title: 'Aadhaar Card (UIDAI Proof)',
      type: 'AADHAAR',
      documentNumberMasked: 'XXXX-XXXX-9842',
      status: 'VERIFIED',
      uploadedAt: item.createdAt,
    },
    {
      id: `doc_pan_${item.id}`,
      title: 'PAN Card (IT Dept)',
      type: 'PAN',
      documentNumberMasked: 'ABCDE1234F',
      status: 'VERIFIED',
      uploadedAt: item.createdAt,
    },
    {
      id: `doc_gst_${item.id}`,
      title: 'GSTIN Certificate (Reg-06)',
      type: 'GST_CERTIFICATE',
      documentNumberMasked: '27ABCDE1234F1Z5',
      status: 'VERIFIED',
      uploadedAt: item.createdAt,
    },
    {
      id: `doc_bank_${item.id}`,
      title: 'Cancelled Cheque / Bank Passbook',
      type: 'CANCELLED_CHEQUE',
      documentNumberMasked: 'HDFC0001234 — 987654321',
      status: 'VERIFIED',
      uploadedAt: item.createdAt,
    },
  ];
  const documents = item.rawEntity.documents || [];

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        title={
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {item.code}
            </span>
          </div>
        }
        description={`${item.businessName} • ${item.entityType}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            <div className="flex items-center gap-2">
              {item.approvalStatus === 'PENDING_APPROVAL' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onReject(item);
                    }}
                    leftIcon={<XCircle className="w-4 h-4 text-rose-600" />}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                  >
                    Reject
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => setConfirmApproveOpen(true)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="font-semibold"
                  >
                    Approve & Activate
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Status Header */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Approval Status</p>
                <div className="mt-1">
                  <StatusBadge
                    status={item.approvalStatus}
                    label={
                      item.approvalStatus === 'PENDING_APPROVAL'
                        ? 'Pending Admin Approval'
                        : item.approvalStatus === 'REJECTED'
                        ? 'Rejected'
                        : 'Approved'
                    }
                  />
                </div>
              </div>
              <div className="h-8 w-px bg-slate-300" />
              <div>
                <p className="text-xs text-slate-500 font-medium">KYC Status</p>
                <div className="mt-1">
                  <StatusBadge status={item.kycStatus || 'APPROVED'} />
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Submitted On</p>
              <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDateTime(item.createdAt)}
              </p>
            </div>
          </div>

          {/* Profile & Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <User className="w-4 h-4 text-indigo-600" /> Contact Profile
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Full Name:</span>{' '}
                  <span className="font-semibold text-slate-900">{item.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>{' '}
                  <span className="font-mono text-slate-800">{item.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Mobile:</span>{' '}
                  <span className="font-mono text-slate-800">+91 {item.mobile}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-600" /> Business Credentials
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Business Entity Name:</span>{' '}
                  <span className="font-semibold text-slate-900">{item.businessName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Entity Type:</span>{' '}
                  <span className="text-slate-800 font-bold">{item.entityType}</span>
                </div>
                {item.planId && (
                  <div>
                    <span className="text-slate-500">Assigned Retailer Plan ID:</span>{' '}
                    <span className="font-mono text-indigo-700 font-semibold">{item.planId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Documents Grid with Visual Document Modal Trigger */}
          {documents.length > 0 && <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[var(--primary)]" /> Uploaded Verification Documents
              </div>
              <span className="text-[11px] text-slate-500">{documents.length} document{documents.length === 1 ? '' : 's'} submitted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{doc.title}</p>
                    <p className="font-mono text-[11px] text-slate-500">{doc.documentNumberMasked}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDoc(doc)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </Drawer>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={confirmApproveOpen}
        onCancel={() => setConfirmApproveOpen(false)}
        onConfirm={handleConfirmApprove}
        title={`Approve ${item.entityType} "${item.code}"?`}
        message={`Are you sure you want to approve onboarding request for ${item.name} (${item.businessName})? This will transition entity approval status to APPROVED and activate login access.`}
        confirmText="Confirm Approval"
        variant="info"
      />

      {/* Visual Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onVerify={() => {}}
        onReject={() => {}}
      />
    </>
  );
};

