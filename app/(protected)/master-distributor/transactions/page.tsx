'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Transaction, Distributor, Retailer, TransactionFilters } from '@/types/domain';
import { transactionService } from '@/services/transactionService';
import { hierarchyService } from '@/services/hierarchyService';
import { reportService } from '@/services/reportService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { TransactionDetailsDrawer } from '@/components/features/transactions/TransactionDetailsDrawer';

// Financial Foundation Components
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { FinancialEmptyState } from '@/components/features/financial/FinancialEmptyState';
import { TransactionTypeBadge } from '@/components/features/financial/TransactionTypeBadge';

import {
  Search,
  Download,
  Eye,
  RefreshCw,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

function MasterDistributorTransactionsContent() {
  const { session, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'MASTER_DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const masterDistributorId = session?.entityId || 'md_001';

  // Read URL query parameters
  const initialType = searchParams.get('type') || 'ALL';
  const initialDst = searchParams.get('distributorId') || 'ALL';
  const initialRet = searchParams.get('retailerId') || 'ALL';

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [distributorFilter, setDistributorFilter] = useState(initialDst);
  const [retailerFilter, setRetailerFilter] = useState(initialRet);

  // Data & Pagination
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Transaction for Drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load Scoped Metadata & Transactions
  const loadData = async () => {
    setIsLoading(true);
    try {
      const dstList = hierarchyService.getMasterDistributorDistributors(masterDistributorId);
      setDistributors(dstList);

      const retList = hierarchyService.getMasterDistributorRetailers(masterDistributorId);
      setRetailers(retList);

      const filters: TransactionFilters = {
        type: typeFilter !== 'ALL' ? (typeFilter as any) : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        distributorId: distributorFilter !== 'ALL' ? distributorFilter : undefined,
        retailerId: retailerFilter !== 'ALL' ? retailerFilter : undefined,
        searchQuery: searchQuery || undefined,
      };

      const res = await transactionService.getTransactionsForMasterDistributor(
        masterDistributorId,
        filters,
        1,
        100
      );

      if (res.success && res.data) {
        setTransactions(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load scoped transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, masterDistributorId, typeFilter, statusFilter, distributorFilter, retailerFilter, searchQuery]);

  // Derived Summary Statistics
  const payInVolume = transactions
    .filter((t) => t.type === 'PAY_IN' && t.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const payOutVolume = transactions
    .filter((t) => t.type === 'PAY_OUT' && t.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalVolume = payInVolume + payOutVolume;
  const successCount = transactions.filter((t) => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const failedCount = transactions.filter((t) => t.status === 'FAILED').length;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, currentPage, pageSize]);

  const handleExportCsv = () => {
    const exportRows = transactions.map((t) => ({
      'Transaction ID': t.transactionRef,
      'Order ID': t.orderId || 'N/A',
      Type: t.type,
      Service: t.service || 'N/A',
      'Payment Mode': t.paymentMode,
      'Amount (₹)': t.amount,
      'Fee (₹)': t.fee,
      'GST (₹)': t.gst || 0,
      'Net Amount (₹)': t.netAmount,
      Status: t.status,
      Distributor: t.distributorName || 'N/A',
      Retailer: t.retailerName || t.customerName || 'N/A',
      'Date & Time': formatDateTime(t.createdAt),
    }));

    reportService.exportToCsv(`MD_Transactions_${masterDistributorId}`, exportRows);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setDistributorFilter('ALL');
    setRetailerFilter('ALL');
    setCurrentPage(1);
  };

  if (!isAuthorized) {
    return <AccessDeniedView message="You do not have authorization to view network transactions." />;
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Network Transactions"
          subtitle="Inspect Pay-In collections and Pay-Out disbursements across your Master Distributor agency network."
          statusBadge={<StatusBadge status="ACTIVE" label="MD Network Scope" />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              leftIcon={<Download className="w-4 h-4" />}
              disabled={transactions.length === 0}
            >
              Export
            </Button>
          }
        />

        {/* Compact Financial Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <FinancialMetricCard label="Total Volume" value={formatCurrency(totalVolume)} variant="primary" isDominant />
          <FinancialMetricCard label="Pay-In Volume" value={formatCurrency(payInVolume)} variant="payin" icon={<ArrowDownLeft className="w-3.5 h-3.5" />} />
          <FinancialMetricCard label="Pay-Out Volume" value={formatCurrency(payOutVolume)} variant="payout" icon={<ArrowUpRight className="w-3.5 h-3.5" />} />
          <FinancialMetricCard label="Successful" value={successCount} variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
          <FinancialMetricCard label="Pending" value={pendingCount} variant="warning" icon={<Clock className="w-3.5 h-3.5" />} />
          <FinancialMetricCard label="Failed" value={failedCount} variant="danger" icon={<AlertTriangle className="w-3.5 h-3.5" />} />
        </div>

        {/* Workspace Table Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Txn ID, Ref, Retailer, Distributor..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#2F6F5E] focus:ring-2 focus:ring-[#D4E1AE] bg-white"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Distributor Filter */}
              <select
                value={distributorFilter}
                onChange={(e) => {
                  setDistributorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:border-[#2F6F5E]"
              >
                <option value="ALL">All Distributors</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs">
                {(['ALL', 'PAY_IN', 'PAY_OUT'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeFilter(t);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      typeFilter === t
                        ? t === 'PAY_IN'
                          ? 'bg-[#2F6F5E] text-white shadow-2xs'
                          : t === 'PAY_OUT'
                          ? 'bg-[#F97316] text-white shadow-2xs'
                          : 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'ALL' ? 'All Types' : t === 'PAY_IN' ? 'Pay-In' : 'Pay-Out'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Refresh
              </Button>
              {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL' || distributorFilter !== 'ALL') && (
                <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<X className="w-3.5 h-3.5" />}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Table Surface (Scrolls internally) */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2F6F5E]" />
                <p>Loading network transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <FinancialEmptyState
                title="No network transactions found"
                description="No matching transaction records found for your Master Distributor network filters."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction / Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Distributor & Retailer</th>
                    <th className="py-3 px-4">Service & Mode</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedData.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedTx(t);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 group-hover:text-[#2F6F5E] transition-colors block">
                          {t.transactionRef}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDateTime(t.createdAt)}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TransactionTypeBadge type={t.type} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                          {t.retailerName || t.customerName || 'Retailer Counter'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          Distributor: {t.distributorName || 'Direct'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {t.service || (t.type === 'PAY_IN' ? 'Pay-In Collection' : 'Pay-Out Disbursement')}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{t.paymentMode}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(t.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={t.status} label={t.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTx(t);
                            setDrawerOpen(true);
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                Showing {paginatedData.length} of {transactions.length} items
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(transactions.length / pageSize)}
                totalItems={transactions.length}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>

        {/* Transaction Details Drawer */}
        <TransactionDetailsDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          transaction={selectedTx}
        />
      </div>
    </PageContainer>
  );
}

export default function MasterDistributorTransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading transactions...</div>}>
      <MasterDistributorTransactionsContent />
    </Suspense>
  );
}
