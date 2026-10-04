'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { reportService, MasterDistributorReportRow } from '@/services/reportService';
import { transactionService } from '@/services/transactionService';
import { PageHeader, Button, SearchInput, Select, Pagination, Tabs, Table, StatusBadge, useToast } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ColumnDefinition } from '@/types/common';
import { BarChart3, Download, RefreshCw, FileText, Users, Store, Percent, ArrowLeftRight } from 'lucide-react';

export default function MasterDistributorReportsPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'MASTER_DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const masterDistributorId = session?.entityId || 'md_001';

  // Tabs
  const [activeTab, setActiveTab] = useState('txn-report');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Report Datasets
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const tabs = [
    { id: 'txn-report', label: 'Transaction Report', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'dist-report', label: 'Distributor Report', icon: <Users className="w-4 h-4" /> },
    { id: 'ret-report', label: 'Retailer Report', icon: <Store className="w-4 h-4" /> },
    { id: 'comm-report', label: 'Commission Report', icon: <Percent className="w-4 h-4" /> },
    { id: 'wallet-report', label: 'Wallet Statement', icon: <FileText className="w-4 h-4" /> },
  ];


  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'txn-report') {
        const res = await reportService.getScopedTransactionReport(masterDistributorId, { searchQuery });
        if (res.success && res.data) {
          setReportData(res.data.items);
          setReportSummary(res.data.summary);
        }
      } else if (activeTab === 'dist-report') {
        const res = await reportService.getScopedDistributorReport(masterDistributorId, { searchQuery });
        if (res.success && res.data) {
          setReportData(res.data.items);
          setReportSummary(res.data.summary);
        }
      } else if (activeTab === 'ret-report') {
        const res = await reportService.getScopedRetailerReport(masterDistributorId, { searchQuery });
        if (res.success && res.data) {
          setReportData(res.data.items);
          setReportSummary(res.data.summary);
        }
      } else if (activeTab === 'comm-report') {
        const txRes = await transactionService.getTransactionsForMasterDistributor(masterDistributorId, { searchQuery });
        const items = (txRes.data?.items || []).map((t, idx) => ({
          transactionRef: t.transactionRef,
          retailerName: t.retailerName || 'Metro Outlet',
          distributorName: t.distributorName || 'North Zone Dist',
          serviceType: t.service || 'UPI Pay-In',
          amount: t.amount,
          rate: t.type === 'PAY_IN' ? '0.10%' : '₹ 1.00',
          commission: t.type === 'PAY_IN' ? +(t.amount * 0.001).toFixed(2) : 1.0,
          status: t.status === 'SUCCESS' ? 'CREDITED' : 'PENDING',
          createdAt: t.createdAt,
        }));
        setReportData(items);
        setReportSummary(null);
      } else if (activeTab === 'wallet-report') {
        const txRes = await transactionService.getTransactionsForMasterDistributor(masterDistributorId, { searchQuery });
        const items = (txRes.data?.items || []).map((t, idx) => ({
          id: `led_rpt_${idx + 1}`,
          reference: t.transactionRef,
          type: t.type === 'PAY_IN' ? 'SETTLEMENT' : 'WALLET_DEBIT',
          direction: t.type === 'PAY_IN' ? 'CREDIT' : 'DEBIT',
          amount: t.amount,
          balance: 245800.0 - idx * 100,
          date: t.createdAt,
        }));
        setReportData(items);
        setReportSummary(null);
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
      toastError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, masterDistributorId, activeTab, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have authorization to view reporting tools for this Master Distributor account." />
    );
  }

  const handleExportCsv = () => {
    if (reportData.length === 0) {
      toastError('No data available to export');
      return;
    }
    reportService.exportToCsv(`MD_${activeTab.toUpperCase()}_Export`, reportData);
  };

  // Render Table Columns dynamically based on active tab
  const renderTable = () => {
    if (activeTab === 'txn-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'transactionId', header: 'Txn ID', render: (r) => <span className="font-mono font-bold text-indigo-600">{r.transactionId}</span> },
        { key: 'retailerName', header: 'Retailer Outlet', render: (r) => <span className="font-semibold text-slate-900">{r.retailerName}</span> },
        { key: 'serviceType', header: 'Service', render: (r) => <span className="text-slate-700">{r.serviceType}</span> },
        { key: 'transactionAmount', header: 'Amount', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.transactionAmount)}</span> },
        { key: 'status', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.status} size="sm" /> },
        { key: 'settlementStatus', header: 'Settlement', align: 'center', render: (r) => <StatusBadge status={r.settlementStatus} size="sm" /> },
        { key: 'requestedAt', header: 'Date', render: (r) => <span className="text-slate-600 text-xs">{formatDateTime(r.requestedAt)}</span> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r) => r.transactionId} isLoading={isLoading} />;
    }

    if (activeTab === 'dist-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'code', header: 'Distributor Code', render: (r) => <span className="font-mono font-bold text-indigo-600">{r.code}</span> },
        { key: 'name', header: 'Distributor Name', render: (r) => <span className="font-semibold text-slate-900">{r.name}</span> },
        { key: 'businessName', header: 'Business Name', render: (r) => <span className="text-slate-700">{r.businessName}</span> },
        { key: 'retailersCount', header: 'Retailers', align: 'center', render: (r) => <span className="font-semibold">{r.retailersCount}</span> },
        { key: 'volume', header: 'Total Volume', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.volume)}</span> },
        { key: 'commission', header: 'Earned Commission', align: 'right', render: (r) => <span className="font-bold text-emerald-600 font-mono">+{formatCurrency(r.commission)}</span> },
        { key: 'accountStatus', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.accountStatus} size="sm" /> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r) => r.id} isLoading={isLoading} />;
    }

    if (activeTab === 'ret-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'code', header: 'Retailer Code', render: (r) => <span className="font-mono font-bold text-indigo-600">{r.code}</span> },
        { key: 'name', header: 'Retailer Name', render: (r) => <span className="font-semibold text-slate-900">{r.name}</span> },
        { key: 'parentName', header: 'Parent Distributor', render: (r) => <span className="text-slate-700">{r.parentName}</span> },
        { key: 'planName', header: 'Plan', render: (r) => <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium text-xs border border-amber-200">{r.planName}</span> },
        { key: 'volume', header: 'Volume', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.volume)}</span> },
        { key: 'accountStatus', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.accountStatus} size="sm" /> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r) => r.id} isLoading={isLoading} />;
    }

    if (activeTab === 'comm-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'transactionRef', header: 'Txn Ref', render: (r) => <span className="font-mono font-bold text-indigo-600">{r.transactionRef}</span> },
        { key: 'retailerName', header: 'Retailer', render: (r) => <span className="font-semibold text-slate-900">{r.retailerName}</span> },
        { key: 'distributorName', header: 'Distributor', render: (r) => <span className="text-slate-700">{r.distributorName}</span> },
        { key: 'amount', header: 'Txn Amount', align: 'right', render: (r) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.amount)}</span> },
        { key: 'rate', header: 'MD Rate', align: 'center', render: (r) => <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100">{r.rate}</span> },
        { key: 'commission', header: 'MD Commission', align: 'right', render: (r) => <span className="font-bold text-emerald-600 font-mono">+{formatCurrency(r.commission)}</span> },
        { key: 'status', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.status === 'CREDITED' ? 'SUCCESS' : 'PENDING'} label={r.status} size="sm" /> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r, i) => String(i)} isLoading={isLoading} />;
    }

    if (activeTab === 'wallet-report') {
      const columns: ColumnDefinition<any>[] = [
        { key: 'reference', header: 'Reference', render: (r) => <span className="font-mono font-bold text-indigo-600">{r.reference}</span> },
        { key: 'type', header: 'Entry Type', render: (r) => <span className="font-semibold text-slate-800">{r.type}</span> },
        { key: 'direction', header: 'Direction', align: 'center', render: (r) => <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.direction === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{r.direction}</span> },
        { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className={`font-bold font-mono ${r.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>{r.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(r.amount)}</span> },
        { key: 'balance', header: 'Closing Balance', align: 'right', render: (r) => <span className="font-mono font-semibold">{formatCurrency(r.balance)}</span> },
        { key: 'date', header: 'Date', render: (r) => <span className="text-slate-600 text-xs">{formatDateTime(r.date)}</span> },
      ];
      return <Table columns={columns} data={paginatedData} keyExtractor={(r, i) => String(i)} isLoading={isLoading} />;
    }

    return null;
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reportData.slice(start, start + pageSize);
  }, [reportData, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Network Reports & Analytics"
        description="Generate, inspect, and export network-scoped financial, transaction, distributor, retailer, and commission reports"
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
      />

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

      {/* Report Table */}
      <div className="space-y-4">
        {renderTable()}

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
    </div>
  );
}
