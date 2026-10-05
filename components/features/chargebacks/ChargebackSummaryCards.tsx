'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ChargebackSummary } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';
import { ShieldAlert, AlertTriangle, FileText, Clock, Award, ShieldX, DollarSign } from 'lucide-react';

export interface ChargebackSummaryCardsProps {
  summary: ChargebackSummary;
}

export const ChargebackSummaryCards: React.FC<ChargebackSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {/* 1. Open Cases */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-[var(--primary)] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Open Cases</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-lg text-[var(--primary)]">
          {summary.openCases}
        </div>
        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Active representments</span>
      </Card>

      {/* 2. Under Review */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Under Review</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-lg text-amber-700">
          {summary.underReview}
        </div>
        <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">Risk team evaluation</span>
      </Card>

      {/* 3. Evidence Required */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-purple-400 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Evidence Queue</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
            <FileText className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-lg text-purple-900">
          {summary.evidenceRequired}
        </div>
        <span className="text-[10px] text-purple-600 block mt-0.5 font-medium">Awaiting retailer POD</span>
      </Card>

      {/* 4. Response Due Soon */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-rose-400 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Due Soon</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-lg text-rose-700">
          {summary.responseDueSoon}
        </div>
        <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">Deadline approaching</span>
      </Card>

      {/* 5. Won Cases */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Won Cases</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-lg text-emerald-700">
          {summary.wonCases}
        </div>
        <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Representment accepted</span>
      </Card>

      {/* 6. Lost Cases */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lost Cases</span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <ShieldX className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-lg text-slate-800">
          {summary.lostCases}
        </div>
        <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Booked financial loss</span>
      </Card>

      {/* 7. Total Disputed Amount */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-[var(--primary)] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disputed Volume</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 font-mono font-extrabold text-base text-slate-900 truncate">
          {formatCurrency(summary.totalDisputedAmount)}
        </div>
        <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">Win Rate: {summary.winRate}%</span>
      </Card>
    </div>
  );
};

