'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { Distributor, AccountStatus, KYCStatus, ApprovalStatus } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { distributorService, CreateDistributorInput, UpdateDistributorInput } from '@/services/distributorService';
import { AdminDistributorFormModal, AdminDistributorDetailDrawer } from '@/components/features/admin/network';
import {
  PageHeader,
  Button,
  SearchInput,
  Select,
  Pagination,
  ConfirmationDialog,
  StatusBadge,
  Table,
  useToast,
} from '@/components/ui';
import { ColumnDefinition } from '@/types/common';
import { formatDate } from '@/utils/formatters';
import { Plus, RefreshCw, Building2, Eye, Edit, Power, Store, UserCheck } from 'lucide-react';

export default function AdminDistributorsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated && session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentMd, setSelectedParentMd] = useState<string>('ALL');
  const [creatorRoleFilter, setCreatorRoleFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals & Drawers
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDistributor, setDrawerDistributor] = useState<Distributor | null>(null);

  // Status Dialog State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetDistributor, setTargetDistributor] = useState<Distributor | null>(null);

  const loadData = () => {
    setIsLoading(true);
    try {
      const data = hierarchyService.getAllDistributors();
      setDistributors(data);
    } catch (err) {
      console.error('Failed to load Distributors:', err);
      toastError('Failed to load Distributors list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const masterDistributors = hierarchyService.getAllMasterDistributors();

  // Filtered Distributors
  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.mobile.includes(searchQuery);

      const matchesParent = selectedParentMd === 'ALL' || d.masterDistributorId === selectedParentMd;
      const matchesCreator = creatorRoleFilter === 'ALL' || d.createdByRole === creatorRoleFilter;
      const matchesApproval = approvalFilter === 'ALL' || (d.approvalStatus || 'APPROVED') === approvalFilter;
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchesSearch && matchesParent && matchesCreator && matchesApproval && matchesStatus;
    });
  }, [distributors, searchQuery, selectedParentMd, creatorRoleFilter, approvalFilter, statusFilter]);

  const paginatedDistributors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDistributors.slice(start, start + pageSize);
  }, [filteredDistributors, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedParentMd, creatorRoleFilter, approvalFilter, statusFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have permission to access Admin Network Distributor Management." />
    );
  }

  const handleOpenDetail = (d: Distributor) => {
    setDrawerDistributor(d);
    setDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedDistributor(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (d: Distributor) => {
    setSelectedDistributor(d);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (
    parentMdId: string,
    data: CreateDistributorInput | UpdateDistributorInput
  ): Promise<boolean> => {
    if (formMode === 'create') {
      const res = await distributorService.createDistributor(
        parentMdId,
        data as CreateDistributorInput,
        session?.userId || 'usr_admin_01',
        'ADMIN'
      );

      if (!res.success || !res.data) {
        toastError(res.error?.message || 'Failed to create distributor.');
        return false;
      }

      toastSuccess(`Distributor "${res.data.code}" created directly as APPROVED + ACTIVE!`);
      loadData();
      return true;
    } else {
      if (!selectedDistributor) return false;
      const res = await distributorService.updateDistributor(
        selectedDistributor.masterDistributorId,
        selectedDistributor.id,
        data as UpdateDistributorInput
      );

      if (!res.success || !res.data) {
        toastError(res.error?.message || 'Failed to update distributor.');
        return false;
      }

      toastSuccess(`Distributor "${res.data.code}" updated successfully!`);
      loadData();
      return true;
    }
  };

  const handlePromptStatusToggle = (d: Distributor) => {
    setTargetDistributor(d);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!targetDistributor) return;

    const res = await distributorService.toggleDistributorStatus(
      targetDistributor.masterDistributorId,
      targetDistributor.id
    );

    if (res.success && res.data) {
      toastSuccess(`Distributor "${res.data.code}" is now ${res.data.status}`);
      loadData();
    } else {
      toastError(res.error?.message || 'Failed to update status');
    }

    setConfirmDialogOpen(false);
    setTargetDistributor(null);
  };

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
      key: 'masterDistributorId',
      header: 'Parent MD',
      render: (row) => {
        const md = hierarchyService.getMasterDistributorById(row.masterDistributorId);
        return (
          <div className="text-xs">
            <span className="font-semibold text-indigo-900">{md?.name || 'N/A'}</span>
            <p className="font-mono text-[11px] text-slate-500">{row.masterDistributorId}</p>
          </div>
        );
      },
    },
    {
      key: 'createdByRole',
      header: 'Created By',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.createdByRole || 'MASTER_DISTRIBUTOR'}</span>
          <p className="font-mono text-[11px] text-slate-500">{row.createdByUserId || 'usr_md_01'}</p>
        </div>
      ),
    },
    {
      key: 'retailers',
      header: 'Managed Outlets',
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
      key: 'approvalStatus',
      header: 'Approval Status',
      align: 'center',
      render: (row) => (
        <StatusBadge
          status={row.approvalStatus || 'APPROVED'}
          size="sm"
          label={
            row.approvalStatus === 'PENDING_APPROVAL'
              ? 'Pending Approval'
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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Distributor Management (Platform-Wide)"
        description="View all distributors across all Master Distributors, create admin distributors, and monitor network approval states"
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
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Distributor
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Distributors</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{distributors.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Approved & Active</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {distributors.filter((d) => (d.approvalStatus || 'APPROVED') === 'APPROVED' && d.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Admin Approval</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {distributors.filter((d) => d.approvalStatus === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Rejected Applications</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {distributors.filter((d) => d.approvalStatus === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
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
            <div className="w-44">
              <Select
                value={selectedParentMd}
                onChange={(e) => setSelectedParentMd(e.target.value)}
                options={[
                  { label: 'All Master Distributors', value: 'ALL' },
                  ...masterDistributors.map((md) => ({
                    label: `${md.name} (${md.code})`,
                    value: md.id,
                  })),
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                options={[
                  { label: 'All Approvals', value: 'ALL' },
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING_APPROVAL', value: 'PENDING_APPROVAL' },
                  { label: 'REJECTED', value: 'REJECTED' },
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                ]}
              />
            </div>

            {(searchQuery || selectedParentMd !== 'ALL' || approvalFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedParentMd('ALL');
                  setApprovalFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Table
          columns={columns}
          data={paginatedDistributors}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No Distributors Found"
          emptyDescription="There are no distributors matching your query."
          onRowClick={(row) => handleOpenDetail(row)}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDetail(row)}
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={row.approvalStatus === 'PENDING_APPROVAL' || row.approvalStatus === 'REJECTED'}
                onClick={() => handlePromptStatusToggle(row)}
                className={`p-1.5 h-8 w-8 ${
                  row.status === 'ACTIVE'
                    ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Power className="w-4 h-4" />
              </Button>
            </div>
          )}
        />

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

      {/* Detail Drawer */}
      <AdminDistributorDetailDrawer
        distributor={drawerDistributor}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Modal */}
      <AdminDistributorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedDistributor}
        mode={formMode}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        title={
          targetDistributor?.status === 'ACTIVE'
            ? `Deactivate Distributor "${targetDistributor?.code}"?`
            : `Activate Distributor "${targetDistributor?.code}"?`
        }
        message={`Are you sure you want to change status for ${targetDistributor?.name}?`}
        confirmText={targetDistributor?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={targetDistributor?.status === 'ACTIVE' ? 'danger' : 'info'}
      />
    </div>
  );
}

