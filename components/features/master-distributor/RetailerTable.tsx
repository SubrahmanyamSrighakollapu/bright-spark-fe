import React, { useState, useEffect } from 'react';
import { Retailer, RetailerPlan } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { Table, StatusBadge, Button, Tooltip } from '@/components/ui';
import { ColumnDefinition } from '@/types/common';
import { formatDate } from '@/utils/formatters';
import Link from 'next/link';
import { Eye, Edit, Power, Store, Building2, Tag, ArrowLeftRight } from 'lucide-react';


interface RetailerTableProps {
  retailers: Retailer[];
  isLoading?: boolean;
  onView: (retailer: Retailer) => void;
  onEdit: (retailer: Retailer) => void;
  onToggleStatus: (retailer: Retailer) => void;
}

export const RetailerTable: React.FC<RetailerTableProps> = ({
  retailers,
  isLoading = false,
  onView,
  onEdit,
  onToggleStatus,
}) => {
  const [plansMap, setPlansMap] = useState<Record<string, RetailerPlan>>({});

  useEffect(() => {
    const loadPlans = async () => {
      const res = await retailerPlanService.getPlans();
      if (res.success && res.data) {
        const map: Record<string, RetailerPlan> = {};
        res.data.forEach((p) => {
          map[p.id] = p;
        });
        setPlansMap(map);
      }
    };
    loadPlans();
  }, []);

  const columns: ColumnDefinition<Retailer>[] = [
    {
      key: 'name',
      header: 'Retailer Details',
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 shrink-0 mt-0.5">
            <Store className="w-4 h-4 text-indigo-600" />
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
      key: 'distributor',
      header: 'Assigned Authority',
      render: (row) => {
        const mockDistributor = hierarchyService.getDistributorById(row.distributorId);
        const isDirect = row.parentAuthorityType === 'MASTER_DISTRIBUTOR' || row.parentAuthorityType === 'PLATFORM';
        const authorityName = row.distributorName || mockDistributor?.name;
        const authorityCode = row.distributorCode || mockDistributor?.code;
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">{authorityName || (isDirect ? 'Direct assignment' : 'Distributor not assigned')}</p>
              <p className="text-[11px] text-slate-500">{isDirect ? 'Direct under network authority' : authorityCode || 'No distributor mapping'}</p>
            </div>
          </div>
        );
      },
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
      key: 'plan',
      header: 'Commercial Plan',
      render: (row) => {
        const plan = plansMap[row.planId];
        return (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/60">
            <Tag className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{plan?.name || row.planId}</span>
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
      key: 'accountStatus',
      header: 'Account Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.accountStatus} size="sm" />,
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
      data={retailers}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyTitle="No Retailers Found"
      emptyDescription="There are no retailers matching your search criteria or assigned to your network."
      onRowClick={(row) => onView(row)}
      renderActions={(row) => {
        const isPending = row.approvalStatus === 'PENDING_APPROVAL';
        const isRejected = row.approvalStatus === 'REJECTED';
        const canToggle = !isPending && !isRejected;

        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="View Outlet Transactions">
              <Link href={`/master-distributor/transactions?retailerId=${row.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
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
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Edit Retailer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row)}
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
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
                  : row.accountStatus === 'ACTIVE'
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
                    : row.accountStatus === 'ACTIVE'
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
