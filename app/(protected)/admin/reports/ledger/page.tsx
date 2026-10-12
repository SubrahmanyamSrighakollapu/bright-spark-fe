'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { reportService, ReportListResult } from '@/services/reportService';
import { LedgerEntry, LedgerReportSummary, ReportFilters, ReportDateRange, PaginationState } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ReportDateRangePicker } from '@/components/features/reports/ReportDateRangePicker';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { LedgerDetailsDrawer } from '@/components/features/wallet/LedgerDetailsDrawer';
import { AdminReportNav } from '@/components/features/reports/AdminReportNav';
import { Search, Filter, RotateCcw, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useToast } from '@/components/ui';

export default function LedgerReportPage() {
  const [dateRange, setDateRange] = useState<ReportDateRange>({ preset: 'THIS_MONTH' });
  const [searchQuery, setSearchQuery] = useState('');
  const [entryType, setEntryType] = useState('ALL');
  const [direction, setDirection] = useState('ALL');

  const [data, setData] = useState<ReportListResult<LedgerEntry, LedgerReportSummary> | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const detailDrawer = useModal<LedgerEntry>();

  const loadReport = () => {
    setIsLoading(true);
    const filters: ReportFilters = {
      dateRange,
      searchQuery,
      entryType,
      direction,
    };
    reportService.getLedgerReport(filters, pagination.page, pagination.pageSize).then((res) => {
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
      entryType,
      direction,
    };
    reportService.getLedgerReport(filters, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [dateRange, searchQuery, entryType, direction, pagination.page, pagination.pageSize]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await reportService.exportLedgerCsv({
        dateRange,
        searchQuery,
        entryType,
        direction,
      });
      toastSuccess('Ledger report exported successfully');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to export ledger report');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {
    totalCredits: 0,
    totalDebits: 0,
    netMovement: 0,
    entryCount: 0,
  };

  const columns = [
    {
      key: 'id',
      header: 'Ledger ID / Wallet',
      render: (row: LedgerEntry) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.id}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.walletId}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Target Entity',
      render: (row: LedgerEntry) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.entityName}</div>
          <div className="text-[11px] font-semibold text-purple-700">{row.entryType}</div>
        </div>
      ),
    },
    {
      key: 'direction',
      header: 'Direction',
      align: 'center' as const,
      render: (row: LedgerEntry) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            row.direction === 'CREDIT'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.direction === 'CREDIT' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
          {row.direction}
        </span>
      ),
    },
    {
      key: 'openingBalance',
      header: 'Opening',
      align: 'right' as const,
      render: (row: LedgerEntry) => (
        <span className="font-mono text-xs text-slate-600">{formatCurrency(row.openingBalance)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right' as const,
      render: (row: LedgerEntry) => (
        <span
          className={`font-mono font-extrabold text-xs ${
            row.direction === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {row.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'closingBalance',
      header: 'Closing',
      align: 'right' as const,
      render: (row: LedgerEntry) => (
        <span className="font-mono font-bold text-xs text-slate-900">{formatCurrency(row.closingBalance)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (row: LedgerEntry) => (
        <span className="text-xs text-slate-600 font-mono whitespace-nowrap">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <PageContainer
      title="Ledger Report"
      description="Immutable financial audit logs, entry types, direction breakdown, and exportable reports."
      actions={
        <ReportExportMenu onExportCsv={handleExportCsv} reportTitle="Ledger Report" disabled={!data?.items?.length} isLoading={isExporting} />
      }
    >
      <div className="space-y-6">
        {/* Reports Navigation Bar */}
        <AdminReportNav />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Credits (+)</span>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-700">{formatCurrency(summary.totalCredits)}</div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">Inflow additions</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Debits (-)</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-700">{formatCurrency(summary.totalDebits)}</div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Outflow deductions</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Net Balance Movement</span>
            <div className={`mt-1 font-mono font-extrabold text-base ${summary.netMovement >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {summary.netMovement >= 0 ? '+' : ''}{formatCurrency(summary.netMovement)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Net audit shift</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Entry Count</span>
            <div className="mt-1 font-mono font-extrabold text-base text-purple-900">{summary.entryCount} Entries</div>
            <span className="text-[11px] text-purple-600 block mt-0.5">Immutable records</span>
          </Card>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <Input
                label="Search Ledger"
                placeholder="Search Ledger ID, Entity, Reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />

              <Select
                label="Entry Type"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Entry Types' },
                  { value: 'PAY_IN', label: 'Pay-In' },
                  { value: 'PAY_OUT', label: 'Pay-Out' },
                  { value: 'WALLET_CREDIT', label: 'Wallet Credit' },
                  { value: 'WALLET_DEBIT', label: 'Wallet Debit' },
                  { value: 'CHARGE', label: 'Fee Charge' },
                  { value: 'TAX', label: 'Tax' },
                  { value: 'SETTLEMENT', label: 'Settlement' },
                ]}
              />

              <Select
                label="Direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Directions' },
                  { value: 'CREDIT', label: 'CREDIT (+)' },
                  { value: 'DEBIT', label: 'DEBIT (-)' },
                ]}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">Filtered data derived from centralized immutable ledger audit log.</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setEntryType('ALL');
                    setDirection('ALL');
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

        {/* Data Table */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
          <Table
            columns={columns}
            data={data?.items || []}
            keyExtractor={(row) => row.id}
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

        {/* Details Drawer */}
        <LedgerDetailsDrawer isOpen={detailDrawer.isOpen} onClose={detailDrawer.close} entry={detailDrawer.data} />
      </div>
    </PageContainer>
  );
}
