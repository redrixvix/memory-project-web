'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
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
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150',
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
      <a href={href} className="block">
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