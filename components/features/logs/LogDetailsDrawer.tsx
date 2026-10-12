'use client';

import React, { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { BaseLog, ApiLog, CallbackLog, WebhookLog, LoginLog, ActivityLog } from '@/types/domain';
import { formatDate } from '@/utils/formatters';
import { sanitizeHeaders } from '@/utils/masking';
import { JsonViewer } from './JsonViewer';
import { TraceReferenceBadge } from './TraceReferenceBadge';
import {
  Copy,
  Check,
  GitCommit,
  Clock,
  AlertTriangle,
  Shield,
  UserRound,
  Target,
  FileWarning,
  Fingerprint,
  MapPin,
  Monitor,
  ChevronDown,
  ChevronUp,
  Building2,
  BadgeInfo,
} from 'lucide-react';

export interface LogDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log: BaseLog | null;
  onOpenTraceSearch?: (traceId: string) => void;
}

const COPY_RESET_MS = 2000;

function isTinyFlatObject(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v !== 'object' || Array.isArray(v)) return false;
  const keys = Object.keys(v as Record<string, unknown>);
  return keys.length > 0 && keys.length <= 4;
}

function humanizeValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v.length > 48 ? `${v.slice(0, 46)}…` : v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    const s = JSON.stringify(v);
    return s.length > 48 ? `${s.slice(0, 46)}…` : s;
  } catch {
    return '[object]';
  }
}

function diffChanges(before: unknown, after: unknown): Array<{ key: string; before: string; after: string }> {
  if (!isTinyFlatObject(before) || !isTinyFlatObject(after)) return [];
  const b = before as Record<string, unknown>;
  const a = after as Record<string, unknown>;
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));
  const out: Array<{ key: string; before: string; after: string }> = [];
  for (const k of keys) {
    const bv = JSON.stringify(b[k]);
    const av = JSON.stringify(a[k]);
    if (bv !== av) out.push({ key: k, before: humanizeValue(b[k]), after: humanizeValue(a[k]) });
  }
  return out;
}

function initials(name: string): string {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const LogDetailsDrawer: React.FC<LogDetailsDrawerProps> = ({
  isOpen,
  onClose,
  log,
  onOpenTraceSearch,
}) => {
  const [copyState, setCopyState] = useState<Record<string, boolean>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'PAYLOAD' | 'TIMELINE'>('SUMMARY');

  if (!log) return null;

  const handleCopy = (value: string, key: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopyState((p) => ({ ...p, [key]: true }));
    setTimeout(() => setCopyState((p) => ({ ...p, [key]: false })), COPY_RESET_MS);
  };

  const apiLog = log as ApiLog;
  const callbackLog = log as CallbackLog;
  const webhookLog = log as WebhookLog;
  const loginLog = 'loginTime' in log && 'userEmail' in log ? log as LoginLog : null;
  const activityLog = 'action' in log && 'actorId' in log ? log as ActivityLog : null;
  const locationLog = loginLog ?? activityLog;

  const changes =
    activityLog?.previousValue && activityLog?.newValue
      ? diffChanges(activityLog.previousValue, activityLog.newValue)
      : [];
  const hasInlineDiff = changes.length > 0 && changes.length <= 4;

  const impactDescription: string = (() => {
    if (activityLog?.impact) return activityLog.impact;
    if (apiLog?.errorMessage) {
      return `Request failed — ${apiLog.internalErrorCode || apiLog.providerErrorCode || 'provider error'}.`;
    }
    if (log.status === 'FAILED' || log.status === 'FAILURE') {
      return 'Action did not complete successfully — review payload details.';
    }
    if (callbackLog?.isDuplicate) {
      return 'Duplicate inbound callback received and skipped to avoid double processing.';
    }
    return 'Event processed successfully.';
  })();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Log Record Inspection"
      size="xl"
      className="w-full md:w-[920px] md:max-w-[94vw]"
    >
      <div className="space-y-5 text-xs">
        {/* Quick Identity Strip */}
        <div className="sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 md:p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div className="flex items-start md:items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-mono font-extrabold text-[15px] text-[var(--primary)] leading-tight">
                  {log.id}
                </span>
                <StatusBadge status={log.severity} size="sm" />
                <StatusBadge status={log.status} size="sm" />
                <TraceReferenceBadge traceId={log.traceId} onClick={onOpenTraceSearch} />
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                <span className="font-semibold text-slate-600">{log.sourceModule}</span>
                <span className="mx-1.5">•</span>
                <span>{formatDate(log.createdAt)}</span>
                {log.sourceModule && (
                  <>
                    <span className="mx-1.5">•</span>
                    <BadgeInfo className="w-3 h-3 inline align-[-1px] text-slate-400" />
                    <span className="ml-0.5">Activity audit record</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(log.id, 'logId')}
              className="whitespace-nowrap"
            >
              {copyState.logId ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 mr-1" />
              )}
              {copyState.logId ? 'Copied' : 'Copy ID'}
            </Button>
            {onOpenTraceSearch && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenTraceSearch(log.traceId)}
                leftIcon={<GitCommit className="w-3.5 h-3.5" />}
              >
                Trace Full Lifecycle
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 font-semibold">
          {[
            { k: 'SUMMARY', label: 'Summary', icon: <FileWarning className="w-3.5 h-3.5" /> },
            { k: 'PAYLOAD', label: 'Payload Inspector', icon: <BadgeInfo className="w-3.5 h-3.5" /> },
            { k: 'TIMELINE', label: 'Trace Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k as 'SUMMARY' | 'PAYLOAD' | 'TIMELINE')}
              className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === t.k
                  ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Summary — Info Cards, NO raw UUIDs visible */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-4">
            {/* What Happened — most prominent */}
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 border border-indigo-100 shadow-xs">
              <div className="flex items-start gap-2.5 mb-2.5">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <FileWarning className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-slate-900">What happened</h3>
                  <p className="text-[11px] text-slate-500">Human-readable event description</p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-800 font-medium">
                {activityLog?.whatHappened || activityLog?.description || apiLog?.errorMessage || log.correlationId}
              </p>
              {activityLog?.reason && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800 mb-1">Reason / Remarks</div>
                  <div className="text-[12px] text-amber-900 leading-snug">{activityLog.reason}</div>
                </div>
              )}
            </div>

            {/* 3-column Cards: Who / Target / Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Who Performed */}
              <Card className="p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <UserRound className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[12px] text-slate-900">Who performed</h4>
                    <p className="text-[10px] text-slate-500">Actor initiating the action</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-200 flex items-center justify-center shrink-0 font-bold text-indigo-700 text-[12px]">
                    {initials(activityLog?.actorName || loginLog?.userName || 'System')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[13px] text-slate-900 truncate">
                      {activityLog?.actorName || loginLog?.userName || 'System Process'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                        {activityLog?.actorRole || loginLog?.userRole || log.sourceModule}
                      </span>
                      {loginLog?.authMethod && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-mono text-[10px]">
                          {loginLog.authMethod}
                        </span>
                      )}
                    </div>
                    {(loginLog?.userEmail || activityLog?.actorName) && (
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {loginLog?.userEmail || activityLog?.ipAddress ? '' : ''}
                        {loginLog?.userEmail && <span className="font-mono">{loginLog.userEmail}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Affected Record */}
              <Card className="p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[12px] text-slate-900">Affected record</h4>
                    <p className="text-[10px] text-slate-500">Entity the action was applied to</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[13px] text-slate-900 leading-tight break-words">
                    {activityLog?.targetName || apiLog?.providerName || callbackLog?.providerName || webhookLog?.eventType || 'System Event'}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {activityLog?.targetBadge ? (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                        ((): string => {
                          const k = (activityLog.targetBadge || '').toUpperCase();
                          if (k.includes('USER')) return 'bg-blue-50 text-blue-700 border-blue-200';
                          if (k.includes('WALLET')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          if (k.includes('KYC')) return 'bg-amber-50 text-amber-700 border-amber-200';
                          if (k.includes('SESSION') || k.includes('AUTH')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          if (k.includes('ROLE')) return 'bg-violet-50 text-violet-700 border-violet-200';
                          if (k.includes('PARTY')) return 'bg-sky-50 text-sky-700 border-sky-200';
                          return 'bg-slate-50 text-slate-700 border-slate-200';
                        })()
                      }`}>
                        {activityLog.targetBadge}
                      </span>
                    ) : apiLog?.providerName ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border bg-sky-50 text-sky-700 border-sky-200">
                        API Call
                      </span>
                    ) : null}
                    {apiLog?.service && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 font-mono">
                        {apiLog.service}
                      </span>
                    )}
                    {callbackLog?.processingStatus && (
                      <StatusBadge status={callbackLog.processingStatus as any} size="sm" />
                    )}
                  </div>
                  {(activityLog?.targetSummary || apiLog?.endpoint || callbackLog?.providerReference) && (
                    <div className="mt-1.5 text-[11px] text-slate-500 leading-snug truncate font-mono max-w-full">
                      {activityLog?.targetSummary || apiLog?.endpoint || callbackLog?.providerReference}
                    </div>
                  )}
                </div>
              </Card>

              {/* Impact */}
              <Card className="p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[12px] text-slate-900">Impact / Result</h4>
                    <p className="text-[10px] text-slate-500">Outcome of the recorded event</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <StatusBadge status={log.status as any} size="sm" />
                  <StatusBadge status={log.severity as any} size="sm" />
                  {apiLog?.httpStatus !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      apiLog.httpStatus >= 200 && apiLog.httpStatus < 400
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      HTTP {apiLog.httpStatus}
                    </span>
                  )}
                  {apiLog?.responseTimeMs !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                      {apiLog.responseTimeMs}ms
                    </span>
                  )}
                  {webhookLog?.attemptCount !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px]">
                      {webhookLog.attemptCount} attempts
                    </span>
                  )}
                </div>
                <p className="text-[12px] leading-relaxed text-slate-700">
                  {impactDescription}
                </p>
              </Card>
            </div>

            {/* State Change Pills (if before/after are small objects with <=4 diff fields) */}
            {hasInlineDiff && (
              <Card title="State Change Delta" subtitle="Fields that changed in this action">
                <div className="space-y-2.5">
                  {changes.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="mt-0.5 shrink-0 px-2 py-0.5 rounded bg-slate-900 text-slate-100 font-mono font-bold text-[10px] uppercase">
                        {c.key}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                        <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-mono max-w-[42%] truncate" title={c.before}>
                          {c.before}
                        </span>
                        <span className="text-slate-400 font-bold">→</span>
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono max-w-[42%] truncate" title={c.after}>
                          {c.after}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* When & Where */}
            <Card title="When & Where" subtitle="Timestamp and origin metadata">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Occurred at</div>
                    <div className="font-mono text-slate-900">{formatDate(log.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Source IP</div>
                    <div className="font-mono text-slate-900">
                      {activityLog?.ipAddress && activityLog.ipAddress !== '—' ? activityLog.ipAddress : loginLog?.ipAddress || 'Not recorded'}
                    </div>
                  </div>
                </div>
                {(loginLog?.device || loginLog?.browser || loginLog?.os) && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Monitor className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Device / Browser</div>
                      <div className="text-slate-900">
                        {[loginLog.device, loginLog.browser, loginLog.os].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                  </div>
                )}
                {locationLog?.locationStatus && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Geolocation</div>
                      {locationLog.locationStatus === 'GRANTED' && locationLog.latitude != null && locationLog.longitude != null ? (
                        <div className="text-slate-900 space-y-0.5">
                          <div className="font-mono">
                            Lat {Number(locationLog.latitude).toFixed(6)}, Lng {Number(locationLog.longitude).toFixed(6)}
                          </div>
                          {locationLog.locationAccuracy != null && (
                            <div className="text-[11px] text-slate-600">Accuracy ±{Math.round(locationLog.locationAccuracy)} meters</div>
                          )}
                          {locationLog.locationCapturedAt && (
                            <div className="text-[11px] text-slate-600 font-mono">Captured {formatDate(locationLog.locationCapturedAt)}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-900">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {locationLog.locationStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {apiLog?.httpMethod && apiLog?.endpoint && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Fingerprint className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">HTTP Request</div>
                      <div className="font-mono text-slate-900 truncate">
                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[10px] mr-1.5">{apiLog.httpMethod}</span>
                        {apiLog.endpoint}
                      </div>
                    </div>
                  </div>
                )}
                {callbackLog?.providerReference && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Building2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Provider Reference</div>
                      <div className="font-mono text-slate-900 truncate">{callbackLog.providerReference}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Advanced & Reference IDs — collapsed by default, all raw IDs / UUIDs go here */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setAdvancedOpen((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-[12px] text-slate-700">Advanced & Reference IDs</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-bold">
                    Technical
                  </span>
                </div>
                {advancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {advancedOpen && (
                <div className="p-4 border-t border-slate-200 bg-white space-y-2.5 font-mono text-[11px]">
                  {[
                    { label: 'Activity ID', value: log.id, key: 'adv_logId' },
                    { label: 'Numeric / DB ID', value: String((log as any)?.numericId ?? (log.id?.startsWith('ACT_') ? log.id.slice(4) : '')), key: 'adv_numericId' },
                    { label: 'Trace ID', value: log.traceId, key: 'adv_traceId' },
                    { label: 'Correlation ID', value: log.correlationId, key: 'adv_corrId' },
                    { label: 'Request ID', value: (log as any)?.requestId || (activityLog as any)?.requestId || '', key: 'adv_reqId' },
                    { label: 'Actor User ID', value: activityLog?.actorId || '', key: 'adv_actorId' },
                    { label: 'Actor Party ID', value: (activityLog as any)?.actorPartyId || '', key: 'adv_actorPartyId' },
                    { label: 'Resource Type', value: activityLog?.entityType || '', key: 'adv_etype' },
                    { label: 'Resource / Entity ID', value: activityLog?.entityId || (log as any)?.entityId || '', key: 'adv_eid' },
                    { label: 'Source IP (raw)', value: activityLog?.ipAddress || '', key: 'adv_ipRaw' },
                    { label: 'User-Agent hash', value: (log as any)?.userAgent || '', key: 'adv_ua' },
                  ]
                    .filter((r) => r.value && r.value.length > 0 && r.value !== '—')
                    .map((row) => (
                      <div key={row.key} className="flex items-start justify-between gap-2.5 py-1 border-b border-slate-100 last:border-b-0">
                        <div className="shrink-0 w-44 text-slate-500 font-sans font-semibold text-[11px] mt-0.5">
                          {row.label}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-slate-800 break-all" title={row.value}>
                            {row.value}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(row.value, row.key)}
                          className="shrink-0"
                        >
                          {copyState[row.key] ? (
                            <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
                          ) : (
                            <Copy className="w-3 h-3 mr-0.5" />
                          )}
                          {copyState[row.key] ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Payload Inspector */}
        {activeTab === 'PAYLOAD' && (
          <div className="space-y-5">
            {apiLog?.errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1 font-mono text-xs">
                <div className="font-bold text-sm font-sans flex items-center gap-1.5 text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Execution Exception: {apiLog.internalErrorCode || 'ERR_API_FAILURE'}</span>
                </div>
                <p className="font-sans text-rose-800 mt-1">{apiLog.errorMessage}</p>
                {apiLog.providerErrorCode && <div>Provider Error Code: <strong>{apiLog.providerErrorCode}</strong></div>}
              </div>
            )}

            {apiLog?.endpoint && (
              <Card title="HTTP Endpoint & Latency" subtitle="Request metadata">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 font-mono text-xs">
                  <div>Provider: <strong className="font-sans text-slate-900">{apiLog.providerName}</strong></div>
                  <div>HTTP Method: <strong className="text-purple-700">{apiLog.httpMethod}</strong></div>
                  <div className="col-span-1 sm:col-span-2">Endpoint: <strong className="text-slate-900 truncate block">{apiLog.endpoint}</strong></div>
                  <div>HTTP Status: <strong className={apiLog.httpStatus >= 200 && apiLog.httpStatus < 400 ? 'text-emerald-700' : 'text-rose-700'}>{apiLog.httpStatus}</strong></div>
                  <div>Latency: <strong className="text-slate-900">{apiLog.responseTimeMs}ms</strong></div>
                </div>
              </Card>
            )}

            {apiLog?.requestHeaders && (
              <Card title="Sanitized Request Headers" subtitle="Authentication tokens & sensitive headers are masked">
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs space-y-1 max-h-64 overflow-auto">
                  {Object.entries(sanitizeHeaders(apiLog.requestHeaders)).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-purple-400">{key}:</span>
                      <span className="text-emerald-400 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {apiLog?.requestPayloadSanitized && (
              <JsonViewer title="Sanitized Request Payload" data={apiLog.requestPayloadSanitized} initiallyExpanded={false} />
            )}
            {apiLog?.responsePayloadSanitized && (
              <JsonViewer title="Sanitized Response Payload" data={apiLog.responsePayloadSanitized} initiallyExpanded={false} />
            )}
            {callbackLog?.payloadSanitized && (
              <JsonViewer title="Callback Event Payload" data={callbackLog.payloadSanitized} initiallyExpanded={false} />
            )}
            {webhookLog?.payloadSanitized && (
              <JsonViewer title="Webhook Payload" data={webhookLog.payloadSanitized} initiallyExpanded={false} />
            )}

            {loginLog?.userEmail && (
              <Card title="User Session Metadata" subtitle="Authentication log inspection">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>User: <strong className="text-slate-900">{loginLog.userName} ({loginLog.userEmail})</strong></div>
                  <div>Role: <span className="font-bold text-purple-700">{loginLog.userRole}</span></div>
                  <div>IP Address: <span className="font-mono text-slate-900">{loginLog.ipAddress}</span></div>
                  <div>Device / Browser: <span className="text-slate-900">{loginLog.device} • {loginLog.browser} ({loginLog.os})</span></div>
                  <div>Auth Method: <strong className="text-slate-900">{loginLog.authMethod}</strong></div>
                  <div>Session Duration: <strong className="text-slate-900">{loginLog.sessionDuration || 'N/A'}</strong></div>
                </div>
              </Card>
            )}

            {activityLog?.action && (
              <div className="space-y-4">
                <Card title="Activity Audit Context" subtitle="Recorded metadata for this action">
                  <div className="space-y-3 text-slate-800 text-xs">
                    <div>Action: <span className="font-bold font-mono text-purple-700 px-2 py-0.5 rounded bg-purple-50 border border-purple-200">{activityLog.action}</span></div>
                    <div>Description: <p className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded text-[12px] leading-relaxed">{activityLog.description || activityLog.whatHappened}</p></div>
                  </div>
                </Card>

                {!hasInlineDiff && activityLog.previousValue && (
                  <JsonViewer title="Previous State (Before)" data={activityLog.previousValue} initiallyExpanded={false} />
                )}
                {!hasInlineDiff && activityLog.newValue && (
                  <JsonViewer title="New State (After)" data={activityLog.newValue} initiallyExpanded={false} />
                )}
                {(activityLog as any)?.metadata && (
                  <JsonViewer title="Metadata (extra fields)" data={(activityLog as any).metadata} initiallyExpanded={false} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'TIMELINE' && (
          <Card title="Trace Audit Log" subtitle="Chronological system lifecycle steps">
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 py-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[var(--primary)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Log Entry Generated</span>
                    <span className="text-[11px] font-mono text-slate-400">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 text-[12px]">
                    Recorded under <span className="font-mono font-bold">{log.id}</span>. Use Trace Full Lifecycle button in top-right to find related API calls, callbacks, and webhooks sharing the same trace ID.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Drawer>
  );
};
