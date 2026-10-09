'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConfirmationDialog, ConfirmationVariant } from '@/components/ui/ConfirmationDialog';

export interface ConfirmationOptions {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
}

const ConfirmationContext = createContext<((options: ConfirmationOptions) => Promise<boolean>) | null>(null);

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmationState>({ isOpen: false, title: '', message: '' });
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmationOptions) => {
    resolver.current?.(false);
    setState({ ...options, isOpen: true });
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const finish = (confirmed: boolean) => {
    setState((current) => ({ ...current, isOpen: false }));
    resolver.current?.(confirmed);
    resolver.current = null;
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmationDialog
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText || 'Yes, continue'}
        cancelText={state.cancelText || 'No, cancel'}
        variant={state.variant || 'warning'}
        onConfirm={() => finish(true)}
        onCancel={() => finish(false)}
      />
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error('useConfirmation must be used within ConfirmationProvider');
  return context;
}
