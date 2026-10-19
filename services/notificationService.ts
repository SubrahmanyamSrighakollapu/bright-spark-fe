import {
  Notification,
  NotificationFilters,
  NotificationSummary,
  NotificationPreferenceItem,
  NotificationCategory,
  NotificationType,
  NotificationSeverity,
  PaginationState,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockNotifications, defaultNotificationPreferences } from '@/mocks/mockNotification';
import { APP_CONFIG } from '@/config';
import { apiClient } from './apiClient';

const NOTIFICATIONS_STORAGE_KEY = 'bsp_notifications_v1';
const PREFERENCES_STORAGE_KEY = 'bsp_notification_prefs_v1';

const loadInitialNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return [...mockNotifications];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fallback to mock data
  }
  return [...mockNotifications];
};

const loadInitialPreferences = (): NotificationPreferenceItem[] => {
  if (typeof window === 'undefined') return [...defaultNotificationPreferences];
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fallback
  }
  return [...defaultNotificationPreferences];
};

const inMemoryNotifications: Notification[] = loadInitialNotifications();
const inMemoryPreferences: NotificationPreferenceItem[] = loadInitialPreferences();

const saveNotifications = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(inMemoryNotifications));
    } catch {
      // Ignore storage errors
    }
  }
};

const savePreferences = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(inMemoryPreferences));
    } catch {
      // Ignore storage errors
    }
  }
};

export interface NotificationListResult {
  items: Notification[];
  pagination: PaginationState;
  summary: NotificationSummary;
}

export interface PublishAnnouncementInput {
  target:
    | { kind: 'USER_IDS'; userIds: string[] }
    | { kind: 'ROLES'; roles: string[] }
    | { kind: 'ALL' }
    | { kind: 'HIERARCHY'; ownerUserId: string; includeOwner?: boolean };
  title: string;
  message: string;
  severity: NotificationSeverity;
  actionRequired?: boolean;
  entityType?: Notification['entityType'];
  entityId?: string;
  relatedEntity?: string;
  expiresAt?: string;
}

const buildFilterParams = (
  filters?: NotificationFilters
): Record<string, string | number | boolean | undefined> => {
  const params: Record<string, string | number | boolean | undefined> = {};
  if (!filters) return params;
  if (filters.category && filters.category !== 'ALL') params.category = filters.category;
  if (filters.severity && filters.severity !== 'ALL') params.severity = filters.severity;
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;
  if (filters.actionRequired === 'true') params.actionRequired = true;
  else if (filters.actionRequired === 'false') params.actionRequired = false;
  if (filters.excludeDismissed === 'true') params.excludeDismissed = true;
  else if (filters.excludeDismissed === 'false') params.excludeDismissed = false;
  const search = filters.search || filters.searchQuery;
  if (typeof search === 'string' && search.trim() !== '') params.search = search.trim();
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (!filters.dateFrom && filters.dateRange?.startDate) params.dateFrom = filters.dateRange.startDate;
  if (!filters.dateTo && filters.dateRange?.endDate) params.dateTo = filters.dateRange.endDate;
  return params;
};

export const notificationService = {
  async getSummary(): Promise<ApiResponse<NotificationSummary>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 100));
      const totalNotifications = inMemoryNotifications.length;
      const unreadCount = inMemoryNotifications.filter((n) => n.status === 'UNREAD').length;
      const criticalCount = inMemoryNotifications.filter((n) => n.severity === 'CRITICAL').length;
      const actionRequiredCount = inMemoryNotifications.filter((n) => n.actionRequired && n.status === 'UNREAD').length;
      const readCount = inMemoryNotifications.filter((n) => n.status === 'READ').length;
      const todayStr = new Date().toISOString().split('T')[0];
      const todayCount = inMemoryNotifications.filter((n) => n.createdAt.startsWith(todayStr)).length;
      return {
        success: true,
        data: {
          totalNotifications,
          unreadCount,
          criticalCount,
          actionRequiredCount,
          todayCount,
          readCount,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<NotificationSummary>>('/notifications/summary');
  },

  async getNotifications(
    filters?: NotificationFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<NotificationListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      let filtered = [...inMemoryNotifications];
      if (filters?.category && filters.category !== 'ALL') {
        filtered = filtered.filter((n) => n.category === filters.category);
      }
      if (filters?.severity && filters.severity !== 'ALL') {
        filtered = filtered.filter((n) => n.severity === filters.severity);
      }
      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((n) => n.status === filters.status);
      }
      const search = filters?.search || filters?.searchQuery;
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.id.toLowerCase().includes(q) ||
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q) ||
            (n.entityId && n.entityId.toLowerCase().includes(q)) ||
            (n.relatedEntity && n.relatedEntity.toLowerCase().includes(q))
        );
      }
      if (filters?.dateRange?.startDate) {
        const from = new Date(filters.dateRange.startDate).getTime();
        filtered = filtered.filter((n) => new Date(n.createdAt).getTime() >= from);
      }
      if (filters?.dateRange?.endDate) {
        const to = new Date(filters.dateRange.endDate).getTime();
        filtered = filtered.filter((n) => new Date(n.createdAt).getTime() <= to);
      }
      const summaryRes = await this.getSummary();
      const summary = summaryRes.data || {
        totalNotifications: 0, unreadCount: 0, criticalCount: 0,
        actionRequiredCount: 0, todayCount: 0, readCount: 0,
      };
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return {
        success: true,
        data: { items, pagination: { page, pageSize, totalItems, totalPages }, summary },
        timestamp: new Date().toISOString(),
      };
    }

    const params: Record<string, string | number | boolean | undefined> = { page, pageSize, ...buildFilterParams(filters) };
    return apiClient.get<ApiResponse<NotificationListResult>>('/notifications', { params });
  },

  async getNotificationById(id: string): Promise<ApiResponse<Notification | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 100));
      const notif = inMemoryNotifications.find((n) => n.id === id) || null;
      return { success: !!notif, data: notif, timestamp: new Date().toISOString() };
    }
    return apiClient.get<ApiResponse<Notification | null>>(`/notifications/${id}`);
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const notif = inMemoryNotifications.find((n) => n.id === id);
      if (notif) {
        notif.status = 'READ';
        notif.readAt = new Date().toISOString();
        saveNotifications();
        return { success: true, data: { ...notif }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Notification, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
  },

  async markAsUnread(id: string): Promise<ApiResponse<Notification>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const notif = inMemoryNotifications.find((n) => n.id === id);
      if (notif) {
        notif.status = 'UNREAD';
        notif.readAt = null;
        saveNotifications();
        return { success: true, data: { ...notif }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Notification, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/unread`, {});
  },

  async markAllAsRead(): Promise<ApiResponse<number>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      let count = 0;
      const now = new Date().toISOString();
      inMemoryNotifications.forEach((n) => {
        if (n.status === 'UNREAD') {
          n.status = 'READ';
          n.readAt = now;
          count++;
        }
      });
      saveNotifications();
      return { success: true, data: count, timestamp: new Date().toISOString() };
    }
    const envelope = await apiClient.post<ApiResponse<{ markedCount: number }>>('/notifications/read-all', {});
    return {
      success: envelope.success,
      data: envelope.data?.markedCount ?? 0,
      timestamp: envelope.timestamp,
    };
  },

  async dismiss(id: string): Promise<ApiResponse<Notification>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 100));
      const notif = inMemoryNotifications.find((n) => n.id === id);
      if (notif) {
        (notif as Notification & { dismissedAt?: string | null }).dismissedAt = new Date().toISOString();
        saveNotifications();
        return { success: true, data: { ...notif }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Notification, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/dismiss`, {});
  },

  async clicked(id: string): Promise<ApiResponse<Notification>> {
    if (APP_CONFIG.useMockData) {
      return this.getNotificationById(id).then((r) => ({ success: true, data: r.data as Notification, timestamp: new Date().toISOString() }));
    }
    return apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/clicked`, {});
  },

  async createNotification(
    category: NotificationCategory,
    type: NotificationType,
    severity: NotificationSeverity,
    title: string,
    message: string,
    entityType?: Notification['entityType'],
    entityId?: string,
    relatedEntity?: string,
    sourceModule = 'OPERATIONS',
    actionRequired = false,
    metadata?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<Notification>> {
    if (APP_CONFIG.useMockData) {
      const newId = `NTF_20260903_${String(inMemoryNotifications.length + 1).padStart(3, '0')}`;
      const newNotif: Notification = {
        id: newId,
        category,
        type,
        severity,
        title,
        message,
        entityType,
        entityId,
        relatedEntity,
        sourceModule,
        status: 'UNREAD',
        actionRequired,
        createdAt: new Date().toISOString(),
        readAt: null,
        metadata,
      };
      inMemoryNotifications.unshift(newNotif);
      saveNotifications();
      return { success: true, data: newNotif, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as unknown as Notification, timestamp: new Date().toISOString() };
  },

  async publishAnnouncement(input: PublishAnnouncementInput): Promise<ApiResponse<{ targetCount: number; createdCount: number; skippedDueToPreferences: number }>> {
    return apiClient.post<ApiResponse<{ targetCount: number; createdCount: number; skippedDueToPreferences: number }>>(
      '/notifications/announcements',
      input,
    );
  },

  async getPreferences(): Promise<ApiResponse<NotificationPreferenceItem[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 100));
      return { success: true, data: [...inMemoryPreferences], timestamp: new Date().toISOString() };
    }
    return apiClient.get<ApiResponse<NotificationPreferenceItem[]>>('/notifications/preferences');
  },

  async updatePreference(
    type: NotificationType,
    field: 'inAppEnabled' | 'emailEnabled' | 'smsEnabled' | 'pushEnabled',
    enabled: boolean
  ): Promise<ApiResponse<NotificationPreferenceItem[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const item = inMemoryPreferences.find((p) => p.type === type);
      if (item) {
        if (field === 'inAppEnabled' && item.inAppMandatory && !enabled) {
          return { success: false, data: inMemoryPreferences, timestamp: new Date().toISOString() };
        }
        (item as NotificationPreferenceItem & { [k: string]: boolean })[field] = enabled;
        savePreferences();
      }
      return { success: true, data: [...inMemoryPreferences], timestamp: new Date().toISOString() };
    }
    return apiClient.patch<ApiResponse<NotificationPreferenceItem[]>>(
      `/notifications/preferences/${type}`,
      { [field]: enabled },
    );
  },

  async exportCsv(filters?: NotificationFilters): Promise<void> {
    if (typeof window === 'undefined') return;

    const params = buildFilterParams(filters);
    // Build URL manually since we need to fetch as blob + access response headers
    const urlObj = new URL(
      `${APP_CONFIG.apiBaseUrl}${APP_CONFIG.apiBaseUrl.endsWith('/') ? '' : '/'}notifications/export`
    );
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) urlObj.searchParams.append(key, String(value));
    });

    const getStoredSession = (): { accessToken: string | null } => {
      try {
        const s1 = sessionStorage.getItem('bright-spark-auth-session-session');
        if (s1) return { accessToken: (JSON.parse(s1).accessToken as string) || null };
        const s2 = localStorage.getItem('bright-spark-auth-session-local');
        if (s2) return { accessToken: (JSON.parse(s2).accessToken as string) || null };
      } catch {
        /* noop */
      }
      return { accessToken: null };
    };

    const headers: Record<string, string> = {
      'Accept': 'text/csv, application/json',
      'X-Client-Platform': 'web-admin',
    };
    const session = getStoredSession();
    if (session.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`;

    const response = await fetch(urlObj.toString(), { headers });
    if (!response.ok) throw new Error(`Export failed (HTTP ${response.status})`);

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';
    const match = /filename="?([^";]+)"?/.exec(contentDisposition);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      match?.[1] ?? `notifications_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  getRelatedRecordRoute(notification: Notification): string {
    if (notification.entityType === 'TRANSACTION' || notification.category === 'TRANSACTION') {
      return `/admin/transactions/${notification.entityId || 'BSP20260903001'}`;
    }
    if (notification.entityType === 'SETTLEMENT' || notification.category === 'SETTLEMENT') {
      return '/admin/settlements';
    }
    if (notification.entityType === 'CHARGEBACK' || notification.category === 'CHARGEBACK') {
      return '/admin/chargebacks';
    }
    if (notification.entityType === 'INVOICE' || notification.category === 'INVOICE') {
      return '/admin/invoices';
    }
    if (notification.entityType === 'KYC' || notification.category === 'KYC') {
      return '/admin/kyc';
    }
    if (notification.entityType === 'WALLET' || notification.category === 'WALLET') {
      return '/admin/wallet/balances';
    }
    if (notification.category === 'RECONCILIATION') {
      return '/admin/settlements';
    }
    return '/admin/dashboard';
  },
};
