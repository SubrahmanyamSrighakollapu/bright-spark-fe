'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Transaction } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';
import { transactionService } from '@/services/transactionService';
import { walletService } from '@/services/walletService';
import { ApiError } from '@/services/apiClient';
import { mockTransactions } from '@/mocks/mockTransactions';
import {
  retailerDashboardService,
  RetailerDashboardSummary,
} from '@/services/retailerDashboardService';

import { RetailerPayInPayOutOverview } from '@/components/features/retailer/RetailerPayInPayOutOverview';
import { RetailerKPIGrid } from '@/components/features/retailer/RetailerKPIGrid';
import { RetailerAttentionPanel } from '@/components/features/retailer/RetailerAttentionPanel';
import { RetailerQuickActions } from '@/components/features/retailer/RetailerQuickActions';
import { RetailerAnalyticsSection } from '@/components/features/retailer/RetailerAnalyticsSection';
import { RetailerRecentTransactions } from '@/components/features/retailer/RetailerRecentTransactions';
import { RetailerPaymentMethodDrawer } from '@/components/features/retailer/RetailerPaymentMethodDrawer';
import { RetailerTickerAndNoticeBar } from '@/components/features/retailer/RetailerTickerAndNoticeBar';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';

import Link from 'next/link';
import { RefreshCw, Wallet, Lock } from 'lucide-react';

const createStaticRetailerSummary = (
  retailerId: string,
  name?: string,
): RetailerDashboardSummary => {
  const recentTransactions = mockTransactions.slice(0, 6);

  return {
    retailer: {
      id: retailerId,
      code: 'RET001',
      masterDistributorId: 'md_001',
      distributorId: 'dst_001',
      userId: 'usr_ret_01',
      planId: 'plan_std_01',
      name: name || 'Metro Store #01',
      businessName: 'Metro Store Retail Solutions',
      email: 'retailer@brightspark.com',
      mobile: '9876545342',
      kycStatus: 'APPROVED',
      approvalStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      walletId: `wlt_${retailerId}`,
      createdByUserId: 'usr_dst_01',
      createdByRole: 'DISTRIBUTOR',
      createdByEntityId: 'dst_001',
      createdAt: '2026-01-15T09:30:00.000Z',
    },
    parentDistributor: { id: 'dst_001', code: 'DST001', name: 'North Zone Distributors' },
    parentMasterDistributor: { id: 'md_001', code: 'MD001', name: 'Apex National Network' },
    wallet: {
      walletId: `wlt_${retailerId}`,
      entityId: retailerId,
      entityType: 'RETAILER',
      entityName: name || 'Metro Store #01',
      entityCode: 'RET001',
      availableBalance: 45350,
      ledgerBalance: 46350,
      holdBalance: 1000,
      pendingSettlement: 0,
      currency: 'INR',
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    },
    transactionSummary: {
      todayCount: 21,
      todayPayInVolume: 12400,
      todayPayOutVolume: 8000,
      successfulCount: 18,
      pendingCount: 2,
      failedCount: 1,
      successRate: 94.7,
    },
    commissionSummary: {
      todayCommission: 345.5,
      yesterdayCommission: 280,
      thisMonthCommission: 6450,
      previousMonthCommission: 5800,
      pendingCommission: 45,
      creditedCommission: 6405,
    },
    trendData: [
      { date: 'Aug 29', payInVolume: 8500, payOutVolume: 4200, transactionsCount: 12 },
      { date: 'Aug 30', payInVolume: 11200, payOutVolume: 6100, transactionsCount: 16 },
      { date: 'Aug 31', payInVolume: 9400, payOutVolume: 5000, transactionsCount: 14 },
      { date: 'Sep 01', payInVolume: 13500, payOutVolume: 7800, transactionsCount: 21 },
      { date: 'Sep 02', payInVolume: 10800, payOutVolume: 5500, transactionsCount: 15 },
      { date: 'Sep 03', payInVolume: 14200, payOutVolume: 9100, transactionsCount: 24 },
      { date: 'Today', payInVolume: 12400, payOutVolume: 8000, transactionsCount: 21 },
    ],
    recentTransactions,
    attentionItems: [
      {
        id: 'att_txn_failed',
        title: '1 Failed Transaction Today',
        description: 'Inspect the transaction details for the failure reason and provider response.',
        type: 'WARNING',
        actionText: 'View Transactions',
        actionUrl: '/retailer/transactions',
      },
    ],
  };
};

export default function RetailerDashboardPage() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<RetailerDashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Time Period Filter State
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d'>('today');

  // Interactive Payment Method Drill-Down Drawer State
  const [drillDownType, setDrillDownType] = useState<'PAY_IN' | 'PAY_OUT' | null>(null);

  const retailerId = session?.entityId || 'ret_001';

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Dashboard Summary
      const summaryRes = await retailerDashboardService.getDashboardSummary(retailerId);
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        setSummary(createStaticRetailerSummary(retailerId, session?.name));
      }

      // 2. Fetch Detailed Retailer Transactions Pool for Analytics
      const txRes = await transactionService.getTransactionsForRetailer(retailerId, {}, 1, 100);
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data.items || []);
      } else {
        setTransactions(mockTransactions);
      }
    } catch (err: unknown) {
      // Dashboard/transaction APIs are still being built. Keep the completed UI
      // usable with demo data for unavailable endpoints, without masking auth errors.
      if (!(err instanceof ApiError) || ![401, 403].includes(err.statusCode)) {
        const staticSummary = createStaticRetailerSummary(retailerId, session?.name);
        try {
          const walletRes = await walletService.getRetailerWallet(retailerId);
          if (walletRes.success && walletRes.data) staticSummary.wallet = walletRes.data;
        } catch {
          // Keep the static wallet only while the wallet API is unavailable.
        }
        setSummary(staticSummary);
        setTransactions(mockTransactions);
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [retailerId]);

  if (error) {
    return (
      <PageContainer title="Retailer Dashboard">
        <ErrorState
          title="Unable to load Retailer Operations Center"
          description={error}
          onRetry={loadDashboard}
        />
      </PageContainer>
    );
  }

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const retailerName = summary?.retailer?.name || session?.name || 'Metro Store #01';
  const retailerCode = summary?.retailer?.code || session?.entityId || 'RET001';
  const businessName = summary?.retailer?.businessName || 'Metro Store Retail Solutions';
  const walletAvailable = summary?.wallet?.availableBalance ?? 0;
  const walletHold = summary?.wallet?.holdBalance ?? 0;
  const walletLedger = summary?.wallet?.ledgerBalance ?? (walletAvailable + walletHold);

  const periodLabel = selectedPeriod === 'today' ? "Today" : selectedPeriod === '7d' ? "7 Days" : "30 Days";

  return (
    <PageContainer
      title={`${getTimeOfDayGreeting()}, ${retailerName}!`}
      description="Here's your real-time Pay-In & Pay-Out business overview."
      statusBadge={<StatusBadge status={summary?.retailer?.kycStatus || 'APPROVED'} label={`KYC ${summary?.retailer?.kycStatus || 'APPROVED'}`} />}
    >
      <div className="space-y-5">
        {/* 1. Compact Header / Date Filter / Balance Bar */}
        <div className="relative z-30 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/60 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:px-6">
          <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-extrabold text-white shadow-lg shadow-emerald-900/20">
                BSP
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate">
                    {businessName}
                  </h2>
                  <span className="text-[11px] font-mono font-bold text-slate-500">({retailerCode})</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>Distributor: <strong className="text-slate-700">{summary?.parentDistributor?.name || 'North Zone'}</strong></span>
                  <span>•</span>
                  <span>Master: <strong className="text-slate-700">{summary?.parentMasterDistributor?.name || 'Apex Network'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
              {/* Standardized Date Range Filter Dropdown */}
              <DateRangeDropdown
                value={selectedPeriod}
                onChange={(val) => {
                  if (val.preset === 'today' || val.preset === '7d' || val.preset === '30d') {
                    setSelectedPeriod(val.preset);
                  } else if (val.preset === 'yesterday') {
                    setSelectedPeriod('today');
                  } else {
                    setSelectedPeriod('30d');
                  }
                }}
                size="sm"
              />

              {/* Live Wallet Balance & Hold Pills */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/90 px-3 py-1 rounded-lg text-xs">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-emerald-800 tracking-wider block leading-none">
                      Available Balance
                    </span>
                    <span className="font-mono font-extrabold text-emerald-950 text-xs tabular-nums block mt-0.5">
                      {formatCurrency(walletAvailable)}
                    </span>
                  </div>
                </div>

                {walletHold > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50/90 border border-amber-200/90 px-3 py-1 rounded-lg text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-amber-800 tracking-wider block leading-none">
                        On Hold / Lien
                      </span>
                      <span className="font-mono font-extrabold text-amber-950 text-xs tabular-nums block mt-0.5">
                        {formatCurrency(walletHold)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboard}
                isLoading={isLoading}
                title="Refresh telemetry"
                className="h-8 px-2.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Security Hold Notice Banner */}
        {walletHold > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                <Lock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="font-extrabold text-amber-950 flex items-center gap-2 flex-wrap">
                  <span>Security Hold Active on Account</span>
                  <span className="font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                    {formatCurrency(walletHold)} Reserved
                  </span>
                </div>
                <p className="mt-0.5 text-amber-800">
                  An administrative hold of <strong>{formatCurrency(walletHold)}</strong> is currently active on your account. Your spendable available balance is <strong>{formatCurrency(walletAvailable)}</strong> out of <strong>{formatCurrency(walletLedger)}</strong> total ledger balance.
                </p>
              </div>
            </div>

            <Link href="/retailer/wallet">
              <Button size="sm" variant="outline" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 font-bold shrink-0">
                View Wallet Statement
              </Button>
            </Link>
          </div>
        )}

        {/* Real-time Ticker & Notice Board Bar */}
        <RetailerTickerAndNoticeBar />

        {/* 2. PRIMARY DASHBOARD HERO CONTENT: Pay-In & Pay-Out Analytics Cards (Directly Visible Above Fold) */}
        <div className="relative z-0">
          <RetailerPayInPayOutOverview
            transactions={transactions.length > 0 ? transactions : (summary?.recentTransactions || [])}
            selectedPeriod={selectedPeriod}
            onOpenDrillDown={(type) => setDrillDownType(type)}
            isLoading={isLoading}
          />
        </div>

        {/* 3. COMPACT BUSINESS SUMMARY STRIP */}
        <div>
          {summary && (
            <RetailerKPIGrid summary={summary} isLoading={isLoading} />
          )}
        </div>

        {/* 4. NEEDS ATTENTION (65-70%) & QUICK ACTIONS (30-35%) ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-full">
            {summary && (
              <RetailerAttentionPanel
                attentionItems={summary.attentionItems}
                isLoading={isLoading}
              />
            )}
          </div>
          <div className="lg:col-span-4 h-full">
            <RetailerQuickActions />
          </div>
        </div>

        {/* 5. 7-DAY TRANSACTION TREND CHART */}
        <div>
          {summary && (
            <RetailerAnalyticsSection
              trendData={summary.trendData}
              transactionSummary={summary.transactionSummary}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* 6. RECENT TRANSACTIONS TABLE */}
        <div>
          {summary && (
            <RetailerRecentTransactions
              transactions={summary.recentTransactions}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Interactive Payment Method Breakdown Drill-Down Drawer */}
      {drillDownType && (
        <RetailerPaymentMethodDrawer
          isOpen={Boolean(drillDownType)}
          onClose={() => setDrillDownType(null)}
          type={drillDownType}
          periodLabel={periodLabel}
          transactions={transactions.length > 0 ? transactions : (summary?.recentTransactions || [])}
        />
      )}
    </PageContainer>
  );
}
