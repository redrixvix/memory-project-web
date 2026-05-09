'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AppShellHeader } from '@/components/ui/app-shell-header';

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
  const [saveNotice, setSaveNotice] = useState<'profile' | 'photo' | null>(null);
  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

  const showSavedState = (notice: 'profile' | 'photo') => {
    setSaveNotice(notice);
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      setSaveNotice(null);
    }, 2500);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaved(false);
    setSaveNotice(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, name: data.name ?? name } : prev);
        showSavedState('profile');
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
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image must be smaller than 4MB.');
      return;
    }

        setUploadingImage(true);
    setImageError('');

    try {
      // Upload profile image via multipart form to our API
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const { url: publicUrl } = await uploadRes.json();

      setProfileImageUrl(publicUrl);

      // Update user profile
      const profileRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: publicUrl }),
      });

      if (!profileRes.ok) {
        throw new Error('Uploaded photo but could not attach it to your profile.');
      }

      showSavedState('photo');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profileImageUrl || uploadingImage) return;

    setUploadingImage(true);
    setImageError('');
    setSaved(false);
    setSaveNotice(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: null }),
      });

      if (!res.ok) {
        throw new Error('Could not remove your photo right now. Please try again.');
      }

      setProfileImageUrl(null);
      setUser(prev => prev ? { ...prev, profile_image_url: undefined } : prev);
      showSavedState('photo');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not remove your photo right now. Please try again.');
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }} role="status">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>

      <AppShellHeader
        current="Settings"
        links={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/upgrade', label: 'Plans' },
        ]}
      />

      {/* ── MAIN ── */}
      <main className="px-6 md:px-10 py-10 max-w-3xl mx-auto w-full flex-1">

        {/* Page header */}
        <div className="mb-8">
          <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Account</p>
          <h1 className="display-md mb-3" style={{ color: 'var(--charcoal)' }}>Settings</h1>
          <p className="text-base" style={{ color: 'var(--charcoal)' }}>
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
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>Profile</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#4A3A2A' }}>How you appear across Memory Project</p>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-7">

              {/* Avatar + image upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar display — with warm ambient glow */}
                <div className="relative group">
                  {/* Warm ambient glow behind avatar */}
                  <div
                    className="absolute inset-0 rounded-full scale-125 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(212,163,115,0.18) 0%, rgba(204,213,174,0.12) 50%, transparent 70%)',
                      filter: 'blur(8px)',
                    }}
                  />
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
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            if (img.naturalWidth <= 2 || img.naturalHeight <= 2) {
                              // 1x1 placeholder or broken image — treat as no photo
                              setProfileImageUrl(null);
                            }
                          }}
                          onError={() => {
                            setProfileImageUrl(null);
                          }}
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
                      className="relative w-24 h-24 rounded-full overflow-hidden flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 hover:brightness-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,163,115,0.18) 0%, rgba(204,213,174,0.18) 100%)',
                        border: '2px solid rgba(212,163,115,0.35)',
                        boxShadow: '0 4px 16px rgba(212,163,115,0.12)',
                      }}
                      aria-label="Add profile photo"
                    >
                      <span
                        className="text-2xl font-semibold tracking-tight leading-none"
                        style={{ color: 'var(--bronze)', fontFamily: 'var(--font-serif)' }}
                      >
                        {getInitials(name || user?.name || '')}
                      </span>
                      {/* Camera icon — bottom-right corner */}
                      <div
                        className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(212,163,115,0.92)' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                      {/* Hover overlay — subtle dark tint + "Add photo" label */}
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(43,43,43,0.4)' }}
                      >
                        <span className="text-xs font-medium text-white">Add photo</span>
                      </div>
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

                {/* Avatar info — right side */}
                <div className="flex-1 sm:pl-4 min-w-0">
                  {profileImageUrl ? (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={uploadingImage}
                      className="inline-flex items-center justify-center h-10 rounded-full px-5 text-xs font-semibold transition-all hover:brightness-95 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ color: '#6A3A2A', backgroundColor: 'rgba(180,80,60,0.10)', border: '1px solid rgba(180,80,60,0.20)' }}
                    >
                      {uploadingImage ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full animate-spin mr-1.5" style={{ border: '2px solid rgba(106,58,42,0.18)', borderTopColor: '#6A3A2A' }} />
                          Removing…
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                          Remove photo
                        </>
                      )}
                    </button>
                  ) : null}
                  {imageError && (
                    <p className="text-xs mt-2" style={{ color: 'var(--destructive)' }}>{imageError}</p>
                  )}
                </div>
                {/* Upload hint — below avatar when no photo */}
                {!profileImageUrl && (
                  <div className="sm:hidden flex items-center gap-2 px-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--bronze)', flexShrink: 0 }}>
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="M12 8v4m0 4h.01"/>
                    </svg>
                    <p className="text-xs" style={{ color: '#4A3A2A', fontFamily: 'var(--font-sans)' }}>
                      A photo helps family members recognize you in shared books
                    </p>
                  </div>
                )}
              </div>

              {/* Name field */}
              <div className="grid gap-2">
                <label htmlFor="display-name" className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  Display name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all duration-200"
                  style={{
                    border: '1.5px solid rgba(212,163,115,0.45)',
                    backgroundColor: '#FFFDF8',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                  }}
                  placeholder="Your name"
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--bronze)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.18)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.45)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Email (read-only — clearly non-editable) */}
              <div className="grid gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  Email address
                </span>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-default select-none"
                  style={{
                    backgroundColor: 'rgba(204,213,174,0.06)',
                    border: '1px solid rgba(212,163,115,0.12)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5A3A2A', marginTop: '1px', flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p className="text-sm flex-1" style={{ color: '#3A3020', fontFamily: 'var(--font-serif)' }}>
                    {user?.email}
                  </p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(212,163,115,0.22)', color: '#4A3A2A', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.4)' }}>
                    read-only
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#4A3A2A', fontFamily: 'var(--font-sans)' }}>
                  Contact support to change your email address
                </p>
              </div>

              {/* Save — sticky at bottom when scrolling */}
              <div className="sticky bottom-0 flex items-center justify-between gap-4 py-4 mt-2 border-t -mx-7 px-7" style={{ borderColor: 'rgba(212,163,115,0.12)', backgroundColor: '#FDFCF5' }}>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || name.trim() === user?.name}
                  className="inline-flex items-center justify-center h-12 rounded-full px-8 text-sm font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.97] hover:shadow-xl hover:shadow-[rgba(212,163,115,0.4)] hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--bronze)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 6px 24px rgba(212,163,115,0.35)',
                  }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--charcoal)' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Save changes
                    </>
                  )}
                </button>
                {saved && !saving && (
                  <div className="flex items-center gap-2 animate-fade-up" style={{ color: '#4A7C59' }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(74,124,89,0.12)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                      {saveNotice === 'photo' ? 'Photo updated' : 'Changes saved'}
                    </span>
                  </div>
                )}
              </div>

              {/* Saved toast — slides in from bottom-right */}
              {saved && !saving && (
                <div
                  className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl animate-fade-up"
                  style={{
                    backgroundColor: 'var(--charcoal)',
                    color: 'var(--cornsilk)',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 8px 32px rgba(43,43,43,0.28), 0 2px 8px rgba(43,43,43,0.12)',
                    animation: 'toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(74,124,89,0.85)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{saveNotice === 'photo' ? 'Photo updated' : 'Profile updated'}</span>
                </div>
              )}
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
                  <p className="text-xs mt-0.5" style={{ color: '#4A3A2A' }}>Your memories stay private by default</p>
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
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#3A3020' }}>
                      Nothing you write is ever shared, sold, or made public unless you explicitly choose to print or share a book.
                    </p>
                  </div>
                </div>
                {/* Export & account deletion — soft teaser when backend is not yet ready */}
                <div
                  className="rounded-2xl p-4 mt-1 flex items-center gap-3"
                  style={{
                    backgroundColor: 'rgba(212,163,115,0.05)',
                    border: '1px solid rgba(212,163,115,0.12)',
                  }}
                >
                  <div className="shrink-0">
                    <div
                      className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(204,213,174,0.2)',
                        color: '#5A6A3A',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.06em',
                        border: '1px solid rgba(204,213,174,0.35)',
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#7A8A5A' }}>
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      Coming soon
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                      Export memories &amp; delete account
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
                      We&apos;ll notify you when these features are available.
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
                  <p className="text-xs mt-0.5" style={{ color: '#4A3A2A' }}>Manage your account security</p>
                </div>
              </div>
            </div>
            <div className="p-7">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Password</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4A4A3A' }}>
                      You haven&apos;t changed your password yet
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(v => !v)}
                    className="inline-flex items-center justify-center h-10 rounded-full px-5 text-xs font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.2)' }}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change password'}
                  </button>
                </div>
                {showPasswordForm && (
                  <div className="mt-4 p-4 rounded-xl space-y-3" style={{ backgroundColor: 'rgba(212,163,115,0.06)', border: '1px solid rgba(212,163,115,0.12)' }}>
                    {passwordError && (
                      <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: '#B91C1C', border: '1px solid rgba(185,28,28,0.2)' }}>{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(212,163,115,0.15)', color: 'var(--charcoal)' }}>Password updated successfully.</div>
                    )}
                    <div>
                      <Label className="text-xs mb-1 block" style={{ color: 'var(--charcoal)' }}>Current password</Label>
                      <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" className="h-10 rounded-lg text-sm" style={{ borderColor: 'rgba(212,163,115,0.55)', backgroundColor: '#FDFCF5' }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block" style={{ color: 'var(--charcoal)' }}>New password</Label>
                      <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="h-10 rounded-lg text-sm" style={{ borderColor: 'rgba(212,163,115,0.55)', backgroundColor: '#FDFCF5' }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block" style={{ color: 'var(--charcoal)' }}>Confirm new password</Label>
                      <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-10 rounded-lg text-sm" style={{ borderColor: 'rgba(212,163,115,0.55)', backgroundColor: '#FDFCF5' }} />
                    </div>
                    <button
                      onClick={async () => {
                        setPasswordError('');
                        setPasswordSuccess(false);
                        if (!newPassword || !currentPassword) { setPasswordError('Please fill in all fields.'); return; }
                        if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
                        if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
                        setChangingPassword(true);
                        try {
                          const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
                          const data = await res.json();
                          if (!res.ok) { setPasswordError(data.error || 'Could not update password.'); return; }
                          setPasswordSuccess(true);
                          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                          setTimeout(() => { setShowPasswordForm(false); setPasswordSuccess(false); }, 2500);
                        } catch { setPasswordError('Something went wrong. Please try again.'); }
                        finally { setChangingPassword(false); }
                      }}
                      disabled={changingPassword}
                      className="inline-flex items-center justify-center h-10 rounded-full px-5 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
                    >
                      {changingPassword ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                )}
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
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>Sign out</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#4A3A2A' }}>Sign out of Memory Project on this device</p>
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
      </main>

      {/* Footer note */}
      <footer className="text-center text-xs py-6 mt-auto" style={{ color: '#B0A898', fontFamily: 'var(--font-sans)' }}>
        Memory Project — All memories are kept private and secure.
      </footer>
    </div>
  );
}
