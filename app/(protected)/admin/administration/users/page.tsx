'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { adminService, AdminListResult } from '@/services/adminService';
import { AdminUser, Role, PaginationState } from '@/types/domain';
import { AdminUserTable } from '@/components/features/administration/AdminUserTable';
import { CreateAdminUserModal } from '@/components/features/administration/CreateAdminUserModal';
import { AdminUserDetailsDrawer } from '@/components/features/administration/AdminUserDetailsDrawer';
import { useToast } from '@/components/ui/Toast';
import { Search, UserPlus } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<AdminListResult<AdminUser> | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const createModal = useModal();
  const detailsDrawer = useModal<AdminUser>();

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      adminService.getAdminUsers(searchQuery, pagination.page, pagination.pageSize),
      adminService.getRoles(),
    ]).then(([usersRes, rolesRes]) => {
      if (usersRes.success && usersRes.data) {
        setData(usersRes.data);
        setPagination(usersRes.data.pagination);
      }
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      adminService.getAdminUsers(searchQuery, pagination.page, pagination.pageSize),
      adminService.getRoles(),
    ]).then(([usersRes, rolesRes]) => {
      if (!isCancelled) {
        if (usersRes.success && usersRes.data) {
          setData(usersRes.data);
          setPagination(usersRes.data.pagination);
        }
        if (rolesRes.success && rolesRes.data) {
          setRoles(rolesRes.data);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [searchQuery, pagination.page, pagination.pageSize]);

  const { toastError, toastSuccess } = useToast();

  const handleCreateSubmit = async (formData: Omit<AdminUser, 'id' | 'createdAt' | 'createdBy' | 'roleNames'>) => {
    await adminService.createAdminUser(formData);
    toastSuccess('Admin user created successfully.');
    loadData();
  };

  const handleStatusChange = async (user: AdminUser, newStatus: AdminUser['status']) => {
    const res = await adminService.updateAdminUserStatus(user.id, newStatus);
    if (!res.success && res.message) {
      toastError(res.message);
      return;
    }
    toastSuccess(`Admin user status updated to ${newStatus}.`);
    loadData();
  };

  return (
    <PageContainer
      title="Admin User Management"
      description="Manage internal Bright Spark operational staff, department assignments, role access, and account statuses."
      actions={
        <Button variant="primary" size="sm" onClick={() => createModal.open()} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
          Invite Admin Staff
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <Input
            placeholder="Search Name, Email, Employee ID, Department..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </Card>

        {/* Table View */}
        <AdminUserTable
          data={data?.items || []}
          isLoading={isLoading}
          onViewUser={(user) => detailsDrawer.open(user)}
          onStatusChange={handleStatusChange}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {/* Modals & Drawers */}
        <CreateAdminUserModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          roles={roles}
          onSubmit={handleCreateSubmit}
        />

        <AdminUserDetailsDrawer
          isOpen={detailsDrawer.isOpen}
          onClose={detailsDrawer.close}
          user={detailsDrawer.data}
          roles={roles}
          onStatusChange={handleStatusChange}
        />
      </div>
    </PageContainer>
  );
}
