'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { reportService, ReportListResult } from '@/services/reportService';
import { TransactionReportRecord, TransactionReportSummary, ReportFilters, ReportDateRange, PaginationState } from '@/types/domain';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ReportDateRangePicker } from '@/components/features/reports/ReportDateRangePicker';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { TransactionReportDrawer } from '@/components/features/reports/TransactionReportDrawer';
import { AdminReportNav } from '@/components/features/reports/AdminReportNav';
import { Search, Filter, RotateCcw, Eye, Activity } from 'lucide-react';
import { useToast } from '@/components/ui';

export default function TransactionReportPage() {
  const [activeMode, setActiveMode] = useState<'ALL' | 'LIVE' | 'UNSETTLED' | 'ORDERS'>('ALL');
  const [dateRange, setDateRange] = useState<ReportDateRange>({ preset: 'THIS_MONTH' });
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<'ALL' | 'PAY_IN' | 'PAY_OUT'>('ALL');
  const [status, setStatus] = useState('ALL');

  const [data, setData] = useState<ReportListResult<TransactionReportRecord, TransactionReportSummary> | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  // Detail Drawer
  const detailsDrawer = useModal<TransactionReportRecord>();

  const loadReport = () => {
    setIsLoading(true);
    const filters: ReportFilters = {
      dateRange,
      searchQuery,
      transactionType,
      status,
    };
    reportService.getTransactionReport(filters, activeMode, pagination.page, pagination.pageSize).then((res) => {
      if (res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    const filters: ReportFilters = {
      dateRange,
      searchQuery,
      transactionType,
      status,
    };
    reportService.getTransactionReport(filters, activeMode, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [activeMode, dateRange, searchQuery, transactionType, status, pagination.page, pagination.pageSize]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await reportService.exportTransactionsCsv({
        dateRange,
        searchQuery,
        transactionType,
        status,
        ...({ activeMode } as any),
      });
      toastSuccess('Transaction report exported successfully');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to export transaction report');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {
    totalTransactions: 0,
    totalAmount: 0,
    successfulCount: 0,
    successfulAmount: 0,
    failedCount: 0,
    failedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    successRate: 100,
  };

  // 20 Required Columns (Strict Order per client mandate)
  const columns: ColumnDefinition<TransactionReportRecord>[] = [
    {
      key: 'retailerName',
      header: 'Retailer Name',
      minWidth: '160px',
      render: (row) => <div className="font-semibold text-xs text-slate-900 whitespace-nowrap">{row.retailerName}</div>,
    },
    {
      key: 'retailerId',
      header: 'Retailer ID',
      minWidth: '120px',
      render: (row) => <span className="font-mono text-xs text-slate-600 font-semibold">{row.retailerId}</span>,
    },
    {
      key: 'mobileNumber',
      header: 'Mobile Number',
      minWidth: '130px',
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.mobileNumber}</span>,
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      minWidth: '160px',
      render: (row) => <span className="font-mono font-extrabold text-xs text-[var(--primary)]">{row.transactionId}</span>,
    },
    {
      key: 'apiReferenceId',
      header: 'API Reference ID',
      minWidth: '160px',
      render: (row) => (
        <Tooltip content={row.apiReferenceId}>
          <span className="font-mono text-xs text-slate-600 truncate max-w-[150px] block">{row.apiReferenceId}</span>
        </Tooltip>
      ),
    },
    {
      key: 'serviceType',
      header: 'Transaction / Service Type',
      minWidth: '170px',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 whitespace-nowrap">
          {row.serviceType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: '110px',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'responseMessage',
      header: 'Failure / Response Message',
      minWidth: '220px',
      render: (row) => (
        <Tooltip content={row.responseMessage}>
          <span className={`text-xs truncate max-w-[200px] block ${row.status === 'FAILED' ? 'text-rose-700 font-semibold' : 'text-slate-700'}`}>
            {row.responseMessage}
          </span>
        </Tooltip>
      ),
    },
    {
      key: 'requestedAt',
      header: 'Request Date & Time',
      minWidth: '160px',
      render: (row) => <span className="font-mono text-xs text-slate-700 whitespace-nowrap">{formatDate(row.requestedAt)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated Date & Time',
      minWidth: '160px',
      render: (row) => <span className="font-mono text-xs text-slate-700 whitespace-nowrap">{formatDate(row.updatedAt)}</span>,
    },
    {
      key: 'transactionAmount',
      header: 'Transaction Amount',
      minWidth: '140px',
      align: 'right',
      render: (row) => <span className="font-mono font-bold text-xs text-slate-900">{formatCurrency(row.transactionAmount)}</span>,
    },
    {
      key: 'transactionCharges',
      header: 'Transaction Charges',
      minWidth: '140px',
      align: 'right',
      render: (row) => <span className="font-mono text-xs text-slate-700">{formatCurrency(row.transactionCharges)}</span>,
    },
    {
      key: 'gstAmount',
      header: 'GST / Tax',
      minWidth: '110px',
      align: 'right',
      render: (row) => <span className="font-mono text-xs text-slate-700">{formatCurrency(row.gstAmount)}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      minWidth: '140px',
      align: 'right',
      render: (row) => <span className="font-mono font-extrabold text-xs text-purple-900">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      key: 'settlementStatus',
      header: 'Settlement Status',
      minWidth: '130px',
      align: 'center',
      render: (row) => <StatusBadge status={row.settlementStatus} size="sm" />,
    },
    {
      key: 'settlementDate',
      header: 'Settlement Date',
      minWidth: '160px',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 whitespace-nowrap">
          {row.settlementDate ? formatDate(row.settlementDate) : '-'}
        </span>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Payment Mode',
      minWidth: '120px',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
          {row.paymentMode}
        </span>
      ),
    },
    {
      key: 'rrnOrUtr',
      header: 'RRN / UTR Number',
      minWidth: '150px',
      render: (row) => <span className="font-mono text-xs text-slate-700 font-semibold">{row.rrnOrUtr || '-'}</span>,
    },
    {
      key: 'bankReferenceNumber',
      header: 'Bank Reference Number',
      minWidth: '160px',
      render: (row) => (
        <Tooltip content={row.bankReferenceNumber || '-'}>
          <span className="font-mono text-xs text-slate-700 truncate max-w-[140px] block">{row.bankReferenceNumber || '-'}</span>
        </Tooltip>
      ),
    },
    {
      key: 'remarks',
      header: 'Remarks',
      minWidth: '180px',
      render: (row) => (
        <Tooltip content={row.remarks || '-'}>
          <span className="text-xs text-slate-600 truncate max-w-[160px] block">{row.remarks || '-'}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <PageContainer
      title="Transaction Report"
      description="Analytical transaction volumes, success ratios, clearance pipeline, and exportable reports with 20 essential transaction fields."
      actions={
        <ReportExportMenu onExportCsv={handleExportCsv} reportTitle="Transaction Report" disabled={!data?.items?.length} isLoading={isExporting} />
      }
    >
      <div className="space-y-6">
        {/* Reports Navigation Bar */}
        <AdminReportNav />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Volume</span>
            <div className="mt-1 font-mono font-extrabold text-base text-slate-900">{formatCurrency(summary.totalAmount)}</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">{summary.totalTransactions} Transactions</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Successful Volume</span>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-700">{formatCurrency(summary.successfulAmount)}</div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">{summary.successfulCount} Successful</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Failed Volume</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-700">{formatCurrency(summary.failedAmount)}</div>
            <span className="text-[11px] text-rose-600 block mt-0.5">{summary.failedCount} Failed</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Pending / Processing</span>
            <div className="mt-1 font-mono font-extrabold text-base text-amber-700">{formatCurrency(summary.pendingAmount)}</div>
            <span className="text-[11px] text-amber-600 block mt-0.5">{summary.pendingCount} In Pipeline</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Success Ratio</span>
            <div className="mt-1 font-mono font-extrabold text-base text-purple-900">{summary.successRate}%</div>
            <span className="text-[11px] text-purple-600 block mt-0.5">Overall clearance</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Report Mode</span>
            <div className="mt-1 font-bold text-sm text-[var(--primary)]">{activeMode}</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active analytical view</span>
          </Card>
        </div>

        {/* Tab Sub-modes */}
        <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setActiveMode('ALL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'ALL'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Transactions Report
          </button>
          <button
            onClick={() => {
              setActiveMode('LIVE');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'LIVE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Live / Recent Window</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('UNSETTLED');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'UNSETTLED'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Unsettled Transactions
          </button>
          <button
            onClick={() => {
              setActiveMode('ORDERS');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'ORDERS'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Created Orders Report
          </button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadReport();
            }}
            className="space-y-4 text-xs"
          >
            <ReportDateRangePicker value={dateRange} onChange={(d) => setDateRange(d)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <Input
                label="Search Query"
                placeholder="Search Retailer, Txn ID, API Ref, UTR, Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />

              <Select
                label="Transaction Type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as 'ALL' | 'PAY_IN' | 'PAY_OUT')}
                options={[
                  { value: 'ALL', label: 'All Types' },
                  { value: 'PAY_IN', label: 'Pay-In' },
                  { value: 'PAY_OUT', label: 'Pay-Out' },
                ]}
              />

              <Select
                label="Transaction Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'SUCCESS', label: 'Success' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'PROCESSING', label: 'Processing' },
                  { value: 'REVERSED', label: 'Reversed' },
                ]}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">Filtered data dynamically calculates summary metrics.</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTransactionType('ALL');
                    setStatus('ALL');
                    setDateRange({ preset: 'THIS_MONTH' });
                    loadReport();
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isLoading} leftIcon={<Filter className="w-3.5 h-3.5" />}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Data Table with Horizontal Scrolling & Clear Column Widths */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
          <Table
            columns={columns}
            data={data?.items || []}
            keyExtractor={(row) => row.transactionId}
            isLoading={isLoading}
            renderActions={(row) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => detailsDrawer.open(row)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View
              </Button>
            )}
          />
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {/* Transaction Detail Drawer */}
        <TransactionReportDrawer
          isOpen={detailsDrawer.isOpen}
          onClose={detailsDrawer.close}
          record={detailsDrawer.data}
        />
      </div>
    </PageContainer>
  );
}
