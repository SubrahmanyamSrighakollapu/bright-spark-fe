import React from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  helperText,
  className,
  children,
}) => {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide uppercase flex items-center gap-1"
        >
          {label}
          {required && <span className="text-[var(--danger)] text-sm leading-none">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <span className="text-xs font-medium text-[var(--danger)]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--text-muted)]">{helperText}</span>
      ) : null}
    </div>
  );
};
