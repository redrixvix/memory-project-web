"use client";

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
            <img
              src={item.previewUrl}
              alt={`Photo ${index + 1}`}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
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
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors"
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
            className="min-w-0 truncate text-[0.72rem] uppercase tracking-[0.16em]"
            style={{
              color: item.status === "error" ? "#8B5E4C" : "rgba(43,43,43,0.52)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {item.status === "uploaded" ? item.fileName : `Photo ${index + 1}`}
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
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
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-[1.35rem] border transition-all duration-300",
        isDragging && "scale-[1.01]",
        className,
      )}
      style={{
        borderColor: isDragging
          ? "rgba(212,163,115,0.5)"
          : isHovering
            ? "rgba(212,163,115,0.34)"
            : "rgba(212,163,115,0.2)",
        backgroundColor: isDragging
          ? "rgba(212,163,115,0.08)"
          : isHovering
            ? "rgba(250,237,205,0.42)"
            : "rgba(255,253,246,0.82)",
        minHeight: 148,
        boxShadow: isDragging ? "0 18px 36px rgba(212,163,115,0.14)" : "none",
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
      />

      <div className="absolute inset-0 opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(212,163,115,0.28) 0, transparent 42%), radial-gradient(circle at 75% 70%, rgba(204,213,174,0.3) 0, transparent 40%)",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
        <div
          className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300", isDragging && "scale-110")}
          style={{
            backgroundColor: isDragging ? "rgba(212,163,115,0.15)" : "rgba(212,163,115,0.1)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              color: isDragging ? "var(--bronze)" : "rgba(43,43,43,0.55)",
              transition: "color 300ms ease",
            }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        </div>

        <p
          className="mb-1 text-sm font-medium"
          style={{
            color: "var(--charcoal)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {isDragging ? "Drop images here" : "Drag photos here"}
        </p>

        <p
          className="max-w-xs text-xs leading-5"
          style={{
            color: "rgba(43,43,43,0.6)",
            fontFamily: "var(--font-sans)",
          }}
        >
          or click to browse from your device. Previews appear instantly.
        </p>
      </div>
    </div>
  );
}
