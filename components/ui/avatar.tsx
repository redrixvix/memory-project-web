'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, imageUrl, className }: AvatarProps) {
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium select-none',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #D4A373 0%, #C49A6C 50%, #B8895A 100%)',
        color: '#2B2B2B',
        fontFamily: 'var(--font-serif, Georgia, serif)',
        letterSpacing: '0.03em',
      }}
      title={name}
    >
      {initials}
    </div>
  );
}