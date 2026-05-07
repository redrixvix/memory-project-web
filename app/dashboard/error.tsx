'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--bronze)' }}>
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h2 className="text-xl font-medium mb-3" style={{ color: 'var(--charcoal)' }}>
          Something went wrong
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
          We couldn&apos;t load your books right now. This has been logged and we&apos;ll look into it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-6 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-11 px-6 rounded-full text-sm font-medium border transition-all duration-200 hover:opacity-80 flex items-center justify-center"
            style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)' }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
