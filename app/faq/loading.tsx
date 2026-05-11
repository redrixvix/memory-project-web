'use client';

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
    >
      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b"
        style={{
          background: 'rgba(254,250,224,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(212,163,115,0.18)',
        }}
      >
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="skeleton-pulse w-5 h-5 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.35)' }} />
            <div className="skeleton-pulse h-4 w-32 rounded-lg" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
          </div>
        </div>
      </header>

      {/* ── FAQ CONTENT ── */}
      <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto w-full">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="skeleton-pulse h-3 w-24 rounded-lg mx-auto mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
          <div className="skeleton-pulse h-9 w-72 rounded-xl mx-auto" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
        </div>

        {/* FAQ accordion items */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{
                backgroundColor: 'rgba(212,163,115,0.06)',
                border: '1px solid rgba(212,163,115,0.14)',
              }}
            >
              {/* Question row */}
              <div className="flex items-center justify-between">
                <div className="skeleton-pulse h-4 flex-1 rounded-lg" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                <div className="skeleton-pulse w-5 h-5 rounded-full ml-4 shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA skeleton */}
        <div
          className="mt-16 text-center rounded-2xl p-10"
          style={{
            backgroundColor: 'rgba(212,163,115,0.07)',
            border: '1px solid rgba(212,163,115,0.14)',
          }}
        >
          <div className="skeleton-pulse h-5 w-64 rounded-xl mx-auto mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
          <div className="skeleton-pulse h-3 w-96 rounded-lg mx-auto mb-6" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
          <div className="skeleton-pulse h-11 w-40 rounded-full mx-auto" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
        </div>
      </main>
    </div>
  );
}
