'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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

          <p className="text-sm leading-relaxed max-w-sm mb-12" style={{ color: '#6A6A5A' }}>
            Create your free account and write your first memory in minutes. No credit card needed.
          </p>

          {/* Testimonial excerpt */}
          <div className="p-5 rounded-xl max-w-xs" style={{ backgroundColor: 'rgba(254,250,224,0.7)', border: '1px solid rgba(212,163,115,0.2)' }}>
            <p className="text-sm italic leading-relaxed mb-4" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
              &ldquo;We gave this to my grandmother on her 90th birthday. She read every single page out loud and cried happy tears.&rdquo;
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--bronze)' }}>— Martha, Ohio</p>
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
              Start your memory book
            </h1>
            <p className="text-sm" style={{ color: '#6A6A5A' }}>Free to begin — no credit card needed</p>
          </div>

          <Card className="p-7 rounded-2xl" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 4px 24px rgba(212,163,115,0.08)' }}>
            <CardContent className="pt-0">
              {!sent ? (
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

                  <Button
                    type="submit" disabled={loading}
                    className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                    style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                  >
                    {loading ? 'Creating your book...' : 'Create my memory book'}
                  </Button>
                </form>
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
                        <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Check your email</p>
                        <p className="text-xs mt-1" style={{ color: '#6A6A5A' }}>
                          We sent a magic link to <strong>{email}</strong>. Click it to activate your account.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSent(false); setEmail(''); setError(''); }}
                    className="w-full h-11 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                    style={{ border: '1.5px solid rgba(212,163,115,0.4)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-xs" style={{ color: '#6A6A5A' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center mt-6 text-sm" style={{ color: '#6A6A5A' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium transition-colors hover:opacity-70 inline-flex items-center justify-center px-2 py-1 rounded-lg" style={{ color: 'var(--bronze)' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}