'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { ActionKebabMenu, ActionMenuItem } from '@/components/ui/ActionKebabMenu';
import { ColumnDefinition } from '@/types/common';
import { PaginationState } from '@/types/domain';
import { userService, NetworkUserItem } from '@/services/userService';
import { formatCurrency } from '@/utils/formatters';
import { useConfirmation } from '@/context/ConfirmationContext';
import { UserAuthorityTransferDrawer } from './UserAuthorityTransferDrawer';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Edit2,
  ArrowUpDown,
  UserPlus,
  PlusCircle,
  Lock,
  RefreshCw,
} from 'lucide-react';

export const UsersListView: React.FC = () => {
  const { toastSuccess, toastError } = useToast();
  const confirm = useConfirmation();

  const [users, setUsers] = useState<NetworkUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 20, totalItems: 0, totalPages: 1 });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<NetworkUserItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Admin-only network authority transfer drawer
  const [swappingUser, setSwappingUser] = useState<NetworkUserItem | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Quick Wallet Credit Modal State
  const [creditUser, setCreditUser] = useState<NetworkUserItem | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditRemarks, setCreditRemarks] = useState('');

  // Quick Hold Funds Modal State
  const [holdUser, setHoldUser] = useState<NetworkUserItem | null>(null);
  const [holdAmount, setHoldAmount] = useState('');
  const [holdReason, setHoldReason] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      if (response && response.success && response.data) {
        setUsers(response.data.items || []);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: NetworkUserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (nextStatus === 'ACTIVE' && user.kycStatus !== 'APPROVED') {
      toastError('This user cannot be activated until KYC is approved.');
      return;
    }
    if (!(await confirm({
      title: `${nextStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} user?`,
      message: `Are you sure you want to change ${user.fullName || user.userId} to ${nextStatus}? This affects account access immediately.`,
      confirmText: `Yes, ${nextStatus === 'SUSPENDED' ? 'suspend' : 'activate'}`,
      variant: nextStatus === 'SUSPENDED' ? 'danger' : 'warning',
    }))) return;
    try {
      const res = await userService.updateUserStatus(user.id, nextStatus, 'Admin status toggle');
      if (res && res.success) {
        toastSuccess(`User ${user.userId || user.code || user.fullName} status changed to ${nextStatus}.`);
        fetchUsers();
      } else {
        toastError(res?.message || 'Failed to update user status.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update user status. Please check your session/login.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await userService.updateUser(editingUser.id, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        mobile: editingUser.mobile || editingUser.contactNo,
        displayName: editingUser.displayName || editingUser.fullName,
        status: editingUser.status,
      });

      if (res && res.success) {
        toastSuccess(`User ${editingUser.userId || editingUser.code || editingUser.fullName} updated successfully.`);
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        toastError(res?.message || 'Failed to update user profile.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update user profile.');
    }
  };

  const handleExecuteCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditUser) return;
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toastError('Please enter a valid credit amount.');
      return;
    }
    if (!(await confirm({ title: 'Confirm wallet credit', message: `Credit ${formatCurrency(amount)} to ${creditUser.fullName || creditUser.userId}? This creates a financial ledger adjustment.`, confirmText: 'Yes, credit wallet', variant: 'warning' }))) return;

    try {
      const res = await userService.creditWallet(creditUser.id, amount, creditRemarks);
      if (res && res.success) {
        toastSuccess(`Successfully credited ${formatCurrency(amount)} to ${creditUser.userId || creditUser.code}`);
        setCreditUser(null);
        setCreditAmount('');
        setCreditRemarks('');
        fetchUsers();
      } else {
        toastError(res?.message || 'Wallet credit failed.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Wallet credit failed.');
    }
  };

  const handleExecuteHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdUser) return;
    const amount = parseFloat(holdAmount);
    if (isNaN(amount) || amount <= 0) {
      toastError('Please enter a valid hold amount.');
      return;
    }
    if (!(await confirm({ title: 'Confirm funds hold', message: `Place a hold of ${formatCurrency(amount)} on ${holdUser.fullName || holdUser.userId}? The amount will become unavailable to the user.`, confirmText: 'Yes, hold funds', variant: 'danger' }))) return;

    try {
      const res = await userService.holdWalletFunds(holdUser.id, amount, 'HOLD', holdReason);
      if (res && res.success) {
        toastSuccess(`Security hold of ${formatCurrency(amount)} placed on user ${holdUser.userId || holdUser.code}`);
        setHoldUser(null);
        setHoldAmount('');
        setHoldReason('');
        fetchUsers();
      } else {
        toastError(res?.message || 'Hold funds action failed.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Hold funds action failed.');
    }
  };

  const columns: ColumnDefinition<NetworkUserItem>[] = [
    {
      key: 'userId',
      header: 'User ID',
      render: (row) => (
        <span className="font-mono font-bold text-[#155EEF] text-xs">
          {row.userId || row.code}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Name & Contact',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{row.fullName || row.displayName}</div>
          <div className="text-[11px] text-[#64748B]">{row.email} • {row.mobile || row.contactNo}</div>
        </div>
      ),
    },
    {
      key: 'roleName',
      header: 'Role',
      align: 'center',
      render: (row) => {
        const role = row.role || row.roleName;
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
              role === 'MASTER_DISTRIBUTOR'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : role === 'DISTRIBUTOR'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {role === 'MASTER_DISTRIBUTOR' ? 'Master Dist (MD)' : role === 'DISTRIBUTOR' ? 'Distributor (DS)' : 'Retailer'}
          </span>
        );
      },
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-[#0F172A]">{row.createdBy || 'Admin'}</div>
          {row.createdByRole && row.createdByRole !== 'ADMIN' && row.createdByRole !== 'SUPER_ADMIN' && (
            <div className="text-[10px] text-[#64748B]">{row.createdByRole.replaceAll('_', ' ')}</div>
          )}
        </div>
      ),
    },
    {
      key: 'walletBalance',
      header: 'Available Balance',
      align: 'right',
      render: (row) => (
        <div className="font-mono text-xs text-right">
          <div className="font-extrabold text-[#0F172A] tabular-nums">
            {formatCurrency(row.availableBalance ?? 0)}
          </div>
          {(row.holdBalance ?? 0) > 0 && (
            <div className="text-[10px] text-amber-600 font-semibold">
              Hold: {formatCurrency(row.holdBalance)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      header: 'KYC Status',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center text-[10px] font-bold">
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 ${row.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : row.kycStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {(row.kycStatus || 'NOT_STARTED').replaceAll('_', ' ')}
          </span>
          <div className="hidden">
          <span className={`px-2 py-0.5 rounded ${row.isAadharVerify ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
            Aadhaar {row.isAadharVerify ? '✓' : '✗'}
          </span>
          <span className={`px-2 py-0.5 rounded ${row.panNoVerify ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
            PAN {row.panNoVerify ? '✓' : '✗'}
          </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      align: 'center',
      render: (row) => {
        const isAct = row.status === 'ACTIVE';
        const isPend = row.status === 'PENDING';
        const isSusp = row.status === 'SUSPENDED';

        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
              isAct
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isPend
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : isSusp
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-emerald-500' : isPend ? 'bg-amber-500' : 'bg-rose-500'}`} />
            {isPend && row.kycStatus !== 'APPROVED' ? 'KYC PENDING' : row.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5 lg:h-[calc(100dvh-8rem)] lg:min-h-[560px] lg:overflow-hidden">
      {/* Header & Quick Actions */}
      <div className="shrink-0 bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#155EEF]" />
            User Management Directory
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Master directory of registered platform users (MD, DS, Retailer) with wallet balance & account controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchUsers} isLoading={loading} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Link href="/admin/users/add">
            <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
              + Onboard New User
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card noPadding className="flex min-h-0 flex-1 flex-col overflow-hidden" contentClassName="flex min-h-0 flex-1 flex-col">
        <div className="grid shrink-0 grid-cols-1 items-center gap-3 border-b border-[#E5EAF1] bg-[#F8FAFC] px-4 py-3 lg:grid-cols-[minmax(300px,1fr)_430px]">
          <div className="min-w-0">
            <Input
              placeholder="Search by Name, Email, Mobile, or User ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPagination((current) => ({ ...current, page: 1 })); }}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPagination((current) => ({ ...current, page: 1 })); }}
              options={[
                { value: 'ALL', label: 'All Roles' },
                { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor (MD)' },
                { value: 'DISTRIBUTOR', label: 'Distributor (DS)' },
                { value: 'RETAILER', label: 'Retailer' },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination((current) => ({ ...current, page: 1 })); }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Only' },
                { value: 'PENDING', label: 'Pending Verification' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>
        </div>

        {/* Master Users Table with ActionKebabMenu */}
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
          <Table
            columns={columns}
            data={users}
            isLoading={loading}
            className="rounded-none border-0 shadow-none"
            keyExtractor={(row) => row.id}
            renderActions={(row) => {
              const menuItems: ActionMenuItem[] = [
                {
                  key: 'edit',
                  label: 'Edit User Details',
                  icon: <Edit2 className="w-4 h-4 text-slate-500" />,
                  onClick: () => {
                    setEditingUser({ ...row });
                    setIsEditModalOpen(true);
                  },
                },
                {
                  key: 'toggleStatus',
                  label: row.status === 'ACTIVE' ? 'Suspend Account' : row.kycStatus === 'APPROVED' ? 'Activate Account' : 'KYC Approval Required',
                  icon: row.status === 'ACTIVE' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />,
                  danger: row.status === 'ACTIVE',
                  disabled: row.status !== 'ACTIVE' && row.kycStatus !== 'APPROVED',
                  onClick: () => handleToggleStatus(row),
                },
                {
                  key: 'creditWallet',
                  label: 'Top-up Wallet Credit',
                  icon: <PlusCircle className="w-4 h-4 text-blue-600" />,
                  divider: true,
                  onClick: () => {
                    setCreditUser(row);
                    setCreditAmount('');
                    setCreditRemarks('');
                  },
                },
                {
                  key: 'holdFunds',
                  label: 'Hold Security Funds',
                  icon: <Lock className="w-4 h-4 text-amber-600" />,
                  onClick: () => {
                    setHoldUser(row);
                    setHoldAmount('');
                    setHoldReason('');
                  },
                },
                {
                  key: 'swapRole',
                  label: 'Move User Authority',
                  icon: <ArrowUpDown className="w-4 h-4 text-purple-600" />,
                  divider: true,
                  onClick: () => {
                    setSwappingUser(row);
                    setIsSwapModalOpen(true);
                  },
                },
              ];

              return <ActionKebabMenu items={menuItems} align="right" />;
            }}
          />
        </div>
        <Pagination className="shrink-0" currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems} pageSize={pagination.pageSize}
          onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
          onPageSizeChange={(pageSize) => setPagination((current) => ({ ...current, page: 1, pageSize }))} />
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit User Details (${editingUser.userId || editingUser.code})`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs pt-2">
            <Input
              label="Full Name"
              value={editingUser.fullName || editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value, name: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            />

            <Input
              label="Contact Mobile"
              value={editingUser.mobile || editingUser.contactNo}
              onChange={(e) => setEditingUser({ ...editingUser, mobile: e.target.value, contactNo: e.target.value })}
            />

            <Select
              label="Account Status"
              value={editingUser.status}
              onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
              options={[
                ...(editingUser.kycStatus === 'APPROVED' ? [{ value: 'ACTIVE', label: 'Active' }] : []),
                { value: 'PENDING', label: 'Pending Verification' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Wallet Credit Modal */}
      {creditUser && (
        <Modal
          isOpen={!!creditUser}
          onClose={() => setCreditUser(null)}
          title={`Top-up Wallet Credit (${creditUser.userId || creditUser.code})`}
          size="md"
        >
          <form onSubmit={handleExecuteCredit} className="space-y-4 text-xs pt-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="font-semibold text-blue-900">{creditUser.fullName || creditUser.name}</div>
              <div className="text-[11px] text-blue-700 mt-0.5">
                Current Available Balance: {formatCurrency(creditUser.availableBalance ?? 0)}
              </div>
            </div>

            <Input
              label="Credit Amount in ₹"
              type="number"
              placeholder="e.g. 5000.00"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              required
            />

            <Input
              label="Reason / Audit Note"
              placeholder="e.g. Manual Top-up / Administrative Adjustment"
              value={creditRemarks}
              onChange={(e) => setCreditRemarks(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setCreditUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Execute Wallet Credit
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Hold Funds Modal */}
      {holdUser && (
        <Modal
          isOpen={!!holdUser}
          onClose={() => setHoldUser(null)}
          title={`Hold Security Funds (${holdUser.userId || holdUser.code})`}
          size="md"
        >
          <form onSubmit={handleExecuteHold} className="space-y-4 text-xs pt-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="font-semibold text-amber-900">{holdUser.fullName || holdUser.name}</div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Available: {formatCurrency(holdUser.availableBalance ?? 0)} • Active Hold: {formatCurrency(holdUser.holdBalance ?? 0)}
              </div>
            </div>

            <Input
              label="Hold Amount in ₹"
              type="number"
              placeholder="e.g. 2000.00"
              value={holdAmount}
              onChange={(e) => setHoldAmount(e.target.value)}
              required
            />

            <Input
              label="Reason for Hold"
              placeholder="e.g. Pending Document Audit / Dispute Investigation"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setHoldUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Lock className="w-4 h-4" />}>
                Apply Security Hold
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <UserAuthorityTransferDrawer
        isOpen={isSwapModalOpen}
        user={swappingUser}
        onClose={() => { setIsSwapModalOpen(false); setSwappingUser(null); }}
        onSuccess={fetchUsers}
      />
    </div>
  );
};
