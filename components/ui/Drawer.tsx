'use client';

import React, { useId } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export type DrawerPosition = 'right' | 'left';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';
export interface DrawerProps { isOpen: boolean; onClose: () => void; title?: React.ReactNode; description?: string; children: React.ReactNode; footer?: React.ReactNode; position?: DrawerPosition; size?: DrawerSize; className?: string; contentClassName?: string; footerClassName?: string; }
const sizeClasses: Record<DrawerSize, string> = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg', xl: 'sm:max-w-2xl' };

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, description, children, footer, position = 'right', size = 'md', className, contentClassName, footerClassName }) => {
  const titleId = useId();
  const descriptionId = useId();
  const header = title || description ? (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="min-w-0 py-0.5">
        {title && <h3 id={titleId} className="text-base font-bold text-[#0F172A]">{title}</h3>}
        {description && <p id={descriptionId} className="mt-2 max-w-xl text-sm leading-5 text-[#64748B]">{description}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={onClose} aria-label="Close panel" className="h-9 w-9 shrink-0 p-0"><X className="h-4 w-4" /></Button>
    </div>
  ) : undefined;

  return (
    <Sidebar
      visible={isOpen}
      onHide={onClose}
      position={position}
      modal
      dismissable
      closeOnEscape
      blockScroll
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
      baseZIndex={1200}
      showCloseIcon={false}
      header={header}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      maskClassName="qs-drawer-mask"
      pt={{
        mask: { className: 'qs-drawer-mask' },
        header: { className: 'qs-drawer-header flex shrink-0 items-start border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5' },
        content: { className: 'qs-drawer-content flex min-h-0 flex-1 flex-col overflow-hidden' },
      }}
      className={cn('qs-drawer flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:w-screen', sizeClasses[size], className)}
      unstyled
    >
      <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6', contentClassName)}>{children}</div>
      {footer && <div className={cn('shrink-0 border-t border-[#E5EAF1] bg-white px-4 py-3 shadow-[0_-8px_24px_-18px_rgba(15,23,42,0.4)] sm:px-6 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] [&>div]:flex-wrap', footerClassName)}>{footer}</div>}
    </Sidebar>
  );
};
