'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  loggedIn: boolean;
}

export function MobileNav({ isOpen, onClose, loggedIn }: MobileNavProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onClose();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(43,43,43,0.5)', backdropFilter: 'blur(4px)' }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 z-50 h-full w-72 shadow-2xl flex flex-col animate-slide-in"
        style={{ backgroundColor: 'rgba(254,250,224,0.96)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(212,163,115,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b" style={{ borderColor: 'rgba(212,163,115,0.15)' }}>
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
            style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#6A6A5A' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/"
            onClick={onClose}
            className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
            style={{ color: 'var(--charcoal)' }}
          >
            Home
          </Link>
          {loggedIn ? (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
              style={{ color: 'var(--charcoal)' }}
            >
              Dashboard
            </Link>
          ) : loggedIn === false ? (
            <>
              <Link
                href="/#how-it-works"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
                style={{ color: 'var(--charcoal)' }}
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
                style={{ color: 'var(--charcoal)' }}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
                style={{ color: 'var(--charcoal)' }}
              >
                FAQ
              </Link>
              <hr className="my-3" style={{ borderColor: 'rgba(212,163,115,0.15)' }} />
              <Link
                href="/login"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm transition-colors hover:bg-white/50"
                style={{ color: '#6A6A5A' }}
              >
                Sign in
              </Link>
            </>
          ) : null}
        </nav>

        {/* Footer — logged out only */}
        {loggedIn === false && (
          <div className="px-6 py-6 border-t" style={{ borderColor: 'rgba(212,163,115,0.15)' }}>
            <Link
              href="/signup"
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              Start free book
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </>
  );
}