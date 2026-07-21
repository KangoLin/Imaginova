"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastCtx {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

function ToastIcon({ type }: { type: Toast["type"] }) {
  const shared = "w-4 h-4 shrink-0";
  if (type === "success") return <CheckCircle2 className={shared} />;
  if (type === "error") return <XCircle className={shared} />;
  return <Info className={shared} />;
}

function ToastItem({ t, onRemove }: { t: Toast; onRemove: (id: number) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pausedRef = useRef(false);

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => onRemove(t.id), 4000);
  }, [t.id, onRemove]);

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, [startTimer]);

  return (
    <div
      role="status"
      className={`animate-slide-up flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-lg border pointer-events-auto ${
        t.type === "success" ? "bg-primary text-primary-foreground border-primary/20" :
        t.type === "error" ? "bg-destructive text-destructive-foreground border-destructive/20" :
        "bg-card text-foreground border-border"
      }`}
      onMouseEnter={() => { pausedRef.current = true; clearTimeout(timerRef.current); }}
      onMouseLeave={() => { pausedRef.current = false; startTimer(); }}
    >
      <ToastIcon type={t.type} />
      <span className="flex-1">{t.message}</span>
      <button onClick={() => onRemove(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity" aria-label="Dismiss"><X size={14} /></button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
