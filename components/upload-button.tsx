"use client";

import { generateUploadButton } from "@uploadthing/react";
import { type OurFileRouter } from "@/app/api/uploadthing/core";

// Generate the button once — URL is resolved client-side via window.location.origin
const UploadThingBtn = generateUploadButton<OurFileRouter>({
  url: typeof window !== "undefined" ? `${window.location.origin}/api/uploadthing` : "/api/uploadthing",
});

// ─── Image Uploader ──────────────────────────────────────────────────────────

export function ImageUploader({
  onUploadComplete,
  className,
}: {
  onUploadComplete?: (res: { url: string; fileName: string }[]) => void;
  className?: string;
}) {
  return (
    <UploadThingBtn
      endpoint="imageUploader"
      onUploadBegin={(fileName) => {
        console.log(`[UploadThing] image upload started: ${fileName}`);
      }}
      onClientUploadComplete={(res) => {
        console.log(`[UploadThing] image upload complete:`, res);
        onUploadComplete?.(res.map((f) => ({ url: f.url, fileName: f.name })));
      }}
      onUploadError={(error) => {
        console.error(`[UploadThing] image upload failed:`, error.message, error.code);
      }}
      appearance={{
        container: className,
        button: "ut-button",
      }}
      content={{
        button: () => (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "0.875rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
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

// ─── Audio Uploader ──────────────────────────────────────────────────────────

export function AudioUploader({
  onUploadComplete,
  className,
}: {
  onUploadComplete?: (res: { url: string; fileName: string }[]) => void;
  className?: string;
}) {
  return (
    <UploadThingBtn
      endpoint="audioUploader"
      onUploadBegin={(fileName) => {
        console.log(`[UploadThing] audio upload started: ${fileName}`);
      }}
      onClientUploadComplete={(res) => {
        console.log(`[UploadThing] audio upload complete:`, res);
        onUploadComplete?.(res.map((f) => ({ url: f.url, fileName: f.name })));
      }}
      onUploadError={(error) => {
        console.error(`[UploadThing] audio upload failed:`, error.message, error.code);
      }}
      appearance={{
        container: className,
        button: "ut-button",
      }}
      content={{
        button: () => (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "0.875rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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