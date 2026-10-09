import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export type ConfirmationVariant = 'danger' | 'warning' | 'info';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

const iconMap = {
  danger: <AlertTriangle className="w-6 h-6 text-[var(--danger)]" />,
  warning: <AlertCircle className="w-6 h-6 text-[var(--warning)]" />,
  info: <Info className="w-6 h-6 text-[var(--info)]" />,
};

const iconBgMap = {
  danger: 'bg-[var(--danger-light)]',
  warning: 'bg-[var(--warning-light)]',
  info: 'bg-[var(--info-light)]',
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', iconBgMap[variant])}>
          {iconMap[variant]}
        </div>

        <div>
          <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{message}</div>
        </div>
      </div>
    </Modal>
  );
};
