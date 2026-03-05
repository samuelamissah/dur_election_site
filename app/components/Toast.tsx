'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
};

type ToastContextType = {
  show: (opts: { message: string; title?: string; variant?: ToastItem['variant'] }) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((opts: { message: string; title?: string; variant?: ToastItem['variant'] }) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, message: opts.message, title: opts.title, variant: opts.variant || 'info' };
    setToasts(prev => [...prev, item]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map(t => (
          <div
            key={t.id}
            className={
              'w-80 rounded-lg shadow-lg border px-4 py-3 transition ' +
              (t.variant === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : t.variant === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/80 dark:border-zinc-700 dark:text-zinc-100')
            }
          >
            {t.title && <div className="text-sm font-semibold mb-1">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
