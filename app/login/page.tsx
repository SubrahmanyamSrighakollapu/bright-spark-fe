'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, BadgeIndianRupee, Building2, CheckCircle2, ChevronDown, ChevronUp, Landmark, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDefaultRouteForRole } from '@/services/mockAuthService';
import { DEV_FEATURES } from '@/config/devFeatures';
import { captureLoginLocation } from '@/utils/geolocation';
import type { LoginLocation } from '@/utils/geolocation';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';

const demoAccounts = [
  ['Platform Admin', 'admin@qinstarpay.com', 'Admin@1234567'],
  ['KYC Manager', 'kyc@qinstarpay.com', 'Demo@123456'],
  ['Sales Lead', 'sales@qinstarpay.com', 'Demo@123456'],
  ['Accountant', 'accounts@qinstarpay.com', 'Demo@123456'],
  ['Operations', 'ops@qinstarpay.com', 'Demo@123456'],
  ['Master Distributor', 'md@qinstarpay.com', 'Demo@123456'],
  ['Distributor', 'distributor@qinstarpay.com', 'Demo@123456'],
  ['Retailer', 'retailer@qinstarpay.com', 'Demo@123456'],
] as const;

function locationErrorMessage(location: LoginLocation): string {
  if (location.locationStatus === 'DENIED') {
    return 'Location access is required to sign in. Allow location permission in your browser settings and try again.';
  }
  if (location.locationStatus === 'TIMEOUT') {
    return 'Location selection was not completed. Please try again and choose Allow when the browser asks for location access.';
  }
  if (location.locationStatus === 'UNSUPPORTED') {
    return 'Location access is not available in this browser or connection. Use a supported browser over a secure connection.';
  }
  if (location.locationStatus === 'UNAVAILABLE') {
    return 'Your location could not be determined. Enable device location services and try again.';
  }
  return 'Unable to capture your location. Please enable location access and try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const { session, isAuthenticated, isLoading, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && session) router.replace(getDefaultRouteForRole(session.role));
  }, [isLoading, isAuthenticated, session, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = { identifier: identifier.trim() ? undefined : 'Username, email, or mobile number is required.', password: password ? undefined : 'Password is required.' };
    setFieldErrors(errors);
    setErrorMessage(null);
    if (errors.identifier || errors.password) return;
    setIsSubmitting(true);
    try {
      const location = await captureLoginLocation();
      const hasLocation = location.locationStatus === 'GRANTED'
        && typeof location.latitude === 'number'
        && typeof location.longitude === 'number';
      if (!hasLocation) {
        setErrorMessage(locationErrorMessage(location));
        return;
      }

      const result = await login(identifier, password, rememberMe, location);
      if (result.success && result.defaultRoute) {
        router.push(result.defaultRoute);
      } else {
        setErrorMessage(result.error || 'Invalid credentials or account restricted.');
      }
    } catch {
      setErrorMessage('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMessage(null);
    setFieldErrors({});
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-semibold text-white">Preparing your secure workspace…</div>;

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full bg-white lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#082f52] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3"><Image src="/logo.jpeg" alt="Qin Star Pay" width={52} height={52} priority className="h-13 w-13 rounded-2xl border border-white/20 bg-white object-contain p-1" /><div><p className="text-lg font-extrabold tracking-tight">QIN STAR PAY</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">Fintech workspace</p></div></div>
            <div className="mt-20 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100"><Sparkles className="h-3.5 w-3.5" />Secure payment operations</span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">One platform for your entire payment network.</h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100">Manage collections, payouts, wallets, settlements, commissions, partner onboarding, and compliance from a role-aware financial operations platform.</p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[['Pay-In', BadgeIndianRupee], ['Settlements', Landmark], ['Network', Building2]].map(([label, Icon]) => <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Icon className="h-5 w-5 text-orange-300" /><p className="mt-3 text-xs font-bold">{label as string}</p></div>)}
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-blue-200"><ShieldCheck className="h-4 w-4 text-emerald-300" />Role-based access • KYC controlled • Audit ready</div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10 xl:p-14">
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center gap-3 lg:hidden"><Image src="/logo.jpeg" alt="Qin Star Pay" width={46} height={46} className="h-12 w-12 rounded-xl border border-slate-200 object-contain" /><div><p className="font-extrabold text-slate-950">QIN STAR PAY</p><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Fintech workspace</p></div></div>
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F4C81]">Secure sign in</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Welcome back</h2><p className="mt-2 text-sm leading-6 text-slate-500">Access the workspace assigned to your Qin Star Pay role.</p></div>
            {errorMessage && <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium leading-5 text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{errorMessage}</div>}
            <form onSubmit={submit} className="mt-7 space-y-4">
              <FormField label="Username, email or mobile" required error={fieldErrors.identifier}><Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter your registered identity" className="h-11" leftIcon={<Mail className="h-4 w-4" />} autoComplete="username" /></FormField>
              <FormField label="Password" required error={fieldErrors.password}><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-11" leftIcon={<Lock className="h-4 w-4" />} autoComplete="current-password" /></FormField>
              <div className="flex items-center justify-between"><Checkbox checked={rememberMe} onChange={setRememberMe} label={<span className="text-xs font-medium">Remember me</span>} /><button type="button" onClick={() => setForgotOpen(true)} className="cursor-pointer text-xs font-bold text-[#0F4C81] hover:underline">Forgot password?</button></div>
              <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} rightIcon={<ArrowRight className="h-4 w-4" />}>Sign in securely</Button>
            </form>
            <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200" /><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">New partner?</span><span className="h-px flex-1 bg-slate-200" /></div>
            <Link href="/signup" className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition-colors hover:border-[#0F4C81] hover:bg-blue-50 hover:text-[#0F4C81]">Apply for an account <ArrowRight className="h-4 w-4" /></Link>

            {DEV_FEATURES.showDemoCredentials && <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3"><button type="button" onClick={() => setShowDemoAccounts((value) => !value)} className="flex w-full cursor-pointer items-center justify-between text-xs font-bold text-slate-600"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0F4C81]" />Demo workspaces</span>{showDemoAccounts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>{showDemoAccounts && <div className="mt-3 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto">{demoAccounts.map(([label, email, pass]) => <button key={email} type="button" onClick={() => fillDemoAccount(email, pass)} className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"><span className="block text-[11px] font-bold text-slate-800">{label}</span><span className="mt-0.5 block truncate text-[9px] text-slate-500">{email}</span></button>)}</div>}</div>}
            <p className="mt-7 text-center text-[11px] text-slate-400">Protected by Qin Star Pay security and access controls.</p>
          </div>
        </section>
      </div>

      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Password recovery" description="Account recovery requires identity verification." size="sm"><div className="space-y-5"><div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-900"><CheckCircle2 className="h-5 w-5 shrink-0" />Contact your platform administrator or support desk. Reset instructions will only be sent to registered contact details.</div><div className="flex justify-end"><Button size="sm" onClick={() => setForgotOpen(false)}>Understood</Button></div></div></Modal>
    </main>
  );
}
