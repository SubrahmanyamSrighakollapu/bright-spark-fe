'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import { Bell, Plus, Edit, Trash2, Calendar, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export interface NoticeItem {
  id: string;
  noticeTitle: string;
  noticeContent: string;
  noticeType: 'Information' | 'Important' | 'Urgent Alert';
  publishDate: string;
  expiryDate: string;
  createdAt: string;
}

const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'notice_1',
    noticeTitle: 'New Banking Beneficiary Addition Guideline Update',
    noticeContent: 'All Master Distributors & Retailers must verify Aadhaar OTP before binding new beneficiary bank accounts for instant payout operations.',
    noticeType: 'Important',
    publishDate: '2026-09-20T00:00:00Z',
    expiryDate: '2026-10-31T23:59:59Z',
    createdAt: '2026-09-19T11:00:00Z',
  },
  {
    id: 'notice_2',
    noticeTitle: 'GST Tax Clearance Statement Submission Deadline',
    noticeContent: 'Quarterly GST reconciliation statements are due by 5th October 2026 for all Super Distributor accounts.',
    noticeType: 'Urgent Alert',
    publishDate: '2026-09-22T00:00:00Z',
    expiryDate: '2026-10-05T23:59:59Z',
    createdAt: '2026-09-21T16:00:00Z',
  },
  {
    id: 'notice_3',
    noticeTitle: 'Platform Upgrade v3.4 Deployment Briefing',
    noticeContent: 'Enhanced UI components and real-time wallet settlement features are now live across all portal sections.',
    noticeType: 'Information',
    publishDate: '2026-09-25T00:00:00Z',
    expiryDate: '2026-12-31T23:59:59Z',
    createdAt: '2026-09-24T09:30:00Z',
  },
];

export const NoticeBoardManagerView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<'Information' | 'Important' | 'Urgent Alert'>('Information');
  const [publishDate, setPublishDate] = useState('2026-09-26');
  const [expiryDate, setExpiryDate] = useState('2026-10-26');

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeType('Information');
    setPublishDate('2026-09-26');
    setExpiryDate('2026-10-26');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setNoticeTitle(notice.noticeTitle);
    setNoticeContent(notice.noticeContent);
    setNoticeType(notice.noticeType);
    setPublishDate(notice.publishDate.split('T')[0]);
    setExpiryDate(notice.expiryDate.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    if (editingNotice) {
      setNotices((prev) =>
        prev.map((n) =>
          n.id === editingNotice.id
            ? {
                ...n,
                noticeTitle,
                noticeContent,
                noticeType,
                publishDate: `${publishDate}T00:00:00Z`,
                expiryDate: `${expiryDate}T23:59:59Z`,
              }
            : n
        )
      );
      toastSuccess(`Notice "${noticeTitle}" updated!`);
    } else {
      const newNotice: NoticeItem = {
        id: `notice_${Date.now()}`,
        noticeTitle,
        noticeContent,
        noticeType,
        publishDate: `${publishDate}T00:00:00Z`,
        expiryDate: `${expiryDate}T23:59:59Z`,
        createdAt: new Date().toISOString(),
      };
      setNotices([newNotice, ...notices]);
      toastSuccess('Platform notice created & scheduled!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    toastInfo(`Notice "${title}" deleted.`);
  };

  const getTypeBadge = (type: NoticeItem['noticeType']) => {
    switch (type) {
      case 'Information':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3 h-3" /> Information
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Important
          </span>
        );
      case 'Urgent Alert':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Urgent Alert
          </span>
        );
    }
  };

  const columns: ColumnDefinition<NoticeItem>[] = [
    {
      key: 'noticeTitle',
      header: 'Headline & Content',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-bold text-[#0F172A] text-sm mb-0.5">{row.noticeTitle}</div>
          <div className="text-xs text-[#64748B] line-clamp-2">{row.noticeContent}</div>
        </div>
      ),
    },
    {
      key: 'noticeType',
      header: 'Notice Type',
      render: (row) => getTypeBadge(row.noticeType),
    },
    {
      key: 'publishDate',
      header: 'Schedule Controls',
      render: (row) => (
        <div className="text-xs space-y-0.5 text-[#334155]">
          <div>
            <span className="text-[#64748B]">Pub:</span> {row.publishDate.split('T')[0]}
          </div>
          <div>
            <span className="text-[#64748B]">Exp:</span> {row.expiryDate.split('T')[0]}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 px-2 text-[#155EEF] hover:bg-[#F1F5F9]"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.noticeTitle)}
            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#155EEF]" />
            Notice Board & Bulletin Manager
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Create modal bulletin announcements and platform notice banners for user downlines.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Create Notice
        </Button>
      </div>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={notices} keyExtractor={(n) => n.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingNotice ? 'Edit Platform Notice' : 'Publish Platform Notice'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Notice Title (noticeTitle) <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Banking Beneficiary Verification Notice"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Notice Type
              </label>
              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="Information">Information (Blue)</option>
                <option value="Important">Important (Yellow)</option>
                <option value="Urgent Alert">Urgent Alert (Red)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Notice Content (noticeContent) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Detailed announcement text..."
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Publish Date</label>
                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Expiry Date</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Publish Notice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
