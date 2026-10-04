'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { transactionService } from '@/services/transactionService';
import { reportService } from '@/services/reportService';
import { Transaction, TransactionFilters } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { TransactionDetailsDrawer } from '@/components/features/transactions/TransactionDetailsDrawer';
import { PayInReceipt } from '@/components/features/retailer/PayInReceipt';
import { PayOutReceipt } from '@/components/features/retailer/PayOutReceipt';
import { Pagination } from '@/components/ui/Pagination';

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
  Printer,
  X,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function RetailerTransactionsPage() {
  const { session } = useAuth();
  const searchParams = useSearchParams();

  const retailerId = session?.entityId || 'ret_001';

  // Read URL params
  const typeParam = searchParams.get('type') || 'ALL';
  const txnIdParam = searchParams.get('transactionId') || '';

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState(txnIdParam);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PAY_IN' | 'PAY_OUT'>(typeParam as any);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer State
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Receipt Modal State
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  // Load Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filters: TransactionFilters = {
        type: typeFilter,
        status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
        searchQuery: searchQuery.trim() || undefined,
      };

      const res = await transactionService.getTransactionsForRetailer(retailerId, filters, page, pageSize);
      if (res.success && res.data) {
        setTransactions(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [retailerId, typeFilter, statusFilter, page, searchQuery]);

  // Deep-link auto-open drawer if transactionId is passed
  useEffect(() => {
    if (txnIdParam) {
      transactionService.getTransactionByIdForRetailer(retailerId, txnIdParam).then((res) => {
        if (res.success && res.data) {
          setSelectedTxn(res.data);
          setIsDrawerOpen(true);
        }
      });
    }
  }, [txnIdParam, retailerId]);

  // KPI Calculations derived strictly from current scoped transactions dataset
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

  // CSV Export
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
      'UTR / Ref': t.utr || t.referenceId || 'N/A',
      'Customer / Beneficiary': t.customerName || t.beneficiaryName || 'N/A',
      'Account / Mobile': t.accountNumberMasked || t.customerMobile || 'N/A',
      'Date & Time': formatDateTime(t.createdAt),
    }));

    reportService.exportToCsv(`Retailer_Transactions_${retailerId}`, exportRows);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Transactions"
          subtitle="Track Pay-In collections and Pay-Out disbursements from your Retailer account."
          statusBadge={<StatusBadge status="ACTIVE" label="Approved Retailer" />}
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
          <FinancialMetricCard
            label="Total Volume"
            value={formatCurrency(totalVolume)}
            variant="primary"
            isDominant
          />
          <FinancialMetricCard
            label="Pay-In Volume"
            value={formatCurrency(payInVolume)}
            variant="payin"
            icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
          />
          <FinancialMetricCard
            label="Pay-Out Volume"
            value={formatCurrency(payOutVolume)}
            variant="payout"
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
          />
          <FinancialMetricCard
            label="Successful"
            value={successCount}
            variant="success"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          />
          <FinancialMetricCard
            label="Pending"
            value={pendingCount}
            variant="warning"
            icon={<Clock className="w-3.5 h-3.5" />}
          />
          <FinancialMetricCard
            label="Failed / Reversed"
            value={failedCount}
            variant="danger"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Filter Toolbar & Data Workspace */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search Txn ID, Mobile, Ref, Beneficiary..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81] focus:ring-2 focus:ring-indigo-100 bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs">
                {(['ALL', 'PAY_IN', 'PAY_OUT'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeFilter(t);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      typeFilter === t
                        ? t === 'PAY_IN'
                          ? 'bg-[#0F4C81] text-white shadow-2xs'
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

              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:border-[#0F4C81]"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTransactions}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-slate-500"
              >
                Refresh
              </Button>

              {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Transactions Table Surface (with internal overflow scrolling) */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0F4C81]" />
                <p>Loading transaction history...</p>
              </div>
            ) : transactions.length === 0 ? (
              <FinancialEmptyState
                title="No transactions found"
                description="No matching transaction records found for the selected filter parameters."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction / Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Service & Mode</th>
                    <th className="py-3 px-4">Customer / Beneficiary</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Fee / GST</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map((t) => {
                    const isPayIn = t.type === 'PAY_IN';
                    const customerOrBeneficiary = isPayIn
                      ? t.customerName || t.customerMobile || 'Walk-in Customer'
                      : t.beneficiaryName || t.accountNumberMasked || 'N/A';

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedTxn(t);
                          setIsDrawerOpen(true);
                        }}
                      >
                        {/* Transaction ID & Date */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-[#0F4C81] transition-colors block">
                            {t.transactionRef}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDateTime(t.createdAt)}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <TransactionTypeBadge type={t.type} size="sm" />
                        </td>

                        {/* Service & Mode */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {t.service || (isPayIn ? 'Pay-In Collection' : 'Pay-Out Disbursement')}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{t.paymentMode}</span>
                        </td>

                        {/* Customer / Beneficiary */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                            {customerOrBeneficiary}
                          </span>
                          {isPayIn && t.customerMobile && (
                            <span className="font-mono text-[11px] text-slate-500">{t.customerMobile}</span>
                          )}
                          {!isPayIn && t.accountNumberMasked && (
                            <span className="font-mono text-[11px] text-slate-500">
                              {t.accountNumberMasked}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <span className="font-bold text-slate-900 text-sm block">
                            {formatCurrency(t.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400">Net: {formatCurrency(t.netAmount)}</span>
                        </td>

                        {/* Fee / GST */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          <span>{formatCurrency(t.fee || 0)}</span>
                          {t.gst ? (
                            <span className="block text-[10px] text-slate-400">+GST {formatCurrency(t.gst)}</span>
                          ) : null}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <StatusBadge status={t.status} label={t.status} size="sm" />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTxn(t);
                                setIsDrawerOpen(true);
                              }}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                            >
                              Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReceiptTxn(t)}
                              leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
                              title="Print Receipt"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                Showing {transactions.length} of {totalItems} items
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>

        {/* Transaction Details Drawer */}
        <TransactionDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          transaction={selectedTxn}
          onRefresh={fetchTransactions}
        />

        {/* Receipt Modal */}
        {receiptTxn && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto relative">
              <button
                type="button"
                onClick={() => setReceiptTxn(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              {receiptTxn.type === 'PAY_IN' ? (
                <PayInReceipt
                  transaction={receiptTxn}
                  retailerName={session?.name || 'Metro Store #01'}
                  retailerCode={session?.entityId || 'RET001'}
                  businessName="Metro Store Retail Solutions"
                />
              ) : (
                <PayOutReceipt
                  transaction={receiptTxn}
                  retailerName={session?.name || 'Metro Store #01'}
                  retailerCode={session?.entityId || 'RET001'}
                  businessName="Metro Store Retail Solutions"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
