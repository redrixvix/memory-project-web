'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Book {
  id: number;
  title: string;
  description: string | null;
  storage_tier: string;
  created_at: string;
  role: string;
  owner_name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBooks();
    // Scroll-reveal
    const el = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.08 }
    );
    el.forEach(e => obs.observe(e));
    return () => obs.disconnect();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setBooks(data.books || []);
    } catch {
      console.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewTitle(''); setNewDesc('');
        setShowCreate(false);
        router.push(`/books/${data.book.id}`);
      }
    } finally { setCreating(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
                <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
                <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
              </svg>
              <span className="text-base font-medium tracking-tight" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
            </Link>
          </div>
          <button onClick={handleLogout} className="text-sm transition-colors hover:opacity-70" style={{ color: '#6A6A5A' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="px-6 md:px-10 py-12 max-w-5xl mx-auto w-full">

        {/* Page header */}
        <div className="mb-12">
          <p className="label-caps mb-2" style={{ color: 'var(--bronze)' }}>Your library</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="display-md" style={{ color: 'var(--charcoal)' }}>Memory Books</h1>
              <p className="text-sm mt-2" style={{ color: '#6A6A5A' }}>
                {books.length === 0
                  ? 'Capture and preserve your family\'s stories'
                  : `${books.length} ${books.length === 1 ? 'book' : 'books'} in your library`}
              </p>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="rounded-full shrink-0 h-11 px-6 text-sm font-medium transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Book
            </Button>
          </div>
        </div>

        {/* ── Create book form (drawer-style) ── */}
        {showCreate && (
          <div className="reveal mb-8">
            <Card className="p-7 rounded-2xl" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.2)', boxShadow: '0 8px 32px rgba(212,163,115,0.1)' }}>
              <CardContent className="pt-0">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
                      Create a new memory book
                    </h2>
                    <p className="text-sm mt-1" style={{ color: '#6A6A5A' }}>Give it a name — you can always change it later.</p>
                  </div>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                    style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#6A6A5A' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <form onSubmit={createBook} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm" style={{ color: 'var(--charcoal)' }}>Book title</Label>
                    <Input
                      id="title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      placeholder="Ruth's Life Story"
                      className="rounded-xl text-base"
                      style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc" className="text-sm" style={{ color: 'var(--charcoal)' }}>
                      Description <span className="font-normal opacity-50">(optional)</span>
                    </Label>
                    <Textarea
                      id="desc"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="resize-none rounded-xl text-base"
                      rows={3}
                      placeholder="A collection of memories from a wonderful life..."
                      style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="rounded-full h-11 px-7 text-sm font-medium"
                      style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                    >
                      {creating ? 'Creating...' : 'Create Book'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreate(false)}
                      className="rounded-full h-11 px-6 text-sm"
                      style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Empty state ── */}
        {books.length === 0 && !showCreate ? (
          <div className="text-center py-24 reveal">
            {/* Book icon */}
            <div className="inline-block mb-8">
              <div className="w-28 h-36 rounded-xl flex items-center justify-center mx-auto relative" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.25)', boxShadow: '6px 6px 0 rgba(212,163,115,0.12)' }}>
                <div className="absolute left-0 top-0 bottom-0 w-3.5 rounded-l-xl" style={{ backgroundColor: 'var(--bronze)' }} />
                <svg className="w-12 h-12 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--charcoal)' }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M12 6v6M9 9h6"/>
                </svg>
              </div>
            </div>
            <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>No books yet</h2>
            <p className="text-sm max-w-xs mx-auto leading-relaxed mb-10" style={{ color: '#6A6A5A' }}>
              Every family has stories worth keeping. Create your first memory book and start capturing the moments that matter.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="rounded-full h-12 px-8 text-sm font-medium"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              Create your first book
            </Button>
          </div>
        ) : (
          /* ── Book grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {books.map((book, i) => (
              <div key={book.id} className={`reveal delay-${Math.min((i + 1) * 100, 500)} card-hover`}>
                <Link href={`/books/${book.id}`} className="block h-full">
                  <Card
                    className="h-full rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 2px 16px rgba(212,163,115,0.07)' }}
                  >
                    <CardContent className="pt-7 pb-8 px-7">
                      {/* Row 1: number + badge */}
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-xs font-medium" style={{ color: 'rgba(212,163,115,0.5)', fontFamily: 'var(--font-sans)' }}>
                          #{i + 1}
                        </span>
                        {book.role !== 'owner' && (
                          <Badge className="rounded-full text-xs px-3 py-0.5 font-medium" style={{ backgroundColor: 'var(--tea-green)', color: 'var(--charcoal)' }}>
                            Shared
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-medium mb-2 leading-snug" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                        {book.title}
                      </h3>

                      {/* Description */}
                      {book.description && (
                        <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
                          {book.description}
                        </p>
                      )}

                      {/* Rule */}
                      <div className="rule mb-5" />

                      {/* Footer row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium capitalize" style={{ color: 'var(--charcoal)' }}>{book.storage_tier} plan</p>
                          <p className="text-xs mt-0.5" style={{ color: '#6A6A5A' }}>
                            {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                          style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
