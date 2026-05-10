'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { level: 0, label: '', color: '' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
  const variety = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (pw.length < 6 || variety === 0) return { level: 1, label: 'Weak', color: 'rgba(180,60,60,0.7)' };
  if (pw.length < 10 || variety < 3) return { level: 2, label: 'Fair', color: 'rgba(184,134,11,0.75)' };
  return { level: 3, label: 'Strong', color: 'rgba(85,107,47,0.8)' };
}

export default function SignupClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(212,163,115,0.3)', borderTopColor: 'var(--bronze)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
        </div>
      </div>
    }>
      <Signup />
    </Suspense>
  );
}

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState('');
  const [flowStep, setFlowStep] = useState<'entry' | 'magic_sent' | 'email_verification'>('entry');
  const [pendingAuthenticationToken, setPendingAuthenticationToken] = useState('');
  const [error, setError] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite_token');

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google?screen_hint=sign-up';
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
      setFlowStep('magic_sent');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.status === 202 && data.requires_email_verification) {
        setPendingAuthenticationToken(data.pending_authentication_token || '');
        setCode('');
        setFlowStep('email_verification');
        setError('');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Unable to create your account.');
        return;
      }

      window.location.href = data.redirect_url || '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--cornsilk)' }}>

      {/* ── LEFT EDITORIAL PANEL ── */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 w-1/2 relative overflow-hidden" style={{ backgroundColor: 'var(--beige)' }}>
        {/* Subtle grain ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }} />
        </div>

        {/* Warm radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 30% 50%, rgba(212,163,115,0.12) 0%, transparent 60%)',
          }}
        />

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
          <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Get started</p>
          <h2 className="display-lg mb-6" style={{ color: 'var(--charcoal)' }}>
            Every great<br />story starts<br />with a first<br />word.
          </h2>

          <p className="text-sm leading-relaxed max-w-sm mb-12" style={{ color: 'var(--muted-foreground)' }}>
            Create your free account and write your first memory in minutes. No credit card needed.
          </p>

          {/* Testimonial excerpt */}
          <div className="p-5 rounded-xl max-w-xs" style={{ backgroundColor: 'rgba(254,250,224,0.7)', border: '1px solid rgba(212,163,115,0.2)' }}>
            <div className="flex gap-0.5 mb-4">
              {[1,2,3,4,5].map((_, si) => (
                <svg key={si} width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--bronze)' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-sm italic leading-relaxed mb-4" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
              &ldquo;We gave this to my grandmother on her 90th birthday. She read every single page out loud and cried happy tears.&rdquo;
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--bronze)' }}>— The Hendersons, Portland OR</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">

        {/* Subtle ambient on form side */}
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
              Create your memory book
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Free forever — no credit card required</p>
          </div>

          <Card className="p-7 rounded-2xl" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 2px 4px rgba(212,163,115,0.06), 0 8px 16px rgba(212,163,115,0.08), 0 24px 48px rgba(212,163,115,0.06)' }}>
            <CardContent className="pt-0 space-y-4">

              {/* ── Google sign-in button ── PRIMARY ACTION */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                aria-label="Continue with Google"
                className="w-full h-11 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 hover:brightness-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--charcoal)',
                  color: 'var(--cornsilk)',
                  boxShadow: '0 4px 16px rgba(43,43,43,0.22)',
                  ['--tw-ring-color' as string]: 'var(--bronze)',
                  ['--tw-ring-offset-color' as string]: 'var(--cornsilk)',
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(43,43,43,0.22), 0 0 0 3px rgba(212,163,115,0.35)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(43,43,43,0.22)'; }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Passkey — hidden behind a small tertiary link */}
              <button
                type="button"
                className="w-full h-8 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 mx-auto focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  color: '#7A7A6A',
                  backgroundColor: 'transparent',
                  ['--tw-ring-color' as string]: 'var(--bronze)',
                  ['--tw-ring-offset-color' as string]: 'var(--cornsilk)',
                }}
                onFocus={(e) => { e.currentTarget.style.color = '#5A5A4A'; e.currentTarget.style.backgroundColor = 'rgba(212,163,115,0.08)'; }}
                onBlur={(e) => { e.currentTarget.style.color = '#7A7A6A'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                onClick={() => window.location.href = '/api/auth/passkey?screen_hint=sign-up'}
              >
                <KeyIcon />
                Sign up with passkey instead
              </button>

              {inviteToken && (
                <div
                  className="p-3.5 rounded-xl text-sm"
                  style={{ backgroundColor: 'rgba(204,213,174,0.2)', border: '1px solid rgba(204,213,174,0.4)', color: 'var(--charcoal)' }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--charcoal)' }}>
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                    <p>You&apos;ve been invited to join a memory book. Complete sign-up to accept your invitation.</p>
                  </div>
                </div>
              )}

              {flowStep === 'entry' ? (
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

                  <form onSubmit={handlePasswordSignup} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm" style={{ color: 'var(--charcoal)' }}>Full name</Label>
                      <Input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Ruth Henderson"
                        className="text-sm rounded-xl h-11"
                        style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm" style={{ color: 'var(--charcoal)' }}>Email</Label>
                      <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (emailError && EMAIL_REGEX.test(e.target.value)) setEmailError(''); }}
                        onBlur={(e) => { if (e.target.value && !EMAIL_REGEX.test(e.target.value)) setEmailError('Please enter a valid email address.'); }}
                        required
                        autoComplete="email"
                        placeholder="ruth@example.com"
                        aria-describedby="email-error"
                        className="text-sm rounded-xl h-11"
                        style={{ borderColor: emailError ? 'rgba(180,60,60,0.5)' : 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                      />
                      {emailError && (
                        <p role="alert" id="email-error" className="text-xs mt-1" style={{ color: 'rgba(180,60,60,0.85)' }}>
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm" style={{ color: 'var(--charcoal)' }}>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          placeholder="Create a password"
                          aria-describedby="password-error"
                          className="text-sm rounded-xl h-11 pr-10"
                          style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                        />
                        <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 hover:opacity-60 active:opacity-70" style={{ color: 'rgba(212,163,115,0.65)' }}>
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                      {password && (() => {
                        const strength = getPasswordStrength(password);
                        return (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3].map((tier) => (
                                <div
                                  key={tier}
                                  className="h-1 flex-1 rounded-full transition-all duration-300"
                                  style={{ backgroundColor: tier <= strength.level ? strength.color : 'rgba(212,163,115,0.15)' }}
                                />
                              ))}
                            </div>
                            <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                          </div>
                        );
                      })()}
                    </div>

                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                      style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
                    >
                      {passwordLoading ? 'Creating account...' : 'Create account with password'}
                    </Button>
                    <div className="flex items-center justify-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(212,163,115,0.6)' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span className="text-xs" style={{ color: 'rgba(43,43,43,0.55)', fontFamily: 'var(--font-sans)' }}>Your memories are private and encrypted · Never sold</span>
                    </div>
                  </form>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                    <span className="text-xs" style={{ color: '#7A7A6A' }}>or</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,163,115,0.2)' }} />
                  </div>

                  <form onSubmit={handleSubmit} className="pt-1">
                    <button
                      type="submit"
                      disabled={magicLoading}
                      className="w-full h-9 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 hover:opacity-80"
                      style={{ color: '#7A7A6A', border: '1px solid rgba(212,163,115,0.2)', backgroundColor: 'transparent' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                      Or email me a magic link
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5">
                  {flowStep === 'magic_sent' ? (
                    <>
                      <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(204,213,174,0.2)', border: '1px solid rgba(204,213,174,0.4)' }}
                      >
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--charcoal)' }}>
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                          </svg>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Check your email</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                              We sent a magic link to <strong>{email}</strong>. Click it to activate your account.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFlowStep('entry');
                          setEmail('');
                          setError('');
                        }}
                        className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                        style={{ border: '1.5px solid rgba(212,163,115,0.4)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
                      >
                        Use a different email
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(204,213,174,0.2)', border: '1px solid rgba(204,213,174,0.4)' }}
                      >
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--charcoal)' }}>
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                          </svg>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Verify your email</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                              Enter the 6-digit code we sent to <strong>{email}</strong> to finish creating your account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="verification-code" className="text-sm" style={{ color: 'var(--charcoal)' }}>Verification code</Label>
                        <Input
                          type="text"
                          id="verification-code"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          autoComplete="one-time-code"
                          placeholder="123456"
                          className="text-sm rounded-xl h-12 text-center"
                          style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', fontSize: '1.25rem', letterSpacing: '0.2em' }}
                        />
                      </div>

                      {error && (
                        <div
                          role="alert"
                          aria-live="polite"
                          className="p-3.5 rounded-xl text-sm"
                          style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)', border: '1px solid rgba(212,163,115,0.25)' }}
                        >
                          {error}
                        </div>
                      )}

                      <Button
                        disabled={verifyLoading || code.length < 6}
                        onClick={async () => {
                          setVerifyLoading(true);
                          setError('');
                          try {
                            const res = await fetch('/api/auth/email-verification', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ code, pendingAuthenticationToken }),
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              setError(data.error || 'Invalid code.');
                              return;
                            }
                            window.location.href = data.redirect_url || '/dashboard';
                          } catch {
                            setError('Something went wrong.');
                          } finally {
                            setVerifyLoading(false);
                          }
                        }}
                        className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                        style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                      >
                        {verifyLoading ? 'Verifying...' : 'Verify email and create account'}
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setFlowStep('entry');
                          setPendingAuthenticationToken('');
                          setCode('');
                          setError('');
                        }}
                        className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                        style={{ border: '1.5px solid rgba(212,163,115,0.4)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
                      >
                        Start over
                      </button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Already have an account?{' '}
            <Link href="/login" className="nav-link font-medium inline-flex items-center justify-center px-2 py-1 rounded-lg" style={{ color: 'var(--bronze)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
