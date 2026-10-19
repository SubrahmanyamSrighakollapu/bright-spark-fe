'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    dropUp: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 220;

    if (align === 'right') {
      const right = Math.max(8, window.innerWidth - rect.right);
      if (dropUp) {
        setCoords({ bottom: Math.max(8, window.innerHeight - rect.top + 6), right, dropUp: true });
      } else {
        setCoords({ top: Math.max(8, rect.bottom + 6), right, dropUp: false });
      }
    } else {
      const left = Math.max(8, rect.left);
      if (dropUp) {
        setCoords({ bottom: Math.max(8, window.innerHeight - rect.top + 6), left, dropUp: true });
      } else {
        setCoords({ top: Math.max(8, rect.bottom + 6), left, dropUp: false });
      }
    }
  }, [align]);

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
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
          'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200/60 bg-white text-slate-500 transition-all',
          'hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 hover:shadow-xs',
          'focus:outline-none focus:ring-2 focus:ring-[#D4E1AE]',
          isOpen && 'border-blue-300 bg-blue-50/50 text-blue-600 shadow-xs'
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="More Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
            }}
            className={cn(
              'z-[9999] min-w-[210px] w-max max-w-[280px] rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95',
              coords.dropUp ? 'origin-bottom-right' : 'origin-top-right'
            )}
          >
            {items.map((item) => {
              if (item.disabled) return null;

              const isDanger = item.danger || item.variant === 'danger';

              return (
                <React.Fragment key={item.key}>
                  {item.divider && <div className="my-1 border-t border-slate-100" />}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors text-left',
                      isDanger
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {item.icon && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
