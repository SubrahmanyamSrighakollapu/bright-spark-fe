'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RetailerAttentionPanelProps {
  attentionItems: {
    id: string;
    title: string;
    description: string;
    type: 'WARNING' | 'INFO' | 'SUCCESS';
    actionText?: string;
    actionUrl?: string;
  }[];
  isLoading?: boolean;
}

export const RetailerAttentionPanel: React.FC<RetailerAttentionPanelProps> = ({
  attentionItems,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="h-full min-h-24 bg-slate-100 rounded-xl animate-pulse" />;
  }

  if (attentionItems.length === 0) {
    return (
      <div className="h-full min-h-24 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-emerald-950 block leading-tight">
              All Counter Operations Nominal
            </span>
            <span className="text-[11px] text-emerald-800">
              No pending issues or operational alerts currently require your attention.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-2">
      {attentionItems.map((item) => (
        <div
          key={item.id}
          className={`p-3.5 px-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
            item.type === 'WARNING'
              ? 'bg-amber-50/90 border-amber-200/90 text-amber-950'
              : item.type === 'SUCCESS'
              ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950'
              : 'bg-blue-50/90 border-blue-200/90 text-blue-950'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            {item.type === 'WARNING' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : item.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="font-extrabold block leading-tight">{item.title}</span>
              <span className="text-[11px] opacity-90 block mt-0.5">{item.description}</span>
            </div>
          </div>

          {item.actionText && item.actionUrl && (
            <Link href={item.actionUrl} className="shrink-0 self-stretch sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-auto whitespace-nowrap text-xs font-extrabold gap-1 bg-white border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer shadow-2xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {item.actionText}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};
