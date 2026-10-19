import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Users, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export interface TopDistributorItem {
  id: string;
  code: string;
  name: string;
  retailersCount: number;
  todayTransactions: number;
  todayVolume: number;
  status: string;
}

export interface MasterDistributorNetworkOverviewProps {
  totalDistributors: number;
  totalRetailers: number;
  activeRetailers: number;
  pendingRetailerApprovals: number;
  rejectedRetailers: number;
  topDistributors: TopDistributorItem[];
  isLoading?: boolean;
}

export const MasterDistributorNetworkOverview: React.FC<MasterDistributorNetworkOverviewProps> = ({
  totalDistributors,
  totalRetailers,
  activeRetailers,
  pendingRetailerApprovals,
  rejectedRetailers,
  topDistributors,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Network Structure Summary */}
      <Card title="Network Structure Overview" subtitle="Status distribution across agency hierarchy">
        <div className="space-y-4">
          {/* Distributors Breakdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2F6F5E]" />
                Distributor Partners
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">{totalDistributors} Total</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Active</span>
                <span className="font-bold text-emerald-700">{totalDistributors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inactive</span>
                <span className="font-bold text-slate-500">0</span>
              </div>
            </div>
          </div>

          {/* Retailers Breakdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[var(--primary)]" />
                Retail Outlets
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">{totalRetailers} Total</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60 font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Active</span>
                <span className="font-bold text-emerald-700">{activeRetailers}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Pending</span>
                <span className="font-bold text-amber-600">{pendingRetailerApprovals}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Rejected</span>
                <span className="font-bold text-rose-600">{rejectedRetailers}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Distributors Table */}
      <div className="lg:col-span-2">
        <Card
          title="Direct Distributors"
          subtitle="Assigned distribution partners & network volume"
          action={
            <Link href="/master-distributor/distributors">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Distributors
              </Button>
            </Link>
          }
        >
          {topDistributors.length === 0 ? (
            <EmptyState
              title="No Direct Distributors"
              description="There are no active distributor partners in your network."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-[var(--text-muted)] bg-slate-50">
                    <th className="py-2.5 px-3">Distributor Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3 text-center">Retailers</th>
                    <th className="py-2.5 px-3 text-right">Today's Txns</th>
                    <th className="py-2.5 px-3 text-right">Today's Volume</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {topDistributors.map((dist) => (
                    <tr key={dist.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-sans font-semibold text-slate-900">{dist.name}</td>
                      <td className="py-3 px-3 text-[#2F6F5E] font-bold">{dist.code}</td>
                      <td className="py-3 px-3 text-center">{dist.retailersCount}</td>
                      <td className="py-3 px-3 text-right">{formatNumber(dist.todayTransactions)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(dist.todayVolume)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status="ACTIVE" label={dist.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
