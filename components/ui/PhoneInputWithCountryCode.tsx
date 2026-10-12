'use client';

import React, { useMemo } from 'react';
import { all, type CountryData } from 'country-codes-list';
import { Phone, ChevronDown } from 'lucide-react';

export interface PhoneInputWithCountryCodeProps {
  label?: string;
  required?: boolean;
  value: string;
  countryCode?: string;
  onPhoneChange: (phone: string) => void;
  onCountryCodeChange?: (countryCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  name?: string;
  className?: string;
  maxLength?: number;
}

export interface CountryOption {
  key: string;
  iso: string;
  callingCode: string; // e.g. "+91"
  name: string;
  flag: string;
  displayLabel: string;
  shortLabel: string;
}

const getCountryOptions = (): CountryOption[] => {
  try {
    const rawList: CountryData[] = all();
    const map = new Map<string, CountryOption>();

    rawList.forEach((c) => {
      if (!c.countryCallingCode) return;
      const formattedCode = c.countryCallingCode.startsWith('+')
        ? c.countryCallingCode
        : `+${c.countryCallingCode}`;

      const key = `${c.countryCode}-${formattedCode}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          iso: c.countryCode,
          callingCode: formattedCode,
          name: c.countryNameEn,
          flag: c.flag || '🌐',
          displayLabel: `${c.flag || '🌐'} ${formattedCode} (${c.countryNameEn})`,
          shortLabel: `${c.flag || '🌐'} ${formattedCode}`,
        });
      }
    });

    const list = Array.from(map.values());

    // Priority ISOs
    const priorityISOs = ['IN', 'US', 'GB', 'AE', 'CA', 'AU', 'SG'];
    list.sort((a, b) => {
      const idxA = priorityISOs.indexOf(a.iso);
      const idxB = priorityISOs.indexOf(b.iso);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return list;
  } catch {
    return [
      {
        key: 'IN-+91',
        iso: 'IN',
        callingCode: '+91',
        name: 'India',
        flag: '🇮🇳',
        displayLabel: '🇮🇳 +91 (India)',
        shortLabel: '🇮🇳 +91',
      },
      {
        key: 'US-+1',
        iso: 'US',
        callingCode: '+1',
        name: 'United States',
        flag: '🇺🇸',
        displayLabel: '🇺🇸 +1 (United States)',
        shortLabel: '🇺🇸 +1',
      },
    ];
  }
};

export const PhoneInputWithCountryCode: React.FC<PhoneInputWithCountryCodeProps> = ({
  label,
  required = false,
  value,
  countryCode = '+91',
  onPhoneChange,
  onCountryCodeChange,
  placeholder = '10-digit mobile number',
  disabled = false,
  error,
  id,
  name = 'mobile',
  className = '',
  maxLength = 15,
}) => {
  const countryOptions = useMemo(() => getCountryOptions(), []);

  const selectedOption = useMemo(() => {
    const normalized = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    return (
      countryOptions.find((c) => c.callingCode === normalized || c.key.endsWith(normalized)) ||
      countryOptions[0]
    );
  }, [countryCode, countryOptions]);

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const item = countryOptions.find((c) => c.key === selectedKey);
    if (item && onCountryCodeChange) {
      onCountryCodeChange(item.callingCode);
    }
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d\s-]/g, '');
    onPhoneChange(cleaned);
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[#334155]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* PrimeReact Styled Combined Input Box */}
      <div
        className={`flex items-center rounded-xl border bg-white shadow-2xs transition-all duration-200 focus-within:border-[#155EEF] focus-within:ring-2 focus-within:ring-[#155EEF]/15 ${
          error ? 'border-rose-300 ring-2 ring-rose-100' : 'border-[#E5EAF1] hover:border-slate-300'
        } ${disabled ? 'bg-slate-50 opacity-65 cursor-not-allowed' : ''}`}
      >
        {/* Country Select Trigger (Compact PrimeReact Pill) */}
        <div className="relative flex items-center justify-between min-w-[95px] max-w-[105px] border-r border-[#E5EAF1] bg-slate-50/90 rounded-l-xl px-2.5 py-2.5 shrink-0 hover:bg-slate-100/80 transition-colors">
          <span className="text-xs font-bold text-slate-800 truncate select-none">
            {selectedOption?.shortLabel || '🇮🇳 +91'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />

          {/* Overlay Native Select for Full Accessibility & Choice */}
          <select
            value={selectedOption ? selectedOption.key : countryOptions[0]?.key}
            onChange={handleCountrySelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            aria-label="Select Country Calling Code"
          >
            {countryOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.displayLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Input Field */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Phone className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            id={id}
            name={name}
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={handlePhoneInputChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="w-full bg-transparent px-2.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed font-medium min-w-0"
          />
        </div>
      </div>

      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
};
