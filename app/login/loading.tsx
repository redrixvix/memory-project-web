'use client';
export default function Loading() {
  return (
    <div role="status" aria-label="Loading login…" className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)' }}>
      <div className="max-w-md mx-auto px-6 py-12">
        <div aria-label="Loading login page" className="h-7 w-24 rounded-lg mb-8 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
        <div className="rounded-2xl p-6 skeleton-pulse" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}>
          <div className="space-y-4">
            <div className="h-4 w-24 rounded skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
            <div className="h-10 w-full rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
            <div className="h-4 w-20 rounded skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
            <div className="h-10 w-full rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
            <div className="h-11 w-full rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
