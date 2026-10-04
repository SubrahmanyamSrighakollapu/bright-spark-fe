'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export type CardDatePreset = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

export interface CardDateFilterProps {
  value?: CardDatePreset;
  startDate?: string;
  endDate?: string;
  onChange?: (preset: CardDatePreset, customDates?: { startDate: string; endDate: string }) => void;
  className?: string;
  size?: 'xs' | 'sm';
}

const PRESETS: { key: CardDatePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'One Month' },
  { key: 'custom', label: 'Custom Range' },
];

export const CardDateFilter: React.FC<CardDateFilterProps> = ({
  value = '7d',
  startDate: initialStart = '',
  endDate: initialEnd = '',
  onChange,
  className,
  size = 'xs',
}) => {
  const [selected, setSelected] = useState<CardDatePreset>(value);
  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);
  const [showCustomFields, setShowCustomFields] = useState<boolean>(value === 'custom');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(value);
    if (value === 'custom') {
      setShowCustomFields(true);
    }
  }, [value]);

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
    if (selected === 'custom' && (startDate || endDate)) {
      if (startDate && endDate) return `${startDate} — ${endDate}`;
      if (startDate) return `From ${startDate}`;
      if (endDate) return `Until ${endDate}`;
    }
    const matched = PRESETS.find((p) => p.key === selected);
    return matched ? matched.label : 'Last 7 Days';
  };

  const handleSelect = (key: CardDatePreset) => {
    setSelected(key);
    if (key === 'custom') {
      setShowCustomFields(true);
    } else {
      setShowCustomFields(false);
      setIsOpen(false);
      onChange?.(key);
    }
  };

  const handleApplyCustom = () => {
    setIsOpen(false);
    onChange?.('custom', { startDate, endDate });
  };

  return (
    <div className={cn('relative inline-block text-left select-none', isOpen ? 'z-[120]' : 'z-auto', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E5EAF1] hover:border-[#155EEF] text-[#475569] font-semibold rounded-md transition-all cursor-pointer hover:bg-white',
          size === 'xs' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
          isOpen ? 'border-[#155EEF] ring-2 ring-blue-50' : ''
        )}
      >
        <Calendar className="w-3.5 h-3.5 text-[#155EEF]" />
        <span>{getDisplayLabel()}</span>
        <ChevronDown className={cn('w-3 h-3 text-[#64748B] transition-transform duration-200', isOpen ? 'rotate-180 text-[#155EEF]' : '')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[130] mt-1.5 w-56 rounded-xl bg-white border border-[#E5EAF1] shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
          <div className="px-2 py-1 border-b border-[#F1F5F9] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Select Date Range
          </div>

          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {PRESETS.map((p) => {
              const isSelected = selected === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelect(p.key)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors font-medium flex items-center justify-between cursor-pointer',
                    isSelected
                      ? 'bg-blue-50 text-[#155EEF] font-bold'
                      : 'text-[#334155] hover:bg-[#F1F5F9]'
                  )}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#155EEF]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Inputs */}
          {showCustomFields && (
            <div className="pt-2 border-t border-[#F1F5F9] space-y-2 p-2 bg-[#F8FAFC] rounded-lg">
              <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wider">
                Custom Range Pickers
              </span>
              <div className="space-y-1.5">
                <div>
                  <label className="text-[10px] text-[#64748B] block font-medium">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#CBD5E1] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#155EEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] block font-medium">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#CBD5E1] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-1.5 bg-[#155EEF] hover:bg-[#1149B8] text-white rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Apply Range</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
