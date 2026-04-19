'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 404) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setBook(data.book);
      setMemories(data.memories || []);
    } catch {
      console.error('Failed to fetch book');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPrint = async () => {
    if (!confirm('Order a printed copy of this book? ($99-149)')) return;
    setOrdering(true);
    try {
      const res = await fetch(`/api/books/${id}/order-print`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Print order submitted!');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5f0" }}>
        <div style={{ color: "var(--charcoal)" }}>Loading preview...</div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f5f0" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-10 py-4 px-6 backdrop-blur border-b flex justify-between items-center" style={{ backgroundColor: "rgba(245,245,240,0.95)", borderColor: "var(--olive)" }}>
        <div className="flex items-center gap-3">
          <Link href={`/books/${id}`} className="text-sm transition-colors flex items-center gap-1" style={{ color: "var(--charcoal)" }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </Link>
          <span style={{ color: "var(--olive)" }}>·</span>
          <span className="text-sm" style={{ color: "var(--charcoal)" }}>{book.title}</span>
        </div>
        <Button onClick={handleOrderPrint} disabled={ordering || memories.length === 0}>
          {ordering ? 'Ordering...' : 'Order Print Copy'}
        </Button>
      </header>

      {/* Book preview */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Book container — simulates a physical book */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--white)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", border: "1px solid var(--olive)" }}>

            {/* Book spine — left side decoration */}
            <div className="flex">
              <div className="w-6 shrink-0" style={{ background: "linear-gradient(to right, var(--olive), var(--mauve))" }} />
              <div className="flex-1">

                {/* Cover page */}
                <div className="px-12 py-16 text-center border-b-4" style={{ background: "linear-gradient(to bottom, rgba(255,191,0,0.1), rgba(224,176,255,0.1), var(--white))", borderColor: "var(--amber-muted)" }}>
                  {/* Decorative elements */}
                  <div className="flex justify-center mb-6">
                    <svg width="60" height="30" viewBox="0 0 60 30" fill="none" style={{ color: "var(--amber)" }}>
                      <path d="M30 15C30 15 10 5 5 15C5 25 30 25 30 15Z" fill="currentColor" fillOpacity="0.4"/>
                      <path d="M30 15C30 15 50 5 55 15C55 25 30 25 30 15Z" fill="currentColor" fillOpacity="0.4"/>
                      <circle cx="30" cy="15" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(207,181,59,0.5)" }}>
                    <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", letterSpacing: "-0.01em", color: "var(--charcoal)" }}>
                      {book.title}
                    </h2>
                    <p className="text-sm italic" style={{ color: "var(--amber-muted)" }}>A Memory Book</p>
                  </div>
                  <p className="font-medium" style={{ color: "var(--charcoal)" }}>{book.owner_name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--amber-muted)" }}>{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</p>
                </div>

                {/* Table of contents */}
                {memories.length > 0 && (
                  <div className="px-12 py-10 border-b" style={{ borderColor: "var(--olive)" }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--charcoal)", opacity: 0.5 }}>Contents</h3>
                    <ol className="space-y-3">
                      {memories.map((m, i) => (
                        <li key={m.id} className="flex items-baseline gap-3">
                          <span className="text-xs w-4 shrink-0" style={{ color: "var(--olive)" }}>{i + 1}.</span>
                          <span className="text-sm leading-snug" style={{ color: "var(--charcoal)" }}>
                            {m.prompt_question
                              ? <span className="italic">"{m.prompt_question.slice(0, 45)}{m.prompt_question.length > 45 ? '…' : ''}"</span>
                              : <span>{m.answer_text.slice(0, 50)}{m.answer_text.length > 50 ? '…' : ''}</span>
                            }
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Memory pages */}
                {memories.map((memory, i) => (
                  <div key={memory.id} className="px-12 py-10 border-b last:border-b-0" style={{ borderColor: "var(--olive)" }}>
                    {/* Memory header */}
                    <div className="mb-6">
                      {memory.prompt_question && (
                        <p className="text-sm italic mb-2 leading-relaxed" style={{ color: "var(--charcoal)", opacity: 0.7 }}>"{memory.prompt_question}"</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--amber-muted), transparent)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--olive)" }}>Page {i + 1}</span>
                        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, var(--amber-muted), transparent)" }} />
                      </div>
                    </div>

                    {/* Memory text */}
                    <p className="text-base leading-loose whitespace-pre-wrap" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>
                      {memory.answer_text}
                    </p>

                    {/* Photos */}
                    {memory.photo_urls && memory.photo_urls.length > 0 && (
                      <div className="flex gap-3 mt-8 flex-wrap">
                        {memory.photo_urls.map((url, j) => (
                          <img
                            key={j}
                            src={url}
                            alt=""
                            className="w-36 h-36 object-cover rounded-lg shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Back cover */}
                {memories.length > 0 && (
                  <div className="px-12 py-16 text-center border-t-4" style={{ background: "linear-gradient(to top, rgba(255,191,0,0.05), var(--white))", borderColor: "var(--amber-muted)" }}>
                    <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(207,181,59,0.4)" }}>
                      <p className="text-sm italic mb-2" style={{ color: "var(--charcoal)" }}>"The stories we keep become the legacy we leave."</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--amber-muted)" }}>Printed with love by Memory Project</p>
                    <p className="text-xs mt-1" style={{ color: "var(--olive)" }}>memoryproject.com</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {memories.length === 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--white)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", border: "1px solid var(--olive)" }}>
              <div className="px-12 py-20 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--mauve)" }}>
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--charcoal)" }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Nothing to preview yet</h2>
                <p className="text-sm mb-6" style={{ color: "var(--charcoal)", opacity: 0.6 }}>Add some memories to your book before previewing.</p>
                <Button asChild>
                  <Link href={`/books/${id}/edit`}>Add memories</Link>
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-xs mt-6" style={{ color: "var(--charcoal)", opacity: 0.5 }}>
            This is a preview. Final printed book may differ.
          </p>
        </div>
      </main>
    </div>
  );
}
