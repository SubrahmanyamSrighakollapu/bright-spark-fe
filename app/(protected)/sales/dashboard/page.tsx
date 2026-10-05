'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { FinancialMetricCard } from '@/components/features/financial/FinancialMetricCard';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  Users,
  Store,
  BarChart3,
  Target,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import { RoleDashboardHero } from '@/components/features/dashboard/RoleDashboardHero';
import { reportService } from '@/services/reportService';

type PeriodType = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY';
type RoleTab = 'MASTER_DISTRIBUTORS' | 'DISTRIBUTORS' | 'RETAILERS';

interface SalesPartner {
  id: string;
  name: string;
  code: string;
  role: string;
  phone: string;
  email: string;
  parent: string;
  gtvVolume: string;
  txnCount: number;
  conversionRate: string;
  downstreamCount: number;
  joinedDate: string;
}

export default function SalesDashboardPage() {
  const period: PeriodType = 'MONTHLY';
  const [activeRoleTab, setActiveRoleTab] = useState<RoleTab>('MASTER_DISTRIBUTORS');
  const [selectedPartner, setSelectedPartner] = useState<SalesPartner | null>(null);

  const masterDistributors: SalesPartner[] = [
    { id: 'md_1', name: 'Apex National Network', code: 'MD001', role: 'Master Distributor', phone: '+91 9876543210', email: 'apex@qinstar.in', parent: 'Direct Admin', gtvVolume: '₹14.8 Cr', txnCount: 12450, conversionRate: '94.2%', downstreamCount: 48, joinedDate: '12 Jan 2025' },
    { id: 'md_2', name: 'Vanguard Payments Systems', code: 'MD002', role: 'Master Distributor', phone: '+91 9876543211', email: 'vanguard@qinstar.in', parent: 'Direct Admin', gtvVolume: '₹11.2 Cr', txnCount: 9820, conversionRate: '91.8%', downstreamCount: 36, joinedDate: '18 Feb 2025' },
    { id: 'md_3', name: 'Zenith FinTech Alliance', code: 'MD003', role: 'Master Distributor', phone: '+91 9876543212', email: 'zenith@qinstar.in', parent: 'Direct Admin', gtvVolume: '₹8.6 Cr', txnCount: 7140, conversionRate: '88.5%', downstreamCount: 29, joinedDate: '05 Mar 2025' },
  ];

  const distributors: SalesPartner[] = [
    { id: 'dst_1', name: 'North Zone Distributors', code: 'DST001', role: 'Distributor', phone: '+91 9876543220', email: 'northzone@qinstar.in', parent: 'Apex National Network', gtvVolume: '₹4.2 Cr', txnCount: 4120, conversionRate: '92.4%', downstreamCount: 18, joinedDate: '10 Jan 2025' },
    { id: 'dst_2', name: 'Capital Financial Services', code: 'DST002', role: 'Distributor', phone: '+91 9876543221', email: 'capital@qinstar.in', parent: 'Vanguard Payments Systems', gtvVolume: '₹3.8 Cr', txnCount: 3840, conversionRate: '89.1%', downstreamCount: 14, joinedDate: '22 Feb 2025' },
    { id: 'dst_3', name: 'Deccan Retailer Services', code: 'DST003', role: 'Distributor', phone: '+91 9876543222', email: 'deccan@qinstar.in', parent: 'Apex National Network', gtvVolume: '₹2.9 Cr', txnCount: 2910, conversionRate: '87.6%', downstreamCount: 11, joinedDate: '01 Mar 2025' },
  ];

  const retailers: SalesPartner[] = [
    { id: 'ret_1', name: 'Metro Super Store', code: 'RET001', role: 'Retailer', phone: '+91 9876543230', email: 'metro@qinstar.in', parent: 'North Zone Distributors', gtvVolume: '₹84.5 Lakhs', txnCount: 1120, conversionRate: '96.2%', downstreamCount: 0, joinedDate: '15 Jan 2025' },
    { id: 'ret_2', name: 'Star Express Mart', code: 'RET002', role: 'Retailer', phone: '+91 9876543231', email: 'starexpress@qinstar.in', parent: 'Capital Financial Services', gtvVolume: '₹68.2 Lakhs', txnCount: 940, conversionRate: '94.8%', downstreamCount: 0, joinedDate: '28 Feb 2025' },
    { id: 'ret_3', name: 'Sunrise Digital Communications', code: 'RET003', role: 'Retailer', phone: '+91 9876543232', email: 'sunrise@qinstar.in', parent: 'Deccan Retailer Services', gtvVolume: '₹52.1 Lakhs', txnCount: 780, conversionRate: '93.4%', downstreamCount: 0, joinedDate: '10 Mar 2025' },
  ];

  const currentPartners =
    activeRoleTab === 'MASTER_DISTRIBUTORS'
      ? masterDistributors
      : activeRoleTab === 'DISTRIBUTORS'
      ? distributors
      : retailers;

  const periodMultiplier =
    period === 'MONTHLY' ? 1 : period === 'QUARTERLY' ? 3 : period === 'HALF_YEARLY' ? 6 : 12;

  const handleExportAnalysis = () => {
    if (!selectedPartner) return;
    reportService.exportToCsv(`Sales_Analysis_${selectedPartner.code}`, [{
      Name: selectedPartner.name,
      Code: selectedPartner.code,
      Role: selectedPartner.role,
      Parent: selectedPartner.parent,
      'GTV Volume': selectedPartner.gtvVolume,
      Transactions: selectedPartner.txnCount,
      'Conversion Rate': selectedPartner.conversionRate,
      'Downstream Count': selectedPartner.downstreamCount,
      'Joined Date': selectedPartner.joinedDate,
    }]);
    setSelectedPartner(null);
  };

  return (
    <PageContainer fullWidth className="space-y-6 pb-12">
      <RoleDashboardHero
        eyebrow="Growth intelligence"
        title="Sales Lead & Network Analysis Workspace"
        description="Partner Acquisition Funnel, Role Analysis & Deep Person Performance Extraction"
        icon={<TrendingUp className="h-5 w-5" />}
        tone="emerald"
        actions={<>
          <Link
            href="/admin/network/approvals"
            className="px-3.5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            Review Approvals →
          </Link>
        </>}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          label={`Active Retailers (${period})`}
          value={(184 * (periodMultiplier * 0.7)).toFixed(0)}
          subtext="+14% Growth Rate"
          icon={<Store className="w-4 h-4 text-emerald-600" />}
          variant="success"
        />
        <FinancialMetricCard
          label={`New Onboardings (${period})`}
          value={(38 * periodMultiplier).toString()}
          subtext={`Target: ${45 * periodMultiplier} Accounts`}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          variant="primary"
        />
        <FinancialMetricCard
          label="Conversion SLA Efficiency"
          value="72.4%"
          subtext="+4.2% Funnel Efficiency"
          icon={<Target className="w-4 h-4 text-indigo-600" />}
          variant="payin"
        />
        <FinancialMetricCard
          label={`Network GTV (${period})`}
          value={`₹${(18.4 * periodMultiplier).toFixed(1)} Cr`}
          subtext="+22.8% Period Growth"
          icon={<BarChart3 className="w-4 h-4 text-purple-600" />}
          variant="payout"
        />
      </div>

      {/* Role Analytics & Deep Extraction Workspace */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-bold text-slate-900">
              Network Role Performance & Analysis Extraction
            </h2>
          </div>

          {/* Role Tabs */}
          <div className="flex items-[#1e293b] gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveRoleTab('MASTER_DISTRIBUTORS')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeRoleTab === 'MASTER_DISTRIBUTORS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Master Distributors ({masterDistributors.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleTab('DISTRIBUTORS')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeRoleTab === 'DISTRIBUTORS' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Distributors ({distributors.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleTab('RETAILERS')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeRoleTab === 'RETAILERS' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Retailers ({retailers.length})
            </button>
          </div>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Partner Entity</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Parent Network</th>
                <th className="p-3">GTV Volume ({period})</th>
                <th className="p-3">Transactions</th>
                <th className="p-3">Conversion %</th>
                <th className="p-3 text-right">Deep Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{partner.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{partner.code} • {partner.role}</div>
                  </td>
                  <td className="p-3 space-y-0.5">
                    <div className="text-slate-700 font-mono">{partner.phone}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{partner.email}</div>
                  </td>
                  <td className="p-3 text-slate-600 font-medium">{partner.parent}</td>
                  <td className="p-3 font-bold text-slate-900 font-mono">{partner.gtvVolume}</td>
                  <td className="p-3 font-mono text-slate-700">{partner.txnCount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {partner.conversionRate}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPartner(partner)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Extract Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Person-Level Analysis Drawer */}
      <Drawer
        isOpen={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        title={
          <div className="flex items-center gap-2">
            <span>{selectedPartner?.name}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {selectedPartner?.code}
            </span>
          </div>
        }
        description={`Person & Entity Deep Performance Audit (${period})`}
        size="lg"
      >
        {selectedPartner && (
          <div className="space-y-6 text-xs">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">{selectedPartner.role} Analysis Summary</p>
                <p className="text-[11px] text-slate-500">Parent: {selectedPartner.parent} | Joined: {selectedPartner.joinedDate}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportAnalysis}
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              >
                Export Analysis
              </Button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <p className="text-slate-400 font-semibold text-[11px]">Phone Number</p>
                <p className="font-mono font-bold text-slate-900">{selectedPartner.phone}</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <p className="text-slate-400 font-semibold text-[11px]">Email Address</p>
                <p className="font-mono font-bold text-slate-900">{selectedPartner.email}</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-center">
                <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Gross GTV ({period})</p>
                <p className="text-lg font-extrabold text-emerald-950 font-mono">{selectedPartner.gtvVolume}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-center">
                <p className="text-[11px] text-blue-700 font-bold uppercase tracking-wider">Total Transactions</p>
                <p className="text-lg font-extrabold text-blue-950 font-mono">{selectedPartner.txnCount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-center">
                <p className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">Retailers</p>
                <p className="text-lg font-extrabold text-purple-950 font-mono">{selectedPartner.downstreamCount}</p>
              </div>
            </div>

            {/* Time Breakdown Mock Graph */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <p className="font-bold text-slate-900 text-xs">Periodical Volume Breakdown ({period})</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>Pay-In Volume (UPI / QR Cards)</span>
                    <span className="font-mono">74% (₹{(parseFloat(selectedPartner.gtvVolume.replace(/[^\d.]/g, '')) * 0.74).toFixed(1)} Cr)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[74%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>Pay-Out & Settlement Volume</span>
                    <span className="font-mono">26% (₹{(parseFloat(selectedPartner.gtvVolume.replace(/[^\d.]/g, '')) * 0.26).toFixed(1)} Cr)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[26%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
}
