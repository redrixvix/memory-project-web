'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

import { BOOK_PLAN_OPTIONS, type BookPlan, getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';

interface Book {
  id: number;
  title: string;
  plan: string;
  role: string;
}

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedBookId = searchParams.get('book')?.trim() ?? '';

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(requestedBookId);
  const [selectedPlan, setSelectedPlan] = useState<BookPlan>('premium');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSelectedBook = (nextBookId: string, availableBooks: Book[]) => {
    setSelectedBookId(nextBookId);
    const nextBook = availableBooks.find((book) => String(book.id) === nextBookId);
    if (nextBook) {
      setSelectedPlan(normalizeBookPlan(nextBook.plan));
    }
  };

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
        const nextSelectedBookId =
          requestedBookId && ownerBooks.some((book: Book) => String(book.id) === requestedBookId)
            ? requestedBookId
            : selectedBookId && ownerBooks.some((book: Book) => String(book.id) === selectedBookId)
              ? selectedBookId
              : ownerBooks[0]
                ? String(ownerBooks[0].id)
                : '';
        updateSelectedBook(nextSelectedBookId, ownerBooks);

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

  const handleSubmit = async () => {
    if (!selectedBook) {
      setError('Please select a book to upgrade.');
      return;
    }

    if (selectedBook.plan === selectedPlan) {
      setError(`"${selectedBook.title}" is already on the ${getBookPlanLabel(selectedPlan)} plan.`);
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
              onChange={(e) => updateSelectedBook(e.target.value, books)}
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{ border: '1px solid rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} ({getBookPlanLabel(b.plan)})
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {BOOK_PLAN_OPTIONS.map(plan => {
            const isCurrentPlan = selectedBook && normalizeBookPlan(selectedBook.plan) === plan.id;
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.id === 'premium' && !isCurrentPlan;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                disabled={!!isCurrentPlan}
                className="text-left rounded-2xl p-7 transition-all duration-200 relative"
                style={{
                  backgroundColor: isSelected ? '#FDFCF5' : isCurrentPlan ? 'rgba(204,213,174,0.12)' : 'var(--papaya)',
                  border: isSelected ? '2px solid var(--bronze)' : isCurrentPlan ? '2px dashed rgba(212,163,115,0.35)' : '1px solid rgba(212,163,115,0.2)',
                  boxShadow: isSelected ? '0 12px 40px rgba(212,163,115,0.2)' : isCurrentPlan ? 'none' : '0 4px 16px rgba(212,163,115,0.08)',
                  cursor: isCurrentPlan ? 'default' : 'pointer',
                  opacity: isCurrentPlan ? 0.75 : 1,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                  >
                    Most Popular
                  </div>
                )}
                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div
                    className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(212,163,115,0.18)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                  >
                    <Check size={10} strokeWidth={3} />
                    Current
                  </div>
                )}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0">
                    <p className="label-caps mb-1.5" style={{ color: isCurrentPlan ? '#6A6A5A' : 'var(--bronze)' }}>{plan.label}</p>
                    <p className="text-3xl font-medium" style={{ color: isCurrentPlan ? '#6A6A5A' : 'var(--charcoal)' }}>{plan.price}</p>
                    <p className="text-xs mt-1" style={{ color: '#6A6A5A' }}>{plan.description}</p>
                  </div>
                  {/* Selection indicator */}
                  {isSelected && !isCurrentPlan && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-3 mt-1"
                      style={{ backgroundColor: 'var(--charcoal)' }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--cornsilk)' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-3 mt-1"
                      style={{ backgroundColor: 'rgba(204,213,174,0.3)', border: '1px solid rgba(212,163,115,0.25)' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#6A6A5A' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ height: 1, background: 'rgba(212,163,115,0.15)', marginBottom: 20 }} />
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: isCurrentPlan ? '#6A6A5A' : 'var(--charcoal)' }}>
                      <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: isCurrentPlan ? '#B0B09A' : 'var(--bronze)' }}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                  {plan.notFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#9A9A8A' }}>
                      <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#C8C8B8' }}>
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                {/* CTA button per card — high contrast, always visible */}
                {!isCurrentPlan ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className="w-full h-12 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                    style={{
                      backgroundColor: isSelected ? 'var(--charcoal)' : 'var(--bronze)',
                      color: isSelected ? 'var(--cornsilk)' : 'var(--charcoal)',
                      boxShadow: isSelected ? '0 4px 16px rgba(43,43,43,0.25)' : '0 4px 16px rgba(212,163,115,0.2)',
                    }}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Selected
                      </span>
                    ) : `Select ${plan.label}`}
                  </button>
                ) : (
                  <div
                    className="w-full h-12 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'rgba(204,213,174,0.15)', color: '#6A6A5A', border: '1px solid rgba(212,163,115,0.2)' }}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Current Plan
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-center mb-6" style={{ color: '#C0392B' }}>{error}</p>
        )}

        {/* Confirm — shown only when user has selected a non-current plan */}
        {selectedBook && normalizeBookPlan(selectedBook.plan) !== selectedPlan && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full h-12 px-10 text-sm font-semibold transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', boxShadow: '0 4px 20px rgba(212,163,115,0.25)' }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                  Saving...
                </span>
              ) : `Upgrade to ${getBookPlanLabel(selectedPlan)}`}
            </button>
          </div>
        )}

        {/* Book selector */}
        {books.length > 0 && (
          <div className="mt-6 text-center">
            {books.length > 1 ? (
              <div className="flex items-center justify-center gap-3">
                <label className="text-sm" style={{ color: '#6A6A5A' }}>Upgrading:</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => updateSelectedBook(e.target.value, books)}
                  className="rounded-xl px-4 py-2 text-sm"
                  style={{ border: '1px solid rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#6A6A5A' }}>
                Upgrading: <span className="font-medium" style={{ color: 'var(--charcoal)' }}>{books[0].title}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm transition-colors hover:opacity-70"
            style={{ color: '#6A6A5A' }}
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
