import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Store } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export interface TopRetailerItem {
  id: string;
  code: string;
  name: string;
  todayTransactions: number;
  todayVolume: number;
  commission: number;
  status: string;
  approvalStatus: string;
}

interface DistributorTopRetailersProps {
  topRetailers: TopRetailerItem[];
  isLoading?: boolean;
}

export const DistributorTopRetailers: React.FC<DistributorTopRetailersProps> = ({
  topRetailers,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card title="Top Performing Retailers" subtitle="Ranked by today's transaction volume">
        <div className="space-y-3 p-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-md" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Top Performing Retailers"
      subtitle="Ranked by today's total transaction volume"
      action={
        <Link href="/distributor/retailers" className="text-xs font-semibold text-blue-600 hover:underline">
          View All Retailers &rarr;
        </Link>
      }
    >
      {topRetailers.length === 0 ? (
        <EmptyState
          title="No Retailers Registered"
          description="Your direct retailer network has no active retailers."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Rank & Retailer</th>
                <th className="py-2.5 px-3 text-right">Today&apos;s Txns</th>
                <th className="py-2.5 px-3 text-right">Today&apos;s Volume</th>
                <th className="py-2.5 px-3 text-right">Commission</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {topRetailers.map((ret, index) => (
                <tr key={ret.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-[10px]">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] block">
                          {ret.name}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {ret.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                    {formatNumber(ret.todayTransactions)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(ret.todayVolume)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600">
                    {formatCurrency(ret.commission)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {ret.approvalStatus === 'PENDING_APPROVAL' ? (
                      <StatusBadge status="PENDING_APPROVAL" label="Awaiting Admin Approval" size="sm" />
                    ) : (
                      <StatusBadge status={ret.status} size="sm" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
