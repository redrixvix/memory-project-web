'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cornsilk)" }}>
        <div style={{ color: "#6A6A5A" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cornsilk)" }}>
      <header className="py-4 px-6 border-b" style={{ backgroundColor: "#FDFCF5", borderColor: "rgba(212,163,115,0.15)" }}>
        <Link href={`/books/${id}`} className="text-sm transition-colors flex items-center gap-1" style={{ color: "#6A6A5A" }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          Back to book
        </Link>
      </header>

      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-1" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>
            {memoryId ? 'Edit Memory' : 'Add a Memory'}
          </h1>
          <p className="text-sm" style={{ color: "#6A6A5A" }}>Write about a moment that matters to you. Take your time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt selector */}
          <div>
            <Label className="mb-3 block text-sm" style={{ color: "var(--charcoal)" }}>Writing prompt <span className="font-normal opacity-60">(optional)</span></Label>

            <div className="space-y-4">
              {PROMPTS.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6A6A5A" }}>{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.prompts.slice(0, 3).map((p) => (
                      <Button
                        key={p}
                        type="button"
                        variant={prompt === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPrompt(p)}
                        className="rounded-full"
                        style={prompt === p
                          ? { backgroundColor: "var(--bronze)", color: "var(--charcoal)" }
                          : { borderColor: "rgba(212,163,115,0.3)", color: "var(--charcoal)" }
                        }
                      >
                        {p.length > 40 ? p.slice(0, 40) + '…' : p}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowAllPrompts(!showAllPrompts)}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "var(--bronze)" }}
              >
                {showAllPrompts ? 'Show fewer prompts' : 'See all prompts'}
                <svg className={`w-3 h-3 transition-transform ${showAllPrompts ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {showAllPrompts && (
                <Card className="p-4" style={{ backgroundColor: "#FDFCF5", border: "1px solid rgba(212,163,115,0.2)", boxShadow: "0 4px 20px rgba(212,163,115,0.06)" }}>
                  <CardContent className="pt-0">
                    {PROMPTS.map((group) => (
                      <div key={group.category} className="mb-4 last:mb-0">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6A6A5A" }}>{group.category}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.prompts.map((p) => (
                            <Button
                              key={p}
                              type="button"
                              variant={prompt === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPrompt(p)}
                              className="rounded-full"
                              style={prompt === p
                                ? { backgroundColor: "var(--bronze)", color: "var(--charcoal)" }
                                : { borderColor: "rgba(212,163,115,0.3)", color: "var(--charcoal)" }
                              }
                            >
                              {p}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {prompt && (
              <div className="mt-3 flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: "rgba(212,163,115,0.12)", border: "1px solid rgba(212,163,115,0.25)" }}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--bronze)" }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <p className="text-sm font-medium italic" style={{ color: "var(--charcoal)" }}>{prompt}</p>
              </div>
            )}
          </div>

          {/* Writing area */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm" style={{ color: "var(--charcoal)" }}>Your memory</Label>
              <span className="text-xs" style={{ color: "#6A6A5A" }}>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            </div>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="text-base leading-relaxed rounded-xl"
              rows={14}
              placeholder="Take your time. There's no right or wrong way to write a memory — just tell it like it was..."
              style={{ borderColor: "rgba(212,163,115,0.3)", backgroundColor: "#FDFCF5" }}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !answer.trim()} className="rounded-full" style={{ backgroundColor: "var(--bronze)", color: "var(--charcoal)" }}>
              {loading ? 'Saving...' : memoryId ? 'Update Memory' : 'Save Memory'}
            </Button>
            <Link
              href={`/books/${id}`}
              className="inline-flex h-9 px-4 py-2 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: "rgba(212,163,115,0.3)", color: "var(--charcoal)", backgroundColor: "#FDFCF5" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}