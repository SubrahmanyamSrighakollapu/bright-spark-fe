import React from 'react';
import { MasterDistributorCommissionRecord } from '@/services/commissionService';
import { Table, StatusBadge, Button, Tooltip } from '@/components/ui';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Eye, Percent, Store, Building2 } from 'lucide-react';

interface MasterDistributorCommissionTableProps {
  commissions: MasterDistributorCommissionRecord[];
  isLoading?: boolean;
  onViewDetails: (commission: MasterDistributorCommissionRecord) => void;
}

export const MasterDistributorCommissionTable: React.FC<
  MasterDistributorCommissionTableProps
> = ({ commissions, isLoading = false, onViewDetails }) => {
  const columns: ColumnDefinition<MasterDistributorCommissionRecord>[] = [
    {
      key: 'transactionRef',
      header: 'Transaction ID',
      render: (row) => (
        <div className="font-mono font-bold text-indigo-600 text-xs">
          {row.transactionRef}
        </div>
      ),
    },
    {
      key: 'retailer',
      header: 'Retailer Outlet',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div>
            <p className="font-semibold text-slate-900">{row.retailerName}</p>
            <p className="text-[11px] text-slate-500 font-mono">{row.retailerId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'distributor',
      header: 'Parent Distributor',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div>
            <p className="font-medium text-slate-800">{row.distributorName}</p>
            <p className="text-[11px] text-slate-500 font-mono">{row.distributorId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.serviceType}
        </span>
      ),
    },
    {
      key: 'transactionAmount',
      header: 'Txn Amount',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-900 tabular-nums text-xs">
          {formatCurrency(row.transactionAmount)}
        </span>
      ),
    },
    {
      key: 'mdCommissionRate',
      header: 'Commission Rate',
      align: 'center',
      render: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-700 font-medium border border-slate-200">
          {row.mdCommissionRate}
        </span>
      ),
    },
    {
      key: 'mdCommissionAmount',
      header: 'Earned Commission',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-emerald-600 font-mono tabular-nums text-xs">
          +{formatCurrency(row.mdCommissionAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <StatusBadge
          status={row.status === 'CREDITED' ? 'SUCCESS' : row.status === 'REVERSED' ? 'FAILED' : 'PENDING'}
          label={row.status}
          size="sm"
        />
      ),
    },
    {
      key: 'createdDate',
      header: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {formatDateTime(row.creditedDate || row.createdDate)}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={commissions}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyTitle="No Commission Records Found"
      emptyDescription="There are no commission records matching your search filters or network criteria."
      onRowClick={(row) => onViewDetails(row)}
      renderActions={(row) => (
        <Tooltip content="View Commission Details">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(row)}
            className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </Tooltip>
      )}
    />
  );
};
