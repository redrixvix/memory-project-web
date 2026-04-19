'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex flex-col">
      <header className="py-5 px-6">
        <Link href="/" className="text-xl font-bold text-accent">Memory Project</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Warm greeting */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📖</div>
            <h1 className="text-2xl font-bold mb-1">Start your memory book</h1>
            <p className="text-muted text-sm">Free to begin — no credit card needed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">Your name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="Ruth Johnson"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="ruth@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded-full font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating your book...' : 'Create my memory book'}
            </button>
          </form>

          {/* Warm reassurance */}
          <p className="text-center mt-5 text-xs text-muted">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center mt-6 text-muted text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}