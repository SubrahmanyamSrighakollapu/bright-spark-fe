"use client";

import React, { InputHTMLAttributes, forwardRef, useId } from 'react';
import { InputText } from 'primereact/inputtext';
import { cn } from '@/utils/cn';
import { FormField } from './FormField';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      required,
      className,
      containerClassName,
      id: customId,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;

    const inputElement = (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <InputText
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          value={value == null ? value : String(value)}
          className={cn(
            'w-full h-[40px] px-3.5 bg-white text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-[var(--radius-md)] transition-colors placeholder:text-[var(--text-disabled)] focus:outline-hidden focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
            error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : '',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-[var(--text-muted)] flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (label || error || helperText) {
      return (
        <FormField
          label={label}
          htmlFor={inputId}
          required={required}
          error={error}
          helperText={helperText}
          className={containerClassName}
        >
          {inputElement}
        </FormField>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';
