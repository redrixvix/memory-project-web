'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  storage_tier: string;
  owner_name: string;
}

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBook();
    const el = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.08 }
    );
    el.forEach(e => obs.observe(e));
    return () => obs.disconnect();
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

  const handleDeleteMemory = async (memoryId: number) => {
    if (!confirm('Delete this memory? This cannot be undone.')) return;
    const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
    if (res.ok) setMemories(memories.filter(m => m.id !== memoryId));
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

  if (!book) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-70" style={{ color: '#6A6A5A' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Dashboard
            </Link>
            <span style={{ color: 'rgba(212,163,115,0.3)' }}>·</span>
            <h1 className="text-base font-medium truncate max-w-[200px] md:max-w-none" style={{ color: 'var(--charcoal)' }}>
              {book.title}
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Memory
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/books/${id}/preview`);
                alert('Preview link copied! Anyone with this link can view your book.');
              }}
              className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
            >
              Share
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="px-6 md:px-10 py-12 max-w-3xl mx-auto w-full">

        {/* Book description */}
        {book.description && (
          <div className="reveal mb-12">
            <p className="text-base leading-relaxed" style={{ color: '#6A6A5A' }}>{book.description}</p>
            <div className="rule mt-6" />
          </div>
        )}

        {/* Memory count header */}
        {memories.length > 0 && (
          <div className="reveal mb-10 flex items-center justify-between">
            <p className="label-caps" style={{ color: 'var(--bronze)' }}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </p>
            <Link
              href={`/books/${id}/preview`}
              className="text-sm flex items-center gap-2 transition-colors hover:opacity-70"
              style={{ color: 'var(--charcoal)' }}
            >
              Preview book
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}

        {/* Empty state */}
        {memories.length === 0 ? (
          <div className="text-center py-24 reveal">
            <div className="inline-block mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(204,213,174,0.3)' }}>
                <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ color: 'var(--charcoal)' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>Start your memory book</h2>
            <p className="text-sm max-w-xs mx-auto leading-relaxed mb-10" style={{ color: '#6A6A5A' }}>
              Every great story starts with a single memory. Add your first one — you can use a prompt or write freely.
            </p>
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add your first memory
            </Link>
          </div>
        ) : (
          /* ── Memory list ── */
          <div className="space-y-5">
            {memories.map((memory, index) => (
              <div key={memory.id} className={`reveal delay-${Math.min((index + 1) * 80, 600)}`}>
                <Card
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 2px 16px rgba(212,163,115,0.07)' }}
                >
                  <CardContent className="pt-7 pb-7 px-7">

                    {/* Header: number + date + prompt */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                        >
                          #{index + 1}
                        </span>
                        <p className="text-xs" style={{ color: '#6A6A5A' }}>
                          {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {memory.prompt_question && (
                        <p className="text-xs italic max-w-[300px] leading-relaxed" style={{ color: '#6A6A5A' }}>
                          &ldquo;{memory.prompt_question}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Memory text */}
                    <p className="text-base leading-loose whitespace-pre-wrap" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                      {memory.answer_text}
                    </p>

                    {/* Photos */}
                    {memory.photo_urls && memory.photo_urls.length > 0 && (
                      <div className="flex gap-3 mt-7 overflow-x-auto pb-2">
                        {memory.photo_urls.map((url, i) => (
                          <div key={i} className="img-frame rounded-xl overflow-hidden shrink-0">
                            <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Audio */}
                    {memory.audio_url && (
                      <audio src={memory.audio_url} controls className="mt-7 w-full h-9" />
                    )}

                    {/* Footer actions */}
                    <div className="flex justify-end items-center mt-6 pt-5 border-t" style={{ borderColor: 'rgba(212,163,115,0.15)' }}>
                      <div className="flex gap-4">
                        <Link
                          href={`/books/${id}/edit?memory=${memory.id}`}
                          className="text-sm font-medium flex items-center gap-1.5 transition-colors hover:opacity-70"
                          style={{ color: 'var(--bronze)' }}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteMemory(memory.id)}
                          className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-70"
                          style={{ color: '#B91C1C' }}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Preview CTA */}
        {memories.length > 0 && (
          <div className="reveal mt-12 text-center">
            <Link
              href={`/books/${id}/preview`}
              className="inline-flex h-11 items-center justify-center rounded-full border px-7 text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Preview your book
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
