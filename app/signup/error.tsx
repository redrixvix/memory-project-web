'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SignupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Signup Error]', error);
  }, [error]);

  return (
    <div
      id="signup-error"
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
      aria-labelledby="signup-error-heading"
    >
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--bronze-12)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--bronze)' }} aria-hidden="true">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h2 id="signup-error-heading" className="text-xl font-medium mb-3" style={{ color: 'var(--charcoal)' }}>
          Something went wrong
        </h2>
        <p id="signup-error-message" className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }} role="alert" aria-live="polite">
          We couldn&apos;t load the signup page right now. This has been logged and we&apos;ll look into it.
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
            style={{ borderColor: 'var(--bronze-40)', color: 'var(--charcoal)' }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
