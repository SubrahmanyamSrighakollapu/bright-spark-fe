'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TraceSearchResult, ActivityLog, ApiLog, CallbackLog, WebhookLog, BaseLog } from '@/types/domain';
import { logService } from '@/services/logService';
import { formatDate } from '@/utils/formatters';
import {
  Search,
  GitCommit,
  ExternalLink,
  Shield,
  Wifi,
  ArrowLeftRight,
  BellRing,
  Wallet,
  Users,
  FileCheck2,
  KeyRound,
  Settings2,
  AlertTriangle,
  Clock,
  DatabaseZap,
  Loader2,
  SearchX,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export interface TraceSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialReferenceId?: string;
}

type TimelineEvent = {
  kind: 'ACTIVITY' | 'API' | 'CALLBACK' | 'WEBHOOK';
  id: string;
  createdAt: string;
  title: string;
  subtitle: string;
  severity: BaseLog['severity'];
  status: BaseLog['status'];
  sourceModule: string;
  meta?: Array<{ label: string; value: string; cls?: string }>;
};

const moduleIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  USERS: Users,
  FINANCE: Wallet,
  KYC: FileCheck2,
  ADMIN: Settings2,
  COMM: BellRing,
  SECURITY: KeyRound,
  SYSTEM: Shield,
  API: Wifi,
};

const kindIconMap: Record<TimelineEvent['kind'], React.ComponentType<{ className?: string }>> = {
  ACTIVITY: Shield,
  API: Wifi,
  CALLBACK: ArrowLeftRight,
  WEBHOOK: BellRing,
};

const kindColorMap: Record<TimelineEvent['kind'], { border: string; dot: string; bg: string; text: string }> = {
  ACTIVITY: { border: 'border-indigo-500', dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  API: { border: 'border-blue-500', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  CALLBACK: { border: 'border-emerald-500', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  WEBHOOK: { border: 'border-purple-500', dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
};

function buildTimeline(result: TraceSearchResult | null): TimelineEvent[] {
  if (!result) return [];
  const events: TimelineEvent[] = [];

  for (const act of result.activityLogs) {
    const a = act as ActivityLog;
    const meta: TimelineEvent['meta'] = [];
    if (a.actorName) meta.push({ label: 'Actor', value: a.actorName });
    if (a.targetName) meta.push({ label: 'Target', value: a.targetName });
    events.push({
      kind: 'ACTIVITY',
      id: a.id,
      createdAt: a.createdAt,
      title: a.whatHappened || a.description || a.action,
      subtitle: a.action,
      severity: a.severity,
      status: a.status,
      sourceModule: a.module || a.sourceModule || 'ACTIVITY',
      meta,
    });
  }

  for (const api of result.apiLogs) {
    const a = api as ApiLog;
    events.push({
      kind: 'API',
      id: a.id,
      createdAt: a.createdAt,
      title: `${a.httpMethod || 'HTTP'} ${a.endpoint || a.service || 'request'}`,
      subtitle: a.providerName ? `${a.providerName} • ${a.service || ''}` : 'Internal API call',
      severity: a.severity,
      status: (a.resultStatus === 'FAILED' || a.httpStatus >= 400) ? 'FAILED' : 'SUCCESS',
      sourceModule: 'API',
      meta: [
        { label: 'HTTP', value: `${a.httpMethod || '?'} ${a.httpStatus || '?'}`, cls: a.httpStatus && a.httpStatus >= 400 ? 'text-rose-700' : 'text-slate-700' },
        { label: 'Latency', value: `${a.responseTimeMs ?? 0}ms`, cls: a.responseTimeMs && a.responseTimeMs > 3000 ? 'text-amber-700' : 'text-slate-700' },
      ],
    });
  }

  for (const cb of result.callbacks) {
    const c = cb as CallbackLog;
    events.push({
      kind: 'CALLBACK',
      id: c.id,
      createdAt: c.createdAt,
      title: `Inbound callback from ${c.providerName || 'provider'}`,
      subtitle: c.providerReference || '',
      severity: c.processingStatus === 'FAILED' ? 'ERROR' : c.isDuplicate ? 'WARNING' : 'INFO',
      status: c.processingStatus === 'PROCESSED' ? 'SUCCESS' : 'FAILED',
      sourceModule: 'CALLBACK',
      meta: [
        { label: 'Status', value: c.processingStatus || '', cls: c.processingStatus === 'FAILED' ? 'text-rose-700' : 'text-slate-700' },
        c.isDuplicate ? { label: 'Note', value: 'Duplicate', cls: 'text-amber-700' } : undefined,
      ].filter(Boolean) as TimelineEvent['meta'],
    });
  }

  for (const wh of result.webhooks) {
    const w = wh as WebhookLog;
    events.push({
      kind: 'WEBHOOK',
      id: w.id,
      createdAt: w.createdAt,
      title: `Outbound webhook: ${w.eventType || 'event'}`,
      subtitle: w.endpointUrl || '',
      severity: w.status === 'FAILED' || w.status === 'EXHAUSTED' ? 'ERROR' : 'INFO',
      status: w.status === 'DELIVERED' ? 'SUCCESS' : 'FAILED',
      sourceModule: 'WEBHOOK',
      meta: [
        { label: 'Attempts', value: `${w.attemptCount || 0}`, cls: (w.attemptCount || 0) > 1 ? 'text-amber-700' : 'text-slate-700' },
      ],
    });
  }

  events.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return ta - tb;
  });

  return events;
}

export const TraceSearchDrawer: React.FC<TraceSearchDrawerProps> = ({
  isOpen,
  onClose,
  initialReferenceId = '',
}) => {
  const [query, setQuery] = useState(initialReferenceId);
  const [result, setResult] = useState<TraceSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (ref: string) => {
    if (!ref.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await logService.traceByReference(ref.trim());
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.error) setSearchError(res.data.error);
      } else {
        setResult(null);
        setSearchError('Trace lookup returned no results.');
      }
    } catch (e: any) {
      setResult(null);
      setSearchError(e instanceof Error ? e.message : 'Trace search failed');
    } finally {
      setHasSearched(true);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setQuery(initialReferenceId);
    let cancelled = false;
    if (initialReferenceId && initialReferenceId.trim()) {
      setIsSearching(true);
      setSearchError(null);
      logService
        .traceByReference(initialReferenceId.trim())
        .then((res) => {
          if (cancelled) return;
          if (res.success && res.data) {
            setResult(res.data);
            if (res.data.error) setSearchError(res.data.error);
          } else {
            setResult(null);
            setSearchError('Trace lookup returned no results.');
          }
        })
        .catch((e: any) => {
          if (cancelled) return;
          setResult(null);
          setSearchError(e instanceof Error ? e.message : 'Trace search failed');
        })
        .finally(() => {
          if (cancelled) return;
          setHasSearched(true);
          setIsSearching(false);
        });
    } else {
      setResult(null);
      setHasSearched(false);
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialReferenceId]);

  const timeline = useMemo(() => buildTimeline(result), [result]);
  const totalEvents = timeline.length;
  const successCount = timeline.filter((t) => t.status === 'SUCCESS' || t.status === 'COMPLETED').length;
  const failCount = timeline.filter((t) => t.status === 'FAILED' || t.status === 'FAILURE' || t.severity === 'ERROR' || t.severity === 'CRITICAL').length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Global Transaction Lifecycle Trace"
      size="xl"
      className="w-full md:w-[940px] md:max-w-[94vw]"
    >
      <div className="space-y-5 text-xs">
        {/* Search Header */}
        <Card title="Trace Reference Lookup" subtitle="Trace end-to-end payment lifecycle across API requests, callbacks, webhooks, and audit logs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex gap-2"
          >
            <div className="flex-1">
              <Input
                placeholder="Enter Trace ID, Correlation ID, Transaction ID, UTR, Order ID, Activity (ACT_########)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSearching}
              leftIcon={<GitCommit className="w-3.5 h-3.5" />}
            >
              Search Trace
            </Button>
          </form>
          {searchError && hasSearched && !result && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-[12px] text-rose-900">Trace lookup error</div>
                <div className="text-[11px] text-rose-800 mt-0.5">{searchError}</div>
              </div>
            </div>
          )}
        </Card>

        {/* Initial / Empty Loading state while auto-search runs */}
        {isSearching && !hasSearched && (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-[var(--primary)] animate-spin" />
            <div className="text-[13px] font-semibold text-slate-800">Tracing reference events…</div>
            <div className="text-[11px] text-slate-500">Looking up audit logs, API calls, and callbacks matching the reference.</div>
          </div>
        )}

        {/* Empty state: opened without initial ref and not searched */}
        {!isSearching && !hasSearched && (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <DatabaseZap className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-slate-900">Enter a reference to trace</div>
              <div className="text-[12px] text-slate-500 mt-1 max-w-md leading-relaxed">
                Paste a trace ID, correlation ID, request ID, UTR, order reference, or Activity ID (<code className="font-mono bg-slate-200 px-1 rounded">ACT_########</code>). The system will search across audit actions, HTTP API calls, inbound callbacks, and outbound webhooks sharing that reference.
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl mt-2 w-full text-[11px]">
              {[
                { label: 'Activity ID', hint: 'ACT_00000013', icon: Shield },
                { label: 'Trace / Correlation', hint: '#5BC4081D', icon: GitCommit },
                { label: 'Request ID', hint: 'UUID from headers', icon: Wifi },
              ].map((c) => (
                <div key={c.label} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
                  <c.icon className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800">{c.label}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">{c.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty results state: searched but 0 matches */}
        {!isSearching && hasSearched && result && result.counts?.total === 0 && (
          <div className="p-8 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <SearchX className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-amber-900">No linked events found for this reference</div>
              <div className="text-[11px] text-amber-800 mt-1 max-w-md leading-relaxed">
                Try tracing a different reference. Valid references include: trace IDs from audit rows, request IDs from API calls, UTRs from providers, order references, or explicit activity IDs.
              </div>
            </div>
            {result.matchedOn && result.matchedOn.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.matchedOn.map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                    Matched: {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {!isSearching && hasSearched && result && (result.counts?.total ?? 0) > 0 && (
          <div className="space-y-5">
            {/* Result identity + counts summary */}
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 border border-indigo-100 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-700">
                      Reference Trace — {result.referenceId?.length > 48 ? `${result.referenceId.slice(0, 46)}…` : result.referenceId}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {result.matchedOn && result.matchedOn.length > 0 && result.matchedOn.map((m) => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                          MATCH: {m}
                        </span>
                      ))}
                      {(!result.matchedOn || result.matchedOn.length === 0) && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                          CONTENT SEARCH
                        </span>
                      )}
                    </div>
                    {result.timeframe?.earliest && result.timeframe?.latest && (
                      <div className="mt-1 text-[11px] text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="font-mono">{formatDate(result.timeframe.earliest)}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-mono">{formatDate(result.timeframe.latest)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <div className="px-3 py-2 rounded-xl bg-slate-900 text-white flex flex-col items-center">
                    <span className="text-[11px] text-slate-300 font-semibold">Events</span>
                    <span className="font-mono font-extrabold text-[14px]">{totalEvents}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Success</div>
                    <span className="font-mono font-extrabold text-[13px]">{successCount}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-800"><XCircle className="w-3 h-3" /> Issues</div>
                    <span className="font-mono font-extrabold text-[13px]">{failCount}</span>
                  </div>
                  {((result.counts?.api ?? 0) > 0 || (result.counts?.activity ?? 0) > 0) && (
                    <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-0.5">
                      <div className="text-[10px] font-semibold text-slate-600">Activity • API</div>
                      <span className="font-mono font-extrabold text-[13px] text-slate-900">
                        {result.counts?.activity ?? 0} • {result.counts?.api ?? 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <Card title="End-to-End Chronological Event Flow" subtitle={`${timeline.length} event${timeline.length === 1 ? '' : 's'} sorted ascending`}>
              {timeline.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-slate-500">No timeline events to display.</div>
              ) : (
                <div className="space-y-5 relative pl-6 border-l-2 border-slate-200 py-2">
                  {timeline.map((ev, idx) => {
                    const color = kindColorMap[ev.kind];
                    const IconComp = kindIconMap[ev.kind];
                    return (
                      <div key={`${ev.kind}-${ev.id}-${idx}`} className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-white border-2 ${color.border} flex items-center justify-center shadow-sm`}>
                          <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg ${color.bg} ${color.text} flex items-center justify-center`}>
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[13px] text-slate-900 leading-snug break-words max-w-[540px]">
                                  {ev.title}
                                </div>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${color.bg} ${color.text} border-transparent`}>
                                    {ev.kind}
                                  </span>
                                  {ev.subtitle && (
                                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[300px]" title={ev.subtitle}>
                                      {ev.subtitle}
                                    </span>
                                  )}
                                  <StatusBadge status={ev.status as any} size="sm" />
                                  {ev.severity && ev.severity !== 'INFO' && (
                                    <StatusBadge status={ev.severity as any} size="sm" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                              {formatDate(ev.createdAt)}
                            </div>
                          </div>
                          {ev.meta && ev.meta.length > 0 && (
                            <div className="ml-9 flex flex-wrap gap-2">
                              {ev.meta.map((m, i) => (
                                <div
                                  key={`${m.label}-${i}`}
                                  className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5 max-w-[280px] min-w-0"
                                >
                                  <span className="text-[10px] uppercase font-bold tracking-wide text-slate-500 shrink-0">
                                    {m.label}:
                                  </span>
                                  <span className={`font-mono text-[11px] truncate min-w-0 ${m.cls || 'text-slate-700'}`}>
                                    {m.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Drawer>
  );
};
