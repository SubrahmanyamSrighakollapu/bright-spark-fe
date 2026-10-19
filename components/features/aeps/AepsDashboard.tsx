'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Banknote, Clock3, Fingerprint, Landmark, ListChecks, LockKeyhole, LogOut, ReceiptText, ShieldCheck } from 'lucide-react';
import { Button, Card, Select, StatusBadge, useToast } from '@/components/ui';
import { AEPS_BANKS, AEPS_DEVICES } from '@/mocks/mockAeps';
import { aepsMockService } from '@/services/aepsMockService';
import { isAEPSOperatorSessionValid, useAEPSStore } from '@/lib/aeps-store';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { BiometricSimulationModal } from './BiometricSimulationModal';

const cards = [
  { title: 'Cash Withdrawal', description: 'Withdraw cash from the customer’s Aadhaar-linked bank account.', href: '/retailer/aeps/cash-withdrawal', icon: Banknote, enabled: true },
  { title: 'Balance Enquiry', description: 'Check the available balance in the customer’s Aadhaar-linked account.', href: '/retailer/aeps/balance-enquiry', icon: Landmark, enabled: true },
  { title: 'Mini Statement', description: 'View the customer’s recent Aadhaar-linked bank account entries.', href: '/retailer/aeps/mini-statement', icon: ReceiptText, enabled: true },
  { title: 'Cash Deposit', description: 'This service is not enabled for the current provider configuration.', href: '#', icon: LockKeyhole, enabled: false },
];

export function AepsDashboard() {
  const { authenticatedAt, operatorSessionExpiresAt, setAuthenticatedAt, clearOperatorSession, transactions } = useAEPSStore();
  const operatorAuthenticated = isAEPSOperatorSessionValid(operatorSessionExpiresAt);
  const [bankId, setBankId] = useState('SBI');
  const [deviceId, setDeviceId] = useState('MANTRA_L1');
  const [modalOpen, setModalOpen] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const finishAuth = async () => {
    const result = await aepsMockService.authenticate(true);
    setModalOpen(false);
    if (result.authenticatedAt) {
      setAuthenticatedAt(result.authenticatedAt);
      toastSuccess('Retailer authenticated. AEPS services are available for 24 hours.');
    }
  };
  const failAuth = async () => { const result = await aepsMockService.authenticate(false); toastError(result.message); };

  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <Card title="Retailer AEPS Login" subtitle="Authenticate the retailer/operator once. The session expires automatically after 24 hours." action={<StatusBadge status={operatorAuthenticated ? 'SUCCESS' : 'INACTIVE'} label={operatorAuthenticated ? 'Authenticated' : 'Authentication Required'} />}>
        {!operatorAuthenticated ? <><div className="grid gap-4 sm:grid-cols-2"><Select label="Acquirer Bank" value={bankId} onChange={(event) => setBankId(event.target.value)} options={AEPS_BANKS.map((bank) => ({ label: bank.name, value: bank.id }))} /><Select label="Registered Device" value={deviceId} onChange={(event) => setDeviceId(event.target.value)} options={AEPS_DEVICES.map((device) => ({ label: device.name, value: device.id }))} /></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div><b className="text-sm text-slate-900">Device status: Ready for authentication</b><p className="text-xs text-slate-500">Place the retailer’s finger on the registered biometric device.</p></div><Button leftIcon={<Fingerprint className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Authenticate & Login</Button></div></> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-emerald-950"><ShieldCheck className="mr-1 inline h-4 w-4" />Retailer authentication successful</p><p className="mt-1 text-xs text-emerald-800">Login: {authenticatedAt ? formatDateTime(authenticatedAt) : '—'}<br />Expires: {operatorSessionExpiresAt ? formatDateTime(operatorSessionExpiresAt) : '—'}</p></div><Button variant="outline" size="sm" leftIcon={<LogOut className="h-4 w-4" />} onClick={clearOperatorSession}>End AEPS Session</Button></div></div>}
      </Card>
      <Card title="Session & Service Status" subtitle="Retailer access and customer authorization"><div className="space-y-3">{[['Retailer login', operatorAuthenticated ? 'ACTIVE' : 'REQUIRED'], ['Session validity', operatorAuthenticated ? '24 HOURS' : 'NOT STARTED'], ['Customer authentication', 'REQUIRED PER ACTION'], ['Service status', 'READY']].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs"><span className="text-slate-500">{label}</span><b className="text-slate-800">{value}</b></div>)}</div></Card>
    </div>
    <div><div className="mb-3 flex items-center justify-between"><div><h2 className="font-extrabold text-slate-950">Customer Services</h2><p className="text-xs text-slate-500">Each action requires a new customer biometric authorization.</p></div>{!operatorAuthenticated && <StatusBadge status="INACTIVE" label="LOGIN REQUIRED" />}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ title, description, href, icon: Icon, enabled }) => { const available = enabled && operatorAuthenticated; return <Card key={title} className={!available ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-md'}><div className="flex h-full flex-col"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F3F7E9] text-[#2F6F5E]"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-extrabold text-slate-900">{title}</h3><p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{description}</p>{available ? <Link href={href} className="mt-4"><Button fullWidth variant="outline">Continue</Button></Link> : <Button className="mt-4" fullWidth disabled>{enabled ? 'Retailer Login Required' : 'Service Unavailable'}</Button>}</div></Card>; })}</div></div>
    {operatorAuthenticated && <Card title="Recent AEPS Transactions" subtitle="Customer identifiers are masked" action={<Link href="/retailer/aeps/transactions"><Button variant="outline" size="sm" rightIcon={<ListChecks className="h-4 w-4" />}>View History</Button></Link>} noPadding><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{['Reference', 'Service', 'Bank', 'Amount', 'Status', 'Date'].map((item) => <th key={item} className="px-4 py-3 font-bold">{item}</th>)}</tr></thead><tbody>{transactions.slice(0, 5).map((transaction) => <tr key={transaction.id} className="border-t border-slate-100"><td className="px-4 py-3 font-mono font-bold text-[#2F6F5E]">{transaction.id}</td><td className="px-4 py-3">{transaction.serviceType.replaceAll('_', ' ')}</td><td className="px-4 py-3">{transaction.bankName}</td><td className="px-4 py-3 font-bold">{transaction.amount == null ? '—' : formatCurrency(transaction.amount)}</td><td className="px-4 py-3"><StatusBadge status={transaction.status} size="sm" /></td><td className="px-4 py-3 text-slate-500"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{formatDateTime(transaction.createdAt)}</td></tr>)}</tbody></table></div></Card>}
    <BiometricSimulationModal isOpen={modalOpen} deviceName={AEPS_DEVICES.find((item) => item.id === deviceId)?.name || ''} title="Retailer Fingerprint Authentication" subject="retailer" onSuccess={() => void finishAuth()} onFailure={() => void failAuth()} onClose={() => setModalOpen(false)} />
  </div>;
}




