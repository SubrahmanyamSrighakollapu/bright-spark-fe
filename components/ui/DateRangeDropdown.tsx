'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export type DateFilterPreset = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

export interface DateRangeValue {
  preset: DateFilterPreset;
  startDate?: string;
  endDate?: string;
  label?: string;
}

export interface DateRangeDropdownProps {
  value?: DateFilterPreset | DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  className?: string;
  showIcon?: boolean;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  allowedPresets?: DateFilterPreset[];
}

const PRESETS: { key: DateFilterPreset; label: string; description: string }[] = [
  { key: 'today', label: 'Today', description: 'Current day transactions' },
  { key: 'yesterday', label: 'Yesterday', description: 'Previous day records' },
  { key: '7d', label: 'Last 7 Days', description: 'Past week summary' },
  { key: '30d', label: 'One Month', description: 'Past 30 days summary' },
  { key: 'custom', label: 'Custom Range', description: 'Select specific date range' },
];

export const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({
  value,
  onChange,
  className,
  showIcon = true,
  align = 'right',
  size = 'sm',
  allowedPresets,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  const initialPreset: DateFilterPreset = typeof value === 'string' ? value : value?.preset || 'today';
  const initialStart = typeof value === 'object' ? value.startDate || '' : '';
  const initialEnd = typeof value === 'object' ? value.endDate || '' : '';

  const [selectedPreset, setSelectedPreset] = useState<DateFilterPreset>(initialPreset);
  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);
  const [showCustomFields, setShowCustomFields] = useState<boolean>(initialPreset === 'custom');

  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        setSelectedPreset(value);
        setShowCustomFields(value === 'custom');
      } else {
        setSelectedPreset(value.preset);
        setStartDate(value.startDate || '');
        setEndDate(value.endDate || '');
        setShowCustomFields(value.preset === 'custom');
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayLabel = (): string => {
    if (selectedPreset === 'custom' && (startDate || endDate)) {
      if (startDate && endDate) return `${startDate} — ${endDate}`;
      if (startDate) return `From ${startDate}`;
      if (endDate) return `Until ${endDate}`;
    }
    const matched = PRESETS.find((p) => p.key === selectedPreset);
    return matched ? matched.label : 'Select Date';
  };

  const handleSelectPreset = (preset: DateFilterPreset) => {
    setSelectedPreset(preset);
    if (preset === 'custom') {
      setShowCustomFields(true);
      // Keep dropdown open to let user enter dates
    } else {
      setShowCustomFields(false);
      setIsOpen(false);
      const matched = PRESETS.find((p) => p.key === preset);
      onChange?.({
        preset,
        label: matched?.label,
      });
    }
  };

  const handleApplyCustom = () => {
    setIsOpen(false);
    onChange?.({
      preset: 'custom',
      startDate,
      endDate,
      label: startDate && endDate ? `${startDate} — ${endDate}` : 'Custom Range',
    });
  };

  return (
    <div className={cn('relative inline-block text-left select-none', isOpen ? 'z-[120]' : 'z-auto', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex w-full min-w-36 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-[var(--text-primary)] transition-colors hover:border-slate-300 focus-visible:border-[var(--border-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4E1AE]',
          size === 'sm' ? 'h-9 text-xs' : 'h-11 text-sm',
          isOpen ? 'border-[var(--border-focus)] ring-2 ring-blue-100' : ''
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {showIcon && <Calendar className="w-3.5 h-3.5 text-[#2F6F5E] shrink-0" />}
          <span className="truncate font-semibold">{getDisplayLabel()}</span>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 cursor-pointer text-slate-500 transition-all duration-200', isOpen ? 'rotate-180 text-[var(--primary)]' : '')}
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-[130] mt-1.5 min-w-full w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="mb-1 flex items-center justify-between border-b border-slate-100 px-2.5 py-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Filter by Date Range
            </span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
              {selectedPreset.toUpperCase()}
            </span>
          </div>

          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto overscroll-contain" role="listbox">
            {PRESETS.filter((preset) => !allowedPresets || allowedPresets.includes(preset.key)).map((preset) => {
              const isSelected = selectedPreset === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectPreset(preset.key)}
                  className={cn(
                    'flex min-h-11 w-full cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm leading-5 outline-none transition-colors',
                    isSelected
                      ? 'bg-[var(--primary-light)] font-bold text-[var(--primary)] hover:bg-[var(--primary-100)]'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  )}
                >
                  <div>
                    <span className="block cursor-pointer font-semibold leading-5">{preset.label}</span>
                    <span className="block cursor-pointer text-[11px] font-normal leading-4 text-slate-400">
                      {preset.description}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2F6F5E] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers Section */}
          {showCustomFields && (
            <div className="pt-2 border-t border-slate-100 space-y-2 p-2 bg-slate-50/60 rounded-xl">
              <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">
                Select Custom Range
              </span>
              <div className="space-y-1.5">
                <div>
                  <label className="text-[10px] text-slate-500 block">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-[#2F6F5E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-[#2F6F5E]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-1.5 bg-[#2F6F5E] hover:bg-[#1B4339] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Apply Date Range</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
