'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { MasterDistributor, AccountStatus } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { MasterDistributorFormModal, MasterDistributorDetailDrawer } from '@/components/features/admin/network';
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
import { Plus, RefreshCw, Building2, Store, Users, Edit, Power, Eye } from 'lucide-react';

export default function AdminMasterDistributorsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated && session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const [mds, setMds] = useState<MasterDistributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedMd, setSelectedMd] = useState<MasterDistributor | null>(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMd, setDrawerMd] = useState<MasterDistributor | null>(null);

  // Status Dialog State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetMd, setTargetMd] = useState<MasterDistributor | null>(null);

  const loadData = () => {
    setIsLoading(true);
    try {
      const data = hierarchyService.getAllMasterDistributors();
      setMds(data);
    } catch (err) {
      console.error('Failed to load Master Distributors:', err);
      toastError('Failed to load Master Distributors list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  // Filtered List
  const filteredMds = useMemo(() => {
    return mds.filter((md) => {
      const matchesSearch =
        !searchQuery ||
        md.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        md.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        md.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        md.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        md.mobile.includes(searchQuery);

      const matchesStatus = statusFilter === 'ALL' || md.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [mds, searchQuery, statusFilter]);

  const paginatedMds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMds.slice(start, start + pageSize);
  }, [filteredMds, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have permission to access Admin Network Master Distributor Management." />
    );
  }

  const handleOpenDetail = (md: MasterDistributor) => {
    setDrawerMd(md);
    setDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedMd(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (md: MasterDistributor) => {
    setSelectedMd(md);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<MasterDistributor>): Promise<boolean> => {
    if (formMode === 'create') {
      const newMd: MasterDistributor = {
        id: `md_${Date.now().toString(36)}`,
        code: data.code || `MD${Date.now().toString().slice(-3)}`,
        userId: `usr_md_${Date.now().toString(36)}`,
        name: data.name || '',
        businessName: data.businessName || '',
        email: data.email || '',
        mobile: data.mobile || '',
        status: 'ACTIVE',
        walletId: `wlt_md_${Date.now().toString(36)}`,
        commissionConfig: data.commissionConfig || { payinRate: 0.1, payoutRate: 1.0 },
        createdAt: new Date().toISOString(),
      };

      hierarchyService.addMasterDistributorRecord(newMd);
      toastSuccess(`Master Distributor "${newMd.code}" created directly as ACTIVE!`);
      loadData();
      return true;
    } else {
      if (!selectedMd) return false;
      const updated = hierarchyService.updateMasterDistributorRecord(selectedMd.id, data);
      if (updated) {
        toastSuccess(`Master Distributor "${updated.code}" updated successfully!`);
        loadData();
        return true;
      }
      toastError('Failed to update Master Distributor.');
      return false;
    }
  };

  const handlePromptStatusToggle = (md: MasterDistributor) => {
    setTargetMd(md);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!targetMd) return;
    const newStatus: AccountStatus = targetMd.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = hierarchyService.updateMasterDistributorRecord(targetMd.id, {
      status: newStatus,
    });
    if (updated) {
      toastSuccess(`Master Distributor "${updated.code}" is now ${updated.status}`);
      loadData();
    } else {
      toastError('Failed to update status.');
    }
    setConfirmDialogOpen(false);
    setTargetMd(null);
  };

  // Table Columns
  const columns: ColumnDefinition<MasterDistributor>[] = [
    {
      key: 'name',
      header: 'Master Distributor',
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{row.name}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-[#D4E1AE]">
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
      key: 'distributors',
      header: 'Sub-Distributors',
      align: 'center',
      render: (row) => {
        const count = hierarchyService.getMasterDistributorDistributors(row.id).length;
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>{count} Distributors</span>
          </div>
        );
      },
    },
    {
      key: 'retailers',
      header: 'Managed Retailers',
      align: 'center',
      render: (row) => {
        const count = hierarchyService.getMasterDistributorRetailers(row.id).length;
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>{count} Retailers</span>
          </div>
        );
      },
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
        title="Master Distributor Management"
        description="Platform-wide Master Distributor accounts management, network monitoring, and status controls"
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
              Add Master Distributor
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Master Distributors
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{mds.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Platform-wide top tier</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Active Accounts
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {mds.filter((m) => m.status === 'ACTIVE').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Operational networks</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Inactive / Suspended
          </p>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {mds.filter((m) => m.status !== 'ACTIVE').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Blocked networks</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px] max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search by MD code, name, business, email, mobile..."
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-44">
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

          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Table
          columns={columns}
          data={paginatedMds}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No Master Distributors Found"
          emptyDescription="There are no Master Distributors matching your criteria."
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

        {filteredMds.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredMds.length / pageSize)}
            totalItems={filteredMds.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <MasterDistributorDetailDrawer
        md={drawerMd}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Form Modal */}
      <MasterDistributorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedMd}
        mode={formMode}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        title={
          targetMd?.status === 'ACTIVE'
            ? `Deactivate Master Distributor "${targetMd?.code}"?`
            : `Activate Master Distributor "${targetMd?.code}"?`
        }
        message={`Are you sure you want to change status for ${targetMd?.name}?`}
        confirmText={targetMd?.status === 'ACTIVE' ? 'Deactivate MD' : 'Activate MD'}
        variant={targetMd?.status === 'ACTIVE' ? 'danger' : 'info'}
      />
    </div>
  );
}

