'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/context/AuthContext';
import {
  distributorDashboardService,
  DistributorDashboardSummary,
} from '@/services/distributorDashboardService';
import { DistributorHeader } from '@/components/features/distributor/DistributorHeader';
import { DistributorKPIGrid } from '@/components/features/distributor/DistributorKPIGrid';
import { DistributorNetworkOverview } from '@/components/features/distributor/DistributorNetworkOverview';
import { DistributorTopRetailers } from '@/components/features/distributor/DistributorTopRetailers';
import { DistributorRecentTransactions } from '@/components/features/distributor/DistributorRecentTransactions';
import { DistributorAttentionCard } from '@/components/features/distributor/DistributorAttentionCard';
import { walletService } from '@/services/walletService';

export default function DistributorDashboardPage() {
  const { session } = useAuth();
  const distributorId = session?.entityId || 'dst_001';

  const [summary, setSummary] = useState<DistributorDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toISOString());

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await distributorDashboardService.getDashboardSummary(distributorId);
      if (res.success && res.data) {
        let walletBalance = res.data.walletBalance;
        try {
          const walletRes = await walletService.getDistributorWallet(distributorId);
          if (walletRes.success && walletRes.data) walletBalance = walletRes.data.availableBalance;
        } catch {
          // Keep the demo balance until the distributor wallet API is available.
        }
        setSummary({ ...res.data, walletBalance });
      } else {
        setError(res.error?.message || 'Failed to load distributor dashboard metrics.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading dashboard.';
      setError(message);
    } finally {
      setIsLoading(false);
      setLastRefreshedAt(new Date().toISOString());
    }
  }, [distributorId]);

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
          title="Distributor Dashboard Failed to Load"
          description={error || 'Could not resolve network metrics for your account.'}
          onRetry={loadDashboardData}
        />
      </PageContainer>
    );
  }

  const distName = summary.distributor?.name || session?.name || 'Assigned Distributor';
  const distCode = summary.distributor?.code || session?.entityId || 'DST';
  const businessName = summary.distributor?.businessName || 'Distributor Operations';
  const parentMdName = summary.parentMasterDistributor?.name || 'Master Distributor Network';
  const parentMdCode = summary.parentMasterDistributor?.code || 'MD';

  return (
    <PageContainer fullWidth className="space-y-6">
      {/* 1. Header Banner */}
      <DistributorHeader
        name={distName}
        code={distCode}
        businessName={businessName}
        parentMdName={parentMdName}
        parentMdCode={parentMdCode}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* 2. Primary Network & Financial KPI Strips */}
      <DistributorKPIGrid summary={summary} isLoading={isLoading} />

      {/* 3. Recharts Analytics */}
      <DistributorNetworkOverview trendData={summary.trendData} isLoading={isLoading} />

      {/* 4. Top Retailers & Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <DistributorTopRetailers topRetailers={summary.topRetailers} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-2">
          <DistributorRecentTransactions transactions={summary.recentTransactions} isLoading={isLoading} />
        </div>
      </div>

      {/* 5. Requires Attention & Recent Activity */}
      <DistributorAttentionCard
        attentionItems={summary.attentionItems}
        recentActivity={summary.recentActivity}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
