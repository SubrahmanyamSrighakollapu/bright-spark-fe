import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  bordered?: boolean;
  contentClassName?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, action, footer, noPadding = false, bordered = true, className, contentClassName, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white/95 rounded-2xl shadow-xs transition-all duration-200',
          bordered ? 'border border-[#E5EBF2]' : '',
          className
        )}
        {...props}
      >
        {(title || subtitle || action) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div>
              {title && (
                <h3 className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        )}

        <div className={cn(noPadding ? '' : 'p-5', contentClassName)}>{children}</div>

        {footer && (
          <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] rounded-b-[var(--radius-lg)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
