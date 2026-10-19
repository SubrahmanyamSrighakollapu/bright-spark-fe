'use client';

import React from 'react';
import { Building2, Users, Store, Shield } from 'lucide-react';
import Link from 'next/link';

export interface NetworkHierarchyScaleProps {
  mdCount: number;
  distributorCount: number;
  retailerCount: number;
  activeRetailersCount: number;
  pendingApprovalsCount: number;
  suspendedCount: number;
}

export const NetworkHierarchyScaleCard: React.FC<NetworkHierarchyScaleProps> = ({
  mdCount,
  distributorCount,
  retailerCount,
  activeRetailersCount,
  pendingApprovalsCount,
  suspendedCount,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Platform Network Scale & Hierarchy
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Multi-tenant entity breakdown & operational governance counts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
            {pendingApprovalsCount} Pending
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 font-semibold border border-rose-200">
            {suspendedCount} Suspended
          </span>
        </div>
      </div>

      {/* Visual Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {/* Tier 1: Master Distributors */}
        <Link
          href="/admin/network/master-distributors"
          className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Tier 1 • MDs</span>
            <Building2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black mt-2 text-white">{mdCount}</p>
          <p className="text-xs text-indigo-200/80 font-medium mt-0.5">Master Distributors</p>
        </Link>

        {/* Tier 2: Distributors */}
        <Link
          href="/admin/network/distributors"
          className="p-3.5 rounded-xl bg-indigo-50/70 border border-[#D4E1AE]/80 hover:bg-[#E8F0D4] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Tier 2 • Distributors</span>
            <Users className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-indigo-950 mt-2">{distributorCount}</p>
          <p className="text-xs text-indigo-800/80 font-medium mt-0.5">Middle Distributors</p>
        </Link>

        {/* Tier 3: Retailers */}
        <Link
          href="/admin/network/retailers"
          className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:bg-[#E8F0D4] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Tier 3 • Retailers</span>
            <Store className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-black text-blue-950">{retailerCount}</p>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeRetailersCount} Active
            </span>
          </div>
          <p className="text-xs text-blue-800/80 font-medium mt-0.5">Transacting Outlets</p>
        </Link>
      </div>
    </div>
  );
};
