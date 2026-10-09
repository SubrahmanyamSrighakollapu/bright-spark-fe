'use client';

import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FormField } from './FormField';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> { masked?: boolean; onMaskChange?: (masked: boolean) => void; showToggle?: boolean; label?: string; error?: string; helperText?: string; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; containerClassName?: string; }

export function PasswordInput({ masked = true, onMaskChange, showToggle = true, label, error, helperText, leftIcon, rightIcon, containerClassName, className, id, required, disabled, ...props }: PasswordInputProps) {
  const [internalMasked, setInternalMasked] = useState(masked);
  const isMasked = onMaskChange ? masked : internalMasked;
  const generatedId = useId();
  const inputId = id || generatedId;
  const toggleVisibility = () => {
    const next = !isMasked;
    setInternalMasked(next);
    onMaskChange?.(next);
  };
  const control = (
    <div className="relative flex w-full items-center">
      {leftIcon && <span className="pointer-events-none absolute left-3 z-10 text-[var(--text-muted)]">{leftIcon}</span>}
      <input
        {...props}
        id={inputId}
        type={isMasked ? 'password' : 'text'}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn('h-[40px] w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-disabled)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--bg-secondary)]', leftIcon && 'pl-9', (rightIcon || showToggle) && 'pr-11', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]', className)}
      />
      {rightIcon && <span className="absolute right-3 z-10">{rightIcon}</span>}
      {!rightIcon && showToggle && (
        <button type="button" onClick={toggleVisibility} disabled={disabled}
          className="absolute right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          aria-label={isMasked ? 'Show password' : 'Hide password'} aria-pressed={!isMasked}>
          {isMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
  return label || error || helperText ? <FormField label={label} htmlFor={inputId} required={required} error={error} helperText={helperText} className={containerClassName}>{control}</FormField> : control;
}
