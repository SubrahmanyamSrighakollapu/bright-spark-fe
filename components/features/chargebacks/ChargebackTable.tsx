'use client';

import React from 'react';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Chargeback } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Eye, Clock } from 'lucide-react';

export interface ChargebackTableProps {
  data: Chargeback[];
  isLoading?: boolean;
  onViewCase: (chargeback: Chargeback) => void;
}

export const ChargebackTable: React.FC<ChargebackTableProps> = ({
  data,
  isLoading = false,
  onViewCase,
}) => {
  const getPriorityBadge = (priority: Chargeback['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">LOW</span>;
    }
  };

  const columns = [
    {
      key: 'chargebackId',
      header: 'Dispute ID / Order',
      render: (row: Chargeback) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.chargebackId}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.orderId || row.transactionId}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Retailer / Entity',
      render: (row: Chargeback) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.entityName}</div>
          <div className="text-[11px] text-slate-400">{row.provider}</div>
        </div>
      ),
    },
    {
      key: 'disputedAmount',
      header: 'Disputed Amount',
      align: 'right' as const,
      render: (row: Chargeback) => (
        <div>
          <span className="font-mono font-extrabold text-xs text-rose-700 block">{formatCurrency(row.disputedAmount)}</span>
          {row.holdAmount > 0 && (
            <span className="text-[10px] font-mono text-amber-700">Lien Hold: {formatCurrency(row.holdAmount)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'reasonCode',
      header: 'Dispute Reason',
      render: (row: Chargeback) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 block">{row.reasonCode}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{row.reason}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      align: 'center' as const,
      render: (row: Chargeback) => getPriorityBadge(row.priority),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: Chargeback) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'responseDueDate',
      header: 'Response Deadline',
      render: (row: Chargeback) => {
        const isClosed = row.status === 'WON' || row.status === 'LOST' || row.status === 'CLOSED';
        const dueTime = new Date(row.responseDueDate).getTime();
        const now = Date.now();
        const isOverdue = !isClosed && dueTime < now;
        const isDueSoon = !isClosed && !isOverdue && dueTime - now < 86400000 * 2;

        return (
          <div>
            <div className="text-xs text-slate-800 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatDate(row.responseDueDate)}</span>
            </div>
            {!isClosed && (
              <span
                className={`text-[10px] font-bold block ${
                  isOverdue ? 'text-rose-700 font-extrabold' : isDueSoon ? 'text-amber-700 font-bold' : 'text-slate-500'
                }`}
              >
                {isOverdue ? 'OVERDUE' : isDueSoon ? 'Due Soon' : 'Active Deadline'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (row: Chargeback) => (
        <span className="text-xs text-slate-700 font-medium">{row.assignedTo || 'Unassigned'}</span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
      <Table
        columns={columns}
        data={data}
        keyExtractor={(row) => row.chargebackId}
        isLoading={isLoading}
        renderActions={(row) => (
          <Button variant="outline" size="sm" onClick={() => onViewCase(row)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
            View Case
          </Button>
        )}
      />
    </div>
  );
};
