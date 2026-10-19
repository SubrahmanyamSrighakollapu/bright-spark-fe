'use client';

import React, { useState, useEffect } from 'react';
import { headlineAlertService, ScrollTickerItem, NoticeBoardItem } from '@/services/headlineAlertService';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/utils/formatters';
import { Radio, Bell, Sparkles, ChevronRight, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export const RetailerTickerAndNoticeBar: React.FC = () => {
  const [tickers, setTickers] = useState<ScrollTickerItem[]>([]);
  const [notices, setNotices] = useState<NoticeBoardItem[]>([]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const tickerRes = await headlineAlertService.getTickers();
      if (tickerRes.success && tickerRes.data) {
        setTickers(tickerRes.data.filter((t) => t.isActive));
      }

      const noticeRes = await headlineAlertService.getNotices();
      if (noticeRes.success && noticeRes.data) {
        setNotices(noticeRes.data);
      }
    };

    fetchData();

    // Listen for live updates
    const handleTickerUpdate = () => fetchData();
    const handleNoticeUpdate = () => fetchData();

    if (typeof window !== 'undefined') {
      window.addEventListener('qin_tickers_updated', handleTickerUpdate);
      window.addEventListener('qin_notices_updated', handleNoticeUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('qin_tickers_updated', handleTickerUpdate);
        window.removeEventListener('qin_notices_updated', handleNoticeUpdate);
      }
    };
  }, []);

  const activeTicker = tickers[0];

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

  return (
    <div className="space-y-3">
      {/* Scroll Text Ticker Strip */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#2F6F5E] to-slate-900 border border-indigo-400/20 shadow-md text-white flex items-center justify-between gap-3 overflow-hidden relative">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-extrabold shrink-0 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            <Sparkles className="w-3.5 h-3.5" /> TICKER
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap text-xs font-medium tracking-wide text-slate-100 animate-pulse truncate">
              {activeTicker
                ? activeTicker.scrollText
                : '🌾 Notice: Instant Wallet Payout service fee reduced to ₹5 for high-volume Retailers!'}
            </div>
          </div>
        </div>

        {/* Notice Board Bulletin Trigger */}
        <button
          type="button"
          onClick={() => setIsNoticeModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors shrink-0 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-amber-300" />
          <span>Notice Board</span>
          {notices.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center justify-center">
              {notices.length}
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>

      {/* Notice Board Bulletin Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Bell className="w-5 h-5 text-[#2F6F5E]" />
            <span>Platform Bulletin & Downline Notice Board</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-3 text-xs">
          {notices.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No bulletin notices published currently.
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs hover:border-[#D4E1AE] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{notice.noticeTitle}</h4>
                  <div className="shrink-0">{getTypeBadge(notice.noticeType)}</div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notice.noticeContent}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Published: {notice.publishDate.split('T')[0]}</span>
                  <span>Expires: {notice.expiryDate.split('T')[0]}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
