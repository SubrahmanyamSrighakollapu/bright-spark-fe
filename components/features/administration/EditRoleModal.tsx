'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Role } from '@/types/domain';
import { PERMISSION_GROUPS, resolvePermissionDependencies } from '@/config/permissions';
import { CheckSquare, Square, Save } from 'lucide-react';

export interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSavePermissions: (roleId: string, permissions: string[], reason?: string) => Promise<void>;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  role,
  onSavePermissions,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevRoleId, setPrevRoleId] = useState<string | null>(null);

  const roleId = role?.id;
  const rolePerms = role?.permissions;

  if (roleId && roleId !== prevRoleId) {
    setPrevRoleId(roleId);
    setSelectedPermissions(rolePerms || []);
    setReason('');
  }

  if (!role) return null;

  const isProtectedRole = role.category === 'SYSTEM' || role.category === 'NETWORK' || role.isSystemRole;

  const handleTogglePermission = (permCode: string) => {
    if (isProtectedRole) return;
    let next: string[];
    if (selectedPermissions.includes(permCode)) {
      next = selectedPermissions.filter((p) => p !== permCode);
    } else {
      next = [...selectedPermissions, permCode];
    }
    setSelectedPermissions(resolvePermissionDependencies(next));
  };

  const handleSelectModuleGroup = (groupPermissions: string[]) => {
    if (isProtectedRole) return;
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p));
    let next: string[];
    if (allSelected) {
      next = selectedPermissions.filter((p) => !groupPermissions.includes(p));
    } else {
      next = Array.from(new Set([...selectedPermissions, ...groupPermissions]));
    }
    setSelectedPermissions(resolvePermissionDependencies(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSavePermissions(role.id, selectedPermissions, reason);
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure Role Matrix — ${role.name}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs block">{role.name} ({role.code})</span>
            <span className="text-[11px] text-slate-600">{role.description}</span>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-extrabold bg-purple-100 text-purple-900 shrink-0">
            {isProtectedRole ? 'PROTECTED' : `${selectedPermissions.length} Tokens`}
          </span>
        </div>

        {/* Reason for Change Input */}
        <Input
          label="Reason for Permission Change (Logged in Audit Trail)"
          placeholder="e.g. Added settlement disburse permissions per quarterly RBAC audit."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {/* Permission Groups Matrix */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
          {PERMISSION_GROUPS.map((group) => {
            const groupPermCodes = group.permissions.map((p) => p.code);
            const isAllSelected = groupPermCodes.every((p) => selectedPermissions.includes(p));

            return (
              <div key={group.moduleName} className="p-3 border border-slate-200 rounded-lg bg-white space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900">{group.moduleName}</span>
                  {!isProtectedRole && (
                    <button
                      type="button"
                      onClick={() => handleSelectModuleGroup(groupPermCodes)}
                      className="text-[11px] font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                    >
                      {isAllSelected ? 'Clear Module' : 'Select All Module'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {group.permissions.map((perm) => {
                    const isChecked = isProtectedRole || selectedPermissions.includes(perm.code);
                    return (
                      <button
                        key={perm.code}
                        type="button"
                        onClick={() => handleTogglePermission(perm.code)}
                        disabled={isProtectedRole}
                        className={`p-2 rounded border text-left flex items-start gap-2 transition-colors ${
                          isChecked
                            ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-semibold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs">{perm.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{perm.code}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Matrix Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
};
