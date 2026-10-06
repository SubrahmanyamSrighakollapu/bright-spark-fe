'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export interface UserItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  contactNo: string;
  roleName: 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
  isAadharVerify: boolean;
  panNoVerify: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
}

const MOCK_USERS: UserItem[] = [
  {
    id: 'usr_1',
    userId: 'MD901',
    fullName: 'Ramesh Kumar Hub',
    email: 'ramesh.md@qinstarpay.com',
    contactNo: '9876543210',
    roleName: 'MASTER_DISTRIBUTOR',
    isAadharVerify: true,
    panNoVerify: true,
    status: 'ACTIVE',
    createdAt: '2026-09-01T10:30:00Z',
  },
  {
    id: 'usr_2',
    userId: 'DST402',
    fullName: 'Apex Distro Agency',
    email: 'apex.dist@qinstarpay.com',
    contactNo: '9812345678',
    roleName: 'DISTRIBUTOR',
    isAadharVerify: true,
    panNoVerify: true,
    status: 'ACTIVE',
    createdAt: '2026-09-05T14:15:00Z',
  },
  {
    id: 'usr_3',
    userId: 'RET2045',
    fullName: 'Zenith Retail Mart',
    email: 'zenith.retail@gmail.com',
    contactNo: '9988776655',
    roleName: 'RETAILER',
    isAadharVerify: true,
    panNoVerify: false,
    status: 'PENDING',
    createdAt: '2026-09-12T09:45:00Z',
  },
  {
    id: 'usr_4',
    userId: 'RET2046',
    fullName: 'Swift Commerce Point',
    email: 'swift.store@gmail.com',
    contactNo: '9765432109',
    roleName: 'RETAILER',
    isAadharVerify: false,
    panNoVerify: false,
    status: 'SUSPENDED',
    createdAt: '2026-09-15T16:20:00Z',
  },
];

export const UsersListView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();

  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Swap Role / Parent Modal State
  const [swappingUser, setSwappingUser] = useState<UserItem | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER'>('DISTRIBUTOR');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.contactNo.includes(searchTerm);

    const matchesRole = roleFilter === 'ALL' || u.roleName === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          toastSuccess(`User ${u.userId} status flipped to ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setIsEditModalOpen(false);
    toastSuccess(`User ${editingUser.userId} updated successfully.`);
  };

  const handleConfirmSwap = () => {
    if (!swappingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === swappingUser.id ? { ...u, roleName: newRole } : u))
    );
    setIsSwapModalOpen(false);
    toastSuccess(`Role for ${swappingUser.userId} swapped to ${newRole.replace('_', ' ')}.`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toastInfo(`User account "${name}" has been archived.`);
  };

  const columns: ColumnDefinition<UserItem>[] = [
    {
      key: 'userId',
      header: 'User ID',
      render: (row) => (
        <span className="font-mono font-bold text-[#155EEF] text-xs">
          {row.userId}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Name & Contact',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{row.fullName}</div>
          <div className="text-[11px] text-[#64748B]">{row.email} • {row.contactNo}</div>
        </div>
      ),
    },
    {
      key: 'roleName',
      header: 'Role',
      align: 'center',
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
            row.roleName === 'MASTER_DISTRIBUTOR'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : row.roleName === 'DISTRIBUTOR'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {row.roleName === 'MASTER_DISTRIBUTOR' ? 'Master Dist (MD)' : row.roleName === 'DISTRIBUTOR' ? 'Distributor (DS)' : 'Retailer'}
        </span>
      ),
    },
    {
      key: 'verificationStatus',
      header: 'Verification Badges',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold">
          <span className={`px-2 py-0.5 rounded ${row.isAadharVerify ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
            Aadhaar {row.isAadharVerify ? '✓' : '✗'}
          </span>
          <span className={`px-2 py-0.5 rounded ${row.panNoVerify ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
            PAN {row.panNoVerify ? '✓' : '✗'}
          </span>
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
            {row.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#155EEF]" />
            User List (UsersList)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Master directory of all registered platform users (MD, DS, Retailer) with downline status controls.
          </p>
        </div>

        <Link href="/admin/users/add">
          <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
            + Onboard New User
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card noPadding>
        <div className="p-4 border-b border-[#E5EAF1] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by Name, Email, Mobile, or User ID (USR102)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Roles (MD, DS, Retailer)' },
                { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor (MD)' },
                { value: 'DISTRIBUTOR', label: 'Distributor (DS)' },
                { value: 'RETAILER', label: 'Retailer' },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* Master Users Table */}
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredUsers}
            keyExtractor={(row) => row.id}
            renderActions={(row) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser({ ...row });
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-slate-600 hover:text-[#155EEF] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Edit User Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSwappingUser(row);
                    setNewRole(row.roleName);
                    setIsSwapModalOpen(true);
                  }}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                  title="Swap User Role / Parent"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(row.id)}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    row.status === 'ACTIVE'
                      ? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={row.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                >
                  {row.status === 'ACTIVE' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(row.id, row.fullName)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Delete User Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          />
        </div>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit User Details (${editingUser.userId})`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs pt-2">
            <Input
              label="Full Name"
              value={editingUser.fullName}
              onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
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
              value={editingUser.contactNo}
              onChange={(e) => setEditingUser({ ...editingUser, contactNo: e.target.value })}
            />

            <Select
              label="Account Status"
              value={editingUser.status}
              onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
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

      {/* Swap Role / Parent Modal */}
      {swappingUser && (
        <Modal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          title={`Swap User Role / Parent (${swappingUser.userId})`}
          size="sm"
        >
          <div className="space-y-4 text-xs pt-2">
            <p className="text-[#64748B]">
              Reassign downline hierarchy mapping for <strong>{swappingUser.fullName}</strong> across Distributor levels.
            </p>

            <Select
              label="Target Role Tier"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              options={[
                { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor (MD)' },
                { value: 'DISTRIBUTOR', label: 'Distributor (DS)' },
                { value: 'RETAILER', label: 'Retailer' },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setIsSwapModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleConfirmSwap}>
                Confirm Role Swap
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
