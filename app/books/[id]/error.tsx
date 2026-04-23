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
              backgroundColor: 'var(--papaya)',
              border: '1px solid rgba(212,163,115,0.2)',
              boxShadow: '0 8px 32px rgba(212,163,115,0.12)',
            }}
          >
            {/* Book with broken spine */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                style={{ color: 'var(--bronze)' }}
              >
                <path
                  d="M24 8C24 8 14 14 14 24C14 30.6 18.4 36 24 36C29.6 36 34 30.6 34 24C34 14 24 8 24 8Z"
                  fill="currentColor"
                  fillOpacity="0.3"
                />
                <path
                  d="M24 18C24 18 18 22 18 27C18 30.3 20.7 33 24 33C27.3 33 30 30.3 30 27C30 22 24 18 24 18Z"
                  fill="currentColor"
                />
                {/* Crack line */}
                <path
                  d="M16 10 L20 14 L18 18 L22 20 L16 10Z"
                  fill="rgba(212,163,115,0.4)"
                  stroke="rgba(212,163,115,0.6)"
                  strokeWidth="0.5"
                />
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
            We ran into an unexpected error loading this page. Your memories are safe — let&apos;s try again.
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
