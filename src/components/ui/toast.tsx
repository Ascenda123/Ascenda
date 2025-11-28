'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: crypto.randomUUID() }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toneClass = (variant?: ToastVariant) =>
  variant === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : variant === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-border bg-card text-foreground';

const ToastViewport = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) => {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex min-w-[240px] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl',
            toneClass(toast.variant)
          )}
          role="status"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description ? <p className="text-xs text-muted-foreground">{toast.description}</p> : null}
          </div>
          <button
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
