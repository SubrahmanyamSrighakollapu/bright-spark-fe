'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionTypeBadgeProps {
  type: 'PAY_IN' | 'PAY_OUT' | string;
  size?: 'sm' | 'md';
}

export const TransactionTypeBadge: React.FC<TransactionTypeBadgeProps> = ({
  type,
  size = 'md',
}) => {
  const isPayIn = type === 'PAY_IN';
  const isPayOut = type === 'PAY_OUT';

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (isPayIn) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-lg bg-indigo-50 text-[#2F6F5E] border border-[#D4E1AE]/80 ${paddingClass}`}
      >
        <ArrowDownLeft className="w-3 h-3 text-[#2F6F5E]" />
        <span>Pay-In</span>
      </span>
    );
  }

  if (isPayOut) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-lg bg-orange-50 text-[#F97316] border border-orange-200/80 ${paddingClass}`}
      >
        <ArrowUpRight className="w-3 h-3 text-[#F97316]" />
        <span>Pay-Out</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 ${paddingClass}`}
    >
      <span>{type}</span>
    </span>
  );
};
