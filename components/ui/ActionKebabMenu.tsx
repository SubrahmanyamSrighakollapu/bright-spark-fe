'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ActionKebabMenuProps {
  items: ActionMenuItem[];
  className?: string;
  align?: 'left' | 'right';
}

export const ActionKebabMenu: React.FC<ActionKebabMenuProps> = ({
  items,
  className,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than 160px (or near bottom of table container), flip menu upwards
      setDropUp(spaceBelow < 160);
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeItems = items.filter((item) => !item.disabled);
  if (activeItems.length === 0) return null;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-slate-500 transition-colors',
          'hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          isOpen && 'border-slate-200 bg-slate-100 text-slate-900 shadow-xs'
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="More Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10 ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95',
            dropUp ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => {
            if (item.disabled) return null;

            const isDanger = item.danger || item.variant === 'danger';
            const isSuccess = item.variant === 'success';
            const isWarning = item.variant === 'warning';
            const isInfo = item.variant === 'info';

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                  isDanger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : isSuccess
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : isWarning
                    ? 'text-amber-700 hover:bg-amber-50'
                    : isInfo
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
