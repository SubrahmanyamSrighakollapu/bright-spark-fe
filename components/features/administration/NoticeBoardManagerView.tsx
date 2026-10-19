'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import { headlineAlertService, NoticeBoardItem } from '@/services/headlineAlertService';
import { Bell, Plus, Edit, Trash2, AlertTriangle, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { useConfirmation } from '@/context/ConfirmationContext';

export const NoticeBoardManagerView: React.FC = () => {
  const { toastSuccess, toastInfo, toastError } = useToast();
  const confirmAction = useConfirmation();
  const [notices, setNotices] = useState<NoticeBoardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeBoardItem | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<'Information' | 'Important' | 'Urgent Alert'>('Information');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2026-10-31');

  const fetchNotices = async () => {
    setIsLoading(true);
    const res = await headlineAlertService.getNotices();
    if (res.success && res.data) {
      setNotices(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeType('Information');
    setPublishDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('2026-10-31');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice: NoticeBoardItem) => {
    setEditingNotice(notice);
    setNoticeTitle(notice.noticeTitle);
    setNoticeContent(notice.noticeContent);
    setNoticeType(notice.noticeType);
    setPublishDate(notice.publishDate.split('T')[0]);
    setExpiryDate(notice.expiryDate.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      toastError('Please fill in notice title and content.');
      return;
    }

    if (editingNotice) {
      const res = await headlineAlertService.updateNotice(editingNotice.id, {
        noticeTitle: noticeTitle.trim(),
        noticeContent: noticeContent.trim(),
        noticeType,
        publishDate: `${publishDate}T00:00:00Z`,
        expiryDate: `${expiryDate}T23:59:59Z`,
      });
      if (res.success) {
        toastSuccess(`Notice "${noticeTitle}" updated!`);
        fetchNotices();
        setIsModalOpen(false);
      } else {
        toastError('Failed to update notice.');
      }
    } else {
      const res = await headlineAlertService.createNotice({
        noticeTitle: noticeTitle.trim(),
        noticeContent: noticeContent.trim(),
        noticeType,
        publishDate: `${publishDate}T00:00:00Z`,
        expiryDate: `${expiryDate}T23:59:59Z`,
      });
      if (res.success) {
        toastSuccess('Platform notice created & scheduled!');
        fetchNotices();
        setIsModalOpen(false);
      } else {
        toastError('Failed to create notice.');
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!(await confirmAction({ title: 'Delete notice?', message: `Delete “${title}” from the notice board? This cannot be undone.`, confirmText: 'Yes, delete notice', variant: 'danger' }))) return;
    const res = await headlineAlertService.deleteNotice(id);
    if (res.success) {
      toastInfo(`Notice "${title}" deleted.`);
      fetchNotices();
    } else {
      toastError('Failed to delete notice.');
    }
  };

  const getTypeBadge = (type: NoticeBoardItem['noticeType']) => {
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

  const columns: ColumnDefinition<NoticeBoardItem>[] = [
    {
      key: 'noticeTitle',
      header: 'Headline & Content',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-bold text-slate-900 text-sm mb-0.5">{row.noticeTitle}</div>
          <div className="text-xs text-slate-500 line-clamp-2">{row.noticeContent}</div>
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
        <div className="text-xs space-y-0.5 text-slate-700 font-mono">
          <div>
            <span className="text-slate-400">Pub:</span> {row.publishDate.split('T')[0]}
          </div>
          <div>
            <span className="text-slate-400">Exp:</span> {row.expiryDate.split('T')[0]}
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
            className="h-8 px-2 text-[#2F6F5E] hover:bg-[#F3F7E9]"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#2F6F5E]" />
            Notice Board & Bulletin Manager
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create modal bulletin announcements and platform notice banners for user downlines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotices} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="bg-[#2F6F5E] text-white font-bold">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Notice
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-2xl space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading Notice Board items...</div>
        ) : (
          <Table columns={columns} data={notices} keyExtractor={(n) => n.id} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Bell className="w-5 h-5 text-[#2F6F5E]" />
            <span>{editingNotice ? 'Edit Platform Notice' : 'Publish Platform Notice'}</span>
          </div>
        }
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="notice-form" variant="primary" size="sm" className="bg-[#2F6F5E] text-white font-bold">
              {editingNotice ? 'Save Notice' : 'Publish Notice'}
            </Button>
          </>
        }
      >
        <form id="notice-form" onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
            <Select
              label="Notice Type"
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value as any)}
              options={[
                { label: 'Information (Blue)', value: 'Information' },
                { label: 'Important (Yellow)', value: 'Important' },
                { label: 'Urgent Alert (Red)', value: 'Urgent Alert' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Content (noticeContent) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Detailed announcement text..."
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#2F6F5E]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Publish Date</label>
              <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
