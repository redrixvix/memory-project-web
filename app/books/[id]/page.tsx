'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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

  const handleDeleteMemory = async (memoryId: number) => {
    if (!confirm('Delete this memory? This cannot be undone.')) return;
    const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
    if (res.ok) {
      setMemories(memories.filter(m => m.id !== memoryId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cream)" }}>
        <div style={{ color: "var(--rosy)" }}>Loading...</div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cream)" }}>
      <header className="py-4 px-6 md:px-8 flex justify-between items-center border-b" style={{ backgroundColor: "var(--white)", borderColor: "var(--thistle)" }}>
        <div>
          <Link href="/dashboard" className="text-sm transition-colors flex items-center gap-1" style={{ color: "var(--rosy)" }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-xl md:text-2xl font-bold mt-1" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>{book.title}</h1>
        </div>
        <Link
          href={`/books/${id}/edit`}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-opacity"
          style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}
        >
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Memory
        </Link>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-2xl mx-auto w-full">
        {book.description && (
          <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--rosy)" }}>{book.description}</p>
        )}

        {memories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "var(--sage)" }}>
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--midnight)" }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>Start your memory book</h2>
            <p className="mb-8 text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--rosy)" }}>
              Every great story starts with a single memory. Add your first one — you can use a prompt or write freely.
            </p>
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity"
              style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add your first memory
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {memories.map((memory, index) => (
              <Card key={memory.id} className="p-5" style={{ backgroundColor: "var(--white)", border: "1px solid var(--thistle)" }}>
                <CardContent className="pt-0">
                  {/* Memory number badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--olive)", color: "var(--cream)" }}>
                      #{index + 1}
                    </span>
                    {memory.prompt_question && (
                      <span className="text-xs font-medium italic" style={{ color: "var(--rosy)" }}>"{memory.prompt_question}"</span>
                    )}
                  </div>

                  <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--charcoal)" }}>{memory.answer_text}</p>

                  {memory.photo_urls && memory.photo_urls.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                      {memory.photo_urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-20 h-20 object-cover rounded-xl shrink-0"
                        />
                      ))}
                    </div>
                  )}

                  {memory.audio_url && (
                    <audio src={memory.audio_url} controls className="mt-4 w-full h-10" />
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t" style={{ borderColor: "var(--thistle)" }}>
                    <p className="text-xs" style={{ color: "var(--rosy)" }}>
                      {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/books/${id}/edit?memory=${memory.id}`}
                        className="text-xs font-medium transition-colors flex items-center justify-center px-3 py-2 min-h-[44px] rounded-lg"
                        style={{ color: "var(--olive)" }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-xs transition-colors flex items-center justify-center px-3 py-2 min-h-[44px] rounded-lg"
                        style={{ color: "#B91C1C" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {memories.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={`/books/${id}/preview`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--midnight)", color: "var(--midnight)" }}
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