'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        const u = data.user;
        if (u) {
          setUser(u);
          setName(u.name ?? '');
          setProfileImageUrl(u.profile_image_url ?? null);
        }
      } catch {
        // silently fail for settings
      } finally {
        setLoading(false);
      }
    }
    void loadUser();
  }, [router]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, name: data.name ?? name } : prev);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be smaller than 2MB.');
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      // Get upload URL from our API
      const uploadRes = await fetch('/api/user/profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!uploadRes.ok) {
        // If the endpoint doesn't exist yet, use a temporary local preview
        const localUrl = URL.createObjectURL(file);
        setProfileImageUrl(localUrl);
        setImageError('');
        return;
      }

      const { uploadUrl, publicUrl } = await uploadRes.json();

      // Upload to storage
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!putRes.ok) throw new Error('Upload failed');

      setProfileImageUrl(publicUrl);

      // Update user profile
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: publicUrl }),
      });

    } catch (err) {
      setImageError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      {/* ── TOP NAV ── */}
      <header
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0"
        style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}
      >
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </Link>
          <Link href="/dashboard" className="text-sm transition-colors hover:opacity-70" style={{ color: '#6A6A5A' }}>
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="px-6 md:px-10 py-12 max-w-3xl mx-auto w-full">

        {/* Page header */}
        <div className="mb-10">
          <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Account</p>
          <h1 className="display-md mb-3" style={{ color: 'var(--charcoal)' }}>Settings</h1>
          <p className="text-base" style={{ color: '#6A6A5A' }}>
            Manage your profile and preferences.
          </p>
        </div>

        <div className="space-y-8">

          {/* ── Profile Section ── */}
          <section
            className="rounded-3xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(212,163,115,0.18)',
              boxShadow: '0 4px 24px rgba(212,163,115,0.07)',
            }}
          >
            {/* Warm accent bar */}
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--bronze)' }} />

            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>Profile</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6A6A5A' }}>How you appear across Memory Project</p>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-7">

              {/* Avatar + image upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar display */}
                <div className="relative group">
                  {profileImageUrl ? (
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(212,163,115,0.2)' }}>
                        <Image
                          src={profileImageUrl}
                          alt={user?.name || 'Profile'}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                      {/* Hover overlay */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ backgroundColor: 'rgba(43,43,43,0.5)' }}
                        aria-label="Change profile photo"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,163,115,0.15) 0%, rgba(204,213,174,0.15) 100%)',
                        border: '2px dashed rgba(212,163,115,0.3)',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--bronze)' }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span className="text-xs font-medium" style={{ color: 'var(--bronze)' }}>Add photo</span>
                    </button>
                  )}

                  {/* Upload loading state */}
                  {uploadingImage && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(254,250,224,0.8)' }}>
                      <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Avatar info */}
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-base font-semibold mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                    {user?.name}
                  </p>
                  <p className="text-sm mb-3" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                    {user?.email}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {profileImageUrl ? (
                      <button
                        onClick={() => setProfileImageUrl(null)}
                        className="inline-flex items-center justify-center h-9 rounded-full px-5 text-xs font-medium transition-all hover:opacity-70"
                        style={{ color: '#8A6A5A', backgroundColor: 'rgba(212,163,115,0.06)' }}
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Remove photo
                      </button>
                    ) : (
                      <p className="text-xs" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                        Click the circle to upload a photo
                      </p>
                    )}
                  </div>
                  {imageError && (
                    <p className="text-xs mt-2" style={{ color: '#B91C1C' }}>{imageError}</p>
                  )}
                </div>
              </div>

              {/* Name field */}
              <div className="grid gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  Display name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-base"
                  style={{
                    border: '1.5px solid rgba(212,163,115,0.3)',
                    backgroundColor: '#FFFDF8',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                  }}
                  placeholder="Your name"
                />
              </div>

              {/* Email (read-only — styled as a subtle info field) */}
              <div className="grid gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  Email address
                </span>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(204,213,174,0.08)',
                    border: '1px solid rgba(212,163,115,0.15)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#8A8A7A', marginTop: '1px' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p className="text-sm flex-1" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
                    {user?.email}
                  </p>
                </div>
                <p className="text-xs" style={{ color: '#8A8A7A', fontFamily: 'var(--font-sans)' }}>
                  Contact support to change your email address
                </p>
              </div>

              {/* Save */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || name.trim() === user?.name}
                  className="inline-flex items-center justify-center h-11 rounded-xl px-8 text-sm font-semibold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--charcoal)',
                    color: 'var(--cornsilk)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 4px 16px rgba(43,43,43,0.18)',
                  }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                      Saving…
                    </>
                  ) : saved ? (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Saved
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
                {saved && !saving && (
                  <p className="text-sm" style={{ color: '#5F6650' }}>Changes saved successfully.</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Privacy Section ── */}
          <section
            className="rounded-3xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(212,163,115,0.18)',
              boxShadow: '0 4px 24px rgba(212,163,115,0.07)',
            }}
          >
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--tea-green)' }} />

            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(204,213,174,0.18)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5F6650' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>Privacy &amp; data</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6A6A5A' }}>Your memories stay private by default</p>
                </div>
              </div>
            </div>
            <div className="p-7">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'rgba(204,213,174,0.15)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5F6650' }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memories are private by default</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6A6A5A' }}>
                      Nothing you write is ever shared, sold, or made public unless you explicitly choose to print or share a book.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'rgba(204,213,174,0.15)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5F6650' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Export your data anytime</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6A6A5A' }}>
                      Download all your memories and books as a simple archive. Your data belongs to you.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'rgba(204,213,174,0.15)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5F6650' }}>
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Delete anytime</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6A6A5A' }}>
                      Permanently delete individual memories, books, or your entire account and all data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Security Section ── */}
          <section
            className="rounded-3xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(212,163,115,0.18)',
              boxShadow: '0 4px 24px rgba(212,163,115,0.07)',
            }}
          >
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--papaya)' }} />

            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(212,163,115,0.15)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>Security</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6A6A5A' }}>Manage your account security</p>
                </div>
              </div>
            </div>
            <div className="p-7">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Password</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6A6A5A' }}>
                      Last changed: Unknown
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center h-9 rounded-full px-5 text-xs font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.2)' }}
                  >
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Danger Zone ── */}
          <section
            className="rounded-3xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(180,80,60,0.15)',
              boxShadow: '0 4px 24px rgba(180,80,60,0.05)',
            }}
          >
            <div className="h-1 w-full" style={{ backgroundColor: '#B4503C' }} />

            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(180,80,60,0.12)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(180,80,60,0.1)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#B4503C' }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>Sign out</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6A6A5A' }}>Sign out of Memory Project on this device</p>
                </div>
              </div>
            </div>
            <div className="p-7">
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center h-11 rounded-full border px-7 text-sm font-medium transition-all hover:opacity-80 active:scale-[0.98]"
                style={{ borderColor: 'rgba(180,80,60,0.35)', color: '#B4503C', backgroundColor: 'transparent' }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          </section>

        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-12 mb-4" style={{ color: '#B0A898', fontFamily: 'var(--font-sans)' }}>
          Memory Project — All memories are kept private and secure.
        </p>
      </main>
    </div>
  );
}
