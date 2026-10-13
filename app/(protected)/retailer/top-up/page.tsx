'use client';
import { useCallback, useEffect, useState } from 'react';
import { BadgeIndianRupee, Building2, FileText, RefreshCw, Upload } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import type { ColumnDefinition } from '@/types/common';
import { topUpService, type TopUpMode, type TopUpRequest } from '@/services/topUpService';

export default function TopUpPage() {
  const { toastSuccess, toastError }=useToast(); const [items,setItems]=useState<TopUpRequest[]>([]); const [loading,setLoading]=useState(true);
  const [amount,setAmount]=useState(''); const [mode,setMode]=useState<TopUpMode>('BANK_TRANSFER'); const [reference,setReference]=useState(''); const [remarks,setRemarks]=useState(''); const [proof,setProof]=useState<File|null>(null); const [busy,setBusy]=useState(false);
  const load=useCallback(async()=>{setLoading(true);try{setItems((await topUpService.list()).items);}catch(e){toastError(e instanceof Error?e.message:'Unable to load top-up requests');}finally{setLoading(false);}},[toastError]);
  useEffect(()=>{let active=true;topUpService.list().then(result=>{if(active)setItems(result.items);}).catch(e=>{if(active)toastError(e instanceof Error?e.message:'Unable to load top-up requests');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[toastError]);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();const value=Number(amount);if(!Number.isFinite(value)||value<100)return toastError('Minimum top-up request is ₹100.');if(!reference.trim())return toastError('Enter the bank UTR or payment reference.');if(!proof)return toastError('Upload the payment proof before submitting.');setBusy(true);try{await topUpService.create({amount:value,paymentMode:mode,paymentReference:reference.trim(),remarks:remarks.trim(),proof});setAmount('');setReference('');setRemarks('');setProof(null);await load();toastSuccess('Top-up request sent for Admin approval.');}catch(err){toastError(err instanceof Error?err.message:'Unable to submit request');}finally{setBusy(false);}};
  const columns:ColumnDefinition<TopUpRequest>[]=[
    {key:'requestReference',header:'Request',render:r=><div><b className="font-mono text-[#0F4C81]">{r.requestReference}</b><small className="block text-slate-500">{formatDateTime(r.createdAt)}</small></div>},
    {key:'paymentMode',header:'Payment',render:r=><div>{r.paymentMode.replaceAll('_',' ')}<small className="block font-mono text-slate-500">{r.paymentReference}</small></div>},
    {key:'amount',header:'Amount',align:'right',render:r=><b>{formatCurrency(r.amount)}</b>},{key:'status',header:'Status',render:r=><StatusBadge status={r.status}/>},
    {key:'proofName',header:'Proof',render:r=><button className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#0F4C81] hover:underline" onClick={()=>void topUpService.openProof(r.id)}><FileText className="h-4 w-4"/>{r.proofName}</button>},
  ];
  return <PageContainer><div className="space-y-6"><FinancialPageHeader title="Wallet Top-Up" subtitle="Submit transferred-fund proof for Admin verification and wallet credit." actions={<Button variant="outline" onClick={()=>void load()} leftIcon={<RefreshCw className="h-4 w-4"/>}>Refresh</Button>}/>
    <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_.95fr]"><Card title="Create top-up request" subtitle="Your wallet changes only after Admin verifies the received funds."><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Input label="Amount" required type="number" min="100" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} leftIcon={<BadgeIndianRupee className="h-4 w-4"/>}/><Select label="Payment mode" required value={mode} onChange={e=>setMode(e.target.value as TopUpMode)} options={[{value:'BANK_TRANSFER',label:'Bank transfer (NEFT / IMPS / RTGS)'},{value:'UPI',label:'UPI transfer'},{value:'QR',label:'QR payment'}]}/><Input label="UTR / transaction reference" required maxLength={100} value={reference} onChange={e=>setReference(e.target.value)}/><Input label="Remarks" maxLength={500} value={remarks} onChange={e=>setRemarks(e.target.value)}/><label className="sm:col-span-2 text-xs font-semibold text-slate-700">Payment proof *<span className="mt-1 flex min-h-20 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 hover:border-[#0F4C81] hover:bg-blue-50"><Upload className="h-4 w-4"/>{proof?.name||'Choose PDF, JPG or PNG (max 5 MB)'}<input className="hidden" type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setProof(e.target.files?.[0]||null)}/></span></label><Button type="submit" isLoading={busy} className="sm:col-span-2">Send for approval</Button></form></Card>
      <Card title="How approval works"><div className="space-y-4 text-sm text-slate-600"><div className="flex gap-3"><Building2 className="h-5 w-5 shrink-0 text-[#0F4C81]"/><p>Transfer funds using the company-provided bank or UPI instructions, then submit the unique reference and receipt.</p></div><p className="rounded-xl bg-amber-50 p-4 text-amber-900">Admin verifies the payment proof and bank receipt. Approval credits your wallet exactly once; rejection records the review reason without changing your balance.</p></div></Card></div>
    <Card title="Top-up history" noPadding><Table columns={columns} data={items} isLoading={loading} keyExtractor={r=>r.id} emptyTitle="No top-up requests" emptyDescription="Your submitted top-up requests will appear here."/></Card></div></PageContainer>;
}
