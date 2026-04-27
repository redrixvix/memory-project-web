'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(212,163,115,0.18)',
              boxShadow: '0 4px 24px rgba(212,163,115,0.07)',
            }}
          >
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

            <div className="p-7 space-y-6">
              {/* Avatar + name display */}
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-xl font-semibold"
                  style={{ backgroundColor: 'rgba(212,163,115,0.15)', color: 'var(--bronze)' }}
                >
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AR'}
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                    {user?.name}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                    {user?.email}
                  </p>
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
                  className="w-full rounded-xl px-4 py-3 text-base transition-all outline-none"
                  style={{
                    border: '1px solid rgba(212,163,115,0.3)',
                    backgroundColor: 'rgba(254,250,224,0.6)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                  }}
                  placeholder="Your name"
                />
              </div>

              {/* Save */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || name.trim() === user?.name}
                  className="inline-flex items-center justify-center h-11 rounded-full px-7 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: saving ? 'rgba(212,163,115,0.5)' : 'var(--bronze)', color: 'var(--charcoal)' }}
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
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(212,163,115,0.18)',
              boxShadow: '0 4px 24px rgba(212,163,115,0.07)',
            }}
          >
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
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'rgba(204,213,174,0.25)', color: '#5F6650' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
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
                    className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'rgba(204,213,174,0.25)', color: '#5F6650' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
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
                    className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'rgba(204,213,174,0.25)', color: '#5F6650' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
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

          {/* ── Danger Zone ── */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: '#FDFCF5',
              borderColor: 'rgba(180,80,60,0.15)',
              boxShadow: '0 4px 24px rgba(180,80,60,0.05)',
            }}
          >
            <div className="px-7 py-6 border-b" style={{ borderColor: 'rgba(180,80,60,0.12)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(180,80,60,0.1)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#B4503C' }}>
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
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
