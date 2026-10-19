import React from 'react';
import { Distributor } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { Table, StatusBadge, Button, Tooltip } from '@/components/ui';
import { ColumnDefinition } from '@/types/common';
import { formatDate, formatCurrency } from '@/utils/formatters';
import Link from 'next/link';
import { Eye, Edit, Power, Store, Building2, ArrowLeftRight } from 'lucide-react';


interface DistributorTableProps {
  distributors: Distributor[];
  isLoading?: boolean;
  onView: (distributor: Distributor) => void;
  onEdit: (distributor: Distributor) => void;
  onToggleStatus: (distributor: Distributor) => void;
}

export const DistributorTable: React.FC<DistributorTableProps> = ({
  distributors,
  isLoading = false,
  onView,
  onEdit,
  onToggleStatus,
}) => {
  const columns: ColumnDefinition<Distributor>[] = [
    {
      key: 'name',
      header: 'Distributor Details',
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{row.name}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {row.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{row.businessName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-900 font-medium">{row.mobile}</p>
          <p className="text-slate-500 font-mono text-[11px]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'retailers',
      header: 'Retailers Managed',
      align: 'center',
      render: (row) => {
        const count = hierarchyService.getDistributorRetailers(row.id).length;
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            <span>{count} Retailers</span>
          </div>
        );
      },
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.kycStatus || 'APPROVED'} size="sm" />,
    },
    {
      key: 'approvalStatus',
      header: 'Approval Status',
      align: 'center',
      render: (row) => (
        <StatusBadge
          status={row.approvalStatus || 'APPROVED'}
          size="sm"
          label={
            row.approvalStatus === 'PENDING_APPROVAL'
              ? 'Pending Admin Approval'
              : row.approvalStatus === 'REJECTED'
              ? 'Rejected'
              : 'Approved'
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Created On',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={distributors}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyTitle="No Distributors Found"
      emptyDescription="There are no distributors matching your search criteria or assigned to your network."
      onRowClick={(row) => onView(row)}
      renderActions={(row) => {
        const isPending = row.approvalStatus === 'PENDING_APPROVAL';
        const isRejected = row.approvalStatus === 'REJECTED';
        const canToggle = !isPending && !isRejected;

        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="View Scoped Transactions">
              <Link href={`/master-distributor/transactions?distributorId=${row.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
              </Link>
            </Tooltip>

            <Tooltip content="View Details">

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(row)}
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Edit Distributor">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row)}
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip
              content={
                isPending
                  ? 'Awaiting Admin Approval'
                  : isRejected
                  ? 'Account Rejected'
                  : row.status === 'ACTIVE'
                  ? 'Deactivate Account'
                  : 'Activate Account'
              }
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={!canToggle}
                onClick={() => canToggle && onToggleStatus(row)}
                className={`p-1.5 h-8 w-8 ${
                  !canToggle
                    ? 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                    : row.status === 'ACTIVE'
                    ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Power className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        );
      }}
    />
  );
};
