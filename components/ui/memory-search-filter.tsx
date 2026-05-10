'use client';

import { useState, useEffect } from 'react';

export interface Memory {
  id: number;
  prompt_question: string | null;
  answer_text: string;
  photo_urls: string[];
  audio_url: string | null;
  created_at: string;
  user_id?: number;
  contributor_name?: string;
  contributor_avatar?: string;
}

interface MemorySearchFilterProps {
  memories: Memory[];
  onFilteredChange: (filtered: Memory[]) => void;
}

export function MemorySearchFilter({ memories, onFilteredChange }: MemorySearchFilterProps) {
  const [memorySearch, setMemorySearch] = useState('');
  const [memorySearchInput, setMemorySearchInput] = useState('');
  const [memorySort, setMemorySort] = useState<'newest' | 'oldest'>('newest');

  // Debounced memory search
  useEffect(() => {
    const timer = setTimeout(() => setMemorySearch(memorySearchInput), 300);
    return () => clearTimeout(timer);
  }, [memorySearchInput]);

  // Compute filtered and sorted memories and notify parent
  useEffect(() => {
    const filtered = memories.filter(m => {
      if (!memorySearch) return true;
      const q = memorySearch.toLowerCase();
      return (m.prompt_question?.toLowerCase().includes(q) ?? false) || m.answer_text.toLowerCase().includes(q);
    });
    const sorted = [...filtered].sort((a, b) => {
      if (memorySort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    onFilteredChange(sorted);
  }, [memories, memorySearch, memorySort, onFilteredChange]);

  return (
    <>
      {/* Search bar */}
      <div
        role="search"
        className="flex items-center gap-2 rounded-full px-4 py-2 overflow-x-auto"
        style={{ backgroundColor: 'rgba(212,163,115,0.10)', border: '1px solid rgba(212,163,115,0.18)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'rgba(43,43,43,0.5)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          value={memorySearchInput}
          onChange={e => setMemorySearchInput(e.target.value)}
          placeholder="Search memories…"
          aria-label="Search memories"
          className="bg-transparent text-xs font-medium focus:outline-none placeholder:text-[rgba(43,43,43,0.45)] shrink-0 min-w-0"
          style={{ color: 'rgba(43,43,43,0.85)', fontFamily: 'var(--font-sans)', width: '12ch' }}
        />
        {memorySearchInput && (
          <button
            type="button"
            onClick={() => setMemorySearchInput('')}
            aria-label="Clear search"
            className="flex items-center justify-center w-4 h-4 rounded-full transition-colors hover:opacity-70"
            style={{ color: 'rgba(43,43,43,0.5)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
      {/* Sort controls */}
      <div
        role="group"
        aria-label="Sort memories"
        className="flex items-center gap-2.5 rounded-full px-4 py-2 overflow-x-auto ml-2"
        style={{ backgroundColor: 'rgba(212,163,115,0.10)', border: '1px solid rgba(212,163,115,0.18)' }}
      >
        <span className="text-xs font-bold tracking-wide shrink-0" style={{ color: 'rgba(43,43,43,0.85)', fontFamily: 'var(--font-sans)' }}>Sort</span>
        <div role="separator" className="w-px h-3.5 shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.20)' }} />
        <button
          type="button"
          onClick={() => setMemorySort('newest')}
          aria-pressed={memorySort === 'newest'}
          aria-label="Sort by newest"
          className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{
            backgroundColor: memorySort === 'newest' ? 'var(--bronze)' : 'transparent',
            color: memorySort === 'newest' ? '#1A1A1A' : 'rgba(43,43,43,0.78)',
            fontFamily: 'var(--font-sans)',
            boxShadow: memorySort === 'newest' ? '0 2px 8px rgba(212,163,115,0.25)' : 'none',
            minHeight: '44px',
            ['--tw-ring-color' as string]: 'var(--bronze)',
            ['--tw-ring-offset-color' as string]: 'var(--cornsilk)',
          }}
        >
          New
        </button>
        <button
          type="button"
          onClick={() => setMemorySort('oldest')}
          aria-pressed={memorySort === 'oldest'}
          aria-label="Sort by oldest"
          className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{
            backgroundColor: memorySort === 'oldest' ? 'var(--bronze)' : 'transparent',
            color: memorySort === 'oldest' ? '#1A1A1A' : 'rgba(43,43,43,0.78)',
            fontFamily: 'var(--font-sans)',
            boxShadow: memorySort === 'oldest' ? '0 2px 8px rgba(212,163,115,0.25)' : 'none',
            minHeight: '44px',
            ['--tw-ring-color' as string]: 'var(--bronze)',
            ['--tw-ring-offset-color' as string]: 'var(--cornsilk)',
          }}
        >
          Old
        </button>
      </div>
    </>
  );
}
