'use client';

import React from 'react';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ColumnDefinition } from '@/types/common';
import { BusinessEntity, PaginationState } from '@/types/domain';
import { formatDate } from '@/utils/formatters';
import { Eye, ShieldAlert, ShieldCheck, Key } from 'lucide-react';

export interface UserTableProps {
  entities: BusinessEntity[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onViewDetails: (entity: BusinessEntity) => void;
  onToggleBlock: (entity: BusinessEntity) => void;
  onResetPassword: (entity: BusinessEntity) => void;
  isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  entities,
  pagination,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onToggleBlock,
  onResetPassword,
  isLoading = false,
}) => {
  const columns: ColumnDefinition<BusinessEntity>[] = [
    {
      key: 'code',
      header: 'Code / ID',
      render: (row) => (
        <span className="font-mono font-bold text-[var(--primary)] text-xs">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name / Business',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[var(--text-primary)]">{row.name}</div>
          <div className="text-[11px] text-[var(--text-muted)]">{row.businessName || row.role}</div>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Contact Info',
      render: (row) => (
        <div>
          <div className="text-xs text-[var(--text-primary)]">{row.email}</div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">{row.mobile}</div>
        </div>
      ),
    },
    {
      key: 'parentName',
      header: 'Mapped Parent',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.parentName || (row.type === 'BACK_OFFICE' ? 'Bright Spark Admin' : 'Direct')}
        </span>
      ),
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.kycStatus} size="sm" />,
    },
    {
      key: 'status',
      header: 'Account Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
        <Table
          columns={columns}
          data={entities}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          renderActions={(row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(row)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(row)}
                title="Reset Password"
                className="px-2"
              >
                <Key className="w-3.5 h-3.5 text-slate-600" />
              </Button>

              <Button
                variant={row.status === 'BLOCKED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onToggleBlock(row)}
                title={row.status === 'BLOCKED' ? 'Unblock User' : 'Block User'}
                className="px-2"
              >
                {row.status === 'BLOCKED' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                )}
              </Button>
            </div>
          )}
        />
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
