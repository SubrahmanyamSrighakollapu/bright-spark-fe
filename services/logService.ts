import {
  ApiLog,
  ClientLog,
  CallbackLog,
  WebhookLog,
  LoginLog,
  ActivityLog,
  TraceSearchResult,
  ApiLogSummary,
  CallbackLogSummary,
  WebhookLogSummary,
  PaginationState,
  UserRole,
  LogSeverity,
  Transaction,
  ReportFilters,
  ApiPerformanceFilters,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import {
  mockApiLogs,
  mockClientLogs,
  mockCallbackLogs,
  mockWebhookLogs,
  mockLoginLogs,
  mockActivityLogs,
} from '@/mocks/mockLogs';
import { mockTransactions } from '@/mocks/mockTransactions';
import { APP_CONFIG } from '@/config';
import { apiClient } from './apiClient';
import { parseUserAgent } from '@/utils/userAgent';

function safeParse(x: unknown): unknown {
  if (x === null || x === undefined) return x;
  if (typeof x !== 'string') return x;
  try {
    return JSON.parse(x);
  } catch {
    return x;
  }
}

function genericHuman(
  actionName: string,
  resourceType: string,
  resourceId: unknown,
  meta: Record<string, unknown>,
  before: unknown,
  after: unknown
): string | null {
  const idStr = resourceId ? String(resourceId).slice(-8) : null;
  const actionHuman = actionName
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const resourceHuman = resourceType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (meta?.fieldName && typeof before !== 'undefined' && typeof after !== 'undefined') {
    const b = typeof before === 'object' ? JSON.stringify(before) : String(before);
    const a = typeof after === 'object' ? JSON.stringify(after) : String(after);
    return `${actionHuman}: changed ${String(meta.fieldName)} on ${resourceHuman}${idStr ? ` #${idStr}` : ''} from "${b.slice(0, 40)}" to "${a.slice(0, 40)}"`;
  }
  if (actionName.includes('CREATE')) return `${actionHuman} ${resourceHuman}${idStr ? ` #${idStr}` : ''}`;
  if (actionName.includes('UPDATE') || actionName.includes('EDIT')) return `${actionHuman} ${resourceHuman}${idStr ? ` #${idStr}` : ''} details`;
  if (actionName.includes('DELETE')) return `${actionHuman} ${resourceHuman}${idStr ? ` #${idStr}` : ''}`;
  if (actionName.includes('LOGIN')) return `${actionHuman} via ${resourceHuman}`;
  if (actionName.includes('LOGOUT')) return `${actionHuman} session`;
  return null;
}

function mapBackendAuditToActivityLog(raw: any): ActivityLog {
  const rid: string = String(raw?.requestId ?? raw?.request_id ?? `CORR_AUD_${String(raw?.id ?? '0')}`);
  const resourceType: string = String(raw?.resourceType ?? raw?.resource_type ?? 'SYSTEM').toUpperCase();
  const actionName: string = String(raw?.action ?? 'UNKNOWN_ACTION');
  const meta: Record<string, unknown> =
    typeof raw?.metadata === 'string'
      ? (safeParse(raw.metadata) as Record<string, unknown>) ?? {}
      : (raw?.metadata ?? {});
  const before = safeParse(raw?.beforeData ?? raw?.before_data);
  const after = safeParse(raw?.afterData ?? raw?.after_data);

  const mod = ((): string => {
    if (['WALLET', 'WALLET_CORRECTION', 'TRANSACTION', 'LEDGER', 'BALANCE'].includes(resourceType)) return 'FINANCE';
    if (['USER', 'EMPLOYEE', 'HIERARCHY_TRANSFER'].includes(resourceType)) return 'USERS';
    if (['PARTY', 'KYC', 'DOCUMENT'].includes(resourceType)) return 'KYC';
    if (['ROLE', 'PERMISSION'].includes(resourceType)) return 'ADMIN';
    if (['NOTIFICATION', 'ANNOUNCEMENT'].includes(resourceType)) return 'COMM';
    if (['AUTH', 'SESSION'].includes(resourceType) || /LOGIN|LOGOUT|PASSWORD|LOCKED|REFRESH/.test(actionName)) return 'SECURITY';
    return 'SYSTEM';
  })();

  let description: string =
    (raw as any)?.description ??
    genericHuman(actionName, resourceType, raw?.resourceId ?? raw?.resource_id ?? null, meta, before, after) ??
    `${actionName} on ${resourceType}${raw?.resourceId ? ` #${String(raw.resourceId).slice(-8)}` : ''}`;

  const actorName =
    (raw as any)?.actorName ??
    (raw as any)?.actor_full_name ??
    (raw?.actorUserId ? `User ${String(raw.actorUserId).slice(-6)}` : 'System');
  const actorRole =
    (raw as any)?.actorRole ??
    (raw as any)?.actor_role ??
    (raw as any)?.actor_party_role ??
    'SYSTEM';

  const targetBadgeRaw: string | undefined = (raw as any)?.targetBadge ?? (raw as any)?.target_badge;
  const targetNameRaw: string | undefined = (raw as any)?.targetName ?? (raw as any)?.target_name;
  const targetSummaryRaw: string | undefined = (raw as any)?.targetSummary ?? (raw as any)?.target_subtitle;
  const resourceIdRaw = raw?.resourceId ?? raw?.resource_id;

  const targetBadge = targetBadgeRaw?.trim() || resourceType;
  let targetName = targetNameRaw?.trim();
  if (!targetName || targetName.length === 0) {
    if (resourceIdRaw && String(resourceIdRaw).length <= 12) targetName = `${targetBadge} #${resourceIdRaw}`;
    else if (resourceIdRaw) targetName = `${targetBadge} #${String(resourceIdRaw).slice(-8)}`;
    else targetName = `System ${targetBadge} Event`;
  }
  let targetSummary = targetSummaryRaw?.trim() || '';
  if (!targetSummary && resourceIdRaw && String(resourceIdRaw).length > 12) {
    targetSummary = `ID: …${String(resourceIdRaw).slice(-10)}`;
  }

  const whatHappened = ((raw as any)?.whatHappened as string) || description || `${actionName.replace(/_/g, ' ')} on ${targetBadge}`;
  const impactRaw = (raw as any)?.impact as string | undefined;
  const impact = impactRaw || (() => {
    const outcome = (raw as any)?.status ?? (raw as any)?.outcome ?? 'SUCCESS';
    if (outcome === 'FAILURE') return 'Action did not complete — review error details below.';
    if (/USER_STATUS|PASSWORD|KYC_APPROVED|KYC_REJECTED|WALLET_CORRECTION|BALANCE|ROLE_PERMISSION|AUTHORITY_TRANSFER|HIERARCHY_TRANSFER/.test(actionName)) {
      return 'Operational / financial state change — verify downstream impact if needed.';
    }
    if (/LOGIN|REFRESH|LOGOUT|PASSWORD_CHANGED|SESSION/.test(actionName)) return 'Session / security event.';
    if (/CREATE|UPDATE|UPLOAD|SUBMITTED|CREATED|UPDATED/.test(actionName)) return 'Record update event.';
    if (/DELETED|REMOVED/.test(actionName)) return 'Record removal event.';
    return 'Recorded audit event.';
  })();

  return {
    id: `ACT_${String(raw?.id ?? Date.now()).padStart(8, '0')}`,
    traceId: (raw as any)?.traceId ?? rid,
    correlationId: (raw as any)?.correlationId ?? rid,
    sourceModule: mod,
    severity: (raw as any)?.severity ?? (raw?.outcome === 'FAILURE' ? (/WALLET|KYC/.test(actionName) ? 'ERROR' : 'WARNING') : 'INFO'),
    status: (raw as any)?.status ?? (raw?.outcome ?? 'COMPLETED'),
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    entityType: ((raw as any)?.entityType ?? resourceType) as any,
    entityId: (raw as any)?.entityId ?? raw?.resourceId ?? raw?.resource_id ?? undefined,
    action: actionName,
    module: mod,
    actorId: String(raw?.actorUserId ?? raw?.actorId ?? ''),
    actorName,
    actorRole: actorRole as any,
    description,
    previousValue: (raw as any)?.previousValue ?? (before as any) ?? undefined,
    newValue: (raw as any)?.newValue ?? (after as any) ?? undefined,
    reason: (raw as any)?.reason ?? (meta as any)?.reason ?? (meta as any)?.remarks ?? undefined,
    ipAddress: raw?.ipAddress ?? raw?.ip_address ?? '—',
    targetName,
    targetSummary,
    targetBadge,
    whatHappened,
    impact,
    latitude: typeof raw?.latitude === 'number' ? raw.latitude : (typeof meta.latitude === 'number' ? meta.latitude : null),
    longitude: typeof raw?.longitude === 'number' ? raw.longitude : (typeof meta.longitude === 'number' ? meta.longitude : null),
    locationAccuracy: typeof raw?.locationAccuracy === 'number' ? raw.locationAccuracy : (typeof meta.locationAccuracy === 'number' ? meta.locationAccuracy : null),
    locationStatus: typeof raw?.locationStatus === 'string'
      ? raw.locationStatus as ActivityLog['locationStatus']
      : typeof meta.locationStatus === 'string'
      ? meta.locationStatus as ActivityLog['locationStatus']
      : undefined,
    locationCapturedAt: typeof raw?.locationCapturedAt === 'string'
      ? raw.locationCapturedAt
      : (typeof meta.locationCapturedAt === 'string' ? meta.locationCapturedAt : null),
  };
}

const inMemoryApiLogs: ApiLog[] = [...mockApiLogs];
const inMemoryClientLogs: ClientLog[] = [...mockClientLogs];
const inMemoryCallbackLogs: CallbackLog[] = [...mockCallbackLogs];
const inMemoryWebhookLogs: WebhookLog[] = [...mockWebhookLogs];
const inMemoryLoginLogs: LoginLog[] = [...mockLoginLogs];
const inMemoryActivityLogs: ActivityLog[] = [...mockActivityLogs];

export interface LogListResult<T> {
  items: T[];
  pagination: PaginationState;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionRaw = sessionStorage.getItem('qin-star-pay-auth-session-session');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      return typeof parsed?.accessToken === 'string' ? parsed.accessToken : null;
    }
    const localRaw = localStorage.getItem('qin-star-pay-auth-session-local');
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      return typeof parsed?.accessToken === 'string' ? parsed.accessToken : null;
    }
  } catch {
    return null;
  }
  return null;
}

function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  return parts.join('&');
}

interface LoginHistoryApiItem {
  id: number;
  userId: string | null;
  userFullName: string | null;
  userEmail: string | null;
  userMobile: string | null;
  partyType: string | null;
  roles: string | null;
  sessionId: string | null;
  result: 'SUCCESS' | 'FAILED' | 'LOCKED' | 'LOGGED_OUT' | 'REFRESH';
  failReason: string | null;
  loginMethod: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  locationStatus: string;
  locationCapturedAt: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

function mapLoginHistoryRow(row: LoginHistoryApiItem): LoginLog {
  const { browser, os, device } = parseUserAgent(row.userAgent);
  const roleCode = row.roles ? row.roles.split(',')[0] : row.partyType || 'RETAILER';
  const status: LoginLog['status'] =
    row.result === 'SUCCESS' ? 'SUCCESS' : row.result === 'LOCKED' ? 'LOCKED' : 'FAILED';
  const authMethod: LoginLog['authMethod'] =
    row.loginMethod === 'SSO' ? 'SSO' : row.loginMethod === 'OTP' ? 'MFA_TOTP' : 'PASSWORD';
  const severity: LogSeverity =
    row.result === 'SUCCESS' ? 'INFO' : row.result === 'LOCKED' ? 'WARNING' : 'ERROR';
  return {
    id: String(row.id),
    traceId: `TRACE_LOGIN_${row.id}`,
    correlationId: `CORR_LOGIN_${row.id}`,
    sourceModule: 'AUTH',
    severity,
    createdAt: row.createdAt,
    userId: row.userId ?? '',
    userEmail: row.userEmail ?? '',
    userName: row.userFullName ?? row.userEmail ?? row.userId ?? 'Unknown',
    userRole: (roleCode as UserRole) || 'RETAILER',
    loginTime: row.createdAt,
    ipAddress: row.ipAddress ?? '',
    browser,
    os,
    device,
    authMethod,
    status,
    failureReason: row.failReason ?? undefined,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    locationAccuracy: row.locationAccuracy ?? null,
    locationStatus: (row.locationStatus as LoginLog['locationStatus']) ?? 'UNAVAILABLE',
    locationCapturedAt: row.locationCapturedAt ?? null,
  };
}

export const logService = {
  async getActivityLogs(
    filterOrQuery?: string | (ReportFilters & Record<string, unknown>),
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LogListResult<ActivityLog>>> {
    const params: Record<string, unknown> = {};
    if (typeof filterOrQuery === 'string' && filterOrQuery.trim() !== '') {
      params.keyword = filterOrQuery;
    } else if (filterOrQuery && typeof filterOrQuery === 'object') {
      const f = filterOrQuery as any;
      if (f.searchQuery) {
        params.keyword = f.searchQuery;
        const { searchQuery, ...rest } = f;
        Object.assign(params, rest);
      } else {
        Object.assign(params, filterOrQuery);
      }
    }

    if (!APP_CONFIG.useMockData) {
      const res = await apiClient.get<ApiResponse<LogListResult<any>>>('/audit-logs', {
        params: { ...params, page, pageSize } as Record<string, string | number | boolean | undefined>,
      });
      const mappedItems: ActivityLog[] = ((res?.data?.items as any[]) || []).map(mapBackendAuditToActivityLog);
      return {
        success: res.success,
        data: {
          items: mappedItems,
          pagination: res.data?.pagination ?? { page, pageSize, totalItems: 0, totalPages: 1 },
        },
        timestamp: res.timestamp ?? new Date().toISOString(),
      };
    }

    await new Promise((res) => setTimeout(res, 150));

    let items = [...inMemoryActivityLogs];
    if (typeof filterOrQuery === 'string' && filterOrQuery.trim() !== '') {
      const q = filterOrQuery.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.actorName.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    } else if (filterOrQuery && typeof filterOrQuery === 'object' && (filterOrQuery as any).searchQuery) {
      const q = (filterOrQuery as any).searchQuery.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.actorName.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: { items: paged, pagination: { page, pageSize, totalItems, totalPages } },
      timestamp: new Date().toISOString(),
    };
  },

  async getActivityLogById(id: string): Promise<ApiResponse<ActivityLog>> {
    if (!APP_CONFIG.useMockData) {
      const res = await apiClient.get<ApiResponse<any>>(`/audit-logs/${id}`);
      const mapped: ActivityLog = res?.data ? mapBackendAuditToActivityLog(res.data) : (null as unknown as ActivityLog);
      return {
        success: res.success,
        data: mapped,
        timestamp: res.timestamp ?? new Date().toISOString(),
      };
    }

    await new Promise((res) => setTimeout(res, 100));
    const item = inMemoryActivityLogs.find((a) => a.id === id);
    return {
      success: !!item,
      data: (item || null) as unknown as ActivityLog,
      timestamp: new Date().toISOString(),
    };
  },

  async getActivitySummary(): Promise<ApiResponse<Record<string, unknown>>> {
    if (!APP_CONFIG.useMockData) {
      return apiClient.get<ApiResponse<Record<string, unknown>>>('/audit-logs/summary');
    }

    await new Promise((res) => setTimeout(res, 100));
    const total = inMemoryActivityLogs.length;
    const byAction: Record<string, number> = {};
    inMemoryActivityLogs.forEach((a) => {
      byAction[a.action] = (byAction[a.action] || 0) + 1;
    });
    return {
      success: true,
      data: { totalRecords: total, last24h: Math.min(total, 42), byAction, uniqueActors: 8 },
      timestamp: new Date().toISOString(),
    };
  },

  async getActivityActionCatalog(): Promise<ApiResponse<Array<{ value: string; label: string; category?: string }>>> {
    if (!APP_CONFIG.useMockData) {
      return apiClient.get<ApiResponse<Array<{ value: string; label: string; category?: string }>>>('/audit-logs/action-catalog');
    }

    await new Promise((res) => setTimeout(res, 50));
    return {
      success: true,
      data: [
        { value: 'USER_CREATED', label: 'User Created', category: 'User Management' },
        { value: 'USER_UPDATED', label: 'User Updated', category: 'User Management' },
        { value: 'WALLET_CREDIT', label: 'Wallet Credit', category: 'Wallet' },
        { value: 'WALLET_DEBIT', label: 'Wallet Debit', category: 'Wallet' },
        { value: 'SETTLEMENT_INITIATED', label: 'Settlement Initiated', category: 'Settlement' },
        { value: 'LOGIN_SUCCESS', label: 'Login Success', category: 'Security' },
      ],
      timestamp: new Date().toISOString(),
    };
  },

  async getApiSummary(): Promise<ApiResponse<ApiLogSummary>> {
    if (!APP_CONFIG.useMockData) {
      try {
        return await apiClient.get<ApiResponse<ApiLogSummary>>('/reports/api-performance', {
          params: { summary: 1 } as Record<string, string | number | boolean | undefined>,
        });
      } catch {
        return {
          success: false,
          data: {
            totalRequests: 0,
            successCount: 0,
            failedCount: 0,
            avgResponseTimeMs: 0,
            timeoutCount: 0,
            criticalErrors: 0,
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 100));

    const totalRequests = inMemoryApiLogs.length;
    const successCount = inMemoryApiLogs.filter((a) => a.resultStatus === 'SUCCESS').length;
    const failedCount = inMemoryApiLogs.filter((a) => a.resultStatus === 'FAILED').length;
    const timeoutCount = inMemoryApiLogs.filter((a) => a.resultStatus === 'TIMEOUT').length;
    const criticalErrors = inMemoryApiLogs.filter((a) => a.severity === 'CRITICAL' || a.severity === 'ERROR').length;

    const latencies = inMemoryApiLogs.map((a) => a.responseTimeMs);
    const avgResponseTimeMs = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    return {
      success: true,
      data: { totalRequests, successCount, failedCount, avgResponseTimeMs, timeoutCount, criticalErrors },
      timestamp: new Date().toISOString(),
    };
  },

  async getApiLogs(
    filterOrQuery?: string | (ApiPerformanceFilters & ReportFilters & Record<string, unknown>),
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LogListResult<ApiLog>>> {
    const params: Record<string, unknown> = {};
    if (typeof filterOrQuery === 'string' && filterOrQuery.trim() !== '') {
      params.searchQuery = filterOrQuery;
    } else if (filterOrQuery && typeof filterOrQuery === 'object') {
      const f = filterOrQuery as any;
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate) params.endDate = f.endDate;
      Object.assign(params, filterOrQuery);
    }

    if (!APP_CONFIG.useMockData) {
      return apiClient.get<ApiResponse<LogListResult<ApiLog>>>('/reports/api-performance', {
        params: { ...params, page, pageSize } as Record<string, string | number | boolean | undefined>,
      });
    }

    await new Promise((res) => setTimeout(res, 150));

    let items = [...inMemoryApiLogs];
    if (typeof filterOrQuery === 'string' && filterOrQuery.trim() !== '') {
      const q = filterOrQuery.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.traceId.toLowerCase().includes(q) ||
          a.correlationId.toLowerCase().includes(q) ||
          a.requestReference.toLowerCase().includes(q) ||
          a.providerName.toLowerCase().includes(q) ||
          a.endpoint.toLowerCase().includes(q)
      );
    } else if (filterOrQuery && typeof filterOrQuery === 'object' && (filterOrQuery as any).searchQuery) {
      const q = (filterOrQuery as any).searchQuery.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.traceId.toLowerCase().includes(q) ||
          a.correlationId.toLowerCase().includes(q) ||
          a.requestReference.toLowerCase().includes(q) ||
          a.providerName.toLowerCase().includes(q) ||
          a.endpoint.toLowerCase().includes(q)
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: { items: paged, pagination: { page, pageSize, totalItems, totalPages } },
      timestamp: new Date().toISOString(),
    };
  },

  async getClientLogs(searchQuery?: string, page = 1, pageSize = 10): Promise<ApiResponse<LogListResult<ClientLog>>> {
    if (!APP_CONFIG.useMockData) {
      try {
        return await apiClient.get<ApiResponse<LogListResult<ClientLog>>>('/logs/client', {
          params: { searchQuery, page, pageSize } as Record<string, string | number | boolean | undefined>,
        });
      } catch {
        return {
          success: false,
          data: { items: [], pagination: { page, pageSize, totalItems: 0, totalPages: 1 } },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 150));

    let items = [...inMemoryClientLogs];
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.clientEntity.toLowerCase().includes(q) ||
          c.requestReference.toLowerCase().includes(q)
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: { items: paged, pagination: { page, pageSize, totalItems, totalPages } },
      timestamp: new Date().toISOString(),
    };
  },

  async getCallbackSummary(): Promise<ApiResponse<CallbackLogSummary>> {
    if (!APP_CONFIG.useMockData) {
      try {
        return await apiClient.get<ApiResponse<CallbackLogSummary>>('/logs/callbacks/summary');
      } catch {
        return {
          success: false,
          data: { totalReceived: 0, processedCount: 0, failedCount: 0, duplicateCount: 0, pendingCount: 0 },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 100));

    const totalReceived = inMemoryCallbackLogs.length;
    const processedCount = inMemoryCallbackLogs.filter((c) => c.processingStatus === 'PROCESSED').length;
    const failedCount = inMemoryCallbackLogs.filter((c) => c.processingStatus === 'FAILED').length;
    const duplicateCount = inMemoryCallbackLogs.filter((c) => c.processingStatus === 'DUPLICATE' || c.isDuplicate).length;
    const pendingCount = inMemoryCallbackLogs.filter((c) => c.processingStatus === 'RECEIVED' || c.processingStatus === 'PROCESSING').length;

    return {
      success: true,
      data: { totalReceived, processedCount, failedCount, duplicateCount, pendingCount },
      timestamp: new Date().toISOString(),
    };
  },

  async getCallbackLogs(searchQuery?: string, page = 1, pageSize = 10): Promise<ApiResponse<LogListResult<CallbackLog>>> {
    if (!APP_CONFIG.useMockData) {
      try {
        return await apiClient.get<ApiResponse<LogListResult<CallbackLog>>>('/logs/callbacks', {
          params: { searchQuery, page, pageSize } as Record<string, string | number | boolean | undefined>,
        });
      } catch {
        return {
          success: false,
          data: { items: [], pagination: { page, pageSize, totalItems: 0, totalPages: 1 } },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 150));

    let items = [...inMemoryCallbackLogs];
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.providerReference.toLowerCase().includes(q) ||
          (c.transactionId && c.transactionId.toLowerCase().includes(q)) ||
          c.providerName.toLowerCase().includes(q)
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: { items: paged, pagination: { page, pageSize, totalItems, totalPages } },
      timestamp: new Date().toISOString(),
    };
  },

  async retryCallbackProcessing(id: string): Promise<ApiResponse<CallbackLog>> {
    if (!APP_CONFIG.useMockData) {
      return apiClient.post<ApiResponse<CallbackLog>>(`/logs/callbacks/${id}/retry`);
    }

    await new Promise((res) => setTimeout(res, 400));
    const cb = inMemoryCallbackLogs.find((c) => c.id === id);
    if (cb) {
      cb.processingStatus = 'PROCESSED';
      cb.signatureVerification = 'VERIFIED';
      cb.retryCount += 1;
      return { success: true, data: { ...cb }, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as unknown as CallbackLog, timestamp: new Date().toISOString() };
  },

  async getWebhookSummary(): Promise<ApiResponse<WebhookLogSummary>> {
    if (!APP_CONFIG.useMockData) {
      try {
        return await apiClient.get<ApiResponse<WebhookLogSummary>>('/logs/webhooks/summary');
      } catch {
        return {
          success: false,
          data: { totalWebhooks: 0, deliveredCount: 0, failedCount: 0, pendingRetryCount: 0, exhaustedCount: 0 },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 100));

    const totalWebhooks = inMemoryWebhookLogs.length;
    const deliveredCount = inMemoryWebhookLogs.filter((w) => w.status === 'DELIVERED').length;
    const failedCount = inMemoryWebhookLogs.filter((w) => w.status === 'FAILED').length;
    const pendingRetryCount = inMemoryWebhookLogs.filter((w) => w.status === 'RETRYING' || w.status === 'PENDING').length;
    const exhaustedCount = inMemoryWebhookLogs.filter((w) => w.status === 'EXHAUSTED').length;

    return {
      success: true,
      data: { totalWebhooks, deliveredCount, failedCount, pendingRetryCount, exhaustedCount },
      timestamp: new Date().toISOString(),
    };
  },

  async getWebhookLogs(searchQuery?: string, page = 1, pageSize = 10): Promise<ApiResponse<LogListResult<WebhookLog>>> {
    if (!APP_CONFIG.useMockData) {
      try {
        return await apiClient.get<ApiResponse<LogListResult<WebhookLog>>>('/logs/webhooks', {
          params: { searchQuery, page, pageSize } as Record<string, string | number | boolean | undefined>,
        });
      } catch {
        return {
          success: false,
          data: { items: [], pagination: { page, pageSize, totalItems: 0, totalPages: 1 } },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 150));

    let items = [...inMemoryWebhookLogs];
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.endpointUrl.toLowerCase().includes(q) ||
          (w.entityId && w.entityId.toLowerCase().includes(q)) ||
          w.providerName.toLowerCase().includes(q)
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: { items: paged, pagination: { page, pageSize, totalItems, totalPages } },
      timestamp: new Date().toISOString(),
    };
  },

  async retryWebhookDelivery(id: string): Promise<ApiResponse<WebhookLog>> {
    if (!APP_CONFIG.useMockData) {
      return apiClient.post<ApiResponse<WebhookLog>>(`/logs/webhooks/${id}/retry`);
    }

    await new Promise((res) => setTimeout(res, 500));
    const wh = inMemoryWebhookLogs.find((w) => w.id === id);
    if (wh) {
      wh.attemptCount += 1;
      wh.lastAttemptAt = new Date().toISOString();
      wh.status = 'DELIVERED';
      wh.httpStatus = 200;
      wh.attemptHistory.push({
        attemptNumber: wh.attemptCount,
        timestamp: wh.lastAttemptAt,
        httpStatus: 200,
        status: 'DELIVERED',
      });
      return { success: true, data: { ...wh }, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as unknown as WebhookLog, timestamp: new Date().toISOString() };
  },

  async getLoginLogs(searchQuery?: string, page = 1, pageSize = 10): Promise<ApiResponse<LogListResult<LoginLog>>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.get<ApiResponse<{ items: LoginHistoryApiItem[]; pagination: PaginationState }>>(
          '/login-history',
          { params: { keyword: searchQuery, page, pageSize } as Record<string, string | number | boolean | undefined> }
        );
        const items = (res?.data?.items ?? []).map(mapLoginHistoryRow);
        return {
          success: true,
          data: { items, pagination: res?.data?.pagination ?? { page, pageSize, totalItems: 0, totalPages: 1 } },
          timestamp: res?.timestamp ?? new Date().toISOString(),
        };
      } catch {
        return {
          success: false,
          data: { items: [], pagination: { page, pageSize, totalItems: 0, totalPages: 1 } },
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 150));

    let items = [...inMemoryLoginLogs];
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (l) =>
          l.id.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.ipAddress.toLowerCase().includes(q)
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: { items: paged, pagination: { page, pageSize, totalItems, totalPages } },
      timestamp: new Date().toISOString(),
    };
  },

  async logActivity(
    action: string,
    module: string,
    entityType: ActivityLog['entityType'],
    entityId: string,
    description: string,
    previousValue?: string | Record<string, unknown>,
    newValue?: string | Record<string, unknown>,
    reason?: string,
    actorName = 'Super Admin',
    actorRole: UserRole = 'SUPER_ADMIN'
  ): Promise<ApiResponse<ActivityLog>> {
    if (!APP_CONFIG.useMockData) {
      return apiClient.post<ApiResponse<ActivityLog>>('/audit-logs', {
        action,
        module,
        entityType,
        entityId,
        description,
        previousValue,
        newValue,
        reason,
        actorName,
        actorRole,
      });
    }

    const newId = `ACT_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${String(inMemoryActivityLogs.length + 1).padStart(3, '0')}`;
    const resourceType = String(entityType ?? 'SYSTEM').toUpperCase();
    const shortEntityId = entityId && String(entityId).length > 12 ? String(entityId).slice(-8) : entityId;
    const targetBadge = resourceType;
    const targetName = shortEntityId ? `${targetBadge} #${shortEntityId}` : `System ${targetBadge} Event`;
    const targetSummary = entityId && String(entityId).length > 12 ? `ID: …${String(entityId).slice(-10)}` : '';
    const whatHappened = description || `${action.replace(/_/g, ' ')} on ${targetBadge}`;
    const impact = (() => {
      if (/USER_STATUS|PASSWORD|KYC_APPROVED|KYC_REJECTED|WALLET_CORRECTION|BALANCE|ROLE_PERMISSION|AUTHORITY_TRANSFER|HIERARCHY_TRANSFER/.test(action)) {
        return 'Operational / financial state change — verify downstream impact if needed.';
      }
      if (/LOGIN|REFRESH|LOGOUT|PASSWORD_CHANGED|SESSION/.test(action)) return 'Session / security event.';
      if (/CREATE|UPDATE|UPLOAD|SUBMITTED|CREATED|UPDATED/.test(action)) return 'Record update event.';
      if (/DELETED|REMOVED/.test(action)) return 'Record removal event.';
      return 'Recorded audit event.';
    })();
    const newLog: ActivityLog = {
      id: newId,
      traceId: `TRACE_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_001`,
      correlationId: `CORR_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_001`,
      sourceModule: module,
      severity: 'INFO',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      entityType,
      entityId,
      action,
      module,
      actorId: 'usr_admin_01',
      actorName,
      actorRole,
      description,
      previousValue,
      newValue,
      reason,
      ipAddress: '103.21.124.99',
      targetName,
      targetSummary,
      targetBadge,
      whatHappened,
      impact,
    };

    inMemoryActivityLogs.unshift(newLog);
    return { success: true, data: newLog, timestamp: new Date().toISOString() };
  },

  async traceByReference(referenceId: string): Promise<ApiResponse<TraceSearchResult>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const raw = await apiClient.get<ApiResponse<any>>('/audit-logs/trace', {
          params: { referenceId } as Record<string, string | number | boolean | undefined>,
        });
        const data = (raw?.data as any) ?? null;
        if (!data) return { success: false, data: null as unknown as TraceSearchResult, timestamp: raw?.timestamp ?? new Date().toISOString() };
        const mappedActivities: ActivityLog[] = (data.activityLogs || []).map((r: any) => ({
          ...mapBackendAuditToActivityLog(r),
        }));
        const mappedApi: ApiLog[] = (data.apiRequests || []).map((a: any) => ({
          id: a.id,
          traceId: a.requestId,
          correlationId: a.requestId,
          sourceModule: 'API',
          severity: a.statusCode >= 400 ? 'ERROR' : a.responseTimeMs > 3000 ? 'WARNING' : 'INFO',
          status: a.statusCode >= 400 ? 'FAILED' : 'SUCCESS',
          createdAt: a.createdAt,
          entityType: 'API_REQUEST' as any,
          entityId: String(a.id),
          providerName: a.route ? 'System API' : 'System',
          service: a.method,
          httpMethod: a.method,
          endpoint: a.route ?? '',
          httpStatus: a.statusCode,
          responseTimeMs: a.responseTimeMs,
          resultStatus: a.statusCode >= 400 ? 'FAILED' : 'SUCCESS',
          ipAddress: a.ipAddress,
          errorMessage: a.errorCode ?? undefined,
          internalErrorCode: a.errorCode ?? undefined,
          requestHeaders: {} as any,
          requestPayloadSanitized: undefined,
          responsePayloadSanitized: undefined,
        }));
        const result: TraceSearchResult = {
          referenceId: data.referenceId ?? referenceId,
          traceId: data.traceId,
          correlationId: data.correlationId,
          transaction: undefined,
          apiLogs: mappedApi,
          callbacks: [],
          webhooks: [],
          activityLogs: mappedActivities,
          counts: data.counts,
          matchedOn: data.matchedOn,
          timeframe: data.timeframe,
        };
        return {
          success: raw.success,
          data: result,
          timestamp: raw.timestamp ?? new Date().toISOString(),
        };
      } catch (e: any) {
        return {
          success: false,
          data: {
            referenceId,
            traceId: '',
            correlationId: '',
            transaction: undefined,
            apiLogs: [],
            callbacks: [],
            webhooks: [],
            activityLogs: [],
            counts: { activity: 0, api: 0, total: 0 },
            matchedOn: [],
            timeframe: { earliest: null, latest: null },
            error: e instanceof Error ? e.message : 'Trace search failed',
          } as any,
          timestamp: new Date().toISOString(),
        };
      }
    }

    await new Promise((res) => setTimeout(res, 250));

    const ref = referenceId.trim().toLowerCase();

    const transaction = mockTransactions.find(
      (t: Transaction) =>
        t.id.toLowerCase() === ref ||
        (t.referenceId && t.referenceId.toLowerCase() === ref) ||
        (t.utr && t.utr.toLowerCase() === ref)
    );

    const apiLogs = inMemoryApiLogs.filter(
      (a) =>
        a.id.toLowerCase() === ref ||
        a.traceId.toLowerCase() === ref ||
        a.correlationId.toLowerCase() === ref ||
        a.requestReference.toLowerCase() === ref ||
        (a.entityId && a.entityId.toLowerCase() === ref)
    );

    const callbacks = inMemoryCallbackLogs.filter(
      (c) =>
        c.id.toLowerCase() === ref ||
        c.traceId.toLowerCase() === ref ||
        c.correlationId.toLowerCase() === ref ||
        c.providerReference.toLowerCase() === ref ||
        (c.transactionId && c.transactionId.toLowerCase() === ref)
    );

    const webhooks = inMemoryWebhookLogs.filter(
      (w) =>
        w.id.toLowerCase() === ref ||
        w.traceId.toLowerCase() === ref ||
        w.correlationId.toLowerCase() === ref ||
        (w.entityId && w.entityId.toLowerCase() === ref)
    );

    const activityLogs = inMemoryActivityLogs.filter(
      (act) =>
        act.id.toLowerCase() === ref ||
        act.traceId.toLowerCase() === ref ||
        act.correlationId.toLowerCase() === ref ||
        (act.entityId && act.entityId.toLowerCase() === ref)
    );

    return {
      success: true,
      data: {
        referenceId,
        traceId: apiLogs[0]?.traceId || callbacks[0]?.traceId || 'TRACE_20260903_001',
        correlationId: apiLogs[0]?.correlationId || callbacks[0]?.correlationId || 'CORR_20260903_001',
        transaction,
        apiLogs,
        callbacks,
        webhooks,
        activityLogs,
      },
      timestamp: new Date().toISOString(),
    };
  },

  async exportActivityCsv(filters: Record<string, unknown> = {}): Promise<void> {
    const token = getStoredToken();
    const apiFilters: Record<string, unknown> = { ...filters };
    if (apiFilters.searchQuery !== undefined) {
      apiFilters.keyword = apiFilters.searchQuery;
      delete apiFilters.searchQuery;
    }
    const qs = buildQueryString({ ...apiFilters, export: 'csv' });
    const url = `${APP_CONFIG.apiBaseUrl}/audit-logs/export.csv${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to export activity logs');
    const blob = await res.blob();
    const filename = `Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    triggerBrowserDownload(blob, filename);
  },

  async exportApiLogsCsv(filters: Record<string, unknown> = {}): Promise<void> {
    const token = getStoredToken();
    const qs = buildQueryString({ ...filters, export: 'csv' });
    const url = `${APP_CONFIG.apiBaseUrl}/reports/api-performance/export.csv${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to export API performance logs');
    const blob = await res.blob();
    const filename = `API_Performance_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    triggerBrowserDownload(blob, filename);
  },

  exportLogsToCsv(logType: string, items: unknown[]): string {
    if (!items.length) return '';

    if (logType === 'API') {
      const headers = ['Log ID', 'Created At', 'Provider', 'Service', 'Method', 'Endpoint', 'HTTP Status', 'Result', 'Latency (ms)', 'Trace ID'];
      const rows = (items as ApiLog[]).map((a) => [
        a.id,
        a.createdAt,
        a.providerName,
        a.service,
        a.httpMethod,
        a.endpoint,
        a.httpStatus,
        a.resultStatus,
        a.responseTimeMs,
        a.traceId,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (logType === 'ACTIVITY') {
      const headers = ['Activity ID', 'Created At', 'Actor', 'Role', 'Module', 'Action', 'Target Entity', 'Description'];
      const rows = (items as ActivityLog[]).map((a) => [
        a.id,
        a.createdAt,
        `"${a.actorName}"`,
        a.actorRole,
        a.module,
        a.action,
        a.entityId || 'N/A',
        `"${a.description.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return '';
  },
};
