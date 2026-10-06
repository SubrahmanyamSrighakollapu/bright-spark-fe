'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ledgerService } from '@/services/ledgerService';
import { walletService } from '@/services/walletService';
import { reportService } from '@/services/reportService';
import { LedgerEntry, LedgerFilters } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { LedgerDetailsDrawer } from '@/components/features/wallet/LedgerDetailsDrawer';
import { Pagination } from '@/components/ui/Pagination';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';

// Financial Foundation Components
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { FinancialEmptyState } from '@/components/features/financial/FinancialEmptyState';

import {
  BookOpen,
  Search,
  Download,
  Eye,
  RefreshCw,
  X,
  Wallet,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function RetailerLedgerPage() {
  const { session } = useAuth();

  const retailerId = session?.entityId || 'ret_001';

  // State
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [availableBalance, setAvailableBalance] = useState(45350);
  const [holdBalance, setHoldBalance] = useState(1000);
  const [ledgerBalance, setLedgerBalance] = useState(46350);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [movementFilter, setMovementFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<any>({ preset: '7d' });

  // Detail Drawer State
  const [selectedLedger, setSelectedLedger] = useState<LedgerEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const [ledRes, wltRes] = await Promise.all([
        ledgerService.getRetailerLedger(
          retailerId,
          {
            direction: directionFilter !== 'ALL' ? directionFilter : undefined,
            entryType: movementFilter !== 'ALL' ? (movementFilter as any) : undefined,
            searchQuery: searchQuery.trim() || undefined,
          },
          page,
          pageSize
        ),
        walletService.getRetailerWallet(retailerId),
      ]);

      if (ledRes.success && ledRes.data) {
        setEntries(ledRes.data.items);
        setTotalPages(ledRes.data.pagination.totalPages);
        setTotalItems(ledRes.data.pagination.totalItems);
      }

      if (wltRes.success && wltRes.data) {
        setAvailableBalance(wltRes.data.availableBalance);
        setHoldBalance(wltRes.data.holdBalance);
        setLedgerBalance(wltRes.data.ledgerBalance);
      }
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [retailerId, directionFilter, movementFilter, page, searchQuery]);

  // CSV Export
  const handleExportCsv = () => {
    const exportRows = entries.map((e) => ({
      'Ledger ID': e.id,
      'Wallet ID': e.walletId,
      'Reference ID': e.referenceId || e.transactionId || 'SYSTEM',
      'Movement Type': e.entryType,
      Direction: e.direction,
      'Opening Balance (₹)': e.openingBalance,
      'Amount (₹)': e.amount,
      'Closing Balance (₹)': e.closingBalance,
      Description: e.description,
      'Created At': formatDateTime(e.createdAt),
    }));

    reportService.exportToCsv(`Retailer_Ledger_${retailerId}`, exportRows);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDirectionFilter('ALL');
    setMovementFilter('ALL');
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Wallet Ledger"
          subtitle="Review immutable movements affecting your Retailer operating wallet."
          statusBadge={<StatusBadge status="ACTIVE" label="Immutable Record" />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              leftIcon={<Download className="w-4 h-4" />}
              disabled={entries.length === 0}
            >
              Export
            </Button>
          }
        />

        {/* Compact Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FinancialMetricCard
            label="Available Balance"
            value={formatCurrency(availableBalance)}
            variant="payin"
            icon={<Wallet className="w-3.5 h-3.5 text-[#0F4C81]" />}
            subtext="Spendable wallet funds"
            isDominant
          />
          <FinancialMetricCard
            label="Hold / Lien Balance"
            value={formatCurrency(holdBalance)}
            variant="warning"
            icon={<Lock className="w-3.5 h-3.5 text-amber-600" />}
            subtext="Reserved for clearance"
          />
          <FinancialMetricCard
            label="Total Ledger Balance"
            value={formatCurrency(ledgerBalance)}
            variant="primary"
            icon={<BookOpen className="w-3.5 h-3.5 text-slate-700" />}
            subtext="Available + Hold total"
          />
        </div>

        {/* Ledger Table Workspace */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Controls Bar */}
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
                  placeholder="Search Ledger ID, Ref, Description..."
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

              {/* Direction Filter */}
              <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs">
                {(['ALL', 'CREDIT', 'DEBIT'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDirectionFilter(d);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      directionFilter === d
                        ? d === 'CREDIT'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : d === 'DEBIT'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d === 'ALL' ? 'All Directions' : d}
                  </button>
                ))}
              </div>

              {/* Movement Type Filter */}
              <select
                value={movementFilter}
                onChange={(e) => {
                  setMovementFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:border-[#0F4C81]"
              >
                <option value="ALL">All Movements</option>
                <option value="PAY_IN">PAY_IN (Collection)</option>
                <option value="PAY_OUT">PAY_OUT (Disbursement)</option>
                <option value="COMMISSION">COMMISSION (Earnings)</option>
                <option value="HOLD">HOLD (Reserved)</option>
                <option value="RELEASE">RELEASE (Clearance)</option>
                <option value="REVERSAL">REVERSAL</option>
                <option value="SETTLEMENT">SETTLEMENT</option>
              </select>

              {/* Date Filter */}
              <DateRangeDropdown
                value={dateRange}
                onChange={(val) => {
                  setDateRange(val);
                  setPage(1);
                }}
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchLedger}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-slate-500"
              >
                Refresh
              </Button>

              {(searchQuery || directionFilter !== 'ALL' || movementFilter !== 'ALL') && (
                <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<X className="w-3.5 h-3.5" />}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Table Surface (Scrolls internally) */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0F4C81]" />
                <p>Loading ledger entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <FinancialEmptyState
                title="No ledger activity found"
                description="Wallet movements will appear here after transactions are processed."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Ledger ID / Date</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Movement</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Credit / Debit</th>
                    <th className="py-3 px-4 text-right">Balance After</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {entries.map((e) => {
                    const isCredit = e.direction === 'CREDIT';
                    return (
                      <tr
                        key={e.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedLedger(e);
                          setIsDrawerOpen(true);
                        }}
                      >
                        {/* Ledger ID / Date */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 group-hover:text-[#0F4C81] transition-colors block">
                            {e.id}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDateTime(e.createdAt)}
                          </span>
                        </td>

                        {/* Reference */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {e.referenceId || e.transactionId || 'SYSTEM'}
                        </td>

                        {/* Movement Badge */}
                        <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isCredit
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {e.entryType}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 font-sans text-slate-600 truncate max-w-[240px]">
                          {e.description}
                        </td>

                        {/* Credit / Debit Amount */}
                        <td className="py-3.5 px-4 text-right font-bold text-sm">
                          <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                            {isCredit ? '+' : '-'}{formatCurrency(e.amount)}
                          </span>
                        </td>

                        {/* Balance After */}
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                          {formatCurrency(e.closingBalance)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLedger(e);
                              setIsDrawerOpen(true);
                            }}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                Showing {entries.length} of {totalItems} entries
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>

        {/* Ledger Details Drawer */}
        <LedgerDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          entry={selectedLedger}
        />
      </div>
    </PageContainer>
  );
}
