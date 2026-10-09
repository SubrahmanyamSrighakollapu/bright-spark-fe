'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { Distributor, AccountStatus, KYCStatus } from '@/types/domain';
import {
  distributorService,
  CreateDistributorInput,
  UpdateDistributorInput,
  ScopedDistributorSummary,
} from '@/services/distributorService';
import { hierarchyService } from '@/services/hierarchyService';
import {
  DistributorSummaryCards,
  DistributorTable,
  DistributorFormModal,
  DistributorDetailDrawer,
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
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';

export default function MasterDistributorDistributorsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();

  // Access Guard: Master Distributor, Admin, Super Admin
  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'MASTER_DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const masterDistributorId = session?.entityId || 'md_001';

  // State Management
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [summary, setSummary] = useState<ScopedDistributorSummary>({
    totalDistributors: 0,
    activeDistributors: 0,
    pendingApprovalDistributors: 0,
    inactiveDistributors: 0,
    totalRetailers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kycFilter, setKycFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals & Drawers
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDistributor, setDrawerDistributor] = useState<Distributor | null>(null);

  // Confirmation Dialog for Status Change
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetStatusDistributor, setTargetStatusDistributor] = useState<Distributor | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await distributorService.getDistributorsForMasterDistributor(
        masterDistributorId
      );
      if (res.success && res.data) {
        setDistributors(res.data);
      }
      const sum = await distributorService.getDistributorSummary(masterDistributorId);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load distributors:', err);
      toastError('Failed to load distributors list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, masterDistributorId]);

  // Filtered & Searched Distributors
  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.mobile.includes(searchQuery);

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

      // KYC filter
      const matchesKyc = kycFilter === 'ALL' || (d.kycStatus || 'APPROVED') === kycFilter;

      return matchesSearch && matchesStatus && matchesKyc;
    });
  }, [distributors, searchQuery, statusFilter, kycFilter]);

  // Paginated Distributors
  const paginatedDistributors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDistributors.slice(start, start + pageSize);
  }, [filteredDistributors, currentPage, pageSize]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, kycFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView
        message="You do not have authorization to view distributor management for this Master Distributor account."
      />
    );
  }

  // Action Handlers
  const handleOpenCreate = () => {
    setSelectedDistributor(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleOpenView = (distributor: Distributor) => {
    setDrawerDistributor(distributor);
    setDrawerOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateDistributorInput | UpdateDistributorInput
  ): Promise<boolean> => {
    if (formMode === 'create') {
      const res = await distributorService.createDistributor(
        masterDistributorId,
        data as CreateDistributorInput,
        session?.userId || 'usr_md_01'
      );

      if (!res.success || !res.data) {
        toastError(res.error?.message || 'Failed to create distributor');
        return false;
      }

      toastSuccess(res.message || `Distributor "${res.data.code}" submitted successfully!`);
      loadData();
      return true;
    } else {
      if (!selectedDistributor) return false;
      const res = await distributorService.updateDistributor(
        masterDistributorId,
        selectedDistributor.id,
        data as UpdateDistributorInput
      );

      if (!res.success || !res.data) {
        toastError(res.error?.message || 'Failed to update distributor');
        return false;
      }

      toastSuccess(`Distributor "${res.data.code}" updated successfully!`);
      loadData();
      return true;
    }
  };

  const handlePromptStatusToggle = (distributor: Distributor) => {
    setTargetStatusDistributor(distributor);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!targetStatusDistributor) return;

    const res = await distributorService.toggleDistributorStatus(
      masterDistributorId,
      targetStatusDistributor.id
    );

    if (res.success && res.data) {
      toastSuccess(
        `Distributor "${res.data.code}" status changed to ${res.data.status}`
      );
      loadData();
      // Update drawer if open
      if (drawerDistributor?.id === targetStatusDistributor.id) {
        setDrawerDistributor(res.data);
      }
    } else {
      toastError(res.error?.message || 'Failed to update status');
    }

    setConfirmDialogOpen(false);
    setTargetStatusDistributor(null);
  };

  // Warning metrics for active retailers under target distributor
  const targetLinkedRetailers = targetStatusDistributor
    ? hierarchyService.getDistributorRetailers(targetStatusDistributor.id)
    : [];
  const targetActiveRetailersCount = targetLinkedRetailers.filter(
    (r) => r.accountStatus === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Distributor Management"
        description="Manage, create, monitor, and configure distributors assigned under your Master Distributor account"
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
            <Link href="/master-distributor/distributors/add"><Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add Distributor</Button></Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <DistributorSummaryCards summary={summary} isLoading={isLoading} />

      {/* Filter Bar & Search */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search distributor name, code, business, email, mobile..."
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                  { label: 'SUSPENDED', value: 'SUSPENDED' },
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                options={[
                  { label: 'All KYC', value: 'ALL' },
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'REJECTED', value: 'REJECTED' },
                  { label: 'EXPIRED', value: 'EXPIRED' },
                ]}
              />
            </div>

            {(searchQuery || statusFilter !== 'ALL' || kycFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setKycFilter('ALL');
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <DistributorTable
          distributors={paginatedDistributors}
          isLoading={isLoading}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onToggleStatus={handlePromptStatusToggle}
        />

        {/* Pagination */}
        {filteredDistributors.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredDistributors.length / pageSize)}
            totalItems={filteredDistributors.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <DistributorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedDistributor}
        mode={formMode}
        onCreated={loadData}
      />

      {/* Details Drawer */}
      <DistributorDetailDrawer
        distributor={drawerDistributor}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleOpenEdit}
        onToggleStatus={handlePromptStatusToggle}
      />

      {/* Confirmation Dialog for Status Change */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        title={
          targetStatusDistributor?.status === 'ACTIVE'
            ? `Deactivate Distributor "${targetStatusDistributor?.code}"?`
            : `Activate Distributor "${targetStatusDistributor?.code}"?`
        }
        message={
          targetStatusDistributor?.status === 'ACTIVE' ? (
            <div className="space-y-3">
              <p>
                Are you sure you want to deactivate{' '}
                <strong>{targetStatusDistributor?.name}</strong> (
                {targetStatusDistributor?.businessName})?
              </p>
              {targetActiveRetailersCount > 0 && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Retailer Network Warning:</strong>
                    <p className="mt-0.5">
                      This distributor manages{' '}
                      <strong>{targetActiveRetailersCount} active Retailer outlet(s)</strong>.
                      Deactivating them will prevent their assigned retailers from initiating
                      transactions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            `Are you sure you want to reactivate ${targetStatusDistributor?.name}? Their assigned retailers will resume transacting.`
          )
        }
        confirmText={
          targetStatusDistributor?.status === 'ACTIVE'
            ? 'Deactivate Distributor'
            : 'Activate Distributor'
        }
        variant={targetStatusDistributor?.status === 'ACTIVE' ? 'danger' : 'info'}
      />
    </div>
  );
}
