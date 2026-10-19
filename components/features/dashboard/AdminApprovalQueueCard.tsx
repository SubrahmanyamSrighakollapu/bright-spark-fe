'use client';

import React from 'react';
import { PendingApprovalItem } from '@/services/approvalService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { Clock3, ArrowRight, Building2, Store } from 'lucide-react';
import Link from 'next/link';

export interface AdminApprovalQueueCardProps {
  items: PendingApprovalItem[];
  onReviewItem: (item: PendingApprovalItem) => void;
}

export const AdminApprovalQueueCard: React.FC<AdminApprovalQueueCardProps> = ({
  items,
  onReviewItem,
}) => {
  const pendingItems = items.filter((i) => i.approvalStatus === 'PENDING_APPROVAL').slice(0, 5);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Pending Admin Approval Workload
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Distributors & Retailers awaiting authorization
            </p>
          </div>
        </div>
        <Link
          href="/admin/network/approvals"
          className="text-xs font-bold text-indigo-600 hover:text-[#25594C] flex items-center gap-1 transition-colors"
        >
          <span>View Approval Center ({items.filter((i) => i.approvalStatus === 'PENDING_APPROVAL').length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {pendingItems.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">No Pending Approvals</p>
          <p className="text-xs text-slate-500">All entity onboarding requests have been authorized.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden bg-slate-50/50">
          {pendingItems.map((item) => (
            <div
              key={`${item.entityType}_${item.id}`}
              className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    item.entityType === 'DISTRIBUTOR'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}
                >
                  {item.entityType === 'DISTRIBUTOR' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Store className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      {item.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Parent MD: <strong className="text-slate-700">{item.parentMasterDistributorName}</strong> • Submitted: {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={item.approvalStatus} size="sm" label="Pending" />
                <button
                  type="button"
                  onClick={() => onReviewItem(item)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-[#25594C] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
