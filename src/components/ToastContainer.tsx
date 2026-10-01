import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import React from 'react';
import { ToastState } from '../hooks/useAttendance';

interface ToastContainerProps {
  toasts: ToastState[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-emerald-900/90 text-emerald-100 border-emerald-700/60',
    warning: 'bg-amber-900/90 text-amber-100 border-amber-700/60',
    error: 'bg-rose-900/90 text-rose-100 border-rose-700/60',
    info: 'bg-stone-900/90 text-stone-100 border-stone-700/60',
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        const style = styles[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all text-xs font-medium ${style}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveToast(toast.id)}
              className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
