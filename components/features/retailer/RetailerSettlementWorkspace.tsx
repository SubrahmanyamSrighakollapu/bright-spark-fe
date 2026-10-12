'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeIndianRupee,
  BanknoteArrowUp,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  CreditCard,
  FileCheck2,
  Info,
  Landmark,
  LockKeyhole,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Checkbox, Input, Select, TextArea, useToast } from '@/components/ui';
import { cn } from '@/utils/cn';
import { payoutChargeService, type PayoutChargeResolution, type PayoutMode } from '@/services/payoutChargeService';
import { walletService } from '@/services/walletService';

type WorkspaceTab = 'REGISTER' | 'SETTLEMENT' | 'DELETE' | 'LIMIT' | 'KYC';
type VerificationState = 'IDLE' | 'VERIFIED';

interface RegisteredBank {
  id: string;
  accountType: string;
  contact: string;
  holderName: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  status: 'VERIFIED';
}

const initialBanks: RegisteredBank[] = [
  { id: 'bank-1', accountType: 'CURRENT', contact: '9876543210', holderName: 'Qin Star Retail Point', accountNumber: '621000004128', bankName: 'HDFC Bank', ifsc: 'HDFC0001287', status: 'VERIFIED' },
  { id: 'bank-2', accountType: 'SAVINGS', contact: '9876543210', holderName: 'Demo Retailer', accountNumber: '410001884561', bankName: 'State Bank of India', ifsc: 'SBIN0004752', status: 'VERIFIED' },
];

const tabs: Array<{ id: WorkspaceTab; label: string; hint: string; icon: React.ElementType }> = [
  { id: 'REGISTER', label: 'Register Bank', hint: 'Add and verify', icon: Building2 },
  { id: 'SETTLEMENT', label: 'Settlement', hint: 'Transfer funds', icon: BanknoteArrowUp },
  { id: 'DELETE', label: 'Delete Bank', hint: 'Remove account', icon: Trash2 },
  { id: 'LIMIT', label: 'Upgrade Limit', hint: 'Request increase', icon: CircleGauge },
  { id: 'KYC', label: 'KYC Status', hint: 'Review eligibility', icon: FileCheck2 },
];

const bankOptions = [
  { value: 'HDFC Bank', label: 'HDFC Bank' },
  { value: 'State Bank of India', label: 'State Bank of India' },
  { value: 'ICICI Bank', label: 'ICICI Bank' },
  { value: 'Axis Bank', label: 'Axis Bank' },
  { value: 'Punjab National Bank', label: 'Punjab National Bank' },
];
const accountTypes = [{ value: 'CURRENT', label: 'Current Account' }, { value: 'SAVINGS', label: 'Savings Account' }];
const transferModes = [{ value: 'IMPS', label: 'IMPS — Instant' }, { value: 'NEFT', label: 'NEFT' }, { value: 'RTGS', label: 'RTGS' }];

const maskAccount = (value: string) => `•••• ${value.slice(-4)}`;
const formatMoney = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

function SectionTitle({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return <div className="flex items-start gap-3 border-b border-slate-100 pb-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F4C81]"><Icon className="h-5 w-5" /></span><div><h2 className="text-base font-extrabold text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <Input label={label} value={value} disabled className="font-medium" />;
}

export function RetailerSettlementWorkspace() {
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('REGISTER');
  const [banks, setBanks] = useState<RegisteredBank[]>(initialBanks);
  const [verification, setVerification] = useState<VerificationState>('IDLE');
  const [register, setRegister] = useState({ accountType: '', contact: '', holderName: '', accountNumber: '', confirmAccount: '', bankName: '', ifsc: '' });
  const [mobileSearch, setMobileSearch] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('IMPS');
  const [pin, setPin] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [deleteMobile, setDeleteMobile] = useState('');
  const [deleteBankId, setDeleteBankId] = useState('');
  const [requestedLimit, setRequestedLimit] = useState('');
  const [limitReason, setLimitReason] = useState('');
  const [resolvedChargeResult, setResolvedChargeResult] = useState<PayoutChargeResolution | null>(null);
  const [chargeError, setChargeError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState({ total: 0, hold: 0, available: 0 });

  useEffect(() => {
    let active = true;
    walletService.getBalance()
      .then((response) => {
        if (!active || !response.data) return;
        const data = response.data as typeof response.data & { ledgerBalance?: number; holdBalance?: number };
        const hold = Number(data.holdBalance ?? data.lienAmount ?? 0);
        const reportedAvailable = Number(data.availableBalance ?? 0);
        const total = Number(data.ledgerBalance ?? reportedAvailable + hold);
        setWalletBalance({ total, hold, available: Math.max(0, total - hold) });
      })
      .catch(() => {
        if (active) setWalletBalance({ total: 0, hold: 0, available: 0 });
      });
    return () => { active = false; };
  }, []);

  const selectedBank = banks.find((bank) => bank.id === selectedBankId);
  const deleteBank = banks.find((bank) => bank.id === deleteBankId);
  const matchedBanks = useMemo(() => mobileSearch.length === 10 ? banks.filter((bank) => bank.contact === mobileSearch) : [], [banks, mobileSearch]);
  const matchedDeleteBanks = useMemo(() => deleteMobile.length === 10 ? banks.filter((bank) => bank.contact === deleteMobile) : [], [banks, deleteMobile]);
  const settlementBalance = walletBalance.available;
  const amountValue = Number(amount || 0);
  const resolvedCharge = resolvedChargeResult
    && resolvedChargeResult.rule.payoutMode === mode
    && amountValue >= resolvedChargeResult.rule.minAmount
    && amountValue <= resolvedChargeResult.rule.maxAmount
    ? resolvedChargeResult
    : null;
  const bankFee = resolvedCharge?.charge ?? 0;

  useEffect(() => {
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) {
        setChargeError(null);
      }
      payoutChargeService.resolve(mode as PayoutMode, amountValue)
        .then((response) => {
          if (!active) return;
          setResolvedChargeResult(response.data ?? null);
          if (!response.data) setChargeError(`No ${mode} charge range is configured for this amount.`);
        })
        .catch((error: unknown) => {
          if (!active) return;
          setResolvedChargeResult(null);
          setChargeError(error instanceof Error ? error.message : `No ${mode} charge range is configured for this amount.`);
        });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [mode, amountValue]);

  const updateRegister = (key: keyof typeof register, value: string) => {
    setRegister((current) => ({ ...current, [key]: value }));
    setVerification('IDLE');
  };

  const verifyBeneficiary = () => {
    const validAccount = /^\d{9,18}$/.test(register.accountNumber);
    const validIfsc = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(register.ifsc.toUpperCase());
    if (!register.accountType || !/^\d{10}$/.test(register.contact) || !register.holderName.trim() || !validAccount || register.accountNumber !== register.confirmAccount || !register.bankName || !validIfsc) {
      toastError('Complete all bank details and ensure the account numbers match before verification.');
      return;
    }
    setVerification('VERIFIED');
    toastSuccess('Beneficiary details passed validation. Provider verification will be connected through the API.');
  };

  const registerBank = () => {
    if (verification !== 'VERIFIED') { toastError('Verify the beneficiary before registering this bank account.'); return; }
    const bank: RegisteredBank = { id: `bank-${Date.now()}`, accountType: register.accountType, contact: register.contact, holderName: register.holderName.trim(), accountNumber: register.accountNumber, bankName: register.bankName, ifsc: register.ifsc.toUpperCase(), status: 'VERIFIED' };
    setBanks((current) => [...current, bank]);
    setRegister({ accountType: '', contact: '', holderName: '', accountNumber: '', confirmAccount: '', bankName: '', ifsc: '' });
    setVerification('IDLE');
    toastSuccess('Bank added successfully. Database registration will be connected in the next API phase.');
    setActiveTab('SETTLEMENT');
    setMobileSearch(bank.contact);
    setSelectedBankId(bank.id);
  };

  const submitSettlement = () => {
    if (!/^\d{10}$/.test(mobileSearch) || !selectedBank) { toastError('Enter the registered mobile number and select a verified bank account.'); return; }
    if (amountValue <= 0) { toastError('Enter a valid settlement amount.'); return; }
    if (amountValue + bankFee > settlementBalance) { toastError(`Insufficient available balance. ${formatMoney(walletBalance.hold)} is currently on hold.`); return; }
    if (!resolvedCharge) { toastError(chargeError ?? `No payout charge is configured for ${mode} at this amount. Contact the administrator.`); return; }
    if (!/^\d{4,6}$/.test(pin) || !termsAccepted) { toastError('Enter the transaction PIN and accept the settlement terms.'); return; }
    toastInfo('Settlement form is ready. Transaction submission will be enabled after the payout provider API is integrated.');
  };

  const removeBank = () => {
    if (!deleteBank) { toastError('Search by mobile number and select the bank account to remove.'); return; }
    setBanks((current) => current.filter((bank) => bank.id !== deleteBank.id));
    setDeleteBankId('');
    toastSuccess('Bank removed successfully. API persistence will be added in the integration phase.');
  };

  const switchTab = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    setVerification('IDLE');
  };

  return (
    <PageContainer fullWidth className="max-w-[1500px]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-38px_rgba(15,76,129,0.45)]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#082F52] via-[#0F4C81] to-[#1769A5] px-5 py-7 text-white sm:px-8 lg:px-10">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10"><Landmark className="h-6 w-6" /></span><div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-100">Secure settlement desk</span></div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Bank Settlement &amp; Pay-Out</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Register verified bank accounts, initiate retailer settlements, manage limits, and review payout eligibility.</p></div></div>
            <div className="grid grid-cols-2 gap-3 sm:flex"><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Available settlement</p><p className="mt-1 text-lg font-extrabold">{formatMoney(settlementBalance)}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Registered banks</p><p className="mt-1 text-lg font-extrabold">{banks.length}</p></div></div>
          </div>
        </div>

        <nav className="grid border-b border-slate-200 bg-slate-50/70 sm:grid-cols-2 lg:grid-cols-5" aria-label="Settlement workflow">
          {tabs.map(({ id, label, hint, icon: Icon }) => <button key={id} type="button" onClick={() => switchTab(id)} className={cn('group relative flex cursor-pointer items-center gap-3 border-b border-slate-200 px-5 py-4 text-left transition-colors lg:border-b-0 lg:border-r last:border-r-0', activeTab === id ? 'bg-white text-[#0F4C81]' : 'text-slate-500 hover:bg-white hover:text-slate-800')}><span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors', activeTab === id ? 'bg-[#0F4C81] text-white shadow-sm' : 'bg-white text-slate-400 ring-1 ring-slate-200 group-hover:text-[#0F4C81]')}><Icon className="h-4.5 w-4.5" /></span><span><span className="block text-xs font-extrabold uppercase tracking-wide">{label}</span><span className="mt-0.5 block text-[10px] text-slate-400">{hint}</span></span>{activeTab === id && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#F97316]" />}</button>)}
        </nav>

        <div className="bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.05),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%)] p-4 sm:p-7 lg:p-9">
          {activeTab === 'REGISTER' && <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle icon={Building2} title="Register a settlement bank" description="Verify beneficiary ownership before making the account available for settlements." /><div className="mt-6 grid gap-5 md:grid-cols-2"><Select label="Settlement account type" required value={register.accountType} onChange={(e) => updateRegister('accountType', e.target.value)} options={accountTypes} placeholder="Select account type" /><Input label="Registered mobile number" required value={register.contact} onChange={(e) => updateRegister('contact', e.target.value.replace(/\D/g, '').slice(0, 10))} leftIcon={<Phone className="h-4 w-4" />} placeholder="10-digit mobile number" /><Input label="Account holder name" required value={register.holderName} onChange={(e) => updateRegister('holderName', e.target.value)} leftIcon={<UserRound className="h-4 w-4" />} placeholder="Name as per bank records" /><Select label="Bank name" required searchable value={register.bankName} onChange={(e) => updateRegister('bankName', e.target.value)} options={bankOptions} placeholder="Search and select bank" /><Input label="Bank account number" required value={register.accountNumber} onChange={(e) => updateRegister('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))} leftIcon={<CreditCard className="h-4 w-4" />} placeholder="9–18 digit account number" /><Input label="Confirm bank account number" required value={register.confirmAccount} onChange={(e) => updateRegister('confirmAccount', e.target.value.replace(/\D/g, '').slice(0, 18))} leftIcon={<CreditCard className="h-4 w-4" />} placeholder="Re-enter account number" error={register.confirmAccount && register.confirmAccount !== register.accountNumber ? 'Account numbers do not match.' : undefined} /><Input label="IFSC code" required value={register.ifsc} onChange={(e) => updateRegister('ifsc', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))} leftIcon={<Landmark className="h-4 w-4" />} placeholder="e.g. HDFC0001287" containerClassName="md:col-span-2" /></div>{verification === 'VERIFIED' && <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="h-5 w-5 shrink-0" /><div><p className="font-bold">Beneficiary verification passed</p><p className="mt-0.5 text-xs text-emerald-700">The account is ready for registration.</p></div></div>}<div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => setRegister({ accountType: '', contact: '', holderName: '', accountNumber: '', confirmAccount: '', bankName: '', ifsc: '' })}>Clear form</Button><Button variant="secondary" leftIcon={<ShieldCheck className="h-4 w-4" />} onClick={verifyBeneficiary}>Verify beneficiary</Button><Button leftIcon={<Check className="h-4 w-4" />} disabled={verification !== 'VERIFIED'} onClick={registerBank}>Register bank</Button></div></div>}

          {activeTab === 'SETTLEMENT' && <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle icon={BanknoteArrowUp} title="Initiate settlement" description="Find the retailer by mobile number, select a verified bank, and enter the settlement amount." /><div className="mt-6 grid gap-5 md:grid-cols-2"><Input label="Registered mobile number" required value={mobileSearch} onChange={(e) => { setMobileSearch(e.target.value.replace(/\D/g, '').slice(0, 10)); setSelectedBankId(''); }} leftIcon={<Search className="h-4 w-4" />} placeholder="Search by 10-digit mobile" /><Select label="Settlement bank" required disabled={matchedBanks.length === 0} value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} options={matchedBanks.map((bank) => ({ value: bank.id, label: `${bank.bankName} — ${maskAccount(bank.accountNumber)}` }))} placeholder={mobileSearch.length === 10 ? 'Select registered bank' : 'Enter mobile number first'} />{selectedBank && <><ReadOnlyField label="Account holder" value={selectedBank.holderName} /><ReadOnlyField label="Account number" value={maskAccount(selectedBank.accountNumber)} /><ReadOnlyField label="Bank name" value={selectedBank.bankName} /><ReadOnlyField label="IFSC code" value={selectedBank.ifsc} /></>}<Input label="Settlement amount" required type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} leftIcon={<BadgeIndianRupee className="h-4 w-4" />} placeholder="Enter amount" error={amountValue > settlementBalance ? 'Amount exceeds the available settlement balance.' : amountValue > 0 && !resolvedCharge ? `No ${mode} charge range is configured for this amount.` : undefined} /><Select label="Transfer mode" required value={mode} onChange={(e) => setMode(e.target.value)} options={transferModes} /><Input label="Transaction PIN" required type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} leftIcon={<LockKeyhole className="h-4 w-4" />} placeholder="Enter 4–6 digit PIN" containerClassName="md:col-span-2" /></div><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><Checkbox checked={termsAccepted} onChange={setTermsAccepted} label={<span className="text-xs leading-5 text-slate-700">I confirm the beneficiary, bank, amount, and applicable settlement charges and agree to the settlement terms.</span>} /></div><div className="mt-6 flex justify-end"><Button size="lg" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={submitSettlement}>Review &amp; submit settlement</Button></div></div><aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Settlement summary</p><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between text-slate-600"><span>Available balance</span><strong className="text-slate-950">{formatMoney(settlementBalance)}</strong></div><div className="flex justify-between text-slate-600"><span>Transfer amount</span><strong className="text-slate-950">{formatMoney(amountValue)}</strong></div><div className="flex justify-between text-slate-600"><span>Configured flat charge</span><strong className={resolvedCharge || amountValue === 0 ? 'text-slate-950' : 'text-rose-600'}>{amountValue === 0 ? formatMoney(0) : resolvedCharge ? formatMoney(bankFee) : 'Not configured'}</strong></div>{resolvedCharge && <div className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-800">Matched {resolvedCharge.rule.payoutMode} range: {formatMoney(resolvedCharge.rule.minAmount)} – {formatMoney(resolvedCharge.rule.maxAmount)}</div>}<div className="border-t border-dashed border-slate-200 pt-3"><div className="flex justify-between"><span className="font-bold text-slate-700">Total debit</span><strong className="text-lg text-[#0F4C81]">{formatMoney(amountValue && resolvedCharge ? amountValue + bankFee : 0)}</strong></div></div></div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-sm font-bold text-amber-900">Before you submit</p><p className="mt-1 text-xs leading-5 text-amber-800">Only verified bank accounts linked to the searched mobile number can be selected. The flat charge is resolved from Admin Settings by transfer mode and amount range.</p></div></div></div></aside></div>}

          {activeTab === 'DELETE' && <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle icon={Trash2} title="Remove a registered bank" description="Search the registered mobile number and carefully select the account to remove." /><div className="mt-6 grid gap-5 md:grid-cols-2"><Input label="Registered mobile number" required value={deleteMobile} onChange={(e) => { setDeleteMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setDeleteBankId(''); }} leftIcon={<Search className="h-4 w-4" />} placeholder="Search by mobile number" /><Select label="Registered bank" required disabled={matchedDeleteBanks.length === 0} value={deleteBankId} onChange={(e) => setDeleteBankId(e.target.value)} options={matchedDeleteBanks.map((bank) => ({ value: bank.id, label: `${bank.bankName} — ${maskAccount(bank.accountNumber)}` }))} placeholder="Select bank to remove" />{deleteBank && <div className="md:col-span-2 grid gap-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 sm:grid-cols-3"><div><p className="text-[10px] font-bold uppercase text-slate-400">Account holder</p><p className="mt-1 text-sm font-bold text-slate-900">{deleteBank.holderName}</p></div><div><p className="text-[10px] font-bold uppercase text-slate-400">Account</p><p className="mt-1 text-sm font-bold text-slate-900">{maskAccount(deleteBank.accountNumber)}</p></div><div><p className="text-[10px] font-bold uppercase text-slate-400">IFSC</p><p className="mt-1 text-sm font-bold text-slate-900">{deleteBank.ifsc}</p></div></div>}</div><div className="mt-6 flex justify-end"><Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} disabled={!deleteBank} onClick={removeBank}>Delete selected bank</Button></div></div>}

          {activeTab === 'LIMIT' && <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle icon={CircleGauge} title="Request settlement limit upgrade" description="Submit the desired daily limit and business justification for review." /><div className="mt-6 grid gap-5 md:grid-cols-2"><ReadOnlyField label="Current daily settlement limit" value={formatMoney(200000)} /><Input label="Requested daily limit" required type="number" min="200001" value={requestedLimit} onChange={(e) => setRequestedLimit(e.target.value)} leftIcon={<BadgeIndianRupee className="h-4 w-4" />} placeholder="Enter requested limit" /><TextArea label="Business justification" required value={limitReason} onChange={(e) => setLimitReason(e.target.value)} placeholder="Explain the expected settlement volume and reason for the increase" containerClassName="md:col-span-2" /></div><div className="mt-6 flex justify-end"><Button onClick={() => requestedLimit && limitReason.trim() ? toastInfo('Limit request UI is ready. Approval workflow will be connected during API development.') : toastError('Enter the requested limit and business justification.')}>Submit upgrade request</Button></div></div>}

          {activeTab === 'KYC' && <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle icon={FileCheck2} title="Settlement KYC status" description="Settlement access depends on approved identity, business, PAN, and bank-account verification." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm font-bold text-emerald-900">Retailer KYC approved</p><p className="mt-0.5 text-xs text-emerald-700">Identity and business verification completed</p></div></div></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm font-bold text-emerald-900">Settlement eligibility active</p><p className="mt-0.5 text-xs text-emerald-700">Verified banks may be used for payout</p></div></div></div></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-200"><div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500"><span>Requirement</span><span>Status</span></div>{['PAN verification', 'Aadhaar / identity proof', 'Business proof', 'Bank beneficiary verification'].map((item) => <div key={item} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"><span className="text-sm font-medium text-slate-700">{item}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><Check className="h-3 w-3" />Approved</span></div>)}</div></div>}
        </div>
      </section>
    </PageContainer>
  );
}
