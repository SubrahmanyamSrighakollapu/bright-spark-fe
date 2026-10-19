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

export default function BackOfficeUsersPage() {
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

  const fetchBackOffice = useCallback(
    async (activeFilters?: UserFilters, page = 1, pageSize = 10) => {
      setIsLoading(true);
      try {
        const res = await userService.getBackOfficeUsers(activeFilters, page, pageSize);
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
    userService.getBackOfficeUsers(filters, pagination.page, pagination.pageSize).then((res) => {
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

  return (
    <PageContainer
      title="Back Office Users"
      description="Manage internal Bright Spark team members (Sales, KYC, Accounts, Operations, Support)."
      className="space-y-6"
    >
      {/* 1. Summary Cards */}
      <UserSummaryCards
        titlePrefix="Back Office Team"
        metrics={{ total, active, blocked }}
        fourthCardTitle="Recently Active"
        fourthCardValue={active}
        isLoading={isLoading}
      />

      {/* 2. Filter Bar with Role Filter */}
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
        showRoleFilter
        isLoading={isLoading}
      />

      {/* 3. Back Office Users Data Table */}
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
        onSuccess={() => fetchBackOffice(filters, pagination.page, pagination.pageSize)}
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
