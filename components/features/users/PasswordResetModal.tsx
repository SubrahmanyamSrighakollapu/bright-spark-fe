'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BusinessEntity } from '@/types/domain';
import { userService } from '@/services/userService';
import { Key, Mail, Copy, Check, CheckCircle2 } from 'lucide-react';

import { useToast } from '@/components/ui/Toast';
import { useConfirmation } from '@/context/ConfirmationContext';

export interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: BusinessEntity | null;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  entity,
}) => {
  const { toastError } = useToast();
  const confirm = useConfirmation();
  const [resetMode, setResetMode] = useState<'LINK' | 'TEMP_PASSWORD'>('LINK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; tempPassword?: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!entity) return null;

  const handleReset = async () => {
    if (!(await confirm({ title: 'Reset user password?', message: `Reset the password for ${entity.name} (${entity.code})? Their existing credentials may stop working.`, confirmText: 'Yes, reset password', variant: 'danger' }))) return;
    setIsSubmitting(true);
    try {
      const res = await userService.requestPasswordReset(entity.id, resetMode);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        toastError(res?.message || 'Password reset request failed.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Password reset request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setResult(null);
    setResetMode('LINK');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Reset User Password"
      description={`Initiate credential reset for ${entity.name} (${entity.code})`}
      size="sm"
    >
      {result ? (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-950 block">Password Action Dispatched</span>
              <p className="text-emerald-800">{result.message}</p>
            </div>
          </div>

          {result.tempPassword && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">
                Demo Temporary Password (Demo Only)
              </span>
              <div className="flex items-center justify-between p-2 bg-white border border-amber-300 rounded font-mono font-bold text-sm text-slate-900">
                <span>{result.tempPassword}</span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-1 text-slate-500 hover:text-slate-900"
                  title="Copy Password"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-amber-800">
                User will be forced to change this password on next login.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={handleCloseModal}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Target User:</span>
              <span className="font-bold">{entity.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span>{entity.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-slate-800 block">Select Reset Method:</label>

            <button
              type="button"
              onClick={() => setResetMode('LINK')}
              className={`w-full p-3 text-left border rounded-lg flex items-start gap-3 transition-colors ${
                resetMode === 'LINK'
                  ? 'border-[var(--primary)] bg-blue-50/50 text-[var(--primary)] ring-1 ring-[var(--primary)]'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-xs">Send Secure Reset Link (Recommended)</span>
                <span className="text-[11px] text-slate-500 block">
                  Dispatches password reset instructions directly to registered email & mobile.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setResetMode('TEMP_PASSWORD')}
              className={`w-full p-3 text-left border rounded-lg flex items-start gap-3 transition-colors ${
                resetMode === 'TEMP_PASSWORD'
                  ? 'border-[var(--primary)] bg-blue-50/50 text-[var(--primary)] ring-1 ring-[var(--primary)]'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Key className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-xs">Generate Demo Temporary Password</span>
                <span className="text-[11px] text-slate-500 block">
                  Generates an immediate single-use temporary password for support reference.
                </span>
              </div>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleReset} isLoading={isSubmitting}>
              Proceed with Reset
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
