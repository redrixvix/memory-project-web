'use client';

import { useEffect, useState, useRef, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImageUploader, AudioUploader } from '@/components/upload-button';
import { ImageGallery, DropZone } from '@/components/image-gallery';
import { getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';

const PROMPTS = [
  { category: "Family & Roots", prompts: [
    "What do you remember about your grandparents?",
    "What's your favorite memory with your parents?",
    "Tell me about the house you grew up in.",
    "Describe a typical Sunday morning growing up.",
  ]},
  { category: "Life Moments", prompts: [
    "What was your wedding day like?",
    "Tell me about your first job.",
    "What was the best day of your life?",
    "Describe a holiday tradition you loved.",
  ]},
  { category: "Relationships", prompts: [
    "Tell me about your best friend growing up.",
    "What's a skill you're proud of learning?",
    "Describe a time you felt truly proud of yourself.",
  ]},
  { category: "Adventures", prompts: [
    "Tell me about a trip that changed your perspective.",
    "What's the most beautiful place you've ever seen?",
    "Describe a meal you'll never forget.",
  ]},
];

type SaveState = 'idle' | 'saving' | 'saved';

interface Book {
  id: number;
  title: string;
  description: string | null;
  storage_tier: string;
  plan: string;
  owner_name: string;
}

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

export default function EditMemory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const memoryId = searchParams.get('memory');

  const [book, setBook] = useState<Book | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMemory, setFetchingMemory] = useState(!!memoryId);
  const [fetchingBook, setFetchingBook] = useState(true);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const draftKey = `draft-${id}-${memoryId ?? 'new'}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePlan = normalizeBookPlan(book?.plan, book?.storage_tier);
  const canUseMedia = activePlan !== 'free';

  useEffect(() => {
    // Auth check first — show loading until confirmed
    fetch('/api/auth/me')
      .then(r => { if (r.status === 401) router.push('/login'); else setIsCheckingAuth(false); })
      .catch(() => { router.push('/login'); });
    fetchBook();
    if (memoryId) { fetchMemory(memoryId); }
    else {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const { prompt: dp, customPrompt: dc, answer: da, photoUrls: dp2, audioUrl: da2 } = JSON.parse(draft);
          if (dp) setPrompt(dp);
          if (da) { setAnswer(da); setWordCount(da.trim() ? da.trim().split(/\s+/).length : 0); }
          if (dc) { setCustomPrompt(dc); setUseCustomPrompt(true); }
          if (dp2) setPhotoUrls(dp2);
          if (da2) setAudioUrl(da2);
        } catch {}
      }
    }
  }, [memoryId, id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data.book);
      }
    } catch {}
    finally { setFetchingBook(false); }
  };

  useEffect(() => {
    if (prompt && !useCustomPrompt) {
      const allPresetPrompts = PROMPTS.flatMap(g => g.prompts);
      if (!allPresetPrompts.includes(prompt)) {
        setUseCustomPrompt(true);
        setCustomPrompt(prompt);
      }
    }
  }, [prompt, useCustomPrompt]);

  const handleAnswerChange = useCallback((val: string) => {
    setAnswer(val);
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    setWordCount(words);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState('saving');
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ prompt, customPrompt, answer: val, photoUrls, audioUrl }));
      } catch {}
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 800);
  }, [prompt, customPrompt, draftKey, photoUrls, audioUrl]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(draftKey); } catch {}
  }, [draftKey]);

  const fetchMemory = async (mid: string) => {
    try {
      const res = await fetch(`/api/memories/${mid}`);
      if (res.ok) {
        const data = await res.json();
        setPrompt(data.memory.prompt_question || '');
        setAnswer(data.memory.answer_text || '');
        setWordCount(data.memory.answer_text.trim() ? data.memory.answer_text.trim().split(/\s+/).length : 0);
        setPhotoUrls(data.memory.photo_urls || []);
        setAudioUrl(data.memory.audio_url || null);
        try { localStorage.removeItem(draftKey); } catch {}
      } else if (res.status === 404) {
        router.replace(`/books/${id}/edit`);
      }
    } catch {}
    finally { setFetchingMemory(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    clearDraft();
    try {
      if (memoryId) {
        await fetch(`/api/memories/${memoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_question: prompt, answer_text: answer, photo_urls: photoUrls, audio_url: audioUrl }),
        });
      } else {
        await fetch(`/api/books/${id}/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_question: prompt, answer_text: answer, photo_urls: photoUrls, audio_url: audioUrl }),
        });
      }
      router.push(`/books/${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMemory || fetchingBook || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP NAV (matches book detail page) ── */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/books/${id}`} className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-70 shrink-0" style={{ color: '#6A6A5A' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back
            </Link>
            {book && (
              <>
                <span style={{ color: 'rgba(212,163,115,0.3)' }}>·</span>
                <h1 className="text-base md:text-lg font-medium truncate" style={{ color: 'var(--charcoal)' }}>
                  {book.title}
                </h1>
                <span className="ml-2 shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={getPlanBadgeStyles(book.plan)}>
                  {getBookPlanLabel(book.plan, book.storage_tier)}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6A6A5A' }}>
            {saveState === 'saving' && (
              <>
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.4)' }} />
                <span>Saving...</span>
              </>
            )}
            {saveState === 'saved' && (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--tea-green)' }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── EDITOR CONTENT ── */}
      <main className="px-6 md:px-10 py-12 max-w-3xl mx-auto w-full">

        {/* Decorative accent bar */}
        <div className="mb-10 pl-5 border-l-4 rounded-full" style={{ borderColor: 'var(--bronze)', opacity: 0.4 }} />

        {/* Page header */}
        <div className="mb-10">
          <h1 className="display-md mb-3" style={{ color: 'var(--charcoal)' }}>
            {memoryId ? 'Edit Memory' : 'Add a Memory'}
          </h1>
          <p className="text-base" style={{ color: '#6A6A5A' }}>
            Write about a moment that matters to you. Take your time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Prompt selector */}
          <div>
            <Label className="mb-3 block label-caps" style={{ color: 'var(--bronze)' }}>
              Writing prompt
              <span className="font-normal opacity-60 ml-2" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.8125rem' }}>(optional — choose one or skip it)</span>
            </Label>

            <div className="space-y-4">
              {/* Mobile: browse button */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setShowAllPrompts(true)}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 border text-sm transition-colors"
                  style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: '#FDFCF5', color: 'var(--charcoal)' }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                    {prompt ? 'Change prompt' : 'Browse writing prompts'}
                  </span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>

              {/* Desktop: chip grid */}
              <div className="hidden md:block">
                {PROMPTS.map((group) => (
                  <div key={group.category} className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6A6A5A' }}>{group.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.prompts.map((p) => (
                        <Button
                          key={p}
                          type="button"
                          variant={prompt === p && !useCustomPrompt ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => { setPrompt(p); setUseCustomPrompt(false); }}
                          className="rounded-full text-xs"
                          style={prompt === p && !useCustomPrompt
                            ? { backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }
                            : { borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)' }
                          }
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                  <span className="text-xs" style={{ color: '#6A6A5A' }}>or write your own</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant={useCustomPrompt ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setUseCustomPrompt(true);
                      if (!customPrompt) {
                        const defaultPrompt = "What's a memory you'll never forget?";
                        setCustomPrompt(defaultPrompt);
                        setPrompt(defaultPrompt);
                      }
                    }}
                    className="rounded-full w-full justify-start text-left"
                    style={useCustomPrompt
                      ? { backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }
                      : { borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)', backgroundColor: 'transparent' }
                    }
                  >
                    Write your own prompt…
                  </Button>
                  {useCustomPrompt && (
                    <Input
                      value={customPrompt}
                      onChange={(e) => { setCustomPrompt(e.target.value); setPrompt(e.target.value); }}
                      placeholder="e.g. What's the bravest thing you've ever done?"
                      className="rounded-xl text-sm"
                      style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: '#FDFCF5' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Selected prompt preview */}
            {prompt && (
              <div
                className="my-4 flex items-start gap-2 rounded-xl p-3 animate-fade-up"
                style={{ backgroundColor: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.22)' }}
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <p className="text-sm font-medium italic" style={{ color: 'var(--charcoal)' }}>{prompt}</p>
              </div>
            )}
          </div>

          {/* Writing area */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="label-caps" style={{ color: 'var(--bronze)' }}>Your memory</Label>
              <span className="text-xs tabular-nums" style={{ color: '#6A6A5A' }}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <Textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              required
              className="text-base md:text-lg leading-[1.85] rounded-xl min-h-[320px]"
              rows={14}
              placeholder="Take your time. There's no right or wrong way to write a memory — just tell it like it was..."
              style={{
                borderColor: 'rgba(212,163,115,0.3)',
                backgroundColor: 'var(--papaya)',
                fontFamily: 'var(--font-serif)',
                resize: 'vertical',
              }}
            />
          </div>

          {/* ── Photos & Audio Section ── */}
          <div>
            <Label className="mb-4 block label-caps" style={{ color: 'var(--bronze)' }}>
              Photos &amp; Audio
              <span className="font-normal opacity-60 ml-2" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.8125rem' }}>(optional)</span>
            </Label>

            {canUseMedia ? (
              <div className="flex flex-col gap-5">
                {/* Upload buttons row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <ImageUploader
                    onUploadComplete={(res) => setPhotoUrls(prev => [...prev, ...res.map(r => r.url)])}
                  />
                  <AudioUploader
                    onUploadComplete={(res) => {
                      if (res[0]) setAudioUrl(res[0].url);
                    }}
                  />
                </div>

                {/* Drop zone hint */}
                {photoUrls.length === 0 && (
                  <DropZone
                    onFilesSelected={(files) => {
                      // Create object URLs for preview (actual upload happens via ImageUploader)
                    }}
                    disabled
                    className="mb-2"
                  />
                )}

                {/* Image Gallery */}
                {photoUrls.length > 0 && (
                  <div
                    className="rounded-2xl p-5 animate-fade-up"
                    style={{
                      backgroundColor: 'rgba(250,237,205,0.3)',
                      border: '1px solid rgba(212,163,115,0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-medium" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                        {photoUrls.length} {photoUrls.length === 1 ? 'photo' : 'photos'} added
                      </p>
                      <p className="text-xs" style={{ color: '#9A9A8A', fontFamily: 'var(--font-sans)' }}>
                        Click photo to remove
                      </p>
                    </div>
                    <ImageGallery
                      urls={photoUrls}
                      onRemove={(i) => setPhotoUrls(prev => prev.filter((_, idx) => idx !== i))}
                    />
                  </div>
                )}

                {/* Audio preview */}
                {audioUrl && (
                  <div
                    className="flex items-center gap-4 rounded-2xl p-4 animate-fade-up"
                    style={{
                      backgroundColor: 'rgba(204,213,174,0.2)',
                      border: '1px solid rgba(212,163,115,0.15)',
                    }}
                  >
                    {/* Audio icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(204,213,174,0.4)' }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: 'var(--charcoal)' }}
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </div>
                    <audio src={audioUrl} controls className="flex-1 h-9" />
                    <button
                      type="button"
                      onClick={() => setAudioUrl(null)}
                      className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-70 shrink-0"
                      style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}
                      aria-label="Remove audio"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Upgrade nudge for free plan */
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,163,115,0.08) 0%, rgba(204,213,174,0.1) 100%)',
                  border: '1px solid rgba(212,163,115,0.2)',
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--bronze)' }}
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                  Add photos &amp; voice recordings
                </p>
                <p className="text-xs mb-4" style={{ color: '#6A6A5A' }}>
                  Upgrade to Plus or Premium to preserve photos and audio with each memory
                </p>
                <Link
                  href={`/upgrade?book=${id}`}
                  className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                >
                  Upgrade this book
                </Link>
              </div>
            )}
          </div>

          {/* Privacy hint */}
          <div
            className="text-xs text-center py-3 px-4 rounded-xl"
            style={{ color: '#6A6A5A', backgroundColor: 'rgba(212,163,115,0.08)' }}
          >
            <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Your memory is private until you decide to share it.
          </div>

          {/* Action row */}
          <div className="flex gap-3 pt-2 pb-12">
            <Button
              type="submit"
              disabled={loading || !answer.trim()}
              className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', height: '2.75rem', paddingLeft: '1.75rem', paddingRight: '1.75rem' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                  Saving...
                </>
              ) : memoryId ? 'Update Memory' : 'Save Memory'}
            </Button>
            <Link
              href={`/books/${id}`}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: 'rgba(212,163,115,0.3)', color: 'var(--charcoal)', backgroundColor: '#FDFCF5' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      {/* Mobile full-screen prompt picker */}
      {showAllPrompts && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col" style={{ backgroundColor: 'var(--cornsilk)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'rgba(212,163,115,0.2)', backgroundColor: '#FDFCF5' }}>
            <h2 className="text-base font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>Choose a prompt</h2>
            <button
              type="button"
              onClick={() => setShowAllPrompts(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#6A6A5A' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto px-5 py-6 space-y-6">
            {PROMPTS.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6A6A5A' }}>{group.category}</p>
                <div className="space-y-2">
                  {group.prompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPrompt(p); setUseCustomPrompt(false); setShowAllPrompts(false); }}
                      className="w-full text-left rounded-xl px-4 py-3 text-sm transition-colors"
                      style={prompt === p && !useCustomPrompt
                        ? { backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }
                        : { backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.2)', color: 'var(--charcoal)' }
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6A6A5A' }}>Custom prompt</p>
              <button
                type="button"
                onClick={() => {
                  setUseCustomPrompt(true);
                  if (!customPrompt) {
                    const defaultPrompt = "What's a memory you'll never forget?";
                    setCustomPrompt(defaultPrompt);
                    setPrompt(defaultPrompt);
                  }
                }}
                className="w-full text-left rounded-xl px-4 py-3 text-sm transition-colors"
                style={useCustomPrompt
                  ? { backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }
                  : { backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.2)', color: 'var(--charcoal)' }
                }
              >
                {useCustomPrompt ? 'Writing custom prompt…' : 'Write your own…'}
              </button>
              {useCustomPrompt && (
                <Input
                  value={customPrompt}
                  onChange={(e) => { setCustomPrompt(e.target.value); setPrompt(e.target.value); }}
                  placeholder="What's a memory you'll never forget?"
                  className="rounded-xl text-sm mt-2"
                  style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: '#FDFCF5' }}
                />
              )}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAllPrompts(false)}
                  className="text-sm px-4 py-2 rounded-full"
                  style={{ color: '#6A6A5A' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllPrompts(false)}
                  className="text-sm px-4 py-2 rounded-full"
                  style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
