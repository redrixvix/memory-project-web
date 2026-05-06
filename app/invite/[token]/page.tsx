'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDisplayBookTitle } from '@/lib/display-book-title';

interface InviteData {
  book_id: number;
  book_title: string;
  role: string;
  invite_email: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  contributor: 'Contributor',
  answer_only: 'Can Answer Only',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'var(--bronze)',
  admin: 'var(--tea-green)',
  contributor: 'var(--beige)',
  answer_only: 'var(--papaya)',
};

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const validateInvite = async () => {
      try {
        const res = await fetch(`/api/invite/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'This invite link is invalid or has expired');
          return;
        }
        const data = await res.json();
        setInviteData(data.data);
      } catch {
        setError('This invite link is invalid or has expired');
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!token || !inviteData) return;
    try {
      const res = await fetch(`/api/books/${inviteData.book_id}/members/accept?token=${token}`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push(`/books/${inviteData.book_id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to accept invite');
      }
    } catch {
      setError('Failed to accept invite');
    }
  };

  const handleJoinClick = () => {
    if (!token) return;
    // Store token in sessionStorage so signup can retrieve it
    sessionStorage.setItem('pending_invite_token', token);
    if (inviteData) {
      sessionStorage.setItem('pending_invite_book_id', String(inviteData.book_id));
    }
    router.push(`/signup?invite_token=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div
          className="text-center max-w-sm animate-fade-up"
        >
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}>
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--bronze)' }}>
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
            Invite link invalid
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#6A6A5A' }}>
            {error || 'This invite link is invalid or has expired.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const roleColor = ROLE_COLORS[inviteData.role] || 'var(--beige)';
  const roleLabel = ROLE_LABELS[inviteData.role] || inviteData.role;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--cornsilk)' }}>
      <div
        className="w-full max-w-sm text-center animate-fade-up"
      >
        {/* Book icon */}
        <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center" style={{ backgroundColor: 'rgba(204,213,174,0.25)' }}>
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--charcoal)' }}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>

        <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>You&apos;ve been invited</p>

        <h1 className="text-2xl font-medium mb-3 leading-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
          Join &ldquo;{getDisplayBookTitle(inviteData.book_title)}&rdquo;
        </h1>

        <p className="text-sm leading-relaxed mb-6" style={{ color: '#6A6A5A' }}>
          You&apos;ve been invited to join this memory book as a{' '}
          <span
            className="font-medium px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: roleColor, color: 'var(--charcoal)' }}
          >
            {roleLabel}
          </span>
          {' '}member.
        </p>

        {/* Invited as badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mb-8"
          style={{ backgroundColor: 'rgba(254,250,224,0.7)', border: '1px solid rgba(212,163,115,0.2)' }}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-sm" style={{ color: 'var(--charcoal)' }}>
            Invited: <span style={{ color: '#6A6A5A' }}>{inviteData.invite_email}</span>
          </span>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleJoinClick}
            className="w-full h-12 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            Join Book — Create Account
          </button>

          <Link
            href="/login"
            className="block w-full h-11 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{ border: '1.5px solid rgba(212,163,115,0.4)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
          >
            I already have an account
          </Link>
        </div>

        <p className="text-xs mt-8" style={{ color: '#7A7A6A' }}>
          Free to join. No credit card required.
        </p>
      </div>
    </div>
  );
}
