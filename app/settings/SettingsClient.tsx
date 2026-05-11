'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string;
}

export default function SettingsClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Please enter your name'); setNameTouched(true); return; }
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
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image must be smaller than 4MB.');
      return;
    }

        setUploadingImage(true);
        setUploadProgress(0);
        setImageError('');

    try {
      // Upload profile image via XHR for real progress tracking
      const formData = new FormData();
      formData.append('file', file);

      const publicUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/user/profile-image');
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 90)); // cap at 90 until complete
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              setUploadProgress(100);
              resolve(data.url as string);
            } catch {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed (status ${xhr.status})`));
            }
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload was cancelled')));
        xhr.send(formData);
      });

      setProfileImageUrl(publicUrl);

      // Update user profile
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: publicUrl }),
      });

    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
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
        <div className="w-full max-w-3xl px-6">
          {/* Settings loading skeleton — warm shimmer matching settings layout */}
          <div className="mb-8">
            <div className="h-4 w-20 rounded-lg mb-3 skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
            <div className="h-9 w-40 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.22)' }} />
          </div>

          {/* Profile section skeleton */}
          <div className="rounded-3xl border overflow-hidden mb-6" style={{
            backgroundColor: '#FDFCF5',
            borderColor: 'rgba(212,163,115,0.18)',
          }}>
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--bronze)' }} />
            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                <div className="space-y-1.5">
                  <div className="h-4 w-20 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                  <div className="h-3 w-36 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                </div>
              </div>
            </div>
            <div className="p-7 space-y-7">
              {/* Avatar row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-20 h-20 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-9 w-40 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                  <div className="h-10 w-full rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
                </div>
              </div>
              {/* Name field */}
              <div className="space-y-2">
                <div className="h-4 w-12 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                <div className="h-12 w-full rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.14)' }} />
              </div>
              {/* Email field */}
              <div className="space-y-2">
                <div className="h-4 w-24 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                <div className="h-12 w-full rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
              </div>
            </div>
          </div>

          {/* Security section skeleton */}
          <div className="rounded-3xl border overflow-hidden" style={{
            backgroundColor: '#FDFCF5',
            borderColor: 'rgba(212,163,115,0.18)',
          }}>
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--papaya)' }} />
            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(212,163,115,0.12)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.15)' }} />
                <div className="space-y-1.5">
                  <div className="h-4 w-20 rounded-lg skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.18)' }} />
                  <div className="h-3 w-36 rounded-md skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
                </div>
              </div>
            </div>
            <div className="p-7">
              <div className="h-10 w-32 rounded-xl skeleton-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      <style>{`
        .skip-link {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          padding: 0.75rem 1.25rem;
          background: var(--bronze);
          color: var(--charcoal);
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 0 0 0.5rem;
          transform: translateY(-100%);
          transition: transform 0.15s;
          text-decoration: none;
        }
        .skip-link:focus {
          transform: translateY(0);
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <header
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0"
        style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}
      >
        <a href="#main" className="skip-link">Skip to main content</a>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </Link>
          <Link href="/dashboard" aria-label="Back to dashboard" className="nav-link text-sm" style={{ color: '#5A5A4A' }}>
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main id="main" className="px-6 md:px-10 py-10 max-w-3xl mx-auto w-full">

        {/* Page header */}
        <div className="mb-8">
          <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Account</p>
          <h1 className="display-md mb-3" style={{ color: 'var(--charcoal)' }}>Settings</h1>
          <p className="text-base" style={{ color: '#5A5A4A' }}>
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
                  <p className="text-xs mt-0.5" style={{ color: '#5A5A4A' }}>How you appear across Memory Project</p>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-7">

              {/* Avatar + image upload */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar display — with warm ambient glow */}
                <div className="relative group shrink-0">
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
                      <div className="w-20 h-20 rounded-full overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(212,163,115,0.2)' }}>
                        <Image
                          src={profileImageUrl}
                          alt={user?.name || 'Profile'}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          unoptimized
                          priority
                        />
                      </div>
                      {/* Hover overlay */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-1"
                        style={{ backgroundColor: 'rgba(43,43,43,0.5)' }}
                        aria-label="Change profile photo"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-1"
                        style={{
                          background: 'linear-gradient(135deg, rgba(212,163,115,0.18) 0%, rgba(204,213,174,0.18) 100%)',
                          border: '2px solid rgba(212,163,115,0.35)',
                          boxShadow: '0 4px 16px rgba(212,163,115,0.12)',
                        }}
                        aria-label="Add profile photo"
                      >
                        <span 
                          className="text-xl font-semibold tracking-tight"
                          style={{ color: 'var(--bronze)', fontFamily: 'var(--font-serif)' }}
                        >
                          {getInitials(name || user?.name || '')}
                        </span>
                        {/* Camera icon at bottom-right */}
                        <div 
                          className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(212,163,115,0.9)' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </div>
                        {/* Hover overlay indicator — non-interactive, purely visual */}
                        <div 
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none"
                          style={{ backgroundColor: 'rgba(43,43,43,0.45)' }}
                        >
                          <span className="text-xs font-medium text-white">Add photo</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Upload loading state — show progress ring */}
                  {uploadingImage && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(254,250,224,0.88)' }}>
                      {/* SVG progress ring */}
                      <svg
                        width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}
                        aria-label={`Uploading profile photo: ${uploadProgress}% complete`}
                      >
                        {/* Track */}
                        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(212,163,115,0.18)" strokeWidth="3" />
                        {/* Progress */}
                        <circle
                          cx="20" cy="20" r="16" fill="none"
                          stroke="var(--bronze)" strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - uploadProgress / 100)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                        />
                      </svg>
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
                  aria-label="Upload profile photo"
                  aria-describedby={imageError ? 'image-error' : undefined}
                />

                {/* Avatar info */}
                <div className="flex-1 sm:pl-4">
                  {profileImageUrl ? (
                    <button
                      onClick={() => setProfileImageUrl(null)}
                      className="inline-flex items-center justify-center h-9 rounded-full px-4 text-xs font-semibold transition-all hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-1"
                      style={{ color: '#6A3A2A', backgroundColor: 'rgba(180,80,60,0.10)', border: '1px solid rgba(180,80,60,0.20)' }}
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      Remove photo
                    </button>
                  ) : null}
                </div>
                {/* Upload hint — only when no photo */}
                {!profileImageUrl && (
                  <p className="text-xs mt-2 sm:mt-0 text-center sm:text-left" style={{ color: '#4A4A3A', fontFamily: 'var(--font-sans)' }}>
                    A photo helps family members recognize you in shared books
                  </p>
                )}
                {imageError && (
                  <p id="image-error" role="alert" className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#B91C1C', fontFamily: 'var(--font-sans)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {imageError}
                  </p>
                )}
              </div>

              {/* Name field */}
              <div className="grid gap-2">
<Label htmlFor="display-name" className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  Name
                </Label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (e.target.value.trim()) setNameError(''); }}
                  onBlur={() => { if (!name.trim()) setNameError('Please enter your name'); setNameTouched(true); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
                  aria-label="Display name"
                  aria-invalid={nameTouched && !name.trim()}
                  aria-describedby={nameError ? 'name-error' : undefined}
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all duration-200"
                  style={{
                    border: nameTouched && !name.trim() ? '1.5px solid #C0392B' : '1.5px solid rgba(212,163,115,0.45)',
                    backgroundColor: '#FFFDF8',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                    boxShadow: nameTouched && !name.trim() ? '0 0 0 3px rgba(192,57,43,0.12)' : 'none',
                  }}
                  placeholder="Your name"
                />
                {nameTouched && !name.trim() && (
                  <p id="name-error" className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#C0392B', fontFamily: 'var(--font-sans)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Please enter your name
                  </p>
                )}
              </div>

              {/* Email (read-only — clearly non-editable) */}
              <div className="grid gap-2">
                <Label id="email-label" htmlFor="email-display" className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  Email address
                </Label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{
                  backgroundColor: 'rgba(204,213,174,0.06)',
                  border: '1px solid rgba(212,163,115,0.12)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5A3A2A', marginTop: '1px', flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <output aria-labelledby="email-label" aria-live="polite" className="text-sm flex-1" style={{ color: '#5A5A4A', fontFamily: 'var(--font-serif)' }}>
                    {user?.email}
                  </output>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(212,163,115,0.22)', color: '#4A3A2A', fontFamily: 'var(--font-sans)', border: '1px solid rgba(212,163,115,0.4)' }}>
                    read-only
                  </span>
                </div>
                <p id="email-help" className="text-xs" style={{ color: '#3A3A2A', fontFamily: 'var(--font-sans)' }}>
                  Contact support to change your email address
                </p>
              </div>

              {/* Save button — right-aligned, no footer bar */}
              <div className="flex items-center justify-end gap-3 mt-2">
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
                      Changes saved
                    </span>
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="inline-flex items-center justify-center h-12 rounded-full px-8 text-sm font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.97] hover:shadow-xl hover:shadow-[rgba(212,163,115,0.4)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-1"
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
                  <span className="text-sm font-medium">Profile updated</span>
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
                  <p className="text-xs mt-0.5" style={{ color: '#5A5A4A' }}>Your memories stay private by default</p>
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
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#5A5A4A' }}>
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
                      className="inline-flex items-center gap-1.5 text-[0.6rem] font-medium px-3 py-1.5 rounded-full"
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
                  <p className="text-xs mt-0.5" style={{ color: '#5A5A4A' }}>Manage your account security</p>
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
                    className="inline-flex items-center justify-center h-9 rounded-full px-5 text-xs font-medium transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-1"
                    style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.2)' }}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change password'}
                  </button>
                </div>
                {showPasswordForm && (
                  <div className="mt-4 p-4 rounded-xl space-y-3" style={{ backgroundColor: 'rgba(212,163,115,0.06)', border: '1px solid rgba(212,163,115,0.12)' }}>
                    {passwordError && (
                      <div id="password-error" className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: '#B91C1C', border: '1px solid rgba(185,28,28,0.2)' }} role="alert">{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div id="password-success" role="alert" className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(74,124,89,0.1)', color: '#4A7C59', border: '1px solid rgba(74,124,89,0.2)' }}>Password updated successfully.</div>
                    )}
                    <div>
                      <Label className="text-xs mb-1 block" style={{ color: 'var(--charcoal)' }}>Current password</Label>
                      <div className="relative">
                        <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="h-9 rounded-lg text-sm pr-8"
                        autoComplete="current-password"
                        aria-invalid={!!passwordError}
                        aria-describedby="password-error"
                        style={passwordError ? { borderColor: '#C0392B', backgroundColor: '#FDFCF5', boxShadow: '0 0 0 3px rgba(192,57,43,0.12)' } : { borderColor: 'rgba(212,163,115,0.55)', backgroundColor: '#FDFCF5' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--bronze)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.18)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = passwordError ? '#C0392B' : 'rgba(212,163,115,0.55)'; e.currentTarget.style.boxShadow = passwordError ? '0 0 0 3px rgba(192,57,43,0.12)' : 'none'; }}
                      />
                        <button type="button" onClick={() => setShowCurrentPassword(p => !p)} aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'} className="password-toggle absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full hover:opacity-60 transition-opacity cursor-pointer" style={{ color: 'rgba(212,163,115,0.65)' }}>
                          {showCurrentPassword ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block" style={{ color: 'var(--charcoal)' }}>New password</Label>
                      <div className="relative">
                        <Input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="h-9 rounded-lg text-sm pr-8" autoComplete="new-password" aria-invalid={!!passwordError} aria-describedby="password-error" style={passwordError ? { borderColor: '#C0392B', backgroundColor: '#FDFCF5', boxShadow: '0 0 0 3px rgba(192,57,43,0.12)' } : { borderColor: 'rgba(212,163,115,0.55)', backgroundColor: '#FDFCF5' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--bronze)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.18)'; }} onBlur={e => { e.currentTarget.style.borderColor = passwordError ? '#C0392B' : 'rgba(212,163,115,0.55)'; e.currentTarget.style.boxShadow = passwordError ? '0 0 0 3px rgba(192,57,43,0.12)' : 'none'; }} />
                        <button type="button" onClick={() => setShowNewPassword(p => !p)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} className="password-toggle absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full hover:opacity-60 transition-opacity cursor-pointer" style={{ color: 'rgba(212,163,115,0.65)' }}>
                          {showNewPassword ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block" style={{ color: 'var(--charcoal)' }}>Confirm new password</Label>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-9 rounded-lg text-sm pr-8" autoComplete="new-password" aria-invalid={!!passwordError} aria-describedby="password-error" style={passwordError ? { borderColor: '#C0392B', backgroundColor: '#FDFCF5', boxShadow: '0 0 0 3px rgba(192,57,43,0.12)' } : { borderColor: 'rgba(212,163,115,0.55)', backgroundColor: '#FDFCF5' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--bronze)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.18)'; }} onBlur={e => { e.currentTarget.style.borderColor = passwordError ? '#C0392B' : 'rgba(212,163,115,0.55)'; e.currentTarget.style.boxShadow = passwordError ? '0 0 0 3px rgba(192,57,43,0.12)' : 'none'; }} />
                        <button type="button" onClick={() => setShowConfirmPassword(p => !p)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="password-toggle absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full hover:opacity-60 transition-opacity cursor-pointer" style={{ color: 'rgba(212,163,115,0.65)' }}>
                          {showConfirmPassword ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
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
                      className="inline-flex items-center justify-center h-9 rounded-full px-5 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.98]"
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
                  <p className="text-xs mt-0.5" style={{ color: '#5A5A4A' }}>Sign out of Memory Project on this device</p>
                </div>
              </div>
            </div>
            <div className="p-7">
              <button
                onClick={handleLogout}
                aria-label="Sign out of Memory Project"
                className="inline-flex items-center justify-center h-11 rounded-full border px-7 text-sm font-medium transition-all hover:opacity-80 active:scale-[0.98] focus-visible:outline-none"
                style={{ borderColor: 'rgba(180,80,60,0.35)', color: '#B4503C', backgroundColor: 'transparent', boxShadow: '0 0 0 2px transparent', '--tw-ring-color': 'rgba(180,80,60,0.5)' } as React.CSSProperties}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,80,60,0.45)'; }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
