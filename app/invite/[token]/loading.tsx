'use client';
export default function Loading() {
  return (
    <div role="status" aria-label="Loading invite…" className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-8"
          style={{ backgroundColor: 'rgba(204,213,174,0.25)' }}
          aria-hidden="true"
        />
        <div
          className="h-4 w-36 rounded skeleton-pulse mb-3"
          style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
        />
        <div
          className="h-7 w-56 rounded-xl skeleton-pulse mb-4"
          style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
        />
        <div
          className="h-4 w-72 rounded skeleton-pulse mb-6"
          style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
        />
        <div
          className="h-12 w-full max-w-sm rounded-full skeleton-pulse"
          style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
        />
      </div>
    </div>
  );
}