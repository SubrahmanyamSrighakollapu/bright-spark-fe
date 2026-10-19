'use client';

import React from 'react';
import { Loader2, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TransactionProcessingStateProps {
  type: 'PAY_IN' | 'PAY_OUT';
  amount: number;
  paymentMode: string;
  serviceType?: string;
  reference?: string;
  beneficiaryName?: string;
  customerMobile?: string;
}

export const TransactionProcessingState: React.FC<TransactionProcessingStateProps> = ({
  type,
  amount,
  paymentMode,
  serviceType,
  reference,
  beneficiaryName,
  customerMobile,
}) => {
  const isPayIn = type === 'PAY_IN';

  return (
    <div className="max-w-md mx-auto my-8 p-8 rounded-2xl bg-white border border-slate-200/90 shadow-lg text-center space-y-6 animate-fadeIn">
      {/* Animated Spinner & Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isPayIn ? 'bg-indigo-50 text-[#2F6F5E]' : 'bg-orange-50 text-[#F97316]'
          }`}
        >
          {isPayIn ? <ArrowDownLeft className="w-10 h-10" /> : <ArrowUpRight className="w-10 h-10" />}
        </div>
        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" />
      </div>

      {/* Primary Message */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {isPayIn ? 'Processing Pay-In' : 'Processing Pay-Out'}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Your transaction request is being processed. Please do not refresh or submit again.
        </p>
      </div>

      {/* Amount Hero */}
      <div className="py-4 px-6 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isPayIn ? 'Collection Amount' : 'Disbursement Amount'}
        </span>
        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
          {formatCurrency(amount)}
        </div>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
            {paymentMode}
          </span>
          {serviceType && (
            <span className="text-[11px] text-slate-500 font-medium">{serviceType}</span>
          )}
        </div>
      </div>

      {/* Transaction Details Context */}
      <div className="text-xs text-slate-600 space-y-2 text-left bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-mono">
        {isPayIn && customerMobile && (
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Customer Mobile:</span>
            <span className="font-semibold text-slate-800">{customerMobile}</span>
          </div>
        )}
        {!isPayIn && beneficiaryName && (
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Beneficiary:</span>
            <span className="font-semibold text-slate-800">{beneficiaryName}</span>
          </div>
        )}
        {reference && (
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Reference ID:</span>
            <span className="font-semibold text-slate-800">{reference}</span>
          </div>
        )}
      </div>

      {/* Footer Security Badge */}
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Transaction request submitted securely</span>
      </div>
    </div>
  );
};
