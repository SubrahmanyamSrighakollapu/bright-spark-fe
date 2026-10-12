'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Megaphone, Pause, Play, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { headlineAlertService, ScrollTickerItem } from '@/services/headlineAlertService';

const SPEED_SECONDS: Record<ScrollTickerItem['speed'], number> = {
  Slow: 70,
  Normal: 45,
  Fast: 25,
};

export const RetailerHeadlineTicker: React.FC = () => {
  const pathname = usePathname();
  const { session } = useAuth();
  const [tickers, setTickers] = useState<ScrollTickerItem[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isDownlineSection =
    pathname?.startsWith('/retailer') ||
    pathname?.startsWith('/distributor') ||
    pathname?.startsWith('/master-distributor') ||
    ['RETAILER', 'DISTRIBUTOR', 'MASTER_DISTRIBUTOR'].includes(session?.role || '');

  const fetchActiveTickers = async () => {
    const result = await headlineAlertService.getTickers();
    if (!result.success || !result.data) return;

    const role = session?.role;
    setTickers(result.data.filter((item) => {
      if (!item.isActive) return false;
      if (item.targetAudience === 'Retailers Only') return role === 'RETAILER';
      if (item.targetAudience === 'Distributors Only') {
        return role === 'DISTRIBUTOR' || role === 'MASTER_DISTRIBUTOR';
      }
      return true;
    }));
  };

  useEffect(() => {
    if (!isDownlineSection) return;
    void fetchActiveTickers();

    const refresh = () => void fetchActiveTickers();
    const refreshInterval = window.setInterval(refresh, 30_000);
    window.addEventListener('qin_tickers_updated', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('qin_tickers_updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [isDownlineSection, session?.role]);

  if (!isDownlineSection || isDismissed || tickers.length === 0) return null;

  const tickerItems = [...tickers, ...tickers];
  const isAnimationPaused = isManuallyPaused || isHovered;
  const speedSeconds = SPEED_SECONDS[tickers[0]?.speed || 'Normal'];

  return (
    <div className="relative z-20 overflow-hidden border-b border-blue-200/70 bg-gradient-to-r from-blue-50/90 via-white to-amber-50/80 shadow-2xs select-none">
      <div className="flex h-10 max-w-full items-center px-3 sm:px-4">
        <div className="mr-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0F4C81] px-2.5 py-1 text-white shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <Megaphone className="h-3.5 w-3.5 text-amber-300" />
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-white">Live ticker</span>
        </div>

        <div
          className="relative flex h-full flex-1 cursor-pointer items-center overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-blue-50/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-amber-50/80 to-transparent" />

          <div
            className="animate-marquee-scroll flex items-center gap-8 whitespace-nowrap text-xs font-semibold text-slate-800"
            style={{
              animationPlayState: isAnimationPaused ? 'paused' : 'running',
              animationDuration: `${speedSeconds}s`,
            }}
          >
            {tickerItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex shrink-0 items-center gap-2.5">
                <span className="inline-flex items-center rounded-md border border-blue-300 bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-900 shadow-2xs">
                  {item.speed.toUpperCase()}
                </span>
                <span className="font-sans tracking-wide text-slate-800 transition-colors hover:text-[#0F4C81]">
                  {item.scrollText}
                </span>
                <span className="text-sm font-bold text-indigo-400">•</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2 border-l border-slate-200/80 pl-2">
          <button
            type="button"
            onClick={() => setIsManuallyPaused((paused) => !paused)}
            className={`flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold transition-all ${
              isManuallyPaused
                ? 'border-amber-300 bg-amber-100 text-amber-900 shadow-2xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
            title={isManuallyPaused ? 'Resume ticker' : 'Pause ticker'}
          >
            {isManuallyPaused ? <Play className="h-3 w-3 fill-amber-700 text-amber-700" /> : <Pause className="h-3 w-3 text-slate-600" />}
            <span>{isManuallyPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="Dismiss ticker"
            aria-label="Dismiss ticker"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
