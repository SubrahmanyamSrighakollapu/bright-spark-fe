import React, { useState, useEffect, ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search by Reference, Retailer, ID...',
  value: externalValue,
  onChange,
  onDebouncedSearch,
  debounceMs = 300,
  className,
  disabled = false,
}) => {
  const isControlled = externalValue !== undefined;
  const [internalValue, setInternalValue] = useState(externalValue || '');
  const currentValue = isControlled ? externalValue : internalValue;

  const debouncedSearch = useDebounce(currentValue, debounceMs);

  useEffect(() => {
    if (onDebouncedSearch) {
      onDebouncedSearch(debouncedSearch);
    }
  }, [debouncedSearch, onDebouncedSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    if (onChange) onChange('');
    if (onDebouncedSearch) onDebouncedSearch('');
  };

  return (
    <div className={cn('relative flex items-center w-full min-w-[240px]', className)}>
      <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        className="w-full h-[38px] pl-9 pr-8 bg-white text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-[var(--radius-md)] transition-colors placeholder:text-[var(--text-disabled)] focus:outline-hidden focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:bg-[var(--bg-secondary)]"
      />
      {currentValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
