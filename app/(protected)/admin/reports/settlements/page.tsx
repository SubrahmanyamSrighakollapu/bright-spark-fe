'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { reportService, ReportListResult } from '@/services/reportService';
import { settlementService } from '@/services/settlementService';
import {
  Settlement,
  SettlementReconciliation,
  SettlementReportSummary,
  ReportFilters,
  ReportDateRange,
  PaginationState,
} from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ReportDateRangePicker } from '@/components/features/reports/ReportDateRangePicker';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { SettlementDetailsDrawer } from '@/components/features/settlements/SettlementDetailsDrawer';
import { ReconciliationDetailsModal } from '@/components/features/settlements/ReconciliationDetailsModal';
import { AdminReportNav } from '@/components/features/reports/AdminReportNav';
import { Search, Filter, RotateCcw, Eye, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui';

export default function SettlementReportPage() {
  const [activeTab, setActiveTab] = useState<'SETTLEMENTS' | 'RECONCILIATION'>('SETTLEMENTS');
  const [dateRange, setDateRange] = useState<ReportDateRange>({ preset: 'THIS_MONTH' });
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('ALL');

  const [data, setData] = useState<ReportListResult<Settlement, SettlementReportSummary> | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  // Reconciliation Mode State
  const [reconciliationItems, setReconciliationItems] = useState<SettlementReconciliation[]>([]);
  const [reconciliationPagination, setReconciliationPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const detailDrawer = useModal<Settlement>();
  const reconcileModal = useModal<SettlementReconciliation>();

  const loadReport = () => {
    setIsLoading(true);
    if (activeTab === 'SETTLEMENTS') {
      const filters: ReportFilters = { dateRange, searchQuery, status };
      reportService.getSettlementReport(filters, pagination.page, pagination.pageSize).then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          setPagination(res.data.pagination);
        }
        setIsLoading(false);
      });
    } else {
      settlementService
        .getReconciliationRecords({}, reconciliationPagination.page, reconciliationPagination.pageSize)
        .then((res) => {
          if (res.success && res.data) {
            setReconciliationItems(res.data.items);
            setReconciliationPagination(res.data.pagination);
          }
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (activeTab === 'SETTLEMENTS') {
      const filters: ReportFilters = { dateRange, searchQuery, status };
      reportService.getSettlementReport(filters, pagination.page, pagination.pageSize).then((res) => {
        if (!isCancelled && res.success && res.data) {
          setData(res.data);
          setPagination(res.data.pagination);
          setIsLoading(false);
        }
      });
    } else {
      settlementService
        .getReconciliationRecords({}, reconciliationPagination.page, reconciliationPagination.pageSize)
        .then((res) => {
          if (!isCancelled && res.success && res.data) {
            setReconciliationItems(res.data.items);
            setReconciliationPagination(res.data.pagination);
            setIsLoading(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [activeTab, dateRange, searchQuery, status, pagination.page, pagination.pageSize, reconciliationPagination.page, reconciliationPagination.pageSize]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      if (activeTab === 'SETTLEMENTS') {
        await reportService.exportSettlementsCsv({
          dateRange,
          searchQuery,
          status,
        });
        toastSuccess('Settlement report exported successfully');
      } else {
        const exportRows = reconciliationItems.map((r) => ({
          'Reconciliation ID': r.reconciliationId,
          'Settlement ID': r.settlementId,
          'Entity Name': r.entityName,
          'Internal Amount (INR)': r.internalAmount,
          'Provider Amount (INR)': r.providerAmount,
          'Difference (INR)': r.difference,
          'Reconciliation Status': r.reconciliationStatus,
          'UTR': r.utr || 'N/A',
          'Remarks': r.remarks || 'N/A',
        }));
        reportService.exportToCsv('Settlement_Reconciliation_Report', exportRows);
        toastSuccess('Reconciliation report exported successfully');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to export settlement report');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {
    totalSettlements: 0,
    pendingCount: 0,
    processingCount: 0,
    settledCount: 0,
    failedCount: 0,
    grossSettlementAmount: 0,
    netSettlementAmount: 0,
  };

  const settlementColumns = [
    {
      key: 'settlementId',
      header: 'Settlement ID / Mode',
      render: (row: Settlement) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.settlementId}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.settlementMode} • {row.settlementCycle}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Target Entity',
      render: (row: Settlement) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.entityName}</div>
          <div className="text-[11px] font-semibold text-purple-700">{row.entityType}</div>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Gross Amount',
      align: 'right' as const,
      render: (row: Settlement) => (
        <span className="font-mono font-semibold text-xs text-slate-700">{formatCurrency(row.grossAmount)}</span>
      ),
    },
    {
      key: 'netSettlementAmount',
      header: 'Net Settled',
      align: 'right' as const,
      render: (row: Settlement) => (
        <span className="font-mono font-extrabold text-xs text-emerald-700">{formatCurrency(row.netSettlementAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: Settlement) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'scheduledAt',
      header: 'Date & Provider',
      render: (row: Settlement) => (
        <div>
          <div className="text-xs text-slate-800 font-medium">{formatDate(row.settledAt || row.scheduledAt)}</div>
          <div className="text-[11px] font-mono text-slate-400">{row.provider}</div>
        </div>
      ),
    },
  ];

  const reconciliationColumns = [
    {
      key: 'reconciliationId',
      header: 'Rec ID / Settlement',
      render: (row: SettlementReconciliation) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.reconciliationId}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.settlementId}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Target Entity',
      render: (row: SettlementReconciliation) => (
        <span className="font-semibold text-xs text-slate-900">{row.entityName}</span>
      ),
    },
    {
      key: 'internalAmount',
      header: 'Internal Amount',
      align: 'right' as const,
      render: (row: SettlementReconciliation) => (
        <span className="font-mono font-semibold text-xs text-slate-700">{formatCurrency(row.internalAmount)}</span>
      ),
    },
    {
      key: 'providerAmount',
      header: 'Provider Amount',
      align: 'right' as const,
      render: (row: SettlementReconciliation) => (
        <span className="font-mono font-semibold text-xs text-slate-700">{formatCurrency(row.providerAmount)}</span>
      ),
    },
    {
      key: 'difference',
      header: 'Difference',
      align: 'right' as const,
      render: (row: SettlementReconciliation) => (
        <span className={`font-mono font-extrabold text-xs ${row.difference > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
          {row.difference > 0 ? `+${formatCurrency(row.difference)}` : '₹0.00'}
        </span>
      ),
    },
    {
      key: 'reconciliationStatus',
      header: 'Status',
      align: 'center' as const,
      render: (row: SettlementReconciliation) => <StatusBadge status={row.reconciliationStatus} size="sm" />,
    },
  ];

  return (
    <PageContainer
      title="Settlement Report"
      description="Analytical settlement clearance reports, gross-to-net summaries, and bank reconciliation auditing."
      actions={
        <ReportExportMenu
          onExportCsv={handleExportCsv}
          reportTitle={activeTab === 'SETTLEMENTS' ? 'Settlement Report' : 'Reconciliation Report'}
          isLoading={isExporting}
        />
      }
    >
      <div className="space-y-6">
        {/* Reports Navigation Bar */}
        <AdminReportNav />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Gross Settlement Volume</span>
            <div className="mt-1 font-mono font-extrabold text-base text-slate-900">{formatCurrency(summary.grossSettlementAmount)}</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">{summary.totalSettlements} Batches Total</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Net Settled Amount</span>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-700">{formatCurrency(summary.netSettlementAmount)}</div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">{summary.settledCount} Settled Successfully</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Pending / Processing</span>
            <div className="mt-1 font-mono font-extrabold text-base text-amber-700">{summary.pendingCount + summary.processingCount} Batches</div>
            <span className="text-[11px] text-amber-600 block mt-0.5">In clearance pipeline</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Failed Settlements</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-700">{summary.failedCount} Batches</div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Requires audit review</span>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('SETTLEMENTS');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'SETTLEMENTS'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settlement Summary Report
          </button>
          <button
            onClick={() => {
              setActiveTab('RECONCILIATION');
              setReconciliationPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'RECONCILIATION'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Bank Reconciliation Mode</span>
          </button>
        </div>

        {/* Filter Bar */}
        {activeTab === 'SETTLEMENTS' && (
          <Card className="p-4 bg-white border border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadReport();
              }}
              className="space-y-4 text-xs"
            >
              <ReportDateRangePicker value={dateRange} onChange={(d) => setDateRange(d)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <Input
                  label="Search Settlement"
                  placeholder="Search Settlement ID, Entity, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />

                <Select
                  label="Settlement Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'ELIGIBLE', label: 'Eligible' },
                    { value: 'QUEUED', label: 'Queued' },
                    { value: 'PROCESSING', label: 'Processing' },
                    { value: 'SETTLED', label: 'Settled' },
                    { value: 'FAILED', label: 'Failed' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Filtered data derived from centralized settlement engine.</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
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
        )}

        {/* Data Table */}
        {activeTab === 'SETTLEMENTS' ? (
          <>
            <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
              <Table
                columns={settlementColumns}
                data={data?.items || []}
                keyExtractor={(row) => row.settlementId}
                isLoading={isLoading}
                renderActions={(row) => (
                  <Button variant="outline" size="sm" onClick={() => detailDrawer.open(row)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    Details
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
          </>
        ) : (
          <>
            <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
              <Table
                columns={reconciliationColumns}
                data={reconciliationItems}
                keyExtractor={(row) => row.reconciliationId}
                isLoading={isLoading}
                renderActions={(row) => (
                  <Button variant="outline" size="sm" onClick={() => reconcileModal.open(row)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    Inspect
                  </Button>
                )}
              />
            </div>

            <Pagination
              currentPage={reconciliationPagination.page}
              totalPages={reconciliationPagination.totalPages}
              totalItems={reconciliationPagination.totalItems}
              pageSize={reconciliationPagination.pageSize}
              onPageChange={(page) => setReconciliationPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setReconciliationPagination((prev) => ({ ...prev, page: 1, pageSize }))}
            />
          </>
        )}

        {/* Drawers & Modals */}
        <SettlementDetailsDrawer isOpen={detailDrawer.isOpen} onClose={detailDrawer.close} settlement={detailDrawer.data} />
        <ReconciliationDetailsModal isOpen={reconcileModal.isOpen} onClose={reconcileModal.close} record={reconcileModal.data} />
      </div>
    </PageContainer>
  );
}
