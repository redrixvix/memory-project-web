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

export function Avatar({ name, imageUrl, className, size }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(name);
  const sizeValue = size ?? 40;

  // Use imageUrl if it's a valid non-empty string
  if (imageUrl && imageUrl.trim() && !imgError) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={sizeValue}
        height={sizeValue}
        className={cn('rounded-full object-cover shrink-0', className)}
        unoptimized
        onError={() => setImgError(true)}
      />
    );
  }

  // Image failed to load or not provided — show initials
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium select-none shrink-0',
        className
      )}
      style={{
        width: sizeValue,
        height: sizeValue,
        background: 'linear-gradient(135deg, #D4A373 0%, #C9976A 50%, #B8875A 100%)',
        color: '#2B2B2B',
        fontFamily: 'var(--font-serif, Georgia, serif)',
        letterSpacing: '0.04em',
        fontSize: Math.round(sizeValue * 0.38),
        boxShadow: `0 ${Math.round(sizeValue * 0.1)}px ${Math.round(sizeValue * 0.3)}px rgba(212,163,115,0.18), 0 ${Math.round(sizeValue * 0.05)}px ${Math.round(sizeValue * 0.1)}px rgba(212,163,115,0.08), inset 0 1px 2px rgba(255,255,255,0.15)`
      }}
      title={name}
    >
      {initials}
    </div>
  );
}