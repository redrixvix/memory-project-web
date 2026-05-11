'use client';
export default function Loading() {
  return (
    <div role="status" aria-label="Loading book preview…" className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      {/* Top bar skeleton */}
      <header
        className="sticky top-0 z-10 h-16 flex items-center px-6 border-b"
        style={{ background: 'rgba(254,250,224,0.94)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.15)' }}
      >
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-4 w-12 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
            <div className="h-4 w-36 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
          </div>
          <div className="h-11 w-32 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
        </div>
      </header>

      {/* Book preview skeleton */}
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              boxShadow: '0 24px 64px rgba(212,163,115,0.18), 0 8px 24px rgba(212,163,115,0.1)',
              border: '1px solid rgba(212,163,115,0.22)',
            }}
          >
            <div className="flex">
              {/* Book spine */}
              <div className="w-5 shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.5)' }} />

              <div className="flex-1">
                {/* Cover page skeleton */}
                <div
                  className="px-12 py-20 text-center"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(254,250,224,0.6), rgba(254,250,224,0.15), #FDFCF5)',
                    borderBottom: '3px solid rgba(212,163,115,0.3)',
                  }}
                >
                  {/* Decorative emblem */}
                  <div className="flex justify-center mb-8">
                    <div className="w-[72px] h-[36px] rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                  </div>

                  {/* Ornament line */}
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px flex-1" style={{ background: 'rgba(212,163,115,0.15)' }} />
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.25)' }} />
                    <div className="h-px flex-1" style={{ background: 'rgba(212,163,115,0.15)' }} />
                  </div>

                  {/* Title skeleton */}
                  <div className="h-10 w-72 rounded-xl mx-auto mb-4 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                  <div className="h-4 w-24 rounded-lg mx-auto mb-8 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />

                  {/* Owner line */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px flex-1 max-w-[80px]" style={{ background: 'rgba(212,163,115,0.15)' }} />
                    <div className="h-4 w-24 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                    <div className="h-px flex-1 max-w-[80px]" style={{ background: 'rgba(212,163,115,0.15)' }} />
                  </div>

                  {/* Memory count */}
                  <div className="h-3 w-20 rounded-md mx-auto skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                </div>

                {/* Table of contents skeleton */}
                <div className="px-12 py-12" style={{ borderBottom: '1px solid rgba(212,163,115,0.15)' }}>
                  <div className="h-3 w-16 rounded-md mb-8 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-baseline gap-4">
                        <div className="h-3 w-4 rounded-sm" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                        <div className="flex-1 h-3.5 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memory page skeletons */}
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="px-12 py-12"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(212,163,115,0.15)' : 'none' }}
                  >
                    {/* Page header */}
                    <div className="mb-8">
                      <div className="h-3 w-48 rounded-md mb-4 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1" style={{ background: 'rgba(212,163,115,0.15)' }} />
                        <div className="h-3 w-12 rounded-sm" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                        <div className="h-px flex-1" style={{ background: 'rgba(212,163,115,0.15)' }} />
                      </div>
                    </div>

                    {/* Memory text lines */}
                    <div className="space-y-2.5 mb-8">
                      <div className="h-4 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                      <div className="h-4 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                      <div className="h-4 w-3/4 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    </div>

                    {/* Photo skeletons (alternate) */}
                    {i % 2 === 0 && (
                      <div className="flex gap-3 mt-8">
                        <div className="w-40 h-40 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                        <div className="w-40 h-40 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer text skeleton */}
          <div className="h-3 w-64 rounded-md mx-auto mt-8 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.05)' }} />
        </div>
      </main>
    </div>
  );
}