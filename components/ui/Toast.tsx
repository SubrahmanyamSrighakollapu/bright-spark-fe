'use client';

import React, { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
interface ToastContextType { showToast: (message: string, variant?: ToastVariant) => void; toastSuccess: (message: string) => void; toastError: (message: string) => void; toastWarning: (message: string) => void; toastInfo: (message: string) => void; }
interface ToastItem { id: number; message: string; variant: ToastVariant; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);
const styles: Record<ToastVariant, { icon: ReactNode; border: string; iconBox: string; title: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5" />, border: 'border-emerald-200', iconBox: 'bg-emerald-50 text-emerald-600', title: 'Success' },
  error: { icon: <AlertCircle className="h-5 w-5" />, border: 'border-rose-200', iconBox: 'bg-rose-50 text-rose-600', title: 'Error' },
  warning: { icon: <AlertTriangle className="h-5 w-5" />, border: 'border-amber-200', iconBox: 'bg-amber-50 text-amber-600', title: 'Attention required' },
  info: { icon: <Info className="h-5 w-5" />, border: 'border-blue-200', iconBox: 'bg-blue-50 text-blue-600', title: 'Information' },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++idRef.current;
    setItems((current) => [...current.slice(-2), { id, message, variant }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);
  const toastSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const toastError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const toastWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const toastInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toastSuccess, toastError, toastWarning, toastInfo }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[1400] flex w-[min(25rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite" aria-atomic="true">
        {items.map((item) => {
          const style = styles[item.variant];
          return (
            <div key={item.id} className={cn('pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-[0_18px_45px_-18px_rgba(15,23,42,0.4)] animate-in slide-in-from-bottom-2', style.border)} role="status">
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', style.iconBox)}>{style.icon}</span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-bold text-slate-900">{style.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">{item.message}</p>
              </div>
              <button type="button" onClick={() => dismiss(item.id)} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
