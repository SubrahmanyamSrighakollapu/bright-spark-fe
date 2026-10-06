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
import { Radio, Plus, Edit, Trash2, Power, Eye, Users } from 'lucide-react';

export interface ScrollTicker {
  id: string;
  scrollText: string;
  speed: 'Slow' | 'Normal' | 'Fast';
  targetAudience: 'All Users' | 'Distributors Only' | 'Retailers Only';
  isActive: boolean;
  createdAt: string;
}

const INITIAL_TICKERS: ScrollTicker[] = [
  {
    id: 'ticker_1',
    scrollText: '🌾 Notice: Kharif Harvest Paddy procurement settlement rates updated today across all APMC mandis.',
    speed: 'Normal',
    targetAudience: 'All Users',
    isActive: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'ticker_2',
    scrollText: '⚡ Special Bonus: Instant Wallet Payout service fee reduced to ₹5 for high-volume Retailers.',
    speed: 'Fast',
    targetAudience: 'Retailers Only',
    isActive: true,
    createdAt: '2026-09-22T10:30:00Z',
  },
  {
    id: 'ticker_3',
    scrollText: '⚠️ Scheduled Banking Gateway Maintenance tonight from 02:00 AM to 03:30 AM IST.',
    speed: 'Slow',
    targetAudience: 'Distributors Only',
    isActive: false,
    createdAt: '2026-09-25T14:15:00Z',
  },
];

export const ScrollTextManagerView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [tickers, setTickers] = useState<ScrollTicker[]>(INITIAL_TICKERS);

  // Form / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicker, setEditingTicker] = useState<ScrollTicker | null>(null);
  const [scrollText, setScrollText] = useState('');
  const [speed, setSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');
  const [targetAudience, setTargetAudience] = useState<'All Users' | 'Distributors Only' | 'Retailers Only'>('All Users');
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingTicker(null);
    setScrollText('');
    setSpeed('Normal');
    setTargetAudience('All Users');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticker: ScrollTicker) => {
    setEditingTicker(ticker);
    setScrollText(ticker.scrollText);
    setSpeed(ticker.speed);
    setTargetAudience(ticker.targetAudience);
    setIsActive(ticker.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrollText.trim()) return;

    if (editingTicker) {
      setTickers((prev) =>
        prev.map((t) => (t.id === editingTicker.id ? { ...t, scrollText, speed, targetAudience, isActive } : t))
      );
      toastSuccess('News ticker updated successfully!');
    } else {
      const newTicker: ScrollTicker = {
        id: `ticker_${Date.now()}`,
        scrollText,
        speed,
        targetAudience,
        isActive,
        createdAt: new Date().toISOString(),
      };
      setTickers([newTicker, ...tickers]);
      toastSuccess('New ticker published to downline terminals!');
    }

    setIsModalOpen(false);
  };

  const handleToggle = (id: string, text: string) => {
    setTickers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.isActive;
          toastInfo(`Ticker status updated to ${next ? 'Active' : 'Inactive'}.`);
          return { ...t, isActive: next };
        }
        return t;
      })
    );
  };

  const handleDelete = (id: string) => {
    setTickers((prev) => prev.filter((t) => t.id !== id));
    toastInfo('Ticker deleted.');
  };

  const columns: ColumnDefinition<ScrollTicker>[] = [
    {
      key: 'scrollText',
      header: 'Ticker Content (scrollText)',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-[#0F172A] text-xs leading-relaxed line-clamp-2">{row.scrollText}</div>
          <div className="text-[10px] text-[#64748B] mt-0.5">{formatDateTime(row.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'targetAudience',
      header: 'Audience Target',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
          <Users className="w-3 h-3 text-[#64748B]" />
          {row.targetAudience}
        </span>
      ),
    },
    {
      key: 'speed',
      header: 'Speed',
      render: (row) => <span className="text-xs font-semibold text-[#0F172A]">{row.speed}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleToggle(row.id, row.scrollText)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
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
            className="h-8 px-2 text-[#155EEF] hover:bg-[#F1F5F9]"
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#155EEF]" />
            Scroll Text Manager (News Tickers)
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Publish real-time scrolling news tickers displayed on downline dashboards (Distributor & Retailer terminals).
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add News Ticker
        </Button>
      </div>

      {/* Live Preview Header Card */}
      {tickers.some((t) => t.isActive) && (
        <Card className="p-3.5 bg-[#0F172A] text-white rounded-xl flex items-center gap-3 overflow-hidden shadow-xs">
          <span className="px-2 py-0.5 rounded bg-[#155EEF] text-xs font-bold shrink-0 flex items-center gap-1">
            <Eye className="w-3 h-3" /> LIVE TICKER
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap text-xs font-medium animate-pulse">
              {tickers.find((t) => t.isActive)?.scrollText}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={tickers} keyExtractor={(t) => t.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTicker ? 'Edit Ticker Announcement' : 'Publish Ticker Announcement'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Ticker Text (scrollText) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter announcement text to scroll across downline dashboards..."
                value={scrollText}
                onChange={(e) => setScrollText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Display Speed</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
                >
                  <option value="Slow">Slow</option>
                  <option value="Normal">Normal</option>
                  <option value="Fast">Fast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
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
                className="w-4 h-4 text-[#155EEF] rounded"
              />
              <label htmlFor="tickerActive" className="text-xs font-medium text-[#0F172A]">
                Publish as Active Ticker
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Ticker
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
