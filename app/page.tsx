'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}>
      {/* Header */}
      <header className="py-5 px-6 md:px-10 flex justify-between items-center bg-off-white">
        <div className="text-xl font-bold" style={{ color: "var(--amber)" }}>Memory Project</div>
        <nav className="flex gap-5 items-center">
          <Link href="/login" className="text-sm transition-colors" style={{ color: "var(--charcoal)" }}>
            Sign in
          </Link>
          <Button asChild variant="default" size="sm">
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        <div className="max-w-2xl space-y-8">
          {/* Decorative element */}
          <div className="flex justify-center mb-2">
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none" style={{ color: "var(--amber)" }}>
              <path d="M24 12C24 12 8 4 4 12C4 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.3"/>
              <path d="M24 12C24 12 40 4 44 12C44 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.3"/>
              <circle cx="24" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ color: "var(--charcoal)", fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}>
            Capture the stories<br />that matter
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: "var(--charcoal)" }}>
            A beautiful way to preserve your family&apos;s memories. Write, photograph, and record — then print a hardcover book to treasure forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button asChild size="lg">
              <Link href="/signup">Start your book — free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#pricing">See pricing</Link>
            </Button>
          </div>
        </div>

        {/* Memory Preview Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {[
            {
              emoji: "💍",
              title: "Your wedding day",
              preview: "We danced until 2am, and grandma insisted on teaching everyone the twist...",
              accent: "#CFB53B"
            },
            {
              emoji: "☕",
              title: "First day at work",
              preview: "I was so nervous that first morning, I spilled coffee all over my new desk...",
              accent: "#CFB53B"
            },
            {
              emoji: "🏞️",
              title: "Summer at the lake",
              preview: "Every July we&apos;d pack the station wagon and drive up to cabin 14...",
              accent: "#CFB53B"
            },
          ].map((card, i) => (
            <Card key={i} className="text-left relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Subtle decorative corner */}
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10"
                style={{ backgroundColor: card.accent }}
              />
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">{card.emoji}</div>
                <p className="text-sm font-semibold mb-2" style={{ color: card.accent }}>{card.title}</p>
                <p className="leading-relaxed text-sm" style={{ color: "var(--charcoal)" }}>{card.preview}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* How it works — mauve section */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: "var(--mauve)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>How it works</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--charcoal)" }}>Three steps to a family treasure</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                num: "1",
                title: "Write your memories",
                desc: "Answer guided prompts or write freely. Your words, your voice.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                )
              },
              {
                num: "2",
                title: "Add photos & audio",
                desc: "Upload photos and record voice memories that bring stories to life.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                )
              },
              {
                num: "3",
                title: "Print a real book",
                desc: "Turn your memories into a beautiful hardcover book, shipped to your door.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                )
              },
            ].map((f, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-2 rounded-2xl" style={{ backgroundColor: "rgba(255,191,0,0.2)" }}>
                  {f.icon}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto" style={{ backgroundColor: "var(--amber)", color: "var(--charcoal)" }}>
                  {f.num}
                </div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 md:px-10" style={{ backgroundColor: "var(--off-white)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Simple, honest pricing</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--charcoal)" }}>Start free. Pay only for photos, audio, and printing.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--charcoal)" }}>Free</div>
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>$0</p>
                <p className="text-sm mb-6" style={{ color: "var(--charcoal)" }}>forever</p>
                <ul className="space-y-2.5 text-sm mb-8" style={{ color: "var(--charcoal)" }}>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Unlimited text memories
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Guided writing prompts
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    One memory book
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Photos & audio
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Printed books
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">Get started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 5GB — featured */}
            <Card className="p-6 relative" style={{ borderColor: "var(--amber)", borderWidth: "2px" }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2" style={{ backgroundColor: "var(--amber)" }}>
                <Badge variant="default" className="px-4 py-1.5 rounded-full shadow-sm font-semibold">Most Popular</Badge>
              </div>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--amber)" }}>5GB Storage</div>
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>$50</p>
                <p className="text-sm mb-6" style={{ color: "var(--charcoal)" }}>for 5 years</p>
                <ul className="space-y-2.5 text-sm mb-8" style={{ color: "var(--charcoal)" }}>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    5GB photo & audio storage
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Printed books from $99
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Family collaboration
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/signup">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 15GB */}
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--charcoal)" }}>15GB Storage</div>
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>$100</p>
                <p className="text-sm mb-6" style={{ color: "var(--charcoal)" }}>for 5 years</p>
                <ul className="space-y-2.5 text-sm mb-8" style={{ color: "var(--charcoal)" }}>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Everything in 5GB
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    15GB photo & audio storage
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--amber)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Priority support
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Warm closing CTA */}
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: "var(--mauve)" }}>
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="text-4xl mb-2">📖</div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--charcoal)" }}>Every family has stories worth keeping</h2>
          <p className="text-sm" style={{ color: "var(--charcoal)" }}>Start writing yours today. It&apos;s free to begin, and your memories grow more valuable with every year.</p>
          <Button asChild size="lg">
            <Link href="/signup">Create your memory book</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-10 border-t" style={{ borderColor: "var(--olive)", backgroundColor: "var(--off-white)" }}>
        <p className="text-center text-sm" style={{ color: "var(--charcoal)" }}>© 2024 Memory Project · Made with care for families everywhere</p>
      </footer>
    </div>
  );
}
