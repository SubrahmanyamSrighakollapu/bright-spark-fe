'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { Shield, Plus, Edit, Trash2, CheckCircle2, UserCheck, Lock } from 'lucide-react';

export interface SystemRole {
  id: string;
  roleName: string;
  isEmployee: boolean;
  permissions: {
    orders: boolean;
    wallet: boolean;
    reports: boolean;
    kycs: boolean;
    integrations: boolean;
    settings: boolean;
  };
  userCount: number;
}

const INITIAL_ROLES: SystemRole[] = [
  {
    id: 'role_1',
    roleName: 'Super Admin',
    isEmployee: true,
    permissions: { orders: true, wallet: true, reports: true, kycs: true, integrations: true, settings: true },
    userCount: 2,
  },
  {
    id: 'role_2',
    roleName: 'Super Distributor',
    isEmployee: false,
    permissions: { orders: true, wallet: true, reports: true, kycs: false, integrations: false, settings: false },
    userCount: 14,
  },
  {
    id: 'role_3',
    roleName: 'Master Distributor',
    isEmployee: false,
    permissions: { orders: true, wallet: true, reports: true, kycs: false, integrations: false, settings: false },
    userCount: 48,
  },
  {
    id: 'role_4',
    roleName: 'Distributor',
    isEmployee: false,
    permissions: { orders: true, wallet: true, reports: true, kycs: false, integrations: false, settings: false },
    userCount: 182,
  },
  {
    id: 'role_5',
    roleName: 'Retailer',
    isEmployee: false,
    permissions: { orders: true, wallet: true, reports: false, kycs: false, integrations: false, settings: false },
    userCount: 1240,
  },
  {
    id: 'role_6',
    roleName: 'Employee',
    isEmployee: true,
    permissions: { orders: true, wallet: false, reports: true, kycs: true, integrations: false, settings: false },
    userCount: 9,
  },
];

const MODULE_LIST = [
  { key: 'orders', label: 'Orders & Crops' },
  { key: 'wallet', label: 'Wallet Operations' },
  { key: 'reports', label: 'Reports & Audit' },
  { key: 'kycs', label: 'KYC Verifications' },
  { key: 'integrations', label: 'Integrations PG' },
  { key: 'settings', label: 'Admin Settings' },
] as const;

export const RolesManagementView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [roles, setRoles] = useState<SystemRole[]>(INITIAL_ROLES);

  // Form & Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [isEmployee, setIsEmployee] = useState(false);
  const [permissions, setPermissions] = useState<SystemRole['permissions']>({
    orders: true,
    wallet: true,
    reports: false,
    kycs: false,
    integrations: false,
    settings: false,
  });

  const handleOpenAdd = () => {
    setEditingRole(null);
    setRoleName('');
    setIsEmployee(false);
    setPermissions({ orders: true, wallet: true, reports: false, kycs: false, integrations: false, settings: false });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: SystemRole) => {
    setEditingRole(role);
    setRoleName(role.roleName);
    setIsEmployee(role.isEmployee);
    setPermissions(role.permissions);
    setIsModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, roleName, isEmployee, permissions } : r))
      );
      toastSuccess(`Role "${roleName}" updated successfully!`);
    } else {
      const newRole: SystemRole = {
        id: `role_${Date.now()}`,
        roleName,
        isEmployee,
        permissions,
        userCount: 0,
      };
      setRoles([...roles, newRole]);
      toastSuccess(`Role "${roleName}" created successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    toastInfo(`Role "${name}" removed.`);
  };

  const columns: ColumnDefinition<SystemRole>[] = [
    {
      key: 'roleName',
      header: 'Role Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#155EEF]" />
          <div>
            <div className="font-semibold text-[#0F172A]">{row.roleName}</div>
            <div className="text-xs text-[#64748B]">{row.userCount} Active Users</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roleType',
      header: 'Role Type',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            row.isEmployee
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {row.isEmployee ? 'Operational Employee' : 'Network Downline'}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Permission Matrix',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {MODULE_LIST.map((m) => {
            const hasPerm = row.permissions[m.key];
            return (
              <span
                key={m.key}
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  hasPerm
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                }`}
              >
                {m.label}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 px-2 text-[#155EEF] hover:bg-[#F1F5F9]"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          {row.roleName !== 'Super Admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.id, row.roleName)}
              className="h-8 px-2 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#155EEF]" />
            Roles & Permission Matrix Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Configure system user roles and module visibility permissions across network downlines and staff.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      {/* Table */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={roles} keyExtractor={(r) => r.id} />
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRole ? `Edit Role: ${editingRole.roleName}` : 'Create System Role'}
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Role Name (roleName) <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Regional Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEmp"
                checked={isEmployee}
                onChange={(e) => setIsEmployee(e.target.checked)}
                className="w-4 h-4 text-[#155EEF] rounded focus:ring-[#155EEF]"
              />
              <label htmlFor="isEmp" className="text-xs font-medium text-[#0F172A]">
                Is Operational Staff / Employee Role (isEmployee)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-2">Module Access Permissions</label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                {MODULE_LIST.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 text-xs text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions[m.key]}
                      onChange={(e) =>
                        setPermissions({ ...permissions, [m.key]: e.target.checked })
                      }
                      className="w-3.5 h-3.5 text-[#155EEF] rounded"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingRole ? 'Update Role' : 'Save Role'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
