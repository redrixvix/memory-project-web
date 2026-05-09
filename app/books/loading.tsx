'use client';
export default function Loading() {
  return (
    <div role="status" aria-label="Loading books…" className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div aria-label="Loading books page" className="h-7 w-32 rounded-lg mb-8 animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl p-6 h-40 animate-pulse" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.85; } } .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }`}</style>
    </div>
  );
}
