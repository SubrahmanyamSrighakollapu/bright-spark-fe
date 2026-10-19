'use client';

import React, { useId, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps { checked?: boolean; defaultChecked?: boolean; indeterminate?: boolean; disabled?: boolean; required?: boolean; name?: string; value?: string; label?: React.ReactNode; id?: string; className?: string; onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void; }

export function Checkbox({ checked, defaultChecked = false, indeterminate = false, disabled, required, name, value, label, id, className, onChange }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = controlled ? checked : internalChecked;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    if (!controlled) setInternalChecked(next);
    onChange?.(next, event);
  };

  return (
    <label htmlFor={inputId} className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]', disabled && 'cursor-not-allowed opacity-60', className)}>
      <span className="relative inline-flex h-4 w-4 shrink-0">
        <input
        id={inputId}
        type="checkbox"
        checked={Boolean(currentChecked)}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        onChange={handleChange}
        className="peer absolute inset-0 z-10 m-0 h-4 w-4 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span className={cn('flex h-4 w-4 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#D4E1AE] peer-focus-visible:ring-offset-1', currentChecked || indeterminate ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-slate-300 bg-white text-transparent')}>
          {indeterminate ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
