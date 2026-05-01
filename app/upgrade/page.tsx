'use client';

import Image from 'next/image';
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

      if (res.ok) {
        router.push(`/books/${selectedBookId}`);
      } else {
        let message = 'Failed to update plan.';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setError(message);
      }
    } catch {
      setError('Failed to update plan. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#4A4A3A' }}>Loading...</p>
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
          <Link href="/dashboard" className="text-sm transition-colors hover:opacity-70" style={{ color: '#4A4A3A' }}>
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-4xl mx-auto w-full">

        {/* Page header — compact */}
        <div className="text-center mb-5 sm:mb-7">
          <p className="label-caps mb-1.5" style={{ color: 'var(--bronze)' }}>Upgrade</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-medium mb-1.5" style={{ color: 'var(--charcoal)' }}>
            Give your story a home that lasts a lifetime
          </h1>
          <p className="text-xs sm:text-sm max-w-md mx-auto hidden sm:block" style={{ color: '#5A5A4A' }}>
            Preserve photos, voice recordings, and order a beautiful printed heirloom — all secured for generations.
          </p>
          {/* Mobile book context — single line */}
          {books.length === 1 && (
            <p className="text-xs mt-2 px-3 py-1 rounded-full inline-block" style={{ backgroundColor: 'rgba(212,163,115,0.10)', color: '#4A4A3A', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.15)' }}>
              Upgrading: {books[0].title}
            </p>
          )}
          {books.length > 1 && (
            <div className="mt-2 flex justify-center">
              <select
                aria-label="Select a book to upgrade"
                value={selectedBookId}
                onChange={(e) => updateSelectedBook(e.target.value, books)}
                className="rounded-xl px-3 py-1.5 text-xs"
                style={{ border: '1px solid rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)', outline: 'none' }}
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Product photo — desktop only, right column */}
        <div
          className="hidden md:block rounded-2xl overflow-hidden relative mb-5"
          style={{ boxShadow: '0 6px 24px rgba(212,163,115,0.16), 0 2px 6px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(to top, rgba(43,43,43,0.28) 0%, transparent 55%)', zIndex: 1 }} />
          <Image
            src="/images/book-product-3.jpg"
            alt="Memory Project printed hardcover book"
            width={480}
            height={220}
            className="block w-full object-cover"
            unoptimized
            style={{ maxHeight: '130px', width: '100%', objectFit: 'cover' }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5" style={{ zIndex: 2 }}>
            <p className="text-xs font-medium" style={{ color: '#FDFCF5', fontFamily: 'var(--font-sans)' }}>
              Beautifully printed hardcover books — from $99
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(212,163,115,0.10)', border: '1px solid rgba(212,163,115,0.25)', color: '#6B3A2A' }}>
            {error}
          </div>
        )}

        {/* Plan radio cards — tight, above fold */}
        <div
          role="group"
          aria-label="Pricing plans: Free, Plus at $50, or Premium at $100. Lifetime access included."
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          {BOOK_PLAN_OPTIONS.map(plan => {
            const isCurrentPlan = selectedBook && normalizeBookPlan(selectedBook.plan) === plan.id;
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.id === 'premium' && !isCurrentPlan;
            const isPlus = plan.id === 'plus';
            const cardStyles = {
              backgroundColor: isSelected ? '#FDFCF5' : isCurrentPlan ? 'rgba(212,163,115,0.05)' : isPlus ? '#FAF0E0' : 'var(--papaya)',
              border: isSelected ? '2px solid #7A5A30' : isCurrentPlan ? '1.5px dashed rgba(212,163,115,0.30)' : isPlus ? '1px solid rgba(196,168,120,0.35)' : '1px solid rgba(212,163,115,0.2)',
              boxShadow: isSelected
                ? '0 10px 36px rgba(212,163,115,0.26), 0 0 0 4px rgba(212,163,115,0.1)'
                : isCurrentPlan
                  ? '0 0 0 0 rgba(212,163,115,0)'
                  : '0 3px 12px rgba(212,163,115,0.07)',
              opacity: isCurrentPlan ? 0.72 : 1,
              transform: isSelected ? 'scale(1.015)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            };
            const handleCardClick = () => { if (!isCurrentPlan) setSelectedPlan(plan.id); };
            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={isCurrentPlan ? -1 : 0}
                onClick={handleCardClick}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isCurrentPlan) { e.preventDefault(); handleCardClick(); }}}
                className="text-left rounded-2xl p-5 relative cursor-pointer plan-card"
                style={cardStyles}
                aria-pressed={isSelected}
                aria-disabled={isCurrentPlan ? true : undefined}
              >
                {/* Plus gold accent */}
                {isPlus && !isCurrentPlan && (
                  <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-xl" style={{ background: 'linear-gradient(to right, rgba(196,168,120,0.6), rgba(212,163,115,0.9), rgba(196,168,120,0.6))' }} />
                )}
                {/* Popular badge */}
                {isPopular && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.18em] uppercase px-3.5 py-1 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)', letterSpacing: '0.15em' }}
                  >
                    Most Popular
                  </div>
                )}
                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: '#6A6A5A', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.18)' }}
                  >
                    <Check size={9} strokeWidth={3} />
                    Current
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: isCurrentPlan ? '#8A8A7A' : 'var(--bronze)', fontFamily: 'var(--font-sans)' }}>{plan.label}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-xl font-medium" style={{ color: isCurrentPlan ? '#8A8A7A' : 'var(--charcoal)' }}>{plan.price}</p>
                    </div>
                    {plan.id !== 'free' && (
                      <div
                        className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap inline-block"
                        style={{
                          backgroundColor: isCurrentPlan ? 'rgba(212,163,115,0.08)' : 'rgba(212,163,115,0.15)',
                          color: isCurrentPlan ? '#8A8A7A' : '#5A3A1A',
                          fontFamily: 'var(--font-sans)',
                          border: `1px solid ${isCurrentPlan ? 'rgba(212,163,115,0.15)' : 'rgba(212,163,115,0.30)'}`,
                          border: `1px solid ${isCurrentPlan ? 'rgba(212,163,115,0.15)' : 'rgba(74,100,55,0.20)'}`,
                          letterSpacing: '0.04em',
                        }}
                      >
                        Pay once, own forever
                      </div>
                    )}
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#5A5A4A' }}>{plan.description}</p>
                  </div>
                  {/* Selection indicator */}
                  {(isSelected || isCurrentPlan) && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: isSelected ? 'var(--charcoal)' : 'rgba(204,213,174,0.3)', border: isCurrentPlan ? '1px solid rgba(212,163,115,0.25)' : 'none' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: isSelected ? 'var(--cornsilk)' : '#6A6A5A' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: 'rgba(212,163,115,0.12)', marginBottom: 12 }} />

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: isCurrentPlan ? '#8A8A7A' : 'var(--charcoal)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5" style={{ color: isCurrentPlan ? '#8A8A7A' : 'var(--bronze)' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleCardClick}
                  disabled={isCurrentPlan}
                  className="w-full h-10 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.97]"
                  style={{
                    backgroundColor: isSelected
                      ? '#4A3520'
                      : isCurrentPlan
                        ? 'rgba(212,163,115,0.06)'
                        : '#6B4A28',
                    color: isSelected || !isCurrentPlan
                      ? 'var(--cornsilk)'
                      : '#8A8A7A',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: !isCurrentPlan ? '0 4px 16px rgba(212,163,115,0.28)' : 'none',
                    border: isCurrentPlan ? '1px dashed rgba(212,163,115,0.20)' : 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {isCurrentPlan ? 'Current plan' : isSelected ? 'Selected' : 'Choose plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Submit CTA */}
        {selectedBook && normalizeBookPlan(selectedBook.plan) !== selectedPlan && (
          <div className="text-center animate-fade-up">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-13 rounded-full px-10 text-sm font-semibold transition-all duration-300 active:scale-[0.97] hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bronze)',
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 6px 28px rgba(212,163,115,0.36), 0 2px 8px rgba(212,163,115,0.16)',
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-3 justify-center">
                  <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                  Updating plan...
                </span>
              ) : (
                `Upgrade to ${getBookPlanLabel(selectedPlan)}`
              )}
            </button>
            <p className="text-xs mt-3" style={{ color: '#8A8A7A', fontFamily: 'var(--font-sans)' }}>
              Plans are per-book. Each book can be on its own plan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
