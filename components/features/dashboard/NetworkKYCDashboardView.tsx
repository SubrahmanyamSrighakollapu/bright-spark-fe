'use client';

import React, { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { DailyOnboardedMembersCard } from '@/components/features/dashboard/DailyOnboardedMembersCard';
import { AdminApprovalQueueCard } from '@/components/features/dashboard/AdminApprovalQueueCard';
import { PendingApprovalItem } from '@/services/approvalService';
import { MemberType } from '@/components/features/users/AddMemberModal';
import { formatNumber } from '@/utils/formatters';
import {
  Award,
  Building2,
  Store,
  UserCheck,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export interface NetworkKYCDashboardViewProps {
  mdCount: number;
  distributorCount: number;
  retailerCount: number;
  activeRetailersCount: number;
  pendingApprovalsCount: number;
  approvalItems: PendingApprovalItem[];
  onReviewItem: (item: PendingApprovalItem) => void;
  onOpenAddMember: (role: MemberType) => void;
  onRefreshData?: () => void;
  isLoading?: boolean;
}

const emptySubscribe = () => () => {};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const NetworkKYCDashboardView: React.FC<NetworkKYCDashboardViewProps> = ({
  mdCount,
  distributorCount,
  retailerCount,
  activeRetailersCount,
  pendingApprovalsCount,
  approvalItems,
  onReviewItem,
  onOpenAddMember,
  onRefreshData,
  isLoading = false,
}) => {
  const router = useRouter();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (isLoading || !isMounted) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  // Calculate pending KYCs by role
  const mdPending = approvalItems.filter((i) => i.entityType === 'DISTRIBUTOR' && i.code.startsWith('MD')).length;
  const distPending = approvalItems.filter((i) => i.entityType === 'DISTRIBUTOR' && !i.code.startsWith('MD')).length;
  const retPending = approvalItems.filter((i) => i.entityType === 'RETAILER').length;

  const totalEntities = mdCount + distributorCount + retailerCount;

  // Solid Pie Chart Data (Sakai / PrimeReact Template Aesthetic)
  const entityDistribution = [
    { name: 'Retailers', value: retailerCount || 19, count: retailerCount || 19, pct: `${(((retailerCount || 19) / (totalEntities || 1)) * 100).toFixed(1)}%`, color: '#3B82F6', bg: 'bg-blue-50 text-blue-900 border-blue-200' },
    { name: 'Distributors', value: distributorCount || 9, count: distributorCount || 9, pct: `${(((distributorCount || 9) / (totalEntities || 1)) * 100).toFixed(1)}%`, color: '#F59E0B', bg: 'bg-amber-50 text-amber-900 border-amber-200' },
    { name: 'Master Distributors', value: mdCount || 2, count: mdCount || 2, pct: `${(((mdCount || 2) / (totalEntities || 1)) * 100).toFixed(1)}%`, color: '#10B981', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  ];

  // Grouped Bar Chart: KYC & Account Status per Role
  const kycStatusPerRole = [
    { role: 'Master Dist', active: mdCount, pendingKyc: mdPending, suspended: 0 },
    { role: 'Distributors', active: Math.max(0, distributorCount - distPending), pendingKyc: distPending, suspended: 0 },
    { role: 'Retailers', active: activeRetailersCount, pendingKyc: retPending, suspended: Math.max(0, retailerCount - activeRetailersCount - retPending) },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Retailers, Distributors & Master Distributors Details Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Tier 1: Master Distributors Card */}
        <div role="link" tabIndex={0} onClick={() => router.push('/admin/network/master-distributors')} onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/network/master-distributors')} className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-indigo-300 hover:shadow-md cursor-pointer">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-[#155EEF]">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Master Dist
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5EAF1] px-2 py-0.5 rounded-md">
                {mdPending} Pending
              </span>
            </div>

            <div className="my-2">
              <div className="text-[28px] leading-tight font-extrabold text-[#0F172A] tracking-tight tabular-nums font-mono">
                {mdCount}
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Top-tier regional partners
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5EAF1] mt-3 text-xs">
            <span className="font-semibold text-[#334155]">New Today: <strong className="text-[#0F172A]">0</strong></span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenAddMember('MASTER_DISTRIBUTOR'); }}
              className="font-semibold text-[#155EEF] hover:text-[#1149B8] flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              + Add Master <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tier 2: Distributors Card */}
        <div role="link" tabIndex={0} onClick={() => router.push('/admin/network/distributors')} onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/network/distributors')} className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-blue-300 hover:shadow-md cursor-pointer">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[#155EEF]">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Distributors
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5EAF1] px-2 py-0.5 rounded-md">
                {distPending} Pending
              </span>
            </div>

            <div className="my-2">
              <div className="text-[28px] leading-tight font-extrabold text-[#0F172A] tracking-tight tabular-nums font-mono">
                {distributorCount}
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Regional network managers
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5EAF1] mt-3 text-xs">
            <span className="font-semibold text-[#334155]">New Today: <strong className="text-emerald-700">+2</strong></span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenAddMember('DISTRIBUTOR'); }}
              className="font-semibold text-[#155EEF] hover:text-[#1149B8] flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              + Add Dist <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tier 3: Retailers Card */}
        <div role="link" tabIndex={0} onClick={() => router.push('/admin/network/retailers')} onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/network/retailers')} className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-emerald-300 hover:shadow-md cursor-pointer">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Retailers
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5EAF1] px-2 py-0.5 rounded-md">
                {retPending} Pending
              </span>
            </div>

            <div className="my-2">
              <div className="text-[28px] leading-tight font-extrabold text-[#0F172A] tracking-tight tabular-nums font-mono">
                {retailerCount}
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                {activeRetailersCount} active merchant stores
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5EAF1] mt-3 text-xs">
            <span className="font-semibold text-[#334155]">New Today: <strong className="text-emerald-700">+5</strong></span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenAddMember('RETAILER'); }}
              className="font-semibold text-[#155EEF] hover:text-[#1149B8] flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              + Add Retailer <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Overall Network KYC SLA Summary */}
        <div role="link" tabIndex={0} onClick={() => router.push('/admin/network/approvals?status=PENDING')} onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/network/approvals?status=PENDING')} className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-amber-300 hover:shadow-md cursor-pointer">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  KYC SLA Status
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5EAF1] px-2 py-0.5 rounded-md font-mono">
                {totalEntities} Total
              </span>
            </div>

            <div className="my-2">
              <div className="text-[28px] leading-tight font-extrabold text-[#0F172A] tracking-tight tabular-nums font-mono">
                {pendingApprovalsCount}
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Pending document verification queue
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E5EAF1] mt-3 text-xs">
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 86.6% Approved
            </span>
            <span className="text-[#64748B] text-[11px] font-mono">Avg SLA: &lt; 2 hrs</span>
          </div>
        </div>
      </div>

      {/* 2. Graphical Charts: Solid Pie Chart & KYC Status Breakdown (Equal Height Alignment: items-stretch) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Solid Pie Chart (PrimeReact / Sakai Template Aesthetic) */}
        <div className="h-full flex flex-col justify-between">
          <Card
            title="Network Hierarchy Breakdown"
            subtitle="Distribution ratio across Master Dist, Dist & Retailers"
            className="h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Top Dot Legend */}
              <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-700 pt-1">
                {entityDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              {/* Solid Pie Chart */}
              <div className="h-[210px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={entityDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    >
                      {entityDistribution.map((entry, index) => (
                        <Cell key={`ent-pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        `${formatNumber(Number(val || 0))} entities (${((Number(val || 0) / totalEntities) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend Cards */}
              <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold">
                {entityDistribution.map((item, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border flex items-center justify-between ${item.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono font-extrabold">{formatNumber(item.count)} ({item.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Chart 2: Onboarding & KYC Status Breakdown per Role */}
        <div className="lg:col-span-2 h-full flex flex-col justify-between">
          <Card
            title="KYC & Account Status Breakdown per Role"
            subtitle="Comparing Active, Pending KYC Approval & Suspended status across network tiers"
            className="h-full flex flex-col justify-between"
          >
            <div className="h-[300px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kycStatusPerRole} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="role" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <RechartsTooltip />
                  <Bar dataKey="active" name="Active Approved" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendingKyc" name="Pending KYC Approval" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="suspended" name="Suspended / Hold" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Daily Member Onboarding Count Summary */}
      <DailyOnboardedMembersCard onMemberAdded={onRefreshData} />

      {/* 4. Pending KYC Approval Workload Queue Desk */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Pending KYC Applications Verification Queue ({approvalItems.length})
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Review submitted Aadhaar, PAN, GSTIN & Bank passbook proof documents
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
            {pendingApprovalsCount} Require Verification
          </span>
        </div>

        <AdminApprovalQueueCard
          items={approvalItems}
          onReviewItem={onReviewItem}
        />
      </div>
    </div>
  );
};
