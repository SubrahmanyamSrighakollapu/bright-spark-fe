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
import { RetailerCommissionSummary } from '@/components/features/retailer/RetailerCommissionSummary';
import { RetailerPaymentMethodDrawer } from '@/components/features/retailer/RetailerPaymentMethodDrawer';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';

import { RefreshCw, Wallet } from 'lucide-react';

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
        setError(summaryRes.error?.message || 'Failed to load retailer dashboard summary.');
      }

      // 2. Fetch Detailed Retailer Transactions Pool for Analytics
      const txRes = await transactionService.getTransactionsForRetailer(retailerId, {}, 1, 100);
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data.items || []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading dashboard.';
      setError(message);
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
  const walletBalance = summary?.wallet?.availableBalance || 45350.0;

  const periodLabel = selectedPeriod === 'today' ? "Today" : selectedPeriod === '7d' ? "7 Days" : "30 Days";

  return (
    <PageContainer
      title={`${getTimeOfDayGreeting()}, ${retailerName}!`}
      description="Here's your real-time Pay-In & Pay-Out business overview."
      statusBadge={<StatusBadge status={summary?.retailer?.kycStatus || 'APPROVED'} label={`KYC ${summary?.retailer?.kycStatus || 'APPROVED'}`} />}
    >
      <div className="space-y-5">
        {/* 1. Compact Header / Date Filter / Balance Bar */}
        <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/60 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:px-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-extrabold text-white shadow-lg shadow-emerald-900/20">
                QSP
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

              {/* Live Available Wallet Balance Pill */}
              <div className="flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/90 px-3 py-1 rounded-lg text-xs">
                <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-emerald-800 tracking-wider block leading-none">
                    Available Balance
                  </span>
                  <span className="font-mono font-extrabold text-emerald-950 text-xs tabular-nums block mt-0.5">
                    {formatCurrency(walletBalance)}
                  </span>
                </div>
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

        {/* 6. RECENT TRANSACTIONS TABLE & COMMISSION SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-full">
            {summary && (
              <RetailerRecentTransactions
                transactions={summary.recentTransactions}
                isLoading={isLoading}
              />
            )}
          </div>

          <div className="lg:col-span-4 h-full">
            {summary && (
              <RetailerCommissionSummary
                commissionSummary={summary.commissionSummary}
                planName={summary.plan?.name}
                isLoading={isLoading}
              />
            )}
          </div>
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
