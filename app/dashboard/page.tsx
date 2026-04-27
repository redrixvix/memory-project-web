'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/dropdown';
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
    backgroundColor: 'rgba(212,163,115,0.25)',
    color: '#4A4A3A',
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
  const [createError, setCreateError] = useState('');
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

  // Close modal on Escape
  useEffect(() => {
    if (!showCreate) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !creating) {
        setShowCreate(false);
        setCreateError('');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showCreate, creating]);

  const createBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Please enter a title for your book.');
      return;
    }
    setCreating(true);
    setCreateError('');
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
      } else {
        const err = await res.json().catch(() => ({}));
        setCreateError(err.error || 'Failed to create book. Please try again.');
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
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.94)', backdropFilter: 'blur(20px)', borderColor: 'rgba(212,163,115,0.15)' }}>
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
                  <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
                  <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-base font-medium tracking-tight hidden sm:block" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
            </Link>
          </div>

          {/* Center: Page indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bronze)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Dashboard</span>
          </div>

          {/* Right: User menu */}
          {user && (
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 cursor-pointer group">
                  <Avatar name={user.name} imageUrl={user.profileImageUrl || null} className="w-9 h-9" />
                  <svg className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" style={{ color: '#6A6A5A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              }
              align="right"
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--bronze)' }}>{user.name.split(' ')[0]}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>{user.email}</p>
              </div>
              <DropdownItem href="/dashboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
                Dashboard
              </DropdownItem>
              <DropdownItem href="/upgrade">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Upgrade plan
              </DropdownItem>
              <DropdownItem href="/settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleLogout} danger icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              }>
                Sign out
              </DropdownItem>
            </Dropdown>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="px-6 md:px-10 py-12 max-w-5xl mx-auto w-full">

        {/* Greeting + header */}
        <div className="mb-10">
          {user && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
              <Avatar
                name={user.name}
                imageUrl={user.profileImageUrl || null}
                className="w-14 h-14 shrink-0"
              />
              <div className="flex flex-col">
                <p className="label-caps mb-1.5" style={{ color: 'var(--bronze)' }}>
                  Welcome back
                </p>
                <h1 className="display-md mb-2" style={{ color: 'var(--charcoal)' }}>
                  Your Memory Books
                </h1>
                <p className="text-sm mb-5" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                  {user.name.endsWith('s') ? `${user.name}'` : `${user.name}'s`} collection — {books.length} {books.length === 1 ? 'book' : 'books'} in the library
                </p>
              </div>
            </div>
          )}

          {!user && (
            <h1 className="display-md mb-6" style={{ color: 'var(--charcoal)' }}>
              Your Memory Books
            </h1>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {books.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-1 rounded-full p-1 w-full sm:w-auto overflow-x-auto" style={{ backgroundColor: 'rgba(212,163,115,0.08)', border: '1px solid rgba(212,163,115,0.12)' }}>
                {([
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'alpha', label: 'A to Z' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSortOrder(value)}
                    className="rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 shrink-0"
                    style={{
                      backgroundColor: sortOrder === value ? 'var(--charcoal)' : 'transparent',
                      color: sortOrder === value ? 'var(--cornsilk)' : 'var(--charcoal)',
                      fontFamily: 'var(--font-sans)',
                      minWidth: '58px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <Button
              onClick={() => setShowCreate(true)}
              type="button"
              className="rounded-full shrink-0 h-12 px-7 text-sm font-medium transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Book
            </Button>
          </div>
        </div>

        {/* ── Create book modal ── */}
        {showCreate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-book-title"
          >
            {/* Backdrop — use opacity overlay instead of blur to avoid rendering artifacts on form elements */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(43,43,43,0.50)' }}
              onClick={() => { if (!creating) { setShowCreate(false); setCreateError(''); } }}
            />

            {/* Modal panel */}
            <div
              className="relative w-full max-w-lg rounded-3xl overflow-hidden animate-fade-up"
              style={{
                backgroundColor: '#FDFCF5',
                boxShadow: '0 40px 100px rgba(43,43,43,0.22), 0 12px 40px rgba(212,163,115,0.12)',
              }}
            >
              {/* Warm top bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: 'var(--bronze)' }} />

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2 id="create-book-title" className="text-2xl font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
                      Create a new memory book
                    </h2>
                    <p className="text-sm mt-1.5" style={{ color: '#6A6A5A' }}>Give it a name — you can always change it later.</p>
                  </div>
                  {!creating && (
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setCreateError(''); }}
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95 shrink-0 hover:bg-[rgba(212,163,115,0.2)]"
                      style={{ backgroundColor: 'rgba(212,163,115,0.18)', color: 'var(--charcoal)' }}
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>

                <form onSubmit={createBook} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-title" className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                      Book title <span style={{ color: 'var(--bronze)' }}>*</span>
                    </Label>
                    <Input
                      id="modal-title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => { setNewTitle(e.target.value); setCreateError(''); }}
                      required
                      autoFocus
                      placeholder="Ruth's Life Story"
                      className="rounded-xl text-base w-full h-12"
                      style={{ borderColor: 'rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8' }}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="modal-desc" className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                      Description <span className="font-normal opacity-50">(optional)</span>
                    </Label>
                    <Textarea
                      id="modal-desc"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="resize-none rounded-xl text-base w-full"
                      rows={3}
                      placeholder="A collection of memories from a wonderful life..."
                      style={{ borderColor: 'rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8' }}
                    />
                  </div>

                  {/* Plan selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                      Plan
                    </Label>
                    <div className="grid gap-3">
                      {BOOK_PLAN_OPTIONS.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setNewPlan(plan.id)}
                          className="rounded-2xl border px-5 py-4 text-left transition-all duration-200 relative"
                          style={{
                            backgroundColor: newPlan === plan.id ? '#FFFDF8' : 'rgba(212,163,115,0.04)',
                            borderColor: newPlan === plan.id ? 'var(--bronze)' : 'rgba(212,163,115,0.2)',
                            boxShadow: newPlan === plan.id ? '0 6px 20px rgba(212,163,115,0.14)' : 'none',
                            minHeight: '88px',
                          }}
                        >
                          {newPlan === plan.id && (
                            <div className="absolute right-4 top-4 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bronze)' }}>
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--charcoal)' }}>
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          )}
                          <div className="flex items-baseline gap-2">
                            <p className="label-caps" style={{ color: 'var(--bronze)' }}>{plan.label}</p>
                            <p className="text-base font-medium" style={{ color: 'var(--charcoal)' }}>{plan.price}</p>
                          </div>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6A6A5A' }}>
                            {plan.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {createError && (
                    <div
                      className="rounded-xl px-4 py-3 text-sm"
                      style={{ backgroundColor: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', color: '#7C2D12' }}
                    >
                      {createError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="flex-1 rounded-full h-12 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60"
                      style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                          Creating...
                        </>
                      ) : 'Create Book'}
                    </Button>
                    {!creating && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setShowCreate(false); setCreateError(''); }}
                        className="rounded-full h-12 px-6 text-sm font-medium"
                        style={{ borderColor: 'rgba(212,163,115,0.35)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {books.length === 0 && !showCreate ? (
          <div
            className="text-center py-24 animate-fade-up"
          >
            {/* Elegant empty-state illustration */}
            <div className="inline-block mb-12">
              <div
                className="relative mx-auto animate-float"
                style={{ width: 120, height: 160, animationDuration: '3s', animationDelay: '0.3s' }}
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
            <p className="text-base max-w-sm mx-auto leading-relaxed mb-10" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
              Every family has stories worth preserving. Create your first book and start capturing the moments that matter.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              type="button"
              className="rounded-full h-12 px-8 text-sm font-medium"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create your first book
            </Button>
            <p className="text-xs mt-6 max-w-xs mx-auto leading-relaxed" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
              Takes about 5 minutes — and it&apos;s free to start.
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
                      className="relative h-full rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500"
                      style={{
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 4px 20px rgba(212,163,115,0.10), 0 1px 6px rgba(212,163,115,0.06)',
                        borderLeft: `5px solid ${BOOK_COLORS[book.id % BOOK_COLORS.length]}`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 28px 72px rgba(212,163,115,0.22), 0 8px 28px rgba(212,163,115,0.12)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(212,163,115,0.08), 0 1px 3px rgba(212,163,115,0.04)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Subtle warm overlay on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(212,163,115,0.03) 0%, rgba(204,213,174,0.04) 50%, transparent 100%)' }}
                      />
                      {/* Mini book cover visual */}
                      <div
                        className="absolute hidden md:flex"
                        style={{
                          right: 24,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 60,
                          height: 82,
                          borderRadius: 8,
                          background: `linear-gradient(160deg, #FDFCF5 0%, #F8F5E8 55%, #F0EBD5 100%)`,
                          border: '1px solid rgba(212,163,115,0.35)',
                          boxShadow: '3px 4px 12px rgba(43,43,43,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.6)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Mini spine */}
                        <div style={{
                          position: 'absolute',
                          left: 0, top: 0, bottom: 0,
                          width: 5,
                          background: `linear-gradient(to right, ${BOOK_COLORS[book.id % BOOK_COLORS.length]}aa, ${BOOK_COLORS[book.id % BOOK_COLORS.length]}44)`,
                          borderRadius: '8px 0 0 8px',
                        }} />
                        {/* Cover content */}
                        <div className="pt-4 px-3 pl-3">
                          <div style={{ height: 1, backgroundColor: 'rgba(212,163,115,0.28)', marginBottom: 6 }} />
                          {[1,2,3,4].map((_, li) => (
                            <div key={li} style={{
                              height: 2.5,
                              width: `${55 + li * 10}%`,
                              backgroundColor: li % 2 === 0 ? 'rgba(212,163,115,0.25)' : 'rgba(204,213,174,0.38)',
                              borderRadius: 2,
                              marginBottom: 4,
                            }} />
                          ))}
                          {/* Small title line */}
                          <div style={{
                            height: 3,
                            width: '75%',
                            backgroundColor: `${BOOK_COLORS[book.id % BOOK_COLORS.length]}66`,
                            borderRadius: 2,
                            marginTop: 8,
                          }} />
                        </div>
                      </div>
                      <CardContent className="p-8 pr-24 md:pr-28" style={{ paddingLeft: 28 }}>
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
                                  {book._count.memories === 0
                                    ? 'Start adding memories'
                                    : `${book._count.memories} ${book._count.memories === 1 ? 'memory' : 'memories'}`}
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
                              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                              style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
                            >
                              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
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
