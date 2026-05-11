'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
    >
      <div className="text-center max-w-sm mx-auto space-y-6">
        {/* Warm illustration */}
        <div className="flex justify-center mb-2">
          <div
            className="relative w-24 h-24 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--tea-green)',
              border: '1px solid rgba(212,163,115,0.2)',
              boxShadow: '0 8px 32px rgba(212,163,115,0.12)',
            }}
          >
            {/* Price tag icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                style={{ color: 'var(--bronze)' }}
              >
                <path
                  d="M30 8L40 18L30 28L20 18L30 8Z"
                  fill="currentColor"
                  fillOpacity="0.3"
                />
                <path
                  d="M20 22L30 32L20 42L10 32L20 22Z"
                  fill="currentColor"
                  fillOpacity="0.5"
                />
                <circle cx="30" cy="18" r="4" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <h1
            className="text-2xl font-medium mb-3"
            style={{ color: 'var(--charcoal)' }}
          >
            Something went wrong
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#6A6A5A' }}
          >
            {error?.message
              ? error.message
              : "We ran into an unexpected error loading this page. Let's try again."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="rounded-full h-11 px-7 text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            Try again
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'rgba(212,163,115,0.12)',
              color: 'var(--charcoal)',
            }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
