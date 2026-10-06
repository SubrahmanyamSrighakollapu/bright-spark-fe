'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ColumnDefinition } from '@/types/common';
import { MerchantOnboardingApplication, PaginationState } from '@/types/domain';
import { onboardingService } from '@/services/onboardingService';
import { formatDate } from '@/utils/formatters';
import { UserPlus } from 'lucide-react';

export default function MerchantOnboardingListPage() {
  const [applications, setApplications] = useState<MerchantOnboardingApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    onboardingService.getOnboardingApplications(pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setApplications(res.data.items);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [pagination.page, pagination.pageSize]);

  const columns: ColumnDefinition<MerchantOnboardingApplication>[] = [
    {
      key: 'id',
      header: 'Application ID',
      render: (row) => (
        <span className="font-mono font-bold text-[var(--primary)] text-xs">{row.id}</span>
      ),
    },
    {
      key: 'businessName',
      header: 'Business Name',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-900">{row.businessName}</span>
      ),
    },
    {
      key: 'contactName',
      header: 'Contact Person',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-800">{row.contactName}</div>
          <div className="text-[11px] font-mono text-slate-500">{row.mobile}</div>
        </div>
      ),
    },
    {
      key: 'mappedParentName',
      header: 'Mapped Distributor',
      render: (row) => (
        <span className="text-xs text-slate-700 font-semibold">{row.mappedParentName}</span>
      ),
    },
    {
      key: 'onboardingStatus',
      header: 'Onboarding Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.onboardingStatus} size="sm" />,
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.kycStatus} size="sm" />,
    },
    {
      key: 'submittedAt',
      header: 'Submitted Date',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">{formatDate(row.submittedAt)}</span>
      ),
    },
  ];

  return (
    <PageContainer
      title="Retailer Onboarding Applications"
      description="Track and manage retailer onboarding requests and KYC submission status."
      actions={
        <Link href="/admin/kyc/onboarding/new">
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
            New Retailer Onboarding
          </Button>
        </Link>
      }
      className="space-y-6"
    >
      <Card title="Onboarding Queue" subtitle="Submitted retailer applications">
        <div className="space-y-4">
          <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
            <Table
              columns={columns}
              data={applications}
              keyExtractor={(row) => row.id}
              isLoading={isLoading}
            />
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={(page) => {
              setIsLoading(true);
              setPagination((prev) => ({ ...prev, page }));
            }}
            onPageSizeChange={(pageSize) => {
              setIsLoading(true);
              setPagination((prev) => ({ ...prev, page: 1, pageSize }));
            }}
          />
        </div>
      </Card>
    </PageContainer>
  );
}
