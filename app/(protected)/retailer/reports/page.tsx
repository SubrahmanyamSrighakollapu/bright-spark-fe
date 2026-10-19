'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/services/reportService';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, SearchInput, Pagination, Tabs, Table, StatusBadge, useToast } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ColumnDefinition } from '@/types/common';

// Financial Foundation Components
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { TransactionTypeBadge } from '@/components/features/financial/TransactionTypeBadge';

import {
  Download,
  RefreshCw,
  FileText,
  Percent,
  ArrowLeftRight,
  ShieldCheck,
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function RetailerReportsPage() {
  const { session } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const retailerId = session?.entityId || 'RET001';

  // Tabs (Scoped strictly to Retailer operational views)
  const [activeTab, setActiveTab] = useState('txn-report');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Report Datasets & Loading
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const tabs = [
    { id: 'txn-report', label: 'Transaction Report', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'comm-report', label: 'Commission Earnings', icon: <Percent className="w-4 h-4" /> },
    { id: 'wallet-report', label: 'Wallet Statement', icon: <FileText className="w-4 h-4" /> },
  ];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'txn-report') {
        const res = await reportService.getRetailerTransactionReport(retailerId, {
          searchQuery,
          type: txnTypeFilter !== 'ALL' ? (txnTypeFilter as any) : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        });
        if (res.success && res.data) {
          setReportData(res.data.items);
        }
      } else if (activeTab === 'comm-report') {
        const commRes = await reportService.getRetailerCommissionReport(retailerId, {
          searchQuery,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        });
        if (commRes.success && commRes.data) {
          setReportData(commRes.data.items);
        }
      } else if (activeTab === 'wallet-report') {
        const wltRes = await reportService.getRetailerWalletStatement(retailerId, {
          searchQuery,
          type: txnTypeFilter !== 'ALL' ? (txnTypeFilter as any) : undefined,
        });
        if (wltRes.success && wltRes.data) {
          setReportData(wltRes.data.items);
        }
      }
    } catch (err) {
      console.error('Failed to load Retailer report data:', err);
      toastError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  }, [retailerId, activeTab, searchQuery, txnTypeFilter, statusFilter, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, txnTypeFilter, statusFilter]);

  const handleExportCsv = () => {
    if (reportData.length === 0) {
      toastError('No report records available to export');
      return;
    }
    reportService.exportToCsv(`Retailer_${retailerId}_${activeTab.toUpperCase()}`, reportData);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTxnTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reportData.slice(start, start + pageSize);
  }, [reportData, currentPage, pageSize]);

  // Derived Filtered Report Summary Statistics
  const reportSummary = useMemo(() => {
    if (activeTab === 'txn-report') {
      const count = reportData.length;
      const volume = reportData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const charges = reportData.reduce((acc, curr) => acc + (curr.fee || 0), 0);
      const gst = reportData.reduce((acc, curr) => acc + (curr.gst || 0), 0);
      return { count, volume, charges, gst };
    }
    if (activeTab === 'comm-report') {
      const totalEarnings = reportData.reduce((acc, curr) => acc + (curr.mdCommissionAmount || 0), 0);
      const credited = reportData
        .filter((c) => c.status === 'CREDITED')
        .reduce((acc, curr) => acc + (curr.mdCommissionAmount || 0), 0);
      const pending = reportData
        .filter((c) => c.status === 'PENDING')
        .reduce((acc, curr) => acc + (curr.mdCommissionAmount || 0), 0);
      return { totalEarnings, credited, pending };
    }
    if (activeTab === 'wallet-report') {
      const movements = reportData.length;
      const credits = reportData
        .filter((w) => w.direction === 'CREDIT')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const debits = reportData
        .filter((w) => w.direction === 'DEBIT')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
      return { movements, credits, debits };
    }
    return {};
  }, [activeTab, reportData]);

  // Render Table Columns dynamically based on active tab
  const renderTable = () => {
    if (activeTab === 'txn-report') {
      const columns: ColumnDefinition<any>[] = [
        {
          key: 'transactionRef',
          header: 'Txn ID / Ref',
          render: (r) => (
            <div>
              <span className="font-mono font-bold text-[#2F6F5E]">{r.transactionRef || r.id}</span>
              {r.utr && r.utr !== 'N/A' && (
                <span className="block text-[10px] text-slate-400 font-mono">UTR: {r.utr}</span>
              )}
            </div>
          ),
        },
        {
          key: 'type',
          header: 'Type / Service',
          render: (r) => (
            <div>
              <TransactionTypeBadge type={r.type} size="sm" />
              <span className="block text-[10px] text-slate-500 mt-0.5">{r.service || r.paymentMode}</span>
            </div>
          ),
        },
        {
          key: 'amount',
          header: 'Principal Amount',
          align: 'right',
          render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.amount)}</span>,
        },
        {
          key: 'fee',
          header: 'Charges',
          align: 'right',
          render: (r) => <span className="text-slate-600 font-mono">{formatCurrency(r.fee || 0)}</span>,
        },
        {
          key: 'gst',
          header: 'GST',
          align: 'right',
          render: (r) => <span className="text-slate-600 font-mono">{formatCurrency(r.gst || 0)}</span>,
        },
        {
          key: 'netAmount',
          header: 'Net Wallet Impact',
          align: 'right',
          render: (r) => <span className="font-bold text-[#2F6F5E] font-mono">{formatCurrency(r.netAmount || r.amount)}</span>,
        },
        {
          key: 'status',
          header: 'Status',
          align: 'center',
          render: (r) => <StatusBadge status={r.status} size="sm" />,
        },
        {
          key: 'createdAt',
          header: 'Date & Time',
          render: (r) => <span className="text-slate-600 text-xs font-mono">{formatDateTime(r.createdAt)}</span>,
        },
      ];

      return (
        <Table
          columns={columns}
          data={paginatedData}
          keyExtractor={(r, i) => r.transactionRef || r.id || `txn-report-${i}`}
          isLoading={isLoading}
          emptyTitle="No Transaction Records Found"
          emptyDescription="No outlet transactions match your selected search criteria."
        />
      );
    }

    if (activeTab === 'comm-report') {
      const columns: ColumnDefinition<any>[] = [
        {
          key: 'transactionRef',
          header: 'Txn ID / Ref',
          render: (r) => <span className="font-mono font-bold text-[#2F6F5E]">{r.transactionRef}</span>,
        },
        {
          key: 'serviceType',
          header: 'Service Category',
          render: (r) => <span className="text-slate-800 font-semibold">{r.serviceType}</span>,
        },
        {
          key: 'transactionAmount',
          header: 'Principal Volume',
          align: 'right',
          render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.transactionAmount)}</span>,
        },
        {
          key: 'mdCommissionRate',
          header: 'Plan Rule',
          align: 'center',
          render: (r) => (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-[#2F6F5E] font-semibold border border-[#D4E1AE]">
              {r.mdCommissionRate}
            </span>
          ),
        },
        {
          key: 'mdCommissionAmount',
          header: 'Earned Margin',
          align: 'right',
          render: (r) => <span className="font-bold text-emerald-600 font-mono">+{formatCurrency(r.mdCommissionAmount)}</span>,
        },
        {
          key: 'status',
          header: 'Status',
          align: 'center',
          render: (r) => <StatusBadge status={r.status === 'CREDITED' ? 'SUCCESS' : 'PENDING'} label={r.status} size="sm" />,
        },
        {
          key: 'createdDate',
          header: 'Credited Date',
          render: (r) => <span className="text-slate-600 text-xs font-mono">{formatDateTime(r.creditedDate || r.createdDate)}</span>,
        },
      ];

      return (
        <Table
          columns={columns}
          data={paginatedData}
          keyExtractor={(r, i) => r.id || r.transactionRef || `comm-report-${i}`}
          isLoading={isLoading}
          emptyTitle="No Commission Records Found"
          emptyDescription="No commission earnings match your selected search criteria."
        />
      );
    }

    if (activeTab === 'wallet-report') {
      const columns: ColumnDefinition<any>[] = [
        {
          key: 'referenceId',
          header: 'Ledger Reference',
          render: (r) => <span className="font-mono font-bold text-[#2F6F5E]">{r.referenceId || r.id}</span>,
        },
        {
          key: 'entryType',
          header: 'Movement Type',
          render: (r) => (
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded">
              {r.entryType || r.movementType || 'LEDGER'}
            </span>
          ),
        },
        {
          key: 'description',
          header: 'Description',
          render: (r) => <span className="text-slate-700 text-xs truncate max-w-[220px] block">{r.description}</span>,
        },
        {
          key: 'direction',
          header: 'Direction',
          align: 'center',
          render: (r) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                r.direction === 'CREDIT' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {r.direction}
            </span>
          ),
        },
        {
          key: 'amount',
          header: 'Amount',
          align: 'right',
          render: (r) => (
            <span className={`font-bold font-mono ${r.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {r.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(r.amount)}
            </span>
          ),
        },
        {
          key: 'closingBalance',
          header: 'Balance After',
          align: 'right',
          render: (r) => <span className="font-mono font-bold text-slate-900">{formatCurrency(r.closingBalance || r.balanceAfter || 0)}</span>,
        },
        {
          key: 'createdAt',
          header: 'Posting Time',
          render: (r) => <span className="text-slate-600 text-xs font-mono">{formatDateTime(r.createdAt || r.timestamp)}</span>,
        },
      ];

      return (
        <Table
          columns={columns}
          data={paginatedData}
          keyExtractor={(r, i) => r.id || r.referenceId || `wlt-report-${i}`}
          isLoading={isLoading}
          emptyTitle="No Wallet Statement Entries Found"
          emptyDescription="No wallet ledger records match your search criteria."
        />
      );
    }

    return null;
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Retailer Reports"
          subtitle="Generate and export Retailer transaction reports, commission summaries, and wallet statements."
          statusBadge={<StatusBadge status="ACTIVE" label="Retailer Scope" />}
          actions={
            <div className="flex items-center gap-2">
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
                className="bg-[#2F6F5E] text-white"
                onClick={handleExportCsv}
                leftIcon={<Download className="w-4 h-4" />}
                disabled={reportData.length === 0}
              >
                Export
              </Button>
            </div>
          }
        />

        {/* Security Scope Banner */}
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2F6F5E] shrink-0" />
            <span>Report data strictly scoped to authenticated Retailer ID: <strong className="font-mono text-[#2F6F5E]">{retailerId}</strong></span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white text-[#2F6F5E] px-2 py-0.5 rounded border border-blue-200">
            Self-Scoped Operations
          </span>
        </div>

        {/* Tab Report Selector */}
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Filtered Report Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeTab === 'txn-report' && (
            <>
              <FinancialMetricCard label="Total Count" value={reportSummary.count || 0} variant="primary" />
              <FinancialMetricCard label="Total Volume" value={formatCurrency(reportSummary.volume || 0)} variant="payin" isDominant />
              <FinancialMetricCard label="Charges" value={formatCurrency(reportSummary.charges || 0)} variant="neutral" />
              <FinancialMetricCard label="GST (18%)" value={formatCurrency(reportSummary.gst || 0)} variant="neutral" />
            </>
          )}

          {activeTab === 'comm-report' && (
            <>
              <FinancialMetricCard label="Total Earnings" value={formatCurrency(reportSummary.totalEarnings || 0)} variant="success" isDominant />
              <FinancialMetricCard label="Credited Margin" value={formatCurrency(reportSummary.credited || 0)} variant="success" />
              <FinancialMetricCard label="Pending Clearance" value={formatCurrency(reportSummary.pending || 0)} variant="warning" />
              <FinancialMetricCard label="Records" value={reportData.length} variant="neutral" />
            </>
          )}

          {activeTab === 'wallet-report' && (
            <>
              <FinancialMetricCard label="Total Movements" value={reportSummary.movements || 0} variant="primary" />
              <FinancialMetricCard label="Total Credits" value={formatCurrency(reportSummary.credits || 0)} variant="success" isDominant />
              <FinancialMetricCard label="Total Debits" value={formatCurrency(reportSummary.debits || 0)} variant="danger" />
              <FinancialMetricCard label="Scope" value="Wallet Ledger" variant="neutral" />
            </>
          )}
        </div>

        {/* Filter Bar Toolbar */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[260px] max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search report entries by ID, Reference, or UTR..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'txn-report' && (
              <select
                value={txnTypeFilter}
                onChange={(e) => setTxnTypeFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:border-[#2F6F5E]"
              >
                <option value="ALL">All Types</option>
                <option value="PAY_IN">Pay-In Collection</option>
                <option value="PAY_OUT">Pay-Out Disbursement</option>
              </select>
            )}

            {(activeTab === 'txn-report' || activeTab === 'comm-report') && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:border-[#2F6F5E]"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success / Credited</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            )}

            {(searchQuery || txnTypeFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<X className="w-3.5 h-3.5" />}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Report Table Wrapper with Mandatory Internal Horizontal Overflow Scrolling */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {renderTable()}
          </div>

          {/* Pagination */}
          {reportData.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                Showing {paginatedData.length} of {reportData.length} records
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(reportData.length / pageSize)}
                totalItems={reportData.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
