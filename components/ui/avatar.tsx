'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: number;
}

function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Generate a warm, consistent color from a name string
function getAvatarColor(name: string): { bg: string; text: string } {
  const PALETTE = [
    { bg: 'linear-gradient(135deg, #B8895A 0%, #9E7350 100%)', text: '#FDFCF5' },
    { bg: 'linear-gradient(135deg, #8B7355 0%, #6B5A45 100%)', text: '#FDFCF5' },
    { bg: 'linear-gradient(135deg, #A07D5A 0%, #7A5F42 100%)', text: '#FDFCF5' },
    { bg: 'linear-gradient(135deg, #C4A882 0%, #A68B60 100%)', text: '#2B2B2B' },
    { bg: 'linear-gradient(135deg, #9B8B75 0%, #7A6F5F 100%)', text: '#FDFCF5' },
    { bg: 'linear-gradient(135deg, #B09A7A 0%, #8F7B5E 100%)', text: '#2B2B2B' },
    { bg: 'linear-gradient(135deg, #7D8B6A 0%, #5E6B4E 100%)', text: '#FDFCF5' },
    { bg: 'linear-gradient(135deg, #8A7B6A 0%, #6B5E50 100%)', text: '#FDFCF5' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function Avatar({ name, imageUrl, className, size }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(name);
  const sizeValue = size ?? 40;

  // Use imageUrl if it's a valid non-empty string pointing to a real image.
  // onLoad checks naturalWidth to catch broken/placeholder images (e.g. 1x1 pixel).
  const hasValidImage = imageUrl && imageUrl.trim() && !imgError;

  if (hasValidImage) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={sizeValue}
        height={sizeValue}
        className={cn('rounded-full object-cover shrink-0', className)}
        unoptimized
        onError={() => setImgError(true)}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth <= 1 && img.naturalHeight <= 1) {
            setImgError(true);
          }
        }}
      />
    );
  }

  // Image failed to load or not provided — show initials with warm generated color
  const color = getAvatarColor(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium select-none shrink-0',
        className
      )}
      style={{
        width: sizeValue,
        height: sizeValue,
        background: color.bg,
        color: color.text,
        fontFamily: 'var(--font-serif, Georgia, serif)',
        letterSpacing: '0.03em',
        fontSize: Math.round(sizeValue * 0.36),
        fontWeight: 500,
        boxShadow: `0 ${Math.round(sizeValue * 0.08)}px ${Math.round(sizeValue * 0.25)}px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.10)`,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
