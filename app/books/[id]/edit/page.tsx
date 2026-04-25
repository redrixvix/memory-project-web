'use client';

import { generateReactHelpers } from '@uploadthing/react';
import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { AudioUploader } from '@/components/upload-button';
import { Button } from '@/components/ui/button';
import { ImageGallery, type ImageGalleryItem, DropZone } from '@/components/image-gallery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';
import { flattenMemoryPrompts, isMemoryPromptGroups, type MemoryPromptGroup } from '@/lib/memory-prompts';

type SaveState = 'idle' | 'saving' | 'saved';
type PromptLoadState = 'loading' | 'ready' | 'empty' | 'error';

interface Book {
  id: number;
  title: string;
  description: string | null;
  storage_tier: string;
  plan: string;
  owner_name: string;
}

interface DraftState {
  prompt: string;
  customPrompt: string;
  answer: string;
  photoUrls: string[];
  audioUrl: string | null;
}

interface PhotoDraftItem extends ImageGalleryItem {
  uploadedUrl: string | null;
  sourceFile?: File;
}

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const NO_PROMPT_VALUE = '__none__';
const CUSTOM_PROMPT_VALUE = '__custom__';

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
  const [promptGroups, setPromptGroups] = useState<MemoryPromptGroup[]>([]);
  const [promptLoadState, setPromptLoadState] = useState<PromptLoadState>('loading');
  const [promptLoadMessage, setPromptLoadMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMemory, setFetchingMemory] = useState(!!memoryId);
  const [fetchingBook, setFetchingBook] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [photoItems, setPhotoItems] = useState<PhotoDraftItem[]>([]);
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const draftKey = `draft-${id}-${memoryId ?? 'new'}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoItemsRef = useRef<PhotoDraftItem[]>([]);
  const activePlan = normalizeBookPlan(book?.plan, book?.storage_tier);
  const canUseMedia = activePlan !== 'free';
  const allPresetPrompts = useMemo(() => flattenMemoryPrompts(promptGroups), [promptGroups]);
  const uploadedPhotoUrls = useMemo(
    () => photoItems.flatMap((item) => item.uploadedUrl ? [item.uploadedUrl] : []),
    [photoItems]
  );
  const hasUploadingPhotos = photoItems.some((item) => item.status === 'uploading');
  const hasErroredPhotos = photoItems.some((item) => item.status === 'error');
  const promptSelectValue = useCustomPrompt
    ? CUSTOM_PROMPT_VALUE
    : prompt
      ? prompt
      : NO_PROMPT_VALUE;
  const { startUpload: startImageUpload } = useUploadThing('imageUploader');

  useEffect(() => {
    photoItemsRef.current = photoItems;
  }, [photoItems]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      photoItemsRef.current.forEach(revokePreviewUrl);
    };
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => {
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        setIsCheckingAuth(false);
      })
      .catch(() => {
        router.push('/login');
      });

    void fetchBook();
    void loadPromptGroups();

    if (memoryId) {
      void fetchMemory(memoryId);
      return;
    }

    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as DraftState;
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.customPrompt) setCustomPrompt(parsed.customPrompt);
        if (parsed.answer) {
          setAnswer(parsed.answer);
          setWordCount(parsed.answer.trim() ? parsed.answer.trim().split(/\s+/).length : 0);
        }
        if (Array.isArray(parsed.photoUrls)) {
          setPhotoItems(createDraftPhotoItems(parsed.photoUrls));
        }
        if (parsed.audioUrl) setAudioUrl(parsed.audioUrl);
      } catch {}
    }

    setDraftLoaded(true);
  }, [draftKey, id, memoryId, router]);

  useEffect(() => {
    if (!prompt) {
      setUseCustomPrompt(false);
      return;
    }

    if (allPresetPrompts.includes(prompt)) {
      setUseCustomPrompt(false);
      return;
    }

    setUseCustomPrompt(true);
    if (customPrompt !== prompt) {
      setCustomPrompt(prompt);
    }
  }, [allPresetPrompts, customPrompt, prompt]);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveState('saving');
    saveTimerRef.current = setTimeout(() => {
      try {
        const nextDraft: DraftState = {
          prompt,
          customPrompt,
          answer,
          photoUrls: uploadedPhotoUrls,
          audioUrl,
        };
        localStorage.setItem(draftKey, JSON.stringify(nextDraft));
      } catch {}

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 700);
  }, [answer, audioUrl, customPrompt, draftKey, draftLoaded, prompt, uploadedPhotoUrls]);

  async function fetchBook() {
    try {
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setBook(data.book);
    } catch {}
    finally {
      setFetchingBook(false);
    }
  }

  async function loadPromptGroups() {
    setPromptLoadState('loading');
    setPromptLoadMessage('');

    try {
      const response = await fetch('/api/prompts', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load prompts right now.');
      }

      const data = await response.json();
      if (!isMemoryPromptGroups(data.groups)) {
        throw new Error('Prompt data came back in an unexpected format.');
      }

      if (data.groups.length === 0) {
        setPromptGroups([]);
        setPromptLoadState('empty');
        setPromptLoadMessage('No guided prompts are available right now. You can still write freely.');
        return;
      }

      setPromptGroups(data.groups);
      setPromptLoadState('ready');
    } catch (error) {
      setPromptGroups([]);
      setPromptLoadState('error');
      setPromptLoadMessage(error instanceof Error ? error.message : 'Unable to load prompts right now.');
    }
  }

  async function fetchMemory(memoryIdentifier: string) {
    try {
      const response = await fetch(`/api/memories/${memoryIdentifier}`);
      if (response.ok) {
        const data = await response.json();
        setPrompt(data.memory.prompt_question || '');
        setAnswer(data.memory.answer_text || '');
        setWordCount((data.memory.answer_text || '').trim() ? (data.memory.answer_text || '').trim().split(/\s+/).length : 0);
        setPhotoItems(createDraftPhotoItems(data.memory.photo_urls || []));
        setAudioUrl(data.memory.audio_url || null);

        try {
          localStorage.removeItem(draftKey);
        } catch {}
      } else if (response.status === 404) {
        router.replace(`/books/${id}/edit`);
      }
    } catch {}
    finally {
      setDraftLoaded(true);
      setFetchingMemory(false);
    }
  }

  const handleAnswerChange = useCallback((value: string) => {
    setAnswer(value);
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
  }, [draftKey]);

  const uploadSinglePhoto = useCallback(async (itemId: string, file: File) => {
    setPhotoItems((current) => current.map((item) => (
      item.id === itemId
        ? { ...item, status: 'uploading', error: undefined }
        : item
    )));

    try {
      const result = await startImageUpload([file]);
      const uploaded = result?.[0];
      if (!uploaded?.url) {
        throw new Error('Upload finished without a file URL.');
      }

      setPhotoItems((current) => current.map((item) => (
        item.id === itemId
          ? {
              ...item,
              status: 'uploaded',
              uploadedUrl: uploaded.url,
              fileName: uploaded.name ?? item.fileName,
            }
          : item
      )));
    } catch (error) {
      const message = getUploadErrorMessage(error);
      setPhotoItems((current) => current.map((item) => (
        item.id === itemId
          ? { ...item, status: 'error', error: message }
          : item
      )));
    }
  }, [startImageUpload]);

  const handlePhotoFiles = useCallback((files: File[]) => {
    if (!files.length) {
      return;
    }

    const nextErrors: string[] = [];
    const nextItems: PhotoDraftItem[] = [];

    files.forEach((file) => {
      const validationError = getImageValidationError(file);
      if (validationError) {
        nextErrors.push(`${file.name}: ${validationError}`);
        return;
      }

      const itemId = `${file.name}-${file.lastModified}-${crypto.randomUUID()}`;
      nextItems.push({
        id: itemId,
        previewUrl: URL.createObjectURL(file),
        uploadedUrl: null,
        fileName: file.name,
        sourceFile: file,
        status: 'uploading',
      });
    });

    setMediaErrors(nextErrors);
    if (!nextItems.length) {
      return;
    }

    setPhotoItems((current) => [...current, ...nextItems]);
    nextItems.forEach((item) => {
      if (item.sourceFile) {
        void uploadSinglePhoto(item.id, item.sourceFile);
      }
    });
  }, [uploadSinglePhoto]);

  const handleRetryPhoto = useCallback((idToRetry: string) => {
    const retryItem = photoItems.find((item) => item.id === idToRetry);
    if (!retryItem?.sourceFile) {
      return;
    }

    void uploadSinglePhoto(idToRetry, retryItem.sourceFile);
  }, [photoItems, uploadSinglePhoto]);

  const handleRemovePhoto = useCallback((idToRemove: string) => {
    setPhotoItems((current) => {
      const itemToRemove = current.find((item) => item.id === idToRemove);
      if (itemToRemove) {
        revokePreviewUrl(itemToRemove);
      }

      return current.filter((item) => item.id !== idToRemove);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || hasUploadingPhotos) return;

    setLoading(true);
    clearDraft();

    try {
      const payload = {
        prompt_question: prompt || null,
        answer_text: answer,
        photo_urls: uploadedPhotoUrls,
        audio_url: audioUrl,
      };

      if (memoryId) {
        await fetch(`/api/memories/${memoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/books/${id}/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/books/${id}`} className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-70 shrink-0" style={{ color: '#6A6A5A' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
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
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="px-5 md:px-10 py-8 md:py-12 max-w-4xl mx-auto w-full">
        <div
          className="relative overflow-hidden rounded-[2rem] border px-5 py-6 md:px-8 md:py-8"
          style={{
            background: 'linear-gradient(180deg, rgba(253,252,245,0.96) 0%, rgba(250,237,205,0.74) 100%)',
            borderColor: 'rgba(212,163,115,0.22)',
            boxShadow: '0 22px 64px rgba(212,163,115,0.12)',
          }}
        >
          <div className="hero-ambient" />

          <div className="relative mb-8 md:mb-10">
            <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>
              Memory entry
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h1 className="display-md mb-3" style={{ color: 'var(--charcoal)' }}>
                  {memoryId ? 'Edit Memory' : 'Add a Memory'}
                </h1>
                <p className="text-[0.98rem] leading-7" style={{ color: '#6A6A5A' }}>
                  Capture one vivid story at a time. A prompt can help you begin, or you can skip it and write freely in your own voice.
                </p>
              </div>

              <div
                className="rounded-[1.25rem] border px-4 py-3 text-sm md:max-w-xs"
                style={{
                  backgroundColor: 'rgba(254,250,224,0.78)',
                  borderColor: 'rgba(212,163,115,0.18)',
                  color: '#6A6A5A',
                }}
              >
                <span className="label-caps block mb-1" style={{ color: 'var(--bronze)' }}>
                  Kept private
                </span>
                Your memory stays private until you decide to share or print it.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative flex flex-col gap-6 md:gap-7">
            <section
              className="rounded-[1.75rem] border p-5 md:p-6"
              style={{
                backgroundColor: 'rgba(253,252,245,0.88)',
                borderColor: 'rgba(212,163,115,0.18)',
              }}
            >
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <Label className="mb-2 block label-caps" style={{ color: 'var(--bronze)' }}>
                    Writing prompt
                  </Label>
                  <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                    Choose a guided question, skip it, or write your own.
                  </p>
                </div>
                <div
                  className="rounded-full px-3 py-1 text-xs"
                  style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#7B6B56', fontFamily: 'var(--font-sans)' }}
                >
                  Optional
                </div>
              </div>

              <div className="relative">
                <select
                  value={promptLoadState === 'ready' || useCustomPrompt ? promptSelectValue : NO_PROMPT_VALUE}
                  onChange={(e) => handlePromptSelectChange(e.target.value, { customPrompt, setCustomPrompt, setPrompt, setUseCustomPrompt })}
                  disabled={promptLoadState === 'loading'}
                  className="w-full appearance-none rounded-[1.15rem] border px-4 py-3.5 pr-12 text-sm md:text-[0.95rem] transition-colors outline-none"
                  style={{
                    borderColor: 'rgba(212,163,115,0.28)',
                    backgroundColor: '#FDFCF5',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  aria-label="Choose a writing prompt"
                >
                  {promptLoadState === 'loading' && (
                    <option value={NO_PROMPT_VALUE}>Loading prompts…</option>
                  )}
                  {promptLoadState !== 'loading' && (
                    <>
                      <option value={NO_PROMPT_VALUE}>No prompt — write freely</option>
                      {promptLoadState === 'ready' && promptGroups.map((group) => (
                        <optgroup key={group.category} label={group.category}>
                          {group.prompts.map((promptOption) => (
                            <option key={promptOption} value={promptOption}>
                              {promptOption}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value={CUSTOM_PROMPT_VALUE}>Write my own prompt…</option>
                    </>
                  )}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  style={{ color: '#8E7861' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {useCustomPrompt && (
                <div className="mt-4">
                  <Label className="mb-2 block text-xs font-medium" style={{ color: '#7A6D5A', fontFamily: 'var(--font-sans)' }}>
                    Custom prompt
                  </Label>
                  <Input
                    value={customPrompt}
                    onChange={(e) => {
                      setCustomPrompt(e.target.value);
                      setPrompt(e.target.value);
                    }}
                    placeholder="What would you like this memory to begin with?"
                    className="h-11 rounded-[1rem] border px-4 text-sm"
                    style={{ borderColor: 'rgba(212,163,115,0.28)', backgroundColor: '#FDFCF5' }}
                  />
                </div>
              )}

              {promptLoadState !== 'ready' && (
                <div
                  className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
                  style={{
                    backgroundColor: 'rgba(250,237,205,0.48)',
                    borderColor: promptLoadState === 'error' ? 'rgba(169,84,60,0.28)' : 'rgba(212,163,115,0.2)',
                    color: '#6A6A5A',
                  }}
                >
                  <p>{promptLoadMessage || 'You can still write freely while prompts are unavailable.'}</p>
                  {promptLoadState === 'error' && (
                    <button
                      type="button"
                      onClick={() => void loadPromptGroups()}
                      className="mt-3 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
                      style={{ backgroundColor: 'rgba(212,163,115,0.14)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                    >
                      Retry prompts
                    </button>
                  )}
                </div>
              )}

              {prompt && (
                <div
                  className="mt-4 flex items-start gap-3 rounded-[1rem] px-4 py-3"
                  style={{ backgroundColor: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.2)' }}
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <p className="text-sm italic leading-6" style={{ color: 'var(--charcoal)' }}>
                    {prompt}
                  </p>
                </div>
              )}
            </section>

            <section
              className="rounded-[1.75rem] border p-5 md:p-6"
              style={{
                backgroundColor: 'rgba(250,237,205,0.42)',
                borderColor: 'rgba(212,163,115,0.18)',
              }}
            >
              <div className="mb-4 flex justify-between items-center gap-3">
                <div>
                  <Label className="mb-2 block label-caps" style={{ color: 'var(--bronze)' }}>
                    Your memory
                  </Label>
                  <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                    Write as much or as little as you need. You can refine it later.
                  </p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs tabular-nums shrink-0" style={{ backgroundColor: 'rgba(254,250,224,0.85)', color: '#7A6D5A', fontFamily: 'var(--font-sans)' }}>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              </div>
              <Textarea
                value={answer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                required
                className="min-h-[320px] rounded-[1.4rem] border-0 px-5 py-5 text-base md:text-lg leading-[1.9] shadow-[inset_0_0_0_1px_rgba(212,163,115,0.2)]"
                rows={14}
                placeholder="Take your time. There's no right or wrong way to write a memory — just tell it like it was..."
                style={{
                  backgroundColor: '#FFFDF6',
                  fontFamily: 'var(--font-serif)',
                  resize: 'vertical',
                }}
              />
            </section>

            <section
              className="rounded-[1.75rem] border p-5 md:p-6"
              style={{
                backgroundColor: 'rgba(253,252,245,0.88)',
                borderColor: 'rgba(212,163,115,0.18)',
              }}
            >
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <Label className="mb-2 block label-caps" style={{ color: 'var(--bronze)' }}>
                    Photos &amp; Audio
                  </Label>
                  <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                    Add images and voice recordings to make the story feel lived-in.
                  </p>
                </div>
                <div className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: 'rgba(204,213,174,0.24)', color: '#5E644F', fontFamily: 'var(--font-sans)' }}>
                  Optional
                </div>
              </div>

              {canUseMedia ? (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', fontFamily: 'var(--font-sans)' }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          handlePhotoFiles(Array.from(e.target.files ?? []));
                          e.currentTarget.value = '';
                        }}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                      </svg>
                      Add Photos
                    </label>
                    <AudioUploader
                      onUploadComplete={(result) => {
                        if (result[0]) {
                          setAudioUrl(result[0].url);
                        }
                      }}
                    />
                    <p className="text-xs" style={{ color: '#7A6D5A', fontFamily: 'var(--font-sans)' }}>
                      Images up to 4MB each. Previews appear immediately.
                    </p>
                  </div>

                  <DropZone onFilesSelected={handlePhotoFiles} className="mb-1" />

                  {mediaErrors.length > 0 && (
                    <div
                      className="rounded-[1rem] border px-4 py-3 text-sm"
                      style={{
                        backgroundColor: 'rgba(185,28,28,0.08)',
                        borderColor: 'rgba(185,28,28,0.18)',
                        color: '#7C2D12',
                      }}
                    >
                      {mediaErrors.map((message) => (
                        <p key={message}>{message}</p>
                      ))}
                    </div>
                  )}

                  {photoItems.length > 0 && (
                    <div
                      className="rounded-[1.5rem] p-5"
                      style={{
                        backgroundColor: 'rgba(250,237,205,0.35)',
                        border: '1px solid rgba(212,163,115,0.16)',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-medium" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                          {photoItems.length} {photoItems.length === 1 ? 'photo' : 'photos'} attached
                        </p>
                        <p className="text-xs" style={{ color: hasErroredPhotos ? '#9A5A4A' : '#9A9A8A', fontFamily: 'var(--font-sans)' }}>
                          {hasUploadingPhotos ? 'Finishing uploads…' : hasErroredPhotos ? 'Retry failed uploads or save without them.' : 'Remove any photo you do not want to keep.'}
                        </p>
                      </div>
                      <ImageGallery
                        items={photoItems}
                        onRemove={handleRemovePhoto}
                        onRetry={handleRetryPhoto}
                      />
                    </div>
                  )}

                  {audioUrl && (
                    <div
                      className="flex items-center gap-4 rounded-2xl p-4 animate-fade-up"
                      style={{
                        backgroundColor: 'rgba(204,213,174,0.2)',
                        border: '1px solid rgba(212,163,115,0.15)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(204,213,174,0.4)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--charcoal)' }}>
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
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,163,115,0.08) 0%, rgba(204,213,174,0.1) 100%)',
                    border: '1px solid rgba(212,163,115,0.2)',
                  }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bronze)' }}>
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                    Add photos &amp; voice recordings
                  </p>
                  <p className="text-xs mb-4" style={{ color: '#6A6A5A' }}>
                    Upgrade to Plus or Premium to preserve photos and audio with each memory.
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
            </section>

            <section
              className="rounded-[1.5rem] border px-4 py-3 text-sm"
              style={{
                backgroundColor: 'rgba(212,163,115,0.08)',
                borderColor: 'rgba(212,163,115,0.14)',
                color: '#6A6A5A',
              }}
            >
              <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Your draft autosaves while you write. Uploaded photos stay attached if you come back later.
            </section>

            <div className="flex flex-col gap-3 pt-1 pb-2 md:flex-row">
              <Button
                type="submit"
                disabled={loading || !answer.trim() || hasUploadingPhotos}
                className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed h-11 px-7"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                    Saving...
                  </>
                ) : hasUploadingPhotos ? 'Finishing photo uploads…' : memoryId ? 'Update Memory' : 'Save Memory'}
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
        </div>
      </main>
    </div>
  );
}

function createDraftPhotoItems(urls: string[]): PhotoDraftItem[] {
  return urls.map((url, index) => ({
    id: `${url}-${index}`,
    previewUrl: url,
    uploadedUrl: url,
    fileName: `Saved photo ${index + 1}`,
    status: 'uploaded',
  }));
}

function handlePromptSelectChange(
  value: string,
  actions: {
    customPrompt: string;
    setCustomPrompt: (value: string) => void;
    setPrompt: (value: string) => void;
    setUseCustomPrompt: (value: boolean) => void;
  }
) {
  if (value === NO_PROMPT_VALUE) {
    actions.setUseCustomPrompt(false);
    actions.setPrompt('');
    return;
  }

  if (value === CUSTOM_PROMPT_VALUE) {
    actions.setUseCustomPrompt(true);
    actions.setPrompt(actions.customPrompt);
    return;
  }

  actions.setUseCustomPrompt(false);
  actions.setPrompt(value);
}

function getImageValidationError(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file.';
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'This file is larger than the 4MB limit.';
  }

  return null;
}

function getUploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'The upload failed. Please try again.';
}

function revokePreviewUrl(item: PhotoDraftItem) {
  if (item.sourceFile && item.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(item.previewUrl);
  }
}
