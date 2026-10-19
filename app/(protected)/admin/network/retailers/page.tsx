'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { Retailer, AccountStatus, KYCStatus, ApprovalStatus, RetailerPlan } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { AdminRetailerFormModal, AdminRetailerDetailDrawer, CreateAdminRetailerInput } from '@/components/features/admin/network';
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
import { Plus, RefreshCw, Store, Eye, Edit, Power, Percent, Network } from 'lucide-react';

export default function AdminRetailersPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated && session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [plans, setPlans] = useState<RetailerPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentMd, setSelectedParentMd] = useState<string>('ALL');
  const [selectedParentDst, setSelectedParentDst] = useState<string>('ALL');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal & Drawer State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRetailer, setDrawerRetailer] = useState<Retailer | null>(null);

  // Status Dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetRetailer, setTargetRetailer] = useState<Retailer | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = hierarchyService.getAllRetailers();
      setRetailers(data);
      const resPlans = await retailerPlanService.getPlans();
      if (resPlans.success && resPlans.data) {
        setPlans(resPlans.data);
      }
    } catch (err) {
      console.error('Failed to load Retailers:', err);
      toastError('Failed to load Retailers list');
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

  // Filtered Retailers
  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mobile.includes(searchQuery);

      const matchesMd = selectedParentMd === 'ALL' || r.masterDistributorId === selectedParentMd;
      const matchesDst = selectedParentDst === 'ALL' || r.distributorId === selectedParentDst;
      const matchesPlan = selectedPlanFilter === 'ALL' || r.planId === selectedPlanFilter;
      const matchesApproval = approvalFilter === 'ALL' || r.approvalStatus === approvalFilter;
      const matchesStatus = statusFilter === 'ALL' || r.accountStatus === statusFilter;

      return matchesSearch && matchesMd && matchesDst && matchesPlan && matchesApproval && matchesStatus;
    });
  }, [retailers, searchQuery, selectedParentMd, selectedParentDst, selectedPlanFilter, approvalFilter, statusFilter]);

  const paginatedRetailers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRetailers.slice(start, start + pageSize);
  }, [filteredRetailers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedParentMd, selectedParentDst, selectedPlanFilter, approvalFilter, statusFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have permission to access Admin Network Retailer Management." />
    );
  }

  const handleOpenDetail = (r: Retailer) => {
    setDrawerRetailer(r);
    setDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedRetailer(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (r: Retailer) => {
    setSelectedRetailer(r);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateAdminRetailerInput): Promise<boolean> => {
    if (formMode === 'create') {
      const newRetailer: Retailer = {
        id: `ret_${Date.now().toString(36)}`,
        code: `RET${Date.now().toString().slice(-3)}`,
        masterDistributorId: data.masterDistributorId,
        distributorId: data.distributorId,
        userId: `usr_ret_${Date.now().toString(36)}`,
        planId: data.planId,
        name: data.name,
        businessName: data.businessName,
        email: data.email,
        mobile: data.mobile,
        kycStatus: data.kycStatus || 'APPROVED',
        approvalStatus: 'APPROVED',
        accountStatus: 'ACTIVE',
        walletId: `wlt_ret_${Date.now().toString(36)}`,
        createdByUserId: session?.userId || 'usr_admin_01',
        createdByRole: 'ADMIN',
        createdByEntityId: 'admin',
        createdAt: new Date().toISOString(),
      };

      hierarchyService.addRetailerRecord(newRetailer);
      toastSuccess(`Retailer "${newRetailer.code}" created directly as APPROVED + ACTIVE!`);
      loadData();
      return true;
    } else {
      if (!selectedRetailer) return false;
      const updated = hierarchyService.updateRetailerRecord(selectedRetailer.id, {
        name: data.name,
        businessName: data.businessName,
        email: data.email,
        mobile: data.mobile,
        planId: data.planId,
        kycStatus: data.kycStatus,
        accountStatus: data.accountStatus,
        updatedAt: new Date().toISOString(),
      });

      if (updated) {
        toastSuccess(`Retailer "${updated.code}" updated successfully!`);
        loadData();
        return true;
      }
      toastError('Failed to update retailer.');
      return false;
    }
  };

  const handlePromptStatusToggle = (r: Retailer) => {
    setTargetRetailer(r);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!targetRetailer) return;
    const newStatus: AccountStatus = targetRetailer.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = hierarchyService.updateRetailerRecord(targetRetailer.id, {
      accountStatus: newStatus,
    });
    if (updated) {
      toastSuccess(`Retailer "${updated.code}" status changed to ${updated.accountStatus}`);
      loadData();
    } else {
      toastError('Failed to update status.');
    }
    setConfirmDialogOpen(false);
    setTargetRetailer(null);
  };

  const columns: ColumnDefinition<Retailer>[] = [
    {
      key: 'name',
      header: 'Retailer Details',
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 shrink-0 mt-0.5">
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{row.name}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                {row.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{row.businessName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'hierarchy',
      header: 'Parent Network',
      render: (row) => {
        const md = hierarchyService.getMasterDistributorById(row.masterDistributorId);
        const dst = hierarchyService.getDistributorById(row.distributorId);
        return (
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Network className="w-3 h-3 text-indigo-600 shrink-0" />
              {dst?.name || 'N/A'}
            </p>
            <p className="text-slate-500 text-[11px]">MD: {md?.name || 'N/A'}</p>
          </div>
        );
      },
    },
    {
      key: 'planId',
      header: 'Assigned Plan',
      render: (row) => {
        const plan = plans.find((p) => p.id === row.planId);
        return (
          <div className="text-xs">
            <span className="font-semibold text-indigo-700 font-mono px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
              {plan?.code || row.planId}
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{plan?.name || 'Standard Plan'}</p>
          </div>
        );
      },
    },
    {
      key: 'createdByRole',
      header: 'Created By',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.createdByRole || 'DISTRIBUTOR'}</span>
          <p className="font-mono text-[11px] text-slate-500">{row.createdByUserId}</p>
        </div>
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Approval Status',
      align: 'center',
      render: (row) => (
        <StatusBadge
          status={row.approvalStatus}
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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Retailer Management (Platform-Wide)"
        description="View all retailer outlets across all distributor networks, assign retailer plans, create admin retailers, and manage approvals"
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
              Add Retailer
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Retailers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{retailers.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Approved & Active</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {retailers.filter((r) => r.approvalStatus === 'APPROVED' && r.accountStatus === 'ACTIVE').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Admin Approval</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {retailers.filter((r) => r.approvalStatus === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Rejected Applications</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {retailers.filter((r) => r.approvalStatus === 'REJECTED').length}
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
              placeholder="Search retailer name, code, store, email, mobile..."
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

            <div className="w-40">
              <Select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                options={[
                  { label: 'All Retailer Plans', value: 'ALL' },
                  ...plans.map((p) => ({
                    label: `${p.name} (${p.code})`,
                    value: p.id,
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

            {(searchQuery || selectedParentMd !== 'ALL' || selectedPlanFilter !== 'ALL' || approvalFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedParentMd('ALL');
                  setSelectedParentDst('ALL');
                  setSelectedPlanFilter('ALL');
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
          data={paginatedRetailers}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No Retailers Found"
          emptyDescription="There are no retailers matching your query."
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
                  row.accountStatus === 'ACTIVE'
                    ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Power className="w-4 h-4" />
              </Button>
            </div>
          )}
        />

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

      {/* Detail Drawer */}
      <AdminRetailerDetailDrawer
        retailer={drawerRetailer}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Modal */}
      <AdminRetailerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedRetailer}
        mode={formMode}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        title={
          targetRetailer?.accountStatus === 'ACTIVE'
            ? `Deactivate Retailer "${targetRetailer?.code}"?`
            : `Activate Retailer "${targetRetailer?.code}"?`
        }
        message={`Are you sure you want to change account status for ${targetRetailer?.name}?`}
        confirmText={targetRetailer?.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={targetRetailer?.accountStatus === 'ACTIVE' ? 'danger' : 'info'}
      />
    </div>
  );
}

