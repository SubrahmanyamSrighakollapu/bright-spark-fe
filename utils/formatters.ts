/**
 * Financial and general formatting utilities for Qin Star Pay.
 * Formats currency (including Indian Rupee format), numbers, percentages, dates, and times.
 */

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  compact?: boolean;
  showSymbol?: boolean;
}

/**
 * Formats a numeric amount into currency representation.
 * Default locale is 'en-IN' for Indian numbering system (e.g. ₹99,53,681.66).
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }

  const {
    currency = 'INR',
    locale = 'en-IN',
    decimals = 2,
    compact = false,
    showSymbol = true,
  } = options;

  if (compact) {
    return formatCompactCurrency(amount, currency, showSymbol);
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return formatter.format(amount);
  } catch {
    const formattedNum = amount.toFixed(decimals);
    return showSymbol ? `₹${formattedNum}` : formattedNum;
  }
}

/**
 * Formats large amounts into compact notation (e.g. ₹1.2Cr, ₹50L, ₹10K).
 */
function formatCompactCurrency(amount: number, currency: string, showSymbol: boolean): string {
  const symbol = showSymbol ? (currency === 'INR' ? '₹' : '$') : '';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    return `${sign}${symbol}${(absAmount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    return `${sign}${symbol}${(absAmount / 100000).toFixed(2)} L`;
  }
  if (absAmount >= 1000) {
    return `${sign}${symbol}${(absAmount / 1000).toFixed(1)} K`;
  }
  return `${sign}${symbol}${absAmount.toFixed(2)}`;
}

/**
 * Formats a number with Indian/specified locale separator (e.g. 1,24,580).
 */
export function formatNumber(
  value: number | null | undefined,
  options: { locale?: string; decimals?: number } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  const { locale = 'en-IN', decimals = 0 } = options;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Converts an INR amount to uppercase English words using the Indian scale. */
export function formatAmountInWords(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount) || amount < 0) return '';

  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const belowThousand = (value: number): string => {
    const words: string[] = [];
    if (value >= 100) { words.push(ones[Math.floor(value / 100)], 'HUNDRED'); value %= 100; }
    if (value >= 20) { words.push(tens[Math.floor(value / 10)]); value %= 10; }
    if (value > 0) words.push(ones[value]);
    return words.join(' ');
  };
  const integerToWords = (value: number): string => {
    if (value === 0) return 'ZERO';
    const groups = [
      { value: 10000000, label: 'CRORE' },
      { value: 100000, label: 'LAKH' },
      { value: 1000, label: 'THOUSAND' },
    ];
    const words: string[] = [];
    for (const group of groups) {
      if (value >= group.value) {
        const count = Math.floor(value / group.value);
        words.push(integerToWords(count), group.label);
        value %= group.value;
      }
    }
    if (value > 0) words.push(belowThousand(value));
    return words.join(' ');
  };

  const rounded = Math.round(amount * 100);
  const rupees = Math.floor(rounded / 100);
  const paise = rounded % 100;
  const rupeeWords = `RUPEES ${integerToWords(rupees)}`;
  return paise > 0 ? `${rupeeWords} AND ${integerToWords(paise)} PAISE ONLY` : `${rupeeWords} ONLY`;
}

/**
 * Formats a number as a percentage (e.g. 98.4%).
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a date string, Date object, or timestamp into human-readable date.
 * Example output: "03 Sep 2026"
 */
export function formatDate(
  dateInput: string | Date | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
  } catch {
    return '-';
  }
}

/**
 * Formats a date string, Date object, or timestamp into date with time.
 * Example output: "03 Sep 2026, 03:20 PM"
 */
export function formatDateTime(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '-';
  }
}
