'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Card, EmptyState, Select, TextArea, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { HELP_DESK_CATEGORIES, HelpDeskTicket, helpDeskService } from '@/services/helpDeskService';
import { formatDateTime } from '@/utils/formatters';

export default function HelpDeskPage() {
  const { session } = useAuth(); const { toastSuccess, toastError } = useToast();
  const [category, setCategory] = useState(''); const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState(''); const [submitting,setSubmitting]=useState(false);
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const categoryConfig = useMemo(() => HELP_DESK_CATEGORIES.find((item) => item.name === category), [category]);
  const load = async () => { const response=await helpDeskService.getTickets({pageSize:100});setTickets(response.data?.items??[]); };
  useEffect(() => { if(session) void load(); }, [session?.userId]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !category || !subcategory || description.trim().length < 10) return toastError('Select the issue and enter a description of at least 10 characters.');
    setSubmitting(true);helpDeskService.createTicket({category,subcategory,description:description.trim()}).then(async response=>{
      setCategory('');setSubcategory('');setDescription('');await load();toastSuccess(`Ticket ${response.data?.ticketId??''} raised successfully.`);
    }).catch(error=>toastError(error instanceof Error?error.message:'Unable to raise ticket.')).finally(()=>setSubmitting(false));
  };

  return <PageContainer title="Help Desk" description="Raise and track service, transaction, wallet, KYC, and settlement support requests.">
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card title="Raise Support Ticket" subtitle="Provide clear details so Operations can review your request quickly.">
        <form onSubmit={submit} className="space-y-4">
          <Select label="Issue Category" value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }} options={[{value:'',label:'Select issue category'},...HELP_DESK_CATEGORIES.map((item)=>({value:item.name,label:item.name}))]} required />
          <Select label="Issue Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} options={[{value:'',label:category?'Select issue subcategory':'Select category first'},...(categoryConfig?.subcategories.map((item)=>({value:item,label:item}))??[])]} disabled={!category} required />
          <TextArea label="Issue Description" value={description} onChange={(e)=>setDescription(e.target.value)} rows={6} maxLength={1000} placeholder="Explain what happened, when it occurred, and include any transaction reference..." helperText={`${description.length}/1000 characters`} required />
          <Button type="submit" isLoading={submitting} className="w-full" leftIcon={<Send className="h-4 w-4"/>}>Raise Ticket</Button>
        </form>
      </Card>

      <Card title="My Support Tickets" subtitle={`${tickets.length} ticket${tickets.length===1?'':'s'} raised from this account`}>
        {!tickets.length ? <EmptyState title="No support tickets found" description="Tickets raised from this account will appear here." className="border-0 bg-transparent shadow-none" /> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b bg-slate-50"><th className="p-3">Ticket</th><th className="p-3">Issue</th><th className="p-3">Assigned To</th><th className="p-3">Status</th><th className="p-3">Raised On</th></tr></thead><tbody>{tickets.map((ticket)=><tr key={ticket.ticketId} className="border-b last:border-0"><td className="p-3 font-mono font-bold text-blue-700">{ticket.ticketId}</td><td className="p-3"><b>{ticket.category}</b><div className="text-slate-500">{ticket.subcategory}</div><p className="mt-1 max-w-sm truncate text-slate-400">{ticket.description}</p></td><td className="p-3">{ticket.assignedEmployeeName??'Awaiting assignment'}</td><td className="p-3"><span className="rounded-full bg-blue-50 px-2 py-1 font-bold text-blue-700">{ticket.status.replaceAll('_',' ')}</span></td><td className="p-3 text-slate-500">{formatDateTime(ticket.createdAt)}</td></tr>)}</tbody></table></div>}
      </Card>
    </div>
  </PageContainer>;
}
