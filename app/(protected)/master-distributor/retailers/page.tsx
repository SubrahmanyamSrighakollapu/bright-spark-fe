'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { Retailer, Distributor, RetailerPlan } from '@/types/domain';
import {
  retailerService,
  CreateRetailerInput,
  UpdateRetailerInput,
  ScopedRetailerSummary,
} from '@/services/retailerService';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPlanService } from '@/services/retailerPlanService';
import {
  RetailerSummaryCards,
  RetailerTable,
  RetailerFormModal,
  RetailerDetailDrawer,
} from '@/components/features/master-distributor';
import {
  PageHeader,
  Button,
  SearchInput,
  Select,
  Pagination,
  ConfirmationDialog,
  useToast,
} from '@/components/ui';
import { Plus, RefreshCw, AlertTriangle, Filter } from 'lucide-react';

export default function MasterDistributorRetailersPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  // Access Guard: Master Distributor, Admin, Super Admin
  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'MASTER_DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const masterDistributorId = session?.entityId || 'md_001';

  // State Management
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [summary, setSummary] = useState<ScopedRetailerSummary>({
    totalRetailers: 0,
    activeRetailers: 0,
    pendingApprovalRetailers: 0,
    inactiveRetailers: 0,
  });
  const [eligibleDistributors, setEligibleDistributors] = useState<Distributor[]>([]);
  const [activePlans, setActivePlans] = useState<RetailerPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [distributorFilter, setDistributorFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('ALL');
  const [kycFilter, setKycFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals & Drawers
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRetailer, setDrawerRetailer] = useState<Retailer | null>(null);

  // Confirmation Dialog for Status Change
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetStatusRetailer, setTargetStatusRetailer] = useState<Retailer | null>(null);

  // Load Scoped Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await retailerService.getRetailersForMasterDistributor(masterDistributorId);
      if (res.success && res.data) {
        setRetailers(res.data);
      }
      const sum = await retailerService.getRetailerSummaryForMasterDistributor(masterDistributorId);
      setSummary(sum);

      const dstList = await retailerService.getEligibleDistributorsForRetailerCreation(masterDistributorId);
      setEligibleDistributors(dstList);

      const plansRes = await retailerPlanService.getActiveRetailerPlans();
      if (plansRes.success && plansRes.data) {
        setActivePlans(plansRes.data);
      }
    } catch (err) {
      console.error('Failed to load retailers list:', err);
      toastError('Failed to load retailers data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, masterDistributorId]);

  // Filtered & Searched Retailers
  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mobile.includes(searchQuery);

      // Distributor filter
      const matchesDistributor = distributorFilter === 'ALL' || r.distributorId === distributorFilter;

      // Plan filter
      const matchesPlan = planFilter === 'ALL' || r.planId === planFilter;

      // Approval filter
      const matchesApproval = approvalFilter === 'ALL' || (r.approvalStatus || 'APPROVED') === approvalFilter;

      // Account Status filter
      const matchesAccountStatus = accountStatusFilter === 'ALL' || r.accountStatus === accountStatusFilter;

      // KYC filter
      const matchesKyc = kycFilter === 'ALL' || (r.kycStatus || 'APPROVED') === kycFilter;

      return (
        matchesSearch &&
        matchesDistributor &&
        matchesPlan &&
        matchesApproval &&
        matchesAccountStatus &&
        matchesKyc
      );
    });
  }, [
    retailers,
    searchQuery,
    distributorFilter,
    planFilter,
    approvalFilter,
    accountStatusFilter,
    kycFilter,
  ]);

  // Paginated Retailers
  const paginatedRetailers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRetailers.slice(start, start + pageSize);
  }, [filteredRetailers, currentPage, pageSize]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    distributorFilter,
    planFilter,
    approvalFilter,
    accountStatusFilter,
    kycFilter,
  ]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView
        message="You do not have authorization to view retailer management for this Master Distributor account."
      />
    );
  }

  // Action Handlers
  const handleOpenCreate = () => {
    setSelectedRetailer(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleOpenView = (retailer: Retailer) => {
    setDrawerRetailer(retailer);
    setDrawerOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateRetailerInput | UpdateRetailerInput
  ): Promise<boolean> => {
    if (formMode === 'create') {
      const res = await retailerService.createRetailerForMasterDistributor(
        masterDistributorId,
        data as CreateRetailerInput,
        session?.userId || 'usr_md_01'
      );

      if (!res.success || !res.data) {
        toastError(res.error?.message || 'Failed to create retailer');
        return false;
      }

      toastSuccess(res.message || `Retailer "${res.data.code}" submitted successfully!`);
      loadData();
      return true;
    } else {
      if (!selectedRetailer) return false;
      const res = await retailerService.updateRetailerForMasterDistributor(
        masterDistributorId,
        selectedRetailer.id,
        data as UpdateRetailerInput
      );

      if (!res.success || !res.data) {
        toastError(res.error?.message || 'Failed to update retailer');
        return false;
      }

      toastSuccess(`Retailer "${res.data.code}" updated successfully!`);
      loadData();
      return true;
    }
  };

  const handlePromptStatusToggle = (retailer: Retailer) => {
    setTargetStatusRetailer(retailer);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!targetStatusRetailer) return;

    const res = await retailerService.toggleRetailerStatus(
      masterDistributorId,
      targetStatusRetailer.id
    );

    if (res.success && res.data) {
      toastSuccess(
        `Retailer "${res.data.code}" status updated to ${res.data.accountStatus}`
      );
      loadData();
      if (drawerRetailer?.id === targetStatusRetailer.id) {
        setDrawerRetailer(res.data);
      }
    } else {
      toastError(res.error?.message || 'Failed to update status');
    }

    setConfirmDialogOpen(false);
    setTargetStatusRetailer(null);
  };

  const isFiltered =
    searchQuery ||
    distributorFilter !== 'ALL' ||
    planFilter !== 'ALL' ||
    approvalFilter !== 'ALL' ||
    accountStatusFilter !== 'ALL' ||
    kycFilter !== 'ALL';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Retailer Management"
        description="Monitor, create, configure, and inspect retail outlets operating under your distributor network"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Link href="/master-distributor/retailers/add"><Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add Retailer</Button></Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <RetailerSummaryCards summary={summary} isLoading={isLoading} />

      {/* Filter Bar & Search */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search retailer name, code, business, email, mobile..."
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-44">
              <Select
                value={distributorFilter}
                onChange={(e) => setDistributorFilter(e.target.value)}
                options={[
                  { label: 'All Distributors', value: 'ALL' },
                  ...eligibleDistributors.map((d) => ({
                    label: `${d.name} (${d.code})`,
                    value: d.id,
                  })),
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                options={[
                  { label: 'All Plans', value: 'ALL' },
                  ...activePlans.map((p) => ({
                    label: p.name,
                    value: p.id,
                  })),
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                options={[
                  { label: 'All Approvals', value: 'ALL' },
                  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
                  { label: 'Approved', value: 'APPROVED' },
                  { label: 'Rejected', value: 'REJECTED' },
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={accountStatusFilter}
                onChange={(e) => setAccountStatusFilter(e.target.value)}
                options={[
                  { label: 'All Account Status', value: 'ALL' },
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                ]}
              />
            </div>

            <div className="w-32">
              <Select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                options={[
                  { label: 'All KYC', value: 'ALL' },
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'UNDER_REVIEW', value: 'UNDER_REVIEW' },
                  { label: 'REJECTED', value: 'REJECTED' },
                ]}
              />
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setDistributorFilter('ALL');
                  setPlanFilter('ALL');
                  setApprovalFilter('ALL');
                  setAccountStatusFilter('ALL');
                  setKycFilter('ALL');
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <RetailerTable
          retailers={paginatedRetailers}
          isLoading={isLoading}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onToggleStatus={handlePromptStatusToggle}
        />

        {/* Pagination */}
        {filteredRetailers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRetailers.length / pageSize)}
            totalItems={filteredRetailers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <RetailerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedRetailer}
        mode={formMode}
        onCreated={loadData}
        masterDistributorId={masterDistributorId}
      />

      {/* Details Drawer */}
      <RetailerDetailDrawer
        retailer={drawerRetailer}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleOpenEdit}
        onToggleStatus={handlePromptStatusToggle}
      />

      {/* Confirmation Dialog for Account Status Toggle */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        title={
          targetStatusRetailer?.accountStatus === 'ACTIVE'
            ? `Deactivate Retailer "${targetStatusRetailer?.code}"?`
            : `Activate Retailer "${targetStatusRetailer?.code}"?`
        }
        message={
          targetStatusRetailer?.accountStatus === 'ACTIVE'
            ? `Are you sure you want to deactivate ${targetStatusRetailer?.name} (${targetStatusRetailer?.businessName})? This outlet will not be able to process Pay-In or Pay-Out transactions while inactive.`
            : `Are you sure you want to reactivate ${targetStatusRetailer?.name}? The outlet will resume standard transaction processing.`
        }
        confirmText={
          targetStatusRetailer?.accountStatus === 'ACTIVE'
            ? 'Deactivate Retailer'
            : 'Activate Retailer'
        }
        variant={targetStatusRetailer?.accountStatus === 'ACTIVE' ? 'danger' : 'info'}
      />
    </div>
  );
}
