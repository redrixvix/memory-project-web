'use client';

import { generateReactHelpers } from '@uploadthing/react';
import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import type { MutableRefObject } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { Button } from '@/components/ui/button';
import { ImageGallery, type ImageGalleryItem, DropZone } from '@/components/image-gallery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getBookPlanLabel, normalizeBookPlan } from '@/lib/book-plan';
import { flattenMemoryPrompts, getMemoryPromptGroups, isMemoryPromptGroups, type MemoryPromptGroup } from '@/lib/memory-prompts';

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
  uploadedKey: string | null;
  uploadedUrl: string | null;
  sourceFile?: File;
}

type AudioDraftStatus = 'ready' | 'uploading' | 'uploaded' | 'error';
type RecorderState = 'idle' | 'requesting' | 'recording' | 'processing' | 'unsupported';

interface AudioDraft {
  previewUrl: string;
  uploadedKey: string | null;
  uploadedUrl: string | null;
  fileName: string;
  sourceFile?: File;
  status: AudioDraftStatus;
  error?: string;
}

interface ResolvedUpload {
  url: string | null;
  key: string | null;
  fileName: string | null;
}

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
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
    backgroundColor: 'rgba(212,163,115,0.25)',
    color: '#4A4A3A',
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
  const [audioDraft, setAudioDraft] = useState<AudioDraft | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');

  const draftKey = `draft-${id}-${memoryId ?? 'new'}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoItemsRef = useRef<PhotoDraftItem[]>([]);
  const audioDraftRef = useRef<AudioDraft | null>(null);
  const removedAssetKeysRef = useRef<Set<string>>(new Set());
  const removedPhotoIdsRef = useRef<Set<string>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const activePlan = normalizeBookPlan(book?.plan, book?.storage_tier);
  const canUseMedia = activePlan !== 'free';
  const allPresetPrompts = useMemo(() => flattenMemoryPrompts(promptGroups), [promptGroups]);
  const promptOptionCount = allPresetPrompts.length;
  const uploadedPhotoUrls = useMemo(
    () => photoItems.flatMap((item) => item.uploadedUrl ? [item.uploadedUrl] : []),
    [photoItems]
  );
  const hasUploadingPhotos = photoItems.some((item) => item.status === 'uploading');
  const hasErroredPhotos = photoItems.some((item) => item.status === 'error');
  const hasBlockingRecorderState = recorderState === 'requesting' || recorderState === 'recording' || recorderState === 'processing';
  const isSubmitDisabled = loading || !answer.trim() || hasUploadingPhotos || hasBlockingRecorderState;
  const promptSelectValue = useCustomPrompt
    ? CUSTOM_PROMPT_VALUE
    : prompt
      ? prompt
      : NO_PROMPT_VALUE;
  const { startUpload: startImageUpload } = useUploadThing('imageUploader');
  const { startUpload: startAudioUpload } = useUploadThing('audioUploader');
  const currentAudioUrl = audioDraft?.uploadedUrl ?? null;

  useEffect(() => {
    photoItemsRef.current = photoItems;
  }, [photoItems]);

  useEffect(() => {
    audioDraftRef.current = audioDraft;
  }, [audioDraft]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      stopRecorder(mediaRecorderRef, recorderStreamRef);
      photoItemsRef.current.forEach(revokePreviewUrl);
      revokeAudioPreview(audioDraftRef.current);
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
        if (parsed.audioUrl) {
          setAudioDraft(createExistingAudioDraft(parsed.audioUrl));
        }
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
          audioUrl: currentAudioUrl,
        };
        localStorage.setItem(draftKey, JSON.stringify(nextDraft));
      } catch {}

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 700);
  }, [answer, currentAudioUrl, customPrompt, draftKey, draftLoaded, prompt, uploadedPhotoUrls]);

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
      const fallbackGroups = getMemoryPromptGroups();
      const response = await fetch('/api/prompts', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load prompts right now.');
      }

      const data = await response.json();
      if (!isMemoryPromptGroups(data.groups)) {
        throw new Error('Prompt data came back in an unexpected format.');
      }

      if (data.groups.length === 0) {
        if (fallbackGroups.length > 0) {
          setPromptGroups(fallbackGroups);
          setPromptLoadState('ready');
          setPromptLoadMessage('Using built-in prompts while the live prompt list refreshes.');
          return;
        }

        setPromptGroups([]);
        setPromptLoadState('empty');
        setPromptLoadMessage('No guided prompts are available right now. You can still write freely.');
        return;
      }

      setPromptGroups(data.groups);
      setPromptLoadState('ready');
      setPromptLoadMessage('');
    } catch (error) {
      const fallbackGroups = getMemoryPromptGroups();
      if (fallbackGroups.length > 0) {
        setPromptGroups(fallbackGroups);
        setPromptLoadState('ready');
        setPromptLoadMessage('Using built-in prompts while live prompts are temporarily unavailable.');
        return;
      }

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
        setAudioDraft(data.memory.audio_url ? createExistingAudioDraft(data.memory.audio_url) : null);

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

  const replaceAudioDraft = useCallback((nextDraft: AudioDraft | null) => {
    const currentDraft = audioDraftRef.current;
    if (currentDraft && currentDraft.previewUrl !== nextDraft?.previewUrl) {
      revokeAudioPreview(currentDraft);
    }

    audioDraftRef.current = nextDraft;
    setAudioDraft(nextDraft);
  }, []);

  const queueUploadedAssetForDeletion = useCallback((key: string | null | undefined) => {
    if (!key) {
      return;
    }

    removedAssetKeysRef.current.add(key);
  }, []);

  const queuePhotoForDeletion = useCallback((item: PhotoDraftItem | undefined) => {
    const key = item?.uploadedKey
      ?? extractUploadThingKey(item?.uploadedUrl)
      ?? extractUploadThingKey(item?.previewUrl);

    queueUploadedAssetForDeletion(key);
  }, [queueUploadedAssetForDeletion]);

  const queueAudioForDeletion = useCallback((draft: AudioDraft | null) => {
    const key = draft?.uploadedKey
      ?? extractUploadThingKey(draft?.uploadedUrl)
      ?? extractUploadThingKey(draft?.previewUrl);

    queueUploadedAssetForDeletion(key);
  }, [queueUploadedAssetForDeletion]);

  const uploadSinglePhoto = useCallback(async (itemId: string, file: File) => {
    setPhotoItems((current) => current.map((item) => (
      item.id === itemId
        ? { ...item, status: 'uploading', error: undefined }
        : item
    )));

    try {
      const result = await startImageUpload([file]);
      const uploaded = result?.[0];
      const resolvedUpload = resolveUploadedFile(uploaded);
      if (!resolvedUpload.url) {
        throw new Error('Upload finished without a file URL.');
      }

      if (removedPhotoIdsRef.current.has(itemId)) {
        queueUploadedAssetForDeletion(resolvedUpload.key);
        removedPhotoIdsRef.current.delete(itemId);
        return;
      }

      setPhotoItems((current) => current.map((item) => (
        item.id === itemId
          ? {
              ...item,
              status: 'uploaded',
              uploadedKey: resolvedUpload.key,
              uploadedUrl: resolvedUpload.url,
              fileName: resolvedUpload.fileName ?? item.fileName,
            }
          : item
      )));
    } catch (error) {
      if (removedPhotoIdsRef.current.has(itemId)) {
        removedPhotoIdsRef.current.delete(itemId);
        return;
      }

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
        uploadedKey: null,
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
        removedPhotoIdsRef.current.add(idToRemove);
        queuePhotoForDeletion(itemToRemove);
        revokePreviewUrl(itemToRemove);
      }

      return current.filter((item) => item.id !== idToRemove);
    });
  }, [queuePhotoForDeletion]);

  const handleAudioFileSelection = useCallback((files: FileList | File[] | null) => {
    const file = Array.isArray(files)
      ? files[0]
      : files?.[0];

    if (!file) {
      return;
    }

    const validationError = getAudioValidationError(file);
    if (validationError) {
      setAudioError(validationError);
      return;
    }

    setAudioError(null);
    queueAudioForDeletion(audioDraftRef.current);
    replaceAudioDraft(createLocalAudioDraft(file));
  }, [queueAudioForDeletion, replaceAudioDraft]);

  const handleRemoveAudio = useCallback(() => {
    queueAudioForDeletion(audioDraftRef.current);
    setAudioError(null);
    replaceAudioDraft(null);
  }, [queueAudioForDeletion, replaceAudioDraft]);

  const handleStartRecording = useCallback(async () => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecorderState('unsupported');
      setAudioError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      setAudioError(null);
      setRecorderState('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredRecordingMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorderChunksRef.current = [];
      recorderStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recorderChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setAudioError('Recording failed. Please try again.');
        setRecorderState('idle');
        stopRecorder(mediaRecorderRef, recorderStreamRef);
      };

      recorder.onstop = () => {
        const recordedChunks = recorderChunksRef.current;
        const finalMimeType = recorder.mimeType || mimeType || 'audio/webm';

        stopRecorder(mediaRecorderRef, recorderStreamRef);

        if (recordedChunks.length === 0) {
          setRecorderState('idle');
          return;
        }

        const recording = new File(
          [new Blob(recordedChunks, { type: finalMimeType })],
          createRecordingFileName(finalMimeType),
          { type: finalMimeType, lastModified: Date.now() }
        );

        const validationError = getAudioValidationError(recording);
        if (validationError) {
          setAudioError(validationError);
          setRecorderState('idle');
          return;
        }

        queueAudioForDeletion(audioDraftRef.current);
        replaceAudioDraft(createLocalAudioDraft(recording));
        setAudioError(null);
        setRecorderState('idle');
      };

      recorder.start();
      setRecorderState('recording');
    } catch (error) {
      setRecorderState('idle');
      setAudioError(getAudioRecorderErrorMessage(error));
    }
  }, [queueAudioForDeletion, replaceAudioDraft]);

  const handleStopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== 'recording') {
      return;
    }

    setRecorderState('processing');
    recorder.stop();
  }, []);

  const flushRemovedUploads = useCallback(async () => {
    const activeKeys = new Set<string>();

    photoItemsRef.current.forEach((item) => {
      const key = item.uploadedKey
        ?? extractUploadThingKey(item.uploadedUrl)
        ?? extractUploadThingKey(item.previewUrl);

      if (key) {
        activeKeys.add(key);
      }
    });

    const activeAudioKey = audioDraftRef.current?.uploadedKey
      ?? extractUploadThingKey(audioDraftRef.current?.uploadedUrl)
      ?? extractUploadThingKey(audioDraftRef.current?.previewUrl);

    if (activeAudioKey) {
      activeKeys.add(activeAudioKey);
    }

    const keysToDelete = Array.from(removedAssetKeysRef.current).filter((key) => !activeKeys.has(key));
    if (keysToDelete.length === 0) {
      return;
    }

    try {
      const response = await fetch('/api/uploadthing/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: Number(id), keys: keysToDelete }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete removed media files.');
      }

      keysToDelete.forEach((key) => removedAssetKeysRef.current.delete(key));
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || hasUploadingPhotos || hasBlockingRecorderState) return;

    setLoading(true);

    try {
      let nextAudioUrl = currentAudioUrl;
      let nextAudioKey = audioDraftRef.current?.uploadedKey ?? null;

      if (audioDraftRef.current?.sourceFile) {
        setAudioDraft((current) => current ? { ...current, status: 'uploading', error: undefined } : current);

        const result = await startAudioUpload([audioDraftRef.current.sourceFile]);
        const uploaded = result?.[0];
        const resolvedUpload = resolveUploadedFile(uploaded);

        if (!resolvedUpload.url) {
          throw new Error('Audio upload finished without a file URL.');
        }

        nextAudioUrl = resolvedUpload.url;
        nextAudioKey = resolvedUpload.key;

        setAudioDraft((current) => current ? {
          ...current,
          uploadedKey: resolvedUpload.key,
          uploadedUrl: resolvedUpload.url,
          fileName: resolvedUpload.fileName ?? current.fileName,
          sourceFile: undefined,
          status: 'uploaded',
          error: undefined,
        } : current);
      }

      const payload = {
        prompt_question: prompt || null,
        answer_text: answer,
        photo_urls: uploadedPhotoUrls,
        audio_url: nextAudioUrl,
      };

      const response = memoryId
        ? await fetch(`/api/memories/${memoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/books/${id}/memories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        throw new Error('Failed to save memory.');
      }

      if (nextAudioUrl) {
        audioDraftRef.current = audioDraftRef.current ? {
          ...audioDraftRef.current,
          uploadedKey: nextAudioKey,
          uploadedUrl: nextAudioUrl,
          sourceFile: undefined,
          status: 'uploaded',
          error: undefined,
        } : null;
        setAudioDraft(audioDraftRef.current);
      }

      clearDraft();
      await flushRemovedUploads();

      router.push(`/books/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save memory.';
      setAudioDraft((current) => current && current.sourceFile
        ? { ...current, status: 'error', error: message }
        : current
      );
      setAudioError((current) => current ?? message);
    } finally {
      setLoading(false);
    }
  }, [answer, clearDraft, currentAudioUrl, flushRemovedUploads, hasBlockingRecorderState, hasUploadingPhotos, id, memoryId, prompt, router, startAudioUpload, uploadedPhotoUrls]);

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
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
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

      <main className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
        <article
          className="relative overflow-hidden rounded-[2.25rem] border"
          style={{
            background: 'linear-gradient(180deg, rgba(253,252,245,0.97) 0%, rgba(250,237,205,0.72) 100%)',
            borderColor: 'rgba(212,163,115,0.22)',
            boxShadow: '0 24px 72px rgba(212,163,115,0.12)',
          }}
        >
          <div className="hero-ambient" />

          <div className="relative px-5 py-6 md:px-9 md:py-9">
            <div className="grid gap-6 border-b pb-8 md:grid-cols-[minmax(0,1.55fr)_minmax(15rem,0.85fr)] md:gap-10 md:pb-10" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
              <div>
                <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>
                  Memory entry
                </p>
                <h1 className="display-md mb-3" style={{ color: 'var(--charcoal)' }}>
                  {memoryId ? 'Edit Memory' : 'Add a Memory'}
                </h1>
                <p className="max-w-2xl text-[0.98rem] leading-7 md:text-[1.02rem]" style={{ color: '#6A6A5A' }}>
                  Capture one story at a time. Start with a guided question, skip it, or write in your own voice. Photos and a voice note can help preserve the texture of the moment.
                </p>
              </div>

              <aside className="self-start rounded-[1.3rem] px-4 py-4" style={{ backgroundColor: 'rgba(255,253,246,0.76)', border: '1px solid rgba(212,163,115,0.14)' }}>
                <span className="label-caps block mb-2" style={{ color: 'var(--bronze)' }}>
                  Kept private
                </span>
                <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                  This memory stays private until you decide to share it, print it, or include it in a keepsake.
                </p>
              </aside>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <section className="grid gap-6 py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 md:py-10">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em]" style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#7B6B56', fontFamily: 'var(--font-sans)' }}>
                      Optional
                    </span>
                    <span className="rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em]" style={{ backgroundColor: 'rgba(204,213,174,0.18)', color: '#5F6650', fontFamily: 'var(--font-sans)' }}>
                      {promptOptionCount} guided prompts ready
                    </span>
                  </div>
                  <div>
                    <Label className="mb-2 block label-caps" style={{ color: 'var(--bronze)' }}>
                      Writing prompt
                    </Label>
                    <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                      Choose a prompt to help you begin, or leave it open and let the memory unfold naturally.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <select
                      value={promptLoadState === 'ready' || useCustomPrompt ? promptSelectValue : NO_PROMPT_VALUE}
                      onChange={(e) => handlePromptSelectChange(e.target.value, { customPrompt, setCustomPrompt, setPrompt, setUseCustomPrompt })}
                      disabled={promptLoadState === 'loading'}
                      className="w-full appearance-none rounded-[1.15rem] border px-4 py-3.5 pr-12 text-sm md:text-[0.95rem] transition-colors outline-none"
                      style={{
                        borderColor: 'rgba(212,163,115,0.24)',
                        backgroundColor: 'rgba(255,253,246,0.88)',
                        color: 'var(--charcoal)',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: '0 10px 24px rgba(212,163,115,0.06)',
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
                        style={{
                          borderColor: 'rgba(212,163,115,0.24)',
                          backgroundColor: 'rgba(255,253,246,0.88)',
                          boxShadow: '0 8px 20px rgba(212,163,115,0.05)',
                        }}
                      />
                    </div>
                  )}

                  {(promptLoadState !== 'ready' || promptLoadMessage) && (
                    <div
                      className="mt-4 rounded-[1.05rem] border px-4 py-3 text-sm"
                      style={{
                        backgroundColor: promptLoadState === 'error'
                          ? 'rgba(185,28,28,0.05)'
                          : 'rgba(250,237,205,0.42)',
                        borderColor: promptLoadState === 'error'
                          ? 'rgba(169,84,60,0.22)'
                          : 'rgba(212,163,115,0.18)',
                        color: promptLoadState === 'error' ? '#7C2D12' : '#6A6A5A',
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
                      className="mt-4 flex items-start gap-3 rounded-[1.15rem] px-4 py-4"
                      style={{
                        backgroundColor: 'rgba(212,163,115,0.08)',
                        border: '1px solid rgba(212,163,115,0.16)',
                      }}
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
                </div>
              </section>

              <section className="grid gap-6 border-t py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 md:py-10" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-2 block label-caps" style={{ color: 'var(--bronze)' }}>
                      Your memory
                    </Label>
                    <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                      Write with as much detail as feels right. You can return later and revise, but start with what you remember now.
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-[1.5rem] border p-3 md:p-4"
                  style={{
                    backgroundColor: 'rgba(255,253,246,0.78)',
                    borderColor: 'rgba(212,163,115,0.18)',
                    boxShadow: '0 18px 40px rgba(212,163,115,0.08)',
                  }}
                >
                  <style>{`
                    .memory-textarea::placeholder {
                      color: rgba(107, 106, 90, 0.6);
                      font-style: italic;
                    }
                  `}</style>
                  <Textarea
                    value={answer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    required
                    className="min-h-[340px] rounded-[1.2rem] border-0 px-5 py-5 text-base leading-[1.9] md:min-h-[380px] md:text-[1.05rem] memory-textarea"
                    rows={14}
                    placeholder="Take your time. There is no perfect way to tell a memory, only your way."
                    style={{
                      backgroundColor: '#FFFDF6',
                      fontFamily: 'var(--font-serif)',
                      resize: 'vertical',
                      boxShadow: 'inset 0 0 0 1px rgba(212,163,115,0.18)',
                    }}
                  />
                  <div className="flex items-center justify-between mt-3 px-1">
                    <p className="text-xs" style={{ color: '#8E8478', fontFamily: 'var(--font-sans)' }}>
                      Autosaves as you write
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.12em]" style={{ backgroundColor: 'rgba(254,250,224,0.82)', color: '#7B6B56', fontFamily: 'var(--font-sans)' }}>
                      <span style={{ color: 'var(--bronze)' }}>✎</span>
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 border-t py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 md:py-10" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
                <div className="space-y-3">
                  <div className="inline-flex rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em]" style={{ backgroundColor: 'rgba(204,213,174,0.18)', color: '#5F6650', fontFamily: 'var(--font-sans)' }}>
                    Optional
                  </div>
                  <div>
                    <Label className="mb-2 block label-caps" style={{ color: 'var(--bronze)' }}>
                      Photos &amp; audio
                    </Label>
                    <p className="text-sm leading-6" style={{ color: '#6A6A5A' }}>
                      Attach a few images or a voice note to preserve details that are difficult to capture in text alone.
                    </p>
                  </div>
                </div>

                <div>
                  {canUseMedia ? (
                    <div className="space-y-6">
                      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.95fr)]">
                        <div
                          className="rounded-[1.4rem] border p-5"
                          style={{
                            backgroundColor: 'rgba(250,237,205,0.28)',
                            borderColor: 'rgba(212,163,115,0.16)',
                          }}
                        >
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                                Photo attachments
                              </p>
                              <p className="mt-1 text-xs leading-5" style={{ color: '#7A6D5A', fontFamily: 'var(--font-sans)' }}>
                                Add photos from your device. Images must be under 4MB, and previews appear immediately.
                              </p>
                            </div>
                            <label
                              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
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
                              Add photos
                            </label>
                          </div>

                          <DropZone onFilesSelected={handlePhotoFiles} className="mt-2" />

                          {mediaErrors.length > 0 && (
                            <div
                              className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
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
                            <div className="mt-5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                                  {photoItems.length} {photoItems.length === 1 ? 'photo' : 'photos'} attached
                                </p>
                                <p className="text-xs" style={{ color: hasErroredPhotos ? '#9A5A4A' : '#8E8478', fontFamily: 'var(--font-sans)' }}>
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
                        </div>

                        <div
                          className="rounded-[1.4rem] border p-5"
                          style={{
                            backgroundColor: 'rgba(255,253,246,0.72)',
                            borderColor: 'rgba(212,163,115,0.16)',
                          }}
                        >
                          <div className="mb-4">
                            <p className="text-sm font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                              Voice note
                            </p>
                            <p className="mt-1 text-xs leading-5" style={{ color: '#7A6D5A', fontFamily: 'var(--font-sans)' }}>
                              Upload an audio file or record here. Audio stays local until you save this memory.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <label
                              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                              style={{
                                borderColor: 'rgba(212,163,115,0.24)',
                                backgroundColor: '#FDFCF5',
                                color: 'var(--charcoal)',
                                fontFamily: 'var(--font-sans)',
                              }}
                            >
                              <input
                                type="file"
                                accept="audio/*"
                                className="sr-only"
                                onChange={(e) => {
                                  handleAudioFileSelection(e.target.files);
                                  e.currentTarget.value = '';
                                }}
                              />
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" x2="12" y1="3" y2="15" />
                              </svg>
                              Add audio file
                            </label>
                            <button
                              type="button"
                              onClick={recorderState === 'recording' ? handleStopRecording : () => void handleStartRecording()}
                              disabled={loading || recorderState === 'requesting' || recorderState === 'processing'}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                              style={{
                                backgroundColor: recorderState === 'recording' ? '#8A3F2B' : 'rgba(212,163,115,0.12)',
                                color: recorderState === 'recording' ? 'var(--cornsilk)' : 'var(--charcoal)',
                                fontFamily: 'var(--font-sans)',
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                              </svg>
                              {recorderState === 'recording'
                                ? 'Stop recording'
                                : recorderState === 'requesting'
                                  ? 'Preparing…'
                                  : recorderState === 'processing'
                                    ? 'Processing…'
                                    : 'Record audio'}
                            </button>
                          </div>

                          <p className="mt-3 text-xs leading-5" style={{ color: '#7A6D5A', fontFamily: 'var(--font-sans)' }}>
                            Audio files up to 16MB. Recorded clips upload when you save.
                          </p>

                          {audioError && (
                            <div
                              className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
                              style={{
                                backgroundColor: 'rgba(185,28,28,0.08)',
                                borderColor: 'rgba(185,28,28,0.18)',
                                color: '#7C2D12',
                              }}
                            >
                              {audioError}
                            </div>
                          )}

                          {audioDraft && (
                            <div
                              className="mt-4 rounded-[1.15rem] border px-4 py-4"
                              style={{
                                backgroundColor: 'rgba(204,213,174,0.16)',
                                borderColor: 'rgba(204,213,174,0.3)',
                              }}
                            >
                              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                                    {audioDraft.fileName}
                                  </p>
                                  <p className="mt-1 text-xs leading-5" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                                    {audioDraft.sourceFile
                                      ? 'Ready to upload when you save.'
                                      : audioDraft.status === 'uploading'
                                        ? 'Uploading audio…'
                                        : 'Saved audio attached.'}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveAudio}
                                  className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-70 shrink-0"
                                  style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}
                                  aria-label="Remove audio"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                  Remove
                                </button>
                              </div>
                              <audio src={audioDraft.previewUrl} controls className="h-10 w-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-[1.5rem] px-6 py-7 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(145deg, rgba(250,237,205,0.5) 0%, rgba(204,213,174,0.12) 50%, rgba(212,163,115,0.06) 100%)',
                        border: '1.5px solid rgba(212,163,115,0.25)',
                        boxShadow: '0 8px 32px rgba(212,163,115,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                      }}
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.06]" style={{ background: 'radial-gradient(circle at 100% 0%, var(--bronze) 0%, transparent 60%)' }} />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 opacity-[0.05]" style={{ background: 'radial-gradient(circle, var(--tea-green) 0%, transparent 70%)' }} />
                      
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative">
                        <div className="flex-1 max-w-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bronze)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--charcoal)' }}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                            <span className="text-[0.7rem] font-bold px-3 py-1 rounded-full uppercase tracking-[0.12em]" style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', fontFamily: 'var(--font-sans)' }}>
                              Plus Feature
                            </span>
                          </div>
                          <p className="text-lg font-medium mb-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                            Bring your memories to life with photos &amp; voice
                          </p>
                          <p className="text-sm leading-relaxed mb-4" style={{ color: '#6A6A5A' }}>
                            Upgrade to Plus to attach photos and record voice notes to each memory. Your stories become richer, more vivid, impossible to forget.
                          </p>
                          {/* Feature bullets */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                              <span className="text-xs font-medium" style={{ color: 'var(--charcoal)' }}>Photo albums</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                              </svg>
                              <span className="text-xs font-medium" style={{ color: 'var(--charcoal)' }}>Voice recordings</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                              </svg>
                              <span className="text-xs font-medium" style={{ color: 'var(--charcoal)' }}>5GB storage</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 lg:ml-8">
                          <Link
                            href={`/upgrade?book=${id}`}
                            className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', boxShadow: '0 4px 20px rgba(212,163,115,0.3)' }}
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Upgrade this book
                          </Link>
                          <p className="text-xs text-center mt-2" style={{ color: '#8A8A7A' }}>Starting at $50 for 5 years</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="border-t pt-6 md:pt-7" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div
                    className="rounded-[1.2rem] border px-4 py-3 text-sm"
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
                    Your draft autosaves while you write. Uploaded photos stay attached if you come back later, and audio uploads when you save.
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <Link
                      href={`/books/${id}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium transition-colors"
                      style={{ borderColor: 'rgba(212,163,115,0.26)', color: 'var(--charcoal)', backgroundColor: 'rgba(255,253,246,0.82)' }}
                    >
                      Cancel
                    </Link>
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="h-11 rounded-full px-7 disabled:cursor-not-allowed disabled:opacity-100"
                      style={{
                        backgroundColor: isSubmitDisabled ? 'rgba(212,163,115,0.4)' : 'var(--bronze)',
                        color: 'var(--charcoal)',
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                          Saving...
                        </>
                      ) : hasUploadingPhotos ? 'Uploading photos…' : hasBlockingRecorderState ? 'Finish recording first' : memoryId ? 'Update Memory' : 'Save Memory'}
                    </Button>
                  </div>
                </div>
              </section>
            </form>
          </div>
        </article>
      </main>
    </div>
  );
}

function createDraftPhotoItems(urls: string[]): PhotoDraftItem[] {
  return urls.map((url, index) => ({
    id: `${url}-${index}`,
    previewUrl: url,
    uploadedKey: extractUploadThingKey(url),
    uploadedUrl: url,
    fileName: `Saved photo ${index + 1}`,
    status: 'uploaded',
  }));
}

function createExistingAudioDraft(url: string): AudioDraft {
  return {
    previewUrl: url,
    uploadedKey: extractUploadThingKey(url),
    uploadedUrl: url,
    fileName: getFileNameFromUrl(url, 'Saved audio') ?? 'Saved audio',
    status: 'uploaded',
  };
}

function createLocalAudioDraft(file: File): AudioDraft {
  return {
    previewUrl: URL.createObjectURL(file),
    uploadedKey: null,
    uploadedUrl: null,
    fileName: file.name,
    sourceFile: file,
    status: 'ready',
  };
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

function getAudioValidationError(file: File): string | null {
  if (!file.type.startsWith('audio/')) {
    return 'Please choose an audio file.';
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return 'This audio file is larger than the 16MB limit.';
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

function revokeAudioPreview(draft: AudioDraft | null) {
  if (draft?.sourceFile && draft.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(draft.previewUrl);
  }
}

function resolveUploadedFile(uploaded: unknown): ResolvedUpload {
  if (!uploaded || typeof uploaded !== 'object') {
    return { url: null, key: null, fileName: null };
  }

  const upload = uploaded as {
    key?: string;
    name?: string;
    ufsUrl?: string;
    serverData?: {
      key?: string;
      url?: string;
      fileName?: string;
    };
  };

  const url = upload.ufsUrl ?? upload.serverData?.url ?? null;
  const key = upload.key ?? upload.serverData?.key ?? extractUploadThingKey(url);
  const fileName = upload.serverData?.fileName ?? upload.name ?? getFileNameFromUrl(url, null);

  return { url, key, fileName };
}

function extractUploadThingKey(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const uploadThingHosts = ['uploadthing.com', 'utfs.io', 'ufs.sh'];
    if (!uploadThingHosts.some((host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`))) {
      return null;
    }

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0) {
      return null;
    }

    const fileSegment = pathParts.lastIndexOf('f');
    const rawKey = fileSegment >= 0 && pathParts[fileSegment + 1]
      ? pathParts[fileSegment + 1]
      : pathParts[pathParts.length - 1];

    return rawKey ? decodeURIComponent(rawKey) : null;
  } catch {
    return null;
  }
}

function getFileNameFromUrl(url: string | null | undefined, fallback: string | null): string | null {
  if (!url) {
    return fallback;
  }

  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];

    return fileName ? decodeURIComponent(fileName) : fallback;
  } catch {
    return fallback;
  }
}

function getPreferredRecordingMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const preferredMimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];

  return preferredMimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function createRecordingFileName(mimeType: string): string {
  const extension = mimeType.includes('ogg')
    ? 'ogg'
    : mimeType.includes('mp4')
      ? 'm4a'
      : 'webm';

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `voice-memory-${timestamp}.${extension}`;
}

function getAudioRecorderErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Microphone access was blocked. Please allow microphone access and try again.';
    }

    if (error.name === 'NotFoundError') {
      return 'No microphone was found on this device.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to start recording right now.';
}

function stopRecorder(
  recorderRef: MutableRefObject<MediaRecorder | null>,
  streamRef: MutableRefObject<MediaStream | null>
) {
  const stream = streamRef.current;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  recorderRef.current = null;
  streamRef.current = null;
}
