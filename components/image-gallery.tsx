"use client";

import { useCallback, useRef, useState } from "react";

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

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 280);
  };

  return (
    <div
      className={cn(
        "relative group animate-scale-in",
        isRemoving && "animate-fade-out scale-95 opacity-0 transition-all duration-[280ms]"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <div
        className="relative bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md"
        style={{
          boxShadow: "0 2px 12px rgba(212,163,115,0.12), 0 1px 3px rgba(43,43,43,0.06)",
          padding: "6px 6px 28px 6px",
        }}
      >
        <div
          className="relative overflow-hidden rounded-lg img-frame"
          style={{ width: 160, height: 160 }}
        >
          {!isLoaded && (
            <div
              className="absolute inset-0 animate-shimmer"
              style={{ backgroundColor: "var(--beige)" }}
            />
          )}

          <img
            src={item.previewUrl}
            alt={`Photo ${index + 1}`}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
          />

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
            style={{ background: "rgba(43,43,43,0.32)" }}
          >
            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 hover:bg-white transition-colors"
              aria-label="Remove photo"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--charcoal)" }}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

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
              className="absolute inset-x-2 bottom-2 rounded-lg px-2 py-2"
              style={{
                backgroundColor: "rgba(115,46,46,0.92)",
                color: "var(--cornsilk)",
                boxShadow: "0 8px 24px rgba(43,43,43,0.15)",
              }}
            >
              <p
                className="text-[0.625rem] font-medium leading-tight"
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

          <div
            className="absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(254,250,224,0.92)",
              color: "var(--charcoal)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.6875rem",
            }}
          >
            {index + 1} / {total}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 text-center py-2 text-xs truncate"
          style={{
            color: item.status === "error" ? "rgba(124,69,47,0.75)" : "rgba(43,43,43,0.45)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            letterSpacing: "0.05em",
          }}
        >
          {item.status === "uploaded" ? item.fileName : `Photo ${index + 1}`}
        </div>
      </div>
    </div>
  );
}

export function ImageGallery({ items, onRemove, onRetry }: ImageGalleryProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div
        className="flex flex-wrap gap-5"
        style={{ padding: "4px 2px" }}
      >
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) onFilesSelected(files);
    },
    [disabled, onFilesSelected]
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
        "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
        className,
        disabled && "opacity-50 cursor-not-allowed",
        isDragging
          ? "border-[var(--bronze)] scale-[1.01]"
          : isHovering
            ? "border-[var(--bronze)]/60"
            : "border-[rgba(212,163,115,0.25)]"
      )}
      style={{
        backgroundColor: isDragging
          ? "rgba(212,163,115,0.08)"
          : "rgba(250,237,205,0.4)",
        minHeight: 120,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
      />

      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-8 px-6 transition-all duration-300",
          isDragging && "scale-100"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragging
              ? "bg-[var(--bronze)] scale-110"
              : "bg-[rgba(212,163,115,0.15)]"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: isDragging ? "var(--cornsilk)" : "var(--bronze)" }}
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>

        <div className="text-center">
          <p
            className="text-sm font-medium transition-colors duration-200"
            style={{
              color: isDragging ? "var(--bronze)" : "var(--charcoal)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {isDragging ? "Drop photos here" : "Drag photos here"}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "#6A6A5A", fontFamily: "var(--font-sans)" }}
          >
            or click to browse — up to 4MB each
          </p>
        </div>
      </div>
    </div>
  );
}
