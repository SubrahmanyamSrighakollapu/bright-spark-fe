'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { ColumnDefinition } from '@/types/common';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Transaction, Retailer } from '@/types/domain';
import { transactionService } from '@/services/transactionService';
import { retailerService } from '@/services/retailerService';
import { reportService } from '@/services/reportService';
import { TransactionDetailsDrawer } from '@/components/features/transactions/TransactionDetailsDrawer';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { TransactionTypeBadge } from '@/components/features/financial/TransactionTypeBadge';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react';

function DistributorTransactionsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';
  const initialRetailerId = searchParams.get('retailerId') || 'ALL';

  const { session } = useAuth();
  const { toastError, toastSuccess } = useToast();
  const distributorId = session?.entityId || 'dst_001';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedRetailer, setSelectedRetailer] = useState<string>(initialRetailerId);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Drawer State
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  useEffect(() => {
    setSelectedRetailer(initialRetailerId);
  }, [initialRetailerId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txRes, retRes] = await Promise.all([
        transactionService.getTransactionsForDistributor(distributorId, {}, 1, 100),
        retailerService.getRetailersForDistributor(distributorId),
      ]);

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data.items);
      }
      if (retRes.success && retRes.data) {
        setRetailers(retRes.data);
      }
    } catch (err) {
      console.error('Error loading distributor transactions:', err);
      toastError('Failed to load transaction data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [distributorId]);

  // Scoped Security Verification for Retailer Filter Parameter
  const isRetailerValid = useMemo(() => {
    if (selectedRetailer === 'ALL') return true;
    return retailers.some((r) => r.id === selectedRetailer);
  }, [selectedRetailer, retailers]);

  // KPI Calculations
  const summary = useMemo(() => {
    if (!isRetailerValid) {
      return { totalCount: 0, payinVol: 0, payoutVol: 0, successCount: 0, pendingCount: 0, failedCount: 0 };
    }

    const scoped = transactions.filter((t) => {
      if (selectedRetailer !== 'ALL' && t.retailerId !== selectedRetailer) return false;
      return true;
    });

    const totalCount = scoped.length;
    const payinVol = scoped.filter((t) => t.type === 'PAY_IN' && t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0);
    const payoutVol = scoped.filter((t) => t.type === 'PAY_OUT' && (t.status === 'SUCCESS' || t.status === 'PROCESSING')).reduce((s, t) => s + t.amount, 0);
    const successCount = scoped.filter((t) => t.status === 'SUCCESS').length;
    const pendingCount = scoped.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING').length;
    const failedCount = scoped.filter((t) => t.status === 'FAILED').length;

    return { totalCount, payinVol, payoutVol, successCount, pendingCount, failedCount };
  }, [transactions, selectedRetailer, isRetailerValid]);

  // Filtered Dataset
  const filteredTransactions = useMemo(() => {
    if (!isRetailerValid) return [];

    return transactions.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchRef = t.transactionRef.toLowerCase().includes(q);
        const matchUtr = t.utr && t.utr.toLowerCase().includes(q);
        const matchOrder = t.orderId && t.orderId.toLowerCase().includes(q);
        const matchRet = t.retailerName && t.retailerName.toLowerCase().includes(q);
        const matchCust = t.customerName && t.customerName.toLowerCase().includes(q);
        if (!matchRef && !matchUtr && !matchOrder && !matchRet && !matchCust) return false;
      }

      // 2. Type Filter
      if (selectedType !== 'ALL' && t.type !== selectedType) return false;

      // 3. Retailer Filter
      if (selectedRetailer !== 'ALL' && t.retailerId !== selectedRetailer) return false;

      // 4. Status Filter
      if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;

      // 5. Mode Filter
      if (selectedMode !== 'ALL' && t.paymentMode !== selectedMode) return false;

      return true;
    });
  }, [transactions, searchQuery, selectedType, selectedRetailer, selectedStatus, selectedMode, isRetailerValid]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      toastError('No records available to export.');
      return;
    }
    const exportRows = filteredTransactions.map((t) => ({
      TransactionRef: t.transactionRef,
      UTR: t.utr || '',
      Retailer: t.retailerName || t.merchantName,
      Type: t.type,
      Service: t.service,
      PaymentMode: t.paymentMode,
      Amount: t.amount,
      Fee: t.fee,
      GST: t.gst,
      Status: t.status,
      CreatedAt: t.createdAt,
    }));
    reportService.exportToCsv('distributor_transactions', exportRows);
  };

  const columns: ColumnDefinition<Transaction>[] = [
    {
      key: 'transactionRef',
      header: 'Transaction ID',
      render: (t: Transaction) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs text-blue-600">{t.transactionRef}</span>
          <span className="text-[10px] text-slate-400 font-mono">{t.utr || t.id}</span>
        </div>
      ),
    },
    {
      key: 'retailerName',
      header: 'Retailer Name',
      render: (t: Transaction) => (
        <span className="font-semibold text-slate-800 text-xs">{t.retailerName || t.merchantName}</span>
      ),
    },
    {
      key: 'service',
      header: 'Service Type',
      render: (t: Transaction) => (
        <span className="text-slate-600 text-xs font-medium">{t.service || t.paymentMode}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (t: Transaction) => <TransactionTypeBadge type={t.type} size="sm" />,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t: Transaction) => (
        <span className="font-mono font-bold text-slate-900 text-xs">{formatCurrency(t.amount)}</span>
      ),
    },
    {
      key: 'fee',
      header: 'Charges / Tax',
      align: 'right',
      render: (t: Transaction) => (
        <span className="font-mono text-slate-500 text-[11px]">
          {formatCurrency(t.fee + (t.gst || 0))}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t: Transaction) => <StatusBadge status={t.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Request Date',
      render: (t: Transaction) => <span className="font-mono text-slate-500 text-[11px]">{formatDateTime(t.createdAt)}</span>,
    },
  ];

  return (
    <PageContainer
      title="Transactions"
      description="Monitor Pay-In and Pay-Out transaction performance generated across your assigned retailer network."
      statusBadge={<StatusBadge status="ACTIVE" label="Retailer Network Scoped" />}
      actions={
        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCsv}>
          Export
        </Button>
      }
    >
      <div className="space-y-6">
        {!isRetailerValid && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Network Scoping:</span> Showing transactions from your assigned Retailer network.
            </div>
          </div>
        )}

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <FinancialMetricCard label="Today's Txns" value={summary.totalCount} subtext="Network requests" variant="neutral" />
          <FinancialMetricCard label="Today's Pay-In" value={formatCurrency(summary.payinVol)} subtext="Collections" variant="payin" />
          <FinancialMetricCard label="Today's Pay-Out" value={formatCurrency(summary.payoutVol)} subtext="Disbursements" variant="payout" />
          <FinancialMetricCard label="Successful" value={summary.successCount} subtext="Completed" variant="success" />
          <FinancialMetricCard label="Pending" value={summary.pendingCount} subtext="In flight" variant="warning" />
          <FinancialMetricCard label="Failed" value={summary.failedCount} subtext="Reversed / Failed" variant="danger" />
        </div>

        {/* 2. Filter Toolbar */}
        <Card noPadding>
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search transaction ID, UTR, order ID or retailer..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Types', value: 'ALL' },
                  { label: 'Pay-In (Collections)', value: 'PAY_IN' },
                  { label: 'Pay-Out (Disbursements)', value: 'PAY_OUT' },
                ]}
              />

              <Select
                value={selectedRetailer}
                onChange={(e) => {
                  setSelectedRetailer(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Retailers', value: 'ALL' },
                  ...retailers.map((r) => ({ label: `${r.name} (${r.code})`, value: r.id })),
                ]}
              />

              <Select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'SUCCESS', value: 'SUCCESS' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'PROCESSING', value: 'PROCESSING' },
                  { label: 'FAILED', value: 'FAILED' },
                ]}
              />

              <Select
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5"
                options={[
                  { label: 'All Modes', value: 'ALL' },
                  { label: 'UPI', value: 'UPI' },
                  { label: 'IMPS', value: 'IMPS' },
                  { label: 'NEFT', value: 'NEFT' },
                  { label: 'CARD', value: 'CARD' },
                ]}
              />

              <Button variant="outline" size="sm" onClick={loadData} title="Refresh Data">
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              </Button>
            </div>
          </div>

          {/* 3. Main Data Table */}
          {isLoading ? (
            <div className="p-5">
              <LoadingSkeleton variant="table" count={5} />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title="No Transactions Found"
              description="No transaction records matched your search and filter criteria."
              icon={<ArrowLeftRight className="w-8 h-8 text-slate-400" />}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('ALL');
                    setSelectedRetailer('ALL');
                    setSelectedStatus('ALL');
                    setSelectedMode('ALL');
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  data={paginatedTransactions}
                  columns={columns}
                  keyExtractor={(t: Transaction) => t.id}
                  renderActions={(t: Transaction) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTxn(t)}
                      title="View Transaction Details"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                    </Button>
                  )}
                />
              </div>

              <div className="p-4 border-t border-slate-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredTransactions.length}
                  pageSize={pageSize}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Transaction Details Drawer */}
      <TransactionDetailsDrawer
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </PageContainer>
  );
}

export default function DistributorTransactionsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" count={4} />}>
      <DistributorTransactionsContent />
    </Suspense>
  );
}
