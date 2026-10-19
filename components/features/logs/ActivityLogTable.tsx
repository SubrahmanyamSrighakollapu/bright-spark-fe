'use client';

import React from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ActivityLog } from '@/types/domain';
import { formatDate } from '@/utils/formatters';
import { TraceReferenceBadge } from './TraceReferenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Eye, Shield, Wallet, Users, FileCheck2, Settings2, KeyRound, Bell, Building2 } from 'lucide-react';

export interface ActivityLogTableProps {
  data: ActivityLog[];
  isLoading?: boolean;
  onViewLog: (log: ActivityLog) => void;
  onOpenTraceSearch?: (traceId: string) => void;
}

const actionColorMap: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  LOGIN_FAILURE: 'bg-rose-50 text-rose-800 border-rose-200',
  REFRESH_SUCCESS: 'bg-sky-50 text-sky-800 border-sky-200',
  LOGOUT: 'bg-slate-50 text-slate-800 border-slate-200',
  PASSWORD_CHANGED: 'bg-purple-50 text-purple-800 border-purple-200',
  USER_CREATED: 'bg-blue-50 text-blue-800 border-blue-200',
  USER_UPDATED: 'bg-blue-50 text-blue-800 border-blue-200',
  USER_STATUS_UPDATED: 'bg-amber-50 text-amber-800 border-amber-200',
  ROLE_CREATED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  ROLE_PERMISSIONS_UPDATED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  KYC_APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  KYC_REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
  KYC_SUBMITTED: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  WALLET_CREDIT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  WALLET_DEBIT: 'bg-orange-50 text-orange-800 border-orange-200',
  WALLET_HOLD: 'bg-amber-50 text-amber-800 border-amber-200',
  WALLET_BALANCE_CORRECTION: 'bg-rose-50 text-rose-800 border-rose-200',
};

const moduleIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  USERS: Users,
  FINANCE: Wallet,
  KYC: FileCheck2,
  ADMIN: Settings2,
  COMM: Bell,
  SECURITY: KeyRound,
  SYSTEM: Shield,
};

function badgeColorForBadge(b: string): string {
  const k = b.toUpperCase();
  if (k.includes('USER')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (k.includes('PARTY')) return 'bg-sky-50 text-sky-700 border-sky-200';
  if (k.includes('SESSION') || k.includes('AUTH')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (k.includes('WALLET')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (k.includes('ROLE') || k.includes('PERMISSION')) return 'bg-violet-50 text-violet-700 border-violet-200';
  if (k.includes('KYC') || k.includes('DOCUMENT')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (k.includes('NOTIFICATION')) return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
  if (k.includes('EMPLOYEE')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  if (k.includes('TRANSACTION') || k.includes('LEDGER')) return 'bg-green-50 text-green-700 border-green-200';
  if (k.includes('HIERARCHY')) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (k.includes('PLATFORM')) return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  data,
  isLoading = false,
  onViewLog,
  onOpenTraceSearch,
}) => {
  const columns = [
    {
      key: 'id',
      header: 'Activity',
      render: (row: ActivityLog) => {
        const IconComp = moduleIconMap[row.module] || Shield;
        return (
          <div className="flex items-start gap-2.5 min-w-[200px]">
            <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center">
              <IconComp className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <div className="font-mono font-bold text-[13px] text-[var(--primary)] leading-tight">
                {row.id}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                  {row.module}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  #{(row.action || '').slice(0, 24)}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'actor',
      header: 'Who performed',
      render: (row: ActivityLog) => (
        <div className="min-w-[180px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-[#D4E1AE] flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-700" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[13px] text-slate-900 truncate">{row.actorName}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                  {row.actorRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'what',
      header: 'What happened',
      render: (row: ActivityLog) => {
        const cls = actionColorMap[row.action] || 'bg-slate-50 text-slate-700 border-slate-200';
        return (
          <div className="min-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${cls}`}>
                {row.action.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={row.status} size="sm" />
              <StatusBadge status={row.severity} size="sm" />
            </div>
            <div className="text-[12px] text-slate-700 leading-snug line-clamp-2">{row.whatHappened || row.description}</div>
          </div>
        );
      },
    },
    {
      key: 'target',
      header: 'Affected record',
      render: (row: ActivityLog) => {
        const bCls = badgeColorForBadge(row.targetBadge || row.entityType || 'SYSTEM');
        return (
          <div className="min-w-[200px]">
            <div className="font-semibold text-[13px] text-slate-900 leading-tight truncate max-w-[280px]">
              {row.targetName}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${bCls}`}>
                {row.targetBadge || row.entityType || 'System'}
              </span>
              {row.targetSummary && (
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                  {row.targetSummary}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'trace',
      header: 'Trace',
      render: (row: ActivityLog) => (
        <TraceReferenceBadge traceId={row.traceId} onClick={onOpenTraceSearch} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (row: ActivityLog) => (
        <div className="text-xs text-slate-600 whitespace-nowrap font-mono leading-snug">
          <div>{formatDate(row.createdAt)}</div>
          <div className="text-[10px] text-slate-400">
            {row.ipAddress && row.ipAddress !== '—' ? `from ${row.ipAddress}` : ''}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
      <Table
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyTitle="No activity logs yet"
        emptyDescription="System activities such as logins, user updates, wallet adjustments, or KYC decisions will appear here automatically."
        renderActions={(row) => (
          <Button variant="outline" size="sm" onClick={() => onViewLog(row)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
            View
          </Button>
        )}
      />
    </div>
  );
};
