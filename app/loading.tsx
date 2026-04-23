'use client';

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--cornsilk)' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing logo */}
        <div className="loading-logo">
          <svg
            width="40"
            height="40"
            viewBox="0 0 22 22"
            fill="none"
            style={{ color: 'var(--bronze)' }}
          >
            <path
              d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z"
              fill="currentColor"
              fillOpacity="0.5"
            />
            <path
              d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Skeleton book cards */}
        <div className="space-y-4 w-64">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-card"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1); }
        }
        .loading-logo {
          animation: logo-pulse 2s ease-in-out infinite;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
        .skeleton-card {
          height: 7rem;
          border-radius: 1rem;
          background-color: rgba(212,163,115,0.08);
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}