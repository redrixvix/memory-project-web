'use client';

import { useEffect, useCallback } from 'react';

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function Lightbox({ src, alt = '', onClose }: LightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(43,43,43,0.88)', backdropFilter: 'blur(8px)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: 'rgba(254,250,224,0.15)', color: 'var(--cornsilk)' }}
        aria-label="Close lightbox"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full rounded-2xl overflow-hidden animate-scale-in"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[85vh] object-contain"
          style={{ borderRadius: 'inherit' }}
        />
      </div>
    </div>
  );
}