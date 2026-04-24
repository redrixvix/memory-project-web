"use client";

import { UploadButton as UTButton } from "@uploadthing/react";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { cn } from "@/lib/utils";

// ─── Image Uploader ──────────────────────────────────────────────────────────
// Usage: <ImageUploader onUploadComplete={(res) => console.log(res.map(r => r.url))} />

export function ImageUploader({
  onUploadComplete,
  className,
}: {
  /** Called with uploaded file info after each upload completes */
  onUploadComplete?: (res: { url: string; fileName: string }[]) => void;
  className?: string;
}) {
  return (
    <UTButton<OurFileRouter, "imageUploader">
      endpoint="imageUploader"
      onClientUploadComplete={(res) =>
        onUploadComplete?.(res.map((f) => ({ url: f.url, fileName: f.name })))
      }
      onUploadError={(error) => console.error("[UploadThing]", error)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg",
        "bg-primary text-primary-foreground px-3 py-2 h-8 text-sm font-medium",
        "border border-transparent transition-all outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/80",
        className
      )}
      content={{
        button: () => (
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            Add Images
          </span>
        ),
        allowedContent: () => (
          <span className="text-xs opacity-70 ml-1">up to 4MB</span>
        ),
      }}
    />
  );
}

// ─── Audio Uploader ─────────────────────────────────────────────────────────
// Usage: <AudioUploader onUploadComplete={(res) => console.log(res[0].url)} />

export function AudioUploader({
  onUploadComplete,
  className,
}: {
  onUploadComplete?: (res: { url: string; fileName: string }[]) => void;
  className?: string;
}) {
  return (
    <UTButton<OurFileRouter, "audioUploader">
      endpoint="audioUploader"
      onClientUploadComplete={(res) =>
        onUploadComplete?.(res.map((f) => ({ url: f.url, fileName: f.name })))
      }
      onUploadError={(error) => console.error("[UploadThing]", error)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg",
        "bg-secondary text-secondary-foreground px-3 py-2 h-8 text-sm font-medium",
        "border border-transparent transition-all outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary/80",
        className
      )}
      content={{
        button: () => (
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            Add Audio
          </span>
        ),
        allowedContent: () => (
          <span className="text-xs opacity-70 ml-1">up to 16MB</span>
        ),
      }}
    />
  );
}
