'use client';

import React from 'react';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { LoginLog } from '@/types/domain';
import { formatDate } from '@/utils/formatters';
import { Eye, MapPin, ShieldAlert } from 'lucide-react';

export interface LoginLogTableProps {
  data: LoginLog[];
  isLoading?: boolean;
  onViewLog: (log: LoginLog) => void;
}

export const LoginLogTable: React.FC<LoginLogTableProps> = ({
  data,
  isLoading = false,
  onViewLog,
}) => {
  const columns = [
    {
      key: 'id',
      header: 'Login ID',
      render: (row: LoginLog) => (
        <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.id}</span>
      ),
    },
    {
      key: 'userEmail',
      header: 'User / Role',
      render: (row: LoginLog) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.userName}</div>
          <div className="font-mono text-[11px] text-purple-700">{row.userEmail} ({row.userRole})</div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device & IP',
      render: (row: LoginLog) => (
        <div>
          <span className="font-mono text-xs text-slate-900 block">{row.ipAddress}</span>
          <span className="text-[11px] text-slate-500">{row.device} • {row.browser} • {row.os}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (row: LoginLog) => {
        if (row.locationStatus === 'GRANTED' && row.latitude != null && row.longitude != null) {
          return (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-mono text-[11px] text-slate-800 block">{Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}</span>
                {row.locationAccuracy != null && (
                  <span className="text-[10px] text-slate-500">±{Math.round(row.locationAccuracy)}m</span>
                )}
              </div>
            </div>
          );
        }
        const tone =
          row.locationStatus === 'DENIED'
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : row.locationStatus === 'TIMEOUT' || row.locationStatus === 'ERROR'
            ? 'bg-rose-100 text-rose-900 border-rose-300'
            : 'bg-slate-100 text-slate-700 border-slate-200';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tone}`}>
            {row.locationStatus ?? 'UNAVAILABLE'}
          </span>
        );
      },
    },
    {
      key: 'authMethod',
      header: 'Auth Method',
      align: 'center' as const,
      render: (row: LoginLog) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {row.authMethod}
        </span>
      ),
    },
    {
      key: 'securityFlags',
      header: 'Security Signals',
      render: (row: LoginLog) => (
        <div className="flex flex-wrap gap-1">
          {row.securityFlags && row.securityFlags.length > 0 ? (
            row.securityFlags.map((flag) => (
              <span key={flag} className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                <span>{flag}</span>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 font-mono">Standard</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: LoginLog) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'loginTime',
      header: 'Login Time',
      render: (row: LoginLog) => (
        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{formatDate(row.loginTime)}</span>
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
        renderActions={(row) => (
          <Button variant="outline" size="sm" onClick={() => onViewLog(row)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
            View
          </Button>
        )}
      />
    </div>
  );
};
