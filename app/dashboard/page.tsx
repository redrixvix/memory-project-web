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
  const [showFab, setShowFab] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const BOOKS_PER_PAGE = 12;

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

  // Show FAB when scrolling past the header section
  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Reset to page 1 whenever the filtered list changes — must be before early return
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

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
          {/* Auth loading skeleton — warm shimmer that matches dashboard layout */}
          <div className="mb-10">
            <div className="h-9 w-56 rounded-xl mb-2 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
            <div className="h-4 w-40 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl p-6 flex items-center gap-5" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.12)' }}>
                <div className="w-12 h-18 rounded-xl shrink-0 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.20)' }} />
                <div className="flex-1 space-y-2.5">
                  <div className="h-5 w-48 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                  <div className="h-3 w-32 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes skeleton-shimmer {
            0% { opacity: 0.45; }
            50% { opacity: 0.85; }
            100% { opacity: 0.45; }
          }
          .skeleton-pulse { animation: skeleton-shimmer 1.8s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // Filter books by search query
  const filteredBooks = searchQuery.trim()
    ? books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : books;

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBooks = filteredBooks
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortOrder === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return a.title.localeCompare(b.title);
    })
    .slice((safePage - 1) * BOOKS_PER_PAGE, safePage * BOOKS_PER_PAGE);

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
      <main className="px-6 md:px-10 pt-6 pb-10 max-w-5xl mx-auto w-full">

        {/* Header row — compact, editorial */}
        <div className="mb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-0.5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                Your Library
              </h1>
              <p className="text-sm" style={{ color: '#5A5A4A', fontFamily: 'var(--font-serif)' }}>
                {filteredBooks.length === 0
                  ? 'Your stories are waiting to be captured.'
                  : `${filteredBooks.length} ${filteredBooks.length === 1 ? 'book' : 'books'}${searchQuery ? ` matching "${searchQuery}"` : ''}${totalPages > 1 ? ` · page ${safePage} of ${totalPages}` : ''}`}
              </p>
            </div>
            {books.length > 0 && (
              <Button
                onClick={() => setShowCreate(true)}
                type="button"
                className="rounded-full shrink-0 h-11 px-6 text-sm font-semibold transition-all duration-300 active:scale-95 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(212,163,115,0.3)] hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', boxShadow: '0 4px 20px rgba(212,163,115,0.25)' }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                New Book
              </Button>
            )}
          </div>

          {/* Search + sort — only shown when books exist */}
          {books.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8A8A7A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your books..."
                  className="w-full h-11 pl-10 pr-4 rounded-2xl text-sm outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(255,253,246,0.92)',
                    border: '1.5px solid rgba(212,163,115,0.30)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.65)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.12)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.30)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ color: '#7A7A6A', backgroundColor: 'rgba(212,163,115,0.1)' }}
                    aria-label="Clear search"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
              {/* Sort controls */}
              <div className="flex items-center gap-1 rounded-2xl p-1.5 shrink-0" style={{ backgroundColor: 'rgba(255,253,246,0.92)', border: '1px solid rgba(212,163,115,0.18)' }}>
                {([
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'alpha', label: 'A–Z' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSortOrder(value)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 shrink-0"
                    style={{
                      backgroundColor: sortOrder === value ? 'var(--bronze)' : 'transparent',
                      color: sortOrder === value ? 'var(--charcoal)' : '#7A7A6A',
                      fontFamily: 'var(--font-sans)',
                      minWidth: '50px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              className="relative w-full max-w-lg rounded-3xl overflow-hidden animate-fade-up flex flex-col"
              style={{
                maxHeight: '90vh',
                backgroundColor: '#FDFCF5',
                boxShadow: '0 40px 100px rgba(43,43,43,0.22), 0 12px 40px rgba(212,163,115,0.12)',
              }}
            >
              {/* Warm top bar */}
              <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: 'var(--bronze)' }} />

              {/* Scrollable content area */}
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 id="create-book-title" className="text-xl font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
                      Create a new memory book
                    </h2>
                    <p className="text-sm mt-1" style={{ color: '#6A6A5A' }}>Give it a name — you can always change it later.</p>
                  </div>
                  {!creating && (
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setCreateError(''); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95 shrink-0 hover:bg-[rgba(212,163,115,0.2)]"
                      style={{ backgroundColor: 'rgba(212,163,115,0.18)', color: 'var(--charcoal)' }}
                      aria-label="Close"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>

                <form id="create-book-form" onSubmit={createBook} className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
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
                      className="rounded-xl text-base w-full h-11"
                      style={{ borderColor: 'rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8' }}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-desc" className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                      Description <span className="font-normal opacity-50">(optional)</span>
                    </Label>
                    <Textarea
                      id="modal-desc"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="resize-none rounded-xl text-base w-full"
                      rows={2}
                      placeholder="A collection of memories from a wonderful life..."
                      style={{ borderColor: 'rgba(212,163,115,0.35)', backgroundColor: '#FFFDF8' }}
                    />
                  </div>

                  {/* Plan selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                      Plan
                    </Label>
                    <div className="grid gap-2">
                      {BOOK_PLAN_OPTIONS.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setNewPlan(plan.id)}
                          className="rounded-2xl border px-4 py-2 text-left transition-all duration-200 relative"
                          style={{
                            backgroundColor: newPlan === plan.id ? '#FFFDF8' : 'rgba(212,163,115,0.04)',
                            borderColor: newPlan === plan.id ? 'var(--bronze)' : 'rgba(212,163,115,0.2)',
                            boxShadow: newPlan === plan.id ? '0 4px 16px rgba(212,163,115,0.14)' : 'none',
                          }}
                        >
                          {newPlan === plan.id && (
                            <div className="absolute right-3 top-3 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bronze)' }}>
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--charcoal)' }}>
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          )}
                          <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                            <p className="label-caps text-sm" style={{ color: 'var(--bronze)' }}>{plan.label}</p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>{plan.price}</p>
                            {plan.id === 'free' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(204,213,174,0.2)', color: '#5F6650' }}>Free</span>
                            )}
                            {plan.id === 'premium' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: '#6A6A5A' }}>One-time</span>
                            )}
                            {plan.id === 'plus' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: '#6A6A5A' }}>One-time</span>
                            )}
                          </div>
                          <div className="space-y-0">
                            {(plan.id === 'free' ? [
                              'Unlimited text memories',
                              'Basic guided prompts',
                              'One book, print from $99',
                            ] : plan.id === 'premium' ? [
                              'Everything in Free',
                              '5GB photo & audio storage',
                              'Printed books, family sharing',
                            ] : [
                              'Everything in Premium',
                              '15GB storage, priority support',
                              'Largest print runs',
                            ]).map((feat, fi) => (
                              <div key={fi} className="flex items-center gap-1.5">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: plan.id === 'free' && fi > 2 ? '#9A9A7A' : 'var(--bronze)', opacity: plan.id === 'free' && fi > 2 ? 0.5 : 1 }}>
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                                <span className="text-xs" style={{ color: plan.id === 'free' && fi > 2 ? '#9A9A7A' : '#6A6A5A' }}>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {createError && (
                    <div
                      className="rounded-xl px-4 py-3 text-sm"
                      style={{ backgroundColor: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.25)', color: '#6B3A2A' }}
                    >
                      {createError}
                    </div>
                  )}
                </form>
              </div>

              {/* Sticky footer with actions */}
              <div className="shrink-0 px-6 py-5 border-t" style={{ borderColor: 'rgba(212,163,115,0.12)', backgroundColor: '#FDFCF5' }}>
                <div className="flex gap-3">
                  {!creating && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowCreate(false); setCreateError(''); }}
                      className="rounded-full h-11 px-6 text-sm font-medium"
                      style={{ borderColor: 'rgba(212,163,115,0.35)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    form="create-book-form"
                    disabled={creating || !newTitle.trim()}
                    className="flex-1 rounded-full h-11 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: creating ? 'rgba(212,163,115,0.5)' : 'var(--bronze)', color: 'var(--charcoal)', boxShadow: !creating && newTitle.trim() ? '0 4px 16px rgba(212,163,115,0.25)' : 'none' }}
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                        Creating...
                      </>
                    ) : 'Create Book'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state — editorial card style ── */}
        {books.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
            {/* Elegant book illustration */}
            <div className="relative mb-10" style={{ width: 100, height: 130 }}>
              <div className="absolute inset-0 rounded-2xl" style={{
                backgroundColor: '#FDFCF5',
                border: '1.5px solid rgba(212,163,115,0.28)',
                boxShadow: '0 12px 40px rgba(212,163,115,0.14), 4px 6px 0 rgba(212,163,115,0.10)',
                transform: 'rotate(-2deg)',
              }}>
                <div className="absolute left-0 top-0 bottom-0 rounded-l-2xl" style={{ width: 8, backgroundColor: 'var(--bronze)', opacity: 0.55 }} />
                <div className="pt-5 px-4 pl-5">
                  <div className="h-px mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
                  {[1,2,3].map((_, i) => (
                    <div key={i} className="rounded-full mb-2.5" style={{
                      height: 2.5,
                      width: `${50 + i * 15}%`,
                      backgroundColor: i % 2 === 0 ? 'rgba(212,163,115,0.22)' : 'rgba(204,213,174,0.4)',
                    }} />
                  ))}
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-medium tracking-tight mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
              Your library is empty
            </h2>
            <p className="text-base max-w-sm mx-auto leading-relaxed mb-8 text-center" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
              Every family has stories worth preserving. Create your first book and start capturing the moments that matter.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              type="button"
              className="rounded-full h-12 px-8 text-sm font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:shadow-[rgba(212,163,115,0.3)] active:scale-95"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', boxShadow: '0 4px 20px rgba(212,163,115,0.25)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create your first book
            </Button>
            <p className="text-xs mt-5 max-w-xs mx-auto leading-relaxed text-center" style={{ color: '#8A8A7A', fontFamily: 'var(--font-sans)' }}>
              Free to start — takes about 5 minutes.
            </p>
          </div>
        ) : (
          /* ── Book grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedBooks.map((book, i) => {
              const lastUpdated = book.updated_at || book.created_at;
              return (
                <div
                  key={book.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <Link href={`/books/${book.id}`} className="block h-full group">
                    <div
                      className="book-card relative h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group/card hover:-translate-y-1.5"
                      style={{
                        backgroundColor: '#FFFDF8',
                        boxShadow: '0 2px 8px rgba(212,163,115,0.07), 0 8px 24px rgba(212,163,115,0.09), 0 20px 48px rgba(212,163,115,0.05)',
                        border: '1px solid rgba(212,163,115,0.10)',
                        borderLeft: `5px solid ${BOOK_COLORS[book.id % BOOK_COLORS.length]}`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,163,115,0.12), 0 16px 40px rgba(212,163,115,0.14), 0 32px 72px rgba(212,163,115,0.07)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(212,163,115,0.07), 0 8px 24px rgba(212,163,115,0.09), 0 20px 48px rgba(212,163,115,0.05)'; }}
                    >
                      {/* Subtle warm overlay on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(212,163,115,0.025) 0%, rgba(204,213,174,0.035) 50%, transparent 100%)' }}
                      />
                      {/* Mini book cover visual — refined */}
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
                          border: '1px solid rgba(212,163,115,0.30)',
                          boxShadow: '2px 3px 10px rgba(43,43,43,0.09), 4px 6px 20px rgba(212,163,115,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.7)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Mini spine */}
                        <div style={{
                          position: 'absolute',
                          left: 0, top: 0, bottom: 0,
                          width: 5,
                          background: `linear-gradient(to right, ${BOOK_COLORS[book.id % BOOK_COLORS.length]}cc, ${BOOK_COLORS[book.id % BOOK_COLORS.length]}33)`,
                          borderRadius: '8px 0 0 8px',
                        }} />
                        {/* Cover content */}
                        <div className="pt-4 px-3 pl-3">
                          <div style={{ height: 1, backgroundColor: 'rgba(212,163,115,0.25)', marginBottom: 6 }} />
                          {[1,2,3,4].map((_, li) => (
                            <div key={li} style={{
                              height: 2.5,
                              width: `${55 + li * 10}%`,
                              backgroundColor: li % 2 === 0 ? 'rgba(212,163,115,0.22)' : 'rgba(204,213,174,0.38)',
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
                      <CardContent className="p-6 pr-24 md:pr-28" style={{ paddingLeft: 28 }}>
                        {/* Title + plan badge */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-xl font-medium leading-snug" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                            {book.title}
                          </h3>
                          {book.plan && book.plan !== 'free' && (
                            <span
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                              style={getPlanBadgeStyles(book.plan)}
                            >
                              {getBookPlanLabel(book.plan, book.storage_tier)}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {book.description ? (
                          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: '#4A4A3A', fontFamily: 'var(--font-serif)' }}>
                            {book.description}
                          </p>
                        ) : (
                          <p className="text-sm leading-relaxed mb-4 italic" style={{ color: '#8A8A7A', fontFamily: 'var(--font-serif)' }}>
                            No description yet — begin your story
                          </p>
                        )}

                        {/* Footer row */}
                        <div className="flex items-center justify-end" style={{ paddingBottom: 2 }}>
                          <div
                            className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 group-hover:gap-3"
                            style={{ 
                              backgroundColor: book._count?.memories === 0 ? 'rgba(212,163,115,0.15)' : 'rgba(212,163,115,0.08)',
                              border: book._count?.memories === 0 ? '1px dashed rgba(212,163,115,0.35)' : '1px solid rgba(212,163,115,0.08)',
                            }}
                          >
                            <span className="text-xs font-medium" style={{ 
                              color: book._count?.memories === 0 ? 'var(--bronze)' : '#7A7A6A', 
                              fontFamily: 'var(--font-sans)',
                              fontStyle: book._count?.memories === 0 ? 'italic' : 'normal',
                            }}>
                              {book._count?.memories === 0
                                ? 'Start writing'
                                : `${book._count?.memories ?? 0} ${book._count?.memories === 1 ? 'memory' : 'memories'}`}
                            </span>
                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
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

          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-35 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: 'var(--charcoal)' }}
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className="w-9 h-9 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: currentPage === page ? 'var(--charcoal)' : 'rgba(212,163,115,0.10)',
                  color: currentPage === page ? 'var(--cornsilk)' : 'var(--charcoal)',
                }}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-35 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: 'var(--charcoal)' }}
              aria-label="Next page"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
      </main>

      {/* Floating Action Button - New Book (appears on scroll) */}
      {showFab && (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="fixed bottom-7 right-7 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95 animate-fade-up hover:shadow-2xl"
          style={{
            backgroundColor: 'var(--bronze)',
            color: 'var(--charcoal)',
            boxShadow: '0 8px 32px rgba(212,163,115,0.35), 0 0 0 0 rgba(212,163,115,0.4)',
          }}
          aria-label="Create new book"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      )}
    </div>
  );
}
