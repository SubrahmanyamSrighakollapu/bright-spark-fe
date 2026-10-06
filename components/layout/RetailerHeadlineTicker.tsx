'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { headlineAlertService, HeadlineAlertItem } from '@/services/headlineAlertService';
import {
  Megaphone,
  AlertTriangle,
  Info,
  ShieldAlert,
  Flame,
  X,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';

export const RetailerHeadlineTicker: React.FC = () => {
  const pathname = usePathname();
  const { session } = useAuth();
  const [headlines, setHeadlines] = useState<HeadlineAlertItem[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show only on Retailer pages (or when session role is RETAILER)
  const isRetailerSection =
    pathname?.startsWith('/retailer') || session?.role === 'RETAILER';

  const fetchActiveHeadlines = async () => {
    const res = await headlineAlertService.getActiveHeadlines();
    if (res.success && res.data) {
      setHeadlines(res.data);
    }
  };

  useEffect(() => {
    if (!isRetailerSection) return;
    fetchActiveHeadlines();

    const handleUpdate = () => fetchActiveHeadlines();
    window.addEventListener('qin_headline_alerts_updated', handleUpdate);
    return () => window.removeEventListener('qin_headline_alerts_updated', handleUpdate);
  }, [isRetailerSection]);

  if (!isRetailerSection || isDismissed || headlines.length === 0) {
    return null;
  }

  // Duplicate items to ensure smooth continuous loop
  const tickerItems = [...headlines, ...headlines];

  const isAnimationPaused = isManuallyPaused || isHovered;

  const getTypeStyle = (type: HeadlineAlertItem['type']) => {
    switch (type) {
      case 'PROMOTION':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Flame,
          label: 'OFFER',
        };
      case 'CRITICAL':
      case 'ALERT':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: ShieldAlert,
          label: 'ALERT',
        };
      case 'WARNING':
        return {
          bg: 'bg-orange-100 text-orange-900 border-orange-300',
          icon: AlertTriangle,
          label: 'NOTICE',
        };
      default:
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Info,
          label: 'UPDATE',
        };
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50/90 via-white to-amber-50/80 border-b border-blue-200/70 shadow-2xs relative z-20 overflow-hidden select-none">
      <div className="flex items-center h-10 px-3 sm:px-4 max-w-full">
        {/* Left Brand Live Alert Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#0F4C81] text-white px-2.5 py-1 rounded-lg border border-blue-900/40 mr-3 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <Megaphone className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider font-mono text-white">
            LIVE ALERTS
          </span>
        </div>

        {/* Center Continuous Marquee Scroll Track */}
        <div
          className="flex-1 overflow-hidden relative h-full flex items-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle gradient overlay edges for smooth blend */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-50/80 to-transparent z-10 pointer-events-none" />

          <div
            className="animate-marquee-scroll flex items-center whitespace-nowrap gap-8 text-xs font-semibold text-slate-800"
            style={{
              animationPlayState: isAnimationPaused ? 'paused' : 'running',
            }}
          >
            {tickerItems.map((item, idx) => {
              const style = getTypeStyle(item.type);
              const Icon = style.icon;

              return (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-2xs ${style.bg}`}
                  >
                    <Icon className="w-3 h-3" />
                    {item.badgeText || style.label}
                  </span>
                  <span className="text-slate-800 font-sans tracking-wide hover:text-[#0F4C81] transition-colors">
                    {item.text}
                  </span>
                  <span className="text-indigo-400 font-bold text-sm select-none">✦</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Interactive Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-3 border-l border-slate-200/80 pl-2">
          {/* Pause / Resume Button with clear label */}
          <button
            type="button"
            onClick={() => setIsManuallyPaused(!isManuallyPaused)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
              isManuallyPaused
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            title={isManuallyPaused ? 'Click to Resume Ticker' : 'Click to Pause Ticker'}
          >
            {isManuallyPaused ? (
              <>
                <Play className="w-3 h-3 text-amber-700 fill-amber-700" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-600" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            title="Dismiss alerts bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
