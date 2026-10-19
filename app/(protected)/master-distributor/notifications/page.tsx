'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { FinancialEmptyState } from '@/components/features/financial/FinancialEmptyState';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/formatters';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface MDNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'APPROVAL' | 'TRANSACTION' | 'WALLET' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  severity?: 'info' | 'success' | 'warning' | 'danger';
}

export default function MasterDistributorNotificationsPage() {
  const { session } = useAuth();
  const retailerId = session?.entityId || 'MD001';

  const [filter, setFilter] = useState<'ALL' | 'APPROVAL' | 'TRANSACTION' | 'WALLET' | 'SYSTEM'>('ALL');
  const [notifications, setNotifications] = useState<MDNotificationItem[]>([
    {
      id: 'notif_101',
      title: 'Distributor Onboarding Request Submitted',
      message: 'Distributor "North Zone Hub (DST008)" created and submitted for Admin approval.',
      type: 'APPROVAL',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: false,
      severity: 'warning',
    },
    {
      id: 'notif_102',
      title: 'Commission Auto-Credited',
      message: 'Retailer transaction BSP20260903001 generated +₹38.50 Master Distributor commission.',
      type: 'WALLET',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      read: false,
      severity: 'success',
    },
    {
      id: 'notif_103',
      title: 'Network Volume Threshold Reached',
      message: 'Your Master Distributor network achieved ₹25,00,000+ monthly transaction volume.',
      type: 'TRANSACTION',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: true,
      severity: 'info',
    },
    {
      id: 'notif_104',
      title: 'Retailer Outlet Approved by Admin',
      message: 'Retailer "Metro Store #09" approved and activated for live payment collections.',
      type: 'APPROVAL',
      timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
      read: true,
      severity: 'success',
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(
    (n) => filter === 'ALL' || n.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Notifications & Alerts"
          subtitle="Real-time operational alerts, network approvals, and wallet commission notifications."
          statusBadge={
            unreadCount > 0 ? (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {unreadCount} Unread
              </span>
            ) : (
              <StatusBadge status="ACTIVE" label="All Caught Up" />
            )
          }
          actions={
            unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
              >
                Mark All Read
              </Button>
            ) : undefined
          }
        />

        {/* Filter Bar & Feed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              {(['ALL', 'APPROVAL', 'TRANSACTION', 'WALLET', 'SYSTEM'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filter === t
                      ? 'bg-[#2F6F5E] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'All Alerts' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <FinancialEmptyState
                title="No notifications"
                description="You have no notifications matching the selected filter category."
                icon={<Bell className="w-6 h-6" />}
              />
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-start gap-3.5 transition-colors ${
                    !item.read ? 'bg-indigo-50/20' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === 'APPROVAL'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : item.type === 'WALLET'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-[#2F6F5E] border border-[#D4E1AE]'
                    }`}
                  >
                    {item.type === 'APPROVAL' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : item.type === 'WALLET' ? (
                      <Wallet className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {item.title}
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-[#2F6F5E]" />
                        )}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
