"use client";

import { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  variant?: "default" | "success" | "error";
}

export function Toast({ message, visible, onDismiss, duration = 3000, variant = "default" }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const bgColor =
    variant === "success"
      ? "rgba(204,213,174,0.95)"
      : variant === "error"
        ? "rgba(212,163,115,0.95)"
        : "rgba(43,43,43,0.92)";

  const textColor = variant === "default" ? "var(--cornsilk)" : "var(--charcoal)";

  return (
    <div
      className="fixed bottom-7 left-1/2 z-50 animate-fade-up"
      style={{
        transform: "translateX(-50%)",
        minWidth: 240,
        maxWidth: 360,
      }}
    >
      <div
        className="rounded-2xl px-5 py-3.5 shadow-xl flex items-center gap-3"
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
        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-sans)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
