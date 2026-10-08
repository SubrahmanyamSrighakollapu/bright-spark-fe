'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BusinessEntity } from '@/types/domain';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { userService } from '@/services/userService';

import { useToast } from '@/components/ui/Toast';

export interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: BusinessEntity | null;
  onSuccess?: () => void;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  entity,
  onSuccess,
}) => {
  const { toastSuccess, toastError } = useToast();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!entity) return null;

  const isBlocked = entity.status === 'BLOCKED' || entity.status === 'SUSPENDED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = isBlocked
        ? await userService.unblockUser(entity.id)
        : await userService.blockUser(entity.id, reason);

      if (res && res.success) {
        toastSuccess(`Account ${entity.code || entity.name} ${isBlocked ? 'unblocked' : 'blocked'} successfully.`);
        setReason('');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toastError(res?.message || 'Failed to change user block status.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to change user block status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBlocked ? 'Unblock User Account' : 'Block User Account'}
      description={
        isBlocked
          ? `Restore active status for ${entity.name} (${entity.code})`
          : `Restrict system access for ${entity.name} (${entity.code})`
      }
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Account Code:</span>
            <span className="font-mono font-bold text-[var(--primary)]">{entity.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Entity Name:</span>
            <span className="font-semibold">{entity.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status:</span>
            <StatusBadge status={entity.status} size="sm" />
          </div>
          {isBlocked && entity.blockedReason && (
            <div className="pt-1.5 border-t border-slate-200 text-rose-800">
              <strong>Block Reason:</strong> {entity.blockedReason}
            </div>
          )}
        </div>

        {!isBlocked && (
          <Input
            label="Reason for Blocking *"
            placeholder="e.g. Audit pending / suspicious activity"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isBlocked ? 'primary' : 'danger'}
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={
              isBlocked ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )
            }
          >
            {isBlocked ? 'Unblock Account' : 'Confirm Block'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
