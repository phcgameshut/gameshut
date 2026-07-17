"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).showToast = showToast;
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "380px",
          pointerEvents: "none"
        }}
      >
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const colors = {
    success: { border: "#10b981", bg: "rgba(16, 185, 129, 0.08)", iconBg: "#10b981" },
    error: { border: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", iconBg: "#ef4444" },
    info: { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)", iconBg: "#3b82f6" },
    warning: { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", iconBg: "#f59e0b" }
  }[toast.type];

  const icon = {
    success: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    info: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    warning: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  }[toast.type];

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderLeft: `5px solid ${colors.border}`,
        boxShadow: "0 15px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        pointerEvents: "auto",
        minWidth: "300px",
        borderTop: "1px solid rgba(255, 255, 255, 0.5)",
        borderRight: "1px solid rgba(0, 0, 0, 0.05)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
      }}
      className="animate-toast"
    >
      <div 
        style={{ 
          background: colors.iconBg, 
          borderRadius: "50%", 
          width: "28px", 
          height: "28px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: "#0f172a", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.4 }}>
          {toast.message}
        </p>
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
