'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle2, FileCheck2, LockKeyhole, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PhoneInputWithCountryCode } from '@/components/ui/PhoneInputWithCountryCode';
import { externalSignupService, type ExternalApplicantRole } from '@/services/externalSignupService';

const initialFiles = { AADHAAR: null, PAN: null, CANCELLED_CHEQUE: null, GST_CERTIFICATE: null };

export default function SignupPage() {
  const [role, setRole] = useState<ExternalApplicantRole>('RETAILER');
  const [countryCode, setCountryCode] = useState('+91');
  const [fields, setFields] = useState({ fullName: '', businessName: '', email: '', mobile: '', address: '', city: '', state: '', postalCode: '' });
  const [documents, setDocuments] = useState<Record<keyof typeof initialFiles, File | null>>(initialFiles);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<{ reference: string } | null>(null);
  const update = (key: keyof typeof fields, value: string) => setFields((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!documents.AADHAAR || !documents.PAN || !documents.CANCELLED_CHEQUE) return;
    setSubmitting(true);
    try {
      setReference(externalSignupService.submit({ role, ...fields, mobile: `${countryCode} ${fields.mobile}`.trim(), documents }));
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-5">
        <section className="w-full max-w-lg p-8 text-center sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950">Application submitted</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Your account is not active yet. Qin Star Pay administrators will verify your KYC documents before enabling login access.</p>
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">Application reference</span><strong className="ml-2 font-mono text-[#0F4C81]">{reference.reference}</strong></div>
          <Link href="/login" className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#0F4C81] hover:underline"><ArrowLeft className="h-4 w-4" />Return to sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="min-h-screen w-full bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-8">
          <Link href="/login" className="flex items-center gap-3"><Image src="/logo.jpeg" alt="Qin Star Pay" width={44} height={44} className="h-11 w-11 rounded-xl border border-slate-200 object-contain" /><div><p className="font-extrabold text-slate-950">QIN STAR PAY</p><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Partner onboarding</p></div></Link>
          <Link href="/login" className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0F4C81]"><ArrowLeft className="h-4 w-4" />Sign in</Link>
        </header>
        <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="bg-[#082f52] p-7 text-white sm:p-10">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><UserPlus className="h-6 w-6" /></span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Become a Qin Star Pay partner</h1>
            <p className="mt-3 text-sm leading-6 text-blue-100">Submit your business and KYC details securely. Every external application is reviewed by an administrator before activation.</p>
            <div className="mt-8 space-y-4 text-sm">
              <p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />KYC and business verification</p>
              <p className="flex gap-3"><FileCheck2 className="h-5 w-5 shrink-0 text-emerald-300" />Admin approval before access</p>
              <p className="flex gap-3"><LockKeyhole className="h-5 w-5 shrink-0 text-emerald-300" />No account access while pending</p>
            </div>
          </aside>
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F4C81]">New application</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950">Business and KYC details</h2><p className="mt-1 text-sm text-slate-500">Fields marked with * are required for review.</p></div>
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Select label="Applying as" required value={role} onChange={(event) => setRole(event.target.value as ExternalApplicantRole)} options={[{ value: 'RETAILER', label: 'Retailer' }, { value: 'DISTRIBUTOR', label: 'Distributor' }]} />
                <Input label="Full name" required value={fields.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Authorized person" />
                <Input label="Business / firm name" required value={fields.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Registered business name" />
                <PhoneInputWithCountryCode label="Mobile number" required value={fields.mobile} countryCode={countryCode} onPhoneChange={(val) => update('mobile', val)} onCountryCodeChange={setCountryCode} placeholder="10-digit mobile number" />
                <Input label="Email address" required type="email" value={fields.email} onChange={(e) => update('email', e.target.value)} placeholder="business@example.com" leftIcon={<Mail className="h-4 w-4" />} />
                <Input label="Postal code" required value={fields.postalCode} onChange={(e) => update('postalCode', e.target.value)} placeholder="Postal code" />
                <Input label="City" required value={fields.city} onChange={(e) => update('city', e.target.value)} placeholder="City" />
                <Input label="State" required value={fields.state} onChange={(e) => update('state', e.target.value)} placeholder="State" />
              </div>
              <Input label="Business address" required value={fields.address} onChange={(e) => update('address', e.target.value)} placeholder="Complete registered address" />
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0F4C81]"><Building2 className="h-4 w-4" /></span><div><h3 className="text-sm font-bold text-slate-900">KYC documents</h3><p className="text-xs text-slate-500">PNG, JPG or PDF files</p></div></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([['AADHAAR', 'Aadhaar Card *'], ['PAN', 'PAN Card *'], ['CANCELLED_CHEQUE', 'Cancelled Cheque / Passbook *'], ['GST_CERTIFICATE', 'GST Certificate']] as const).map(([key, label]) => <label key={key} className="flex cursor-pointer flex-col gap-2 text-xs font-bold text-slate-700"><span>{label}</span><input type="file" accept="image/png,image/jpeg,application/pdf" required={key !== 'GST_CERTIFICATE'} onChange={(e) => setDocuments((current) => ({ ...current, [key]: e.target.files?.[0] || null }))} className="min-h-11 cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-xs file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:font-bold file:text-[#0F4C81]" /></label>)}
                </div>
              </div>
              <Button type="submit" size="lg" fullWidth isLoading={submitting} leftIcon={<ShieldCheck className="h-4 w-4" />}>Submit for admin approval</Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
