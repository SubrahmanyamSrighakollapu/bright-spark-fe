'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { reportService } from '@/services/reportService';
import { transactionService } from '@/services/transactionService';
import { commissionService } from '@/services/commissionService';
import { ledgerService } from '@/services/ledgerService';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, SearchInput, Pagination, Tabs, Table, StatusBadge, useToast } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ColumnDefinition } from '@/types/common';
import { Download, RefreshCw, FileText, Store, Percent, ArrowLeftRight } from 'lucide-react';

export default function DistributorReportsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const distributorId = session?.entityId || 'dst_001';

  // Tabs (Excludes Distributor Report since Distributor does not manage subordinate Distributors)
  const [activeTab, setActiveTab] = useState('txn-report');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Report Datasets
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const tabs = [
    { id: 'txn-report', label: 'Transaction Report', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'ret-report', label: 'Retailer Report', icon: <Store className="w-4 h-4" /> },
    { id: 'comm-report', label: 'Commission Report', icon: <Percent className="w-4 h-4" /> },
    { id: 'wallet-report', label: 'Wallet Statement', icon: <FileText className="w-4 h-4" /> },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'txn-report') {
        const res = await reportService.getDistributorTransactionReport(distributorId, { searchQuery });
        if (res.success && res.data) {
          setReportData(res.data.items);
        }
      } else if (activeTab === 'ret-report') {
        const res = await reportService.getDistributorRetailerReport(distributorId, { searchQuery });
        if (res.success && res.data) {
          setReportData(res.data.items);
        }
      } else if (activeTab === 'comm-report') {
        const commRes = await commissionService.getCommissionsForDistributor(distributorId, { searchQuery });
        if (commRes.success && commRes.data) {
          setReportData(commRes.data.items);
        }
      } else if (activeTab === 'wallet-report') {
        const ledRes = await ledgerService.getDistributorLedger(distributorId, { searchQuery }, 1, 100);
        if (ledRes.success && ledRes.data) {
          setReportData(ledRes.data.items);
        }
      }
    } catch (err) {
      console.error('Failed to load Distributor report data:', err);
      toastError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, distributorId, activeTab, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have authorization to view reporting tools for this Distributor account." />
    );
  }

  const handleExportCsv = () => {
    if (reportData.length === 0) {
      toastError('No report records available to export');
      return;
    }
    reportService.exportToCsv(`Distributor_${activeTab.toUpperCase()}_Export`, reportData);
  };

  // Render Table Columns dynamically based on active tab
  const renderTable = () => {
    if (activeTab === 'txn-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'transactionId', header: 'Txn ID', render: (r) => <span className="font-mono font-bold text-sky-600">{r.transactionId}</span> },
        { key: 'retailerName', header: 'Retailer Name', render: (r) => <span className="font-semibold text-slate-900">{r.retailerName}</span> },
        { key: 'mobileNumber', header: 'Mobile', render: (r) => <span className="font-mono text-slate-600">{r.mobileNumber}</span> },
        { key: 'serviceType', header: 'Service', render: (r) => <span className="text-slate-700">{r.serviceType}</span> },
        { key: 'transactionAmount', header: 'Amount', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.transactionAmount)}</span> },
        { key: 'transactionCharges', header: 'Charges', align: 'right', render: (r) => <span className="text-slate-600 font-mono">{formatCurrency(r.transactionCharges)}</span> },
        { key: 'status', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.status} size="sm" /> },
        { key: 'settlementStatus', header: 'Settlement', align: 'center', render: (r) => <StatusBadge status={r.settlementStatus} size="sm" /> },
        { key: 'requestedAt', header: 'Date & Time', render: (r) => <span className="text-slate-600 text-xs">{formatDateTime(r.requestDateTime || r.requestedAt)}</span> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r) => r.transactionId || r.id} isLoading={isLoading} emptyTitle="No Transaction Records Found" emptyDescription="No retailer transactions match your selected search criteria." />;
    }

    if (activeTab === 'ret-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'code', header: 'Retailer Code', render: (r) => <span className="font-mono font-bold text-sky-600">{r.code}</span> },
        { key: 'name', header: 'Retailer Name', render: (r) => <span className="font-semibold text-slate-900">{r.name}</span> },
        { key: 'businessName', header: 'Business Name', render: (r) => <span className="text-slate-700">{r.businessName}</span> },
        { key: 'planName', header: 'Assigned Plan', render: (r) => <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-medium text-xs border border-sky-200">{r.planName}</span> },
        { key: 'volume', header: 'Transaction Volume', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.volume || 0)}</span> },
        { key: 'commission', header: 'Distributor Earnings', align: 'right', render: (r) => <span className="font-bold text-emerald-600 font-mono">+{formatCurrency(r.commission || 0)}</span> },
        { key: 'approvalStatus', header: 'KYC / Approval', align: 'center', render: (r) => <StatusBadge status={r.approvalStatus || r.kycStatus} size="sm" /> },
        { key: 'accountStatus', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.accountStatus} size="sm" /> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r) => r.id} isLoading={isLoading} emptyTitle="No Retailers Found" emptyDescription="No retailers under your distributor account." />;
    }

    if (activeTab === 'comm-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'transactionRef', header: 'Txn ID', render: (r) => <span className="font-mono font-bold text-sky-600">{r.transactionRef}</span> },
        { key: 'retailerName', header: 'Retailer', render: (r) => <span className="font-semibold text-slate-900">{r.retailerName}</span> },
        { key: 'serviceType', header: 'Service', render: (r) => <span className="text-slate-700">{r.serviceType}</span> },
        { key: 'transactionAmount', header: 'Txn Amount', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.transactionAmount)}</span> },
        { key: 'mdCommissionRate', header: 'Distributor Rate', align: 'center', render: (r) => <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100">{r.mdCommissionRate}</span> },
        { key: 'mdCommissionAmount', header: 'Commission Amount', align: 'right', render: (r) => <span className="font-bold text-emerald-600 font-mono">+{formatCurrency(r.mdCommissionAmount)}</span> },
        { key: 'status', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.status === 'CREDITED' ? 'SUCCESS' : 'PENDING'} label={r.status} size="sm" /> },
        { key: 'createdDate', header: 'Credited Date', render: (r) => <span className="text-slate-600 text-xs">{formatDateTime(r.creditedDate || r.createdDate)}</span> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r, i) => r.id || String(i)} isLoading={isLoading} emptyTitle="No Commission Records Found" emptyDescription="No commission records match your search criteria." />;
    }

    if (activeTab === 'wallet-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'referenceId', header: 'Reference ID', render: (r) => <span className="font-mono font-bold text-sky-600">{r.referenceId || r.id}</span> },
        { key: 'entryType', header: 'Entry Type', render: (r) => <span className="font-semibold text-slate-800">{r.entryType}</span> },
        { key: 'description', header: 'Description', render: (r) => <span className="text-slate-700 text-xs">{r.description}</span> },
        { key: 'direction', header: 'Direction', align: 'center', render: (r) => <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.direction === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{r.direction}</span> },
        { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className={`font-bold font-mono ${r.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>{r.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(r.amount)}</span> },
        { key: 'closingBalance', header: 'Balance After', align: 'right', render: (r) => <span className="font-mono font-semibold">{formatCurrency(r.closingBalance)}</span> },
        { key: 'createdAt', header: 'Date & Time', render: (r) => <span className="text-slate-600 text-xs">{formatDateTime(r.createdAt)}</span> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r) => r.id} isLoading={isLoading} emptyTitle="No Ledger Entries Found" emptyDescription="No wallet ledger entries match your search criteria." />;
    }

    return null;
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reportData.slice(start, start + pageSize);
  }, [reportData, currentPage, pageSize]);

  return (
    <PageContainer
      title="Distributor Operational Reports"
      description="Inspect and export distributor-scoped transaction, retailer, commission, and wallet ledger statement reports"
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
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      }
    >
      {/* Tabs */}
      <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px] max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search report entries..."
          />
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Reset Search
          </Button>
        )}
      </div>

      {/* Report Table with internal horizontal overflow */}
      <div className="space-y-4">
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white shadow-xs">
          {renderTable()}
        </div>

        {/* Pagination */}
        {reportData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(reportData.length / pageSize)}
            totalItems={reportData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </PageContainer>
  );
}
