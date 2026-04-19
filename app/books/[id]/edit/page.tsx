'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PROMPTS = [
  { category: "Family & Roots", prompts: [
    "What do you remember about your grandparents?",
    "What's your favorite memory with your parents?",
    "Tell me about the house you grew up in.",
    "Describe a typical Sunday morning growing up.",
  ]},
  { category: "Life Moments", prompts: [
    "What was your wedding day like?",
    "Tell me about your first job.",
    "What was the best day of your life?",
    "Describe a holiday tradition you loved.",
  ]},
  { category: "Relationships", prompts: [
    "Tell me about your best friend growing up.",
    "What's a skill you're proud of learning?",
    "Describe a time you felt truly proud of yourself.",
  ]},
  { category: "Adventures", prompts: [
    "Tell me about a trip that changed your perspective.",
    "What's the most beautiful place you've ever seen?",
    "Describe a meal you'll never forget.",
  ]},
];

export default function EditMemory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const memoryId = searchParams.get('memory');

  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMemory, setFetchingMemory] = useState(!!memoryId);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (memoryId) {
      fetchMemory(memoryId);
    }
  }, [memoryId]);

  useEffect(() => {
    const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [answer]);

  const fetchMemory = async (mid: string) => {
    try {
      const res = await fetch(`/api/memories/${mid}`);
      if (res.ok) {
        const data = await res.json();
        setPrompt(data.memory.prompt_question || '');
        setAnswer(data.memory.answer_text || '');
      }
    } finally {
      setFetchingMemory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    try {
      if (memoryId) {
        await fetch(`/api/memories/${memoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_question: prompt, answer_text: answer }),
        });
      } else {
        await fetch(`/api/books/${id}/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_question: prompt, answer_text: answer }),
        });
      }
      router.push(`/books/${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMemory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-border bg-card">
        <Link href={`/books/${id}`} className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          Back to book
        </Link>
      </header>

      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            {memoryId ? 'Edit Memory' : 'Add a Memory'}
          </h1>
          <p className="text-muted text-sm">Write about a moment that matters to you. Take your time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt selector */}
          <div>
            <label className="block text-sm font-medium mb-3">Writing prompt <span className="text-muted font-normal">(optional)</span></label>

            <div className="space-y-4">
              {PROMPTS.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-2">{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.prompts.slice(0, 3).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrompt(p)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          prompt === p
                            ? 'bg-accent text-white border-accent'
                            : 'bg-card text-muted border-border hover:border-accent/50 hover:text-accent'
                        }`}
                      >
                        {p.length > 40 ? p.slice(0, 40) + '…' : p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowAllPrompts(!showAllPrompts)}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                {showAllPrompts ? 'Show fewer prompts' : 'See all prompts'}
                <svg className={`w-3 h-3 transition-transform ${showAllPrompts ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {showAllPrompts && (
                <div className="bg-background rounded-xl p-4 border border-border">
                  {PROMPTS.map((group) => (
                    <div key={group.category} className="mb-4 last:mb-0">
                      <p className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-2">{group.category}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.prompts.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPrompt(p)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              prompt === p
                                ? 'bg-accent text-white border-accent'
                                : 'bg-card text-muted border-border hover:border-accent/50 hover:text-accent'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {prompt && (
              <div className="mt-3 flex items-start gap-2 bg-accent/5 border border-accent/20 rounded-xl p-3">
                <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <p className="text-sm text-accent font-medium italic">{prompt}</p>
              </div>
            )}
          </div>

          {/* Writing area */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Your memory</label>
              <span className="text-xs text-muted/60">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent text-base leading-relaxed resize-none"
              rows={14}
              placeholder="Take your time. There's no right or wrong way to write a memory — just tell it like it was..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !answer.trim()}
              className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Saving...' : memoryId ? 'Update Memory' : 'Save Memory'}
            </button>
            <Link
              href={`/books/${id}`}
              className="border border-border px-8 py-3 rounded-full font-semibold hover:bg-card transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
