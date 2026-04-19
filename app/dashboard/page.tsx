'use client';

import { useEffect, useState } from 'react';
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--off-white)" }}>
        <div style={{ color: "var(--charcoal)" }}>Loading your books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--off-white)" }}>
      <header className="py-4 px-6 md:px-8 flex justify-between items-center border-b" style={{ backgroundColor: "var(--white)", borderColor: "var(--olive)" }}>
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--amber)" }}>Memory Project</Link>
        <button onClick={handleLogout} className="text-sm transition-colors" style={{ color: "var(--charcoal)" }}>
          Sign out
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Your Books</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--charcoal)" }}>Capture and preserve your family&apos;s stories</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Book
          </Button>
        </div>

        {showCreate && (
          <Card className="p-6 mb-6">
            <CardContent className="pt-0">
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Create a new memory book</h2>
              <form onSubmit={createBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="Ruth's Life Story"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description <span className="font-normal opacity-60">(optional)</span></Label>
                  <Textarea
                    id="desc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="resize-none"
                    rows={3}
                    placeholder="A collection of memories from a wonderful life..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Book'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {books.length === 0 ? (
          <div className="text-center py-20">
            {/* Warm illustrated empty state */}
            <div className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "rgba(224,176,255,0.3)" }}>
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--amber-muted)" }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M12 6v6M9 9h6"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>No books yet</h2>
            <p className="mb-8 text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--charcoal)" }}>
              Every family has stories worth keeping. Create your first memory book and start capturing the moments that matter.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              Create your first book
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <Card key={book.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <Link href={`/books/${book.id}`} className="block">
                  <CardContent className="pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold truncate" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>{book.title}</h3>
                          {book.role !== 'owner' && (
                            <Badge variant="secondary" className="shrink-0">Shared</Badge>
                          )}
                        </div>
                        {book.description && (
                          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--charcoal)" }}>{book.description}</p>
                        )}
                        <p className="text-xs mt-2 capitalize" style={{ color: "var(--charcoal)", opacity: 0.6 }}>{book.storage_tier} plan · Created {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,191,0,0.1)" }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--amber)" }}>
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
