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
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="skeleton-pulse w-5 h-5 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.35)' }} />
            <div className="skeleton-pulse h-4 w-32 rounded-lg" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
          </div>
          {/* CTA button */}
          <div className="skeleton-pulse h-11 w-28 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.3)' }} />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="skeleton-pulse h-3 w-16 rounded-lg mx-auto mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
          <div className="skeleton-pulse h-9 w-64 rounded-xl mx-auto mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
          <div className="skeleton-pulse h-4 w-48 rounded-lg mx-auto mb-2" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
          <div className="skeleton-pulse h-3 w-36 rounded-md mx-auto" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
        </div>

        {/* Pricing cards skeleton — 3 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-7 flex flex-col"
              style={{
                backgroundColor: i === 1 ? 'rgba(255,239,213,0.6)' : 'var(--card)',
                border: i === 1
                  ? '2px solid rgba(212,163,115,0.5)'
                  : '1.5px solid rgba(212,163,115,0.18)',
              }}
            >
              {/* Label + price */}
              <div className="skeleton-pulse h-3 w-12 rounded-lg mb-3" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
              <div className="skeleton-pulse h-9 w-20 rounded-xl mb-1" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
              <div className="skeleton-pulse h-3 w-full rounded-md mb-8" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: 'rgba(212,163,115,0.15)', marginBottom: 32 }} />

              {/* Feature list items */}
              <div className="space-y-3 mb-10 flex-1">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-start gap-2.5">
                    <div className="skeleton-pulse w-4 h-4 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.25)' }} />
                    <div className="skeleton-pulse h-3 flex-1 rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="skeleton-pulse h-12 w-full rounded-full mt-auto" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
