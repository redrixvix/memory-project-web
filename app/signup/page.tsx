'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); return; }
      router.push('/dashboard');
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--cornsilk)' }}>
      {/* ── LEFT EDITORIAL PANEL ── */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 w-1/2" style={{ backgroundColor: 'var(--beige)' }}>
        <div>
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
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

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
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-xl text-sm" style={{ backgroundColor: 'rgba(185,28,28,0.06)', color: '#B91C1C' }}>
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm" style={{ color: 'var(--charcoal)' }}>Your name</Label>
                  <Input
                    type="text" id="name" value={name}
                    onChange={(e) => setName(e.target.value)} required
                    autoComplete="name" placeholder="Ruth Johnson"
                    className="text-sm rounded-xl h-11"
                    style={{ borderColor: 'rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)' }}
                  />
                </div>

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
                    minLength={6} autoComplete="new-password" placeholder="At least 6 characters"
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
        </div>
      </div>
    </div>
  );
}
