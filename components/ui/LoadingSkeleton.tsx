"use client";

import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { cn } from '@/utils/cn';

export type SkeletonVariant = 'table' | 'card' | 'kpi' | 'text' | 'circle';

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  height?: string;
  width?: string;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  height,
  width,
  className,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'table') {
    return (
      <div className={cn('w-full border border-[var(--border)] rounded-[var(--radius-lg)] bg-white overflow-hidden', className)}>
        <Skeleton height="2.5rem" className="border-b border-[var(--border)] bg-slate-100" />
        <div className="divide-y divide-[var(--border-subtle)]">
          {items.map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <Skeleton height="1rem" width="25%" />
              <Skeleton height="1rem" width="20%" />
              <Skeleton height="1rem" width="16.666%" />
              <Skeleton height="1rem" width="12.5%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {items.map((_, i) => (
          <div key={i} className="p-5 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xs">
            <Skeleton height="0.75rem" width="5rem" className="mb-3" />
            <Skeleton height="1.75rem" width="8rem" className="mb-2" />
            <Skeleton height="0.75rem" width="4rem" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('p-5 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] space-y-3', className)}>
        <Skeleton height="1rem" width="33.333%" />
        <Skeleton height="5rem" />
        <Skeleton height="0.75rem" width="50%" />
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <Skeleton shape="circle" width={width || '40px'} height={height || '40px'} className={className} />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((_, i) => (
        <Skeleton
          key={i}
          width={width || '100%'}
          height={height || '16px'}
        />
      ))}
    </div>
  );
};
