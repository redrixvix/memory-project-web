'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDisplayBookTitle } from '@/lib/display-book-title';

interface Memory {
  id: number;
  prompt_question: string | null;
  answer_text: string;
  photo_urls: string[];
  audio_url: string | null;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  description: string | null;
  owner_name: string;
}

export default function PreviewBook({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 404) { router.push('/dashboard'); return; }
      const data = await res.json();
      setBook(data.book);
      setMemories(data.memories || []);
    } catch { console.error('Failed to fetch book'); }
    finally { setLoading(false); }
  };

  const handleOrderPrint = async () => {
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    setOrdering(true);
    try {
      const res = await fetch(`/api/books/${id}/order-print`, { method: 'POST' });
      const data = await res.json();
      setOrderSuccess(true);
      setShowOrderModal(false);
      setTimeout(() => setOrderSuccess(false), 4000);
    } catch {
      // silently fail
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const displayTitle = getDisplayBookTitle(book.title);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP BAR ── */}
      <header
        className="sticky top-0 z-10 h-16 flex items-center px-6 border-b"
        style={{ background: 'rgba(254,250,224,0.94)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.15)' }}
      >
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href={`/books/${id}`} className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-70" style={{ color: 'var(--charcoal)' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back
            </Link>
            <span style={{ color: 'rgba(212,163,115,0.35)' }}>·</span>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>{displayTitle}</span>
          </div>
          <button
            onClick={handleOrderPrint}
            disabled={ordering || memories.length === 0}
            className="inline-flex h-8 items-center justify-center rounded-full px-5 text-xs font-medium whitespace-nowrap transition-all duration-200 disabled:opacity-50 active:scale-95"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            {ordering ? 'Ordering...' : 'Order Print Copy'}
          </button>
        </div>
      </header>

      {/* ── BOOK PREVIEW ── */}
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Physical book mockup */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              boxShadow: '0 24px 64px rgba(212,163,115,0.18), 0 8px 24px rgba(212,163,115,0.1)',
              border: '1px solid rgba(212,163,115,0.22)',
            }}
          >
            {/* Book spine + content */}
            <div className="flex">

              {/* Left spine */}
              <div className="w-5 shrink-0" style={{ backgroundColor: 'var(--bronze)' }} />

              <div className="flex-1">

                {/* ── COVER PAGE ── */}
                <div
                  className="px-12 py-20 text-center"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(254,250,224,0.6), rgba(254,250,224,0.15), #FDFCF5)',
                    borderBottom: '3px solid var(--bronze)',
                  }}
                >
                  {/* Decorative emblem */}
                  <div className="flex justify-center mb-8">
                    <svg width="72" height="36" viewBox="0 0 72 36" fill="none" style={{ color: 'var(--bronze)' }}>
                      <path d="M36 18C36 18 14 5 6 18C6 28 36 28 36 18Z" fill="currentColor" fillOpacity="0.35"/>
                      <path d="M36 18C36 18 58 5 66 18C66 28 36 28 36 18Z" fill="currentColor" fillOpacity="0.35"/>
                      <circle cx="36" cy="18" r="5" fill="currentColor"/>
                    </svg>
                  </div>

                  {/* Horizontal rule ornament */}
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.4))' }} />
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ color: 'var(--bronze)' }}>
                      <circle cx="4" cy="4" r="3" fill="currentColor" fillOpacity="0.5"/>
                    </svg>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,163,115,0.4))' }} />
                  </div>

                  {/* Title */}
                  <h2
                    className="text-4xl md:text-5xl font-medium mb-4 leading-tight"
                    style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--charcoal)' }}
                  >
                    {displayTitle}
                  </h2>

                  <p className="text-sm italic mb-8" style={{ color: '#6A6A5A' }}>A Memory Book</p>

                  {/* Owner */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px flex-1 max-w-[80px]" style={{ background: 'rgba(212,163,115,0.3)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>{book.owner_name}</p>
                    <div className="h-px flex-1 max-w-[80px]" style={{ background: 'rgba(212,163,115,0.3)' }} />
                  </div>

                  <p className="text-xs" style={{ color: '#6A6A5A' }}>
                    {memories.length} {memories.length === 1 ? 'memory' : 'memories'} inside
                  </p>
                </div>

                {/* ── TABLE OF CONTENTS ── */}
                {memories.length > 0 && (
                  <div className="px-12 py-12" style={{ borderBottom: '1px solid rgba(212,163,115,0.15)' }}>
                    <p className="label-caps mb-8" style={{ color: 'var(--bronze)' }}>Contents</p>
                    <ol className="space-y-4">
                      {memories.map((m, i) => (
                        <li key={m.id} className="flex items-baseline gap-4">
                          <span className="text-xs w-5 text-right shrink-0" style={{ color: 'rgba(212,163,115,0.5)' }}>{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug line-clamp-2" style={{ color: 'var(--charcoal)' }}>
                              {m.prompt_question
                                ? <span className="italic">&ldquo;{m.prompt_question}&rdquo;</span>
                                : <span>{m.answer_text}</span>
                              }
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* ── MEMORY PAGES ── */}
                {memories.map((memory, i) => (
                  <div
                    key={memory.id}
                    className="px-12 py-12"
                    style={{ borderBottom: i < memories.length - 1 ? '1px solid rgba(212,163,115,0.15)' : 'none' }}
                  >
                    {/* Page header */}
                    <div className="mb-8">
                      {memory.prompt_question && (
                        <p className="text-sm italic mb-4 leading-relaxed" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
                          &ldquo;{memory.prompt_question}&rdquo;
                        </p>
                      )}
                      {/* Decorative divider */}
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, var(--bronze), transparent)' }} />
                        <span className="text-xs" style={{ color: 'rgba(212,163,115,0.6)' }}>Page {i + 1}</span>
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, var(--bronze), transparent)' }} />
                      </div>
                    </div>

                    {/* Memory text */}
                    <p
                      className="text-base leading-loose whitespace-pre-wrap"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)', lineHeight: 1.85 }}
                    >
                      {memory.answer_text}
                    </p>

                    {/* Photos */}
                    {memory.photo_urls && memory.photo_urls.length > 0 && (
                      <div className="flex gap-3 mt-8 flex-wrap">
                        {memory.photo_urls.map((url, j) => (
                          <div key={j} className="img-frame rounded-xl overflow-hidden shadow-sm">
                            <Image
                              src={url}
                              alt=""
                              width={160}
                              height={160}
                              unoptimized={true}
                              className="w-40 h-40 object-cover rounded-xl"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Audio */}
                    {memory.audio_url && (
                      <audio src={memory.audio_url} controls className="mt-8 w-full h-10 audio-player" />
                    )}
                  </div>
                ))}

                {/* ── BACK COVER ── */}
                {memories.length > 0 && (
                  <div
                    className="px-12 py-20 text-center"
                    style={{
                      background: 'linear-gradient(to top, rgba(212,163,115,0.06), #FDFCF5)',
                      borderTop: '3px solid var(--bronze)',
                    }}
                  >
                    {/* Emblem */}
                    <div className="flex justify-center mb-8">
                      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" style={{ color: 'var(--bronze)' }}>
                        <path d="M24 12C24 12 8 4 4 12C4 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.35"/>
                        <path d="M24 12C24 12 40 4 44 12C44 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.35"/>
                        <circle cx="24" cy="12" r="3" fill="currentColor"/>
                      </svg>
                    </div>

                    <div className="border-t border-b py-8 mb-8" style={{ borderColor: 'rgba(212,163,115,0.25)' }}>
                      <p className="text-base italic mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                        &ldquo;The stories we keep become the legacy we leave.&rdquo;
                      </p>
                    </div>

                    <p className="text-xs mb-1" style={{ color: '#6A6A5A' }}>Printed with love by</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--bronze)' }}>Memory Project</p>
                    <p className="text-xs mt-1" style={{ color: '#6A6A5A' }}>memoryproject.com</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {memories.length === 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#FDFCF5', boxShadow: '0 24px 64px rgba(212,163,115,0.18)', border: '1px solid rgba(212,163,115,0.22)' }}
            >
              <div className="px-12 py-20 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(204,213,174,0.3)' }}>
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ color: 'var(--charcoal)' }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
                  Nothing to preview yet
                </h2>
                <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>Add some memories to your book before previewing.</p>
                <Link
                  href={`/books/${id}/edit`}
                  className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                >
                  Add memories
                </Link>
              </div>
            </div>
          )}

          {/* Preview disclaimer */}
          <p className="text-center text-xs mt-8" style={{ color: '#6A6A5A', opacity: 0.55 }}>
            This is a digital preview. Final printed book may differ in paper, binding, and layout.
          </p>
        </div>
      </main>

      {/* Order Print Modal */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(43,43,43,0.65)' }}
            onClick={() => !ordering && setShowOrderModal(false)}
          />
          {/* Modal panel */}
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden animate-fade-up"
            style={{
              backgroundColor: '#FDFCF5',
              boxShadow: '0 40px 100px rgba(43,43,43,0.28), 0 12px 40px rgba(212,163,115,0.12)',
            }}
          >
            {/* Warm top bar */}
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: 'var(--bronze)' }} />
            <div className="p-6">
              {/* Book icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--bronze)' }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h2 id="order-modal-title" className="text-xl font-medium text-center mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
                Order a printed copy
              </h2>
              <p className="text-sm text-center leading-relaxed mb-6" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                Your book <strong style={{ color: 'var(--charcoal)' }}>{book?.title}</strong> will be printed as a beautiful hardcover book and shipped to your door.
              </p>
              {/* Pricing details */}
              <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'rgba(212,163,115,0.08)', border: '1px solid rgba(212,163,115,0.18)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Hardcover book</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>From $99</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>200+ pages</span>
                  <span className="text-sm" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>Premium paper</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Ships in</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--bronze)', fontFamily: 'var(--font-sans)' }}>3–5 weeks</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  disabled={ordering}
                  className="flex-1 h-11 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80"
                  style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.2)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={ordering}
                  className="flex-1 h-11 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-60 hover:brightness-110"
                  style={{ backgroundColor: ordering ? 'rgba(158,120,69,0.65)' : 'var(--bronze)', color: 'var(--charcoal)' }}
                >
                  {ordering ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                      Ordering...
                    </span>
                  ) : 'Continue to payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order success toast */}
      {orderSuccess && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 shadow-xl animate-fade-up"
          style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', minWidth: '280px', textAlign: 'center' }}
        >
          <div className="flex items-center gap-2 justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--tea-green)' }}>
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)' }}>Print order submitted!</span>
          </div>
        </div>
      )}
    </div>
  );
}
