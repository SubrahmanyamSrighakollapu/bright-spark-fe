'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import {
  approvalService,
  PendingApprovalItem,
  ApprovalSummary,
} from '@/services/approvalService';
import {
  ApprovalDetailDrawer,
  RejectionReasonModal,
} from '@/components/features/admin/network';
import {
  PageHeader,
  Button,
  SearchInput,
  Select,
  Pagination,
  Tabs,
  StatusBadge,
  Table,
  Tooltip,
  ConfirmationDialog,
  useToast,
} from '@/components/ui';
import { ColumnDefinition } from '@/types/common';
import { formatDate } from '@/utils/formatters';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Building2,
  Store,
  UserCheck,
  Network,
} from 'lucide-react';

export default function AdminApprovalsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated && session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DISTRIBUTOR' | 'RETAILER'>('ALL');

  const [approvalItems, setApprovalItems] = useState<PendingApprovalItem[]>([]);
  const [summary, setSummary] = useState<ApprovalSummary>({
    totalPending: 0,
    pendingDistributors: 0,
    pendingRetailers: 0,
    recentlyApproved: 0,
    recentlyRejected: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Drawer & Modals
  const [detailItem, setDetailItem] = useState<PendingApprovalItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const [approvingItem, setApprovingItem] = useState<PendingApprovalItem | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const [rejectingItem, setRejectingItem] = useState<PendingApprovalItem | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    try {
      const items = approvalService.getApprovalItems(activeTab, typeFilter);
      setApprovalItems(items);
      const sum = approvalService.getPendingApprovalsSummary();
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load approvals:', err);
      toastError('Failed to load approval center items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, activeTab, typeFilter]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return approvalItems.filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.businessName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.mobile.includes(query) ||
        (item.createdByUserId && item.createdByUserId.toLowerCase().includes(query))
      );
    });
  }, [approvalItems, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, typeFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have permission to access the Central Admin Approval Center." />
    );
  }

  // Action Handlers
  const handleOpenDetail = (item: PendingApprovalItem) => {
    setDetailItem(item);
    setDetailDrawerOpen(true);
  };

  const handlePromptApprove = (item: PendingApprovalItem) => {
    setApprovingItem(item);
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingItem) return;

    if (approvingItem.entityType === 'DISTRIBUTOR') {
      const res = await approvalService.approveDistributor(approvingItem.id, session?.userId || 'usr_admin_01');
      if (res.success && res.data) {
        toastSuccess(`Distributor "${res.data.code}" approved successfully! Login is now enabled.`);
        loadData();
      } else {
        toastError(res.error?.message || 'Failed to approve distributor.');
      }
    } else {
      const res = await approvalService.approveRetailer(approvingItem.id, session?.userId || 'usr_admin_01');
      if (res.success && res.data) {
        toastSuccess(`Retailer "${res.data.code}" approved successfully! Login is now enabled.`);
        loadData();
      } else {
        toastError(res.error?.message || 'Failed to approve retailer.');
      }
    }

    setApproveDialogOpen(false);
    setApprovingItem(null);
  };

  const handlePromptReject = (item: PendingApprovalItem) => {
    setRejectingItem(item);
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingItem) return;

    if (rejectingItem.entityType === 'DISTRIBUTOR') {
      const res = await approvalService.rejectDistributor(
        rejectingItem.id,
        reason,
        session?.userId || 'usr_admin_01'
      );
      if (res.success && res.data) {
        toastSuccess(`Distributor "${res.data.code}" application rejected.`);
        loadData();
      } else {
        toastError(res.error?.message || 'Failed to reject distributor.');
      }
    } else {
      const res = await approvalService.rejectRetailer(
        rejectingItem.id,
        reason,
        session?.userId || 'usr_admin_01'
      );
      if (res.success && res.data) {
        toastSuccess(`Retailer "${res.data.code}" application rejected.`);
        loadData();
      } else {
        toastError(res.error?.message || 'Failed to reject retailer.');
      }
    }

    setRejectingItem(null);
  };

  const tabItems = [
    { id: 'PENDING', label: 'Pending Approvals', badge: summary.totalPending },
    { id: 'APPROVED', label: 'Approved Applications', badge: summary.recentlyApproved },
    { id: 'REJECTED', label: 'Rejected Applications', badge: summary.recentlyRejected },
  ];

  const columns: ColumnDefinition<PendingApprovalItem>[] = [
    {
      key: 'entityType',
      header: 'Type',
      align: 'center',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full border ${
            row.entityType === 'DISTRIBUTOR'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {row.entityType === 'DISTRIBUTOR' ? (
            <Building2 className="w-3 h-3" />
          ) : (
            <Store className="w-3 h-3" />
          )}
          {row.entityType}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Applicant Details',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">{row.name}</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {row.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{row.businessName}</p>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent Network',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-slate-800 flex items-center gap-1">
            <Network className="w-3 h-3 text-indigo-600 shrink-0" />
            {row.entityType === 'RETAILER' && row.parentDistributorName
              ? row.parentDistributorName
              : row.parentMasterDistributorName}
          </p>
          <p className="text-slate-500 text-[11px]">
            MD: {row.parentMasterDistributorName} ({row.parentMasterDistributorCode})
          </p>
        </div>
      ),
    },
    {
      key: 'createdByRole',
      header: 'Submitted By',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-indigo-900">{row.createdByRole || 'MASTER_DISTRIBUTOR'}</span>
          <p className="font-mono text-[11px] text-slate-500">{row.createdByUserId || 'usr_md_01'}</p>
        </div>
      ),
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.kycStatus || 'APPROVED'} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Submitted Date',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(row.createdAt)}
        </span>
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
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Central Admin Approval Center"
        description="Review, evaluate, approve, or reject pending Distributor and Retailer onboarding applications submitted across the network"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Total Pending Requests
            </p>
            <h3 className="text-2xl font-extrabold text-amber-900 mt-1">
              {summary.totalPending}
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">Awaiting Admin decision</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Pending Distributors
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.pendingDistributors}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Middle tier applications</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Pending Retailers
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.pendingRetailers}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Retailer outlet requests</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Approved / Active
          </p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">
            {summary.recentlyApproved}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Eligible transacting entities</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        activeTab={activeTab}
        onChange={(tId) => setActiveTab(tId as 'PENDING' | 'APPROVED' | 'REJECTED')}
      />

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px] max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search name, code, business, email, creator user ID..."
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'DISTRIBUTOR' | 'RETAILER')}
              options={[
                { label: 'All Entity Types', value: 'ALL' },
                { label: 'Distributors Only', value: 'DISTRIBUTOR' },
                { label: 'Retailers Only', value: 'RETAILER' },
              ]}
            />
          </div>

          {(searchQuery || typeFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <Table
          columns={columns}
          data={paginatedItems}
          keyExtractor={(row) => `${row.entityType}_${row.id}`}
          isLoading={isLoading}
          emptyTitle="No Approval Items Found"
          emptyDescription={`There are no ${activeTab.toLowerCase()} onboarding applications matching your criteria.`}
          onRowClick={(row) => handleOpenDetail(row)}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Tooltip content="Review Details">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDetail(row)}
                  className="p-1.5 h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </Tooltip>

              {row.approvalStatus === 'PENDING_APPROVAL' && (
                <>
                  <Tooltip content="Approve Application">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePromptApprove(row)}
                      className="p-1.5 h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Reject Application">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePromptReject(row)}
                      className="p-1.5 h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          )}
        />

        {filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredItems.length / pageSize)}
            totalItems={filteredItems.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Review Drawer */}
      <ApprovalDetailDrawer
        item={detailItem}
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        onApprove={handlePromptApprove}
        onReject={handlePromptReject}
      />

      {/* Table Action Confirmation Dialog */}
      {approvingItem && (
        <ConfirmationDialog
          isOpen={approveDialogOpen}
          onCancel={() => setApproveDialogOpen(false)}
          onConfirm={handleConfirmApprove}
          title={`Approve ${approvingItem.entityType} "${approvingItem.code}"?`}
          message={`Are you sure you want to approve onboarding for ${approvingItem.name} (${approvingItem.businessName})? This will set approval status to APPROVED and activate account access.`}
          confirmText="Confirm Approval"
          variant="info"
        />
      )}

      {/* Rejection Reason Modal */}
      {rejectingItem && (
        <RejectionReasonModal
          isOpen={rejectionModalOpen}
          onClose={() => setRejectionModalOpen(false)}
          onConfirm={handleConfirmReject}
          entityName={rejectingItem.name}
          entityCode={rejectingItem.code}
          entityType={rejectingItem.entityType}
        />
      )}
    </div>
  );
}

