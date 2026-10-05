'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useModal } from '@/hooks/useModal';
import { invoiceService } from '@/services/invoiceService';
import { reportService } from '@/services/reportService';
import { TdsRecord, ReportDateRange, EntityType } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ReportDateRangePicker } from '@/components/features/reports/ReportDateRangePicker';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { TdsDetailsModal } from '@/components/features/invoices/TdsDetailsModal';
import { Search, Filter, RotateCcw, Eye } from 'lucide-react';

export default function TdsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<'ALL' | EntityType>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<ReportDateRange>({ preset: 'THIS_MONTH' });
  const [records, setRecords] = useState<TdsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tdsModal = useModal<TdsRecord>();

  const loadData = () => {
    setIsLoading(true);
    invoiceService.getTdsRecords().then((res) => {
      if (res.success && res.data) {
        let items = res.data;
        if (entityFilter !== 'ALL') {
          items = items.filter((r) => r.entityType === entityFilter);
        }
        if (statusFilter !== 'ALL') {
          items = items.filter((r) => r.status === statusFilter);
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.trim().toLowerCase();
          items = items.filter(
            (r) =>
              r.tdsId.toLowerCase().includes(q) ||
              r.invoiceId.toLowerCase().includes(q) ||
              r.entityName.toLowerCase().includes(q) ||
              r.panMasked.toLowerCase().includes(q)
          );
        }
        setRecords(items);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    invoiceService.getTdsRecords().then((res) => {
      if (!isCancelled && res.success && res.data) {
        let items = res.data;
        if (entityFilter !== 'ALL') {
          items = items.filter((r) => r.entityType === entityFilter);
        }
        if (statusFilter !== 'ALL') {
          items = items.filter((r) => r.status === statusFilter);
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.trim().toLowerCase();
          items = items.filter(
            (r) =>
              r.tdsId.toLowerCase().includes(q) ||
              r.invoiceId.toLowerCase().includes(q) ||
              r.entityName.toLowerCase().includes(q) ||
              r.panMasked.toLowerCase().includes(q)
          );
        }
        setRecords(items);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [searchQuery, entityFilter, statusFilter, dateRange]);

  const handleReset = () => {
    setSearchQuery('');
    setEntityFilter('ALL');
    setStatusFilter('ALL');
    setDateRange({ preset: 'THIS_MONTH' });
    loadData();
  };

  const handleExportCsv = () => {
    const exportRows = records.map((r) => ({
      'TDS ID': r.tdsId,
      'Invoice ID': r.invoiceId,
      'Entity Name': r.entityName,
      'Entity Type': r.entityType,
      'PAN (Masked)': r.panMasked,
      'Taxable Amount (INR)': r.taxableAmount,
      'TDS Rate (%)': r.tdsRate,
      'TDS Amount (INR)': r.tdsAmount,
      'Status': r.status,
      'Deduction Date': r.deductionDate,
      'Certificate Ref': r.certificateRef || 'N/A',
    }));
    reportService.exportToCsv('TDS_Management_Report', exportRows);
  };

  const totalApplicable = records.reduce((acc, r) => acc + r.taxableAmount, 0);
  const totalDeducted = records.reduce((acc, r) => acc + r.tdsAmount, 0);
  const certAvailableCount = records.filter((r) => r.status === 'CERTIFICATE_AVAILABLE').length;

  const columns = [
    {
      key: 'tdsId',
      header: 'TDS ID / Invoice',
      render: (row: TdsRecord) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.tdsId}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.invoiceId}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Entity / PAN',
      render: (row: TdsRecord) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.entityName}</div>
          <div className="text-[11px] font-mono text-purple-700">PAN: {row.panMasked}</div>
        </div>
      ),
    },
    {
      key: 'taxableAmount',
      header: 'Taxable Amount',
      align: 'right' as const,
      render: (row: TdsRecord) => (
        <span className="font-mono text-xs text-slate-700">{formatCurrency(row.taxableAmount)}</span>
      ),
    },
    {
      key: 'tdsRate',
      header: 'Rate',
      align: 'center' as const,
      render: (row: TdsRecord) => (
        <span className="font-mono font-semibold text-xs text-amber-700">{row.tdsRate}%</span>
      ),
    },
    {
      key: 'tdsAmount',
      header: 'TDS Amount',
      align: 'right' as const,
      render: (row: TdsRecord) => (
        <span className="font-mono font-extrabold text-xs text-amber-800">{formatCurrency(row.tdsAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: TdsRecord) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'certificateRef',
      header: 'Certificate Ref',
      render: (row: TdsRecord) => (
        <span className="text-xs font-mono text-slate-600">{row.certificateRef || 'Pending Certificate'}</span>
      ),
    },
    {
      key: 'deductionDate',
      header: 'Deduction Date',
      render: (row: TdsRecord) => (
        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{formatDate(row.deductionDate)}</span>
      ),
    },
  ];

  return (
    <PageContainer
      title="TDS Management"
      description="Track tax deducted at source against eligible platform invoices and settlements."
      actions={<ReportExportMenu onExportCsv={handleExportCsv} reportTitle="TDS Report" disabled={!records.length} />}
    >
      <div className="space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">TDS Applicable Volume</span>
            <div className="mt-1 font-mono font-extrabold text-base text-[var(--primary)]">{formatCurrency(totalApplicable)}</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Base taxable amount</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total TDS Deducted</span>
            <div className="mt-1 font-mono font-extrabold text-base text-amber-800">{formatCurrency(totalDeducted)}</div>
            <span className="text-[11px] text-amber-600 block mt-0.5">10% tax credit</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Certificates Issued</span>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-700">{certAvailableCount} Available</div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">Form 16A verified</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total TDS Entries</span>
            <div className="mt-1 font-mono font-extrabold text-base text-slate-900">{records.length} Records</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Centralized TDS log</span>
          </Card>
        </div>

        {/* Complete Filter Bar with Date Range, Reset, Apply */}
        <Card className="p-4 bg-white border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <Input
              label="Search TDS"
              placeholder="Search TDS ID, Invoice ID, Entity, PAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />

            <Select
              label="Entity Type"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value as 'ALL' | EntityType)}
              options={[
                { value: 'ALL', label: 'All Entity Types' },
                { value: 'MERCHANT', label: 'Retailer' },
                { value: 'DISTRIBUTOR', label: 'Distributor' },
                { value: 'RETAILER', label: 'Retailer' },
              ]}
            />

            <Select
              label="TDS Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'DEDUCTED', label: 'Deducted' },
                { value: 'CERTIFICATE_AVAILABLE', label: 'Certificate Available' },
                { value: 'PENDING', label: 'Pending' },
              ]}
            />
          </div>

          <ReportDateRangePicker value={dateRange} onChange={(d) => setDateRange(d)} />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">Filter TDS entries by entity, filing status, and deduction period.</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" type="button" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Reset
              </Button>
              <Button variant="primary" size="sm" type="button" onClick={loadData} leftIcon={<Filter className="w-3.5 h-3.5" />}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Table with Actions Column */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
          <Table
            columns={columns}
            data={records}
            keyExtractor={(row) => row.tdsId}
            isLoading={isLoading}
            renderActions={(row) => (
              <Button variant="outline" size="sm" onClick={() => tdsModal.open(row)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                View Details
              </Button>
            )}
          />
        </div>

        {/* Details Modal */}
        <TdsDetailsModal isOpen={tdsModal.isOpen} onClose={tdsModal.close} record={tdsModal.data} />
      </div>
    </PageContainer>
  );
}
