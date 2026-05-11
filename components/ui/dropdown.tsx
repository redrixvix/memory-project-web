'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const focusableItemsRef = useRef<HTMLElement[]>([]);

  const collectFocusable = useCallback(() => {
    if (!ref.current) return [];
    return Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    const items = focusableItemsRef.current;
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        // Wait for render then focus next
        setTimeout(() => {
          const updated = collectFocusable().filter(el => !el.hasAttribute('data-dropdown-trigger'));
          focusableItemsRef.current = updated;
          const current = document.activeElement;
          const idx = updated.indexOf(current as HTMLElement);
          const next = updated[idx + 1] ?? updated[0];
          next?.focus();
        }, 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        setTimeout(() => {
          const updated = collectFocusable().filter(el => !el.hasAttribute('data-dropdown-trigger'));
          focusableItemsRef.current = updated;
          const current = document.activeElement;
          const idx = updated.indexOf(current as HTMLElement);
          const prev = updated[idx - 1] ?? updated[updated.length - 1];
          prev?.focus();
        }, 0);
        break;
      case 'Home':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        setTimeout(() => {
          focusableItemsRef.current[0]?.focus();
        }, 0);
        break;
      case 'End':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        setTimeout(() => {
          const items = focusableItemsRef.current;
          items[items.length - 1]?.focus();
        }, 0);
        break;
      case 'Tab':
        // Allow natural tab close on Shift+Tab past first or Tab past last
        break;
      default:
        break;
    }
  }, [isOpen, collectFocusable]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? 'dropdown-menu' : undefined}
        data-dropdown-trigger="true"
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
            setTimeout(() => {
              const items = collectFocusable().filter(el => !el.hasAttribute('data-dropdown-trigger'));
              focusableItemsRef.current = items;
              items[0]?.focus();
            }, 0);
          }
        }}
      >
        {trigger}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            id="dropdown-menu"
            role="menu"
            className={cn(
              'absolute z-50 mt-2 w-52 rounded-2xl border py-2 shadow-xl animate-scale-in',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            style={{
              backgroundColor: 'rgba(254,250,224,0.97)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(212,163,115,0.18)',
              boxShadow: '0 20px 60px rgba(212,163,115,0.15)',
              animationDuration: '0.2s',
              animationFillMode: 'both',
            }}
          >
            {children}
          </div>
          <style>{`
            @keyframes scale-in {
              from { opacity: 0; transform: scale(0.92) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both; }
          `}</style>
        </>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  icon?: React.ReactNode;
}

export function DropdownItem({ children, onClick, href, danger, icon }: DropdownItemProps) {
  const content = (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-inset',
        danger
          ? 'hover:bg-red-50 text-red-700'
          : 'hover:bg-white/60'
      )}
      style={{
        color: danger ? '#991B1B' : 'var(--charcoal)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {icon && <span className="w-4 h-4 shrink-0 opacity-70">{icon}</span>}
      {children}
    </button>
  );

  if (href) {
    return (
      <a href={href} role="menuitem" className="block">
        {content}
      </a>
    );
  }
  return content;
}

export function DropdownDivider() {
  return (
    <div
      className="mx-3 my-2 border-t"
      style={{ borderColor: 'rgba(212,163,115,0.12)' }}
    />
  );
}