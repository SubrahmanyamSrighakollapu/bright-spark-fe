'use client';

import React, { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SelectOption } from '@/types/common';
import { FormField } from './FormField';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  searchable?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    options,
    placeholder = 'Select option...',
    error,
    helperText,
    disabled,
    required,
    className,
    containerClassName,
    id: customId,
    value,
    defaultValue,
    onChange,
    name,
    searchable = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...nativeProps
  }, ref) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const currentValue = value ?? defaultValue ?? '';

    const notifyChange = (event: DropdownChangeEvent) => {
      if (!onChange) return;
      const target = { value: String(event.value ?? ''), name: name ?? '' } as EventTarget & HTMLSelectElement;
      onChange({ target, currentTarget: target } as React.ChangeEvent<HTMLSelectElement>);
    };

    const control = (
      <div className="relative w-full">
        <select
          {...nativeProps}
          ref={ref}
          id={`${selectId}-native`}
          name={name}
          value={String(currentValue)}
          onChange={onChange}
          disabled={disabled}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px opacity-0"
        >
          <option value="" />
          {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>

        <Dropdown
          inputId={selectId}
          name={name}
          value={currentValue}
          options={options}
          optionLabel="label"
          optionValue="value"
          optionDisabled="disabled"
          disabled={disabled}
          required={required}
          filter={searchable}
          filterPlaceholder="Search..."
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          aria-labelledby={ariaLabelledBy}
          onChange={notifyChange}
          dropdownIcon={<ChevronDown className="h-4 w-4" />}
          panelClassName="qs-dropdown-panel"
          pt={{
            input: { className: 'flex min-w-0 flex-1 cursor-pointer items-center px-4 text-sm leading-5' },
            trigger: { className: 'flex w-11 shrink-0 cursor-pointer items-center justify-center text-slate-500 transition-colors' },
            panel: { className: 'qs-dropdown-panel overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl' },
            wrapper: { className: 'max-h-72 overflow-y-auto overscroll-contain' },
            list: { className: 'm-0 flex list-none flex-col gap-1 p-0' },
            item: { className: 'flex min-h-11 cursor-pointer select-none items-center rounded-lg px-3.5 py-2.5 text-sm leading-5 text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-950' },
            itemLabel: { className: 'cursor-pointer' },
          }}
          className={cn(
            'qs-dropdown relative flex h-11 w-full cursor-pointer select-none items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white text-sm text-[var(--text-primary)] transition-colors hover:border-slate-300 focus-within:border-[var(--border-focus)] focus-within:ring-2 focus-within:ring-blue-100',
            !currentValue && 'text-[var(--text-disabled)]',
            disabled && 'cursor-not-allowed bg-[var(--bg-secondary)] text-[var(--text-disabled)]',
            error && 'border-[var(--danger)] focus-within:border-[var(--danger)] focus-within:ring-[var(--danger)]',
            className
          )}
          unstyled
        />
      </div>
    );

    return label || error || helperText ? (
      <FormField label={label} htmlFor={selectId} required={required} error={error} helperText={helperText} className={containerClassName}>
        {control}
      </FormField>
    ) : control;
  }
);

Select.displayName = 'Select';
