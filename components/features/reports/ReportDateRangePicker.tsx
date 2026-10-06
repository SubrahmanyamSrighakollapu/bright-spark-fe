'use client';

import React from 'react';
import { ReportDateRange, DateRangePreset } from '@/types/domain';
import { DateRangeDropdown, DateRangeValue, DateFilterPreset } from '@/components/ui/DateRangeDropdown';

export interface ReportDateRangePickerProps {
  value: ReportDateRange;
  onChange: (dateRange: ReportDateRange) => void;
  className?: string;
}

export const ReportDateRangePicker: React.FC<ReportDateRangePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  // Map ReportDateRange preset to DateFilterPreset
  const mapPresetToFilter = (p?: DateRangePreset): DateFilterPreset => {
    switch (p) {
      case 'TODAY':
        return 'today';
      case 'YESTERDAY':
        return 'yesterday';
      case 'LAST_7_DAYS':
        return '7d';
      case 'LAST_30_DAYS':
      case 'THIS_MONTH':
      case 'PREVIOUS_MONTH':
        return '30d';
      case 'CUSTOM':
        return 'custom';
      default:
        return 'today';
    }
  };

  const mapFilterToPreset = (f: DateFilterPreset): DateRangePreset => {
    switch (f) {
      case 'today':
        return 'TODAY';
      case 'yesterday':
        return 'YESTERDAY';
      case '7d':
        return 'LAST_7_DAYS';
      case '30d':
        return 'LAST_30_DAYS';
      case 'custom':
        return 'CUSTOM';
      default:
        return 'TODAY';
    }
  };

  const currentValue: DateRangeValue = {
    preset: mapPresetToFilter(value.preset),
    startDate: value.startDate,
    endDate: value.endDate,
  };

  const handleChange = (newVal: DateRangeValue) => {
    onChange({
      preset: mapFilterToPreset(newVal.preset),
      startDate: newVal.startDate,
      endDate: newVal.endDate,
    });
  };

  return (
    <div className={className}>
      <DateRangeDropdown value={currentValue} onChange={handleChange} align="left" size="md" />
    </div>
  );
};
