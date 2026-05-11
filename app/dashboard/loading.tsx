'use client';

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-10">
          <div
            className="h-9 w-56 rounded-xl mb-2 skeleton-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.22)' }}
          />
          <div
            className="h-4 w-40 rounded-lg skeleton-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.14)' }}
          />
        </div>

        {/* Book card skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-2xl p-6 flex items-center gap-5 skeleton-pulse"
              style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.12)' }}
            >
              {/* Book spine placeholder */}
              <div
                className="w-12 h-18 rounded-xl shrink-0"
                style={{ backgroundColor: 'rgba(212,163,115,0.20)' }}
              />
              <div className="flex-1 space-y-2.5">
                <div
                  className="h-5 w-40 rounded-md"
                  style={{ backgroundColor: 'rgba(212,163,115,0.18)' }}
                />
                <div
                  className="h-3.5 w-64 rounded-md"
                  style={{ backgroundColor: 'rgba(212,163,115,0.10)' }}
                />
                <div
                  className="h-3 w-24 rounded-md"
                  style={{ backgroundColor: 'rgba(212,163,115,0.10)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
