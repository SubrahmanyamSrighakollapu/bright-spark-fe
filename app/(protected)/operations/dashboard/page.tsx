'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, Headphones, RefreshCw, Workflow } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Card, EmptyState, useToast } from '@/components/ui';
import { RoleDashboardHero } from '@/components/features/dashboard/RoleDashboardHero';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { HelpDeskTicket, helpDeskService } from '@/services/helpDeskService';
import { formatDateTime } from '@/utils/formatters';

export default function OperationsDashboardPage() {
  const { toastError } = useToast();
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await helpDeskService.getTickets({ page: 1, pageSize: 100 });
      setTickets(response.data?.items ?? []);
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Unable to load Operations dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  const assigned = tickets.filter((item) => ['ASSIGNED', 'REOPENED', 'OPEN'].includes(item.status)).length;
  const inProgress = tickets.filter((item) => item.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter((item) => ['RESOLVED', 'CLOSED'].includes(item.status)).length;

  return <PageContainer fullWidth className="space-y-6 pb-12">
    <RoleDashboardHero eyebrow="Operations workspace" title="Operations Help Desk Dashboard" description="Your live assigned workload and ticket-resolution queue" icon={<Headphones className="h-5 w-5" />} tone="sky" actions={<Button variant="outline" size="sm" onClick={() => void load()} leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}>Refresh</Button>} />
    <div className="grid gap-4 sm:grid-cols-3">
      <FinancialMetricCard label="Assigned / Reopened" value={assigned} subtext="Waiting for action" icon={<Clock3 className="h-4 w-4 text-amber-600" />} variant="warning" />
      <FinancialMetricCard label="In Progress" value={inProgress} subtext="Currently being processed" icon={<Workflow className="h-4 w-4 text-blue-600" />} variant="primary" />
      <FinancialMetricCard label="Resolved / Closed" value={resolved} subtext="Completed tickets" icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} variant="success" />
    </div>
    <Card title="Recent Assigned Tickets" subtitle="Only tickets allocated to your Operations employee account are included." action={<Link href="/operations/help-desk" className="text-xs font-bold text-blue-700 hover:underline">Open Help Desk →</Link>}>
      {loading ? <div className="py-14 text-center text-sm text-slate-500">Loading live tickets...</div> : !tickets.length ? <EmptyState title="No assigned tickets" description="Tickets will appear automatically when the workload allocator assigns them to you." className="border-0 bg-transparent shadow-none" /> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b bg-slate-50"><th className="p-3">Ticket</th><th className="p-3">Requester</th><th className="p-3">Issue</th><th className="p-3">Status</th><th className="p-3">Received</th></tr></thead><tbody>{tickets.slice(0, 8).map((ticket) => <tr key={ticket.id} className="border-b last:border-0"><td className="p-3 font-mono font-bold text-blue-700">{ticket.ticketId}</td><td className="p-3 font-semibold">{ticket.raisedByName}</td><td className="p-3"><b>{ticket.category}</b><div className="text-slate-500">{ticket.subcategory}</div></td><td className="p-3"><span className="rounded-full bg-blue-50 px-2 py-1 font-bold text-blue-700">{ticket.status.replaceAll('_', ' ')}</span></td><td className="p-3 text-slate-500">{formatDateTime(ticket.assignedAt ?? ticket.createdAt)}</td></tr>)}</tbody></table></div>}
    </Card>
  </PageContainer>;
}
