'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Book {
  id: number;
  title: string;
  plan: string;
  role: string;
}

type PlanId = 'free' | 'pro';

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    description: 'Unlimited text memories, forever free',
    features: ['Unlimited text memories', 'Guided writing prompts', 'One memory book'],
    notFeatures: ['Photos & audio', 'Printed books'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$50',
    description: 'for 5 years — includes 5GB photo & audio storage',
    features: ['Everything in Free', '5GB photo & audio storage', 'Printed books from $99', 'Family collaboration'],
    notFeatures: [],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedBookId = searchParams.get('book')?.trim() ?? '';

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(requestedBookId);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        const response = await fetch('/api/books');
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load books');
        }

        const data = await response.json();
        const nextBooks = Array.isArray(data?.books) ? data.books : [];
        const ownerBooks = nextBooks.filter((book: Book) => book.role === 'owner');

        if (cancelled) {
          return;
        }

        setBooks(ownerBooks);
        setSelectedBookId((current) => {
          if (requestedBookId && ownerBooks.some((book: Book) => String(book.id) === requestedBookId)) {
            return requestedBookId;
          }

          if (current && ownerBooks.some((book: Book) => String(book.id) === current)) {
            return current;
          }

          return ownerBooks[0] ? String(ownerBooks[0].id) : '';
        });

        if (requestedBookId && !ownerBooks.some((book: Book) => String(book.id) === requestedBookId)) {
          setError('That book is unavailable or you do not own it.');
        } else if (ownerBooks.length === 0) {
          setError('You need to create a book before you can manage a plan.');
        } else {
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load your books. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBooks();

    return () => {
      cancelled = true;
    };
  }, [requestedBookId, router]);

  const selectedBook = books.find((book) => String(book.id) === selectedBookId) ?? null;

  useEffect(() => {
    if (selectedBook) {
      setSelectedPlan(selectedBook.plan === 'pro' ? 'pro' : 'free');
    }
  }, [selectedBook]);

  const handleSubmit = async () => {
    if (!selectedBook) {
      setError('Please select a book to upgrade.');
      return;
    }

    if (selectedBook.plan === selectedPlan) {
      setError(`"${selectedBook.title}" is already on the ${selectedPlan === 'pro' ? 'Pro' : 'Free'} plan.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/books/${selectedBookId}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!res.ok) {
        let message = 'Failed to update plan.';
        try {
          const data = await res.json();
          if (data?.error) {
            message = data.error;
          }
        } catch {}
        setError(message);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </Link>
          <Link href="/dashboard" className="text-sm transition-colors hover:opacity-70" style={{ color: '#6A6A5A' }}>
            Cancel
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Upgrade</p>
          <h1 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>
            Choose a plan for your book
          </h1>
          <p className="text-base" style={{ color: '#6A6A5A' }}>
            Plans are set per-book. Each book can be on its own plan.
          </p>
        </div>

        {books.length === 0 && (
          <div className="rounded-2xl p-8 text-center mb-8" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)' }}>
            <p className="text-base mb-4" style={{ color: 'var(--charcoal)' }}>
              You do not have any books you can manage yet.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Book selector */}
        {books.length > 1 && (
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--charcoal)' }}>
              Which book?
            </label>
            <select
              value={selectedBookId}
              onChange={e => setSelectedBookId(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{ border: '1px solid rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} {b.plan === 'pro' ? '(Pro)' : '(Free)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {books.length === 1 && !requestedBookId && (
          <div className="mb-8">
            <p className="text-sm mb-2" style={{ color: '#6A6A5A' }}>
              Upgrading:
            </p>
            <p className="text-base font-medium" style={{ color: 'var(--charcoal)' }}>
              {books[0].title}
            </p>
          </div>
        )}

        {/* Plan radio cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className="text-left rounded-2xl p-7 transition-all duration-200"
              style={{
                backgroundColor: selectedPlan === plan.id ? '#FDFCF5' : 'var(--papaya)',
                border: selectedPlan === plan.id ? '2px solid var(--bronze)' : '1px solid rgba(212,163,115,0.2)',
                boxShadow: selectedPlan === plan.id ? '0 8px 32px rgba(212,163,115,0.16)' : '0 2px 8px rgba(212,163,115,0.06)',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="label-caps mb-1" style={{ color: 'var(--bronze)' }}>{plan.label}</p>
                  <p className="text-3xl font-medium" style={{ color: 'var(--charcoal)' }}>{plan.price}</p>
                  {plan.id === 'pro' && <p className="text-xs mt-1" style={{ color: '#6A6A5A' }}>{plan.description}</p>}
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{
                    backgroundColor: selectedPlan === plan.id ? 'var(--bronze)' : 'rgba(212,163,115,0.2)',
                    border: selectedPlan === plan.id ? 'none' : '1px solid rgba(212,163,115,0.3)',
                  }}
                >
                  {selectedPlan === plan.id && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--charcoal)' }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </div>
              </div>
              <div style={{ height: 1, background: 'rgba(212,163,115,0.15)', marginBottom: 24 }} />
              <ul className="space-y-2.5">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--charcoal)' }}>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feat}
                  </li>
                ))}
                {plan.notFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#6A6A5A' }}>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#B0B09A' }}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-center mb-6" style={{ color: '#C0392B' }}>{error}</p>
        )}

        {/* Confirm */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedBook || selectedBook.plan === selectedPlan}
            className="rounded-full h-12 px-10 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                Saving...
              </span>
            ) : selectedBook && selectedBook.plan === selectedPlan ? (
              `${selectedPlan === 'pro' ? 'Pro' : 'Free'} Plan Active`
            ) : `Confirm ${selectedPlan === 'pro' ? 'Pro' : 'Free'} Plan`}
          </button>
          <Link
            href="/dashboard"
            className="text-sm transition-colors hover:opacity-70"
            style={{ color: '#6A6A5A' }}
          >
            Cancel
          </Link>
        </div>
      </main>
    </div>
  );
}
