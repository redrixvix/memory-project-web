'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBookClient() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard where the create-book modal lives
    router.replace('/dashboard');
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--cornsilk)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{
            border: '2px solid rgba(212,163,115,0.3)',
            borderTopColor: 'var(--bronze)',
          }}
        />
        <p className="text-sm" style={{ color: '#6A6A5A' }}>
          Opening the book creator…
        </p>
      </div>
    </div>
  );
}
