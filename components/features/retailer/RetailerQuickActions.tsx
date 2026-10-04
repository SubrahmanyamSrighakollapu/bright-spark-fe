'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const RetailerQuickActions: React.FC = () => {
  return (
    <div className="h-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--primary)] border border-blue-100 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
            Quick Counter Actions
          </h4>
          <p className="text-[11px] text-slate-500">
            Initiate instant customer deposit collection or disbursement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        <Link href="/retailer/pay-in" className="min-w-0">
          <Button
            variant="primary"
            size="sm"
            className="w-full gap-1.5 text-xs font-bold shadow-2xs cursor-pointer h-9 px-3 whitespace-nowrap"
            leftIcon={<ArrowDownLeft className="w-4 h-4" />}
          >
            New Pay-In
          </Button>
        </Link>

        <Link href="/retailer/pay-out" className="min-w-0">
          <Button
            size="sm"
            className="w-full gap-1.5 text-xs font-bold bg-[var(--secondary)] text-white hover:bg-orange-700 shadow-2xs cursor-pointer h-9 px-3 whitespace-nowrap"
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            New Pay-Out
          </Button>
        </Link>
      </div>
    </div>
  );
};
