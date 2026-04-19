'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--beige)" }}>
        <div style={{ color: "var(--charcoal)" }}>Loading preview...</div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--beige)" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-10 py-4 px-6 border-b flex justify-between items-center" style={{ backgroundColor: "rgba(233,237,201,0.95)", borderColor: "rgba(212,163,115,0.15)" }}>
        <div className="flex items-center gap-3">
          <Link href={`/books/${id}`} className="text-sm transition-colors flex items-center gap-1" style={{ color: "var(--charcoal)" }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </Link>
          <span style={{ color: "#6A6A5A" }}>·</span>
          <span className="text-sm" style={{ color: "var(--charcoal)" }}>{book.title}</span>
        </div>
        <button
          onClick={handleOrderPrint}
          disabled={ordering || memories.length === 0}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}
        >
          {ordering ? 'Ordering...' : 'Order Print Copy'}
        </button>
      </header>

      {/* Book preview */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Book container — simulates a physical book */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDFCF5", boxShadow: "0 25px 50px rgba(212,163,115,0.12)", border: "1px solid rgba(212,163,115,0.2)" }}>

            {/* Book spine — left side decoration */}
            <div className="flex">
              <div className="w-6 shrink-0" style={{ background: "linear-gradient(to right, var(--bronze), var(--bronze))" }} />
              <div className="flex-1">

                {/* Cover page */}
                <div className="px-12 py-16 text-center border-b-4" style={{ background: "linear-gradient(to bottom, rgba(254,250,224,0.5), rgba(254,250,224,0.1), #FDFCF5)", borderColor: "var(--bronze)" }}>
                  {/* Decorative elements */}
                  <div className="flex justify-center mb-6">
                    <svg width="60" height="30" viewBox="0 0 60 30" fill="none" style={{ color: "var(--bronze)" }}>
                      <path d="M30 15C30 15 10 5 5 15C5 25 30 25 30 15Z" fill="currentColor" fillOpacity="0.4"/>
                      <path d="M30 15C30 15 50 5 55 15C55 25 30 25 30 15Z" fill="currentColor" fillOpacity="0.4"/>
                      <circle cx="30" cy="15" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(212,163,115,0.3)" }}>
                    <h2 className="text-4xl font-medium mb-3" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", letterSpacing: "-0.01em", color: "var(--charcoal)" }}>
                      {book.title}
                    </h2>
                    <p className="text-sm italic" style={{ color: "#6A6A5A" }}>A Memory Book</p>
                  </div>
                  <p className="font-medium" style={{ color: "var(--charcoal)" }}>{book.owner_name}</p>
                  <p className="text-xs mt-1" style={{ color: "#6A6A5A" }}>{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</p>
                </div>

                {/* Table of contents */}
                {memories.length > 0 && (
                  <div className="px-12 py-10 border-b" style={{ borderColor: "rgba(212,163,115,0.15)" }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--bronze)" }}>Contents</h3>
                    <ol className="space-y-3">
                      {memories.map((m, i) => (
                        <li key={m.id} className="flex items-baseline gap-3">
                          <span className="text-xs w-4 shrink-0" style={{ color: "#6A6A5A" }}>{i + 1}.</span>
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
                  <div key={memory.id} className="px-12 py-10 border-b last:border-b-0" style={{ borderColor: "rgba(212,163,115,0.15)" }}>
                    {/* Memory header */}
                    <div className="mb-6">
                      {memory.prompt_question && (
                        <p className="text-sm italic mb-2 leading-relaxed" style={{ color: "#6A6A5A" }}>"{memory.prompt_question}"</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--bronze), transparent)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--bronze)" }}>Page {i + 1}</span>
                        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, var(--bronze), transparent)" }} />
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
                            className="w-36 h-36 object-cover rounded-xl shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Back cover */}
                {memories.length > 0 && (
                  <div className="px-12 py-16 text-center border-t-4" style={{ background: "linear-gradient(to top, rgba(212,163,115,0.08), #FDFCF5)", borderColor: "var(--bronze)" }}>
                    <div className="border-t border-b py-6 mb-6" style={{ borderColor: "rgba(212,163,115,0.2)" }}>
                      <p className="text-sm italic mb-2" style={{ color: "var(--charcoal)" }}>"The stories we keep become the legacy we leave."</p>
                    </div>
                    <p className="text-xs" style={{ color: "#6A6A5A" }}>Printed with love by Memory Project</p>
                    <p className="text-xs mt-1" style={{ color: "#6A6A5A" }}>memoryproject.com</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {memories.length === 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDFCF5", boxShadow: "0 25px 50px rgba(212,163,115,0.12)", border: "1px solid rgba(212,163,115,0.2)" }}>
              <div className="px-12 py-20 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--tea-green)" }}>
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--charcoal)" }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-medium mb-2" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Nothing to preview yet</h2>
                <p className="text-sm mb-6" style={{ color: "#6A6A5A" }}>Add some memories to your book before previewing.</p>
                <Link
                  href={`/books/${id}/edit`}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-opacity"
                  style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}
                >
                  Add memories
                </Link>
              </div>
            </div>
          )}

          <p className="text-center text-xs mt-6" style={{ color: "#6A6A5A", opacity: 0.6 }}>
            This is a preview. Final printed book may differ.
          </p>
        </div>
      </main>
    </div>
  );
}