'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [codeFlow, setCodeFlow] = useState<'magic' | 'email_verification' | null>(null);
  const [pendingAuthenticationToken, setPendingAuthenticationToken] = useState('');
  const [error, setError] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google?screen_hint=sign-in';
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 202 && data.requires_email_verification) {
        setPendingAuthenticationToken(data.pending_authentication_token || '');
        setCode('');
        setCodeFlow('email_verification');
        setError('');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Unable to sign in with that email and password.');
        return;
      }

      window.location.href = data.redirect_url || '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setCode('');
      setCodeFlow('magic');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--cornsilk)' }}>

      {/* ── LEFT EDITORIAL PANEL ── */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 w-1/2" style={{ backgroundColor: 'var(--beige)' }}>
        {/* Subtle grain ambient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }} />
        </div>

        <div className="relative">
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-16">
            <svg width="28" height="28" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-base font-medium tracking-tight" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </div>

          {/* Editorial heading */}
          <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Welcome back</p>
          <h2 className="display-lg mb-6" style={{ color: 'var(--charcoal)' }}>
            Your stories<br />are waiting.
          </h2>

          <p className="text-sm leading-relaxed max-w-sm mb-12" style={{ color: '#6A6A5A' }}>
            Sign in to continue building your memory book. Every memory you&apos;ve written is safe and ready to add to.
          </p>

          {/* Decorative book mockup */}
          <div className="relative" style={{ width: 200, height: 270 }}>
            <div style={{ position: 'absolute', bottom: -20, left: 16, right: -8, height: 20, background: 'radial-gradient(ellipse, rgba(43,43,43,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.3)', boxShadow: '6px 6px 0 rgba(212,163,115,0.14), 12px 12px 32px rgba(212,163,115,0.1)' }}>
              <div className="absolute left-0 top-0 bottom-0 w-5" style={{ backgroundColor: 'var(--bronze)' }} />
              <div className="pt-10 pb-8 px-8">
                <div className="h-px w-full mb-8" style={{ backgroundColor: 'rgba(212,163,115,0.3)' }} />
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>A Memory Book</p>
                <p className="text-xs mb-8" style={{ color: '#6A6A5A' }}>The Smith Family</p>
                <div className="space-y-3">
                  {[
                    { w: '90%', c: 'rgba(212,163,115,0.25)' },
                    { w: '75%', c: 'rgba(204,213,174,0.35)' },
                    { w: '88%', c: 'rgba(212,163,115,0.25)' },
                    { w: '60%', c: 'rgba(204,213,174,0.35)' },
                    { w: '80%', c: 'rgba(212,163,115,0.25)' },
                  ].map((bar, j) => (
                    <div key={j} className="h-2 rounded-full" style={{ width: bar.w, backgroundColor: bar.c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">

        {/* Subtle ambient on form side too */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,163,115,0.06) 0%, transparent 70%)',
          }}
        />

        <div
          className="w-full max-w-sm relative animate-fade-up"
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-base font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: '#6A6A5A' }}>Sign in to continue your memory book</p>
          </div>

          <Card className="p-7 rounded-2xl" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 4px 24px rgba(212,163,115,0.08)' }}>
            <CardContent className="pt-0 space-y-5">

              {/* ── Google sign-in button — styled as a real button ── */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#3c4043',
                  border: '1px solid rgba(212,163,115,0.3)',
                  boxShadow: '0 2px 8px rgba(212,163,115,0.10), 0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Passkey option — ghost/outlined style */}
              <button
                type="button"
                className="w-full h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[rgba(212,163,115,0.06)] active:scale-[0.98]"
                style={{
                  color: '#6A6A5A',
                  border: '1px solid rgba(212,163,115,0.22)',
                  backgroundColor: 'transparent',
                }}
                onClick={() => window.location.href = '/api/auth/passkey?screen_hint=sign-in'}
              >
                <KeyIcon />
                Sign in with passkey
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                <span className="text-xs" style={{ color: '#7A7A6A', fontFamily: 'var(--font-sans)' }}>or continue with email</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
              </div>

              {!codeFlow ? (
                <div className="space-y-5">
                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="p-3.5 rounded-xl text-sm"
                      style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.25)' }}
                    >
                      <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Email</Label>
                    <Input
                      type="email" id="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      autoComplete="email" placeholder="you@example.com"
                      className="text-sm rounded-xl h-11"
                      style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: '#FFFDF8' }}
                    />
                  </div>

                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm" style={{ color: 'var(--charcoal)' }}>Password</Label>
                        <Link href="/forgot-password" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--bronze)' }}>Forgot password?</Link>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          placeholder="Your password"
                          className="text-sm rounded-xl h-11 pr-10"
                          style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: '#FFFDF8' }}
                        />
                        <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-60 transition-opacity" style={{ color: 'rgba(212,163,115,0.65)' }}>
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-md"
                      style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', fontFamily: 'var(--font-sans)' }}
                    >
                      {passwordLoading ? 'Signing in...' : 'Sign in with password'}
                    </Button>
                  </form>

                  <div className="flex items-center gap-3 py-0.5">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                    <span className="text-xs" style={{ color: '#7A7A6A', fontFamily: 'var(--font-sans)' }}>or</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <Button
                      type="submit"
                      disabled={magicLoading}
                      className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                      style={{ backgroundColor: 'transparent', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.35)', fontFamily: 'var(--font-sans)' }}
                    >
                      {magicLoading ? 'Sending...' : 'Send email code instead'}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(204,213,174,0.2)', border: '1px solid rgba(204,213,174,0.4)' }}
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--charcoal)' }}>
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                          {codeFlow === 'email_verification' ? `Verification code sent to ${email}` : `Code sent to ${email}`}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#6A6A5A' }}>
                          {codeFlow === 'email_verification'
                            ? 'Enter the 6-digit verification code from your email to finish signing in.'
                            : 'Enter the 6-digit code from your email to sign in.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Your code</Label>
                    <Input
                      type="text" id="code" value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoComplete="one-time-code" placeholder="123456"
                      className="text-sm rounded-xl h-12 text-center"
                      style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: '#FFFDF8', fontSize: '1.25rem', letterSpacing: '0.2em' }}
                    />
                  </div>

                  {error && (
                    <div role="alert" aria-live="polite" className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.25)' }}>{error}</div>
                  )}

                  <Button
                    disabled={verifyLoading || code.length < 6}
                    onClick={async () => {
                      setVerifyLoading(true);
                      setError('');
                      try {
                        const endpoint = codeFlow === 'email_verification'
                          ? '/api/auth/email-verification'
                          : '/api/auth/verify';
                        const payload = codeFlow === 'email_verification'
                          ? { code, pendingAuthenticationToken }
                          : { code, email };
                        const res = await fetch(endpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                        const data = await res.json();
                        if (!res.ok) { setError(data.error || 'Invalid code.'); return; }
                        window.location.href = data.redirect_url || '/dashboard';
                      } catch { setError('Something went wrong.'); }
                      finally { setVerifyLoading(false); }
                    }}
                    className="w-full h-11 rounded-full text-sm font-medium"
                    style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                  >
                    {verifyLoading
                      ? 'Verifying...'
                      : codeFlow === 'email_verification'
                        ? 'Verify email and sign in'
                        : 'Sign in'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setCodeFlow(null);
                      setPendingAuthenticationToken('');
                      setEmail('');
                      setCode('');
                      setError('');
                    }}
                    className="w-full h-9 text-xs"
                    style={{ color: '#6A6A5A' }}
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center mt-8 text-sm" style={{ color: '#6A6A5A' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors hover:opacity-70 inline-flex items-center justify-center px-2 py-1 rounded-lg" style={{ color: 'var(--bronze)' }}>
              Create one — it&apos;s free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
