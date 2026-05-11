"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface ImageGalleryItem {
  id: string;
  previewUrl: string;
  fileName: string;
  status: "uploading" | "uploaded" | "error";
  error?: string;
}

interface ImageGalleryProps {
  items: ImageGalleryItem[];
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

function ImageCard({
  item,
  index,
  total,
  onRemove,
  onRetry,
}: {
  item: ImageGalleryItem;
  index: number;
  total: number;
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [entered, setEntered] = useState(false);

  // Remove stagger class after mount animation completes so removal is instant
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 520);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 280);
  };

  return (
    <div
      className={cn(
        "relative group animate-scale-in",
        !entered && !isRemoving && "gallery-card-stagger",
        isRemoving && "animate-fade-out scale-95 opacity-0",
      )}
      style={{ '--stagger-delay': `${index * 60}ms` } as React.CSSProperties}
    >
      <figure
        className="relative overflow-hidden rounded-[1.15rem] border transition-all duration-300"
        style={{
          backgroundColor: "rgba(253,252,245,0.9)",
          borderColor: "rgba(212,163,115,0.18)",
          boxShadow: "0 14px 32px rgba(212,163,115,0.12)",
        }}
      >
        <div className="relative overflow-hidden img-frame" style={{ aspectRatio: "1 / 1" }}>
          {!isLoaded && !imgError && (
            <div
              className="absolute inset-0 animate-shimmer"
              style={{ backgroundColor: "var(--beige)" }}
            />
          )}

          {imgError ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: "rgba(212,163,115,0.08)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "rgba(43,43,43,0.35)" }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span
                className="text-[0.65rem] font-medium"
                style={{ color: "rgba(43,43,43,0.45)", fontFamily: "var(--font-sans)" }}
              >
                Preview unavailable
              </span>
            </div>
          ) : (
            <Image
              src={item.previewUrl}
              alt={`Photo ${index + 1}`}
              fill
              loading="lazy"
              className={cn(
                "object-cover transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setIsLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background:
                "linear-gradient(180deg, rgba(43,43,43,0.04) 0%, rgba(43,43,43,0.34) 100%)",
            }}
          />

          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: "rgba(254,250,224,0.92)",
              color: "var(--charcoal)",
              boxShadow: "0 8px 20px rgba(43,43,43,0.12)",
            }}
            aria-label="Remove photo"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {item.status === "uploading" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "rgba(43,43,43,0.42)" }}
            >
              <div
                className="h-7 w-7 rounded-full animate-spin"
                style={{
                  border: "2px solid rgba(254,250,224,0.4)",
                  borderTopColor: "var(--cornsilk)",
                }}
              />
              <span
                className="text-[0.7rem] font-medium"
                style={{ color: "var(--cornsilk)", fontFamily: "var(--font-sans)" }}
              >
                Uploading
              </span>
            </div>
          )}

          {item.status === "error" && (
            <div
              className="absolute inset-x-3 bottom-3 rounded-[0.9rem] px-3 py-2"
              style={{
                backgroundColor: "rgba(115,46,46,0.94)",
                color: "var(--cornsilk)",
                boxShadow: "0 8px 24px rgba(43,43,43,0.15)",
              }}
            >
              <p
                className="text-[0.66rem] font-medium leading-tight"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {item.error ?? "Upload failed"}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-medium"
                  style={{
                    backgroundColor: "rgba(254,250,224,0.18)",
                    color: "var(--cornsilk)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Retry upload
                </button>
              )}
            </div>
          )}

          <span
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[0.65rem] font-medium"
            style={{
              backgroundColor: "rgba(254,250,224,0.92)",
              color: "var(--charcoal)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.04em",
            }}
          >
            {item.status === "uploading"
              ? "Uploading"
              : item.status === "error"
                ? "Needs attention"
                : `${index + 1} of ${total}`}
          </span>
        </div>

        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{
            borderTop: "1px solid rgba(212,163,115,0.14)",
            backgroundColor: "rgba(255,253,246,0.76)",
          }}
        >
          <figcaption
            className="min-w-0 truncate text-[0.76rem]"
            style={{
              color: item.status === "error" ? "#8B5E4C" : "rgba(43,43,43,0.6)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {item.status === "uploaded" ? formatPhotoLabel(item.fileName) : `Photo ${index + 1}`}
          </figcaption>
          <span
            className="shrink-0 text-[0.68rem]"
            style={{
              color: item.status === "error" ? "#8B5E4C" : "#8C7A67",
              fontFamily: "var(--font-sans)",
            }}
          >
            {index + 1}/{total}
          </span>
        </div>
      </figure>
    </div>
  );
}

function formatPhotoLabel(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  const cleaned = withoutExtension.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return 'Saved photo';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export function ImageGallery({ items, onRemove, onRetry }: ImageGalleryProps) {
  if (items.length === 0) return null;

  const gridClass =
    items.length === 1 ? 'photo-grid--1' :
    items.length === 2 ? 'photo-grid--2' :
    items.length === 3 ? 'photo-grid--3' :
    'photo-grid--4';

  return (
    <div className="mt-6">
      <div className={`photo-grid ${gridClass}`}>
        {items.map((item, index) => (
          <ImageCard
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            onRemove={() => onRemove(item.id)}
            onRetry={item.status === "error" ? () => onRetry?.(item.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function DropZone({
  onFilesSelected,
  accept = "image/*",
  disabled,
  className,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = isDragging || isHovering || isFocused;

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const acceptsAudio = accept.toLowerCase().includes("audio");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFilesSelected(files);
    },
    [disabled, onFilesSelected],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const dropZoneLabel = acceptsAudio ? "Upload audio recording" : "Upload photo";

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label={dropZoneLabel}
      aria-disabled={disabled}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-[1.35rem] border transition-all duration-300",
        isDragging && "scale-[1.01]",
        className,
      )}
      style={{
        borderColor: isActive
          ? "rgba(212,163,115,0.6)"
          : isHovering
            ? "rgba(212,163,115,0.40)"
            : "rgba(212,163,115,0.18)",
        backgroundColor: isActive
          ? "rgba(212,163,115,0.10)"
          : isHovering
            ? "rgba(250,237,205,0.50)"
            : "rgba(255,253,246,0.88)",
        minHeight: 148,
        boxShadow: isActive
          ? "0 18px 40px rgba(212,163,115,0.18), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 1px 4px rgba(212,163,115,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        aria-label={dropZoneLabel}
      />

      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Warm gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDragging
            ? "radial-gradient(ellipse at 50% 0%, rgba(212,163,115,0.12) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 50% 100%, rgba(204,213,174,0.08) 0%, transparent 60%)",
          transition: "background 400ms ease",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
        {/* Scrapbook-style polaroid icon */}
        <div
          className={cn(
            "mb-4 flex items-center justify-center transition-all duration-400",
            isDragging && "scale-110 rotate-[-3deg]",
            !isDragging && isActive && "scale-105",
          )}
          style={{
            width: 64,
            height: 64,
            transform: isDragging ? "scale(1.12) rotate(-4deg)" : isActive ? "scale(1.06)" : "scale(1)",
          }}
        >
          {acceptsAudio ? (
            /* Warm microphone / voice note icon */
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer glow circle */}
              <circle cx="26" cy="26" r="24" fill="rgba(212,163,115,0.08)" />
              {/* Mic body - warm bronze */}
              <rect x="20" y="14" width="12" height="20" rx="6" fill="rgba(212,163,115,0.22)" stroke="#D4A373" strokeWidth="1.6"/>
              {/* Stand curve */}
              <path d="M16 28C16 33.523 20.477 38 26 38C31.523 38 36 33.523 36 28" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              {/* Stand line */}
              <line x1="26" y1="38" x2="26" y2="43" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Sound waves */}
              <path d="M40 20C42.5 22 44 25 44 28C44 31 42.5 34 40 36" stroke="#D4A373" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"/>
              <path d="M44 17C48 20.5 50 25 50 29C50 33 48 37.5 44 41" stroke="#D4A373" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35"/>
              <path d="M12 20C9.5 22 8 25 8 28C8 31 9.5 34 12 36" stroke="#D4A373" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"/>
              <path d="M8 17C4 20.5 2 25 2 29C2 33 4 37.5 8 41" stroke="#D4A373" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35"/>
            </svg>
          ) : (
            /* Polaroid-style photo frame */
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Polaroid frame outer */}
              <rect x="8" y="12" width="48" height="40" rx="4" fill="rgba(212,163,115,0.12)" stroke="#D4A373" strokeWidth="1.6"/>
              {/* Photo area */}
              <rect x="13" y="17" width="38" height="28" rx="2" fill="rgba(212,163,115,0.10)" stroke="rgba(212,163,115,0.40)" strokeWidth="1"/>
              {/* Mountain landscape inside photo */}
              <path d="M13 40L22 30L28 35L35 28L51 40H13Z" fill="rgba(204,213,174,0.30)" stroke="rgba(212,163,115,0.50)" strokeWidth="1" strokeLinejoin="round"/>
              {/* Sun/circle */}
              <circle cx="42" cy="23" r="4" fill="rgba(212,163,115,0.35)"/>
              {/* Bottom tape strip */}
              <rect x="26" y="9" width="12" height="5" rx="1" fill="rgba(212,163,115,0.28)" stroke="rgba(212,163,115,0.40)" strokeWidth="0.8"/>
              {/* Corner fold hint */}
              <path d="M46 17L51 12L51 17Z" fill="rgba(212,163,115,0.15)"/>
            </svg>
          )}
        </div>

        {/* Evocative scrapbook copy */}
        <p
          className="mb-2 text-sm font-medium"
          style={{
            color: "var(--charcoal)",
            fontFamily: "var(--font-serif)",
            fontSize: "0.9rem",
            letterSpacing: "0.01em",
          }}
        >
          {isDragging
            ? acceptsAudio
              ? "Let the moment breathe..."
              : "Tuck it into the story..."
            : acceptsAudio
              ? "Capture a voice note"
              : "Add a photograph"}
        </p>

        <p
          className="max-w-xs text-xs leading-5"
          style={{
            color: "rgba(43,43,43,0.62)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {acceptsAudio
            ? "Drag a recording here, or click to browse. MP3, M4A, WAV."
            : "Drop it here, or click to browse. Images under 4MB."}
        </p>

        {/* Decorative corner flourish */}
        <div
          className="absolute top-3 right-3 w-5 h-5 opacity-30"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(212,163,115,0.6) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-3 left-3 w-4 h-4 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(204,213,174,0.8) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
