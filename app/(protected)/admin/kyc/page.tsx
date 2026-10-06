'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { KPICard } from '@/components/ui/KPICard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useModal } from '@/hooks/useModal';
import { kycService, KYCListResult } from '@/services/kycService';
import { KYCApplication, PaginationState } from '@/types/domain';
import { KYCTable } from '@/components/features/kyc/KYCTable';
import { KYCReviewDrawer } from '@/components/features/kyc/KYCReviewDrawer';
import { ShieldCheck, Clock, CheckCircle2, XCircle, UserPlus } from 'lucide-react';

export default function KYCPage() {
  const [data, setData] = useState<KYCListResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const reviewDrawer = useModal<KYCApplication>();

  const fetchKYC = useCallback(
    async (status = 'ALL', page = 1, pageSize = 10) => {
      setIsLoading(true);
      try {
        const res = await kycService.getKYCApplications(status, page, pageSize);
        if (res.success && res.data) {
          setData(res.data);
          setPagination(res.data.pagination);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let isCancelled = false;
    kycService.getKYCApplications(statusFilter, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [statusFilter, pagination.page, pagination.pageSize]);

  const items = data?.items || [];
  const pendingCount = items.filter((a) => a.status === 'PENDING').length;
  const reviewCount = items.filter((a) => a.status === 'UNDER_REVIEW').length;
  const approvedCount = items.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = items.filter((a) => a.status === 'REJECTED').length;

  return (
    <PageContainer
      title="KYC Applications & Verification"
      description="Review retailer and distributor KYC documents, identity proofs and risk profiles."
      actions={
        <Link href="/admin/kyc/onboarding">
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
            Retailer Onboarding Module
          </Button>
        </Link>
      }
      className="space-y-6"
    >
      {/* 1. Summary Cards */}
      {isLoading ? (
        <LoadingSkeleton variant="kpi" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Pending Applications"
            value={pendingCount.toLocaleString('en-IN')}
            accentColor="gold"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
          />
          <KPICard
            title="Under Review"
            value={reviewCount.toLocaleString('en-IN')}
            accentColor="blue"
            icon={<ShieldCheck className="w-5 h-5 text-[var(--primary)]" />}
          />
          <KPICard
            title="Approved KYC"
            value={approvedCount.toLocaleString('en-IN')}
            accentColor="green"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          />
          <KPICard
            title="Rejected Applications"
            value={rejectedCount.toLocaleString('en-IN')}
            accentColor="red"
            icon={<XCircle className="w-5 h-5 text-rose-600" />}
          />
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className="p-4 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] flex items-center justify-between gap-4">
        <Select
          label="Filter by KYC Status"
          value={statusFilter}
          onChange={(e) => {
            setIsLoading(true);
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'UNDER_REVIEW', label: 'Under Review' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
          className="max-w-xs"
        />

        <div className="text-xs text-slate-500 font-medium">
          Showing {items.length} application{items.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* 3. KYC Table */}
      <KYCTable
        applications={items}
        pagination={pagination}
        onPageChange={(page) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page }));
        }}
        onPageSizeChange={(pageSize) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page: 1, pageSize }));
        }}
        onReview={(app) => reviewDrawer.open(app)}
        isLoading={isLoading}
      />

      {/* 4. KYC Review Drawer */}
      <KYCReviewDrawer
        isOpen={reviewDrawer.isOpen}
        onClose={reviewDrawer.close}
        application={reviewDrawer.data}
        onRefresh={() => fetchKYC(statusFilter, pagination.page, pagination.pageSize)}
      />
    </PageContainer>
  );
}
