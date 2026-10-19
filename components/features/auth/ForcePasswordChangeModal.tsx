'use client';

import { FormEvent, useState } from 'react';
import { Button, PasswordInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Check, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';

export function ForcePasswordChangeModal() {
  const { session, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const passwordRules = [
    { label: '8+ characters', valid: newPassword.length >= 8 },
    { label: 'Upper & lowercase', valid: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { label: 'Number', valid: /\d/.test(newPassword) },
    { label: 'Special character', valid: /[^A-Za-z0-9]/.test(newPassword) },
  ];

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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="force-password-title">
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_28px_80px_-20px_rgba(15,23,42,0.55)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2F6F5E] to-[#3D765F] px-6 py-6 text-white sm:px-7">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-inner"><ShieldCheck className="h-6 w-6" /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">Account security</p><h2 id="force-password-title" className="mt-1 text-xl font-bold">Create your new password</h2><p className="mt-1.5 text-xs leading-5 text-blue-100">Replace your temporary password to securely access Bright Spark.</p></div>
          </div>
        </div>
        <div className="space-y-4 px-6 py-6 sm:px-7">
          <PasswordInput label="Current temporary password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" leftIcon={<KeyRound className="h-4 w-4" />} required />
          <PasswordInput label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" leftIcon={<LockKeyhole className="h-4 w-4" />} required />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {passwordRules.map((rule) => <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] font-medium ${rule.valid ? 'text-emerald-700' : 'text-slate-500'}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full ${rule.valid ? 'bg-emerald-100' : 'bg-slate-200'}`}><Check className="h-2.5 w-2.5" /></span>{rule.label}</div>)}
          </div>
          <PasswordInput label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" leftIcon={<LockKeyhole className="h-4 w-4" />} error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match.' : undefined} required />
          {error && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          <Button type="submit" size="lg" fullWidth isLoading={saving} leftIcon={<ShieldCheck className="h-4 w-4" />}>Update password and continue</Button>
          <p className="text-center text-[10px] text-slate-400">For your protection, this step cannot be skipped.</p>
        </div>
      </form>
    </div>
  );
}
