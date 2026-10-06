'use client';

import React, { forwardRef, useId } from 'react';
import { InputTextarea as PrimeTextarea } from 'primereact/inputtextarea';
import { cn } from '@/utils/cn';
import { FormField } from './FormField';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className, containerClassName, id, required, disabled, rows = 4, value, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const control = (
      <PrimeTextarea
        {...props}
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        disabled={disabled}
        value={value == null ? value : String(value)}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-disabled)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-disabled)]',
          error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]',
          className
        )}
      />
    );

    return label || error || helperText ? (
      <FormField label={label} htmlFor={fieldId} required={required} error={error} helperText={helperText} className={containerClassName}>
        {control}
      </FormField>
    ) : control;
  }
);

TextArea.displayName = 'TextArea';
