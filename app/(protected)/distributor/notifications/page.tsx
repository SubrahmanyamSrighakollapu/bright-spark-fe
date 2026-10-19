'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, StatusBadge, Tabs } from '@/components/ui';
import { Bell, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Filter, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';

interface DistributorNotification {
  id: string;
  title: string;
  message: string;
  category: 'APPROVAL' | 'TRANSACTION' | 'WALLET' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: DistributorNotification[] = [
  {
    id: 'notif_d1',
    title: 'New Retailer Application Submitted',
    message: 'Retailer "Metro Store #05" (RET005) created under your distributor code. Status set to Pending Admin Approval.',
    category: 'APPROVAL',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif_d2',
    title: 'Commission Credit Posted',
    message: 'Distributor margin credit of ₹640.00 posted to your operating wallet for Pay-In collection volume.',
    category: 'WALLET',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif_d3',
    title: 'Retailer Account Approved',
    message: 'Platform Admin approved retailer "Capital Express Point" (RET002). Account activated for live operations.',
    category: 'APPROVAL',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'notif_d4',
    title: 'Daily Network Volume Summary',
    message: 'Your assigned retailers processed ₹1,42,500.00 total volume across 84 successful operations today.',
    category: 'TRANSACTION',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
  {
    id: 'notif_d5',
    title: 'Scheduled System Maintenance Notice',
    message: 'Platform core banking switch upgrade scheduled for Sunday 02:00 AM - 03:30 AM IST. Services will remain active.',
    category: 'SYSTEM',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

export default function DistributorNotificationsPage() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<DistributorNotification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'APPROVAL', label: 'Retailer Approvals' },
    { id: 'TRANSACTION', label: 'Transactions' },
    { id: 'WALLET', label: 'Wallet & Earnings' },
    { id: 'SYSTEM', label: 'System Announcements' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'APPROVAL':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'TRANSACTION':
        return <CheckCircle2 className="w-4 h-4 text-[#2F6F5E]" />;
      case 'WALLET':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'SYSTEM':
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <PageContainer
      title="Distributor Notifications & Alerts"
      description="Stay updated with live retailer onboarding status, commission postings, transaction alerts, and system notices"
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={markAllRead} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        </div>
      }
    >
      <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-500">There are no alerts in this category.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                notif.read
                  ? 'bg-white border-slate-200/90 shadow-xs'
                  : 'bg-indigo-50/40 border-indigo-200/90 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100/80 shrink-0 mt-0.5">
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#2F6F5E]" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDateTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}
