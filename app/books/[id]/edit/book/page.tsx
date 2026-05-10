'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setTitle(data.book.title || '');
        setDescription(data.book.description || '');
      } catch {
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    }
    void fetchBook();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setSaving(true);
    setError('');
    setSaved(false);
    
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          description: description.trim() || null 
        }),
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      setSaved(true);
      setTimeout(() => {
        router.push(`/books/${id}`);
      }, 1200);
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
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
      <header 
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b shrink-0"
        style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}
      >
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          <Link 
            href={`/books/${id}`} 
            className="nav-link text-sm flex items-center gap-1.5"
            style={{ color: '#6A6A5A' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to book
          </Link>
          <div className="flex items-center gap-2">
            {saving && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6A6A5A' }}>
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(212,163,115,0.4)' }} />
                Saving...
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--tea-green)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Saved
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="px-6 md:px-10 py-12 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--bronze)' }}>
            Book settings
          </p>
          <h1 className="text-3xl md:text-4xl font-medium" style={{ color: 'var(--charcoal)' }}>
            Edit book
          </h1>
          <p className="text-sm mt-3" style={{ color: '#6A6A5A' }}>
            Update the title and description for this memory book.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className="rounded-[2rem] border overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(253,252,245,0.97) 0%, rgba(250,237,205,0.72) 100%)',
              borderColor: 'rgba(212,163,115,0.22)',
              boxShadow: '0 24px 72px rgba(212,163,115,0.12)',
            }}
          >
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--bronze)' }} />
            
            <div className="p-8 space-y-6">
              {error && (
                <div 
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{ 
                    backgroundColor: 'rgba(185,28,28,0.08)', 
                    border: '1px solid rgba(185,28,28,0.18)',
                    color: '#7C2D12'
                  }}
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label 
                  className="text-sm font-medium block" 
                  style={{ color: 'var(--charcoal)' }}
                >
                  Title <span style={{ color: 'var(--bronze)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  className="w-full rounded-[1.25rem] border px-5 py-4 text-lg transition-all duration-200 outline-none"
                  style={{
                    borderColor: 'rgba(212,163,115,0.3)',
                    backgroundColor: 'rgba(255,253,246,0.8)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                    boxShadow: 'inset 0 2px 4px rgba(212,163,115,0.06)',
                  }}
                  placeholder="Give your book a title..."
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(212,163,115,0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.14), inset 0 2px 4px rgba(212,163,115,0.06)';
                    e.target.style.backgroundColor = 'rgba(255,253,246,0.95)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212,163,115,0.3)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(212,163,115,0.06)';
                    e.target.style.backgroundColor = 'rgba(255,253,246,0.8)';
                  }}
                />
                <p className="text-xs text-right" style={{ color: '#9A9A8A', fontFamily: 'var(--font-sans)' }}>
                  {title.length}/120
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    className="text-sm font-medium" 
                    style={{ color: 'var(--charcoal)' }}
                  >
                    Description <span style={{ color: '#8A8A7A', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <span className="text-xs" style={{ color: '#9A9A8A', fontFamily: 'var(--font-sans)' }}>
                    {description.length}/280
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={280}
                  className="w-full rounded-[1.25rem] border px-5 py-4 text-base leading-relaxed transition-all duration-200 outline-none resize-none"
                  style={{
                    borderColor: 'rgba(212,163,115,0.3)',
                    backgroundColor: 'rgba(255,253,246,0.8)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                    boxShadow: 'inset 0 2px 4px rgba(212,163,115,0.06)',
                  }}
                  placeholder="Describe what this memory book is about..."
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(212,163,115,0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212,163,115,0.14), inset 0 2px 4px rgba(212,163,115,0.06)';
                    e.target.style.backgroundColor = 'rgba(255,253,246,0.95)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212,163,115,0.3)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(212,163,115,0.06)';
                    e.target.style.backgroundColor = 'rgba(255,253,246,0.8)';
                  }}
                />
              </div>

              {/* Book URL preview */}
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(212,163,115,0.06)', border: '1px solid rgba(212,163,115,0.1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <p className="text-xs truncate" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>
                  <span style={{ color: '#8A8A7A' }}>memoryproject.com/books/</span>{id}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/books/${id}`}
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: '#6A6A5A' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex items-center justify-center h-12 rounded-full px-8 text-sm font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              style={{
                backgroundColor: 'var(--bronze)',
                color: 'var(--charcoal)',
                boxShadow: '0 4px 16px rgba(212,163,115,0.25)',
              }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: '2px solid rgba(43,43,43,0.2)', borderTopColor: 'var(--charcoal)' }} />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}