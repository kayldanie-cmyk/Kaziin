"use client";

import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import clsx from "clsx";

/* ============================================================
   Toast — Notification toasts
   Design System §46
   ============================================================ */

export interface ToastData {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  function addToast(toast: Omit<ToastData, "id">) {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[400px]" aria-live="polite">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const icons: Record<string, string> = {
    success: "",
    error: "",
    warning: "",
    info: "ℹ",
  };

  const colors: Record<string, string> = {
    success: "bg-accent-soft text-accent-dark border-accent/30",
    error: "bg-danger-soft text-danger border-danger/30",
    warning: "bg-gold-soft text-gold border-gold/30",
    info: "bg-paper text-ink border-line",
  };

  return (
    <div
      className={clsx(
        "rounded-[12px] border p-4 shadow-lg animate-in slide-in-from-right-5",
        colors[toast.type ?? "info"]
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-[16px] mt-0.5 shrink-0">
          {icons[toast.type ?? "info"]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[14px]">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-[13px] opacity-80">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
