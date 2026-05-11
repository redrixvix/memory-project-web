'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function Lightbox({ src, alt = '', onClose }: LightboxProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    // Focus trap — keep focus within lightbox
    if (e.key === 'Tab' && containerRef.current) {
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Move focus to close button once visible
    if (visible) closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 lightbox-backdrop"
      style={{ backgroundColor: 'rgba(43,43,43,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image preview'}
      aria-labelledby="lightbox-title"
    >
      {/* Screen reader title */}
      <span id="lightbox-title" className="sr-only">
        {alt || 'Image preview'}
      </span>
      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden lightbox-image"
        style={{ boxShadow: '0 32px 80px rgba(43,43,43,0.50), 0 0 0 1px rgba(212,163,115,0.08), 0 0 60px rgba(212,163,115,0.08)' }}
      >
        <Image
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain"
          style={{ display: 'block', borderRadius: '0.75rem' }}
          unoptimized
        />
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ backgroundColor: 'rgba(254,250,224,0.92)', color: 'var(--charcoal)' }}
          aria-label="Close image preview"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <style>{`
        .lightbox-backdrop {
          background-color: rgba(43,43,43,0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.25s ease;
          animation: fadeIn 0.25s ease forwards;
        }
        .lightbox-image {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes fadeInScale {
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}