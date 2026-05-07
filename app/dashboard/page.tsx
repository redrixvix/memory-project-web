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
import { BOOK_PLAN_OPTIONS, type BookPlan, getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';
import { MobileNav } from '@/components/ui/mobile-nav';
import { BookCover } from '@/components/ui/book-cover';
import { getDisplayBookTitle, titleWasSanitized } from '@/lib/display-book-title';

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
  latest_memory_excerpt?: string | null;
  latest_contributor_name?: string | null;
  preview_photo_url?: string | null;
  _count?: { memories: number };
  contributors?: {id: number, name: string, profile_image_url: string, google_id: string}[];
}

function shortenMemoryExcerpt(excerpt?: string | null) {
  if (!excerpt) return null;
  const compact = excerpt.replace(/\s+/g, ' ').trim();
  if (!compact) return null;
  return compact.length > 110 ? `${compact.slice(0, 107).trimEnd()}…` : compact;
}

function shortenShelfNote(copy?: string | null, maxLength = 88) {
  if (!copy) return null;
  const compact = copy.replace(/\s+/g, ' ').trim();
  if (!compact) return null;
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1).trimEnd()}…` : compact;
}

interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  googleId?: string | null;
}

type ShelfFilter = 'all' | 'active' | 'drafts' | 'shared';

const BOOK_COLORS = [
  'var(--bronze)',
  'var(--tea-green)',
  'var(--papaya)',
  'rgba(139,90,43,0.82)',  // fixed: was rgba(212,163,115,0.5) — dark sienna replaces washed-out bronze
  '#B8860B',
  '#6B8E23',
  '#8B4513',
  '#556B2F',
  '#D2691E',
];

// Actual rgba values for inline style use (matches BOOK_COLORS index)
const BOOK_SPINE_COLORS = [
  'rgba(212,163,115,0.85)', // bronze
  'rgba(204,213,174,0.90)', // tea-green
  'rgba(239,214,168,0.90)', // papaya
  'rgba(139,90,43,0.92)',   // fixed: was 0.55 — dark sienna spine
  'rgba(184,134,11,0.85)',  // dark gold
  'rgba(107,142,35,0.85)',  // olive
  'rgba(139,69,19,0.85)',   // sienna
  'rgba(85,107,47,0.85)',   // dark olive
  'rgba(210,105,30,0.85)', // chocolate
];
const BOOK_SPINE_HOVER_COLORS = [
  'rgba(212,163,115,1.0)',
  'rgba(204,213,174,1.0)',
  'rgba(239,214,168,1.0)',
  'rgba(212,163,115,0.75)',
  'rgba(184,134,11,1.0)',
  'rgba(107,142,35,1.0)',
  'rgba(139,69,19,1.0)',
  'rgba(85,107,47,1.0)',
  'rgba(210,105,30,1.0)',
];

function getPlanBadgeStyles(plan: string) {
  const normalizedPlan = normalizeBookPlan(plan);

  if (normalizedPlan === 'plus') {
    return {
      backgroundColor: '#2D4A35',
      color: '#E8F0E5',
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
  const [newPlan, setNewPlan] = useState<BookPlan>('premium');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alpha'>('newest');
  const [showFab, setShowFab] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shelfFilter, setShelfFilter] = useState<ShelfFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const BOOKS_PER_PAGE = 18;

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
        setUser({
          id: userData.user.id,
          name: userData.user.name,
          email: userData.user.email,
          profileImageUrl: userData.user.profile_image_url || null,
          googleId: userData.user.google_id || null,
        });

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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
        <header className="sticky top-0 z-20 h-12 md:h-14 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.94)', backdropFilter: 'blur(20px)', borderColor: 'rgba(212,163,115,0.15)' }}>
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.16)' }} />
              <div className="hidden sm:block h-4 w-28 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
            </div>
            <div className="hidden md:block h-4 w-24 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
            <div className="h-9 w-9 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.16)' }} />
          </div>
        </header>

        <main className="px-6 md:px-10 pt-5 md:pt-8 pb-10 max-w-6xl mx-auto w-full">
          <div className="mb-5 md:mb-8 relative">
            <div
              className="absolute -top-2 left-0 right-0 h-px rounded-full overflow-hidden"
              style={{ background: 'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.25) 20%, rgba(212,163,115,0.25) 80%, transparent 100%)' }}
            />
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="h-10 w-56 rounded-2xl mb-2 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                <div className="h-4 w-44 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
              </div>
              <div className="hidden sm:block h-11 w-32 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
              <div className="flex-1 h-12 rounded-2xl skeleton-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(212,163,115,0.12)' }} />
              <div className="h-12 w-40 rounded-2xl skeleton-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.55)', border: '1px solid rgba(212,163,115,0.12)' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 xl:gap-7">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="rounded-[30px] overflow-hidden min-h-[228px] md:min-h-[252px]"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,253,247,0.98) 0%, rgba(250,244,233,0.98) 100%)',
                  boxShadow: '0 6px 16px rgba(212,163,115,0.08), 0 20px 44px rgba(43,43,43,0.05)',
                  border: '1px solid rgba(212,163,115,0.16)',
                }}
              >
                <div className="p-4 md:p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-18 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.16)' }} />
                      <div className="h-6 w-20 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-12 rounded-full skeleton-pulse ml-auto" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                      <div className="h-3 w-14 rounded-full skeleton-pulse ml-auto" style={{ backgroundColor: 'rgba(212,163,115,0.16)' }} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-h-0">
                    <div className="shrink-0 rounded-[20px] p-2 md:rounded-[22px] md:p-2.5" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(250,237,205,0.46) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.82), 0 10px 24px rgba(212,163,115,0.12)' }}>
                      <div className="w-[84px] h-[118px] rounded-[16px] skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2.5 pt-1">
                      <div className="h-5 w-4/5 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                      <div className="h-5 w-3/5 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
                      <div className="h-4 w-full rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
                      <div className="h-4 w-11/12 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="h-7 w-24 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
                        <div className="h-7 w-28 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-5 rounded-[20px] md:rounded-[22px] px-4 py-3 flex items-center justify-between gap-3" style={{ background: 'linear-gradient(180deg, rgba(255,250,240,0.96) 0%, rgba(248,239,224,0.96) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75), 0 8px 18px rgba(212,163,115,0.12)', border: '1px solid rgba(212,163,115,0.18)' }}>
                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-28 rounded-full skeleton-pulse mb-2" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
                      <div className="h-4 w-full rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
                    </div>
                    <div className="h-8 w-24 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.16)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

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

  // Filter books by search query, then let the shelf view narrow the moment that needs attention.
  const searchFilteredBooks = searchQuery.trim()
    ? books.filter(book =>
        getDisplayBookTitle(book.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : books;

  const shelfCounts = {
    all: searchFilteredBooks.length,
    active: searchFilteredBooks.filter((book) => (book._count?.memories ?? 0) > 0).length,
    drafts: searchFilteredBooks.filter((book) => (book._count?.memories ?? 0) === 0).length,
    shared: searchFilteredBooks.filter((book) => (book.contributors?.length ?? 0) > 1).length,
  };

  const filteredBooks = searchFilteredBooks.filter((book) => {
    if (shelfFilter === 'active') return (book._count?.memories ?? 0) > 0;
    if (shelfFilter === 'drafts') return (book._count?.memories ?? 0) === 0;
    if (shelfFilter === 'shared') return (book.contributors?.length ?? 0) > 1;
    return true;
  });

  const sortedBooks = filteredBooks
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortOrder === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return getDisplayBookTitle(a.title).localeCompare(getDisplayBookTitle(b.title));
    });

  const activeBooks = sortedBooks.filter((book) => (book._count?.memories ?? 0) > 0);
  const draftBooks = sortedBooks.filter((book) => (book._count?.memories ?? 0) === 0);
  const featuredBook = activeBooks[0] ?? sortedBooks[0] ?? null;
  const featuredQueue = featuredBook
    ? [
        ...activeBooks.filter((book) => book.id !== featuredBook.id),
        ...draftBooks.filter((book) => book.id !== featuredBook.id),
      ].slice(0, 3)
    : [];

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / BOOKS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBooks = sortedBooks.slice((safePage - 1) * BOOKS_PER_PAGE, safePage * BOOKS_PER_PAGE);
  const shelfFilterMeta: Record<ShelfFilter, { label: string; empty: string; summary: string }> = {
    all: {
      label: 'All books',
      empty: 'No books match this search yet.',
      summary: 'A full shelf with every keepsake and draft in one place.',
    },
    active: {
      label: 'Continue writing',
      empty: 'Nothing has memories yet — start a draft and this lane will light up.',
      summary: 'Books with real stories inside, ready to pick back up.',
    },
    drafts: {
      label: 'Needs first page',
      empty: 'Every draft already has a first memory — a nice problem to have.',
      summary: 'Quietly titled books still waiting for the first scene.',
    },
    shared: {
      label: 'Family voices',
      empty: 'No shared keepsakes in this view yet.',
      summary: 'Books that already carry more than one family perspective.',
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-12 md:h-14 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.94)', backdropFilter: 'blur(20px)', borderColor: 'rgba(212,163,115,0.15)' }}>
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ color: '#8A6A4A' }}>
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
                  <Avatar name={user.name} imageUrl={user.profileImageUrl || null} className="w-8 h-8 md:w-9 md:h-9" />
                  <svg className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 hidden sm:block" style={{ color: '#6A6A5A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              }
              align="right"
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--bronze)' }}>{(user.name || 'User').split(' ')[0]}</p>
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

          {/* Mobile hamburger */}
          <button
            className="flex sm:hidden w-9 h-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'rgba(212,163,115,0.15)', color: '#5A3A2A' }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} loggedIn={loggedIn === true} />

      {/* ── MAIN CONTENT ── */}
      <main className="px-6 md:px-10 pt-5 md:pt-8 pb-10 max-w-6xl mx-auto w-full">

        {/* Header row — compact, editorial */}
        <div className="mb-5 md:mb-8 relative">
          {/* Decorative warm accent — subtle top line */}
          <div
            className="absolute -top-2 left-0 right-0 h-px rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.25) 20%, rgba(212,163,115,0.25) 80%, transparent 100%)' }}
          />
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="display-md font-medium tracking-tight mb-0.5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                Your Library
              </h1>
              <p className="text-sm" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
                {filteredBooks.length === 0
                  ? shelfFilterMeta[shelfFilter].empty
                  : `${filteredBooks.length} ${filteredBooks.length === 1 ? 'book' : 'books'} in ${shelfFilterMeta[shelfFilter].label.toLowerCase()}${searchQuery ? ` matching "${searchQuery}"` : ''}${totalPages > 1 ? ` · page ${safePage} of ${totalPages}` : ''}`}
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
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {([
                  {
                    value: 'all',
                    kicker: 'Full shelf',
                    icon: '<path d="M4 6h16M4 10h16M4 14h10"/>',
                    count: shelfCounts.all,
                    description: 'See every keepsake at once.',
                  },
                  {
                    value: 'active',
                    kicker: 'Continue writing',
                    icon: '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
                    count: shelfCounts.active,
                    description: 'Jump back into books that already hold memories.',
                  },
                  {
                    value: 'drafts',
                    kicker: 'Needs first page',
                    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>',
                    count: shelfCounts.drafts,
                    description: 'Drafts still waiting for their opening scene.',
                  },
                  {
                    value: 'shared',
                    kicker: 'Family voices',
                    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
                    count: shelfCounts.shared,
                    description: 'Books with more than one contributor.',
                  },
                ] as const).map(({ value, kicker, count, description, icon }) => {
                  const selected = shelfFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setShelfFilter(value);
                        setCurrentPage(1);
                      }}
                      className="group relative rounded-[1.4rem] px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: selected
                          ? 'linear-gradient(160deg, rgba(255,253,246,0.99) 0%, rgba(250,241,222,0.99) 100%)'
                          : 'rgba(255,252,245,0.88)',
                        border: selected ? '1.5px solid rgba(212,163,115,0.50)' : '1.5px solid rgba(212,163,115,0.14)',
                        boxShadow: selected
                          ? '0 16px 40px rgba(212,163,115,0.16), 0 4px 12px rgba(212,163,115,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(212,163,115,0.04)'
                          : '0 2px 8px rgba(212,163,115,0.05), inset 0 1px 0 rgba(255,255,255,0.6)',
                        minWidth: '13rem',
                      }}
                      aria-pressed={selected}
                    >
                      {/* Gold accent line on active - like gilt edge of a book */}
                      {selected && (
                        <div className="absolute left-0 right-0 top-0 h-0.5 rounded-t-[1.4rem]" style={{ background: 'linear-gradient(90deg, rgba(212,163,115,0.0) 0%, rgba(212,163,115,0.75) 20%, rgba(212,163,115,0.55) 80%, rgba(212,163,115,0.0) 100%)' }} />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0"
                            style={{
                              backgroundColor: selected ? 'rgba(212,163,115,0.15)' : 'rgba(212,163,115,0.06)',
                              transform: selected ? 'scale(1.08)' : 'none',
                              boxShadow: selected ? 'inset 0 1px 0 rgba(255,255,255,0.8)' : 'none',
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              style={{ color: selected ? '#6B4423' : '#8B7055' }}
                            >
                              {icon}
                            </svg>
                          </div>
                          <div>
                            <p className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase" style={{ color: selected ? '#5C3D25' : '#7A6A50', fontFamily: 'var(--font-serif)' }}>
                              {kicker}
                            </p>
                            <p className="mt-1.5 text-[0.78rem] leading-5" style={{ color: '#4F3C2F', fontFamily: 'var(--font-sans)' }}>
                              {description}
                            </p>
                          </div>
                        </div>
                        {/* Elegant count - like a folio number */}
                        <div className="flex flex-col items-end shrink-0 mt-0.5">
                          <span 
                            className="text-[0.7rem] font-semibold tabular-nums tracking-tight" 
                            style={{ 
                              color: selected ? '#8A6A3C' : '#9A8A70',
                              fontFamily: 'var(--font-serif)',
                              opacity: count > 0 ? 1 : 0.4,
                            }}
                          >
                            {count}
                          </span>
                          <span className="text-[0.55rem] uppercase tracking-[0.12em] mt-0.5" style={{ color: '#A09080', fontFamily: 'var(--font-sans)' }}>
                            {count === 1 ? 'vol.' : 'vols.'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[1.5rem] px-4 py-3.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" style={{ background: 'linear-gradient(160deg, rgba(255,253,246,0.95) 0%, rgba(248,240,226,0.95) 100%)', border: '1px solid rgba(212,163,115,0.18)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(212,163,115,0.05)' }}>
                <p className="text-sm leading-6" style={{ color: '#4A3728', fontFamily: 'var(--font-serif)' }}>
                  <span className="font-semibold" style={{ color: '#24180F' }}>{shelfFilterMeta[shelfFilter].label}</span>
                  <span style={{ color: '#7A6A55' }}> — {shelfFilterMeta[shelfFilter].summary}</span>
                </p>
                <p className="text-[0.7rem] uppercase tracking-[0.14em]" style={{ color: '#8B7055', fontFamily: 'var(--font-serif)' }}>
                  {filteredBooks.length > 0 ? `${filteredBooks.length} ready to browse` : 'Adjust search or start a new book'}
                </p>
              </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--bronze)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search your books..."
                  className="w-full h-11 pl-11 pr-10 rounded-2xl text-sm outline-none transition-all duration-200 bg-transparent placeholder:text-[#4A4A3A]"
                  style={{
                    backgroundColor: 'rgba(255,253,246,0.92)',
                    border: '1.5px solid rgba(212,163,115,0.30)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 1px 4px rgba(212,163,115,0.06)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.65)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.08), 0 2px 12px rgba(212,163,115,0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.30)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(212,163,115,0.06)'; }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
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
              <div className="flex items-center gap-1.5 rounded-2xl px-3 py-2 shrink-0 lg:justify-self-end" style={{ backgroundColor: 'rgba(255,253,246,0.92)', border: '1.5px solid rgba(212,163,115,0.18)', boxShadow: '0 1px 4px rgba(212,163,115,0.06)' }}>
                <svg className="w-3 h-3 mr-1" style={{ color: '#8B6E58' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M6 12h12M9 18h6"/>
                </svg>
                {([
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'alpha', label: 'A–Z' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSortOrder(value);
                      setCurrentPage(1);
                    }}
                    className="rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0"
                    style={{
                      backgroundColor: sortOrder === value ? 'var(--bronze)' : 'rgba(212,163,115,0.10)',
                      color: sortOrder === value ? 'var(--charcoal)' : '#6A5A4A',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: '600',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
            {/* Backdrop — darker scrim for better focus + contrast */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(43,43,43,0.62)' }}
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                        Plan
                      </Label>
                      <span className="text-xs" style={{ color: '#7A7A6A' }}>— select below</span>
                    </div>
                    <div className="grid gap-3">
                      {BOOK_PLAN_OPTIONS.map((plan) => {
                        const isSelected = newPlan === plan.id;
                        const isRecommended = plan.id === 'premium';
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setNewPlan(plan.id)}
                            className="rounded-2xl border px-5 py-4 text-left transition-all duration-200 relative hover:-translate-y-0.5"
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(212,163,115,0.08)'
                                : isRecommended
                                  ? 'linear-gradient(135deg, rgba(204,213,174,0.12) 0%, rgba(212,163,115,0.06) 100%)'
                                  : 'rgba(212,163,115,0.02)',
                              borderColor: isSelected ? 'var(--bronze)' : isRecommended ? 'rgba(204,213,174,0.45)' : 'rgba(212,163,115,0.2)',
                              borderWidth: isSelected || isRecommended ? '2px' : '1px',
                              boxShadow: isSelected
                                ? '0 6px 28px rgba(212,163,115,0.22)'
                                : isRecommended
                                  ? '0 2px 12px rgba(204,213,174,0.18)'
                                  : '0 1px 4px rgba(212,163,115,0.06)',
                            }}
                          >
                            {/* Recommended / popular badge */}
                            {(isRecommended) && (
                              <div
                                className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: isRecommended ? '#567C3B' : 'var(--bronze)',
                                  color: isRecommended ? '#FDFCF5' : 'var(--charcoal)',
                                  fontFamily: 'var(--font-sans)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                }}
                              >
                                {isRecommended ? '✓ Recommended' : '★ Most popular'}
                              </div>
                            )}

                            {/* Checkmark for selected */}
                            {isSelected && !isRecommended && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bronze)' }}>
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--charcoal)' }}>
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              </div>
                            )}

                            <div className="flex items-baseline gap-2 flex-wrap pr-7 mt-1">
                              <p className="text-sm font-bold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{plan.label}</p>
                              <p className="text-sm font-bold" style={{ color: 'var(--bronze)' }}>{plan.price}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#5A5A4A', fontFamily: 'var(--font-sans)' }}>
                                {plan.id === 'free' ? 'Free forever' : plan.id === 'premium' ? 'Lifetime' : 'Lifetime'}
                              </span>
                            </div>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
                              {plan.id === 'free' && 'Unlimited text memories — free to start'}
                              {plan.id === 'premium' && '5GB photo & audio, printed books, family sharing'}
                              {plan.id === 'plus' && '15GB storage, priority support, largest print runs'}
                            </p>
                            <div className="mt-2.5 space-y-1">
                              {(plan.id === 'free' ? [
                                'Unlimited text memories',
                                'Basic guided prompts',
                                'One memory book',
                              ] : plan.id === 'premium' ? [
                                'Everything in Free',
                                '5GB photo & audio storage',
                                'Printed books from $99',
                              ] : [
                                'Everything in Premium',
                                '15GB photo & audio storage',
                                'Priority support',
                              ]).map((feat, fi) => (
                                <div key={fi} className="flex items-center gap-1.5">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--bronze)' }}>
                                    <path d="M20 6L9 17l-5-5"/>
                                  </svg>
                                  <span className="text-xs" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </button>
                        );
                      })}
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
                    className="flex-1 rounded-full h-12 text-sm font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 hover:shadow-xl hover:shadow-[rgba(212,163,115,0.45)] hover:-translate-y-0.5"
                    style={{
                      backgroundColor: creating ? 'rgba(158,120,69,0.65)' : !newTitle.trim() ? 'rgba(158,120,69,0.62)' : '#8A6A3C',
                      color: !newTitle.trim() ? 'rgba(254,250,224,0.75)' : 'var(--cornsilk)',
                      boxShadow: !creating && newTitle.trim() ? '0 6px 24px rgba(212,163,115,0.4)' : 'none',
                      fontWeight: '600',
                    }}
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Create Book
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!searchQuery && featuredBook && (
          <section className="mb-8 md:mb-10 animate-fade-up">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em]" style={{ color: '#8B6E58', fontFamily: 'var(--font-sans)' }}>
                  Reading room
                </p>
                <h2 className="mt-2 text-[1.85rem] font-medium tracking-tight" style={{ color: '#24180F', fontFamily: 'var(--font-serif)' }}>
                  {activeBooks.length > 0 ? 'Continue where the story still feels warm.' : 'Choose the first keepsake worth opening tonight.'}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 md:text-right" style={{ color: '#6A5648', fontFamily: 'var(--font-sans)' }}>
                {activeBooks.length > 0
                  ? `${activeBooks.length} books already hold memories. ${draftBooks.length} ${draftBooks.length === 1 ? 'draft is' : 'drafts are'} waiting for a first page.`
                  : 'Start with a draft that already has a title and make it feel like a keepsake instead of a placeholder.'}
              </p>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
              <Link href={`/books/${featuredBook.id}`} className="group block">
                <article
                  className="relative overflow-hidden rounded-[32px] border p-6 md:p-7 transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,251,242,0.98) 0%, rgba(246,236,219,0.96) 100%)',
                    borderColor: 'rgba(212,163,115,0.2)',
                    boxShadow: '0 18px 42px rgba(212,163,115,0.14), 0 20px 50px rgba(43,43,43,0.06)',
                  }}
                >
                  <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: 'linear-gradient(180deg, rgba(212,163,115,0.95) 0%, rgba(107,142,35,0.85) 100%)' }} />
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl" style={{ background: 'rgba(212,163,115,0.12)' }} />

                  <div className="relative grid gap-5 md:grid-cols-[132px_minmax(0,1fr)] md:items-center">
                    <div className="mx-auto md:mx-0 rounded-[24px] p-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(250,237,205,0.48) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.88), 0 12px 28px rgba(212,163,115,0.14)' }}>
                      <BookCover
                        title={featuredBook.title}
                        description={featuredBook.description}
                        accentColor={BOOK_COLORS[featuredBook.id % BOOK_COLORS.length]}
                        plan={featuredBook.plan}
                        previewImageUrl={featuredBook.preview_photo_url}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ backgroundColor: 'rgba(85,103,72,0.12)', color: '#46563C', fontFamily: 'var(--font-sans)' }}>
                          {(featuredBook._count?.memories ?? 0) > 0 ? 'Best next step' : 'Start here'}
                        </span>
                        {featuredBook.plan && featuredBook.plan !== 'free' && (
                          <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full" style={getPlanBadgeStyles(featuredBook.plan)}>
                            {getBookPlanLabel(featuredBook.plan, featuredBook.storage_tier)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-[1.9rem] leading-tight font-medium tracking-tight" style={{ color: '#24180F', fontFamily: 'var(--font-serif)' }}>
                        {getDisplayBookTitle(featuredBook.title)}
                      </h3>
                      <p className="mt-2 max-w-2xl text-[0.98rem] leading-7" style={{ color: '#5A4637', fontFamily: 'var(--font-sans)' }}>
                        {(featuredBook._count?.memories ?? 0) > 0
                          ? shortenShelfNote(shortenMemoryExcerpt(featuredBook.latest_memory_excerpt) ? `“${shortenMemoryExcerpt(featuredBook.latest_memory_excerpt)}”${featuredBook.latest_contributor_name ? ` — ${featuredBook.latest_contributor_name}` : ''}` : `${featuredBook._count?.memories ?? 0} memories already live here.`, 180)
                          : shortenShelfNote(featuredBook.description, 180) || 'Open this draft and capture the first scene while it is still close.'}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.82)', color: '#302117', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.18)' }}>
                          {featuredBook._count?.memories ?? 0} {(featuredBook._count?.memories ?? 0) === 1 ? 'memory' : 'memories'}
                        </span>
                        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-medium" style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: '#5F4A3B', fontFamily: 'var(--font-sans)' }}>
                          Updated {new Date(featuredBook.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-bold transition-all duration-300 group-hover:translate-x-0.5" style={{ backgroundColor: '#4A3120', color: '#FEFAE0', fontFamily: 'var(--font-sans)', letterSpacing: '0.03em', boxShadow: '0 12px 24px rgba(74,49,32,0.18)' }}>
                        {(featuredBook._count?.memories ?? 0) > 0 ? 'Open book' : 'Begin first memory'}
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>

              <div className="rounded-[30px] border p-4 md:p-5" style={{ background: 'rgba(255,252,245,0.9)', borderColor: 'rgba(212,163,115,0.18)', boxShadow: '0 14px 32px rgba(212,163,115,0.08)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: '#8B6E58', fontFamily: 'var(--font-sans)' }}>
                      Up next
                    </p>
                    <p className="mt-1 text-sm leading-6" style={{ color: '#6A5648', fontFamily: 'var(--font-sans)' }}>
                      A shorter queue so the library feels curated instead of endless.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {featuredQueue.length > 0 ? featuredQueue.map((book) => {
                    const memoryCount = book._count?.memories ?? 0;
                    // Disambiguate duplicate titles in the queue
                    const hasDupe = featuredQueue.filter(b => getDisplayBookTitle(b.title) === getDisplayBookTitle(book.title)).length > 1;
                    const displayTitle = getDisplayBookTitle(book.title) + (hasDupe ? ` · #${book.id}` : '');
                    return (
                      <Link key={book.id} href={`/books/${book.id}`} className="group flex items-start gap-3 rounded-[22px] border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(250,244,233,0.92) 100%)', borderColor: 'rgba(212,163,115,0.14)' }}>
                        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: memoryCount > 0 ? '#6B8E23' : 'var(--bronze)' }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[1rem] font-medium" style={{ color: '#24180F', fontFamily: 'var(--font-serif)' }}>
                                {displayTitle}
                              </p>
                              <p className="mt-1 text-[0.8rem] uppercase tracking-[0.14em]" style={{ color: '#8B6E58', fontFamily: 'var(--font-sans)' }}>
                                {memoryCount > 0 ? `${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'} inside` : 'Still waiting for page one'}
                              </p>
                            </div>
                            <svg className="mt-1 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#7A6453' }}>
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </div>
                          <p className="mt-2 line-clamp-2 text-[0.92rem] leading-6" style={{ color: '#5A4637', fontFamily: 'var(--font-sans)' }}>
                            {memoryCount > 0
                              ? shortenShelfNote(shortenMemoryExcerpt(book.latest_memory_excerpt) ? `“${shortenMemoryExcerpt(book.latest_memory_excerpt)}”` : 'Pick up where this story left off.', 110)
                              : shortenShelfNote(book.description, 110) || 'Add the opening memory while the details are still vivid.'}
                          </p>
                        </div>
                      </Link>
                    );
                  }) : (
                    <div className="rounded-[22px] border px-4 py-4" style={{ borderColor: 'rgba(212,163,115,0.14)', background: 'rgba(255,255,255,0.66)' }}>
                      <p className="text-sm leading-6" style={{ color: '#5A4637', fontFamily: 'var(--font-sans)' }}>
                        Once you have a few books, this queue will keep the next meaningful action within reach.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
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
            <p className="text-base max-w-sm mx-auto leading-relaxed mb-8 text-center" style={{ color: '#3A3A2A', fontFamily: 'var(--font-sans)' }}>
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
            <p className="text-xs mt-5 max-w-xs mx-auto leading-relaxed text-center" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
              Free to start — takes about 5 minutes.
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="animate-fade-up rounded-[2rem] border px-6 py-8 md:px-8 md:py-9" style={{ background: 'linear-gradient(180deg, rgba(255,252,245,0.95) 0%, rgba(247,239,226,0.95) 100%)', borderColor: 'rgba(212,163,115,0.18)', boxShadow: '0 18px 40px rgba(212,163,115,0.08)' }}>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]" style={{ color: '#8B6E58', fontFamily: 'var(--font-sans)' }}>
              Shelf view empty
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight" style={{ color: '#24180F', fontFamily: 'var(--font-serif)' }}>
              {shelfFilterMeta[shelfFilter].empty}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: '#5A4637', fontFamily: 'var(--font-sans)' }}>
              Try another shelf view, clear your search, or open a new book so this library still feels curated instead of crowded.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="rounded-full h-10 px-5 text-sm font-medium"
                  style={{ borderColor: 'rgba(212,163,115,0.28)', color: 'var(--charcoal)', backgroundColor: 'rgba(255,253,246,0.9)' }}
                >
                  Clear search
                </Button>
              )}
              <Button
                type="button"
                onClick={() => {
                  setShelfFilter('all');
                  setCurrentPage(1);
                }}
                className="rounded-full h-10 px-5 text-sm font-medium"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
              >
                Show full shelf
              </Button>
            </div>
          </div>
        ) : (
          /* ── Book grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 xl:gap-5">
            {paginatedBooks.map((book, i) => {
              const colorIdx = book.id % BOOK_COLORS.length;
              const bookColor = BOOK_COLORS[colorIdx];
              const spineColor = BOOK_SPINE_COLORS[colorIdx];
              const spineHoverColor = BOOK_SPINE_HOVER_COLORS[colorIdx];
              const memoryCount = book._count?.memories ?? 0;
              const contributorCount = book.contributors?.length ?? 0;
              const hasMemories = memoryCount > 0;
              const displayTitle = getDisplayBookTitle(book.title);
              const wasSanitized = titleWasSanitized(book.title);
              const createdAt = new Date(book.created_at);
              const updatedAt = new Date(book.updated_at);
              const draftLabel = `Draft from ${createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              const presenceLabel = hasMemories ? 'In progress' : 'Ready to begin';
              const timingLabel = hasMemories
                ? `Last touched ${updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : `Started ${createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              const latestExcerpt = shortenMemoryExcerpt(book.latest_memory_excerpt);
              const shelfNote = hasMemories
                ? latestExcerpt
                  ? `“${latestExcerpt}”${book.latest_contributor_name ? ` — ${book.latest_contributor_name}` : ''}`
                  : memoryCount === 1
                    ? 'One memory already lives here.'
                    : `${memoryCount} memories already live here.`
                : shortenShelfNote(book.description, 82) || 'Open the book and capture the first scene while it is still vivid.';
              const nextStepBody = hasMemories
                ? 'Pick up where you left off.'
                : 'Begin the first memory.';
              return (
                <div
                  key={book.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s`, minHeight: 0 }}
                >
                  <Link href={`/books/${book.id}`} className="block h-full group">
                    <div
                      className="book-card relative h-full min-h-[172px] md:min-h-[186px] rounded-[26px] overflow-hidden cursor-pointer transition-all duration-300 group/card"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,253,247,0.98) 0%, rgba(248,241,228,0.98) 100%)',
                        boxShadow: '0 10px 26px rgba(212,163,115,0.10), 0 22px 52px rgba(43,43,43,0.06)',
                        border: '1px solid rgba(212,163,115,0.16)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 24px 56px rgba(212,163,115,0.22), 0 16px 32px rgba(43,43,43,0.10), inset 0 0 0 1px rgba(212,163,115,0.14), 0 0 32px ${bookColor}08`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 26px rgba(212,163,115,0.10), 0 22px 52px rgba(43,43,43,0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[30px]"
                        style={{ background: `radial-gradient(ellipse at 22% 18%, ${bookColor}16 0%, transparent 60%)` }}
                      />

                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: `linear-gradient(180deg, ${spineHoverColor} 0%, ${spineColor} 100%)` }} />
                      <div className="absolute inset-x-6 top-0 h-px opacity-80" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }} />

                      <div className="relative flex h-full flex-col p-5 md:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                              style={{
                                backgroundColor: hasMemories ? 'rgba(85,103,72,0.12)' : 'rgba(212,163,115,0.16)',
                                color: hasMemories ? '#46563C' : '#7A5A3F',
                                fontFamily: 'var(--font-sans)',
                              }}
                            >
                              {presenceLabel}
                            </span>
                            {book.plan && book.plan !== 'free' && (
                              <span
                                className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                style={getPlanBadgeStyles(book.plan)}
                              >
                                {getBookPlanLabel(book.plan, book.storage_tier)}
                              </span>
                            )}
                          </div>
                          <p className="shrink-0 text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: '#9A806A', fontFamily: 'var(--font-sans)' }}>
                            {hasMemories ? 'Recently held' : 'Fresh pages'}
                          </p>
                        </div>

                        <div className="mt-5 flex items-start gap-4 md:gap-5 flex-1 min-h-0">
                          <div className="shrink-0 rounded-[22px] p-2.5" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(250,237,205,0.48) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.88), 0 12px 28px rgba(212,163,115,0.14)' }}>
                            <div className="origin-top-left scale-[1.02]">
                              <BookCover
                                title={book.title}
                                description={book.description}
                                accentColor={bookColor}
                                plan={book.plan}
                                previewImageUrl={book.preview_photo_url}
                              />
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div>
                              <h3 className="text-[1.2rem] font-medium leading-snug line-clamp-2" style={{ color: '#24180F', fontFamily: 'var(--font-serif)' }}>
                                {displayTitle}
                              </h3>
                              <p className="mt-2 text-[0.84rem] uppercase tracking-[0.14em]" style={{ color: '#8B6E58', fontFamily: 'var(--font-sans)' }}>
                                {timingLabel}
                              </p>
                              {wasSanitized && (
                                <p className="mt-1 text-[11px] uppercase tracking-[0.16em]" style={{ color: '#927762', fontFamily: 'var(--font-sans)' }}>
                                  {draftLabel}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.82)', color: '#302117', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.18)' }}>
                                {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
                              </span>
                              {contributorCount > 1 && (
                                <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-medium" style={{ backgroundColor: 'rgba(204,213,174,0.26)', color: '#42503A', fontFamily: 'var(--font-sans)', border: '1px solid rgba(204,213,174,0.24)' }}>
                                  {contributorCount} contributors
                                </span>
                              )}
                            </div>

                            {contributorCount > 1 ? (
                              <div className="mt-3 flex items-center gap-2.5">
                                <div className="flex -space-x-1.5">
                                  {book.contributors?.slice(0, 3).map((c) => (
                                    <Avatar
                                      key={c.id}
                                      name={c.name || 'Contributor'}
                                      imageUrl={c.profile_image_url}
                                      className="ring-2 ring-[#FEFCF4]"
                                      size={22}
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px]" style={{ color: '#756253', fontFamily: 'var(--font-sans)' }}>
                                  Family can add to this keepsake.
                                </span>
                              </div>
                            ) : null}

                            <div
                              className="mt-4 rounded-[22px] px-4 py-3.5"
                              style={{
                                background: hasMemories
                                  ? 'linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(252,246,235,0.94) 100%)'
                                  : 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,250,242,0.92) 100%)',
                                border: '1px solid rgba(212,163,115,0.14)',
                              }}
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#8B6E58', fontFamily: 'var(--font-sans)' }}>
                                {hasMemories ? 'Shelf note' : 'Why start here'}
                              </p>
                              <p className="mt-2 text-[0.92rem] leading-6 line-clamp-3" style={{ color: hasMemories ? '#3F2E22' : '#5E4939', fontFamily: hasMemories ? 'var(--font-serif)' : 'var(--font-sans)', fontStyle: hasMemories ? 'italic' : 'normal' }}>
                                {shelfNote}
                              </p>
                            </div>

                            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                              <p className="max-w-[12rem] text-[0.78rem] leading-5" style={{ color: '#7A6453', fontFamily: 'var(--font-sans)' }}>
                                {nextStepBody}
                              </p>
                              <span className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-bold transition-all duration-300 group-hover:translate-x-0.5" style={{ backgroundColor: '#4A3120', color: '#FEFAE0', fontFamily: 'var(--font-sans)', letterSpacing: '0.03em', boxShadow: '0 12px 24px rgba(74,49,32,0.18)' }}>
                                {hasMemories ? 'Open book' : 'Begin memory'}
                                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-7 md:mt-10">
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).reduce<(number | '…')[]>((acc, page) => {
                const prev = acc[acc.length - 1];
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  acc.push(page);
                } else if ((page === 2 || page === totalPages - 1) && prev !== '…') {
                  acc.push('…');
                }
                return acc;
              }, []).map((item, idx) =>
                item === '…' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: 'rgba(43,43,43,0.60)' }}>…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item as number)}
                    className="w-9 h-9 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: currentPage === item ? 'var(--charcoal)' : 'rgba(212,163,115,0.10)',
                      color: currentPage === item ? 'var(--cornsilk)' : 'var(--charcoal)',
                    }}
                    aria-label={`Page ${item}`}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              )}

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
          )}
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
