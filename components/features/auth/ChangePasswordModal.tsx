'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, Check, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Modal, PasswordInput } from '@/components/ui';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSaving(false);
    }
  }, [isOpen]);

  const rules = [
    { label: '8+ characters', valid: newPassword.length >= 8 },
    { label: 'Upper & lowercase', valid: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { label: 'Number', valid: /\d/.test(newPassword) },
    { label: 'Special character', valid: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('New passwords do not match.');
    if (!rules.every((rule) => rule.valid)) {
      return setError('Use at least 8 characters with uppercase, lowercase, number, and special character.');
    }
    if (currentPassword === newPassword) return setError('New password must be different from the current password.');

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);
    if (!result.success) return setError(result.error || 'Unable to change password.');
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? () => undefined : onClose}
      title="Change password"
      description="Use your current password to secure your Qin Star Pay account."
      size="md"
    >
      <form onSubmit={submit} className="space-y-4">
        <PasswordInput label="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" leftIcon={<KeyRound className="h-4 w-4" />} required />
        <PasswordInput label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" leftIcon={<LockKeyhole className="h-4 w-4" />} required />
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {rules.map((rule) => (
            <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] font-medium ${rule.valid ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full ${rule.valid ? 'bg-emerald-100' : 'bg-slate-200'}`}><Check className="h-2.5 w-2.5" /></span>
              {rule.label}
            </div>
          ))}
        </div>
        <PasswordInput label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" leftIcon={<LockKeyhole className="h-4 w-4" />} error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match.' : undefined} required />
        {error && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" isLoading={saving} leftIcon={<ShieldCheck className="h-4 w-4" />}>Update password</Button>
        </div>
      </form>
    </Modal>
  );
}
