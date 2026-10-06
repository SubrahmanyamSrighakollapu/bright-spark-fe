'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { reportService, ReportListResult } from '@/services/reportService';
import { WalletAccount, BalanceReportSummary, AccountSummary, EntityType, ReportFilters, PaginationState } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { AdminReportNav } from '@/components/features/reports/AdminReportNav';
import { Search, Filter, RotateCcw, Eye, BookOpen, Layers } from 'lucide-react';

export default function BalanceReportPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACCOUNT_SUMMARY'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState<'ALL' | EntityType>('ALL');

  const [data, setData] = useState<ReportListResult<WalletAccount, BalanceReportSummary> | null>(null);
  const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = () => {
    setIsLoading(true);
    if (activeTab === 'OVERVIEW') {
      const filters: ReportFilters = { searchQuery, entityType };
      reportService.getBalanceReport(filters, pagination.page, pagination.pageSize).then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          setPagination(res.data.pagination);
        }
        setIsLoading(false);
      });
    } else {
      reportService.getAccountSummary().then((res) => {
        if (res.success && res.data) {
          setAccountSummaries(res.data);
        }
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (activeTab === 'OVERVIEW') {
      const filters: ReportFilters = { searchQuery, entityType };
      reportService.getBalanceReport(filters, pagination.page, pagination.pageSize).then((res) => {
        if (!isCancelled && res.success && res.data) {
          setData(res.data);
          setPagination(res.data.pagination);
          setIsLoading(false);
        }
      });
    } else {
      reportService.getAccountSummary().then((res) => {
        if (!isCancelled && res.success && res.data) {
          setAccountSummaries(res.data);
          setIsLoading(false);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [activeTab, searchQuery, entityType, pagination.page, pagination.pageSize]);

  const handleExportCsv = () => {
    if (activeTab === 'OVERVIEW') {
      if (!data?.items) return;
      const exportRows = data.items.map((w) => ({
        'Wallet ID': w.walletId,
        'Entity Name': w.entityName,
        'Entity Type': w.entityType,
        'Available Balance (INR)': w.availableBalance,
        'Ledger Balance (INR)': w.ledgerBalance,
        'Hold Balance (INR)': w.holdBalance,
        'Pending Settlement (INR)': w.pendingSettlement,
        'Status': w.status,
        'Last Updated': w.updatedAt,
      }));
      reportService.exportToCsv('Balance_Report', exportRows);
    } else {
      const exportRows = accountSummaries.map((a) => ({
        'Entity Name': a.entityName,
        'Entity Type': a.entityType,
        'Wallet ID': a.walletId,
        'Opening Balance (INR)': a.openingBalance,
        'Total Credits (INR)': a.totalCredits,
        'Total Debits (INR)': a.totalDebits,
        'Closing Balance (INR)': a.closingBalance,
        'Hold Balance (INR)': a.holdBalance,
        'Pending Settlement (INR)': a.pendingSettlement,
        'Txn Count': a.transactionCount,
        'Settlement Count': a.settlementCount,
      }));
      reportService.exportToCsv('Account_Summary_Report', exportRows);
    }
  };

  const summary = data?.summary || {
    totalAvailable: 0,
    totalLedger: 0,
    totalHold: 0,
    pendingSettlement: 0,
  };

  const overviewColumns = [
    {
      key: 'walletId',
      header: 'Wallet ID / Entity',
      render: (row: WalletAccount) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.walletId}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.entityCode}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Entity Name',
      render: (row: WalletAccount) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.entityName}</div>
          <div className="text-[11px] font-semibold text-purple-700">{row.entityType}</div>
        </div>
      ),
    },
    {
      key: 'availableBalance',
      header: 'Available Balance',
      align: 'right' as const,
      render: (row: WalletAccount) => (
        <span className="font-mono font-extrabold text-xs text-[var(--primary)]">
          {formatCurrency(row.availableBalance)}
        </span>
      ),
    },
    {
      key: 'ledgerBalance',
      header: 'Ledger Balance',
      align: 'right' as const,
      render: (row: WalletAccount) => (
        <span className="font-mono font-semibold text-xs text-slate-800">{formatCurrency(row.ledgerBalance)}</span>
      ),
    },
    {
      key: 'holdBalance',
      header: 'Hold Balance',
      align: 'right' as const,
      render: (row: WalletAccount) => (
        <span className={`font-mono text-xs ${row.holdBalance > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
          {formatCurrency(row.holdBalance)}
        </span>
      ),
    },
    {
      key: 'pendingSettlement',
      header: 'Pending Settlement',
      align: 'right' as const,
      render: (row: WalletAccount) => (
        <span className="font-mono text-xs text-amber-700 font-medium">{formatCurrency(row.pendingSettlement)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: WalletAccount) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (row: WalletAccount) => (
        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{formatDate(row.updatedAt)}</span>
      ),
    },
  ];

  const summaryColumns = [
    {
      key: 'entityName',
      header: 'Entity / Wallet',
      render: (row: AccountSummary) => (
        <div>
          <div className="font-semibold text-xs text-slate-900">{row.entityName}</div>
          <div className="text-[11px] font-mono text-slate-500">{row.walletId} ({row.entityType})</div>
        </div>
      ),
    },
    {
      key: 'openingBalance',
      header: 'Opening',
      align: 'right' as const,
      render: (row: AccountSummary) => (
        <span className="font-mono text-xs text-slate-600">{formatCurrency(row.openingBalance)}</span>
      ),
    },
    {
      key: 'totalCredits',
      header: 'Credits (+)',
      align: 'right' as const,
      render: (row: AccountSummary) => (
        <span className="font-mono text-xs text-emerald-700 font-semibold">+{formatCurrency(row.totalCredits)}</span>
      ),
    },
    {
      key: 'totalDebits',
      header: 'Debits (-)',
      align: 'right' as const,
      render: (row: AccountSummary) => (
        <span className="font-mono text-xs text-rose-700 font-semibold">-{formatCurrency(row.totalDebits)}</span>
      ),
    },
    {
      key: 'closingBalance',
      header: 'Closing Available',
      align: 'right' as const,
      render: (row: AccountSummary) => (
        <span className="font-mono font-extrabold text-xs text-slate-900">{formatCurrency(row.closingBalance)}</span>
      ),
    },
    {
      key: 'transactionCount',
      header: 'Txn / Settlement',
      align: 'center' as const,
      render: (row: AccountSummary) => (
        <span className="text-xs font-semibold text-purple-700">
          {row.transactionCount} txns • {row.settlementCount} sets
        </span>
      ),
    },
  ];

  return (
    <PageContainer
      title="Balance Report"
      description="Commercial entity wallet balance summaries, hold balance tracking, and account statement breakdowns."
      actions={
        <ReportExportMenu
          onExportCsv={handleExportCsv}
          reportTitle={activeTab === 'OVERVIEW' ? 'Balance Report' : 'Account Summary'}
        />
      }
    >
      <div className="space-y-6">
        {/* Reports Navigation Bar */}
        <AdminReportNav />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Available Balance</span>
            <div className="mt-1 font-mono font-extrabold text-base text-[var(--primary)]">{formatCurrency(summary.totalAvailable)}</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Liquid commercial funds</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Ledger Balance</span>
            <div className="mt-1 font-mono font-extrabold text-base text-slate-900">{formatCurrency(summary.totalLedger)}</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Gross ledger accounts</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Hold Balance</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-700">{formatCurrency(summary.totalHold)}</div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Restricted lien funds</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Pending Settlement</span>
            <div className="mt-1 font-mono font-extrabold text-base text-amber-700">{formatCurrency(summary.pendingSettlement)}</div>
            <span className="text-[11px] text-amber-600 block mt-0.5">Uncleared settlement funds</span>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('OVERVIEW');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Balance Overview Report
          </button>
          <button
            onClick={() => setActiveTab('ACCOUNT_SUMMARY')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ACCOUNT_SUMMARY'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Account Summary Breakdown</span>
          </button>
        </div>

        {/* Filter Bar */}
        {activeTab === 'OVERVIEW' && (
          <Card className="p-4 bg-white border border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadReport();
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Search Entity / Wallet"
                  placeholder="Search Wallet ID, Code, Entity Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />

                <Select
                  label="Entity Type"
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as 'ALL' | EntityType)}
                  options={[
                    { value: 'ALL', label: 'All Entity Types' },
                    { value: 'MASTER', label: 'Master Treasury' },
                    { value: 'DISTRIBUTOR', label: 'Distributor' },
                    { value: 'RETAILER', label: 'Retailer' },
                    { value: 'MERCHANT', label: 'Retailer' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Filtered data derived from centralized wallet balances.</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setEntityType('ALL');
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
        {activeTab === 'OVERVIEW' ? (
          <>
            <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
              <Table
                columns={overviewColumns}
                data={data?.items || []}
                keyExtractor={(row) => row.walletId}
                isLoading={isLoading}
                renderActions={(row) => (
                  <div className="flex items-center gap-1">
                    <Link href="/wallet/balances">
                      <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} title="View Wallet">
                        Wallet
                      </Button>
                    </Link>
                    <Link href={`/wallet/ledger?searchQuery=${row.walletId}`}>
                      <Button variant="outline" size="sm" className="px-2" title="View Financial Ledger">
                        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                    </Link>
                  </div>
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
          <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
            <Table
              columns={summaryColumns}
              data={accountSummaries}
              keyExtractor={(row) => row.entityId}
              isLoading={isLoading}
              renderActions={(row) => (
                <Link href={`/wallet/ledger?searchQuery=${row.walletId}`}>
                  <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                    Audit Statement
                  </Button>
                </Link>
              )}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
