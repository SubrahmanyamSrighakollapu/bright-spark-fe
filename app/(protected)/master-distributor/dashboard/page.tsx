'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/context/AuthContext';
import {
  masterDistributorService,
  MasterDistributorDashboardSummary,
} from '@/services/masterDistributorService';

import { MasterDistributorHeader } from '@/components/features/master-distributor/MasterDistributorHeader';
import { MasterDistributorKPIGrid } from '@/components/features/master-distributor/MasterDistributorKPIGrid';
import { MasterDistributorCharts } from '@/components/features/master-distributor/MasterDistributorCharts';
import { MasterDistributorNetworkOverview } from '@/components/features/master-distributor/MasterDistributorNetworkOverview';
import { MasterDistributorRecentTransactions } from '@/components/features/master-distributor/MasterDistributorRecentTransactions';
import { MasterDistributorAttentionCard } from '@/components/features/master-distributor/MasterDistributorAttentionCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { walletService } from '@/services/walletService';

export default function MasterDistributorDashboardPage() {
  const { session } = useAuth();
  const targetMdId = session?.entityId || 'md_001';

  const [summary, setSummary] = useState<MasterDistributorDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toISOString());

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await masterDistributorService.getDashboardSummary(targetMdId);
      if (res.success && res.data) {
        const walletRes = await walletService.getMasterDistributorWallet(targetMdId);
        setSummary({ ...res.data, walletBalance: walletRes.data?.availableBalance ?? 0 });
        setError(null);
      } else {
        setError(res.message || 'Failed to load Master Distributor dashboard metrics.');
      }
    } catch {
      setError('An unexpected error occurred while fetching network metrics.');
    } finally {
      setIsLoading(false);
      setLastRefreshedAt(new Date().toISOString());
    }
  }, [targetMdId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading && !summary) {
    return (
      <PageContainer fullWidth className="space-y-6">
        <LoadingSkeleton variant="card" count={4} />
      </PageContainer>
    );
  }

  if (error || !summary) {
    return (
      <PageContainer fullWidth className="space-y-6">
        <ErrorState
          title="Master Distributor Dashboard Failed to Load"
          description={error || 'Could not resolve network metrics for your account.'}
          onRetry={loadDashboardData}
        />
      </PageContainer>
    );
  }

  const mdName = summary.masterDistributor?.name || session?.name || 'Master Distributor';
  const mdCode = summary.masterDistributor?.code || session?.entityId || 'MD001';
  const mdBusinessName = summary.masterDistributor?.businessName || 'Apex Financial Services Master';

  return (
    <PageContainer fullWidth className="space-y-6">
      {/* 1. Header Banner */}
      <MasterDistributorHeader
        name={mdName}
        code={mdCode}
        businessName={mdBusinessName}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* 2. Primary & Financial KPI Grids */}
      <MasterDistributorKPIGrid
        totalDistributors={summary.totalDistributors}
        totalRetailers={summary.totalRetailers}
        activeRetailers={summary.activeRetailers}
        pendingRetailerApprovals={summary.pendingRetailerApprovals}
        todayTransactionsCount={summary.todayTransactionsCount}
        todayPayInVolume={summary.todayPayInVolume}
        todayPayOutVolume={summary.todayPayOutVolume}
        walletBalance={summary.walletBalance}
        walletHold={summary.walletHold}
        todayCommission={summary.todayCommission}
        monthlyCommission={summary.monthlyCommission}
        isLoading={isLoading}
      />

      {/* 3. Recharts Trend Visualization */}
      <MasterDistributorCharts trendData={summary.trendData} isLoading={isLoading} />

      {/* 4. Network Overview & Top Distributors Table */}
      <MasterDistributorNetworkOverview
        totalDistributors={summary.totalDistributors}
        totalRetailers={summary.totalRetailers}
        activeRetailers={summary.activeRetailers}
        pendingRetailerApprovals={summary.pendingRetailerApprovals}
        rejectedRetailers={summary.rejectedRetailers}
        topDistributors={summary.topDistributors}
        isLoading={isLoading}
      />

      {/* 5. Requires Attention & Recent Activity Feed */}
      <MasterDistributorAttentionCard
        attentionItems={summary.attentionItems}
        activityFeed={summary.networkActivity}
      />

      {/* 6. Recent Scoped Network Transactions */}
      <MasterDistributorRecentTransactions
        transactions={summary.recentTransactions}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
