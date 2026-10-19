'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import {
  commissionService,
  MasterDistributorCommissionRecord,
  ScopedCommissionSummary,
  CommissionFilters,
} from '@/services/commissionService';
import { reportService } from '@/services/reportService';
import { CommissionDetailDrawer } from '@/components/features/master-distributor/CommissionDetailDrawer';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Button,
  SearchInput,
  Select,
  Pagination,
  Table,
  StatusBadge,
  Tooltip,
  useToast,
  DateRangeDropdown,
} from '@/components/ui';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Percent,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  RefreshCw,
  Eye,
  Store,
} from 'lucide-react';

export default function DistributorCommissionsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const distributorId = session?.entityId || 'dst_001';

  // State Management
  const [commissions, setCommissions] = useState<MasterDistributorCommissionRecord[]>([]);
  const [summary, setSummary] = useState<ScopedCommissionSummary>({
    todayCommission: 0,
    yesterdayCommission: 0,
    thisMonthCommission: 0,
    previousMonthCommission: 0,
    pendingCommission: 0,
    creditedCommission: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<any>({ preset: '7d' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Detail Drawer
  const [selectedCommission, setSelectedCommission] = useState<MasterDistributorCommissionRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const filters: CommissionFilters = {
        searchQuery: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const res = await commissionService.getCommissionsForDistributor(
        distributorId,
        filters,
        1,
        100
      );

      if (res.success && res.data) {
        setCommissions(res.data.items);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load Distributor commission data:', err);
      toastError('Failed to load commission records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, distributorId, statusFilter, searchQuery]);

  // Paginated dataset
  const paginatedCommissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return commissions.slice(start, start + pageSize);
  }, [commissions, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have authorization to view commission records for this Distributor account." />
    );
  }

  const handleExportCsv = () => {
    if (commissions.length === 0) {
      toastError('No commission records available to export');
      return;
    }
    const exportRows = commissions.map((c) => ({
      'Transaction ID': c.transactionRef,
      Retailer: c.retailerName,
      'Service Type': c.serviceType,
      'Txn Amount': c.transactionAmount,
      'Distributor Rate': c.mdCommissionRate,
      'Distributor Commission Amount': c.mdCommissionAmount,
      Status: c.status,
      'Credited Date': c.creditedDate || c.createdDate,
    }));
    reportService.exportToCsv('Distributor_Commission_Report', exportRows);
  };

  const isFiltered = searchQuery || statusFilter !== 'ALL';

  const columns: ColumnDefinition<MasterDistributorCommissionRecord>[] = [
    {
      key: 'transactionRef',
      header: 'Transaction ID',
      render: (row) => (
        <div className="font-mono font-bold text-sky-600 text-xs">
          {row.transactionRef}
        </div>
      ),
    },
    {
      key: 'retailer',
      header: 'Retailer Name',
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
      header: 'Distributor Commission',
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
      header: 'Credited Date',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {formatDateTime(row.creditedDate || row.createdDate)}
        </span>
      ),
    },
  ];

  return (
    <PageContainer
      title="Distributor Earned Commissions"
      description="Monitor, audit, and track real-time distributor commission margins earned from retailer transactions"
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
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4 text-sky-600" />}
          >
            Export
          </Button>
        </div>
      }
    >

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Today's Commission
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              +{formatCurrency(summary.todayCommission)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Yesterday: {formatCurrency(summary.yesterdayCommission)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg border bg-sky-50 border-sky-100 text-sky-600">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              This Month's Earnings
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
              +{formatCurrency(summary.thisMonthCommission)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Last Month: {formatCurrency(summary.previousMonthCommission)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg border bg-emerald-50 border-emerald-100 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Credited
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatCurrency(summary.creditedCommission)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Auto-credited to wallet</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-blue-50 border-blue-100 text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Pending Settlement
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">
              {formatCurrency(summary.pendingCommission)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Clearing in next cycle</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-amber-50 border-amber-100 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Txn ID, Retailer Name..."
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'CREDITED', value: 'CREDITED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'REVERSED', value: 'REVERSED' },
                ]}
              />
            </div>

            <DateRangeDropdown
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              size="md"
            />

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setDateRange({ preset: '7d' });
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedCommissions}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No Commission Records Found"
            emptyDescription="No commission entries found for the selected period or search criteria."
            onRowClick={(row) => {
              setSelectedCommission(row);
              setDrawerOpen(true);
            }}
            renderActions={(row) => (
              <Tooltip content="View Commission Details">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCommission(row);
                    setDrawerOpen(true);
                  }}
                  className="p-1.5 h-8 w-8 text-slate-600 hover:text-[#2F6F5E] hover:bg-[#F3F7E9]"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          />
        </div>

        {/* Pagination */}
        {commissions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(commissions.length / pageSize)}
            totalItems={commissions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Commission Detail Drawer */}
      <CommissionDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        commission={selectedCommission}
      />
    </PageContainer>
  );
}
