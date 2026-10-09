'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import { headlineAlertService, ScrollTickerItem } from '@/services/headlineAlertService';
import { Radio, Plus, Edit, Trash2, Power, Eye, Users, Sparkles, RefreshCw } from 'lucide-react';
import { useConfirmation } from '@/context/ConfirmationContext';

export const ScrollTextManagerView: React.FC = () => {
  const { toastSuccess, toastInfo, toastError } = useToast();
  const confirmAction = useConfirmation();
  const [tickers, setTickers] = useState<ScrollTickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicker, setEditingTicker] = useState<ScrollTickerItem | null>(null);
  const [scrollText, setScrollText] = useState('');
  const [speed, setSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');
  const [targetAudience, setTargetAudience] = useState<'All Users' | 'Distributors Only' | 'Retailers Only'>('All Users');
  const [isActive, setIsActive] = useState(true);

  const fetchTickers = async () => {
    setIsLoading(true);
    const res = await headlineAlertService.getTickers();
    if (res.success && res.data) {
      setTickers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  const handleOpenAdd = () => {
    setEditingTicker(null);
    setScrollText('');
    setSpeed('Normal');
    setTargetAudience('All Users');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticker: ScrollTickerItem) => {
    setEditingTicker(ticker);
    setScrollText(ticker.scrollText);
    setSpeed(ticker.speed);
    setTargetAudience(ticker.targetAudience);
    setIsActive(ticker.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrollText.trim()) {
      toastError('Please enter scroll text content.');
      return;
    }

    if (editingTicker) {
      const res = await headlineAlertService.updateTicker(editingTicker.id, {
        scrollText: scrollText.trim(),
        speed,
        targetAudience,
        isActive,
      });
      if (res.success) {
        toastSuccess('News ticker updated successfully!');
        fetchTickers();
        setIsModalOpen(false);
      } else {
        toastError('Failed to update ticker.');
      }
    } else {
      const res = await headlineAlertService.createTicker({
        scrollText: scrollText.trim(),
        speed,
        targetAudience,
        isActive,
      });
      if (res.success) {
        toastSuccess('New ticker published to downline terminals!');
        fetchTickers();
        setIsModalOpen(false);
      } else {
        toastError('Failed to create ticker.');
      }
    }
  };

  const handleToggle = async (id: string) => {
    const res = await headlineAlertService.toggleTickerStatus(id);
    if (res.success) {
      toastInfo(`Ticker status updated.`);
      fetchTickers();
    } else {
      toastError('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction({ title: 'Delete ticker?', message: 'Delete this ticker from all user dashboards? This cannot be undone.', confirmText: 'Yes, delete ticker', variant: 'danger' }))) return;
    const res = await headlineAlertService.deleteTicker(id);
    if (res.success) {
      toastInfo('Ticker deleted.');
      fetchTickers();
    } else {
      toastError('Failed to delete ticker.');
    }
  };

  const columns: ColumnDefinition<ScrollTickerItem>[] = [
    {
      key: 'scrollText',
      header: 'Ticker Content (scrollText)',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-slate-900 text-xs leading-relaxed line-clamp-2">{row.scrollText}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(row.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'targetAudience',
      header: 'Audience Target',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Users className="w-3 h-3 text-slate-400" />
          {row.targetAudience}
        </span>
      ),
    },
    {
      key: 'speed',
      header: 'Speed',
      render: (row) => <span className="text-xs font-semibold text-slate-900">{row.speed}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleToggle(row.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          <Power className="w-3 h-3" />
          {row.isActive ? 'Active' : 'Disabled'}
        </button>
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
            className="h-8 px-2 text-[#0F4C81] hover:bg-indigo-50"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const activeTicker = tickers.find((t) => t.isActive);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#0F4C81]" />
            Scroll Text Manager (News Tickers)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Publish real-time scrolling news tickers displayed on downline dashboards (Distributor & Retailer terminals).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTickers} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="bg-[#0F4C81] text-white font-bold">
            <Plus className="w-4 h-4 mr-1.5" />
            Add News Ticker
          </Button>
        </div>
      </div>

      {/* Redesigned Premium Live Ticker Banner */}
      {activeTicker ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F4C81] to-slate-900 border border-indigo-400/20 shadow-lg text-white flex items-center gap-3 overflow-hidden relative">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-extrabold shrink-0 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            <Sparkles className="w-3.5 h-3.5" /> LIVE TICKER
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap text-xs font-medium tracking-wide text-slate-100 animate-pulse">
              {activeTicker.scrollText}
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-300/20 text-indigo-200 shrink-0">
            Speed: {activeTicker.speed} | {activeTicker.targetAudience}
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs text-center">
          No active news ticker broadcast currently configured.
        </div>
      )}

      <Card className="p-6 bg-white border border-slate-200/90 shadow-xs rounded-2xl space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading News Tickers...</div>
        ) : (
          <Table columns={columns} data={tickers} keyExtractor={(t) => t.id} />
        )}
      </Card>

      {/* CREATE / EDIT TICKER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Radio className="w-5 h-5 text-[#0F4C81]" />
            <span>{editingTicker ? 'Edit Ticker Announcement' : 'Publish Ticker Announcement'}</span>
          </div>
        }
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="ticker-form" variant="primary" size="sm" className="bg-[#0F4C81] text-white font-bold">
              {editingTicker ? 'Save Ticker Changes' : 'Publish Ticker'}
            </Button>
          </>
        }
      >
        <form id="ticker-form" onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ticker Text (scrollText) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter announcement text to scroll across downline dashboards..."
              value={scrollText}
              onChange={(e) => setScrollText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0F4C81]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0F4C81]"
              >
                <option value="Slow">Slow</option>
                <option value="Normal">Normal</option>
                <option value="Fast">Fast</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#0F4C81]"
              >
                <option value="All Users">All Users</option>
                <option value="Distributors Only">Distributors Only</option>
                <option value="Retailers Only">Retailers Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tickerActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#0F4C81] rounded"
            />
            <label htmlFor="tickerActive" className="text-xs font-medium text-slate-800">
              Publish as Active Ticker
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
