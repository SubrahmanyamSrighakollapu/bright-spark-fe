'use client';

import React from 'react';

interface FinancialMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'payin' | 'payout' | 'success' | 'warning' | 'danger' | 'neutral';
  isDominant?: boolean;
}

export const FinancialMetricCard: React.FC<FinancialMetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'neutral',
  isDominant = false,
}) => {
  // Softly tinted icon background colors for intentional accenting
  const iconTintStyles = {
    primary: 'bg-blue-50 text-[#155EEF]',
    payin: 'bg-emerald-50 text-emerald-600',
    payout: 'bg-amber-50 text-amber-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-rose-50 text-rose-600',
    neutral: 'bg-slate-100 text-slate-600',
  };

  const iconStyle = iconTintStyles[variant] || iconTintStyles.neutral;

  const accentStyles = {
    primary: 'from-blue-500 to-indigo-500',
    payin: 'from-emerald-400 to-teal-500',
    payout: 'from-amber-400 to-orange-500',
    success: 'from-emerald-400 to-teal-500',
    warning: 'from-amber-400 to-orange-500',
    danger: 'from-rose-400 to-red-500',
    neutral: 'from-slate-300 to-slate-400',
  };

  const surfaceStyles = {
    primary: 'from-blue-50/55 via-white to-white',
    payin: 'from-emerald-50/55 via-white to-white',
    payout: 'from-amber-50/60 via-white to-white',
    success: 'from-emerald-50/55 via-white to-white',
    warning: 'from-amber-50/60 via-white to-white',
    danger: 'from-rose-50/55 via-white to-white',
    neutral: 'from-slate-50 via-white to-white',
  };

  return (
    <div className={`group relative overflow-hidden bg-gradient-to-br ${surfaceStyles[variant]} border border-slate-200/90 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.03),0_10px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] ${isDominant ? 'p-6 min-h-[156px]' : 'p-5 min-h-[138px]'}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentStyles[variant]}`} />
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-125" />
      {/* Top: Icon + Label */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
        {icon && (
          <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-inset ring-black/[0.04] ${iconStyle}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Middle: Dominant Financial Value */}
      <div className="mt-3 mb-1">
        <div className={`${isDominant ? 'text-[32px]' : 'text-[28px]'} leading-tight font-extrabold text-[#0F172A] tracking-[-0.035em] tabular-nums font-mono`}>
          {value}
        </div>
      </div>

      {/* Bottom: Context / Subtext */}
      {subtext && (
        <div className="mt-1 flex items-center text-xs text-[#64748B] font-medium">
          {subtext.startsWith('+') || subtext.includes('Growth') ? (
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              {subtext}
            </span>
          ) : (
            <span className="text-[12px] text-[#64748B]">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
};

