"use client";

import React from 'react';
import { Tag } from 'primereact/tag';
import { STATUS_META, StatusMeta } from '@/constants/statuses';
import { cn } from '@/utils/cn';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<StatusMeta['variant'], string> = {
  success: 'bg-[var(--success-light)] text-emerald-800 border-[var(--success-border)]',
  danger: 'bg-[var(--danger-light)] text-rose-800 border-[var(--danger-border)]',
  warning: 'bg-[var(--warning-light)] text-amber-800 border-[var(--warning-border)]',
  info: 'bg-[var(--info-light)] text-cyan-800 border-[var(--info-border)]',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotStyles: Record<StatusMeta['variant'], string> = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-cyan-500',
  purple: 'bg-purple-500',
  neutral: 'bg-slate-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label: customLabel,
  showDot = true,
  size = 'md',
  className,
}) => {
  const normalizedKey = (status || '').toUpperCase().trim();
  const meta: StatusMeta = STATUS_META[normalizedKey] || {
    label: customLabel || status || 'UNKNOWN',
    variant: 'neutral',
  };

  const displayLabel = customLabel || meta.label;

  return (
    <Tag
      rounded
      className={cn(
        'inline-flex items-center font-semibold rounded-full border border-solid select-none tracking-tight',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-0.5 text-xs gap-1.5',
        variantStyles[meta.variant],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full shrink-0 animate-pulse',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotStyles[meta.variant]
          )}
        />
      )}
      <span>{displayLabel}</span>
    </Tag>
  );
};
