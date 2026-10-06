'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export interface ModalProps { isOpen: boolean; onClose: () => void; title?: React.ReactNode; description?: string; children: React.ReactNode; footer?: React.ReactNode; size?: ModalSize; closeOnOverlayClick?: boolean; className?: string; }

const sizeClasses: Record<ModalSize, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children, footer, size = 'md', closeOnOverlayClick = true, className }) => {
  const header = title || description ? (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="min-w-0">
        {title && <h3 className="text-lg font-semibold leading-snug text-[var(--text-primary)]">{title}</h3>}
        {description && <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>}
      </div>
      <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal" className="h-8 w-8 shrink-0 p-0"><X className="h-5 w-5" /></Button>
    </div>
  ) : undefined;

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      modal
      dismissableMask={closeOnOverlayClick}
      closeOnEscape
      blockScroll
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
      baseZIndex={1200}
      draggable={false}
      resizable={false}
      closable={false}
      header={header}
      footer={footer ? <div className="flex flex-wrap items-center justify-end gap-3">{footer}</div> : undefined}
      maskClassName="qs-dialog-mask"
      pt={{
        mask: { className: 'qs-dialog-mask' },
        header: { className: 'qs-dialog-header flex shrink-0 items-start border-b border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5' },
        headerTitle: { className: 'min-w-0 w-full' },
        content: { className: 'qs-dialog-content min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6' },
        footer: { className: 'qs-dialog-footer shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6' },
      }}
      className={cn('qs-dialog flex max-h-[90dvh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-modal)]', sizeClasses[size], className)}
      unstyled
    >
      {children}
    </Dialog>
  );
};
