"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── ImageGallery ─────────────────────────────────────────────────────────────

interface ImageGalleryProps {
  urls: string[];
  onRemove: (index: number) => void;
}

function ImageCard({
  url,
  index,
  total,
  onRemove,
}: {
  url: string;
  index: number;
  total: number;
  onRemove: () => void;
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
          <Image
            src={url}
            alt={`Photo ${index + 1}`}
            fill
            className={cn("object-cover transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setIsLoaded(true)}
            sizes="160px"
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
            color: "rgba(43,43,43,0.45)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            letterSpacing: "0.05em",
          }}
        >
          Photo {index + 1}
        </div>
      </div>
    </div>
  );
}

export function ImageGallery({ urls, onRemove }: ImageGalleryProps) {
  if (urls.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-5" style={{ padding: "4px 2px" }}>
        {urls.map((url, i) => (
          <ImageCard
            key={`${url}-${i}`}
            url={url}
            index={i}
            total={urls.length}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function DropZone({
  onFilesSelected,
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

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
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
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
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
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-3 py-8 px-6">
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

// ─── UploadThing Buttons ──────────────────────────────────────────────────────

// Cached button class — generated once per browser session
let _UTButton: ReturnType<typeof import("@uploadthing/react").generateUploadButton> | null = null;
let _UTButtonPromise: Promise<NonNullable<typeof _UTButton>> | null = null;

async function getUTButton(): Promise<NonNullable<typeof _UTButton>> {
  if (_UTButton) return _UTButton;
  if (_UTButtonPromise) return _UTButtonPromise;
  _UTButtonPromise = (async () => {
    const { generateUploadButton } = await import("@uploadthing/react");
    _UTButton = generateUploadButton({
      url: typeof window !== "undefined" ? `${window.location.origin}/api/uploadthing` : "/api/uploadthing",
    }) as NonNullable<typeof _UTButton>;
    return _UTButton;
  })();
  return _UTButtonPromise;
}

interface UploadButtonProps {
  onUploadComplete?: (res: { url: string; fileName: string }[]) => void;
  className?: string;
}

// UploadThing button component — lazy loaded client-side
export function ImageUploader({ onUploadComplete, className }: UploadButtonProps) {
  const [UTButton, setUTButton] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    getUTButton().then(setUTButton).catch(() => setUTButton(null));
  }, []);

  if (!UTButton) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5",
          "text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-60",
          "bg-[var(--charcoal)] text-[var(--cornsilk)]",
          className
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        Add Photos
      </button>
    );
  }

  return (
    <UTButton
      endpoint="imageUploader"
      onUploadBegin={(fileName: string) => console.log(`[Upload] ${fileName}`)}
      onClientUploadComplete={(res: any[]) => {
        onUploadComplete?.(res.map((f: any) => ({ url: f.url, fileName: f.name })));
      }}
      onUploadError={(error: any) => console.error(`[Upload] error:`, error.message)}
      appearance={{
        container: className,
        // CSS in globals.css handles the actual styling (including overriding bg-blue)
        button: "ut-button",
      }}
      content={{
        button: () => (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "0.875rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            Add Photos
          </span>
        ),
        allowedContent: () => (
          <span style={{ fontSize: "0.75rem", opacity: 0.65, marginLeft: "4px" }}>up to 4MB</span>
        ),
      }}
    />
  );
}

export function AudioUploader({ onUploadComplete, className }: UploadButtonProps) {
  const [UTButton, setUTButton] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    getUTButton().then(setUTButton).catch(() => setUTButton(null));
  }, []);

  if (!UTButton) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5",
          "text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-60",
          "border bg-transparent border-[rgba(212,163,115,0.4)] text-[var(--charcoal)]",
          className
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        Add Audio
      </button>
    );
  }

  return (
    <UTButton
      endpoint="audioUploader"
      onUploadBegin={(fileName: string) => console.log(`[Audio] ${fileName}`)}
      onClientUploadComplete={(res: any[]) => {
        onUploadComplete?.(res.map((f: any) => ({ url: f.url, fileName: f.name })));
      }}
      onUploadError={(error: any) => console.error(`[Audio] error:`, error.message)}
      appearance={{
        container: className,
        button: [
          "ut-button",
          "audio-btn",
        ].join(" "),
      }}
      content={{
        button: () => (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "0.875rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            Add Audio
          </span>
        ),
        allowedContent: () => (
          <span style={{ fontSize: "0.75rem", opacity: 0.65, marginLeft: "4px" }}>up to 16MB</span>
        ),
      }}
    />
  );
}
