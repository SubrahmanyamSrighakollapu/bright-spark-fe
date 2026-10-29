'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Fingerprint, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button, Card, Checkbox, Input, Select, useToast } from '@/components/ui';
import { AEPS_BANKS, AEPS_LIMITS, AEPS_DEVICES } from '@/mocks/mockAeps';
import { aepsService } from '@/services/aepsService';
import { isAEPSOperatorSessionValid, useAEPSStore } from '@/lib/aeps-store';
import type { AEPSCustomerInput, AEPSTransaction, AEPSServiceType } from '@/types/aeps';
import { BiometricSimulationModal } from './BiometricSimulationModal';
import { AepsResult } from './AepsResult';

const serviceLabels = { CASH_WITHDRAWAL: 'Cash Withdrawal', BALANCE_ENQUIRY: 'Balance Enquiry', MINI_STATEMENT: 'Mini Statement' } as const;

export function AepsServiceFlow({ serviceType }: { serviceType: Exclude<AEPSServiceType, 'CASH_DEPOSIT'> }) {
  const [form, setForm] = useState<AEPSCustomerInput>({ bankId: '', aadhaar: '', mobile: '', deviceId: 'MANTRA_L1', consent: false, amount: serviceType === 'CASH_WITHDRAWAL' ? 2000 : undefined });
  const [errors, setErrors] = useState<Record<string, string>>({}); const [biometricOpen, setBiometricOpen] = useState(false); const [processing, setProcessing] = useState(false); const [result, setResult] = useState<AEPSTransaction | null>(null);
  const addTransaction = useAEPSStore((state) => state.addTransaction);
  const operatorSessionExpiresAt = useAEPSStore((state) => state.operatorSessionExpiresAt);
  const operatorAuthenticated = isAEPSOperatorSessionValid(operatorSessionExpiresAt);
  const amountForOtp = useAEPSStore((state) => state.amountForOtp);
  const tranTypeForOtp = useAEPSStore((state) => state.tranTypeForOtp);
  const { toastError, toastSuccess } = useToast();
  const update = (key: keyof AEPSCustomerInput, value: string | boolean | number) => setForm((current) => ({ ...current, [key]: value }));
  const validate = () => { const next: Record<string, string> = {}; const aadhaar = form.aadhaar.replace(/\D/g, ''); const mobile = form.mobile.replace(/\D/g, ''); if (!form.bankId) next.bankId = 'Select a bank.'; if (!/^\d{12}$/.test(aadhaar)) next.aadhaar = 'Enter a valid 12-digit Aadhaar number.'; if (!/^[6-9]\d{9}$/.test(mobile)) next.mobile = 'Enter a valid 10-digit mobile number.'; if (!form.deviceId) next.deviceId = 'Select a registered biometric device.'; if (!form.consent) next.consent = 'Customer consent is required.'; if (serviceType === 'CASH_WITHDRAWAL' && (!form.amount || form.amount < AEPS_LIMITS.withdrawalMin || form.amount > AEPS_LIMITS.withdrawalMax)) next.amount = `Enter an amount from ₹${AEPS_LIMITS.withdrawalMin} to ₹${AEPS_LIMITS.withdrawalMax.toLocaleString('en-IN')}.`; setErrors(next); return Object.keys(next).length === 0; };
  const submit = (event: FormEvent) => { event.preventDefault(); if (validate()) setBiometricOpen(true); };
  const complete = async (pidData: string) => { setBiometricOpen(false); setProcessing(true); try {
    const bank = AEPS_BANKS.find((item) => item.id === form.bankId); if (!bank) throw new Error('Select a bank.');
    let otpReference: string | undefined;
    const requiresOtp = serviceType === 'CASH_WITHDRAWAL' && tranTypeForOtp === 'CW' && amountForOtp > 0 && Number(form.amount) >= amountForOtp;
    if (requiresOtp) { const otp = await aepsService.generateOtp({ amount: Number(form.amount), bankIin: bank.id, mobile: form.mobile, aadhaar: form.aadhaar }); otpReference = otp.otpReference; toastSuccess(otp.message); }
    const transaction = await aepsService.transact({ serviceType, amount: form.amount, bankName: bank.name, bankIin: bank.id, mobile: form.mobile, aadhaar: form.aadhaar, pidData, otpReference });
    addTransaction(transaction); setResult(transaction);
  } catch (error) { toastError(error instanceof Error ? error.message : 'AEPS transaction failed'); } finally { setProcessing(false); } };
  const reset = () => { setResult(null); setErrors({}); setForm((current) => ({ ...current, consent: false, amount: serviceType === 'CASH_WITHDRAWAL' ? 2000 : undefined })); };

  if (!operatorAuthenticated) return <Card><div className="flex min-h-80 flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-700"><LockKeyhole className="h-8 w-8" /></span><h2 className="mt-4 text-xl font-extrabold">Retailer AEPS login required</h2><p className="mt-2 max-w-md text-sm text-slate-500">Authenticate the retailer’s fingerprint to start the 24-hour AEPS session. Customer fingerprint authorization will still be required for this transaction.</p><Link href="/retailer/aeps" className="mt-5"><Button leftIcon={<Fingerprint className="h-4 w-4" />}>Go to AEPS Login</Button></Link></div></Card>;
  if (result) return <AepsResult transaction={result} onNew={reset} />;
  if (processing) return <Card><div className="flex min-h-80 flex-col items-center justify-center text-center"><Loader2 className="h-14 w-14 animate-spin text-[#2F6F5E]" /><h2 className="mt-4 text-xl font-extrabold">Processing AEPS Transaction</h2><p className="mt-2 text-sm text-slate-500">Authenticating the customer and processing the request. Do not hand over cash until a success response is displayed.</p></div></Card>;

  return <><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><Card title={serviceLabels[serviceType]} subtitle="Enter the customer details, obtain consent, and complete customer fingerprint authentication."><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><Select label="Customer Bank" required searchable value={form.bankId} onChange={(event) => update('bankId', event.target.value)} options={AEPS_BANKS.map((bank) => ({ label: bank.name, value: bank.id }))} error={errors.bankId} /><Input label="Aadhaar Number" required inputMode="numeric" maxLength={12} value={form.aadhaar} onChange={(event) => update('aadhaar', event.target.value.replace(/\D/g, ''))} error={errors.aadhaar} helperText="Only the masked last four digits are retained in transaction history." /><Input label="Customer Mobile Number" required inputMode="numeric" maxLength={10} value={form.mobile} onChange={(event) => update('mobile', event.target.value.replace(/\D/g, ''))} error={errors.mobile} />{serviceType === 'CASH_WITHDRAWAL' && <Input label="Withdrawal Amount" required type="number" min={AEPS_LIMITS.withdrawalMin} max={AEPS_LIMITS.withdrawalMax} value={form.amount || ''} onChange={(event) => update('amount', Number(event.target.value))} error={errors.amount} helperText="Permitted range: ₹100–₹10,000" />}<Select label="Registered Biometric Device" required value={form.deviceId} onChange={(event) => update('deviceId', event.target.value)} options={AEPS_DEVICES.map((device) => ({ label: device.name, value: device.id }))} error={errors.deviceId} containerClassName={serviceType === 'CASH_WITHDRAWAL' ? '' : 'md:col-span-2'} /></div><div><Checkbox label="Customer consent has been obtained for Aadhaar authentication and this AEPS service." checked={form.consent} onChange={(checked) => update('consent', checked)} />{errors.consent && <p className="mt-1 text-xs text-rose-600">{errors.consent}</p>}</div><div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"><Button variant="outline" type="button" onClick={reset}>Reset</Button><Button type="submit" leftIcon={<Fingerprint className="h-4 w-4" />}>Authenticate Customer</Button></div></form></Card>
    <Card title="Transaction Security" subtitle="Authentication requirements"><div className="space-y-3 text-xs"><div className="rounded-xl border border-[#D4E1AE] bg-[#F3F7E9] p-3 text-[#245448]"><ShieldCheck className="mr-1 inline h-4 w-4" />Retailer session verified</div><div className="rounded-xl border border-slate-200 p-3 text-slate-600">Customer consent and fingerprint authentication are required for every transaction.</div><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">For cash withdrawal, release cash only after the transaction is successful.</div></div></Card></div>
    <BiometricSimulationModal isOpen={biometricOpen} deviceName={AEPS_DEVICES.find((item) => item.id === form.deviceId)?.name || ''} onSuccess={(pidData) => void complete(pidData)} onFailure={(message) => toastError(message)} onClose={() => setBiometricOpen(false)} /></>;
}



