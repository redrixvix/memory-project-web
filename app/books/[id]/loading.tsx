'use client';
export default function Loading() {
  return (
    <div role="status" aria-label="Loading book…" className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 rounded-xl mb-3 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
          <div className="h-4 w-48 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
        </div>
        {/* Memory card skeletons */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-5 skeleton-pulse" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3.5 w-3/4 rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                  <div className="h-4 w-full rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                  <div className="h-4 w-2/3 rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                  {i % 2 === 0 && (
                    <div className="flex gap-2 mt-3">
                      <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                      <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
          </div>
  );
}
