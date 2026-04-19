'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

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
        setError(data.error || 'Login failed');
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cream)" }}>
      <header className="py-5 px-6" style={{ backgroundColor: "var(--cream)" }}>
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ color: "var(--midnight)" }}>Memory Project</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>Welcome back</h1>
            <p className="text-sm" style={{ color: "var(--rosy)" }}>Sign in to continue your memory book</p>
          </div>

          <Card className="p-6" style={{ backgroundColor: "var(--white)", border: "1px solid var(--thistle)" }}>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C" }}>{error}</div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm" style={{ color: "var(--charcoal)" }}>Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ruth@example.com"
                    className="text-sm"
                    style={{ borderColor: "var(--thistle)", backgroundColor: "var(--cream)" }}
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
                    placeholder="Your password"
                    className="text-sm"
                    style={{ borderColor: "var(--thistle)", backgroundColor: "var(--cream)" }}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full text-sm" style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-8 text-sm" style={{ color: "var(--rosy)" }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: "var(--olive)" }}>Create one — it&apos;s free</Link>
          </p>
        </div>
      </main>
    </div>
  );
}