'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { BOOK_PLAN_OPTIONS, type BookPlan, getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';

interface Book {
  id: number;
  title: string;
  description: string | null;
  storage_tier: string;
  plan: string;
  created_at: string;
  updated_at: string;
  role: string;
  owner_name: string;
  _count?: { memories: number };
  contributors?: {id: number, name: string, profile_image_url: string, google_id: string}[];
}

interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  googleId?: string | null;
}

const BOOK_COLORS = [
  'var(--bronze)',
  'var(--tea-green)',
  'var(--papaya)',
  'rgba(212,163,115,0.5)',
  'var(--tea-green)',
];

function getPlanBadgeStyles(plan: string) {
  const normalizedPlan = normalizeBookPlan(plan);

  if (normalizedPlan === 'plus') {
    return {
      backgroundColor: 'var(--charcoal)',
      color: 'var(--cornsilk)',
    };
  }

  if (normalizedPlan === 'premium') {
    return {
      backgroundColor: 'var(--bronze)',
      color: 'var(--charcoal)',
    };
  }

  return {
    backgroundColor: 'rgba(212,163,115,0.12)',
    color: '#6A6A5A',
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = checking auth
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPlan, setNewPlan] = useState<BookPlan>('free');
  const [creating, setCreating] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alpha'>('newest');

  useEffect(() => {
    async function fetchUserAndBooks() {
      try {
        const [userRes, booksRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/books'),
        ]);

        if (userRes.status === 401) { router.push('/login'); return; }
        setLoggedIn(true);

        const userData = await userRes.json();
        setUser(userData.user);

        if (booksRes.status === 401) { router.push('/login'); return; }
        const booksData = await booksRes.json();
        setBooks(booksData.books || []);
      } catch {
        console.error('Failed to fetch data');
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    void fetchUserAndBooks();
  }, [router]);

  const createBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, plan: newPlan }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewTitle(''); setNewDesc('');
        setNewPlan('free');
        setShowCreate(false);
        router.push(`/books/${data.book.id}`);
      }
    } finally { setCreating(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading || loggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="w-full max-w-3xl px-6">
          {/* Auth loading skeleton — matches dashboard layout */}
          <div className="mb-10">
            <div className="h-9 w-56 rounded-xl mb-2 animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
            <div className="h-4 w-40 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl p-6 flex items-center gap-5" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}>
                <div className="w-12 h-18 rounded-xl shrink-0 animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                <div className="flex-1 space-y-2.5">
                  <div className="h-5 w-48 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                  <div className="h-3 w-32 rounded-md animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.85; } } .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }`}</style>
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
          <Link
            href="/dashboard"
            aria-current="page"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--charcoal)' }}
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm transition-colors hover:opacity-70"
            style={{ color: '#6A6A5A' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="px-6 md:px-10 py-12 max-w-5xl mx-auto w-full">

        {/* Greeting + header */}
        <div className="mb-8">
          <p className="label-caps mb-2" style={{ color: 'var(--bronze)' }}>Your library</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Avatar
                    name={user.name}
                    imageUrl={user.profileImageUrl || null}
                    className="w-10 h-10"
                  />
                  <h1 className="display-md" style={{ color: 'var(--charcoal)' }}>
                    Your Memory Books
                  </h1>
                </>
              ) : (
                <h1 className="display-md" style={{ color: 'var(--charcoal)' }}>
                  Your Memory Books
                </h1>
              )}
            </div>
            <div className="flex items-center gap-3">
              {books.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-xs" style={{ color: '#6A6A5A' }}>Sort by</label>
                  <select
                    id="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                    className="text-xs rounded-lg px-3 py-1.5 cursor-pointer"
                    style={{ border: '1px solid rgba(212,163,115,0.25)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="alpha">A–Z</option>
                  </select>
                </div>
              )}
              <p className="text-sm" style={{ color: '#6A6A5A' }}>
                {books.length === 0
                  ? 'Capture and preserve your family\'s stories'
                  : `${books.length} ${books.length === 1 ? 'book' : 'books'} in your library`}
              </p>
              <Button
                onClick={() => setShowCreate(true)}
                type="button"
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
        </div>

        {/* ── Create book form ── */}
        {showCreate && (
          <div
            className="mb-8 animate-fade-up"
          >
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
                    type="button"
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
                      className="rounded-xl text-base w-full"
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
                      className="resize-none rounded-xl text-base w-full"
                      rows={3}
                      placeholder="A collection of memories from a wonderful life..."
                      style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm" style={{ color: 'var(--charcoal)' }}>
                      Subscription tier
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {BOOK_PLAN_OPTIONS.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setNewPlan(plan.id)}
                          className="rounded-2xl border px-4 py-4 text-left transition-all duration-200"
                          style={{
                            backgroundColor: newPlan === plan.id ? '#FDFCF5' : 'var(--papaya)',
                            borderColor: newPlan === plan.id ? 'var(--bronze)' : 'rgba(212,163,115,0.2)',
                            boxShadow: newPlan === plan.id ? '0 8px 24px rgba(212,163,115,0.12)' : 'none',
                          }}
                        >
                          <p className="label-caps mb-1" style={{ color: 'var(--bronze)' }}>{plan.label}</p>
                          <p className="text-lg font-medium" style={{ color: 'var(--charcoal)' }}>{plan.price}</p>
                          <p className="text-xs mt-2 leading-relaxed" style={{ color: '#6A6A5A' }}>
                            {plan.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: '#6A6A5A' }}>
                      Plans are assigned per book, so you can keep some books free and upgrade others later.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="rounded-full h-11 px-7 text-sm font-medium w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div
            className="text-center py-24 animate-fade-up"
          >
            {/* Elegant empty-state illustration */}
            <div className="inline-block mb-10">
              <div
                className="relative mx-auto"
                style={{ width: 120, height: 160 }}
              >
                {/* Book stack - bottom */}
                <div
                  className="absolute rounded-xl"
                  style={{
                    bottom: 0,
                    left: 20,
                    right: -12,
                    height: 36,
                    backgroundColor: 'rgba(204,213,174,0.25)',
                    border: '1px solid rgba(212,163,115,0.15)',
                    transform: 'rotate(-3deg)',
                  }}
                />
                {/* Book stack - middle */}
                <div
                  className="absolute rounded-xl"
                  style={{
                    bottom: 8,
                    left: 12,
                    right: -6,
                    height: 36,
                    backgroundColor: 'rgba(212,163,115,0.2)',
                    border: '1px solid rgba(212,163,115,0.2)',
                    transform: 'rotate(2deg)',
                  }}
                />
                {/* Main book */}
                <div
                  className="absolute rounded-xl"
                  style={{
                    inset: 0,
                    backgroundColor: '#FDFCF5',
                    border: '1px solid rgba(212,163,115,0.3)',
                    boxShadow: '4px 6px 0 rgba(212,163,115,0.12), 8px 12px 24px rgba(212,163,115,0.08)',
                  }}
                >
                  {/* Book spine */}
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-l-xl"
                    style={{
                      width: 10,
                      backgroundColor: 'var(--bronze)',
                      opacity: 0.6,
                    }}
                  />
                  {/* Placeholder lines */}
                  <div className="pt-6 px-5 pl-6">
                    <div className="h-px mb-5" style={{ backgroundColor: 'rgba(212,163,115,0.25)' }} />
                    {[1,2,3,4].map((_, i) => (
                      <div key={i} className="rounded-full mb-2.5" style={{
                        height: 3,
                        width: `${60 + i * 10}%`,
                        backgroundColor: i % 2 === 0 ? 'rgba(212,163,115,0.2)' : 'rgba(204,213,174,0.35)',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>Your library is empty</h2>
            <p className="text-sm max-w-xs mx-auto leading-relaxed mb-10" style={{ color: '#6A6A5A' }}>
              Every family has stories worth keeping. Create your first memory book and start capturing the moments that matter most.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              type="button"
              className="rounded-full h-12 px-8 text-sm font-medium"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              Create your first book
            </Button>
            <p className="text-xs mt-5 max-w-xs mx-auto leading-relaxed" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
              It takes about 5 minutes to create your first book and add your first memory.
            </p>
          </div>
        ) : (
          /* ── Book grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books
              .slice()
              .sort((a, b) => {
                if (sortOrder === 'newest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                if (sortOrder === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                return a.title.localeCompare(b.title);
              })
              .map((book, i) => {
              const lastUpdated = book.updated_at || book.created_at;
              return (
                <div
                  key={book.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <Link href={`/books/${book.id}`} className="block h-full group">
                    <div
                      className="relative h-full rounded-2xl overflow-hidden"
                      style={{
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 12px rgba(212,163,115,0.08)',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(212,163,115,0.14)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(212,163,115,0.08)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Color stripe on left */}
                      <div
                        className="absolute left-0 top-0 bottom-0"
                        style={{
                          width: 6,
                          backgroundColor: BOOK_COLORS[i % BOOK_COLORS.length],
                        }}
                      />
                      {/* Mini book cover visual */}
                      <div
                        className="absolute"
                        style={{
                          right: 20,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 52,
                          height: 70,
                          borderRadius: 6,
                          background: `linear-gradient(160deg, #FDFCF5 0%, #F8F5E8 60%, #F0EBD5 100%)`,
                          border: '1px solid rgba(212,163,115,0.35)',
                          boxShadow: '2px 3px 8px rgba(43,43,43,0.12)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Mini spine */}
                        <div style={{
                          position: 'absolute',
                          left: 0, top: 0, bottom: 0,
                          width: 5,
                          background: `linear-gradient(to right, ${BOOK_COLORS[i % BOOK_COLORS.length]}88, ${BOOK_COLORS[i % BOOK_COLORS.length]}44)`,
                          borderRadius: '6px 0 0 6px',
                        }} />
                        <div className="pt-3 px-2 pl-3">
                          <div style={{ height: 1, backgroundColor: 'rgba(212,163,115,0.25)', marginBottom: 5 }} />
                          {[1,2,3].map((_, li) => (
                            <div key={li} style={{
                              height: 2,
                              width: `${70 + li * 8}%`,
                              backgroundColor: 'rgba(212,163,115,0.2)',
                              borderRadius: 2,
                              marginBottom: 3,
                            }} />
                          ))}
                        </div>
                      </div>
                      <CardContent className="p-7" style={{ paddingLeft: 24, paddingRight: 80 }}>
                        {/* Title + plan badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-medium leading-snug" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                            {book.title}
                          </h3>
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                            style={getPlanBadgeStyles(book.plan)}
                          >
                            {getBookPlanLabel(book.plan, book.storage_tier)}
                          </span>
                        </div>

                        {/* Description */}
                        {book.description && (
                          <p className="text-sm leading-relaxed line-clamp-2 mb-6" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
                            {book.description}
                          </p>
                        )}

                        {/* Rule */}
                        <div className="rule mb-5" />

                        {/* Footer row */}
                        <div className="flex items-center justify-between" style={{ paddingBottom: 4 }}>
                          {/* Left side: memory count + contributors */}
                          <div className="flex items-center gap-3">
                            {book._count && (
                              <div
                                className="rounded-full px-3 py-1 flex items-center gap-1.5"
                                style={{ backgroundColor: 'rgba(184,137,90,0.12)' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                                <span className="text-xs font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                                  {book._count.memories} {book._count.memories === 1 ? 'memory' : 'memories'}
                                </span>
                              </div>
                            )}

                            {/* Contributor avatars */}
                            {book.contributors && book.contributors.length > 0 && (
                              <div className="flex items-center -space-x-1.5">
                                {book.contributors.slice(0, 3).map((c, ci) => (
                                  <div
                                    key={c.id}
                                    className="relative"
                                    style={{ zIndex: 3 - ci }}
                                  >
                                    <Avatar
                                      name={c.name}
                                      imageUrl={c.profile_image_url || null}
                                      size={20}
                                      className="border-2 border-white"
                                    />
                                  </div>
                                ))}
                                {book.contributors.length > 3 && (
                                  <span className="text-xs" style={{ marginLeft: 2, color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                                    +{book.contributors.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right side: updated time + arrow */}
                          <div className="flex items-center gap-3">
                            <p className="text-xs" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                              Updated {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
