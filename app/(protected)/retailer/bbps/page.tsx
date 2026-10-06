'use client';

import { useMemo, useState, type ElementType, type FormEvent } from 'react';
import {
  ArrowLeft, ArrowRight, Building2, Car, Check, CheckCircle2, CreditCard,
  Droplets, Flame, GraduationCap, History, Phone, Receipt, RotateCcw,
  Satellite, Search, ShieldCheck, Smartphone, Wallet, Wifi, Zap,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Card, Input, StatusBadge, Table, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { bbpsService, type BbpsBill, type BbpsCategory, type BbpsPayment } from '@/services/bbpsService';
import { walletService } from '@/services/walletService';
import { formatAmountInWords, formatCurrency, formatDateTime } from '@/utils/formatters';
import type { ColumnDefinition } from '@/types/common';

const iconMap: Record<string, ElementType> = {
  Zap, Satellite, Smartphone, Wifi, Car, Flame, Droplets, Phone,
  ShieldCheck, GraduationCap, CreditCard, Building2,
  Cable: Wifi, Tv: Satellite, Users: Building2, Router: Wifi, Ticket: Receipt,
  HeartHandshake: ShieldCheck, Landmark: Building2, Hospital: Building2,
  House: Building2, PhoneCall: Phone, BadgeIndianRupee: CreditCard,
  ShieldPlus: ShieldCheck, Cylinder: Flame, Building: Building2, Bus: Car,
  PlaySquare: Satellite, Gauge: Zap, PiggyBank: CreditCard, KeyRound: Building2,
  CalendarCheck: Receipt, TrafficCone: Car, Waves: Droplets,
};

export default function RetailerBbpsPage() {
  const { session } = useAuth();
  const { toastError, toastSuccess } = useToast();
  const retailerId = session?.entityId || 'RET001';
  const categories = bbpsService.getCategories();

  const [category, setCategory] = useState<BbpsCategory>(categories[0]);
  const [billerId, setBillerId] = useState('');
  const [billerSearch, setBillerSearch] = useState('');
  const [consumerId, setConsumerId] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [bill, setBill] = useState<BbpsBill | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [payment, setPayment] = useState<BbpsPayment | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const billers = bbpsService.getBillers(category.code);
  const selectedBiller = billers.find((item) => item.id === billerId);
  const visibleBillers = billers.filter((item) => item.name.toLowerCase().includes(billerSearch.toLowerCase()));
  const calculations = bbpsService.calculate(Number(amount));
  const history = useMemo(() => {
    void historyVersion;
    return bbpsService.getHistory(retailerId);
  }, [retailerId, historyVersion]);

  const chooseCategory = (item: BbpsCategory) => {
    setCategory(item);
    setBillerId('');
    setBillerSearch('');
    setConsumerId('');
    setBill(null);
    setAmount('');
    setPayment(null);
    setStep(1);
    setShowHistory(false);
  };

  const chooseBiller = (id: string) => {
    setBillerId(id);
    setBill(null);
    setAmount('');
    setPayment(null);
    setStep(1);
  };

  const fetchBill = async (event: FormEvent) => {
    event.preventDefault();
    if (!billerId) return toastError('Select a biller from the list.');
    if (consumerId.trim().length < 6) return toastError('Enter a valid consumer identifier.');
    if (!/^[6-9]\d{9}$/.test(customerMobile)) return toastError('Enter a valid 10-digit mobile number.');
    setBusy(true);
    try {
      const [fetched, wallet] = await Promise.all([
        bbpsService.fetchBill(billerId, consumerId),
        walletService.getRetailerWallet(bbpsService.getWalletEntityId(retailerId)),
      ]);
      setBill(fetched);
      setAmount(String(fetched.billAmount));
      setWalletBalance(wallet.data?.availableBalance || 0);
      setStep(2);
      toastSuccess('Latest bill fetched successfully.');
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Unable to fetch bill.');
    } finally {
      setBusy(false);
    }
  };

  const payBill = async () => {
    if (!bill) return;
    setBusy(true);
    try {
      const result = await bbpsService.pay(retailerId, billerId, category.code, bill, Number(amount));
      setPayment(result);
      setWalletBalance((value) => value - calculations.totalWalletDebit + calculations.commission);
      setHistoryVersion((value) => value + 1);
      setStep(3);
      toastSuccess('BBPS payment completed successfully.');
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Payment failed.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setConsumerId('');
    setCustomerMobile('');
    setBill(null);
    setAmount('');
    setPayment(null);
    setStep(1);
  };

  const consumerLabel = category.code === 'MOBILE_POSTPAID'
    ? 'Postpaid mobile number'
    : category.code === 'FASTAG'
      ? 'Vehicle registration number'
      : 'Consumer / account number';

  const columns: ColumnDefinition<BbpsPayment>[] = [
    { key: 'transactionReference', header: 'Transaction', render: (row) => <div><b className="font-mono text-[#0F4C81]">{row.transactionReference}</b><small className="block text-slate-500">{formatDateTime(row.createdAt)}</small></div> },
    { key: 'billerName', header: 'Biller / Consumer', render: (row) => <div><b>{row.billerName}</b><small className="block font-mono text-slate-500">{row.consumerId}</small></div> },
    { key: 'bbpsReference', header: 'BBPS Reference', render: (row) => <span className="font-mono">{row.bbpsReference}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (row) => <b>{formatCurrency(row.amount)}</b> },
    { key: 'status', header: 'Status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <PageContainer className="!space-y-4 !p-4 sm:!p-5" fullWidth>
      <div className="mx-auto max-w-[1540px] space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">BBPS Bill Payments</h1>
              <StatusBadge status="ACTIVE" label="Bharat Connect" />
            </div>
            <p className="mt-1 text-xs text-slate-500">Select a service and biller, fetch the live bill, verify and pay—all in one workspace.</p>
          </div>
          <div className="flex items-center gap-2">
            {walletBalance > 0 && <div className="flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs"><Wallet className="h-4 w-4 text-emerald-700" /><span className="text-slate-500">Available</span><b className="text-emerald-800">{formatCurrency(walletBalance)}</b></div>}
            <Button size="sm" variant={showHistory ? 'primary' : 'outline'} onClick={() => setShowHistory((value) => !value)} leftIcon={<History className="h-4 w-4" />}>{showHistory ? 'New Payment' : 'History'}</Button>
          </div>
        </div>

        <Card noPadding className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div><b className="text-sm text-slate-900">Select B-Connect Service</b><span className="ml-2 text-xs text-slate-400">{categories.length} categories available</span></div>
            <span className="hidden text-xs font-bold text-[#0F4C81] sm:block">BHARAT CONNECT</span>
          </div>
          <div className="grid max-h-[172px] grid-cols-3 gap-1.5 overflow-y-auto p-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
            {categories.map((item) => {
              const Icon = iconMap[item.icon] || Receipt;
              const active = item.code === category.code;
              return (
                <button key={item.code} onClick={() => chooseCategory(item)} className={`group flex min-h-[70px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center transition ${active ? 'border-[#0F4C81] bg-blue-50 text-[#0F4C81] shadow-sm' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-lg ${active ? 'bg-[#0F4C81] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#0F4C81]'}`}><Icon className="h-4 w-4" /></span>
                  <span className="line-clamp-2 text-[10px] font-bold leading-tight">{item.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {showHistory ? (
          <Card title="Recent BBPS Payments" subtitle="Retailer-scoped Bharat Connect transaction history" noPadding>
            <Table columns={columns} data={history} keyExtractor={(row) => row.id} emptyTitle="No BBPS payments yet" emptyDescription="Successfully submitted bill payments will appear here." />
          </Card>
        ) : (
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(340px,0.8fr)_minmax(520px,1.2fr)]">
            <Card noPadding className="overflow-hidden lg:h-[510px]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between"><div><h2 className="text-base font-bold text-slate-900">{category.name} Billers</h2><p className="text-xs text-slate-500">Choose the customer&apos;s service provider</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#0F4C81]">{billers.length} BILLERS</span></div>
                <div className="relative mt-3"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={billerSearch} onChange={(event) => setBillerSearch(event.target.value)} placeholder="Search biller name" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#0F4C81] focus:bg-white" /></div>
              </div>
              <div className="max-h-[408px] space-y-2 overflow-y-auto p-3">
                {visibleBillers.map((item) => {
                  const active = item.id === billerId;
                  return (
                    <button key={item.id} onClick={() => chooseBiller(item.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-[#0F4C81] bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'}`}>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${active ? 'bg-[#0F4C81] text-white' : 'bg-slate-100 text-slate-600'}`}>{item.shortName.slice(0, 2).toUpperCase()}</span>
                      <span className="min-w-0 flex-1"><b className="block truncate text-xs text-slate-800">{item.name}</b><small className="mt-0.5 block text-[10px] text-slate-500">Limit {formatCurrency(item.minAmount)} – {formatCurrency(item.maxAmount)}</small></span>
                      {active && <Check className="h-5 w-5 shrink-0 text-[#0F4C81]" />}
                    </button>
                  );
                })}
                {visibleBillers.length === 0 && <div className="py-16 text-center text-xs text-slate-500">No billers match your search.</div>}
              </div>
            </Card>

            <Card noPadding className="overflow-hidden lg:h-[510px]">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div><h2 className="text-base font-bold text-slate-900">{step === 1 ? 'Fetch Customer Bill' : step === 2 ? 'Review & Confirm' : 'Payment Receipt'}</h2><p className="text-xs text-slate-500">{selectedBiller ? selectedBiller.name : 'Select a biller from the left to continue'}</p></div>
                  <div className="flex items-center gap-1">{[1, 2, 3].map((number) => <span key={number} className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${step === number ? 'bg-[#0F4C81] text-white' : step > number ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{step > number ? <Check className="h-3.5 w-3.5" /> : number}</span>)}</div>
                </div>

                {step === 1 && (
                  <form onSubmit={fetchBill} className="flex flex-1 flex-col p-5">
                    {selectedBiller ? <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0F4C81] text-xs font-extrabold text-white">{selectedBiller.shortName.slice(0, 2).toUpperCase()}</span><div><small className="font-bold uppercase tracking-wide text-blue-500">Selected biller</small><b className="block text-sm text-slate-900">{selectedBiller.name}</b></div></div> : <div className="mb-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs text-slate-500">Select a biller from the left panel to start.</div>}
                    <div className="grid gap-4 sm:grid-cols-2"><Input label={consumerLabel} required value={consumerId} onChange={(event) => setConsumerId(event.target.value)} placeholder="Enter customer identifier" /><Input label="Customer mobile" required inputMode="numeric" maxLength={10} value={customerMobile} onChange={(event) => setCustomerMobile(event.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" /></div>
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600"><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-600" />The latest payable bill is fetched and shown for verification before wallet debit.</div>
                    <div className="mt-auto pt-5"><Button type="submit" fullWidth isLoading={busy} disabled={!selectedBiller} rightIcon={<ArrowRight className="h-4 w-4" />}>Fetch Latest Bill</Button></div>
                  </form>
                )}

                {step === 2 && bill && selectedBiller && (
                  <div className="flex flex-1 flex-col overflow-y-auto p-5">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Customer', bill.customerName], ['Bill No.', bill.billNumber], ['Period', bill.billPeriod], ['Due Date', new Date(bill.dueDate).toLocaleDateString('en-IN')]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"><small className="block text-[9px] font-bold uppercase text-slate-400">{label}</small><b className="mt-1 block truncate text-[11px] text-slate-800" title={value}>{value}</b></div>)}</div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_280px]">
                      <div><Input label="Payable amount" type="number" min={selectedBiller.minAmount} max={selectedBiller.maxAmount} readOnly={!bill.partialPaymentAllowed} value={amount} onChange={(event) => setAmount(event.target.value)} /><p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-bold uppercase text-[#0F4C81]">{formatAmountInWords(Number(amount))}</p></div>
                      <div className="space-y-1.5 rounded-xl bg-slate-950 p-3 text-[11px] text-white"><div className="flex justify-between"><span className="text-slate-400">Bill amount</span><b>{formatCurrency(Number(amount))}</b></div><div className="flex justify-between"><span className="text-slate-400">Fee + GST</span><span>{formatCurrency(calculations.convenienceFee + calculations.gst)}</span></div><div className="flex justify-between border-t border-slate-700 pt-1.5"><span>Wallet debit</span><b className="text-rose-300">{formatCurrency(calculations.totalWalletDebit)}</b></div><div className="flex justify-between"><span>Commission</span><b className="text-emerald-300">+{formatCurrency(calculations.commission)}</b></div><div className="flex justify-between border-t border-slate-700 pt-1.5"><span>Balance after</span><b>{formatCurrency(walletBalance - calculations.totalWalletDebit + calculations.commission)}</b></div></div>
                    </div>
                    <div className="mt-auto flex gap-2 pt-4"><Button variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Edit</Button><Button className="flex-1" isLoading={busy} disabled={walletBalance < calculations.totalWalletDebit || Number(amount) <= 0} onClick={payBill} leftIcon={<ShieldCheck className="h-4 w-4" />}>Confirm & Pay {formatCurrency(Number(amount))}</Button></div>
                  </div>
                )}

                {step === 3 && payment && (
                  <div className="flex flex-1 flex-col items-center justify-center p-5 text-center"><CheckCircle2 className="h-14 w-14 text-emerald-500" /><h2 className="mt-2 text-xl font-extrabold">Payment successful</h2><p className="text-xs text-slate-500">{payment.billerName}</p><b className="mt-2 text-2xl text-[#0F4C81]">{formatCurrency(payment.amount)}</b><div className="mt-4 w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-[11px]"><div className="flex justify-between gap-4"><span>BBPS reference</span><b className="font-mono">{payment.bbpsReference}</b></div><div className="mt-2 flex justify-between gap-4"><span>Transaction reference</span><b className="font-mono">{payment.transactionReference}</b></div><div className="mt-2 flex justify-between gap-4"><span>Consumer</span><b>{payment.consumerId}</b></div></div><div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => setShowHistory(true)} leftIcon={<History className="h-4 w-4" />}>View History</Button><Button onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>Pay Another Bill</Button></div></div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
