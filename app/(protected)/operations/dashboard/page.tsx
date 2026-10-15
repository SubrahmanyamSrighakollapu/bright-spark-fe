'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  Plug,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Cpu,
  UserCheck,
  RefreshCw,
  Clock,
  Layers,
  UserPlus,
  User,
  Shield,
} from 'lucide-react';
import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';
import { RoleDashboardHero } from '@/components/features/dashboard/RoleDashboardHero';
import { helpDeskService } from '@/services/helpDeskService';

type TicketStatus = 'Open' | 'Processing' | 'Closed';
type ViewRoleMode = 'MANAGER' | 'EXECUTIVE';

interface SupportTicket {
  id: string;
  ticketId: string;
  issue: string;
  merchant: string;
  status: TicketStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  assignedAgent: string;
  assignmentType: 'AUTOMATED_ROUND_ROBIN' | 'MANAGER_REASSIGNED';
}

export default function OperationsDashboardPage() {
  const { session } = useAuth();
  const { toastSuccess } = useToast();

  const isSupportExec = session?.role === 'SUPPORT';
  const [viewMode, setViewMode] = useState<ViewRoleMode>(isSupportExec ? 'EXECUTIVE' : 'MANAGER');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('Agent Vijay (Ops-01)');

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'demo-1',
      ticketId: 'TKT_99201',
      issue: 'Customer Double Debit Query',
      merchant: 'Star Mart #03',
      status: 'Open',
      priority: 'HIGH',
      date: '10 mins ago',
      assignedAgent: 'Agent Vijay (Ops-01)',
      assignmentType: 'AUTOMATED_ROUND_ROBIN',
    },
    {
      id: 'demo-2',
      ticketId: 'TKT_99184',
      issue: 'Bank Nodal Callback Delay',
      merchant: 'North Zone Distributor',
      status: 'Processing',
      priority: 'MEDIUM',
      date: '35 mins ago',
      assignedAgent: 'Agent Neha (Ops-02)',
      assignmentType: 'AUTOMATED_ROUND_ROBIN',
    },
    {
      id: 'demo-3',
      ticketId: 'TKT_99150',
      issue: 'Chargeback Dispute Verification',
      merchant: 'Apex National Network',
      status: 'Processing',
      priority: 'HIGH',
      date: '2 hours ago',
      assignedAgent: 'Agent Rahul (Ops-03)',
      assignmentType: 'MANAGER_REASSIGNED',
    },
    {
      id: 'demo-4',
      ticketId: 'TKT_99112',
      issue: 'POS Terminal Sync Timeout',
      merchant: 'Metro Store Group',
      status: 'Closed',
      priority: 'LOW',
      date: '5 hours ago',
      assignedAgent: 'Agent Priya (Ops-04)',
      assignmentType: 'AUTOMATED_ROUND_ROBIN',
    },
  ]);

  const supportAgents = ['Agent Vijay (Ops-01)', 'Agent Neha (Ops-02)', 'Agent Rahul (Ops-03)', 'Agent Priya (Ops-04)'];

  useEffect(() => {
    const loadHelpDeskTickets = async () => {
      const response=await helpDeskService.getTickets({pageSize:100});
      setTickets((response.data?.items??[]).map((ticket) => ({
        id: ticket.id,
        ticketId: ticket.ticketId,
        issue: `${ticket.category} — ${ticket.subcategory}`,
        merchant: `${ticket.raisedByName} (${ticket.raisedByRole.replaceAll('_', ' ')})`,
        status: ticket.status==='IN_PROGRESS'?'Processing':ticket.status==='RESOLVED'||ticket.status==='CLOSED'?'Closed':'Open',
        priority: 'LOW',
        date: new Date(ticket.createdAt).toLocaleString('en-IN'),
        assignedAgent: ticket.assignedEmployeeName??'Unassigned',
        assignmentType: 'AUTOMATED_ROUND_ROBIN',
      })));
    };
    void loadHelpDeskTickets();
  }, []);

  const providersHealth = [
    { name: 'ICICI PayIn Gateway', successRate: '99.4%', latency: '180ms', status: 'HEALTHY', activeTxns: '1,420 / min' },
    { name: 'HDFC Payout Direct Routing', successRate: '98.9%', latency: '210ms', status: 'HEALTHY', activeTxns: '840 / min' },
    { name: 'Cashfree Backup Router', successRate: '99.8%', latency: '145ms', status: 'HEALTHY', activeTxns: 'Standby' },
    { name: 'NSDL AEPS & DMT Switch', successRate: '97.6%', latency: '320ms', status: 'DEGRADED', activeTxns: '410 / min' },
  ];

  const handleReassignTicket = (ticketId: string, newAgent: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId ? { ...t, assignedAgent: newAgent, assignmentType: 'MANAGER_REASSIGNED' } : t
      )
    );
    toastSuccess(`Ticket ${ticketId} reassigned to ${newAgent} by Manager.`);
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    const ticket=tickets.find(item=>item.ticketId===ticketId);if(!ticket)return;
    const apiStatus=newStatus==='Processing'?'IN_PROGRESS':newStatus==='Closed'?'RESOLVED':'REOPENED';
    try{await helpDeskService.updateStatus(ticket.id,apiStatus,`Status updated to ${newStatus} by Operations`);setTickets((prev) => prev.map((t) => (t.ticketId === ticketId ? { ...t, status: newStatus } : t)));toastSuccess(`Ticket ${ticketId} status updated to ${newStatus}.`);}catch{/* Global API feedback handles authorization/network failures. */}
  };

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const processingCount = tickets.filter((t) => t.status === 'Processing').length;
  const closedCount = tickets.filter((t) => t.status === 'Closed').length;

  return (
    <PageContainer fullWidth className="space-y-6 pb-12">
      <RoleDashboardHero
        eyebrow="Live operations"
        title="Operations & Support Operations Center"
        description="Live Transaction Routing, Gateway SLA Health & Hybrid Support Ticket Queue"
        icon={<Activity className="h-5 w-5" />}
        tone="sky"
        actions={<>
          {/* Universal Date Range Filter Dropdown */}
          <DateRangeDropdown size="sm" />

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('MANAGER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'MANAGER'
                  ? 'bg-white text-[var(--primary)] shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" /> Manager Control Center
            </button>
            <button
              type="button"
              onClick={() => setViewMode('EXECUTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'EXECUTIVE'
                  ? 'bg-white text-[var(--primary)] shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" /> Executive Personal Desk
            </button>
          </div>

          <Link
            href="/admin/chargebacks"
            className="px-3.5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            Disputes Queue →
          </Link>
        </>}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          label="Open Tickets"
          value={openCount}
          subtext="Requires Immediate SLA Response"
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          variant="warning"
        />
        <FinancialMetricCard
          label="Processing Queue"
          value={processingCount}
          subtext="Under Active Agent Investigation"
          icon={<Activity className="w-4 h-4 text-blue-600" />}
          variant="primary"
        />
        <FinancialMetricCard
          label="Resolved / Closed"
          value={closedCount}
          subtext="Closed within SLA Target"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          variant="success"
        />
        <FinancialMetricCard
          label="Gateway Provider SLA Health"
          value="98.9%"
          subtext="3 Healthy, 1 Degraded"
          icon={<Plug className="w-4 h-4 text-sky-600" />}
          variant="payin"
        />
      </div>

      {/* Gateway Health & Hybrid Tickets Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gateway Provider Health */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Payment Gateway SLA Health Switch</h2>
            </div>
            <Link href="/admin/integrations/providers" className="text-xs text-[var(--primary)] font-bold hover:underline flex items-center gap-0.5">
              Provider Master <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {providersHealth.map((prov, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900">{prov.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Latency: {prov.latency} • {prov.activeTxns}</div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="font-mono font-extrabold text-xs text-slate-900">{prov.successRate}</div>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      prov.status === 'HEALTHY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prov.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hybrid Support Ticket Queue: Auto Round-Robin + Manager Manual Re-assignment */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Incoming Help Desk Tickets</h2>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              Unassigned Intake Queue
            </span>
          </div>

          <div className="space-y-3">
            {tickets.map((tkt) => (
              <div key={tkt.ticketId} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{tkt.issue}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        tkt.status === 'Open'
                          ? 'bg-amber-100 text-amber-800'
                          : tkt.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {tkt.status}
                    </span>
                    <select
                      value={tkt.status}
                      onChange={(e) => handleStatusChange(tkt.ticketId, e.target.value as TicketStatus)}
                      className="text-[11px] py-0.5 px-1.5 bg-white border border-slate-200 rounded font-semibold focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Processing">Processing</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 gap-2">
                  <div>
                    <span className="font-mono text-slate-900 font-bold">{tkt.ticketId}</span> • {tkt.merchant} ({tkt.date})
                  </div>

                  {/* Assignment workflow will be enabled after the allocation rules are finalized. */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-200">
                      Unassigned
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs text-sky-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>New tickets enter this common Operations intake queue. Assignment controls will be added after the allocation workflow is finalized.</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
