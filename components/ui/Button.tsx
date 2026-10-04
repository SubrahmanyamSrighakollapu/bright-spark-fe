import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:opacity-95 shadow-xs border border-transparent',
  secondary:
    'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-slate-200 active:bg-slate-300 border border-[var(--border)]',
  outline:
    'bg-white text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-app)] hover:border-slate-300 active:bg-slate-100',
  danger:
    'bg-[var(--danger)] text-white hover:bg-red-600 active:opacity-95 shadow-xs border border-transparent',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-[32px] px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-[40px] px-4 text-sm gap-2 rounded-[var(--radius-md)]',
  lg: 'h-[44px] px-5 text-base gap-2.5 rounded-[var(--radius-md)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
        ) : null}

        {children && <span className="whitespace-nowrap leading-none">{children}</span>}

        {!isLoading && rightIcon ? (
          <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
