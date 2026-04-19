'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}>
      {/* Header */}
      <header className="py-5 px-6 md:px-10 flex justify-between items-center" style={{ backgroundColor: "var(--cream)" }}>
        <div className="text-xl font-bold tracking-tight" style={{ color: "var(--midnight)" }}>Memory Project</div>
        <nav className="flex gap-6 items-center">
          <Link href="/login" className="text-sm transition-colors" style={{ color: "var(--rosy)" }}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
            style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero — midnight with cream text */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28 text-center relative overflow-hidden">
        {/* Subtle decorative backdrop */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 60%, var(--thistle) 0%, transparent 70%)", opacity: 0.25 }} />

        <div className="relative max-w-2xl space-y-8">
          {/* Decorative mark */}
          <div className="flex justify-center mb-2">
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none" style={{ color: "var(--olive)" }}>
              <path d="M24 12C24 12 8 4 4 12C4 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.4"/>
              <path d="M24 12C24 12 40 4 44 12C44 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.4"/>
              <circle cx="24" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight" style={{ color: "var(--midnight)", fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}>
            Capture the stories<br />that matter
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: "var(--rosy)" }}>
            A beautiful way to preserve your family&apos;s memories. Write, photograph, and record — then print a hardcover book to treasure forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/signup"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg px-6 py-3 text-base font-semibold whitespace-nowrap transition-opacity"
              style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}
            >
              Start your book — free
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border px-6 py-3 text-base font-medium whitespace-nowrap transition-colors"
              style={{ borderColor: "var(--rosy)", color: "var(--midnight)" }}
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* Memory Preview Cards — sage & thistle tinted */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {[
            {
              num: "01",
              title: "Your wedding day",
              preview: "We danced until 2am, and grandma insisted on teaching everyone the twist...",
              accent: "var(--olive)"
            },
            {
              num: "02",
              title: "First day at work",
              preview: "I was so nervous that first morning, I spilled coffee all over my new desk...",
              accent: "var(--rosy)"
            },
            {
              num: "03",
              title: "Summer at the lake",
              preview: "Every July we&apos;d pack the station wagon and drive up to cabin 14...",
              accent: "var(--sage)"
            },
          ].map((card, i) => (
            <Card key={i} className="text-left relative overflow-hidden" style={{ backgroundColor: "var(--white)", border: "1px solid var(--thistle)" }}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: card.accent }} />
              <CardContent className="pt-6">
                <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: card.accent }}>{card.num}</p>
                <p className="text-base font-semibold mb-2" style={{ color: "var(--midnight)", fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}>{card.title}</p>
                <p className="leading-relaxed text-sm" style={{ color: "var(--rosy)" }}>{card.preview}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works — thistle background */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: "var(--thistle)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>How it works</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--rosy)" }}>Three steps to a family treasure</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                num: "1",
                title: "Write your memories",
                desc: "Answer guided prompts or write freely. Your words, your voice.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--midnight)" }}>
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                )
              },
              {
                num: "2",
                title: "Add photos & audio",
                desc: "Upload photos and record voice memories that bring stories to life.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--midnight)" }}>
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
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--midnight)" }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                )
              },
            ].map((f, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-2 rounded-2xl" style={{ backgroundColor: "rgba(44,19,32,0.08)" }}>
                  {f.icon}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto text-white" style={{ backgroundColor: "var(--midnight)" }}>
                  {f.num}
                </div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rosy)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — cream background */}
      <section id="pricing" className="py-20 px-6 md:px-10" style={{ backgroundColor: "var(--cream)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>Simple, honest pricing</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--rosy)" }}>Start free. Pay only for photos, audio, and printing.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="p-6" style={{ backgroundColor: "var(--white)", border: "1px solid var(--thistle)" }}>
              <CardContent className="pt-0">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rosy)" }}>Free</div>
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--midnight)" }}>$0</p>
                <p className="text-sm mb-6" style={{ color: "var(--rosy)" }}>forever</p>
                <ul className="space-y-2.5 text-sm mb-8">
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Unlimited text memories
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Guided writing prompts
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    One memory book
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--rosy)", opacity: 0.5 }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Photos & audio
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--rosy)", opacity: 0.5 }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Printed books
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto block text-center border-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={{ borderColor: "var(--midnight)", color: "var(--midnight)" }}
                >
                  Get started
                </Link>
              </CardContent>
            </Card>

            {/* 5GB — featured */}
            <Card className="p-6 relative overflow-visible" style={{ backgroundColor: "var(--white)", border: "2px solid var(--olive)" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="h-7 px-3 py-1 rounded-full shadow-sm font-semibold text-xs overflow-visible" style={{ backgroundColor: "var(--olive)", color: "var(--cream)" }}>Most Popular</Badge>
              </div>
              <CardContent className="pt-10">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--olive)" }}>5GB Storage</div>
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--midnight)" }}>$50</p>
                <p className="text-sm mb-6" style={{ color: "var(--rosy)" }}>for 5 years</p>
                <ul className="space-y-2.5 text-sm mb-8">
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    5GB photo & audio storage
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Printed books from $99
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Family collaboration
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto block text-center rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity"
                  style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}
                >
                  Upgrade
                </Link>
              </CardContent>
            </Card>

            {/* 15GB */}
            <Card className="p-6" style={{ backgroundColor: "var(--white)", border: "1px solid var(--thistle)" }}>
              <CardContent className="pt-0">
                <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--rosy)" }}>15GB Storage</div>
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--midnight)" }}>$100</p>
                <p className="text-sm mb-6" style={{ color: "var(--rosy)" }}>for 5 years</p>
                <ul className="space-y-2.5 text-sm mb-8">
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Everything in 5GB
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    15GB photo & audio storage
                  </li>
                  <li className="flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--olive)" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto block text-center border-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={{ borderColor: "var(--midnight)", color: "var(--midnight)" }}
                >
                  Upgrade
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Closing CTA — sage background */}
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: "var(--sage)" }}>
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="text-4xl mb-2" aria-hidden>📖</div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif", color: "var(--midnight)" }}>Every family has stories worth keeping</h2>
          <p className="text-sm" style={{ color: "var(--midnight)", opacity: 0.7 }}>Start writing yours today. It&apos;s free to begin, and your memories grow more valuable with every year.</p>
          <Link
            href="/signup"
            className="inline-block rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity"
            style={{ backgroundColor: "var(--midnight)", color: "var(--cream)" }}
          >
            Create your memory book
          </Link>
        </div>
      </section>

      {/* Footer — midnight */}
      <footer className="py-8 px-6 md:px-10 border-t" style={{ borderColor: "rgba(196,183,203,0.2)", backgroundColor: "var(--midnight)" }}>
        <p className="text-center text-sm" style={{ color: "var(--thistle)" }}>© 2024 Memory Project · Made with care for families everywhere</p>
      </footer>
    </div>
  );
}