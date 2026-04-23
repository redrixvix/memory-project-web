'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbox } from '@/components/ui/lightbox';
import { MembersModal } from '@/components/ui/members-modal';

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
  owner_name: string;
}

const ACCENT_COLORS = ['var(--bronze)', 'var(--tea-green)', 'var(--papaya)'];

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

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
    } catch { console.error('Failed to fetch book'); }
    finally { setLoading(false); }
  };

  const handleDeleteMemory = async (memoryId: number) => {
    const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
    if (res.ok) setMemories(memories.filter(m => m.id !== memoryId));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Scroll-to-top button */}
      {showTopBtn && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-7 right-7 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 animate-fade-up"
          style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
          aria-label="Scroll to top"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-70 shrink-0" style={{ color: '#6A6A5A' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Dashboard
            </Link>
            <span style={{ color: 'rgba(212,163,115,0.3)' }}>·</span>
            <h1 className="text-base md:text-lg font-medium truncate" style={{ color: 'var(--charcoal)' }}>
              {book.title}
            </h1>
          </div>
          <div className="flex flex-row flex-wrap gap-2 items-center shrink-0">
            {memories.length === 0 && (
              <Link
                href={`/books/${id}/edit`}
                className="inline-flex h-8 md:h-9 items-center justify-center rounded-full px-3 md:px-5 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
              >
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5 md:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="hidden sm:inline">Add Memory</span>
              </Link>
            )}
            {memories.length > 0 && (
              <Link
                href={`/books/${id}/edit`}
                className="inline-flex h-8 md:h-9 items-center justify-center rounded-full px-4 md:px-5 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
              >
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5 md:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="hidden sm:inline">Add Memory</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowMembersModal(true)}
              className="inline-flex h-8 md:h-9 items-center justify-center rounded-full border px-3 md:px-4 text-xs md:text-sm font-medium whitespace-nowrap transition-colors"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
            >
              Members
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/books/${id}/preview`);
                alert('Preview link copied! Anyone with this link can view your book.');
              }}
              className="inline-flex h-8 md:h-9 items-center justify-center rounded-full border px-3 md:px-4 text-xs md:text-sm font-medium whitespace-nowrap transition-colors"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }}
            >
              Share
            </button>
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

        {memories.length > 0 && (
          <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
            <p className="label-caps" style={{ color: 'var(--bronze)' }}>
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </p>
            <Link
              href={`/books/${id}/preview`}
              className="text-sm flex items-center gap-2 transition-colors hover:opacity-70"
              style={{ color: 'var(--charcoal)' }}
            >
              Preview book
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}

        {/* Empty state */}
        {memories.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            <div className="inline-block mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(204,213,174,0.3)' }}>
                <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ color: 'var(--charcoal)' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>Start your memory book</h2>
            <p className="text-sm max-w-xs mx-auto leading-relaxed mb-10" style={{ color: '#6A6A5A' }}>
              Every great story starts with a single memory. Add your first one — you can use a prompt or write freely.
            </p>
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium transition-all duration-200 hover:opacity-90"
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
            {memories.map((memory, index) => {
              const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
              return (
                <div
                  key={memory.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  <Card
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: '#FDFCF5',
                      border: 'none',
                      boxShadow: '0 4px 24px rgba(212,163,115,0.08)',
                      // Subtle page texture via layered gradient
                      backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(204,213,174,0.04) 0%, transparent 50%)',
                    }}
                  >
                    <CardContent className="pt-8 pb-8 px-6">

                      {/* Memory #N label */}
                      <div className="flex items-center gap-2 mb-5">
                        <div
                          className="w-1 rounded-full"
                          style={{ backgroundColor: accentColor, height: 16 }}
                        />
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                        >
                          Memory {index + 1} of {memories.length}
                        </span>
                      </div>

                      {/* Prompt question as chapter header */}
                      {memory.prompt_question && (
                        <p
                          className="text-sm italic mb-5 leading-relaxed"
                          style={{ color: 'var(--bronze)', fontFamily: 'var(--font-serif)' }}
                        >
                          &ldquo;{memory.prompt_question}&rdquo;
                        </p>
                      )}

                      {/* Memory text — journal feel */}
                      <p
                        className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
                      >
                        {memory.answer_text}
                      </p>

                      {/* Date below text */}
                      <p className="text-xs mt-5" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                        {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>

                      {/* Photo grid */}
                      {memory.photo_urls && memory.photo_urls.length > 0 && (
                        <div className="flex gap-3 mt-7 overflow-x-auto pb-2">
                          {memory.photo_urls.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightboxSrc(url)}
                              className="img-frame rounded-xl overflow-hidden shrink-0 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                              style={{ minHeight: 200, minWidth: 200 }}
                              aria-label={`View photo ${i + 1}`}
                            >
                              <Image
                                src={url}
                                alt={`Memory photo ${i + 1}`}
                                width={192}
                                height={192}
                                className="object-cover rounded-xl"
                                style={{ minHeight: 200, minWidth: 200 }}
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Audio */}
                      {memory.audio_url && (
                        <audio src={memory.audio_url} controls className="mt-7 w-full h-9" />
                      )}

                      {/* Footer actions */}
                      <div className="flex justify-between items-center mt-6 pt-5 border-t" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
                        {memory.contributor_name ? (
                          <div className="flex items-center gap-2">
                            {memory.contributor_avatar ? (
                              <Image
                                src={memory.contributor_avatar}
                                alt={memory.contributor_name}
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                                style={{
                                  width: 24,
                                  height: 24,
                                  background: 'linear-gradient(135deg, #D4A373 0%, #C49A6C 50%, #B8895A 100%)',
                                  color: '#2B2B2B',
                                  fontFamily: 'var(--font-serif, Georgia, serif)',
                                  fontSize: 10,
                                }}
                              >
                                {memory.contributor_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                              {memory.contributor_name}
                            </span>
                          </div>
                        ) : <div />}
                        <div className="flex gap-4 items-center">
                          {/* Drag handle visual */}
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(212,163,115,0.35)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="9" cy="5" r="1.5"/>
                              <circle cx="15" cy="5" r="1.5"/>
                              <circle cx="9" cy="12" r="1.5"/>
                              <circle cx="15" cy="12" r="1.5"/>
                              <circle cx="9" cy="19" r="1.5"/>
                              <circle cx="15" cy="19" r="1.5"/>
                            </svg>
                          </div>
                          <Link
                            href={`/books/${id}/edit?memory=${memory.id}`}
                            className="text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-70"
                            style={{ color: 'var(--bronze)' }}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this memory? This cannot be undone.')) {
                                handleDeleteMemory(memory.id);
                              }
                            }}
                            className="text-xs flex items-center gap-1.5 transition-colors hover:opacity-70"
                            style={{ color: '#9A9A8A' }}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                            </svg>
                            Delete
                          </button>
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
      <AnimatePresence>
        {showMembersModal && currentUserId && currentUserRole && (
          <MembersModal
            bookId={parseInt(id)}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onClose={() => setShowMembersModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}