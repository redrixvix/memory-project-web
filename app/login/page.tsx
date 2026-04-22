'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes('email') || data.error?.toLowerCase().includes('invalid')) {
          setError("That email doesn't look right — double-check it?");
        } else if (data.error?.toLowerCase().includes('password') || data.error?.toLowerCase().includes('wrong')) {
          setError("That password isn't quite right. Try again?");
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }
      router.push('/dashboard');
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
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

        <motion.div
          className="w-full max-w-sm relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div
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
                  <Label htmlFor="email" className="text-sm" style={{ color: 'var(--charcoal)' }}>Email</Label>
                  <Input
                    type="email" id="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    autoComplete="email" placeholder="ruth@example.com"
                    className="text-sm rounded-xl h-11"
                    style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm" style={{ color: 'var(--charcoal)' }}>Password</Label>
                  <Input
                    type="password" id="password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    autoComplete="current-password" placeholder="Your password"
                    className="text-sm rounded-xl h-11"
                    style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                  />
                </div>

                <Button
                  type="submit" disabled={loading}
                  className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                  style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-8 text-sm" style={{ color: '#6A6A5A' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors hover:opacity-70 inline-flex items-center justify-center px-2 py-1 rounded-lg" style={{ color: 'var(--bronze)' }}>
              Create one — it&apos;s free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}