'use client';

import React, { useId } from 'react';
import { Password } from 'primereact/password';
import { cn } from '@/utils/cn';
import { FormField } from './FormField';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> { masked?: boolean; onMaskChange?: (masked: boolean) => void; label?: string; error?: string; helperText?: string; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; containerClassName?: string; }

export function PasswordInput({ masked = true, onMaskChange: _onMaskChange, label, error, helperText, leftIcon, rightIcon, containerClassName, className, id, required, disabled, ...props }: PasswordInputProps) {
  void _onMaskChange;
  const generatedId = useId();
  const inputId = id || generatedId;
  const control = (
    <div className="relative flex w-full items-center">
      {leftIcon && <span className="pointer-events-none absolute left-3 z-10 text-[var(--text-muted)]">{leftIcon}</span>}
      <Password
        {...props}
        inputId={inputId}
        type={masked ? 'password' : 'text'}
        feedback={false}
        toggleMask={false}
        disabled={disabled}
        required={required}
        invalid={Boolean(error)}
        className="block w-full"
        inputClassName={cn('h-[40px] w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-disabled)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--bg-secondary)]', leftIcon && 'pl-9', rightIcon && 'pr-10', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]', className)}
        unstyled
      />
      {rightIcon && <span className="absolute right-3 z-10">{rightIcon}</span>}
    </div>
  );
  return label || error || helperText ? <FormField label={label} htmlFor={inputId} required={required} error={error} helperText={helperText} className={containerClassName}>{control}</FormField> : control;
}
