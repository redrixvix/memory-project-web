'use client';

import { generateReactHelpers } from '@uploadthing/react';
import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import { MobileNav } from '@/components/ui/mobile-nav';
import type { MutableRefObject } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { Button } from '@/components/ui/button';
import { ImageGallery, type ImageGalleryItem, DropZone } from '@/components/image-gallery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { normalizeBookPlan } from '@/lib/book-plan';
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

export default function EditMemory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const memoryId = searchParams.get('memory');
  const urlPrompt = searchParams.get('prompt');

  // Set initial prompt from URL param when creating a new memory (no memoryId, no draft)
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [photoItems, setPhotoItems] = useState<PhotoDraftItem[]>([]);
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);
  const [audioDraft, setAudioDraft] = useState<AudioDraft | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const draftKey = `draft-${id}-${memoryId ?? 'new'}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoItemsRef = useRef<PhotoDraftItem[]>([]);
  const audioDraftRef = useRef<AudioDraft | null>(null);
  const removedAssetKeysRef = useRef<Set<string>>(new Set());
  const removedPhotoIdsRef = useRef<Set<string>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const customPromptRef = useRef(customPrompt);
  const activePlan = normalizeBookPlan(book?.plan, book?.storage_tier);
  const canUseMedia = activePlan !== 'free';
  // Syncs customPromptRef so the effect below can read the latest value without needing
  // it as a dependency (avoids a cascade of re-renders when prompt changes)
  useEffect(() => {
    customPromptRef.current = customPrompt;
  }, [customPrompt]);

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

  // Keyboard shortcut: Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!isSubmitDisabled && saveState === 'idle') {
          const form = document.querySelector('form');
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitDisabled, saveState]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => {
        if (response.status === 401) {
          router.push('/login');
          setIsCheckingAuth(false);
          return;
        }

        setIsCheckingAuth(false);
      })
      .catch(() => {
        router.push('/login');
        setIsCheckingAuth(false);
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

    // If no memoryId, no draft, but URL has a prompt param, use it
    if (!memoryId && urlPrompt && !draft) {
      setPrompt(urlPrompt);
    }

    setDraftLoaded(true);
  }, [draftKey, id, memoryId, router, urlPrompt]);

  // Auto-focus textarea when navigated via a prompt link (e.g. from empty state chip)
  useEffect(() => {
    const tryFocus = () => {
      const textarea = document.querySelector('textarea');
      if (textarea && textarea.value !== undefined) {
        textarea.focus();
        return true;
      }
      return false;
    };

    if (urlPrompt && !memoryId) {
      // Wait for prompt to load, then focus
      const focused = tryFocus();
      if (!focused && promptLoadState === 'loading') {
        const timeout = setTimeout(() => {
          const t = document.querySelector('textarea');
          if (t) t.focus();
        }, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [urlPrompt, memoryId, promptLoadState]);

  useEffect(() => {
    if (!prompt) {
      setUseCustomPrompt(false);
      return;
    }

    if (allPresetPrompts.includes(prompt)) {
      setUseCustomPrompt(false);
      return;
    }

    const nextCustom = customPromptRef.current !== prompt ? prompt : customPromptRef.current;
    setUseCustomPrompt(true);
    if (nextCustom !== customPromptRef.current) {
      setCustomPrompt(nextCustom);
    }
  }, [allPresetPrompts, prompt]);

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

      // Premium success moment — brief celebration before redirecting
      setSaveSuccess(true);
      setSaveState('saved');
      setTimeout(() => {
        router.push(`/books/${id}`);
      }, 1600);
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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
        <div className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
          <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-16 h-4 rounded-md animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
            <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading…</p>
          </div>
        </div>
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
          .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/books/${id}`} className="nav-link text-sm flex items-center gap-1.5 shrink-0" style={{ color: 'var(--charcoal)' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </Link>
            {book && (
              <>
                <span style={{ color: 'rgba(212,163,115,0.3)' }}>·</span>
                <div className="text-base md:text-lg font-medium truncate" style={{ color: 'var(--charcoal)' }}>
                  {book.title}
                </div>
              </>
            )}
          </div>

          {/* Subtle autosave indicator — no pill, just elegant small text */}
          <div className="flex items-center gap-1.5 text-xs transition-all duration-500" style={{ fontFamily: 'var(--font-sans)' }}>
            {saveState === 'saving' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--bronze)' }} />
                <span className="italic" style={{ color: '#8A7A6A' }}>Saving...</span>
              </>
            )}
            {saveState === 'saved' && (
              <span className="italic" style={{ color: '#8A7A6A' }}>Last saved</span>
            )}
          </div>

          {/* Mobile hamburger — shown only on small screens */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95"
            style={{ 
              backgroundColor: 'rgba(212,163,115,0.12)',
              color: 'var(--bronze)',
              border: '1px solid rgba(212,163,115,0.18)',
            }}
            aria-label="Open navigation menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        loggedIn={true}
      />

      <main className="mx-auto w-full max-w-5xl px-5 py-4 md:px-10 md:py-6">
        <article
          className="relative overflow-hidden rounded-[2.25rem] border"
          style={{
            background: 'linear-gradient(180deg, rgba(253,252,245,0.97) 0%, rgba(250,237,205,0.72) 100%)',
            borderColor: 'rgba(212,163,115,0.22)',
            boxShadow: '0 24px 72px rgba(212,163,115,0.12)',
          }}
        >
          <div className="hero-ambient" />

          <div className="relative px-5 py-5 md:px-10 md:py-7">
            <div className="border-b pb-6 md:pb-7" style={{ borderColor: 'rgba(212,163,115,0.14)', transition: 'opacity 0.4s ease' }}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(204,213,174,0.12)', color: '#4A5A35', fontFamily: 'var(--font-sans)', border: '1px solid rgba(204,213,174,0.25)' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#6B8055' }}>
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Private
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-medium mb-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                  {memoryId ? 'Edit Memory' : 'Add a Memory'}
                </h1>
                {/* Step progress indicator — editorial style with warm palette */}
                <div className="flex items-center gap-3 mt-5">
                  {/* Step 1 — active */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{
                        backgroundColor: 'var(--bronze)',
                        color: 'var(--charcoal)',
                        fontFamily: 'var(--font-serif)',
                        boxShadow: '0 2px 8px rgba(212,163,115,0.25)',
                      }}
                    >
                      1
                    </div>
                    <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Write</span>
                  </div>
                  {/* Connector — elegant warm line */}
                  <div className="flex-1 max-w-[3rem]">
                    <div
                      className="h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(to right, rgba(212,163,115,0.7), rgba(212,163,115,0.3))',
                      }}
                    />
                  </div>
                  {/* Step 2 — inactive */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{
                        backgroundColor: 'rgba(212,163,115,0.10)',
                        color: 'rgba(43,43,43,0.55)',
                        fontFamily: 'var(--font-serif)',
                        border: '1.5px solid rgba(212,163,115,0.25)',
                      }}
                    >
                      2
                    </div>
                    <span className="text-xs tracking-wide" style={{ color: 'rgba(43,43,43,0.55)', fontFamily: 'var(--font-sans)' }}>Enrich &amp; Save</span>
                  </div>
                </div>
              </div>

            <form onSubmit={handleSubmit} className="relative">
              {/* Prompts section — cleaner single-column layout, prompts are discoverable without overwhelming sidebar */}
              <section className="py-5 md:py-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-bold tracking-[0.06em]" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                        Browse prompts
                      </span>
                    </div>
                    {promptOptionCount > 0 && (
                      <span className="text-xs" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
                        {promptOptionCount} prompt{promptOptionCount !== 1 ? 's' : ''} available
                      </span>
                    )}
                  </div>
                  {prompt && (
                    <button
                      type="button"
                      onClick={() => { setPrompt(''); setUseCustomPrompt(false); setCustomPrompt(''); }}
                      className="text-xs underline-offset-2 hover:underline transition-all"
                      style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}
                    >
                      Clear prompt
                    </button>
                  )}
                </div>
                <div className="relative max-w-2xl">
                  <div className="relative">
                    <select
                      value={promptLoadState === 'ready' || useCustomPrompt ? promptSelectValue : NO_PROMPT_VALUE}
                      onChange={(e) => handlePromptSelectChange(e.target.value, { customPrompt, setCustomPrompt, setPrompt, setUseCustomPrompt })}
                      disabled={promptLoadState === 'loading'}
                      className="w-full appearance-none rounded-[1.15rem] border px-4 py-3.5 pr-12 text-sm md:text-[0.95rem] transition-colors outline-none"
                      style={{
                        borderColor: 'rgba(212,163,115,0.20)',
                        backgroundColor: 'rgba(255,253,246,0.70)',
                        color: 'var(--charcoal)',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: '0 6px 16px rgba(212,163,115,0.05)',
                      }}
                      onFocus={e => {
                        (e.target as HTMLElement).style.borderColor = 'rgba(212,163,115,0.45)';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(212,163,115,0.10), 0 8px 20px rgba(212,163,115,0.07)';
                      }}
                      onBlur={e => {
                        (e.target as HTMLElement).style.borderColor = 'rgba(212,163,115,0.20)';
                        (e.target as HTMLElement).style.boxShadow = '0 6px 16px rgba(212,163,115,0.05)';
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.borderColor = 'rgba(212,163,115,0.40)';
                        (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(212,163,115,0.10)';
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.borderColor = 'rgba(212,163,115,0.20)';
                        (e.target as HTMLElement).style.boxShadow = '0 6px 16px rgba(212,163,115,0.05)';
                      }}
                    >
                      {promptLoadState === 'loading' && (
                        <option value={NO_PROMPT_VALUE}>Loading prompts…</option>
                      )}
                      {promptLoadState !== 'loading' && (
                        <>
                          <option value={NO_PROMPT_VALUE}>Start writing freely</option>
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
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--bronze)' }}>
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {useCustomPrompt && (
                    <div className="mt-4">
                      <Label className="mb-2 block text-xs font-medium" style={{ color: '#7A6960', fontFamily: 'var(--font-sans)' }}>
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
                        backgroundColor: 'rgba(212,163,115,0.13)',
                        border: '1px solid rgba(212,163,115,0.25)',
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

              {/* Writing section — single column, constrained-width for premium readability */}
              <section className="border-t py-5 md:py-6" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
                {/* Constrained writing zone — creates "journal page" feel with soft shadow (no harsh border) */}
                <div
                  className="rounded-[1.5rem] mx-auto transition-all duration-500"
                  style={{
                    maxWidth: '760px',
                    backgroundColor: 'rgba(255,253,246,0.88)',
                    boxShadow: textareaFocused
                      ? '0 0 0 2px rgba(212,163,115,0.28), 0 12px 48px rgba(212,163,115,0.14)'
                      : '0 0 0 1px rgba(212,163,115,0.14), 0 4px 24px rgba(212,163,115,0.07)',
                  }}
                >
                  <style>{`
                    .memory-textarea::placeholder {
                      color: rgba(80, 75, 65, 0.80);
                      font-style: italic;
                    }
                  `}</style>
                  <Textarea
                    autoFocus
                    value={answer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onFocus={() => setTextareaFocused(true)}
                    onBlur={() => setTextareaFocused(false)}
                    required
                    className="min-h-[360px] rounded-[1.2rem] border-0 px-5 py-5 text-[1.0625rem] leading-[1.95] md:min-h-[420px] md:text-[1.125rem] memory-textarea memory-editor-textarea transition-all duration-200"
                    rows={16}
                    placeholder="Take your time. There is no perfect way to tell a memory, only your way."
                    style={{
                      backgroundColor: 'transparent',
                      fontFamily: 'var(--font-serif)',
                      resize: 'vertical',
                      boxShadow: textareaFocused
                        ? '0 0 0 2.5px rgba(212,163,115,0.35), 0 8px 32px rgba(212,163,115,0.12)'
                        : '0 0 0 1.5px rgba(212,163,115,0.20), 0 2px 8px rgba(212,163,115,0.06)',
                    }}
                  />
                  {/* Autosave status — single, clean indicator above the textarea */}
                  <div className="flex items-center justify-between mt-3 px-1">
                    {saveState === 'saving' && wordCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--bronze)' }} />
                        <p className="text-xs" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>Saving...</p>
                      </div>
                    )}
                    {saveState === 'saved' && wordCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--tea-green)' }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <p className="text-xs" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>Saved</p>
                      </div>
                    )}
                    {(saveState === 'idle' || wordCount === 0) && (
                      <p className="text-xs" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>Autosaves as you write</p>
                    )}
                    {/* Word count pill — right-aligned */}
                    {wordCount > 0 && (
                      <div
                        className="inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(212,163,115,0.18)',
                          boxShadow: '0 2px 12px rgba(212,163,115,0.20)',
                          border: '1px solid rgba(212,163,115,0.35)',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                        <span className="font-bold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>
                          {wordCount.toLocaleString()}
                        </span>
                        <span style={{ color: '#5A5A4A', fontFamily: 'var(--font-sans)', fontSize: '0.7rem' }}>{wordCount === 1 ? 'word' : 'words'}</span>
                        {wordCount >= 20 && (
                          <>
                            <div className="w-px h-3" style={{ backgroundColor: 'rgba(212,163,115,0.30)' }} />
                            <span style={{ color: '#5A5A4A', fontFamily: 'var(--font-sans)', fontSize: '0.7rem' }}>
                              ~{Math.max(1, Math.round(wordCount / 200))} min
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="border-t py-5 md:py-6" style={{ borderColor: 'rgba(212,163,115,0.14)' }}>
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,163,115,0.12)', boxShadow: '0 2px 8px rgba(212,163,115,0.08)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: '#8B7355', fontFamily: 'var(--font-sans)' }}>
                        Step 2
                      </span>
                      <h3 className="text-base md:text-lg font-medium -mt-0.5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                        Enrich your memory
                      </h3>
                    </div>
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.35), transparent)' }} />
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
                  A photograph or voice note can capture what words alone cannot — the sound of laughter, the light in a room, a moment that would otherwise fade.
                </p>

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
                              <p className="mt-1 text-xs leading-5" style={{ color: '#8A7A70', fontFamily: 'var(--font-sans)' }}>
                                Add photos from your device. Images must be under 4MB, and previews appear immediately.
                              </p>
                            </div>
                            <label
                              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-md"
                              style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', fontFamily: 'var(--font-sans)', boxShadow: '0 4px 16px rgba(43,43,43,0.2)' }}
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
                                <p className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: '#5A5A4A', fontFamily: 'var(--font-sans)' }}>
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
                            <p className="mt-1 text-xs leading-5" style={{ color: '#7A6A60', fontFamily: 'var(--font-sans)' }}>
                              Upload an audio file or record here. Audio stays local until you save this memory.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <label
                              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                              style={{
                                borderColor: 'rgba(212,163,115,0.24)',
                                backgroundColor: '#FDFCF5',
                                color: 'var(--charcoal)',
                                fontFamily: 'var(--font-sans)',
                                boxShadow: '0 4px 12px rgba(212,163,115,0.08)',
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
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 hover:brightness-105 active:scale-[0.98]"
                              style={{
                                backgroundColor: recorderState === 'recording' ? '#8A3F2B' : 'rgba(212,163,115,0.12)',
                                color: recorderState === 'recording' ? 'var(--cornsilk)' : 'var(--charcoal)',
                                fontFamily: 'var(--font-sans)',
                                boxShadow: '0 4px 12px rgba(212,163,115,0.08)',
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
                            {recorderState === 'recording' && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#B91C1C', boxShadow: '0 0 8px rgba(185,28,28,0.5)' }} />
                                <span className="text-xs font-medium animate-pulse" style={{ color: '#B91C1C', fontFamily: 'var(--font-sans)' }}>Recording…</span>
                              </div>
                            )}
                          </div>

                          <p className="mt-3 text-xs leading-5" style={{ color: '#7A6A60', fontFamily: 'var(--font-sans)' }}>
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
                                  <p className="mt-1 text-xs leading-5" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
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
                                  style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}
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
                      className="rounded-[1.2rem] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4"
                      style={{
                        backgroundColor: 'rgba(255,253,246,0.60)',
                        border: '1px solid rgba(212,163,115,0.22)',
                        background: 'linear-gradient(135deg, rgba(212,163,115,0.06) 0%, rgba(204,213,174,0.06) 100%)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--bronze)' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                              Photos &amp; voice notes
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(212,163,115,0.12)', color: '#6A5A4A', fontFamily: 'var(--font-sans)' }}>
                              Premium
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
                            Tuck away photos & voice notes alongside your words — they become part of the story.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/upgrade?book=${id}`}
                        className="inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-medium transition-all duration-200 hover:brightness-105 active:scale-[0.98] shrink-0"
                        style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', boxShadow: '0 2px 8px rgba(212,163,115,0.15)' }}
                      >
                        Upgrade
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Sticky save bar ── */}
              <div
                className="sticky bottom-0 z-10 -mx-5 px-5 py-4 md:-mx-9 md:px-9 md:py-4"
                style={{
                  background: 'linear-gradient(to top, rgba(253,252,245,0.99) 0%, rgba(253,252,245,0.97) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderTop: '1px solid rgba(212,163,115,0.22)',
                  boxShadow: '0 -8px 32px rgba(212,163,115,0.08)',
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: '#4A4A3A' }}>
                    {saveState === 'saving' && answer.trim().length > 0 && (
                      <>
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.4)' }} />
                        <span>Saving draft...</span>
                      </>
                    )}
                    {saveState === 'saved' && answer.trim().length > 0 && (
                      <>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--tea-green)' }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>Draft saved</span>
                      </>
                    )}
                    {saveState === 'idle' && (
                      <span className="text-xs" style={{ color: '#4A4A3A' }}>
                        Autosaves as you write
                        {answer.trim().length > 0 && (
                          <>
                            {' '}
                            <kbd className="ml-1.5 inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px]" style={{ borderColor: 'rgba(212,163,115,0.25)', fontFamily: 'var(--font-sans)' }}>⌘S</kbd>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
                    <Link
                      href={`/books/${id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium transition-colors"
                      style={{ borderColor: 'rgba(212,163,115,0.26)', color: 'var(--charcoal)', backgroundColor: 'rgba(255,253,246,0.9)' }}
                    >
                      Cancel
                    </Link>
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="h-11 rounded-full px-8 text-sm font-semibold disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.97] hover:brightness-110 hover:shadow-xl hover:shadow-[rgba(196,148,106,0.4)] hover:-translate-y-0.5"
                      style={{
                        backgroundColor: isSubmitDisabled ? 'rgba(212,163,115,0.55)' : 'var(--bronze)',
                        color: isSubmitDisabled ? 'rgba(43,43,43,0.65)' : 'var(--charcoal)',
                        boxShadow: isSubmitDisabled ? 'none' : '0 6px 24px rgba(212,163,115,0.3)',
                      }}
                      onMouseEnter={e => {
                        if (!isSubmitDisabled) {
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,163,115,0.45)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSubmitDisabled) {
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,163,115,0.3)';
                        }
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
              </div>
            </form>

            {/* ── Premium save success overlay ── */}
            {saveSuccess && (
              <div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[2.25rem] animate-fade-up"
                style={{
                  background: 'linear-gradient(160deg, rgba(253,252,245,0.97) 0%, rgba(250,237,205,0.94) 100%)',
                  animation: 'fadeInScale 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
              >
                <style>{`
                  @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.92); }
                    to { opacity: 1; transform: scale(1); }
                  }
                  @keyframes drawCheck {
                    to { stroke-dashoffset: 0; }
                  }
                  @keyframes popIn {
                    0% { transform: scale(0) rotate(-12deg); opacity: 0; }
                    60% { transform: scale(1.15) rotate(3deg); }
                    80% { transform: scale(0.95) rotate(-1deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                  }
                  @keyframes shimmer {
                    0% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.4; }
                  }
                  .check-circle {
                    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
                  }
                  .check-path {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: drawCheck 0.4s ease-out 0.45s forwards;
                  }
                  .success-text {
                    animation: fadeInScale 0.3s ease-out 0.55s both;
                  }
                  .success-sub {
                    animation: fadeInScale 0.3s ease-out 0.7s both;
                  }
                `}</style>

                {/* Animated success circle */}
                <div
                  className="check-circle w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, var(--tea-green) 0%, #8BAF6A 100%)',
                    boxShadow: '0 12px 40px rgba(95,102,80,0.35), 0 4px 12px rgba(95,102,80,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path
                      className="check-path"
                      d="M5 12l5 5L19 7"
                      stroke="#FDFCF5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Success text */}
                <p
                  className="success-text text-2xl font-medium mb-2"
                  style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
                >
                  {memoryId ? 'Memory updated' : 'Memory saved'}
                </p>
                <p
                  className="success-sub text-sm"
                  style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}
                >
                  See it in your book, or keep building.
                </p>

                <div className="success-sub mt-8 flex flex-col sm:flex-row gap-3 items-center">
                  {!memoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSaveSuccess(false);
                        setSaveState('idle');
                        setAnswer('');
                        setWordCount(0);
                        setPrompt('');
                        setUseCustomPrompt(false);
                        setCustomPrompt('');
                        clearDraft();
                        setAudioDraft(null);
                        router.refresh();
                      }}
                      className="inline-flex items-center gap-2 h-11 rounded-full px-6 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      style={{
                        backgroundColor: 'var(--charcoal)',
                        color: 'var(--cornsilk)',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: '0 4px 20px rgba(43,43,43,0.22)',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Add another
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push(`/books/${id}`)}
                    className="inline-flex items-center gap-2 h-11 rounded-full px-6 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      backgroundColor: 'rgba(212,163,115,0.12)',
                      color: 'var(--charcoal)',
                      fontFamily: 'var(--font-sans)',
                      border: '1px solid rgba(212,163,115,0.22)',
                    }}
                  >
                    View book
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                {/* Progress dots */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--bronze)',
                        opacity: 0.4,
                        animation: `shimmer 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
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
