'use client';

import React, { useId } from 'react';
import { Tooltip as PrimeTooltip } from 'primereact/tooltip';
import { cn } from '@/utils/cn';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps { content: React.ReactNode; position?: TooltipPosition; children: React.ReactNode; className?: string; }

export const Tooltip: React.FC<TooltipProps> = ({ content, position = 'top', children, className }) => {
  const rawId = useId();
  const targetClass = `qs-tooltip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  if (!content) return <>{children}</>;
  return (
    <>
      <span className={cn('inline-flex', targetClass)}>{children}</span>
      <PrimeTooltip target={`.${targetClass}`} position={position} showDelay={450} hideDelay={80} className={cn('qs-tooltip', className)} unstyled>
        {content}
      </PrimeTooltip>
    </>
  );
};
