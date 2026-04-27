'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbox } from '@/components/ui/lightbox';
import { MembersModal } from '@/components/ui/members-modal';
import { Avatar } from '@/components/ui/avatar';
import { Toast } from '@/components/ui/toast';
import { getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';

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
}

const ACCENT_COLORS = ['var(--bronze)', 'var(--tea-green)', 'var(--papaya)'];

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

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  // Per-photo error state for graceful degradation in the grid
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'default' | 'success' | 'error'>('default');
  const [toastVisible, setToastVisible] = useState(false);
  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ memoryId: number } | null>(null);

  useEffect(() => {
    fetchBook();

    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 404) { router.push('/dashboard'); return; }
      const data = await res.json();
      setBook(data.book);
      setMemories(data.memories || []);
      // Fetch current user's membership
      if (data.membership) {
        setCurrentUserId(data.membership.user_id);
        setCurrentUserRole(data.membership.role);
      } else {
        // Fallback: fetch members list to find self
        const membersRes = await fetch(`/api/books/${id}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          // Find current user by checking /api/auth/me
          const meRes = await fetch('/api/auth/me');
          if (meRes.ok) {
            const me = await meRes.json();
            const self = (membersData.data || []).find((m: any) => m.user_id === me.user?.id);
            if (self) {
              setCurrentUserId(self.user_id);
              setCurrentUserRole(self.role);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch book', err);
      setToastMessage('Failed to load book. Please refresh.');
      setToastVariant('error');
      setToastVisible(true);
    }
    finally { setLoading(false); }
  };

  const handleDeleteMemory = async (memoryId: number) => {
    const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
    if (res.ok) setMemories(memories.filter(m => m.id !== memoryId));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoError = (memoryIndex: number) => {
    setImageErrors(prev => ({ ...prev, [memoryIndex]: true }));
  };

  const handlePhotoClick = (memoryIndex: number, url: string) => {
    if (!imageErrors[memoryIndex]) {
      setLightboxSrc(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 rounded-xl mb-3 animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
            <div className="h-4 w-48 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} />
          </div>
          {/* Memory card skeletons */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)' }}>
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
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.85; } }
          .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  if (!book) return null;

  return (
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
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
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
                className="flex-1 h-11 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button — Add Memory */}
      <Link
        href={`/books/${id}/edit`}
        className="fixed bottom-7 right-7 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-up"
        style={{
          backgroundColor: 'var(--bronze)',
          color: 'var(--charcoal)',
          boxShadow: '0 8px 32px rgba(212,163,115,0.35)',
        }}
        aria-label="Add a memory"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </Link>

      {/* Scroll-to-top button */}
      {showTopBtn && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-7 left-7 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 animate-fade-up"
          style={{ backgroundColor: '#FDFCF5', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.2)' }}
          aria-label="Scroll to top"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="text-sm shrink-0 flex items-center gap-1.5 transition-colors hover:opacity-70" style={{ color: '#6A6A5A' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <span>Dashboard</span>
            </Link>
            <span style={{ color: 'rgba(212,163,115,0.3)' }} className="shrink-0">·</span>
            <h1 className="text-base md:text-lg font-medium truncate max-w-[8rem] sm:max-w-[12rem] md:max-w-none" style={{ color: 'var(--charcoal)' }}>
              {book.title}
            </h1>
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full" style={getPlanBadgeStyles(book.plan)}>
              {getBookPlanLabel(book.plan, book.storage_tier)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Members button */}
            <button
              type="button"
              onClick={() => setShowMembersModal(true)}
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
            >
              Members
            </button>

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
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
            >
              Share
            </button>

            {/* More menu (Members + Manage plan on mobile) */}
            <div className="relative sm:hidden">
              <button
                type="button"
                onClick={() => {
                  // Cycle through: Members → Share → Manage plan → back to none
                  if (currentUserRole === 'owner') {
                    setShowMembersModal(true);
                  }
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
                aria-label="More options"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>

            {/* Manage plan — owner only, desktop */}
            {currentUserRole === 'owner' && (
              <Link
                href={`/upgrade?book=${id}`}
                className="hidden md:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
                style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
              >
                Manage plan
              </Link>
            )}

            {/* Preview book link */}
            {memories.length > 0 && (
              <Link
                href={`/books/${id}/preview`}
                className="hidden lg:inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
                style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
              >
                Preview
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="px-6 md:px-10 py-12 max-w-3xl mx-auto w-full">

        {book.description && (
          <div className="mb-8">
            <p className="text-base leading-relaxed" style={{ color: '#6A6A5A' }}>{book.description}</p>
            <div className="rule mt-6" />
          </div>
        )}

        {/* Memory section header — editorial horizontal rule */}
        {memories.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h2 className="text-lg font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                {memories.length} {memories.length === 1 ? 'Memory' : 'Memories'}
              </h2>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.35), transparent)' }} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {memories.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            {/* Warm illustrated open-book icon */}
            <div className="inline-block mb-10 relative">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center animate-float"
                style={{
                  background: 'radial-gradient(circle, rgba(204,213,174,0.4) 0%, rgba(204,213,174,0.1) 70%, transparent 100%)',
                  animationDuration: '2.5s',
                  animationDelay: '0.2s',
                }}
              >
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Open book */}
                  <path d="M8 38V16C8 14.895 8.895 14 10 14H20C21.657 14 23 15.343 23 17V35" stroke="#D4A373" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M44 38V16C44 14.895 43.105 14 42 14H32C30.343 14 29 15.343 29 17V35" stroke="#D4A373" strokeWidth="2" strokeLinecap="round"/>
                  {/* Book pages */}
                  <path d="M23 17C23 18.657 21.657 20 20 20H10" stroke="#D4A373" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M29 17C29 18.657 30.343 20 32 20H42" stroke="#D4A373" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Spine shadow */}
                  <ellipse cx="26" cy="38" rx="18" ry="4" fill="rgba(212,163,115,0.15)"/>
                  {/* Left page lines */}
                  <line x1="13" y1="24" x2="21" y2="24" stroke="#CCD5AE" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="13" y1="28" x2="20" y2="28" stroke="#CCD5AE" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="13" y1="32" x2="18" y2="32" stroke="#CCD5AE" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Right page lines */}
                  <line x1="31" y1="24" x2="39" y2="24" stroke="#CCD5AE" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="31" y1="28" x2="38" y2="28" stroke="#CCD5AE" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="31" y1="32" x2="35" y2="32" stroke="#CCD5AE" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Decorative pen */}
                  <path d="M38 10L40 8M40 8L42 10M40 8L38 12" stroke="#D4A373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M37 11.5L35 15" stroke="#D4A373" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Subtle floating sparkle dots */}
              <div className="absolute -top-1 -right-2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bronze)', opacity: 0.4 }} />
              <div className="absolute top-4 -left-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--tea-green)', opacity: 0.5 }} />
            </div>
            <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>Start your memory book</h2>
            <p className="text-sm max-w-xs mx-auto leading-relaxed mb-10" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
              Every great story starts with a single memory. Add your first one — you can use a prompt or write freely.
            </p>
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add your first memory
            </Link>
          </div>
        ) : (
          /* ── Memory list with lightbox ── */
          <div className="space-y-8">
            {memories.map((memory, memoryIndex) => {
              const accentColor = ACCENT_COLORS[memoryIndex % ACCENT_COLORS.length];
              return (
                <div
                  key={memory.id}
                  className="animate-fade-up relative"
                  style={{ animationDelay: `${memoryIndex * 0.07}s` }}
                >
                  {/* Chapter tab strip — subtle accent above card */}
                  <div
                    className="absolute -top-3 left-10 right-0 h-3 rounded-t-2xl pointer-events-none z-10 overflow-hidden"
                    style={{ background: `linear-gradient(to bottom, ${accentColor}18, transparent)` }}
                  />
                  <Card
                    className="rounded-2xl overflow-hidden relative group transition-transform duration-300"
                    onMouseEnter={() => setHoveredCard(memoryIndex)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      backgroundColor: '#FDFCF5',
                      border: 'none',
                      boxShadow: hoveredCard === memoryIndex ? '0 20px 56px rgba(212,163,115,0.16), 0 4px 16px rgba(212,163,115,0.08)' : '0 4px 24px rgba(212,163,115,0.08)',
                      transform: hoveredCard === memoryIndex ? 'translateY(-3px)' : 'translateY(0)',
                      backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(204,213,174,0.04) 0%, transparent 50%)',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    }}
                  >
                    {/* Warm page-edge accent — left side */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                      style={{ background: `linear-gradient(to bottom, ${accentColor}cc, ${accentColor}55, transparent)`, }}
                    />
                    <CardContent className="pt-8 pb-8 px-6 pl-8">

                      {/* Prompt question as chapter opener */}
                      {memory.prompt_question && (
                        <p
                          className="text-base md:text-lg italic mb-6 leading-relaxed"
                          style={{ 
                            color: 'var(--bronze)', 
                            fontFamily: 'var(--font-serif)',
                            borderLeft: '3px solid rgba(212,163,115,0.25)',
                            paddingLeft: '1.1rem',
                          }}
                        >
                          {memory.prompt_question}
                        </p>
                      )}

                      {/* Media chips */}
                      {(memory.photo_urls?.length > 0 || memory.audio_url) && (
                        <div className="flex flex-wrap items-center gap-2 mb-5">
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

                      {/* Memory text — journal feel */}
                      <p
                        className="text-base md:text-lg leading-[1.9] whitespace-pre-wrap"
                        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
                      >
                        {memory.answer_text}
                      </p>


                      {/* Date + contributor */}
                      <div className="flex items-center gap-3 mt-6 flex-wrap">
                        {memory.contributor_name ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={memory.contributor_name}
                              imageUrl={memory.contributor_avatar || null}
                              size={22}
                            />
                            <span className="text-xs" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                              {memory.contributor_name}
                            </span>
                          </div>
                        ) : null}
                        <p className="text-xs" style={{ color: '#9A9A8A', fontFamily: 'var(--font-sans)' }}>
                          {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Photo grid — warm card frame with inset shadow */}
                      {memory.photo_urls && memory.photo_urls.length > 0 && (
                        <div
                          className="mt-7 grid gap-3 p-4 rounded-2xl"
                          style={{
                            gridTemplateColumns: memory.photo_urls.length === 1
                              ? '1fr'
                              : memory.photo_urls.length === 2
                                ? 'repeat(2, 1fr)'
                                : 'repeat(3, 1fr)',
                            backgroundColor: 'rgba(212,163,115,0.04)',
                            border: '1px solid rgba(212,163,115,0.1)',
                          }}
                        >
                          {memory.photo_urls.map((url, photoIndex) => {
                            const globalIndex = memoryIndex * 100 + photoIndex;
                            const hasError = !!imageErrors[globalIndex];
                            return (
                              <button
                                key={photoIndex}
                                type="button"
                                onClick={() => handlePhotoClick(globalIndex, url)}
                                className="img-frame rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:brightness-105 active:scale-[0.98] relative aspect-square group"
                                aria-label={`View photo ${photoIndex + 1}`}
                                style={{
                                  boxShadow: '0 4px 12px rgba(212,163,115,0.1)',
                                }}
                              >
                                {hasError ? (
                                  <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-1 rounded-xl"
                                    style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="22"
                                      height="22"
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
                                      className="text-[0.6rem] font-medium"
                                      style={{ color: 'rgba(43,43,43,0.4)', fontFamily: 'var(--font-sans)' }}
                                    >
                                      Unavailable
                                    </span>
                                  </div>
                                ) : (
                                  <Image
                                    src={url}
                                    alt={`Memory photo ${photoIndex + 1}`}
                                    fill
                                    unoptimized={true}
                                    className="object-cover rounded-xl"
                                    onError={() => handlePhotoError(globalIndex)}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Audio — warm styled card with icon */}
                      {memory.audio_url && (
                        <div
                          className="mt-7 p-5 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(204,213,174,0.12) 0%, rgba(212,163,115,0.08) 100%)',
                            border: '1px solid rgba(212,163,115,0.18)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                              </svg>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                              Voice Note
                            </span>
                          </div>
                          <audio
                            src={memory.audio_url}
                            controls
                            className="w-full rounded-xl audio-player"
                            style={{ height: '44px', borderRadius: '12px' }}
                          />
                        </div>
                      )}

                      {/* Footer actions — always visible, opacity on hover */}
                      <div
                        className="flex items-center justify-end gap-2 mt-7 pt-5 border-t opacity-40 group-hover:opacity-100 transition-all duration-300"
                        style={{ borderColor: 'rgba(212,163,115,0.1)' }}
                      >
                        <Link
                          href={`/books/${id}/edit?memory=${memory.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                          style={{ color: 'var(--charcoal)', backgroundColor: 'rgba(212,163,115,0.1)' }}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ memoryId: memory.id })}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                          style={{ color: '#8B6B5A', backgroundColor: 'rgba(212,163,115,0.06)' }}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                          </svg>
                          Delete
                        </button>
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
            <Link
              href={`/books/${id}/preview`}
              className="inline-flex h-11 items-center justify-center rounded-full border px-7 text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)' }}
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
  );
}
