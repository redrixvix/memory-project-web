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
        const data = await res.json();
        setNewTitle('');
        setNewDesc('');
        setShowCreate(false);
        router.push(`/books/${data.book.id}`);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cornsilk)" }}>
        <div style={{ color: "#6A6A5A" }}>Loading your books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cornsilk)" }}>
      <header className="py-4 px-6 md:px-8 flex justify-between items-center border-b" style={{ backgroundColor: "#FDFCF5", borderColor: "rgba(212,163,115,0.15)" }}>
        <Link href="/" className="text-xl font-medium tracking-tight" style={{ color: "var(--charcoal)" }}>Memory Project</Link>
        <button onClick={handleLogout} className="text-sm transition-colors" style={{ color: "#6A6A5A" }}>
          Sign out
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Your Books</h1>
            <p className="mt-1 text-sm" style={{ color: "#6A6A5A" }}>Capture and preserve your family&apos;s stories</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="rounded-full" style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}>
            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Book
          </Button>
        </div>

        {showCreate && (
          <Card className="p-6 mb-6" style={{ backgroundColor: "#FDFCF5", border: "1px solid rgba(212,163,115,0.2)", boxShadow: "0 4px 20px rgba(212,163,115,0.08)" }}>
            <CardContent className="pt-0">
              <h2 className="text-lg font-medium mb-4" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Create a new memory book</h2>
              <form onSubmit={createBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm" style={{ color: "var(--charcoal)" }}>Book title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="Ruth's Life Story"
                    className="rounded-xl"
                    style={{ borderColor: "rgba(212,163,115,0.3)", backgroundColor: "var(--papaya)" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-sm" style={{ color: "var(--charcoal)" }}>Description <span className="font-normal opacity-60">(optional)</span></Label>
                  <Textarea
                    id="desc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="resize-none rounded-xl"
                    rows={3}
                    placeholder="A collection of memories from a wonderful life..."
                    style={{ borderColor: "rgba(212,163,115,0.3)", backgroundColor: "var(--papaya)" }}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={creating} className="rounded-full" style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}>
                    {creating ? 'Creating...' : 'Create Book'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="rounded-full" style={{ borderColor: "rgba(212,163,115,0.3)", color: "var(--charcoal)" }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {books.length === 0 ? (
          <div className="text-center py-20">
            {/* Empty state */}
            <div className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "var(--tea-green)" }}>
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--charcoal)" }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M12 6v6M9 9h6"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>No books yet</h2>
            <p className="mb-8 text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "#6A6A5A" }}>
              Every family has stories worth keeping. Create your first memory book and start capturing the moments that matter.
            </p>
            <Button onClick={() => setShowCreate(true)} className="rounded-full" style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}>
              Create your first book
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <Card key={book.id} className="p-5 hover:shadow-lg transition-shadow cursor-pointer" style={{ backgroundColor: "#FDFCF5", border: "1px solid rgba(212,163,115,0.2)", boxShadow: "0 4px 20px rgba(212,163,115,0.06)" }}>
                <Link href={`/books/${book.id}`} className="block">
                  <CardContent className="pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium truncate" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>{book.title}</h3>
                          {book.role !== 'owner' && (
                            <Badge variant="secondary" className="shrink-0 text-xs rounded-full" style={{ backgroundColor: "var(--tea-green)", color: "var(--charcoal)" }}>Shared</Badge>
                          )}
                        </div>
                        {book.description && (
                          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#6A6A5A" }}>{book.description}</p>
                        )}
                        <p className="text-xs mt-2 capitalize" style={{ color: "#6A6A5A" }}>{book.storage_tier} plan · Created {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--tea-green)" }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--charcoal)" }}>
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