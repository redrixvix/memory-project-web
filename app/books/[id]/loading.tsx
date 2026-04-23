import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--cornsilk)' }}
    >
      <div className="w-full max-w-3xl px-6">
        {/* Skeleton greeting */}
        <div className="mb-10">
          <div
            className="h-9 w-64 rounded-xl mb-2 animate-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
          />
          <div
            className="h-4 w-40 rounded-lg animate-pulse"
            style={{ backgroundColor: 'rgba(212,163,115,0.07)' }}
          />
        </div>
        {/* Skeleton book cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex items-center gap-6 animate-pulse"
              style={{
                backgroundColor: '#FDFCF5',
                border: '1px solid rgba(212,163,115,0.08)',
              }}
            >
              <div
                className="w-14 h-20 rounded-xl shrink-0"
                style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
              />
              <div className="flex-1 space-y-3">
                <div
                  className="h-5 w-48 rounded-lg"
                  style={{ backgroundColor: 'rgba(212,163,115,0.1)' }}
                />
                <div
                  className="h-3 w-32 rounded-md"
                  style={{ backgroundColor: 'rgba(212,163,115,0.07)' }}
                />
                <div
                  className="h-3 w-24 rounded-md"
                  style={{ backgroundColor: 'rgba(212,163,115,0.06)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
