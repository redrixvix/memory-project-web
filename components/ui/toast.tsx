"use client";

import { useEffect, useCallback } from "react";

export interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  variant?: "default" | "success" | "error";
}

export function Toast({ message, visible, onDismiss, duration = 3000, variant = "default" }: ToastProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      const timer = setTimeout(onDismiss, duration);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [visible, duration, onDismiss, handleKeyDown]);

  if (!visible) return null;

  const bgColor =
    variant === "success"
      ? "rgba(204,213,174,0.95)"
      : variant === "error"
        ? "rgba(180,60,60,0.92)"
        : "rgba(43,43,43,0.92)";

  const textColor = variant === "default" ? "var(--cornsilk)" : "var(--charcoal)";

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-7 left-1/2 z-50 animate-fade-up"
      style={{
        transform: "translateX(-50%)",
        minWidth: 240,
        maxWidth: 360,
      }}
    >
      <div
        className="rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
        style={{
          background: bgColor,
          color: textColor,
          backdropFilter: "blur(20px)",
        }}
      >
        {variant === "success" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--tea-green)", flexShrink: 0 }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
        <p className="text-sm font-medium flex-1" style={{ fontFamily: "var(--font-sans)" }}>
          {message}
        </p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="rounded-lg p-1.5 transition-colors duration-150 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          style={{ flexShrink: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
