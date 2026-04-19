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

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cornsilk)" }}>
      <header className="py-5 px-6" style={{ backgroundColor: "var(--cornsilk)" }}>
        <Link href="/" className="text-xl font-medium tracking-tight" style={{ color: "var(--charcoal)" }}>Memory Project</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium mb-1" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Start your memory book</h1>
            <p className="text-sm" style={{ color: "#6A6A5A" }}>Free to begin — no credit card needed</p>
          </div>

          <Card className="p-6" style={{ backgroundColor: "#FDFCF5", border: "1px solid rgba(212,163,115,0.2)", boxShadow: "0 4px 20px rgba(212,163,115,0.08)" }}>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(185,28,28,0.06)", color: "#B91C1C" }}>{error}</div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm" style={{ color: "var(--charcoal)" }}>Your name</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ruth Johnson"
                    className="text-sm rounded-xl"
                    style={{ borderColor: "rgba(212,163,115,0.3)", backgroundColor: "var(--papaya)" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm" style={{ color: "var(--charcoal)" }}>Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ruth@example.com"
                    className="text-sm rounded-xl"
                    style={{ borderColor: "rgba(212,163,115,0.3)", backgroundColor: "var(--papaya)" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm" style={{ color: "var(--charcoal)" }}>Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="text-sm rounded-xl"
                    style={{ borderColor: "rgba(212,163,115,0.3)", backgroundColor: "var(--papaya)" }}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full text-sm rounded-xl" style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}>
                  {loading ? 'Creating your book...' : 'Create my memory book'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-5 text-xs" style={{ color: "#6A6A5A" }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center mt-6 text-sm" style={{ color: "#6A6A5A" }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: "var(--bronze)" }}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}