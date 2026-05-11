'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Lightbox } from '@/components/ui/lightbox';
import { MembersModal } from '@/components/ui/members-modal';
import { Avatar } from '@/components/ui/avatar';
import { Toast } from '@/components/ui/toast';
import { MobileNav } from '@/components/ui/mobile-nav';
import { MemorySearchFilter } from '@/components/ui/memory-search-filter';
import { getBookPlanLabel, normalizeBookPlan, planToStorageTier } from '@/lib/book-plan';
import BreadcrumbSchema from '@/components/breadcrumb-schema';

interface Memory {
  id: number;
  prompt_question: string | null;
  answer_text: string;
  photo_urls: string[];
  audio_url: string | null;
  created_at: string;
  user_id?: number;
  contributor_name?: string;
  contributor_avatar?: string;
}

interface Book {
  id: number;
  title: string;
  description: string | null;
  storage_tier: string;
  plan: string;
  owner_name: string;
  storage_used_bytes?: number;
}

const ACCENT_COLORS = ['var(--bronze)', 'var(--tea-green)', 'var(--papaya)'];

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

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  // hoveredCard removed — card hover visuals now rely on CSS :hover (:focus-within via tabIndex)
  // Previously caused per-hover React re-renders. Menu button opacity still driven by activeMenu state.
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name?: string; avatarUrl?: string } | null>(null);
  // Per-photo error state for graceful degradation in the grid

  const skipLinkStyle = `.skip-link{position:fixed;top:0;left:0;z-index:9999;padding:.75rem 1.25rem;background:var(--bronze);color:var(--charcoal);font-weight:600;font-size:.875rem;border-radius:0 0 .5rem;transform:translateY(-100%);transition:transform .15s;text-decoration:none}.skip-link:focus{transform:translateY(0)}`;
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  // Per-photo loaded state for shimmer placeholder
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'default' | 'success' | 'error'>('default');
  const [toastVisible, setToastVisible] = useState(false);
  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ memoryId: number } | null>(null);
  // Delete loading state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Memory sort order (moved to child component, kept here for empty state compatibility)
  // Mobile nav state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Overflow menu for memory actions
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  // Sorted memories from child filter component
  const [sortedMemories, setSortedMemories] = useState<Memory[]>([]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    if (activeMenu !== null) {
      document.addEventListener('click', handleClick, true);
      return () => document.removeEventListener('click', handleClick, true);
    }
  }, [activeMenu]);

  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.status === 401) { router.push('/login'); setLoading(false); return; }
      if (res.status === 404) { router.push('/dashboard'); setLoading(false); return; }
      const data = await res.json();
      setBook(data.book);
      setMemories(data.memories || []);
      // Fetch current user's membership
      if (data.membership) {
        setCurrentUserId(data.membership.user_id);
        setCurrentUserRole(data.membership.role);
        // Also fetch current user details for owner attribution
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentUser({ name: me.user?.name, avatarUrl: me.user?.avatar_url });
        }
      } else if (data.current_user_role) {
        // Fallback for owners who have no membership entry
        setCurrentUserRole(data.current_user_role);
        setCurrentUserId(data.current_user_id ?? null);
      } else {
        // Fallback: fetch members list to find self
        const membersRes = await fetch(`/api/books/${id}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          // Find current user by checking /api/auth/me
          const meRes = await fetch('/api/auth/me');
          if (meRes.ok) {
            const me = await meRes.json();
            setCurrentUser({ name: me.user?.name, avatarUrl: me.user?.avatar_url });
            const self = (membersData.data || []).find((m: { user_id?: number }) => m.user_id === me.user?.id);
            if (self) {
              setCurrentUserId(self.user_id);
              setCurrentUserRole(self.role);
            }
          }
        }
      }
    } catch {
      setToastMessage('Failed to load book. Please refresh.');
      setToastVariant('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  }, [id, router, currentUserId]);

  useEffect(() => {
    fetchBook(); // eslint-disable-line react-hooks/set-state-in-effect

    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // fetchBook is stable (useCallback with [id, router]) — intentionally not in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteMemory = async (memoryId: number) => {
    setDeletingId(memoryId);
    const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
    setDeletingId(null);
    if (res.ok) setMemories(memories.filter(m => m.id !== memoryId));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoError = (memoryId: number, photoIndex: number) => {
    const key = `${memoryId}-${photoIndex}`;
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const handleImageLoad = (memoryId: number, photoIndex: number) => {
    const key = `${memoryId}-${photoIndex}`;
    setLoadedImages(prev => ({ ...prev, [key]: true }));
  };

  const handlePhotoClick = (memoryId: number, photoIndex: number, url: string) => {
    const key = `${memoryId}-${photoIndex}`;
    if (!imageErrors[key]) {
      setLightboxSrc(url);
    }
  };

  if (loading) {
    return (
      <>
        <style>{skipLinkStyle}</style>
        <a href="#main" className="skip-link">Skip to main content</a>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 rounded-xl mb-3 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
            <div className="h-4 w-48 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
          </div>
          {/* Memory card skeletons */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl p-5 skeleton-pulse" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3.5 w-3/4 rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.1)' }} />
                    <div className="h-4 w-full rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    <div className="h-4 w-2/3 rounded-md" style={{ backgroundColor: 'rgba(212,163,115,0.07)' }} />
                    {i % 2 === 0 && (
                      <div className="flex gap-2 mt-3">
                        <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                        <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: 'rgba(212,163,115,0.10)' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
              </div>
              </>
    );
  }

  if (!book) return null;

  return (
    <>
      <style>{skipLinkStyle}</style>
      <a href="#main" className="skip-link">Skip to main content</a>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* Lightbox */}
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt="Memory photo"
          onClose={() => setLightboxSrc(null)}
        />
      )}

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        variant={toastVariant}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Mobile nav drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        loggedIn={true}
      />

      {/* Delete confirmation inline dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(43,43,43,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-3xl p-8 animate-fade-up"
            style={{ backgroundColor: '#FDFCF5', boxShadow: '0 32px 80px rgba(43,43,43,0.2)' }}
          >
            <h3 className="text-xl font-medium mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
              Delete this memory?
            </h3>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#3A3A2A', fontFamily: 'var(--font-sans)' }}>
              This cannot be undone. The memory and all its photos will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80"
                style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.2)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { memoryId } = deleteConfirm;
                  setDeleteConfirm(null);
                  await handleDeleteMemory(memoryId);
                  setToastMessage('Memory deleted');
                  setToastVariant('default');
                  setToastVisible(true);
                }}
                disabled={deletingId !== null}
                className="flex-1 h-11 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
              >
                {deletingId !== null ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button — removed. The inline "Add Memory" button in the header serves
         the same purpose without visual clutter or a redundant scroll-linked element. */}

      {/* Scroll-to-top button */}
      {showTopBtn && (
        <button
          type="button"
          onClick={scrollToTop}
          className="scroll-top-btn fixed bottom-7 right-7 z-30 w-11 h-11 rounded-full flex items-center justify-center animate-fade-up shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ backgroundColor: 'var(--bronze)', color: '#1A1A1A', border: '1px solid rgba(212,163,115,0.3)', boxShadow: '0 4px 16px rgba(212,163,115,0.25)' }}
          aria-label="Scroll to top"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-30 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.96)', backdropFilter: 'blur(20px)', borderColor: 'rgba(212,163,115,0.18)', boxShadow: '0 1px 0 rgba(212,163,115,0.08), 0 4px 24px rgba(212,163,115,0.04)' }}>
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="text-sm shrink-0 flex items-center gap-1.5 transition-colors hover:opacity-70" style={{ color: 'var(--charcoal)' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Members button */}
            <button
              type="button"
              onClick={() => setShowMembersModal(true)}
              className="header-action-btn hidden sm:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:brightness-90 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
            >
              Members
            </button>

            {/* Add Memory button — primary CTA */}
            <Link
              href={`/books/${id}/edit`}
              className="add-memory-btn inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: 'var(--bronze)',
                color: 'var(--charcoal)',
                boxShadow: '0 4px 16px rgba(212,163,115,0.45), 0 1px 3px rgba(212,163,115,0.20)',
                    border: '1px solid rgba(212,163,115,0.25)',
              }}
            >
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Memory
            </Link>

            {/* Share button */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/books/${id}/preview`).then(() => {
                  setToastMessage('Preview link copied!');
                  setToastVariant('success');
                  setToastVisible(true);
                });
              }}
              className="header-action-btn hidden sm:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:brightness-90 active:scale-95"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
            >
              Share
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex sm:hidden w-11 h-11 rounded-full items-center justify-center transition-colors hover:opacity-70"
              style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)' }}
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>

            {/* Manage plan — owner only, desktop */}
            {currentUserRole === 'owner' && (
              <Link
                href={`/upgrade?book=${id}`}
                className="header-action-btn hidden md:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:brightness-90 active:scale-95"
                style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
              >
                Manage plan
              </Link>
            )}

            {/* Preview book link */}
            {memories.length > 0 && (
              <Link
                href={`/books/${id}/preview`}
                className="header-action-btn hidden lg:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:brightness-90 active:scale-95"
                style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
              >
                Preview
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main id="main" className="px-6 md:px-10 py-5 md:py-7 max-w-5xl mx-auto w-full">

        {/* Breadcrumb navigation — WCAG 2.1 SC 2.4.8 */}
        {book && (
          <>
            <BreadcrumbSchema
              items={[
                { name: 'Books', href: '/dashboard' },
                { name: book.title, href: `/books/${id}` },
              ]}
            />
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-1.5 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-[rgba(43,43,43,0.55)] hover:text-[var(--bronze)] transition-colors rounded px-1.5 py-0.5 hover:bg-[rgba(212,163,115,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Books
                  </Link>
                </li>
                <li aria-hidden="true" className="text-[rgba(43,43,43,0.3)] text-xs font-light">/</li>
                <li aria-current="page" className="text-[rgba(43,43,43,0.75)] font-medium truncate max-w-[200px] md:max-w-[320px]">
                  {book.title}
                </li>
              </ol>
            </nav>
          </>
        )}

        {/* Book hero — compact when empty, expanded when has memories */}
        <div
          className="rounded-3xl p-5 md:p-6 relative overflow-hidden transition-all duration-500"
          style={{
            background: memories.length > 0
    ? 'linear-gradient(135deg, rgba(212,163,115,0.12) 0%, rgba(204,213,174,0.08) 100%)'
    : 'linear-gradient(135deg, rgba(212,163,115,0.09) 0%, rgba(204,213,174,0.06) 100%)',
            border: '1px solid rgba(212,163,115,0.14)',
            marginBottom: memories.length === 0 ? '1.5rem' : '2rem',
            boxShadow: '0 4px 24px rgba(212,163,115,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {/* Decorative corner accent */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,163,115,0.4) 0%, transparent 70%)' }}
          />
          {/* Warm left stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl"
            style={{ background: 'linear-gradient(to bottom, var(--bronze), var(--tea-green), transparent)' }}
          />
          {/* Bottom warm fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(212,163,115,0.04), transparent)' }}
          />
          <div className="flex items-start justify-between gap-4 flex-wrap pl-3">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="display-md font-medium tracking-tight leading-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
                  {book.title}
                </h1>
                {book.plan && book.plan !== 'free' && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full shrink-0" style={getPlanBadgeStyles(book.plan)}>
                    {getBookPlanLabel(book.plan, book.storage_tier)}
                  </span>
                )}
                {book.storage_used_bytes != null && book.plan && book.plan !== 'free' && (
                  (() => {
                    const usedGB = book.storage_used_bytes / (1024 * 1024 * 1024);
                    const tier = planToStorageTier(normalizeBookPlan(book.plan, book.storage_tier));
                    const totalGB = tier === '15gb' ? 15 : 5;
                    const pct = Math.min((usedGB / totalGB) * 100, 100);
                    const usedStr = usedGB < 1 ? usedGB.toFixed(2) : `${usedGB.toFixed(1)} GB`;
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: 'var(--bronze)' }} />
                        </div>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>
                          {usedStr} / {totalGB}GB
                        </span>
                      </div>
                    );
                  })()
                )}
                {currentUserRole === 'owner' && (
                  <Link
                    href={`/books/${book.id}/edit/book`}
                    className="shrink-0 h-9 rounded-2xl flex items-center gap-2 px-4 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: 'rgba(212,163,115,0.14)', color: '#6A5A3A', border: '1px solid rgba(212,163,115,0.22)', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 8px rgba(212,163,115,0.08)', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
                    aria-label="Edit book details"
                    title="Edit book"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--bronze)' }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit book
                  </Link>
                )}
              </div>
              {book.description && (
                <p className="text-base leading-relaxed" style={{ color: '#4A4A3A', fontFamily: 'var(--font-serif)', maxWidth: '56ch', fontStyle: 'italic' }}>
                  {book.description}
                </p>
              )}
            </div>
            {/* Show Add Memory only when book has memories — avoid CTA redundancy with empty state */}
            {memories.length > 0 && (
              <div className="flex items-center shrink-0 hidden sm:flex">
                <Link
                  href={`/books/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:brightness-105 active:scale-95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: 'var(--bronze)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 4px 16px rgba(212,163,115,0.45), 0 1px 3px rgba(212,163,115,0.20)',
                    border: '1px solid rgba(212,163,115,0.25)',
                    ['--tw-ring-color' as string]: 'var(--bronze)',
                    ['--tw-ring-offset-color' as string]: 'var(--cornsilk)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Memory
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Memory section header — editorial horizontal rule */}
        {memories.length > 0 && (
          <div className="mb-7">
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm"
                style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--bronze)' }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                Your Memories
              </h2>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.4), transparent)' }} />
              {/* Search input */}
              <MemorySearchFilter memories={memories} onFilteredChange={setSortedMemories} />
            </div>
          </div>
        )}

        {/* Empty state — warm and inviting */}
        {memories.length === 0 ? (
          <div aria-live="polite" role="status" className="text-center py-12 md:py-16 animate-fade-up">
            {/* Warm illustrated open-book icon */}
            <div className="inline-block mb-8 relative">
              <div
                className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center animate-float"
                style={{
                  background: 'radial-gradient(circle, rgba(204,213,174,0.5) 0%, rgba(204,213,174,0.15) 70%, transparent 100%)',
                  animationDuration: '4s',
                  animationDelay: '0.3s',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Open book */}
                  <path d="M8 38V16C8 14.895 8.895 14 10 14H20C21.657 14 23 15.343 23 17V35" stroke="#D4A373" strokeWidth="2.2" strokeLinecap="round"/>
                  <path d="M44 38V16C44 14.895 43.105 14 42 14H32C30.343 14 29 15.343 29 17V35" stroke="#D4A373" strokeWidth="2.2" strokeLinecap="round"/>
                  {/* Book pages */}
                  <path d="M23 17C23 18.657 21.657 20 20 20H10" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M29 17C29 18.657 30.343 20 32 20H42" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round"/>
                  {/* Spine shadow */}
                  <ellipse cx="26" cy="38" rx="18" ry="4" fill="rgba(212,163,115,0.2)"/>
                  {/* Left page lines */}
                  <line x1="13" y1="24" x2="21" y2="24" stroke="#CCD5AE" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="13" y1="28" x2="20" y2="28" stroke="#CCD5AE" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="13" y1="32" x2="18" y2="32" stroke="#CCD5AE" strokeWidth="1.8" strokeLinecap="round"/>
                  {/* Right page lines */}
                  <line x1="31" y1="24" x2="39" y2="24" stroke="#CCD5AE" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="31" y1="28" x2="38" y2="28" stroke="#CCD5AE" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="31" y1="32" x2="35" y2="32" stroke="#CCD5AE" strokeWidth="1.8" strokeLinecap="round"/>
                  {/* Decorative pen */}
                  <path d="M38 10L40 8M40 8L42 10M40 8L38 12" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M37 11.5L35 15" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Subtle floating sparkle dots */}
              <div className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--bronze)', opacity: 0.5 }} />
              <div className="absolute top-6 -left-3 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--tea-green)', opacity: 0.6 }} />
              <div className="absolute bottom-2 left-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bronze)', opacity: 0.3 }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>Start your memory book</h2>
            <p className="text-base max-w-sm mx-auto leading-relaxed mb-8" style={{ color: '#5A5A4A', fontFamily: 'var(--font-serif)' }}>
              Every great story starts with a single memory.
            </p>
            {/* 3 example prompt chips — spark inspiration */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {[
                { label: "The best day of the trip", prompt: "Describe the best day of your vacation." },
                { label: "A funny travel mishap", prompt: "Tell me about a funny or unexpected moment during your trip." },
                { label: "A meal I'll never forget", prompt: "Describe a meal you'll never forget from this trip." },
              ].map(({ label, prompt }) => (
                <Link
                  key={label}
                  href={`/books/${id}/edit?prompt=${encodeURIComponent(prompt)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                  style={{
                    backgroundColor: 'rgba(212,163,115,0.14)',
                    color: '#4A3A2A',
                    border: '1px solid rgba(212,163,115,0.30)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 2px 8px rgba(212,163,115,0.10)',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  {label}
                </Link>
              ))}
            </div>
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex h-14 items-center justify-center rounded-full px-10 text-sm font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:shadow-[rgba(212,163,115,0.45)] hover:-translate-y-1 active:scale-95 group"
              style={{ 
                backgroundColor: 'var(--bronze)', 
                color: 'var(--charcoal)', 
                boxShadow: '0 6px 28px rgba(212,163,115,0.35)',
                fontFamily: 'var(--font-sans)',
                animation: 'gentle-pulse 3s ease-in-out infinite',
              }}
            >
              <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add your first memory
            </Link>
            <style>{`
              @keyframes gentle-pulse {
                0%, 100% { box-shadow: 0 6px 28px rgba(212,163,115,0.35); }
                50% { box-shadow: 0 6px 40px rgba(212,163,115,0.55), 0 0 0 8px rgba(212,163,115,0.06); }
              }
            `}</style>
          </div>
        ) : (
          /* ── Memory list with lightbox ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 md:items-start">
            {sortedMemories.map((memory, memoryIndex) => {
              const accentColor = ACCENT_COLORS[memoryIndex % ACCENT_COLORS.length];
              return (
                <div
                  key={memory.id}
                  aria-label={`Chapter ${memoryIndex + 1}${memory.prompt_question ? `: ${memory.prompt_question}` : ''}${memory.answer_text ? `. ${memory.answer_text.slice(0, 60)}${memory.answer_text.length > 60 ? '…' : ''}` : ''}`}
                  className="animate-fade-up relative group/card"
                  style={{ animationDelay: `${memoryIndex * 0.07}s` }}
                >
                  {/* Chapter tab strip — subtle accent above card */}
                  <div
                    className="absolute -top-3 left-10 right-0 h-4 rounded-t-2xl pointer-events-none z-10 overflow-hidden transition-all duration-300"
                    style={{ background: `linear-gradient(to bottom, ${accentColor}28, transparent)` }}
                  />
                  <Card
                    className="rounded-2xl overflow-hidden relative transition-all duration-500 ease-out"
                    tabIndex={0}
                    style={{
                      backgroundColor: '#FDFCF5',
                      border: '1px solid rgba(212,163,115,0.06)',
                      boxShadow: '0 4px 20px rgba(212,163,115,0.08), 0 1px 4px rgba(212,163,115,0.05)',
                      backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(204,213,174,0.08) 0%, transparent 50%)',
                    }}
                  >
                    {/* Warm page-edge accent — left side with book spine feel */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                      style={{ 
                        background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}88 40%, ${accentColor}44 60%, transparent)`,
                      }}
                    />
                    <CardContent className="pt-5 pb-5 px-5">

                      {/* Chapter number badge — book-page style with embossed look */}
                      <div
                        className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-2 mb-4"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}0a 100%)`,
                          border: `1.5px solid ${accentColor}40`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 10px ${accentColor}18`,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <span className="text-lg font-bold tracking-tight" style={{ color: accentColor, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
                          {String(memoryIndex + 1).padStart(2, '0')}
                        </span>
                        <div className="w-px h-5 rounded-full" style={{ backgroundColor: `${accentColor}55` }} />
                        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: `${accentColor}aa`, fontFamily: 'var(--font-sans)' }}>Chapter {memoryIndex + 1}</span>
                      </div>

                      {/* Prompt question as elegant chapter opener */}
                      {memory.prompt_question && (
                        <div className="mb-5">
                          <div className="flex items-start gap-3">
                            {/* Decorative quote mark */}
                            <span 
                              className="text-2xl leading-none mt-[-2px] shrink-0"
                              style={{ color: 'rgba(212,163,115,0.4)', fontFamily: 'Georgia, serif' }}
                            >
                              &#8220;
                            </span>
                            <p
                              className="text-sm md:text-base italic leading-relaxed"
                              style={{ 
                                color: '#8A6A4A', 
                                fontFamily: 'var(--font-serif)',
                              }}
                            >
                              {memory.prompt_question}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Media chips */}
                      {(memory.photo_urls?.length > 0 || memory.audio_url) && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {memory.photo_urls?.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: 'var(--charcoal)' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                              {memory.photo_urls.length} {memory.photo_urls.length === 1 ? 'photo' : 'photos'}
                            </div>
                          )}
                          {memory.audio_url && (
                            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: 'rgba(204,213,174,0.18)', color: 'var(--charcoal)' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5F6650' }}>
                                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                              </svg>
                              Voice note
                            </div>
                          )}
                        </div>
                      )}

                      {/* Memory text — journal feel, constrained width */}
                      <p
                        className="text-sm md:text-base leading-[1.85] whitespace-pre-wrap"
                        style={{
                          color: 'var(--charcoal)',
                          fontFamily: 'var(--font-serif)',
                          maxWidth: '68ch',
                          lineHeight: '1.9',
                        }}
                      >
                        {memory.answer_text}
                      </p>

                      {/* Date + contributor — warm, book-journal style, no min-read metric */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t flex-wrap" style={{ borderColor: 'rgba(212,163,115,0.08)' }}>
                        {memory.contributor_name ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={memory.contributor_name}
                              imageUrl={memory.contributor_avatar || null}
                              size={24}
                            />
                            <span className="text-xs" style={{ color: 'rgba(43,43,43,0.78)', fontFamily: 'var(--font-sans)' }}>
                              {memory.contributor_name}
                            </span>
                          </div>
                        ) : currentUser ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={currentUser.name ?? 'You'}
                              imageUrl={currentUser.avatarUrl || null}
                              size={24}
                            />
                            <span className="text-xs" style={{ color: 'rgba(43,43,43,0.78)', fontFamily: 'var(--font-sans)' }}>
                              You
                            </span>
                          </div>
                        ) : null}
                        <span className="text-sm" style={{ color: '#7A6A5A', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                          {(() => {
                            const d = new Date(memory.created_at);
                            const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                            const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            return `Added ${dateStr} · ${timeStr}`;
                          })()}
                        </span>
                      </div>

                      {/* Photo grid — premium album-style with hover reveal */}
                      {memory.photo_urls && memory.photo_urls.length > 0 && (
                        <div
                          className={`mt-5 photo-grid photo-grid--${Math.min(memory.photo_urls.length, 4)}`}
                        >
                          {memory.photo_urls.map((url, photoIndex) => {
                            const errorKey = `${memory.id}-${photoIndex}`;
                            const hasError = !!imageErrors[errorKey];
                            const isLoaded = !!loadedImages[errorKey];
                            return (
                              <div
                                key={photoIndex}
                                className="relative img-frame overflow-hidden cursor-pointer group"
                                style={{
                                  aspectRatio: photoIndex === 0 && memory.photo_urls.length === 1 ? '4/3' : '1',
                                }}
                              >
                                {hasError ? (
                                  <div
                                    role="status"
                                    aria-live="polite"
                                    aria-label="Photo unavailable"
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl"
                                    style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      style={{ color: 'rgba(43,43,43,0.3)' }}
                                    >
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span
                                      className="text-[0.65rem] font-medium"
                                      style={{ color: 'rgba(43,43,43,0.4)', fontFamily: 'var(--font-sans)' }}
                                    >
                                      Unavailable
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    {!isLoaded && (
                                      <div
                                        className="absolute inset-0 rounded-xl animate-shimmer z-10 pointer-events-none"
                                        style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
                                      />
                                    )}
                                    <Image
                                      src={url}
                                      alt={memory.prompt_question
  ? memory.prompt_question
  : memory.answer_text
    ? `Memory photo ${photoIndex + 1}: ${memory.answer_text.slice(0, 80)}`
    : `Memory photo ${photoIndex + 1}`}
                                      fill
                                      loading="lazy"
                                      unoptimized={true}
                                      className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                                      onError={() => handlePhotoError(memory.id, photoIndex)}
                                      onLoad={() => handleImageLoad(memory.id, photoIndex)}
                                    />
                                    {/* Hover overlay with expand hint */}
                                    <button
                                      type="button"
                                      onClick={() => handlePhotoClick(memory.id, photoIndex, url)}
                                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                                      aria-label={`View photo ${photoIndex + 1} fullscreen`}
                                      style={{
                                        background: 'linear-gradient(to top, rgba(43,43,43,0.45) 0%, rgba(43,43,43,0.1) 50%, transparent 100%)',
                                      }}
                                    >
                                      <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110"
                                        style={{ backgroundColor: 'rgba(254,250,224,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                                      >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--charcoal)' }}>
                                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                        </svg>
                                      </div>
                                    </button>
                                    {/* Photo index badge */}
                                    {memory.photo_urls.length > 1 && (
                                      <div
                                        className="absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ backgroundColor: 'rgba(254,250,224,0.9)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                                      >
                                        {photoIndex + 1} / {memory.photo_urls.length}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Audio — premium styled card with waveform icon */}
                      {memory.audio_url && (
                        <div
                          className="mt-5 p-5 rounded-2xl relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(204,213,174,0.15) 0%, rgba(212,163,115,0.1) 100%)',
                            border: '1px solid rgba(212,163,115,0.2)',
                            boxShadow: '0 4px 20px rgba(212,163,115,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                          }}
                        >
                          {/* Subtle decorative waveform lines */}
                          <div className="absolute inset-0 opacity-[0.06] pointer-events-none flex items-center justify-center gap-0.5">
                            {[...Array(30)].map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 rounded-full"
                                style={{
                                  height: `${8 + Math.abs(Math.sin(i * 0.8) * 10 + Math.cos(i * 1.4) * 6)}px`,
                                  backgroundColor: 'var(--bronze)',
                                }}
                              />
                            ))}
                          </div>
                          <div className="relative flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'var(--bronze)', boxShadow: '0 4px 12px rgba(212,163,115,0.3)' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--charcoal)' }}>
                                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--bronze)', fontFamily: 'var(--font-sans)' }}>
                                Voice Note
                              </p>
                              <audio
                                src={memory.audio_url}
                                controls
                                preload="metadata"
                                aria-label={memory.prompt_question
                                  ? `Voice note: ${memory.prompt_question}`
                                  : `Voice note: ${memory.answer_text.slice(0, 60)}${memory.answer_text.length > 60 ? '…' : ''}`}
                                className="w-full rounded-xl audio-player"
                                style={{ height: '40px', borderRadius: '10px' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer actions — elegant overflow menu, appears on hover */}
                      <div
                        className="flex items-center justify-end mt-4 pt-4 border-t transition-all duration-500"
                        style={{ borderColor: 'rgba(212,163,115,0.08)' }}
                      >
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setActiveMenu(activeMenu === memory.id ? null : memory.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveMenu(activeMenu === memory.id ? null : memory.id);
                              }
                            }}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            style={{
                              backgroundColor: 'rgba(212,163,115,0.10)',
                              color: '#5A3A2A',
                              opacity: activeMenu === memory.id ? 1 : 0.4,
                              ['--tw-ring-color' as string]: 'rgba(212,163,115,0.5)',
                              ['--tw-ring-offset-color' as string]: 'var(--cornsilk)',
                            }}
                            aria-label="Memory options"
                            aria-haspopup="menu"
                            aria-expanded={activeMenu === memory.id}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                            </svg>
                          </button>
                          {activeMenu === memory.id && (
                            <div
                              className="absolute right-0 top-12 z-50 w-44 rounded-2xl p-1.5 animate-fade-up"
                              style={{
                                backgroundColor: '#FDFCF5',
                                border: '1px solid rgba(212,163,115,0.18)',
                                boxShadow: '0 12px 40px rgba(43,43,43,0.15), 0 4px 16px rgba(212,163,115,0.08)',
                              }}
                              role="menu"
                              tabIndex={-1}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.stopPropagation();
                                  setActiveMenu(null);
                                }
                              }}
                            >
                              <Link
                                href={`/books/${id}/edit?memory=${memory.id}`}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] menu-item-hover edit-item"
                                style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                                role="menuitem"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit memory
                              </Link>
                              <div className="h-px my-1" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenu(null);
                                  setDeleteConfirm({ memoryId: memory.id });
                                }}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] menu-item-hover delete-item"
                                style={{ color: '#B07070', fontFamily: 'var(--font-sans)' }}
                                role="menuitem"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#B07070' }}>
                                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                                </svg>
                                Delete memory
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {memories.length > 0 && (
          <div className="mt-12 text-center">
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-12 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.25)' }} />
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)', opacity: 0.5 }}>
                <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
                <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
              </svg>
              <div className="h-px w-12 rounded-full" style={{ backgroundColor: 'rgba(212,163,115,0.25)' }} />
            </div>
            <Link
              href={`/books/${id}/preview`}
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-300 hover:brightness-105 hover:shadow-xl hover:shadow-[rgba(212,163,115,0.25)] hover:-translate-y-0.5 active:scale-95"
              style={{ 
                backgroundColor: 'var(--bronze)', 
                color: 'var(--charcoal)',
                boxShadow: '0 4px 20px rgba(212,163,115,0.2)',
              }}
            >
              <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Preview your book
            </Link>
            <p className="mt-4 text-xs" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
              Print preview — see your book before ordering
            </p>
          </div>
        )}
      </main>

      {/* Members modal */}
      {showMembersModal && currentUserId && currentUserRole && (
        <MembersModal
          bookId={parseInt(id)}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setShowMembersModal(false)}
        />
      )}
    </div>
    </>
  );
}
