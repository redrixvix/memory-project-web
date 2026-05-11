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

export default function UpgradeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedBookId = searchParams.get('book')?.trim() ?? '';

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(requestedBookId);
  const [selectedPlan, setSelectedPlan] = useState<BookPlan>('premium');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [focusedPlanId, setFocusedPlanId] = useState<string | null>(null);

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
  }, [requestedBookId, selectedBookId, router]);

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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
        {/* Top nav skeleton */}
        <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
          <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
              <div className="h-4 w-28 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
            </div>
            <div className="h-4 w-24 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
          </div>
        </header>

        <main className="px-6 md:px-10 py-8 max-w-4xl mx-auto w-full">
          {/* Page header skeleton */}
          <div className="text-center mb-5 sm:mb-7 space-y-2">
            <div className="h-3 w-16 rounded-lg skeleton-pulse mx-auto" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
            <div className="h-7 w-56 rounded-xl skeleton-pulse mx-auto" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
            <div className="h-4 w-72 rounded-lg skeleton-pulse mx-auto hidden sm:block" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
          </div>

          {/* Book product image skeleton — mobile only */}
          <div
            className="md:hidden rounded-2xl overflow-hidden mb-5"
            style={{ height: '80px', backgroundColor: 'rgba(212,163,115,0.12)' }}
          >
            <div className="w-full h-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
          </div>

          {/* Plan cards skeleton — 3 column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ backgroundColor: '#FDF8EE', border: '1.5px solid rgba(212,163,115,0.25)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1.5">
                    <div className="h-3 w-12 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                    <div className="h-6 w-16 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
                    <div className="h-5 w-20 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
                  </div>
                  <div className="w-6 h-6 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                </div>
                <div style={{ height: 1, background: 'rgba(212,163,115,0.12)', marginBottom: 12 }} />
                <div className="space-y-2 mb-5">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                      <div className="h-3 w-full rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                    </div>
                  ))}
                </div>
                <div className="h-10 w-full rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      <style>{`
        .skip-link {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          padding: 0.75rem 1.25rem;
          background: var(--bronze);
          color: var(--charcoal);
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 0 0 0.5rem;
          transform: translateY(-100%);
          transition: transform 0.15s;
          text-decoration: none;
        }
        .skip-link:focus {
          transform: translateY(0);
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <a href="#main" className="skip-link">Skip to main content</a>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </Link>
          <Link href="/dashboard" className="nav-link text-sm" style={{ color: '#4A4A3A' }}>
            Back to dashboard
          </Link>
        </div>
      </header>

      <main id="main" className="px-6 md:px-10 py-8 max-w-4xl mx-auto w-full">

        {/* Page header — compact */}
        <div className="text-center mb-5 sm:mb-7">
          <p className="label-caps mb-1.5" style={{ color: 'var(--bronze)' }}>Upgrade</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-medium mb-1.5" style={{ color: 'var(--charcoal)' }}>
            Give your story a home that lasts a lifetime
          </h1>
          <p className="text-xs sm:text-sm max-w-md mx-auto hidden sm:block" style={{ color: '#4A4A3A' }}>
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
                className="rounded-xl px-3 py-1.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all"
                style={{ border: '1px solid rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
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
            alt="Memory Project printed hardcover book — beautifully designed with archival paper"
            width={480}
            height={220}
            className="block w-full object-cover"
            loading="lazy"
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
          role="radiogroup"
          aria-label="Pricing plans: Free, Plus at $50, or Premium at $100. Lifetime access included."
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          {BOOK_PLAN_OPTIONS.map((plan, planIndex) => {
            const isCurrentPlan = selectedBook && normalizeBookPlan(selectedBook.plan) === plan.id;
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.id === 'premium' && !isCurrentPlan;
            const isPlus = plan.id === 'plus';
            const cardStyles = {
              backgroundColor: isSelected ? '#FDFCF5' : isCurrentPlan ? '#F0E8D8' : '#FDF8EE',
              border: isSelected ? '2px solid #C49438' : isCurrentPlan ? '1.5px dashed rgba(180,150,100,0.55)' : isPlus ? '1.5px solid rgba(196,168,120,0.38)' : '1.5px solid rgba(212,163,115,0.25)',
              boxShadow: isSelected
                ? '0 12px 40px rgba(212,163,115,0.30), 0 0 0 4px rgba(212,163,115,0.12)'
                : isCurrentPlan
                  ? '0 4px 16px rgba(212,163,115,0.08)'
                  : '0 4px 20px rgba(212,163,115,0.09)',
              cursor: isCurrentPlan ? 'default' : 'pointer',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            };
            const handleCardClick = () => { if (!isCurrentPlan) setSelectedPlan(plan.id); };
            const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (isCurrentPlan) return;
              let nextIndex = planIndex;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (planIndex + 1) % BOOK_PLAN_OPTIONS.length;
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (planIndex - 1 + BOOK_PLAN_OPTIONS.length) % BOOK_PLAN_OPTIONS.length;
              } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick();
                return;
              }
              if (nextIndex !== planIndex) {
                const nextPlan = BOOK_PLAN_OPTIONS[nextIndex];
                if (!selectedBook || normalizeBookPlan(selectedBook.plan) !== nextPlan.id) {
                  setSelectedPlan(nextPlan.id);
                }
              }
            };
            const isHoverable = !isCurrentPlan && !isSelected;
            const isHovered = isHoverable && (hoveredPlanId === plan.id || focusedPlanId === plan.id);
            const hoverStyles = isHovered ? {
              boxShadow: '0 8px 32px rgba(212,163,115,0.22)',
              transform: 'scale(1.01)',
            } : {};
            return (
              <div
                key={plan.id}
                role="radio"
                tabIndex={isCurrentPlan ? -1 : isSelected ? 0 : -1}
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                className={`text-left rounded-2xl p-5 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${!isCurrentPlan ? 'cursor-pointer' : ''} plan-card`}
                style={{ ...cardStyles, ...hoverStyles, ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: '#FDF8EE' }}
                onMouseEnter={() => setHoveredPlanId(plan.id)}
                onMouseLeave={() => setHoveredPlanId(null)}
                onFocus={() => setFocusedPlanId(plan.id)}
                onBlur={() => setFocusedPlanId(null)}
                aria-checked={isSelected}
                aria-disabled={isCurrentPlan ? true : undefined}
                aria-label={plan.label + ' plan — ' + plan.price + (isCurrentPlan ? ', current plan' : isSelected ? ', selected' : '')}
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
                    <p className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: isCurrentPlan ? '#9A8A6A' : 'var(--bronze)', fontFamily: 'var(--font-sans)' }}>{plan.label}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-xl font-medium" style={{ color: isCurrentPlan ? '#6A5A3A' : 'var(--charcoal)' }}>{plan.price}</p>
                    </div>
                    {plan.id !== 'free' && (
                      <div
                        className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap inline-block"
                        style={{
                          backgroundColor: isCurrentPlan ? 'rgba(212,163,115,0.10)' : 'rgba(212,163,115,0.15)',
                          color: isCurrentPlan ? '#6A5A3A' : '#5A3A1A',
                          fontFamily: 'var(--font-sans)',
                          border: `1px solid ${isCurrentPlan ? 'rgba(212,163,115,0.22)' : 'rgba(212,163,115,0.30)'}`,
                          letterSpacing: '0.04em',
                        }}
                      >
                        Pay once, own forever
                      </div>
                    )}
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: isCurrentPlan ? 'var(--charcoal)' : '#4A4A3A' }}>{plan.description}</p>
                  </div>
                  {/* Selection indicator */}
                  {(isSelected || isCurrentPlan) && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: isSelected ? 'var(--charcoal)' : 'rgba(204,213,174,0.3)', border: isCurrentPlan ? '1px solid rgba(212,163,115,0.25)' : 'none' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: isSelected ? 'var(--cornsilk)' : 'var(--charcoal)' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: 'rgba(212,163,115,0.12)', marginBottom: 12 }} />

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: isCurrentPlan ? '#6A5A3A' : 'var(--charcoal)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5" style={{ color: isCurrentPlan ? '#9A8A6A' : 'var(--bronze)' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleCardClick}
                  disabled={isCurrentPlan ?? false}
                  aria-label={plan.label + ' plan — ' + (isCurrentPlan ? 'Current plan' : isSelected ? 'Selected' : 'Choose plan')}
                  className="w-full h-10 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.97]"
                  style={{
                    backgroundColor: isSelected
                      ? '#4A3520'
                      : isCurrentPlan
                        ? 'rgba(212,163,115,0.04)'
                        : '#6B4A28',
                    color: isSelected
                      ? 'var(--cornsilk)'
                      : isCurrentPlan
                        ? '#7A6A4A'
                        : 'var(--cornsilk)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: !isCurrentPlan ? '0 4px 16px rgba(212,163,115,0.28)' : 'none',
                    border: isCurrentPlan ? '1.5px solid rgba(212,163,115,0.28)' : 'none',
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
            <p className="text-xs mt-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              Plans are per-book. Each book can be on its own plan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}