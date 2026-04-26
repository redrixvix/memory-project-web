'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  googleAvatarId?: string | null;
  className?: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, imageUrl, googleAvatarId, className, size }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Build the resolved URL: imageUrl wins if set, then Google avatar, then none
  const primaryUrl = (imageUrl && imageUrl.trim())
    ? imageUrl
    : (googleAvatarId && googleAvatarId.trim())
      ? `https://lh3.googleusercontent.com/a/${googleAvatarId}/photo.jpg`
      : null;

  // If primary image fails, try Google avatar as secondary fallback (only if Google was not the primary)
  const secondaryGoogleUrl = (imageUrl && imageUrl.trim()) && (googleAvatarId && googleAvatarId.trim())
    ? `https://lh3.googleusercontent.com/a/${googleAvatarId}/photo.jpg`
    : null;

  const initials = getInitials(name);
  const sizeValue = size ?? 40;

  // Primary image loaded successfully
  if (primaryUrl && !imgError) {
    return (
      <Image
        src={primaryUrl}
        alt={name}
        width={sizeValue}
        height={sizeValue}
        className={cn('rounded-full object-cover shrink-0', className)}
        unoptimized
        onError={() => setImgError(true)}
      />
    );
  }

  // Primary failed and Google avatar available as secondary
  if (secondaryGoogleUrl) {
    return (
      <Image
        src={secondaryGoogleUrl}
        alt={name}
        width={sizeValue}
        height={sizeValue}
        className={cn('rounded-full object-cover shrink-0', className)}
        unoptimized
        onError={() => setImgError(true)}
      />
    );
  }

  // All image attempts failed — show initials
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium select-none shrink-0',
        className
      )}
      style={{
        width: sizeValue,
        height: sizeValue,
        background: 'linear-gradient(135deg, #D4A373 0%, #C49A6C 50%, #B8895A 100%)',
        color: '#2B2B2B',
        fontFamily: 'var(--font-serif, Georgia, serif)',
        letterSpacing: '0.03em',
        fontSize: Math.round(sizeValue * 0.38),
      }}
      title={name}
    >
      {initials}
    </div>
  );
}