'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
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
        setNewTitle('');
        setNewDesc('');
        setShowCreate(false);
        fetchBooks();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading your books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 md:px-8 flex justify-between items-center bg-card border-b border-border">
        <Link href="/" className="text-xl font-bold text-accent">Memory Project</Link>
        <button onClick={handleLogout} className="text-muted hover:text-foreground transition-colors text-sm">
          Sign out
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Books</h1>
            <p className="text-muted mt-1 text-sm md:text-base">Capture and preserve your family&apos;s stories</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-accent-light transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Book
          </button>
        </div>

        {showCreate && (
          <div className="bg-card p-6 rounded-2xl border border-border mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Create a new memory book</h2>
            <form onSubmit={createBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Book title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Ruth's Life Story"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description <span className="text-muted font-normal">(optional)</span></label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                  placeholder="A collection of memories from a wonderful life..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Book'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="border border-border px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-background transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-20">
            {/* Warm illustrated empty state */}
            <div className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M12 6v6M9 9h6"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">No books yet</h2>
            <p className="text-muted mb-8 text-sm max-w-xs mx-auto leading-relaxed">
              Every family has stories worth keeping. Create your first memory book and start capturing the moments that matter.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-accent-light transition-colors shadow-sm"
            >
              Create your first book
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="block bg-card p-5 rounded-2xl border border-border hover:border-accent/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold group-hover:text-accent transition-colors truncate">{book.title}</h3>
                      {book.role !== 'owner' && (
                        <span className="shrink-0 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Shared</span>
                      )}
                    </div>
                    {book.description && (
                      <p className="text-muted text-sm leading-relaxed line-clamp-2">{book.description}</p>
                    )}
                    <p className="text-xs text-muted/70 mt-2 capitalize">{book.storage_tier} plan · Created {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}