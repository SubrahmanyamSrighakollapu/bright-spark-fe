'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { ColumnDefinition } from '@/types/common';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Retailer, RetailerPlan } from '@/types/domain';
import { retailerService, CreateRetailerInput, UpdateRetailerInput } from '@/services/retailerService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { DistributorRetailerFormModal } from '@/components/features/distributor/DistributorRetailerFormModal';
import { DistributorRetailerDetailDrawer } from '@/components/features/distributor/DistributorRetailerDetailDrawer';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Power,
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Tag,
} from 'lucide-react';

export default function DistributorRetailersPage() {
  const { session } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const distributorId = session?.entityId || 'dst_001';

  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [plans, setPlans] = useState<RetailerPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [selectedKyc, setSelectedKyc] = useState<string>('ALL');
  const [selectedApproval, setSelectedApproval] = useState<string>('ALL');
  const [selectedAccountStatus, setSelectedAccountStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal & Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Toggle Status Confirmation State
  const [toggleTarget, setToggleTarget] = useState<Retailer | null>(null);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [retRes, planRes] = await Promise.all([
        retailerService.getRetailersForDistributor(distributorId),
        retailerPlanService.getActiveRetailerPlans(),
      ]);

      if (retRes.success && retRes.data) {
        setRetailers(retRes.data);
      }
      if (planRes.success && planRes.data) {
        setPlans(planRes.data);
      }
    } catch (err) {
      console.error('Failed to load distributor retailers:', err);
      toastError('Failed to load retailer network list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [distributorId]);

  // Plan lookup map
  const planMap = useMemo(() => {
    const map = new Map<string, RetailerPlan>();
    plans.forEach((p) => map.set(p.id, p));
    return map;
  }, [plans]);

  // Scoped KPI Summary Calculation
  const summary = useMemo(() => {
    const total = retailers.length;
    const active = retailers.filter(
      (r) => r.approvalStatus === 'APPROVED' && r.accountStatus === 'ACTIVE'
    ).length;
    const pending = retailers.filter((r) => r.approvalStatus === 'PENDING_APPROVAL').length;
    const inactive = retailers.filter(
      (r) => r.accountStatus !== 'ACTIVE' && r.approvalStatus !== 'PENDING_APPROVAL'
    ).length;

    return { total, active, pending, inactive };
  }, [retailers]);

  // Filtered & Sorted Dataset
  const filteredRetailers = useMemo(() => {
    return retailers
      .filter((r) => {
        // 1. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchCode = r.code.toLowerCase().includes(q);
          const matchBiz = r.businessName.toLowerCase().includes(q);
          const matchEmail = r.email.toLowerCase().includes(q);
          const matchMobile = r.mobile.includes(q);
          if (!matchName && !matchCode && !matchBiz && !matchEmail && !matchMobile) return false;
        }

        // 2. Plan Filter
        if (selectedPlan !== 'ALL' && r.planId !== selectedPlan) return false;

        // 3. KYC Filter
        if (selectedKyc !== 'ALL' && (r.kycStatus || 'APPROVED') !== selectedKyc) return false;

        // 4. Approval Filter
        if (selectedApproval !== 'ALL' && (r.approvalStatus || 'APPROVED') !== selectedApproval) return false;

        // 5. Account Status Filter
        if (selectedAccountStatus !== 'ALL') {
          const status = r.accountStatus || 'ACTIVE';
          if (status !== selectedAccountStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'createdAt_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'createdAt_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [retailers, searchQuery, selectedPlan, selectedKyc, selectedApproval, selectedAccountStatus, sortBy]);

  // Paginated Results
  const totalPages = Math.ceil(filteredRetailers.length / pageSize) || 1;
  const paginatedRetailers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRetailers.slice(start, start + pageSize);
  }, [filteredRetailers, currentPage, pageSize]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedRetailer(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenDetailDrawer = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setIsDetailDrawerOpen(true);
  };

  const handleFormSubmit = async (input: CreateRetailerInput | UpdateRetailerInput): Promise<boolean> => {
    try {
      if (formMode === 'create') {
        const res = await retailerService.createRetailerForDistributor(
          distributorId,
          input as CreateRetailerInput,
          session?.userId || 'usr_dst_01'
        );

        if (res.success && res.data) {
          toastSuccess(res.message || 'Retailer submitted successfully and is awaiting Admin approval.');
          await loadData();
          return true;
        } else {
          toastError(res.error?.message || 'Failed to create retailer.');
          return false;
        }
      } else {
        if (!selectedRetailer) return false;
        const res = await retailerService.updateRetailerForDistributor(
          distributorId,
          selectedRetailer.id,
          input as UpdateRetailerInput
        );

        if (res.success && res.data) {
          toastSuccess('Retailer updated successfully.');
          await loadData();
          return true;
        } else {
          toastError(res.error?.message || 'Failed to update retailer.');
          return false;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving retailer.';
      toastError(msg);
      return false;
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      const res = await retailerService.toggleRetailerStatusForDistributor(distributorId, toggleTarget.id);
      if (res.success && res.data) {
        toastSuccess(
          `Retailer ${res.data.accountStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`
        );
        await loadData();
      } else {
        toastError(res.error?.message || 'Failed to change account status.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing status.';
      toastError(msg);
    } finally {
      setIsToggling(false);
      setToggleTarget(null);
    }
  };

  // Table Columns Definition
  const columns: ColumnDefinition<Retailer>[] = [
    {
      key: 'name',
      header: 'Retailer Name',
      render: (r: Retailer) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{r.name}</span>
          <span className="text-[11px] font-mono text-slate-400">{r.email}</span>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Retailer ID',
      render: (r: Retailer) => <span className="font-mono font-bold text-blue-600 text-xs">{r.code}</span>,
    },
    {
      key: 'businessName',
      header: 'Business Name',
      render: (r: Retailer) => <span className="font-semibold text-slate-800 text-xs">{r.businessName}</span>,
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (r: Retailer) => <span className="font-mono text-slate-600 text-xs">{r.mobile}</span>,
    },
    {
      key: 'planId',
      header: 'Assigned Plan',
      render: (r: Retailer) => {
        const plan = planMap.get(r.planId);
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            <Tag className="w-3 h-3 text-indigo-500 shrink-0" />
            {plan ? plan.name : r.planId || 'Standard Plan'}
          </span>
        );
      },
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      render: (r: Retailer) => <StatusBadge status={r.kycStatus || 'APPROVED'} size="sm" />,
    },
    {
      key: 'approvalStatus',
      header: 'Approval Status',
      render: (r: Retailer) => {
        if (r.approvalStatus === 'PENDING_APPROVAL') {
          return <StatusBadge status="PENDING_APPROVAL" label="Awaiting Admin Approval" size="sm" />;
        }
        return <StatusBadge status={r.approvalStatus || 'APPROVED'} size="sm" />;
      },
    },
    {
      key: 'accountStatus',
      header: 'Account Status',
      render: (r: Retailer) => <StatusBadge status={r.accountStatus || 'ACTIVE'} size="sm" />,
    },
    {
      key: 'walletBalance',
      header: 'Wallet Balance',
      align: 'right',
      render: () => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {formatCurrency(24850.75)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (r: Retailer) => <span className="font-mono text-slate-500 text-[11px]">{formatDateTime(r.createdAt)}</span>,
    },
  ];

  return (
    <PageContainer
      title="Retailers"
      description="Manage retailers assigned to your Distributor account."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Link href="/distributor/retailers/add"><Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add Retailer</Button></Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialMetricCard
            label="Total Retailers"
            value={summary.total}
            subtext="Mapped retailers"
            icon={<Store className="w-3.5 h-3.5" />}
            variant="primary"
            isDominant
          />

          <FinancialMetricCard
            label="Active Retailers"
            value={summary.active}
            subtext="Approved & active status"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            variant="success"
            isDominant
          />

          <FinancialMetricCard
            label="Pending Approval"
            value={summary.pending}
            subtext="Awaiting Admin Approval"
            icon={<Clock className="w-3.5 h-3.5" />}
            variant="warning"
            isDominant
          />

          <FinancialMetricCard
            label="Inactive / Rejected"
            value={summary.inactive}
            subtext="Suspended or rejected"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            variant="neutral"
            isDominant
          />
        </div>

        {/* 2. Filter & Controls Bar */}
        <Card noPadding>
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, code, store name, email or mobile..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={selectedPlan}
                onChange={(e) => {
                  setSelectedPlan(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Plans', value: 'ALL' },
                  ...plans.map((p) => ({ label: p.name, value: p.id })),
                ]}
              />

              <Select
                value={selectedKyc}
                onChange={(e) => {
                  setSelectedKyc(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All KYC', value: 'ALL' },
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'UNDER_REVIEW', value: 'UNDER_REVIEW' },
                  { label: 'REJECTED', value: 'REJECTED' },
                ]}
              />

              <Select
                value={selectedApproval}
                onChange={(e) => {
                  setSelectedApproval(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Approvals', value: 'ALL' },
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING_APPROVAL', value: 'PENDING_APPROVAL' },
                  { label: 'REJECTED', value: 'REJECTED' },
                ]}
              />

              <Select
                value={selectedAccountStatus}
                onChange={(e) => {
                  setSelectedAccountStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                ]}
              />

              <Button variant="outline" size="sm" onClick={loadData} title="Refresh Data">
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              </Button>
            </div>
          </div>

          {/* 3. Main Data Table */}
          {isLoading ? (
            <div className="p-5">
              <LoadingSkeleton variant="table" count={5} />
            </div>
          ) : filteredRetailers.length === 0 ? (
            <EmptyState
              title="No Retailers Found"
              description="No retailers matched your current search and filter criteria."
              icon={<Store className="w-8 h-8 text-slate-400" />}
              action={
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('');
                  setSelectedPlan('ALL');
                  setSelectedKyc('ALL');
                  setSelectedApproval('ALL');
                  setSelectedAccountStatus('ALL');
                }}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  data={paginatedRetailers}
                  columns={columns}
                  keyExtractor={(r: Retailer) => r.id}
                  renderActions={(r: Retailer) => {
                    const isApproved = r.approvalStatus === 'APPROVED' || !r.approvalStatus;
                    const isActive = r.accountStatus === 'ACTIVE';

                    return (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailDrawer(r)}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(r)}
                          title="Edit Retailer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>

                        {isApproved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToggleTarget(r)}
                            title={isActive ? 'Deactivate Retailer' : 'Reactivate Retailer'}
                          >
                            <Power className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-emerald-600'}`} />
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium px-1 italic">
                            {r.approvalStatus === 'PENDING_APPROVAL' ? 'Pending Admin' : 'Rejected'}
                          </span>
                        )}
                      </div>
                    );
                  }}
                />
              </div>

              <div className="p-4 border-t border-slate-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredRetailers.length}
                  pageSize={pageSize}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Add / Edit Form Modal */}
      <DistributorRetailerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedRetailer}
        mode={formMode}
        onCreated={loadData}
        distributorId={distributorId}
      />

      {/* Retailer Detail Drawer */}
      <DistributorRetailerDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        retailer={selectedRetailer}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!toggleTarget}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleTarget(null)}
        title={`${toggleTarget?.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Reactivate'} Retailer?`}
        message={
          toggleTarget?.accountStatus === 'ACTIVE'
            ? 'This retailer will no longer be able to access the account. Existing transactions, wallet records and commission history will remain unchanged.'
            : 'Reactivating this retailer will restore login access and transaction capability.'
        }
        confirmText={toggleTarget?.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
        variant={toggleTarget?.accountStatus === 'ACTIVE' ? 'danger' : 'info'}
        isLoading={isToggling}
      />
    </PageContainer>
  );
}
