'use client';

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading settings…"
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-8">
          <div
            className="h-8 w-48 rounded-xl mb-3 skeleton-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
          />
          <div
            className="h-4 w-72 rounded-lg skeleton-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
          />
        </div>

        {/* Profile section skeleton */}
        <div
          className="rounded-2xl p-6 mb-6 skeleton-pulse"
          style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}
        >
          <div className="flex items-center gap-5 mb-6">
            <div
              className="w-20 h-20 rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}
            />
            <div className="flex-1 space-y-2.5">
              <div
                className="h-4 w-32 rounded-md"
                style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
              />
              <div
                className="h-3 w-48 rounded-md"
                style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
              />
            </div>
          </div>

          {/* Form field skeletons */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div
                className="h-3.5 w-24 rounded-md"
                style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
              />
              <div
                className="h-11 w-full rounded-xl"
                style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
              />
            </div>
            <div className="space-y-2">
              <div
                className="h-3.5 w-20 rounded-md"
                style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
              />
              <div
                className="h-11 w-full rounded-xl"
                style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
              />
            </div>
          </div>
        </div>

        {/* Danger zone skeleton */}
        <div
          className="rounded-2xl p-6 skeleton-pulse"
          style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}
        >
          <div
            className="h-4 w-32 rounded-md mb-4"
            style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
          />
          <div
            className="h-10 w-28 rounded-full"
            style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
          />
        </div>
      </div>
    </div>
  );
}
