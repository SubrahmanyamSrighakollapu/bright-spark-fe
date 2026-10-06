'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import { FileText, Save, Eye, History, Plus, Trash2, Edit } from 'lucide-react';

export interface TermsSection {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const INITIAL_SECTIONS: TermsSection[] = [
  {
    id: 'sec_1',
    title: '1. User Onboarding & Account Safety',
    content: 'All registered Master Distributors, Distributors, and Retailers must complete mandatory biometric Aadhaar and PAN verification prior to initiating wallet payouts.',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'sec_2',
    title: '2. Wallet Balance & Transaction Liabilities',
    content: 'Wallet balances represent prepaid settlement funds. Minimum safety balances must be maintained at all times. Qin Star Pay reserves the right to hold funds on flagged suspicious activities.',
    updatedAt: '2026-09-10T12:00:00Z',
  },
  {
    id: 'sec_3',
    title: '3. Agriculture Produce Settlement SLA',
    content: 'Crop procurement payouts are executed upon APMC receipt generation. Dispute claims must be submitted within 24 hours of transaction completion.',
    updatedAt: '2026-09-20T16:00:00Z',
  },
];

const AUDIT_LOGS = [
  { version: 'v3.1', editor: 'Admin User (US-001)', changes: 'Updated Section 2 wallet buffer clause', date: '2026-09-20T16:00:00Z' },
  { version: 'v3.0', editor: 'Admin User (US-001)', changes: 'Added Section 3 APMC crop SLA guidelines', date: '2026-09-10T12:00:00Z' },
  { version: 'v2.9', editor: 'Compliance Officer', changes: 'Initial baseline platform terms setup', date: '2026-09-01T10:00:00Z' },
];

export const TermsAndConditionsView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [sections, setSections] = useState<TermsSection[]>(INITIAL_SECTIONS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<TermsSection | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleOpenAdd = () => {
    setEditingSec(null);
    setTitle('');
    setContent('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec: TermsSection) => {
    setEditingSec(sec);
    setTitle(sec.title);
    setContent(sec.content);
    setIsModalOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingSec) {
      setSections((prev) =>
        prev.map((s) => (s.id === editingSec.id ? { ...s, title, content, updatedAt: new Date().toISOString() } : s))
      );
      toastSuccess(`Updated section "${title}"`);
    } else {
      const newSec: TermsSection = {
        id: `sec_${Date.now()}`,
        title,
        content,
        updatedAt: new Date().toISOString(),
      };
      setSections([...sections, newSec]);
      toastSuccess(`Added section "${title}"`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    toastInfo('Section deleted.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#155EEF]" />
            Terms & Conditions Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Maintain legal user service agreements, distributor obligations, and section-by-section platform terms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="w-4 h-4 mr-1.5" />
            Preview Terms
          </Button>
          <Button variant="primary" onClick={handleOpenAdd} className="bg-[#155EEF] hover:bg-[#124BCC]">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <div className="lg:col-span-2 space-y-4">
          {sections.map((sec) => (
            <Card key={sec.id} className="p-5 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A]">{sec.title}</h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(sec)}
                    className="h-8 px-2 text-[#155EEF]"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSection(sec.id)}
                    className="h-8 px-2 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">{sec.content}</p>
              <div className="text-[11px] text-[#64748B] pt-1 border-t border-[#F1F5F9]">
                Last modified: {formatDateTime(sec.updatedAt)}
              </div>
            </Card>
          ))}
        </div>

        {/* Audit Log */}
        <div>
          <Card className="p-5 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#155EEF]" /> Policy Edits Audit Log
            </h3>
            <div className="space-y-3">
              {AUDIT_LOGS.map((log, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#0F172A]">
                    <span>{log.version}</span>
                    <span className="text-[10px] text-[#64748B] font-normal">{formatDateTime(log.date)}</span>
                  </div>
                  <div className="text-[#334155]">{log.changes}</div>
                  <div className="text-[10px] text-[#64748B]">{log.editor}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Section Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSec ? 'Edit Agreement Section' : 'Add Terms Section'}
        >
          <form onSubmit={handleSaveSection} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Section Title</label>
              <Input
                placeholder="e.g. 4. Discrepancy & Dispute Resolution"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Section Content Body</label>
              <textarea
                rows={5}
                placeholder="Enter detailed legal terms text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-[#155EEF]">
                Save Section
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="End-User Terms & Conditions Preview"
        >
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 text-xs text-[#0F172A]">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs font-semibold">
              Legal Master Agreement — Qin Star Pay Platform
            </div>
            {sections.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="font-bold text-sm text-[#0F172A]">{s.title}</div>
                <div className="text-xs text-[#334155] leading-relaxed">{s.content}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
