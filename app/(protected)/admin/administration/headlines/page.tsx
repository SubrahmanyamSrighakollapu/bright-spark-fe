'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import {
  headlineAlertService,
  HeadlineAlertItem,
} from '@/services/headlineAlertService';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Flame,
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';

export default function AdminHeadlinesPage() {
  const { toastSuccess, toastError } = useToast();
  const [headlines, setHeadlines] = useState<HeadlineAlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeadlineAlertItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState<HeadlineAlertItem['type']>('PROMOTION');
  const [priority, setPriority] = useState<HeadlineAlertItem['priority']>('HIGH');
  const [badgeText, setBadgeText] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchHeadlines = async () => {
    setIsLoading(true);
    const res = await headlineAlertService.getHeadlines();
    if (res.success && res.data) {
      setHeadlines(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHeadlines();
  }, []);

  // Filter Headlines
  const filteredHeadlines = headlines.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (item.badgeText && item.badgeText.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // KPI Calculations
  const totalHeadlines = headlines.length;
  const activeHeadlines = headlines.filter((h) => h.status === 'ACTIVE').length;
  const highPriorityHeadlines = headlines.filter((h) => h.priority === 'HIGH').length;
  const promotionsCount = headlines.filter((h) => h.type === 'PROMOTION').length;

  // Modal Actions
  const handleOpenModal = (item?: HeadlineAlertItem) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setText(item.text);
      setType(item.type);
      setPriority(item.priority);
      setBadgeText(item.badgeText || '');
      setStatus(item.status);
    } else {
      setEditingItem(null);
      setTitle('');
      setText('');
      setType('PROMOTION');
      setPriority('HIGH');
      setBadgeText('');
      setStatus('ACTIVE');
    }
    setIsModalOpen(true);
  };

  const handleSaveHeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      toastError('Please fill in headline title and text.');
      return;
    }

    if (editingItem) {
      const res = await headlineAlertService.updateHeadline(editingItem.id, {
        title: title.trim(),
        text: text.trim(),
        type,
        priority,
        badgeText: badgeText.trim() || undefined,
        status,
      });
      if (res.success) {
        toastSuccess('Headline alert updated successfully');
        fetchHeadlines();
        setIsModalOpen(false);
      } else {
        toastError(res.message || 'Failed to update headline alert');
      }
    } else {
      const res = await headlineAlertService.createHeadline({
        title: title.trim(),
        text: text.trim(),
        type,
        priority,
        badgeText: badgeText.trim() || undefined,
        status,
      });
      if (res.success) {
        toastSuccess('New Headline alert created and published');
        fetchHeadlines();
        setIsModalOpen(false);
      } else {
        toastError(res.message || 'Failed to create headline alert');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const res = await headlineAlertService.toggleHeadlineStatus(id);
    if (res.success) {
      toastSuccess(`Headline status set to ${currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
      fetchHeadlines();
    } else {
      toastError('Failed to update status');
    }
  };

  const handleDeleteHeadline = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const res = await headlineAlertService.deleteHeadline(id);
    if (res.success) {
      toastSuccess('Headline alert deleted');
      fetchHeadlines();
    } else {
      toastError('Failed to delete headline alert');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset headlines to default system alerts?')) {
      await headlineAlertService.resetToDefaults();
      toastSuccess('Headlines reset to factory defaults.');
      fetchHeadlines();
    }
  };

  const getTypeBadge = (typeVal: HeadlineAlertItem['type']) => {
    switch (typeVal) {
      case 'PROMOTION':
        return { color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Flame, label: 'Promotion' };
      case 'CRITICAL':
      case 'ALERT':
        return { color: 'bg-rose-50 text-rose-800 border-rose-200', icon: ShieldAlert, label: 'Critical Alert' };
      case 'WARNING':
        return { color: 'bg-orange-50 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Notice' };
      default:
        return { color: 'bg-blue-50 text-blue-800 border-blue-200', icon: Info, label: 'Information' };
    }
  };

  return (
    <PageContainer
      title="Headline Alerts & Announcement Ticker Master"
      description="Configure continuous scrolling headlines, promotional offers, banking holiday notices, and security alerts displayed globally on the Retailer dashboard header."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Headlines
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {totalHeadlines}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium block">
                {activeHeadlines} Active Ticker Headlines
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                High Priority
              </span>
              <span className="text-xl font-extrabold text-rose-700 font-mono">
                {highPriorityHeadlines}
              </span>
              <span className="text-[10px] text-slate-500 block">Critical & Urgent Alerts</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#0F4C81] flex items-center justify-center shrink-0 border border-indigo-100">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Promotions
              </span>
              <span className="text-xl font-extrabold text-[#0F4C81] font-mono">
                {promotionsCount}
              </span>
              <span className="text-[10px] text-indigo-700 font-medium block">Active Margin Offers</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Retailer Marquee
              </span>
              <span className="text-sm font-bold text-emerald-700">Continuous Scroll</span>
              <span className="text-[10px] text-slate-500 block">Hover & controls enabled</span>
            </div>
          </Card>
        </div>

        {/* Actions Bar & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-1 items-center gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines by keyword or badge..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81] focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81] bg-white font-medium shrink-0"
            >
              <option value="ALL">All Categories</option>
              <option value="PROMOTION">Promotions</option>
              <option value="INFO">Information</option>
              <option value="WARNING">Notice / Warnings</option>
              <option value="CRITICAL">Critical Alerts</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
              className="text-xs"
            >
              Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenModal()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#0F4C81] text-white font-bold text-xs"
            >
              Add Headline Alert
            </Button>
          </div>
        </div>

        {/* Headlines List Cards */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading Headline Alerts Master...
          </div>
        ) : filteredHeadlines.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">No headline alerts found.</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try clearing your search filters' : 'Click "Add Headline Alert" to create one.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHeadlines.map((item) => {
              const typeStyle = getTypeBadge(item.type);
              const TypeIcon = typeStyle.icon;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.status === 'ACTIVE'
                      ? 'border-slate-200/90 shadow-xs hover:border-indigo-300'
                      : 'border-slate-200/60 bg-slate-50/50 opacity-70'
                  }`}
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${typeStyle.color}`}
                      >
                        <TypeIcon className="w-3 h-3" />
                        {item.badgeText || typeStyle.label}
                      </span>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority} Priority
                      </span>

                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`text-xs px-2.5 py-1 ${
                        item.status === 'ACTIVE'
                          ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                          : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(item)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs px-2.5 py-1"
                    >
                      Edit
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleDeleteHeadline(item.id, item.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="Delete Headline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT HEADLINE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#0F4C81]" />
                  {editingItem ? 'Edit Headline Alert' : 'Add New Headline Alert'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveHeadline} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Headline Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Special Pay-In Festival Offer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Full Headline Announcement Text <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the full marquee text message displayed on Retailer dashboards..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Category / Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                    >
                      <option value="PROMOTION">PROMOTION (Offers & Margins)</option>
                      <option value="INFO">INFO (System Updates)</option>
                      <option value="WARNING">WARNING (Banking Notices)</option>
                      <option value="CRITICAL">CRITICAL (Security Alerts)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                    >
                      <option value="HIGH">HIGH Priority</option>
                      <option value="MEDIUM">MEDIUM Priority</option>
                      <option value="LOW">LOW Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Badge Tag Text <span className="text-slate-400">(Optional e.g. FESTIVAL OFFER)</span>
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. FESTIVAL OFFER, SECURITY ALERT"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-[#0F4C81] text-white font-bold"
                  >
                    {editingItem ? 'Save Headline Changes' : 'Publish Headline Alert'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
