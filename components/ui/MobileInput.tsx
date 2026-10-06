import React, { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import { cn } from '@/utils/cn';
import { FormField } from './FormField';
import { Phone } from 'lucide-react';

export interface MobileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  value?: string;
  onChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((value: string) => void) | any;
  containerClassName?: string;
}

export const COUNTRY_CODES = [
  { code: '+91', label: '+91 (IN)', flag: '🇮🇳' },
  { code: '+1', label: '+1 (US)', flag: '🇺🇸' },
  { code: '+44', label: '+44 (UK)', flag: '🇬🇧' },
  { code: '+971', label: '+971 (UAE)', flag: '🇦🇪' },
  { code: '+65', label: '+65 (SG)', flag: '🇸🇬' },
];

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  (
    {
      label,
      error,
      helperText,
      countryCode: customCountryCode,
      onCountryCodeChange,
      value,
      onChange,
      disabled,
      required,
      className,
      containerClassName,
      id: customId,
      placeholder = '9346603724',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const [selectedCode, setSelectedCode] = useState<string>(customCountryCode || '+91');

    const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCode = e.target.value;
      setSelectedCode(newCode);
      if (onCountryCodeChange) {
        onCountryCodeChange(newCode);
      }
    };

    const activeCode = customCountryCode !== undefined ? customCountryCode : selectedCode;

    const inputElement = (
      <div className="relative flex items-center w-full rounded-[var(--radius-md)]">
        {/* Left Country Code Dropdown Group */}
        <div className="flex items-center shrink-0 border border-r-0 border-[var(--border)] bg-slate-50 rounded-l-[var(--radius-md)] px-2.5 h-[40px] text-xs font-semibold text-slate-700">
          <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
          <select
            value={activeCode}
            onChange={handleCodeChange}
            disabled={disabled}
            aria-label="Country Code"
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {COUNTRY_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.flag} {item.code}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Number Input Field */}
        <input
          ref={ref}
          id={inputId}
          type="tel"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          maxLength={10}
          className={cn(
            'w-full h-[40px] px-3.5 bg-white text-sm font-mono text-[var(--text-primary)] border border-[var(--border)] rounded-r-[var(--radius-md)] transition-colors placeholder:text-[var(--text-disabled)] focus:outline-hidden focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed',
            error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : '',
            className
          )}
          {...props}
        />
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

MobileInput.displayName = 'MobileInput';
