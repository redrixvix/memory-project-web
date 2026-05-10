'use client';

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      {/* Header skeleton */}
      <div
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0"
        style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}
      >
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          <div className="h-4 w-28 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="px-6 md:px-10 py-12 max-w-2xl mx-auto w-full">
        {/* Section header */}
        <div className="mb-8">
          <div className="h-3 w-20 rounded-md mb-3 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
          <div className="h-9 w-40 rounded-xl mb-3 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
          <div className="h-4 w-64 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
        </div>

        {/* Form card skeleton */}
        <div
          className="rounded-[2rem] border overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(253,252,245,0.97) 0%, rgba(250,237,205,0.72) 100%)',
            borderColor: 'rgba(212,163,115,0.22)',
            boxShadow: '0 24px 72px rgba(212,163,115,0.12)',
          }}
        >
          <div className="h-1 w-full" style={{ backgroundColor: 'var(--bronze)' }} />

          <div className="p-8 space-y-6">
            {/* Title field */}
            <div className="space-y-2">
              <div className="h-4 w-12 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
              <div
                className="w-full rounded-[1.25rem] border px-5 py-4"
                style={{
                  borderColor: 'rgba(212,163,115,0.3)',
                  backgroundColor: 'rgba(255,253,246,0.8)',
                  height: '60px',
                }}
              />
              <div className="h-3 w-16 rounded-md ml-auto skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
                <div className="h-3 w-16 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
              </div>
              <div
                className="w-full rounded-[1.25rem] border px-5 py-4"
                style={{
                  borderColor: 'rgba(212,163,115,0.3)',
                  backgroundColor: 'rgba(255,253,246,0.8)',
                  height: '120px',
                }}
              />
            </div>

            {/* URL preview */}
            <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(212,163,115,0.06)', border: '1px solid rgba(212,163,115,0.1)' }}>
              <div className="w-4 h-4 rounded skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
              <div className="h-3 w-48 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
            </div>
          </div>
        </div>

        {/* Action row skeleton */}
        <div className="flex items-center justify-between mt-6">
          <div className="h-4 w-16 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.06)' }} />
          <div className="h-12 w-32 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
        </div>
      </main>
    </div>
  );
}
