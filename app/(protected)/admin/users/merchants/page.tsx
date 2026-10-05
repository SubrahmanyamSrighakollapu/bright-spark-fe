'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/hooks/useModal';
import { userService, EntityListResult } from '@/services/userService';
import { BusinessEntity, UserFilters, PaginationState } from '@/types/domain';
import { UserSummaryCards } from '@/components/features/users/UserSummaryCards';
import { UserFilterBar } from '@/components/features/users/UserFilterBar';
import { UserTable } from '@/components/features/users/UserTable';
import { BlockUserModal } from '@/components/features/users/BlockUserModal';
import { PasswordResetModal } from '@/components/features/users/PasswordResetModal';
import { UserDetailsDrawer } from '@/components/features/users/UserDetailsDrawer';
import { UserPlus } from 'lucide-react';

export default function MerchantsPage() {
  const [data, setData] = useState<EntityListResult | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawers
  const detailDrawer = useModal<BusinessEntity>();
  const blockModal = useModal<BusinessEntity>();
  const resetPasswordModal = useModal<BusinessEntity>();

  const fetchMerchants = useCallback(
    async (activeFilters?: UserFilters, page = 1, pageSize = 10) => {
      setIsLoading(true);
      try {
        const res = await userService.getMerchants(activeFilters, page, pageSize);
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
    userService.getMerchants(filters, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [filters, pagination.page, pagination.pageSize]);

  const items = data?.items || [];
  const total = pagination.totalItems;
  const active = items.filter((e) => e.status === 'ACTIVE').length;
  const blocked = items.filter((e) => e.status === 'BLOCKED').length;
  const kycPending = items.filter((e) => e.kycStatus === 'PENDING' || e.kycStatus === 'UNDER_REVIEW').length;

  return (
    <PageContainer
      title="Retailers"
      description="Manage commercial retailer accounts, KYC verification and entity mappings."
      actions={
        <Link href="/admin/kyc/onboarding/new">
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
            New Retailer Onboarding
          </Button>
        </Link>
      }
      className="space-y-6"
    >
      {/* 1. Summary Cards */}
      <UserSummaryCards
        titlePrefix="Retailers"
        metrics={{ total, active, blocked, kycPending }}
        isLoading={isLoading}
      />

      {/* 2. Filter Bar with Distributor Filter */}
      <UserFilterBar
        onApplyFilters={(f) => {
          setIsLoading(true);
          setFilters(f);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onResetFilters={() => {
          setIsLoading(true);
          setFilters({});
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        showDistributorFilter
        isLoading={isLoading}
      />

      {/* 3. Merchants Data Table */}
      <UserTable
        entities={items}
        pagination={pagination}
        onPageChange={(page) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page }));
        }}
        onPageSizeChange={(pageSize) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page: 1, pageSize }));
        }}
        onViewDetails={(ent) => detailDrawer.open(ent)}
        onToggleBlock={(ent) => blockModal.open(ent)}
        onResetPassword={(ent) => resetPasswordModal.open(ent)}
        isLoading={isLoading}
      />

      {/* Slide-over User Details Drawer */}
      <UserDetailsDrawer
        isOpen={detailDrawer.isOpen}
        onClose={detailDrawer.close}
        entity={detailDrawer.data}
        onToggleBlock={(ent) => blockModal.open(ent)}
      />

      {/* Block/Unblock Confirmation Modal */}
      <BlockUserModal
        isOpen={blockModal.isOpen}
        onClose={blockModal.close}
        entity={blockModal.data}
        onSuccess={() => fetchMerchants(filters, pagination.page, pagination.pageSize)}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={resetPasswordModal.isOpen}
        onClose={resetPasswordModal.close}
        entity={resetPasswordModal.data}
      />
    </PageContainer>
  );
}
