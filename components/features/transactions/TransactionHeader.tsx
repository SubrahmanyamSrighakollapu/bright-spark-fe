'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Wallet, Award, Building2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TransactionHeaderProps {
  type: 'PAY_IN' | 'PAY_OUT';
  title: string;
  subtitle: string;
  retailerId: string;
  walletBalance?: number;
  assignedPlan?: string;
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  type,
  title,
  subtitle,
  retailerId,
  walletBalance,
  assignedPlan = 'Standard Retailer Plan',
}) => {
  const isPayIn = type === 'PAY_IN';

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-4">
        {/* Type Identity Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isPayIn
              ? 'bg-gradient-to-br from-indigo-500 to-[#2F6F5E] text-white ring-4 ring-indigo-50'
              : 'bg-gradient-to-br from-amber-500 to-[#F97316] text-white ring-4 ring-orange-50'
          }`}
        >
          {isPayIn ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
        </div>

        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isPayIn
                  ? 'bg-indigo-50 text-indigo-700 border border-[#D4E1AE]/60'
                  : 'bg-orange-50 text-orange-700 border border-orange-200/60'
              }`}
            >
              {isPayIn ? 'Collection' : 'Disbursement'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Context Badges */}
      <div className="flex items-center gap-2.5 flex-wrap text-xs text-slate-600 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Retailer ID:</span>
          <span className="font-semibold font-mono text-slate-800">{retailerId}</span>
        </div>

        {walletBalance !== undefined && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-400">Wallet:</span>
            <span className="font-semibold font-mono text-emerald-700">{formatCurrency(walletBalance)}</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-medium">
          <Award className={`w-3.5 h-3.5 ${isPayIn ? 'text-indigo-600' : 'text-orange-500'}`} />
          <span className="text-slate-400">Plan:</span>
          <span className="font-semibold text-slate-800">{assignedPlan}</span>
        </div>
      </div>
    </div>
  );
};
