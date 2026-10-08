'use client';

import { FormEvent, useState } from 'react';
import { Button, PasswordInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function ForcePasswordChangeModal() {
  const { session, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!session?.mustChangePassword) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('New passwords do not match.');
    if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return setError('Use at least 8 characters with uppercase, lowercase, number, and special character.');
    }
    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);
    if (!result.success) setError(result.error || 'Unable to change password.');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="force-password-title">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 id="force-password-title" className="text-xl font-semibold text-slate-900">Create your new password</h2>
        <p className="mt-2 text-sm text-slate-600">For security, you must replace the temporary password before using Qin Star Pay.</p>
        <div className="mt-6 space-y-4">
          <PasswordInput label="Current temporary password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
          <PasswordInput label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" helperText="Minimum 8 characters with uppercase, lowercase, number, and special character." required />
          <PasswordInput label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </div>
        <Button type="submit" fullWidth isLoading={saving} className="mt-6">Update password and continue</Button>
      </form>
    </div>
  );
}
