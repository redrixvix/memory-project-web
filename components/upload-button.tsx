"use client";

import { generateUploadButton } from "@uploadthing/react";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { cn } from "@/lib/utils";

const UploadThingButton = generateUploadButton<OurFileRouter>({
  url: "/api/uploadthing",
});

const uploadThingConfig = { cn } as const;

function logUploadDebug(message: string, details?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[UploadThing] ${message}`, details);
  }
}

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
    <UploadThingButton
      endpoint="imageUploader"
      config={uploadThingConfig}
      onUploadBegin={(fileName) => logUploadDebug("upload started", { endpoint: "imageUploader", fileName })}
      onClientUploadComplete={(res) => {
        logUploadDebug("upload completed", { endpoint: "imageUploader", files: res });
        onUploadComplete?.(res.map((f) => ({ url: f.url, fileName: f.name })));
      }}
      onUploadError={(error) => {
        console.error("[UploadThing] image upload failed", error);
      }}
      appearance={{
        container: cn("inline-flex shrink-0 flex-col items-start gap-1", className),
        button: cn(
          "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-2",
          "bg-primary text-primary-foreground text-sm font-medium",
          "border border-transparent transition-all outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/80",
          "w-auto min-w-0"
        ),
        allowedContent: "ml-1 text-xs opacity-70",
      }}
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
    <UploadThingButton
      endpoint="audioUploader"
      config={uploadThingConfig}
      onUploadBegin={(fileName) => logUploadDebug("upload started", { endpoint: "audioUploader", fileName })}
      onClientUploadComplete={(res) => {
        logUploadDebug("upload completed", { endpoint: "audioUploader", files: res });
        onUploadComplete?.(res.map((f) => ({ url: f.url, fileName: f.name })));
      }}
      onUploadError={(error) => {
        console.error("[UploadThing] audio upload failed", error);
      }}
      appearance={{
        container: cn("inline-flex shrink-0 flex-col items-start gap-1", className),
        button: cn(
          "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-2",
          "bg-secondary text-secondary-foreground text-sm font-medium",
          "border border-transparent transition-all outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary/80",
          "w-auto min-w-0"
        ),
        allowedContent: "ml-1 text-xs opacity-70",
      }}
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
