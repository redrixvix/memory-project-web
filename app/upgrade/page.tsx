'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

import { BOOK_PLAN_OPTIONS, type BookPlan, getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';
import { AppShellHeader } from '@/components/ui/app-shell-header';

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
  const PLAN_ORDER: Record<BookPlan, number> = { free: 0, premium: 1, plus: 2 };
  const isUpgrade = selectedBook && PLAN_ORDER[selectedPlan] > PLAN_ORDER[normalizeBookPlan(selectedBook.plan)];

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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#4A4A3A' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      <AppShellHeader
        current="Plans"
        links={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/settings', label: 'Settings' },
        ]}
      />

      <main className="px-6 md:px-10 py-8 max-w-4xl mx-auto w-full flex-1">

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
              <div className="relative">
                <select
                  aria-label="Select a book to upgrade"
                  value={selectedBookId}
                  onChange={(e) => updateSelectedBook(e.target.value, books)}
                  className="rounded-xl pl-3 pr-8 py-1.5 text-xs appearance-none cursor-pointer"
                  style={{ border: '1px solid rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)', outline: 'none', boxShadow: '0 2px 8px rgba(212,163,115,0.08)' }}
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
                <div
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--bronze)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
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
            alt="A beautifully printed Memory Project hardcover book, bound in warm linen-finish cover with gold foil title"
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

        {/* Social proof — warm, understated credibility strip */}
        <div className="mb-6 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8" style={{ background: 'linear-gradient(135deg, rgba(255,250,240,0.96) 0%, rgba(248,237,220,0.96) 100%)', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 4px 20px rgba(212,163,115,0.06)' }}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex -space-x-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: ['rgba(212,163,115,0.30)', 'rgba(204,213,174,0.35)', 'rgba(239,214,168,0.35)'][i], color: '#3A2A1A', border: '2px solid var(--cornsilk)' }}>
                {['JR', 'SM', 'AK'][i]}
              </div>
            ))}
            </div>
            <p className="text-xs leading-5" style={{ color: '#4A3A2A', fontFamily: 'var(--font-sans)' }}>
              <span className="font-semibold">2,400+ families</span> have preserved their stories since 2024
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[1,2,3,4,5].map(n => (
              <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#B8860B' }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            <span className="text-xs font-semibold ml-1" style={{ color: '#4A3A2A', fontFamily: 'var(--font-sans)' }}>4.9/5</span>
          </div>
          <p className="text-xs leading-5 sm:border-l sm:pl-6" style={{ color: '#5A4637', fontFamily: 'var(--font-sans)', borderColor: 'rgba(212,163,115,0.15)' }}>
            "Finally somewhere my whole family wants to open." — The Moreno Family
          </p>
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
            // Only show 'Most Popular' when the Plus plan is available for selection (not the current plan)
            const isPopular = plan.id === 'plus' && !isCurrentPlan;
            const isPlus = plan.id === 'plus';
            const cardStyles = {
              backgroundColor: isSelected ? '#FDFCF5' : isCurrentPlan ? 'rgba(212,163,115,0.05)' : isPlus ? '#EDD9B4' : 'var(--papaya)',
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
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[0.7rem] font-bold tracking-[0.15em] uppercase px-3.5 py-1 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: '#2D4A35', color: '#E8F0E5', fontFamily: 'var(--font-sans)', letterSpacing: '0.15em', boxShadow: '0 2px 8px rgba(45,74,53,0.25)' }}
                  >
                    ⭐ Most Popular
                  </div>
                )}
                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#A07850', color: '#FDFCF5', fontFamily: 'var(--font-sans)', border: '1px solid rgba(180,140,90,0.5)', boxShadow: '0 2px 8px rgba(160,120,80,0.25)', letterSpacing: '0.05em' }}
                  >
                    <Check size={9} strokeWidth={3} />
                    Current
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: isCurrentPlan ? '#5A5A48' : '#6B4423', fontFamily: 'var(--font-sans)' }}>{plan.label}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-xl font-medium" style={{ color: isCurrentPlan ? '#5A5A48' : 'var(--charcoal)' }}>{plan.price}</p>
                    </div>
                    {plan.id !== 'free' && (
                      <div
                        className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap inline-block"
                        style={{
                          backgroundColor: isCurrentPlan ? 'rgba(212,163,115,0.08)' : 'rgba(212,163,115,0.15)',
                          color: isCurrentPlan ? '#5A5A48' : '#5A3A1A',
                          fontFamily: 'var(--font-sans)',
                          border: `1px solid ${isCurrentPlan ? 'rgba(212,163,115,0.15)' : 'rgba(212,163,115,0.30)'}`,
                          letterSpacing: '0.04em',
                        }}
                      >
                        Pay once, own forever
                      </div>
                    )}
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4A4A3A' }}>{plan.description}</p>
                  </div>
                  {/* Selection indicator */}
                  {(isSelected || isCurrentPlan) && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: isSelected ? 'var(--charcoal)' : 'rgba(204,213,174,0.3)', border: isCurrentPlan ? '1px solid rgba(212,163,115,0.25)' : 'none' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: isSelected ? 'var(--cornsilk)' : '#5A5A48' }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: 'rgba(212,163,115,0.12)', marginBottom: 12 }} />

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#3A2A1A' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5" style={{ color: isCurrentPlan ? '#5A5A48' : '#7A5A2A' }}>
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
                  className="w-full h-10 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isSelected
                      ? '#2D4A35'
                      : isCurrentPlan
                        ? 'rgba(204,213,174,0.25)'
                        : plan.id === 'free'
                          ? 'rgba(212,163,115,0.12)'
                          : '#4A3520',
                    color: isSelected
                      ? '#E8F0E5'
                      : isCurrentPlan
                        ? '#4A5A3A'
                        : 'var(--cornsilk)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: isSelected
                      ? '0 4px 20px rgba(45,74,53,0.30), inset 0 0 0 1px rgba(255,255,255,0.08)'
                      : plan.id === 'free'
                        ? 'none'
                        : '0 4px 16px rgba(74,53,32,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)',
                    position: 'relative' as const,
                    overflow: 'hidden' as const,
                  }}
                  onMouseEnter={(e) => { if (!isCurrentPlan && !isSelected) { e.currentTarget.style.background = 'linear-gradient(135deg, #5A3E22 0%, #8A6A3C 40%, #D4A373 60%, #8A6A3C 100%)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(212,163,115,0.45), 0 2px 8px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                  onMouseLeave={(e) => { if (!isCurrentPlan && !isSelected) { e.currentTarget.style.background = '#4A3520'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,53,32,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
                >
                  {isCurrentPlan ? 'Current plan' : isSelected ? 'Selected — ready to confirm' : plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.label}`}
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
              className="h-13 rounded-full px-10 text-sm font-semibold transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bronze)',
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 6px 28px rgba(212,163,115,0.36), 0 2px 8px rgba(212,163,115,0.16)',
                position: 'relative' as const,
                overflow: 'hidden' as const,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #C49A6C 0%, #D4A373 30%, #E8C89A 50%, #D4A373 70%, #C49A6C 100%)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(212,163,115,0.50), 0 3px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bronze)';
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(212,163,115,0.36), 0 2px 8px rgba(212,163,115,0.16)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-3 justify-center">
                  <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                  Updating plan...
                </span>
              ) : (
                isUpgrade
                  ? `Upgrade to ${getBookPlanLabel(selectedPlan)}`
                  : `Change to ${getBookPlanLabel(selectedPlan)}`
              )}
            </button>
            <p className="text-xs mt-3" style={{ color: '#5A5A48', fontFamily: 'var(--font-sans)' }}>
              Plans are per-book. Each book can be on its own plan.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-6 text-xs" style={{ fontFamily: 'var(--font-sans)', color: '#9A8A78' }}>
        <span>Memory Project</span>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: '#9A8A78' }}>Privacy</a>
          <a href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: '#9A8A78' }}>Terms</a>
          <a href="/faq" className="hover:opacity-70 transition-opacity" style={{ color: '#9A8A78' }}>FAQ</a>
        </div>
      </footer>
    </div>
  );
}
