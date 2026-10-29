'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Banknote, Clock3, Fingerprint, Landmark, ListChecks, Loader2, LockKeyhole, ReceiptText, ShieldCheck } from 'lucide-react';
import { Button, Card, Select, StatusBadge, useToast } from '@/components/ui';
import { AEPS_DEVICES } from '@/mocks/mockAeps';
import { aepsService } from '@/services/aepsService';
import { isAEPSOperatorSessionValid, useAEPSStore } from '@/lib/aeps-store';
import type { AEPSAgentState, AEPSEligibility } from '@/types/aeps';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { BiometricSimulationModal } from './BiometricSimulationModal';
import { AepsOnboardingCard } from './AepsOnboardingCard';

const cards = [
  { title:'Cash Withdrawal',description:'Withdraw cash from the customer’s Aadhaar-linked bank account.',href:'/retailer/aeps/cash-withdrawal',icon:Banknote },
  { title:'Balance Enquiry',description:'Check the available balance in the customer’s Aadhaar-linked account.',href:'/retailer/aeps/balance-enquiry',icon:Landmark },
  { title:'Mini Statement',description:'View recent Aadhaar-linked bank account entries.',href:'/retailer/aeps/mini-statement',icon:ReceiptText },
];

export function AepsDashboard(){
  const {authenticatedAt,operatorSessionExpiresAt,setAuthenticatedAt,transactions,setTransactions,setOtpPolicy}=useAEPSStore();
  const [agent,setAgent]=useState<AEPSAgentState|null>(null); const [eligibility,setEligibility]=useState<AEPSEligibility|null>(null); const [enabled,setEnabled]=useState(true);
  const [loading,setLoading]=useState(true); const [deviceId,setDeviceId]=useState('MANTRA_L1'); const [captureMode,setCaptureMode]=useState<'KYC'|'DAILY_2FA'|null>(null);
  const {toastSuccess,toastError}=useToast(); const operatorAuthenticated=isAEPSOperatorSessionValid(operatorSessionExpiresAt)&&eligibility?.kycRequired===false&&eligibility.daily2faRequired===false;

  const refresh=useCallback(async()=>{setLoading(true);try{const session=await aepsService.session();setEnabled(session.enabled);setAgent(session.agent);if(session.enabled&&session.agent.onboardingStatus==='SUCCESS'){const [loaded,history]=await Promise.all([aepsService.loadAgent(),aepsService.transactions()]);setEligibility(loaded);setTransactions(history);setOtpPolicy(loaded.amountForOtp,loaded.tranTypeForOtp);if(!loaded.kycRequired&&!loaded.daily2faRequired&&!isAEPSOperatorSessionValid(useAEPSStore.getState().operatorSessionExpiresAt))setAuthenticatedAt(new Date().toISOString());}}catch(error){toastError(error instanceof Error?error.message:'Unable to load AEPS status');}finally{setLoading(false);}},[setAuthenticatedAt,setOtpPolicy,setTransactions,toastError]);
  useEffect(()=>{const timer=window.setTimeout(()=>void refresh(),0);return()=>window.clearTimeout(timer);},[refresh]);

  const biometricComplete=async(pidData:string)=>{const mode=captureMode;setCaptureMode(null);try{if(mode==='KYC'){const result=await aepsService.kyc(pidData,eligibility?.kycWadhValue);if(!result.completed)throw new Error(result.message);toastSuccess('AEPS KYC completed successfully.');}else{const result=await aepsService.daily2fa(pidData);if(!result.completed)throw new Error(result.message);toastSuccess('Retailer daily AEPS authentication completed.');}await refresh();}catch(error){toastError(error instanceof Error?error.message:'Retailer biometric authentication failed');}};

  if(loading)return <Card><div className="flex min-h-72 flex-col items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#2F6F5E]"/><p className="mt-3 text-sm text-slate-500">Checking AEPS provider status…</p></div></Card>;
  if(!enabled)return <Card><div className="p-8 text-center"><LockKeyhole className="mx-auto h-12 w-12 text-amber-600"/><h2 className="mt-3 text-xl font-extrabold">AEPS integration is not configured</h2><p className="mt-2 text-sm text-slate-500">Enable the NOBLE AEPS provider in the backend after adding the complete UAT credentials.</p></div></Card>;
  if(!agent||agent.onboardingStatus!=='SUCCESS')return <AepsOnboardingCard pending={agent?.onboardingStatus==='PENDING'} onComplete={()=>void refresh()}/>;

  const required=eligibility?.kycRequired?'KYC':eligibility?.daily2faRequired?'DAILY_2FA':null;
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"><Card title="Retailer AEPS Access" subtitle="Provider eligibility, AEPS KYC, and daily biometric authentication." action={<StatusBadge status={operatorAuthenticated?'SUCCESS':'INACTIVE'} label={operatorAuthenticated?'Authenticated':required==='KYC'?'KYC Required':'Daily Authentication Required'}/>}>
      {operatorAuthenticated?<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="font-bold text-emerald-950"><ShieldCheck className="mr-1 inline h-4 w-4"/>Retailer authentication successful</p><p className="mt-1 text-xs text-emerald-800">Authenticated: {authenticatedAt?formatDateTime(authenticatedAt):'Provider confirmed'}<br/>Local access expires: {operatorSessionExpiresAt?formatDateTime(operatorSessionExpiresAt):'—'}</p></div>:<><Select label="Registered Device" value={deviceId} onChange={(event)=>setDeviceId(event.target.value)} options={AEPS_DEVICES.map((device)=>({label:device.name,value:device.id}))}/><div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><div><b className="text-sm text-amber-950">{required==='KYC'?'AEPS-specific KYC required':'Daily retailer authentication required'}</b><p className="text-xs text-amber-800">Capture the retailer’s fresh fingerprint using the certified RD service.</p></div><Button leftIcon={<Fingerprint className="h-4 w-4"/>} onClick={()=>setCaptureMode(required)}>Authenticate</Button></div></>}
    </Card><Card title="Provider Status" subtitle="NOBLE AEPS V2"><div className="space-y-3">{[['Agent onboarding',agent.onboardingStatus],['AEPS KYC',eligibility?.kycRequired?'REQUIRED':'COMPLETED'],['Daily 2FA',eligibility?.daily2faRequired?'REQUIRED':'COMPLETED'],['Customer biometric','REQUIRED PER ACTION']].map(([label,value])=><div key={label} className="flex justify-between border-b border-slate-100 pb-2 text-xs"><span className="text-slate-500">{label}</span><b>{value}</b></div>)}</div></Card></div>
    <div><div className="mb-3"><h2 className="font-extrabold text-slate-950">Customer Services</h2><p className="text-xs text-slate-500">Each action requires fresh customer consent and biometric authentication.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(({title,description,href,icon:Icon})=><Card key={title} className={!operatorAuthenticated?'opacity-70':'hover:-translate-y-0.5 hover:shadow-md'}><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F3F7E9] text-[#2F6F5E]"><Icon className="h-5 w-5"/></span><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{description}</p>{operatorAuthenticated?<Link href={href} className="mt-4 block"><Button fullWidth variant="outline">Continue</Button></Link>:<Button className="mt-4" fullWidth disabled>Retailer Authentication Required</Button>}</Card>)}</div></div>
    {operatorAuthenticated&&<Card title="Recent AEPS Transactions" subtitle="Provider-backed records with masked customer identifiers" action={<Link href="/retailer/aeps/transactions"><Button variant="outline" size="sm" rightIcon={<ListChecks className="h-4 w-4"/>}>View History</Button></Link>} noPadding><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{['Reference','Service','Bank','Amount','Status','Date'].map((item)=><th key={item} className="px-4 py-3 font-bold">{item}</th>)}</tr></thead><tbody>{transactions.slice(0,5).map((transaction)=><tr key={transaction.id} className="border-t border-slate-100"><td className="px-4 py-3 font-mono font-bold text-[#2F6F5E]">{transaction.id}</td><td className="px-4 py-3">{transaction.serviceType.replaceAll('_',' ')}</td><td className="px-4 py-3">{transaction.bankName}</td><td className="px-4 py-3 font-bold">{transaction.amount==null?'—':formatCurrency(transaction.amount)}</td><td className="px-4 py-3"><StatusBadge status={transaction.status} size="sm"/></td><td className="px-4 py-3 text-slate-500"><Clock3 className="mr-1 inline h-3.5 w-3.5"/>{formatDateTime(transaction.createdAt)}</td></tr>)}</tbody></table></div></Card>}
    <BiometricSimulationModal isOpen={Boolean(captureMode)} deviceName={AEPS_DEVICES.find((item)=>item.id===deviceId)?.name||''} title={captureMode==='KYC'?'Retailer AEPS KYC':'Retailer Daily Biometric Authentication'} subject="retailer" wadh={captureMode==='KYC'?eligibility?.kycWadhValue:undefined} onSuccess={(pidData)=>void biometricComplete(pidData)} onFailure={(message)=>toastError(message)} onClose={()=>setCaptureMode(null)}/>
  </div>;
}
