export function getExportPeriodLabel(dateRange?: string): string {
  if (!dateRange) return 'all-dates';
  if (dateRange.includes('_to_')) {
    const [start, end] = dateRange.split('_to_');
    return `${start || 'start'}_to_${end || 'present'}`;
  }
  return dateRange;
}
