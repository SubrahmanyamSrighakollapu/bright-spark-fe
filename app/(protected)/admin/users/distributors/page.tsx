'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useModal } from '@/hooks/useModal';
import { userService, EntityListResult } from '@/services/userService';
import { BusinessEntity, UserFilters, PaginationState } from '@/types/domain';
import { UserSummaryCards } from '@/components/features/users/UserSummaryCards';
import { UserFilterBar } from '@/components/features/users/UserFilterBar';
import { UserTable } from '@/components/features/users/UserTable';
import { BlockUserModal } from '@/components/features/users/BlockUserModal';
import { PasswordResetModal } from '@/components/features/users/PasswordResetModal';
import { UserDetailsDrawer } from '@/components/features/users/UserDetailsDrawer';
import { AddMemberModal } from '@/components/features/users/AddMemberModal';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';

export default function DistributorsPage() {
  const [data, setData] = useState<EntityListResult | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [addModalOpen, setAddModalOpen] = useState(false);
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

  const fetchDistributors = useCallback(
    async (activeFilters?: UserFilters, page = 1, pageSize = 10) => {
      setIsLoading(true);
      try {
        const res = await userService.getDistributors(activeFilters, page, pageSize);
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
    userService.getDistributors(filters, pagination.page, pagination.pageSize).then((res) => {
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
      title="Distributors"
      description="Manage distributor accounts and commercial business relationships."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="font-bold shadow-xs"
        >
          + Add Distributor
        </Button>
      }
      className="space-y-6"
    >
      {/* 1. Summary Cards */}
      <UserSummaryCards
        titlePrefix="Distributors"
        metrics={{ total, active, blocked, kycPending }}
        isLoading={isLoading}
      />

      {/* 2. Operational Filter Bar */}
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
        isLoading={isLoading}
      />

      {/* 3. Distributors Data Table */}
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
        onSuccess={() => fetchDistributors(filters, pagination.page, pagination.pageSize)}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={resetPasswordModal.isOpen}
        onClose={resetPasswordModal.close}
        entity={resetPasswordModal.data}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultType="DISTRIBUTOR"
        onSuccess={() => fetchDistributors(filters, pagination.page, pagination.pageSize)}
      />
    </PageContainer>
  );
}
