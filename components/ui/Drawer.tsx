'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type DrawerPosition = 'right' | 'left';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
  className?: string;
  contentClassName?: string;
  footerClassName?: string;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  className,
  contentClassName,
  footerClassName,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

      return () => {
        window.clearTimeout(focusTimer);
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] isolate overflow-hidden" data-drawer-root="true">
      <div
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'absolute inset-y-0 z-10 flex h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden sm:w-auto',
          position === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          className={cn(
            'flex h-full max-h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-white shadow-[-18px_0_50px_-20px_rgba(15,23,42,0.35)] sm:w-screen',
            position === 'right' ? 'border-l border-[#E5EAF1]' : 'border-r border-[#E5EAF1]',
            position === 'right' ? 'slide-in-from-right' : 'slide-in-from-left',
            'animate-in duration-200',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
        >
          {(title || description) && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5EAF1] bg-white px-4 py-4 sm:px-6">
            <div className="min-w-0 py-0.5">
              {title && (
                <h3 id={titleId} className="text-base font-bold text-[#0F172A]">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
              )}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-[#64748B] shadow-xs transition-colors hover:bg-slate-100 hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#155EEF]/30 cursor-pointer"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          )}

          <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6', contentClassName)}>
            {children}
          </div>

          {footer && (
            <div className={cn(
              'shrink-0 border-t border-[#E5EAF1] bg-white px-4 py-3 shadow-[0_-8px_24px_-18px_rgba(15,23,42,0.4)] sm:px-6 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] [&>div]:flex-wrap',
              footerClassName
            )}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
