'use client';

import React from 'react';
import { BusinessEntity } from '@/types/domain';
import { Layers, ArrowDown } from 'lucide-react';

export interface UserHierarchyViewProps {
  entity: BusinessEntity;
}

export const UserHierarchyView: React.FC<UserHierarchyViewProps> = ({ entity }) => {
  const masterNode = 'QSP Master Headquarters';
  const distributorNode = entity.type === 'DISTRIBUTOR' ? entity.name : entity.parentName || 'North Zone Dist';
  const retailerNode = entity.type === 'RETAILER' ? entity.name : entity.type === 'MERCHANT' ? entity.parentName || 'Metro Store #12' : undefined;
  const merchantNode = entity.type === 'MERCHANT' ? entity.name : undefined;

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
      <div className="flex items-center gap-2 font-bold text-slate-900 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-2">
        <Layers className="w-4 h-4 text-[var(--primary)]" />
        <span>Entity Hierarchy Relationship</span>
      </div>

      <div className="flex flex-col items-center space-y-2 py-2 max-w-md mx-auto">
        {/* Master Node */}
        <div className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-center shadow-2xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            Master Entity
          </span>
          <span className="font-semibold text-slate-900">{masterNode}</span>
        </div>

        <ArrowDown className="w-4 h-4 text-slate-400" />

        {/* Distributor Node */}
        <div
          className={`w-full p-2.5 border rounded-lg text-center shadow-2xs ${
            entity.type === 'DISTRIBUTOR'
              ? 'bg-blue-50 border-[var(--primary)] ring-1 ring-[var(--primary)]'
              : 'bg-white border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            Distributor
          </span>
          <span className="font-semibold text-slate-900">{distributorNode}</span>
        </div>

        {retailerNode && (
          <>
            <ArrowDown className="w-4 h-4 text-slate-400" />

            {/* Retailer Node */}
            <div
              className={`w-full p-2.5 border rounded-lg text-center shadow-2xs ${
                entity.type === 'RETAILER'
                  ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-white border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Retailer
              </span>
              <span className="font-semibold text-slate-900">{retailerNode}</span>
            </div>
          </>
        )}

        {merchantNode && (
          <>
            <ArrowDown className="w-4 h-4 text-slate-400" />

            {/* Merchant Node */}
            <div className="w-full p-2.5 bg-amber-50 border border-amber-500 ring-1 ring-amber-500 rounded-lg text-center shadow-2xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Retailer / Business User
              </span>
              <span className="font-semibold text-slate-900">{merchantNode}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
