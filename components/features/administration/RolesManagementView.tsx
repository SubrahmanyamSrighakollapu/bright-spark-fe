'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ActionKebabMenu, ActionMenuItem } from '@/components/ui/ActionKebabMenu';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { Shield, Plus, Edit, Lock, CheckCircle2, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { roleService, BackendRole, BackendPermission } from '@/services/roleService';
import { useConfirmation } from '@/context/ConfirmationContext';

export const RolesManagementView: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();
  const confirmAction = useConfirmation();
  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<BackendPermission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form & Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<BackendRole | null>(null);
  const [roleCode, setRoleCode] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRolesAndPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
      ]);

      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (permsRes.success && permsRes.data) {
        setPermissionsCatalog(permsRes.data);
      }
    } catch (err) {
      console.error('Failed to load roles/permissions:', err);
      toastError('Failed to fetch role permissions from backend server');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, [fetchRolesAndPermissions]);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setRoleCode('');
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions(['PARTY_READ', 'USER_READ']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: BackendRole) => {
    setEditingRole(role);
    setRoleCode(role.code);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleToggleStatus = async (role: BackendRole) => {
    const newStatus = !role.isActive;
    if (!(await confirmAction({ title: `${newStatus ? 'Activate' : 'Deactivate'} role?`, message: `${newStatus ? 'Activate' : 'Deactivate'} “${role.name}”? This changes access for users assigned to this role.`, confirmText: `Yes, ${newStatus ? 'activate' : 'deactivate'}`, variant: newStatus ? 'warning' : 'danger' }))) return;
    try {
      const res = await roleService.updateRole(role.id, { isActive: newStatus });
      if (res.success) {
        toastSuccess(`Role "${role.name}" ${newStatus ? 'activated' : 'inactivated'} successfully.`);
        fetchRolesAndPermissions();
      } else {
        toastError(res.message || 'Failed to update role status.');
      }
    } catch (err: unknown) {
      toastError((err as Error)?.message || 'Failed to toggle role status.');
    }
  };

  const handleDeleteRole = async (role: BackendRole) => {
    if (!(await confirmAction({ title: 'Delete role?', message: `Permanently delete “${role.name}”? This cannot be undone.`, confirmText: 'Yes, delete role', variant: 'danger' }))) return;
    try {
      const res = await roleService.deleteRole(role.id);
      if (res.success) {
        toastSuccess(`Role "${role.name}" deleted successfully.`);
        fetchRolesAndPermissions();
      } else {
        toastError(res.message || 'Failed to delete role.');
      }
    } catch (err: unknown) {
      toastError((err as Error)?.message || 'Failed to delete role.');
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingRole) {
        const res = await roleService.updateRole(editingRole.id, {
          name: roleName,
          description: roleDescription,
          permissionCodes: selectedPermissions,
        });

        if (res.success && res.data) {
          toastSuccess(`Role "${roleName}" updated successfully!`);
          fetchRolesAndPermissions();
          setIsModalOpen(false);
        } else {
          toastError(res.message || 'Failed to update role');
        }
      } else {
        const codeClean = roleCode.trim().toUpperCase().replace(/\s+/g, '_') || `EMP_${Date.now()}`;
        const res = await roleService.createRole({
          code: codeClean,
          name: roleName,
          description: roleDescription,
          permissionCodes: selectedPermissions,
        });

        if (res.success && res.data) {
          toastSuccess(`Role "${roleName}" created successfully!`);
          fetchRolesAndPermissions();
          setIsModalOpen(false);
        } else {
          toastError(res.message || 'Failed to create role');
        }
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'An error occurred while saving the role';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modulesGrouped = permissionsCatalog.reduce<Record<string, BackendPermission[]>>((acc, perm) => {
    const mod = perm.module || 'GENERAL';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const columns: ColumnDefinition<BackendRole>[] = [
    {
      key: 'name',
      header: 'Role Title & Code',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-[#155EEF]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
              {row.name}
              {row.isSystem && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Lock className="w-3 h-3" /> System Protected
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#64748B] font-mono mt-0.5">Code: {row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Sub-Type',
      render: (row) => (
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              row.category === 'SYSTEM'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : row.category === 'NETWORK'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-purple-50 text-purple-800 border-purple-200'
            }`}
          >
            {row.category === 'EMPLOYEE' ? 'Employee Role' : `${row.category} Role`}
          </span>
          {row.category === 'EMPLOYEE' && (
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Departments: Operations, Accounts, KYC, Sales
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'assignedUserCount',
      header: 'Active Users',
      render: (row) => (
        <span className="text-xs font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          {row.assignedUserCount} Accounts
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const actionItems: ActionMenuItem[] = [
          {
            key: 'edit',
            label: 'Update',
            icon: <Edit className="w-4 h-4 text-blue-600" />,
            onClick: () => handleOpenEdit(row),
            variant: 'info',
            disabled: row.isSystem,
          },
          {
            key: 'toggle_status',
            label: row.isActive ? 'Inactivate' : 'Activate',
            icon: row.isActive ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ),
            onClick: () => handleToggleStatus(row),
            variant: row.isActive ? 'danger' : 'success',
            disabled: row.isSystem,
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4 text-rose-600" />,
            onClick: () => handleDeleteRole(row),
            danger: true,
            disabled: row.isSystem || row.assignedUserCount > 0,
          },
        ];

        return <ActionKebabMenu items={actionItems} align="right" />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#155EEF]" />
            Roles & Permission Matrix Management
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage system roles (Admin, Master Distributor, Distributor, Retailer) and configurable Employee staff roles (Operations, Accounts, KYC, Sales).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRolesAndPermissions} isLoading={isLoading}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Employee Sub-Role
          </Button>
        </div>
      </div>

      {/* Roles Table */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4 overflow-visible">
        <Table columns={columns} data={roles} keyExtractor={(r) => String(r.id)} isLoading={isLoading} />
      </Card>

      {/* Role Config Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRole ? `Configure Role: ${editingRole.name}` : 'Create Employee Sub-Role'}
        >
          <form onSubmit={handleSaveRole} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {!editingRole && (
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Role Unique Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. EMP_SENIOR_OPS"
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Role Display Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Senior Operations Officer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Description</label>
              <Input
                placeholder="Operational scope & responsibilities"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-2">
                Module Permission Assignments ({selectedPermissions.length} selected)
              </label>
              <div className="space-y-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                {Object.entries(modulesGrouped).map(([moduleName, perms]) => (
                  <div key={moduleName} className="space-y-1.5">
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1">
                      {moduleName} Module
                    </span>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {perms.map((p) => {
                        const isChecked = selectedPermissions.includes(p.code);
                        return (
                          <label
                            key={p.code}
                            className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(p.code)}
                              className="w-3.5 h-3.5 text-[#155EEF] rounded"
                            />
                            <span className="truncate">{p.code}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingRole ? 'Update Role Permissions' : 'Create Role'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
