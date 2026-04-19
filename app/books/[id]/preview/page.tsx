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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading preview...</div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 py-4 px-6 bg-stone-100/95 backdrop-blur border-b border-stone-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href={`/books/${id}`} className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </Link>
          <span className="text-stone-300">·</span>
          <span className="text-sm text-stone-500">{book.title}</span>
        </div>
        <button
          onClick={handleOrderPrint}
          disabled={ordering || memories.length === 0}
          className="bg-accent text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 shadow-sm"
        >
          {ordering ? 'Ordering...' : 'Order Print Copy'}
        </button>
      </header>

      {/* Book preview */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Book container — simulates a physical book */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-stone-400/30 overflow-hidden border border-stone-200">

            {/* Book spine — left side decoration */}
            <div className="flex">
              <div className="w-6 bg-gradient-to-r from-stone-300 to-stone-200 shrink-0" />
              <div className="flex-1">

                {/* Cover page */}
                <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 px-12 py-16 text-center border-b-4 border-b-amber-200">
                  {/* Decorative elements */}
                  <div className="flex justify-center mb-6">
                    <svg width="60" height="30" viewBox="0 0 60 30" fill="none" className="text-amber-300">
                      <path d="M30 15C30 15 10 5 5 15C5 25 30 25 30 15Z" fill="currentColor" fillOpacity="0.4"/>
                      <path d="M30 15C30 15 50 5 55 15C55 25 30 25 30 15Z" fill="currentColor" fillOpacity="0.4"/>
                      <circle cx="30" cy="15" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="border-t border-b border-amber-300/50 py-6 mb-6">
                    <h2 className="text-4xl font-bold text-amber-900 mb-3" style={{ fontFamily: "'Lora', Georgia, serif", letterSpacing: "-0.01em" }}>
                      {book.title}
                    </h2>
                    <p className="text-amber-700 text-sm italic">A Memory Book</p>
                  </div>
                  <p className="text-amber-800 font-medium">{book.owner_name}</p>
                  <p className="text-amber-600 text-xs mt-1">{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</p>
                </div>

                {/* Table of contents */}
                {memories.length > 0 && (
                  <div className="px-12 py-10 border-b border-stone-100">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Contents</h3>
                    <ol className="space-y-3">
                      {memories.map((m, i) => (
                        <li key={m.id} className="flex items-baseline gap-3">
                          <span className="text-stone-300 text-xs w-4 shrink-0">{i + 1}.</span>
                          <span className="text-sm text-stone-600 leading-snug">
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
                  <div key={memory.id} className="px-12 py-10 border-b border-stone-100 last:border-b-0">
                    {/* Memory header */}
                    <div className="mb-6">
                      {memory.prompt_question && (
                        <p className="text-sm text-stone-400 italic mb-2 leading-relaxed">"{memory.prompt_question}"</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                        <span className="text-xs text-stone-300 font-medium">Page {i + 1}</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-amber-200 to-transparent" />
                      </div>
                    </div>

                    {/* Memory text */}
                    <p className="text-base leading-loose text-stone-700 whitespace-pre-wrap" style={{ fontFamily: "'Lora', Georgia, serif" }}>
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
                  <div className="bg-gradient-to-t from-amber-50 to-orange-50 px-12 py-16 text-center border-t-4 border-t-amber-200">
                    <div className="border-t border-b border-amber-300/40 py-6 mb-6">
                      <p className="text-amber-800 text-sm italic mb-2">"The stories we keep become the legacy we leave."</p>
                    </div>
                    <p className="text-amber-700 text-xs">Printed with love by Memory Project</p>
                    <p className="text-amber-600 text-xs mt-1">memoryproject.com</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {memories.length === 0 && (
            <div className="bg-white rounded-2xl shadow-2xl shadow-stone-400/30 overflow-hidden border border-stone-200">
              <div className="px-12 py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2">Nothing to preview yet</h2>
                <p className="text-stone-400 text-sm mb-6">Add some memories to your book before previewing.</p>
                <Link
                  href={`/books/${id}/edit`}
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent-light transition-colors"
                >
                  Add memories
                </Link>
              </div>
            </div>
          )}

          <p className="text-center text-stone-400 text-xs mt-6">
            This is a preview. Final printed book may differ.
          </p>
        </div>
      </main>
    </div>
  );
}
