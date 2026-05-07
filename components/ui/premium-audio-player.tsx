'use client';

import { useState } from 'react';

interface PremiumAudioPlayerProps {
  src: string | null | undefined;
  loadingText?: string;
  errorText?: string;
  className?: string;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export function PremiumAudioPlayer({
  src,
  loadingText = 'Preparing playback...',
  errorText = 'Voice note attached',
  className = 'w-full rounded-xl audio-player',
}: PremiumAudioPlayerProps) {
  const [loadState, setLoadState] = useState<LoadState>(src ? 'loading' : 'idle');
  const [duration, setDuration] = useState<number | null>(null);

  if (!src) {
    return null;
  }

  const statusLabel = loadState === 'ready'
    ? duration !== null
      ? formatAudioDuration(duration)
      : 'Ready to play'
    : loadState === 'error'
      ? errorText
      : loadingText;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
          style={{
            backgroundColor: loadState === 'error' ? 'rgba(212,163,115,0.14)' : 'rgba(254,250,224,0.92)',
            color: loadState === 'error' ? '#5A4633' : '#5A4633',
            border: loadState === 'error' ? '1px solid rgba(212,163,115,0.24)' : '1px solid rgba(212,163,115,0.2)',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: loadState === 'error'
                ? 'var(--bronze)'
                : loadState === 'ready'
                  ? '#6B8F71'
                  : 'var(--bronze)',
              boxShadow: loadState === 'loading' ? '0 0 0 4px rgba(212,163,115,0.12)' : 'none',
            }}
          />
          {statusLabel}
        </span>
      {loadState === 'loading' && (
        <span style={{ color: '#7A6A60' }}>
          We're pulling in the timing so this feels settled before playback.
        </span>
      )}
      {loadState === 'error' && (
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <p className="min-w-0 text-sm leading-5" style={{ color: '#5F4A3B', fontFamily: 'var(--font-sans)' }}>
            Your voice note is saved — tap to open and listen.
          </p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'rgba(212,163,115,0.18)', color: '#4A3120', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.22)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Listen
          </a>
        </div>
      )}
      </div>

      {loadState !== 'ready' && (
        <div
          className="flex min-h-10 items-center gap-3 rounded-xl border px-3 py-3"
          style={{
            backgroundColor: 'rgba(255,253,246,0.72)',
            borderColor: loadState === 'error' ? 'rgba(212,163,115,0.24)' : 'rgba(212,163,115,0.18)',
          }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: loadState === 'error' ? 'rgba(212,163,115,0.16)' : 'rgba(212,163,115,0.14)' }}
          >
            {loadState === 'error' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#8A6A3C' }}>
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            )}
          </div>
          <div className="flex flex-1 items-center gap-1.5">
            {loadState === 'error' ? (
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <p className="min-w-0 text-sm leading-5" style={{ color: '#5F4A3B', fontFamily: 'var(--font-sans)' }}>
                  Playback preview couldn't load here. You can still keep the attachment or open the file directly.
                </p>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'rgba(212,163,115,0.16)', color: '#4A3120', fontFamily: 'var(--font-sans)' }}
                >
                  Open audio
                </a>
              </div>
            ) : (
              [36, 52, 40, 64, 44].map((width, index) => (
                <span
                  key={width + index}
                  className={loadState === 'loading' ? 'animate-pulse' : ''}
                  style={{
                    width,
                    height: 6 + (index % 2) * 4,
                    borderRadius: 999,
                    backgroundColor: 'rgba(212,163,115,0.2)',
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      <audio
        src={src}
        controls
        preload="metadata"
        onLoadedMetadata={(event) => {
          const nextDuration = Number.isFinite(event.currentTarget.duration)
            ? event.currentTarget.duration
            : null;
          setDuration(nextDuration);
          setLoadState('ready');
        }}
        onCanPlay={() => {
          setLoadState((current) => (current === 'error' ? current : 'ready'));
        }}
        onError={() => {
          setDuration(null);
          setLoadState('error');
        }}
        className={loadState === 'ready' ? className : 'sr-only'}
        style={loadState === 'ready' ? { height: '40px', borderRadius: '10px' } : undefined}
      />
    </div>
  );
}

function formatAudioDuration(durationInSeconds: number) {
  const rounded = Math.max(0, Math.round(durationInSeconds));
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
