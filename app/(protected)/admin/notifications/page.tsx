'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { notificationService, NotificationListResult, PublishAnnouncementInput } from '@/services/notificationService';
import { Notification, NotificationFilters, PaginationState } from '@/types/domain';
import { NotificationSummaryCards } from '@/components/features/notifications/NotificationSummaryCards';
import { NotificationFilterBar } from '@/components/features/notifications/NotificationFilterBar';
import { NotificationTable } from '@/components/features/notifications/NotificationTable';
import { NotificationDetailsDrawer } from '@/components/features/notifications/NotificationDetailsDrawer';
import { MarkAllReadModal } from '@/components/features/notifications/MarkAllReadModal';
import { NotificationPreferencesTab } from '@/components/features/notifications/NotificationPreferencesTab';
import { PublishAnnouncementForm } from '@/components/features/notifications/PublishAnnouncementForm';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Sliders, BellOff, Megaphone } from 'lucide-react';

function NotificationCenterContent() {
  const searchParams = useSearchParams();
  const targetNotificationId = searchParams.get('notification');
  const { session, hasRole, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'ACTION_REQUIRED' | 'READ' | 'PREFERENCES'>('ALL');
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [data, setData] = useState<NotificationListResult | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [publishToast, setPublishToast] = useState<string | null>(null);

  // Modals & Drawers
  const detailsDrawer = useModal<Notification>();
  const markAllModal = useModal();
  const publishAnnouncementModal = useModal();

  const canPublishAnnouncement =
    Boolean(session) &&
    (hasRole(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS']) || hasPermission('ANNOUNCEMENT_PUBLISH'));

  const handlePublishAnnouncement = async (input: PublishAnnouncementInput) => {
    const res = await notificationService.publishAnnouncement(input);
    if (!res.success || !res.data) {
      throw new Error('Server returned failure while publishing announcement.');
    }
    const d = res.data;
    setPublishToast(
      `Announcement published: targeted ${d.targetCount} user(s), created ${d.createdCount} notification(s)${
        d.skippedDueToPreferences > 0
          ? ` (${d.skippedDueToPreferences} skipped due to user preferences)`
          : ''
      }.`
    );
    setTimeout(() => setPublishToast(null), 6000);
    loadNotifications();
  };

  const loadNotifications = () => {
    setIsLoading(true);

    const activeFilters: NotificationFilters = { ...filters };
    if (activeTab === 'UNREAD') {
      activeFilters.status = 'UNREAD';
    } else if (activeTab === 'CRITICAL') {
      activeFilters.severity = 'CRITICAL';
    } else if (activeTab === 'READ') {
      activeFilters.status = 'READ';
    }

    notificationService.getNotifications(activeFilters, pagination.page, pagination.pageSize).then((res) => {
      if (res.success && res.data) {
        let items = res.data.items;
        if (activeTab === 'ACTION_REQUIRED') {
          items = items.filter((n) => n.actionRequired && n.status === 'UNREAD');
        }
        setData({
          ...res.data,
          items,
        });
        setPagination(res.data.pagination);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    if (activeTab === 'PREFERENCES') return;

    const activeFilters: NotificationFilters = { ...filters };
    if (activeTab === 'UNREAD') {
      activeFilters.status = 'UNREAD';
    } else if (activeTab === 'CRITICAL') {
      activeFilters.severity = 'CRITICAL';
    } else if (activeTab === 'READ') {
      activeFilters.status = 'READ';
    }

    notificationService.getNotifications(activeFilters, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        let items = res.data.items;
        if (activeTab === 'ACTION_REQUIRED') {
          items = items.filter((n) => n.actionRequired && n.status === 'UNREAD');
        }
        setData({
          ...res.data,
          items,
        });
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, filters, pagination.page, pagination.pageSize]);

  // Handle deep-link target from URL search query
  useEffect(() => {
    if (targetNotificationId) {
      notificationService.getNotificationById(targetNotificationId).then((res) => {
        if (res.success && res.data) {
          detailsDrawer.open(res.data);
        }
      });
    }
    // eslint-disable-next-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetNotificationId]);

  const handleMarkRead = async (notif: Notification) => {
    await notificationService.markAsRead(notif.id);
    loadNotifications();
    if (detailsDrawer.data && detailsDrawer.data.id === notif.id) {
      const updated = await notificationService.getNotificationById(notif.id);
      if (updated.data) detailsDrawer.open(updated.data);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const summary = data?.summary || {
    totalNotifications: 0,
    unreadCount: 0,
    criticalCount: 0,
    actionRequiredCount: 0,
    todayCount: 0,
    readCount: 0,
  };

  return (
    <PageContainer
      title="Notification Center"
      description="Monitor operational alerts, payment events, compliance actions, financial exceptions and system notifications."
      actions={
        <div className="flex items-center gap-2">
          {canPublishAnnouncement && (
            <Button
              variant="outline"
              size="sm"
              onClick={publishAnnouncementModal.open}
              leftIcon={<Megaphone className="w-3.5 h-3.5" />}
            >
              Publish Announcement
            </Button>
          )}
          {summary.unreadCount > 0 && activeTab !== 'PREFERENCES' && (
            <Button
              variant="primary"
              size="sm"
              onClick={markAllModal.open}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {publishToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] font-semibold flex items-start gap-2">
            <Megaphone className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-700" />
            <span>{publishToast}</span>
          </div>
        )}

        {/* Summary Cards */}
        <NotificationSummaryCards summary={summary} />

        {/* Primary Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ALL'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Notifications ({summary.totalNotifications})
          </button>
          <button
            onClick={() => {
              setActiveTab('UNREAD');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'UNREAD'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Unread ({summary.unreadCount})
          </button>
          <button
            onClick={() => {
              setActiveTab('CRITICAL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'CRITICAL'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Critical ({summary.criticalCount})
          </button>
          <button
            onClick={() => {
              setActiveTab('ACTION_REQUIRED');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ACTION_REQUIRED'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Action Required ({summary.actionRequiredCount})
          </button>
          <button
            onClick={() => {
              setActiveTab('READ');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'READ'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Read / Resolved ({summary.readCount})
          </button>
          <button
            onClick={() => setActiveTab('PREFERENCES')}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'PREFERENCES'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab View Content */}
        {activeTab === 'PREFERENCES' ? (
          <NotificationPreferencesTab />
        ) : (
          <div className="space-y-6">
            {/* Filter Bar */}
            <NotificationFilterBar
              onFilterChange={(f) => {
                setFilters(f);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              onReset={() => {
                setFilters({});
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              isLoading={isLoading}
            />

            {/* Operational Empty States */}
            {!isLoading && (!data?.items || data.items.length === 0) ? (
              <div className="p-12 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <BellOff className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-800">
                  {activeTab === 'UNREAD'
                    ? "You're all caught up! There are no unread operational alerts."
                    : activeTab === 'CRITICAL'
                    ? 'No critical operational alerts found.'
                    : 'No notifications match the selected filters.'}
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  System events and operational exceptions across settlements, transactions, KYC, and wallet balances will appear here when triggered.
                </p>
              </div>
            ) : (
              /* Table View */
              <NotificationTable
                data={data?.items || []}
                isLoading={isLoading}
                onViewNotification={(notif) => detailsDrawer.open(notif)}
              />
            )}

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
            />
          </div>
        )}

        {/* Drawers & Modals */}
        <NotificationDetailsDrawer
          isOpen={detailsDrawer.isOpen}
          onClose={detailsDrawer.close}
          notification={detailsDrawer.data}
          onMarkRead={handleMarkRead}
        />

        <MarkAllReadModal
          isOpen={markAllModal.isOpen}
          onClose={markAllModal.close}
          onConfirm={handleMarkAllRead}
          unreadCount={summary.unreadCount}
        />

        <PublishAnnouncementForm
          isOpen={publishAnnouncementModal.isOpen}
          onClose={publishAnnouncementModal.close}
          onSubmit={handlePublishAnnouncement}
        />
      </div>
    </PageContainer>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Notification Center...</div>}>
      <NotificationCenterContent />
    </Suspense>
  );
}
