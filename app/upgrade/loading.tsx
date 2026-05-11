'use client';

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-10 text-center">
          <div
            className="h-9 w-72 rounded-xl mx-auto mb-3 skeleton-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.22)' }}
          />
          <div
            className="h-4 w-96 rounded-lg mx-auto skeleton-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.14)' }}
          />
        </div>

        {/* Plan cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-2xl p-6 skeleton-pulse"
              style={{
                backgroundColor: i === 2 ? 'var(--bronze)' : '#FDFCF5',
                border: `1px solid rgba(212,163,115,${i === 2 ? '0.3' : '0.12'})`,
                opacity: i === 2 ? 1 : 0.85,
              }}
            >
              <div
                className="h-4 w-20 rounded-md mb-4 skeleton-pulse"
                style={{ backgroundColor: `rgba(212,163,115,${i === 2 ? '0.3' : '0.2'})` }}
              />
              <div
                className="h-8 w-24 rounded-md mb-6 skeleton-pulse"
                style={{ backgroundColor: `rgba(212,163,115,${i === 2 ? '0.25' : '0.15'})` }}
              />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(j => (
                  <div
                    key={j}
                    className="h-3 rounded-md skeleton-pulse"
                    style={{ backgroundColor: `rgba(212,163,115,${i === 2 ? '0.25' : '0.12'})` }}
                  />
                ))}
              </div>
              <div
                className="h-11 rounded-full mt-6 skeleton-pulse"
                style={{ backgroundColor: `rgba(212,163,115,${i === 2 ? '0.3' : '0.15'})` }}
              />
            </div>
          ))}
        </div>

        {/* FAQ skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="rounded-xl p-5 skeleton-pulse"
              style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.12)' }}
            >
              <div
                className="h-4 w-64 rounded-md mb-2"
                style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}
              />
              <div
                className="h-3 w-full rounded-md"
                style={{ backgroundColor: 'rgba(212,163,115,0.10)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
