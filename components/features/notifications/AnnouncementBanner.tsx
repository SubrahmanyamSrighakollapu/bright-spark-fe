'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationSeverity } from '@/types/domain';
import {
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const POLL_INTERVAL_MS = 30_000;
const DISMISSED_BANNER_STORAGE_KEY = 'qsp_dismissed_announcement_banner_id';

const severityStyles: Record<
  NotificationSeverity,
  { bg: string; border: string; accentText: string; iconClass: string; Icon: any; label: string }
> = {
  CRITICAL: {
    bg: 'bg-gradient-to-r from-rose-50 via-white to-rose-50',
    border: 'border-rose-300',
    accentText: 'text-rose-800',
    iconClass: 'text-rose-700 bg-rose-100 border-rose-200',
    Icon: ShieldAlert,
    label: 'URGENT',
  },
  WARNING: {
    bg: 'bg-gradient-to-r from-amber-50 via-white to-amber-50',
    border: 'border-amber-300',
    accentText: 'text-amber-900',
    iconClass: 'text-amber-700 bg-amber-100 border-amber-200',
    Icon: AlertTriangle,
    label: 'NOTICE',
  },
  SUCCESS: {
    bg: 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50',
    border: 'border-emerald-300',
    accentText: 'text-emerald-900',
    iconClass: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    Icon: CheckCircle2,
    label: 'UPDATE',
  },
  INFO: {
    bg: 'bg-gradient-to-r from-blue-50 via-white to-blue-50',
    border: 'border-blue-300',
    accentText: 'text-blue-900',
    iconClass: 'text-blue-700 bg-blue-100 border-blue-200',
    Icon: Info,
    label: 'ANNOUNCEMENT',
  },
};

export const AnnouncementBanner: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [activeAnnouncement, setActiveAnnouncement] = useState<Notification | null>(null);
  const [optimisticDismissedId, setOptimisticDismissedId] = useState<string | null>(null);
  const [lastLocallyDismissedId, setLastLocallyDismissedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(DISMISSED_BANNER_STORAGE_KEY);
  });

  const pickLatestAnnouncement = (items: Notification[]): Notification | null => {
    const now = Date.now();
    for (const n of items) {
      if (!n.isAnnouncement) continue;
      if (n.dismissedAt) continue;
      if (n.expiresAt && new Date(n.expiresAt).getTime() <= now) continue;
      return n;
    }
    return null;
  };

  const fetchLatestAnnouncement = async () => {
    if (!session?.userId) return;
    try {
      const res = await notificationService.getNotifications(
        { excludeDismissed: 'true' },
        1,
        15
      );
      if (res.success && res.data) {
        const pick = pickLatestAnnouncement(res.data.items);
        setActiveAnnouncement(pick);
      }
    } catch {
      // Silent — banner is non-critical
    }
  };

  useEffect(() => {
    if (!session?.userId) return;
    fetchLatestAnnouncement();

    const interval = window.setInterval(fetchLatestAnnouncement, POLL_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void fetchLatestAnnouncement();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [session?.userId]);

  const visibleAnnouncement = useMemo(() => {
    if (!activeAnnouncement) return null;
    if (optimisticDismissedId === activeAnnouncement.id) return null;
    if (lastLocallyDismissedId === activeAnnouncement.id) return null;
    return activeAnnouncement;
  }, [activeAnnouncement, optimisticDismissedId, lastLocallyDismissedId]);

  if (!visibleAnnouncement) return null;

  const style = severityStyles[visibleAnnouncement.severity] ?? severityStyles.INFO;
  const { Icon } = style;

  const handleBannerClick = async () => {
    try {
      await notificationService.clicked(visibleAnnouncement.id);
    } catch {
      // Ignore
    }
    const roleBase =
      session?.role === 'SUPER_ADMIN' || session?.role === 'ADMIN'
        ? '/admin'
        : session?.role === 'OPERATIONS' || session?.role === 'ACCOUNTS' ||
            session?.role === 'KYC' || session?.role === 'SALES'
        ? '/admin'
        : session?.role === 'MASTER_DISTRIBUTOR'
        ? '/master-distributor'
        : session?.role === 'DISTRIBUTOR'
        ? '/distributor'
        : '/retailer';
    router.push(`${roleBase}/notifications?notification=${encodeURIComponent(visibleAnnouncement.id)}`);
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const id = visibleAnnouncement.id;
    setOptimisticDismissedId(id);
    try {
      localStorage.setItem(DISMISSED_BANNER_STORAGE_KEY, id);
      setLastLocallyDismissedId(id);
    } catch {
      // Ignore storage errors
    }
    try {
      await notificationService.dismiss(id);
    } catch {
      // Best-effort; optimistic hide already applied
    }
  };

  return (
    <div
      onClick={handleBannerClick}
      className={cn(
        'relative z-20 overflow-hidden cursor-pointer transition-colors border-b shadow-2xs',
        style.bg,
        style.border
      )}
      role="banner"
      aria-label={`System announcement: ${visibleAnnouncement.title}`}
    >
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 max-w-full">
        <div
          className={cn(
            'flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg border shadow-2xs',
            style.iconClass
          )}
        >
          <Megaphone className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono leading-none">
            {style.label}
          </span>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 rounded-md shrink-0 p-1 border',
            style.iconClass
          )}
          aria-hidden="true"
        >
          <Icon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn('text-xs font-bold leading-tight truncate', style.accentText)}>
            {visibleAnnouncement.title}
          </div>
          <div className="text-[11px] text-slate-700 leading-snug line-clamp-1 sm:line-clamp-1">
            {visibleAnnouncement.message}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            View details
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="flex items-center justify-center shrink-0 ml-1 p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-colors border border-transparent hover:border-slate-200"
          aria-label="Dismiss announcement banner"
          title="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
