'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setLoggedIn(document.cookie.includes('session='));

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    setHeroVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const memories = [
    {
      num: "01",
      title: "Your wedding day",
      preview: "We danced until 2am, and grandma insisted on teaching everyone the twist...",
      accent: "var(--bronze)",
    },
    {
      num: "02",
      title: "First day at work",
      preview: "I was so nervous that first morning, I spilled coffee all over my new desk...",
      accent: "var(--tea-green)",
    },
    {
      num: "03",
      title: "Summer at the lake",
      preview: "Every July we'd pack the station wagon and drive up to cabin 14...",
      accent: "var(--bronze)",
    },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-serif)" }}>

      {/* ── NAVIGATION ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled
          ? { background: 'rgba(254,250,224,0.88)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(212,163,115,0.2)', boxShadow: '0 1px 24px rgba(212,163,115,0.06)' }
          : { background: 'transparent' }
        }
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-base font-medium tracking-tight" style={{ color: 'var(--charcoal)', letterSpacing: '-0.01em' }}>Memory Project</span>
          </div>

          {/* Nav links */}
          <nav className="flex gap-7 items-center">
            {loggedIn ? (
              <Link href="/dashboard" className="text-sm font-medium transition-colors" style={{ color: 'var(--charcoal)' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm transition-colors hidden sm:block" style={{ color: '#6A6A5A' }}>Sign in</Link>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden" style={{ backgroundColor: 'var(--cornsilk)' }}>
        {/* Ambient atmosphere */}
        <div className="hero-ambient" />
        {/* Large warm light orb */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-breathe"
          style={{
            width: '70vw',
            height: '70vw',
            maxWidth: '900px',
            maxHeight: '900px',
            background: 'radial-gradient(circle, rgba(212,163,115,0.22) 0%, rgba(254,250,224,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className={`relative max-w-3xl mx-auto text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Eyebrow */}
          <p className="label-caps mb-8 animate-fade-up" style={{ color: 'var(--bronze)' }}>
            A digital memory book for families
          </p>

          {/* Display heading */}
          <h1
            className="display-xl mb-8 animate-fade-up"
            style={{ color: 'var(--charcoal)' }}
          >
            Capture the stories<br />
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>that matter most</em>
          </h1>

          {/* Subheading */}
          <p
            className="text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-12 animate-fade-up"
            style={{ color: '#6A6A5A' }}
          >
            Write, photograph, and record — then print a beautiful hardcover book to treasure forever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
            >
              Start your book — free
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium whitespace-nowrap border transition-all duration-200 hover:border-bronze active:scale-95"
              style={{ borderColor: 'rgba(212,163,115,0.5)', color: 'var(--charcoal)' }}
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up"
          style={{ color: '#6A6A5A' }}
        >
          <p className="text-xs" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.6rem' }}>Scroll</p>
          <div className="w-px h-10 overflow-hidden relative">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, var(--bronze), transparent)', animation: 'float 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── MEMORY EXCERPTS — editorial grid ── */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="mb-16 max-w-xl">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>From the pages</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Every great memory book starts with a single story
            </h2>
          </div>

          {/* Asymmetric 3-card layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {memories.map((card, i) => (
              <div
                key={i}
                className={`reveal delay-${(i + 1) * 100} card-hover ${i === 0 ? 'md:col-span-7' : 'md:col-span-5'}`}
              >
                <Card
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    backgroundColor: '#FDFCF5',
                    border: '1px solid rgba(212,163,115,0.18)',
                    boxShadow: '0 2px 16px rgba(212,163,115,0.07)',
                    height: '100%',
                  }}
                >
                  {/* Top color bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: card.accent }} />
                  <CardContent className="pt-7 pb-8 px-7">
                    <p className="label-caps mb-4" style={{ color: card.accent }}>{card.num}</p>
                    <p className="text-xl font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)', lineHeight: 1.3 }}>
                      {card.title}
                    </p>
                    <div className="rule mb-4" />
                    <p className="text-sm leading-relaxed" style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)' }}>
                      {card.preview}
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/signup"
                        className="text-xs font-medium flex items-center gap-1.5 transition-colors group"
                        style={{ color: card.accent }}
                      >
                        Read more
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CALLOUT ── */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: 'var(--beige)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Left: text */}
            <div className="flex-1 text-center md:text-left">
              <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>See it in action</p>
              <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>
                The Smith Family&apos;s Memory Book
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#6A6A5A' }}>
                12 memories, wedding stories, childhood回忆, and more — all captured in a real family book you can read right now.
              </p>
              <Link
                href="/books/1/preview"
                className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
              >
                Read the sample book
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right: decorative book mockup */}
            <div className="reveal">
              <div className="relative" style={{ width: 180, height: 240 }}>
                {/* Book shadow */}
                <div style={{ position: 'absolute', bottom: -16, left: 16, right: -8, height: 16, background: 'radial-gradient(ellipse, rgba(43,43,43,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
                {/* Book */}
                <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.3)', boxShadow: '4px 4px 0 rgba(212,163,115,0.15), 8px 8px 24px rgba(212,163,115,0.1)' }}>
                  <div className="absolute left-0 top-0 bottom-0 w-4" style={{ backgroundColor: 'var(--bronze)' }} />
                  <div className="pt-8 pb-6 px-6">
                    <div className="h-px w-full mb-6" style={{ backgroundColor: 'rgba(212,163,115,0.3)' }} />
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>A Memory Book</p>
                    <p className="text-xs mb-1" style={{ color: '#6A6A5A' }}>The Smith Family</p>
                    <div className="mt-6 space-y-1.5">
                      {[80, 95, 70, 88, 60].map((w, j) => (
                        <div key={j} className="h-1.5 rounded-full" style={{ width: `${w}%`, backgroundColor: j % 2 === 0 ? 'rgba(212,163,115,0.25)' : 'rgba(204,213,174,0.35)' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>The process</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Three steps to a family treasure
            </h2>
          </div>

          {/* 3-step horizontal flow */}
          <div className="flex flex-col md:flex-row gap-0 md:gap-6">
            {[
              {
                num: '1',
                title: 'Write your memories',
                desc: 'Answer guided prompts or write freely. Your words, your voice — no rules, no judgments, just stories.',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--charcoal)' }}>
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                ),
              },
              {
                num: '2',
                title: 'Add photos & audio',
                desc: 'Upload photos and record voice memories that bring every story to life in a way text alone never could.',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--charcoal)' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                ),
              },
              {
                num: '3',
                title: 'Print a real book',
                desc: 'Turn your memories into a beautiful hardcover book — 200+ pages of archival paper, shipped to your door.',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--charcoal)' }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div key={i} className={`flex-1 delay-${(i + 1) * 100} ${i < 2 ? 'md:border-r md:pr-6' : ''} ${i > 0 ? 'md:pl-6' : ''} md:border-opacity-20`} style={{ borderColor: 'rgba(212,163,115,0.2)' }}>
                {/* Step number */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}>
                    {step.num}
                  </div>
                  {i < 2 && <div className="hidden md:block flex-1 rule-vertical" style={{ height: 24 }} />}
                </div>

                {/* Icon + title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-medium pt-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                    {step.title}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed pl-16 md:pl-0" style={{ color: '#6A6A5A' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--beige)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Pricing</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Simple, honest pricing
            </h2>
            <p className="text-sm mt-3" style={{ color: '#6A6A5A' }}>
              Start free. Pay only for printing.
            </p>
          </div>

          {/* 3 pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="reveal">
              <Card className="p-7 rounded-2xl h-full" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 2px 16px rgba(212,163,115,0.06)' }}>
                <CardContent className="pt-0">
                  <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Free</p>
                  <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$0</p>
                  <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>forever</p>
                  <div className="rule mb-8" />
                  <ul className="space-y-3 mb-10">
                    {[
                      'Unlimited text memories',
                      'Guided writing prompts',
                      'One memory book',
                    ].map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--charcoal)' }}>
                        <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                    {['Photos & audio', 'Printed books'].map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#6A6A5A', opacity: 0.45 }}>
                        <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center border-2 rounded-full py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-80"
                    style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)' }}
                  >
                    Get started
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 5GB — featured */}
            <div className="reveal">
              <Card className="p-7 rounded-2xl h-full relative" style={{ backgroundColor: '#FDFCF5', border: '2px solid var(--bronze)', boxShadow: '0 8px 32px rgba(212,163,115,0.14)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="h-7 px-4 py-1 rounded-full font-medium text-xs shadow-sm" style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}>
                    Most Popular
                  </Badge>
                </div>
                <CardContent className="pt-8">
                  <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>5GB Storage</p>
                  <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$50</p>
                  <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>for 5 years</p>
                  <div className="rule mb-8" />
                  <ul className="space-y-3 mb-10">
                    {[
                      'Everything in Free',
                      '5GB photo & audio storage',
                      'Printed books from $99',
                      'Family collaboration',
                    ].map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--charcoal)' }}>
                        <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center rounded-full py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                  >
                    Upgrade
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 15GB */}
            <div className="reveal">
              <Card className="p-7 rounded-2xl h-full" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.18)', boxShadow: '0 2px 16px rgba(212,163,115,0.06)' }}>
                <CardContent className="pt-0">
                  <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>15GB Storage</p>
                  <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$100</p>
                  <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>for 5 years</p>
                  <div className="rule mb-8" />
                  <ul className="space-y-3 mb-10">
                    {[
                      'Everything in 5GB',
                      '15GB photo & audio storage',
                      'Priority support',
                    ].map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--charcoal)' }}>
                        <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--bronze)' }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center border-2 rounded-full py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-80"
                    style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)' }}
                  >
                    Upgrade
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-2xl mx-auto text-center">
          {/* Large quotation mark */}
          <div style={{ color: 'rgba(212,163,115,0.25)', fontFamily: 'var(--font-serif)', fontSize: '8rem', lineHeight: 0.6, marginBottom: '-2rem' }}>&ldquo;</div>
          <blockquote className="text-xl md:text-2xl italic leading-relaxed mb-8" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
            We gave this to my grandmother on her 90th birthday. She read every single page out loud and cried happy tears. Worth every penny.
          </blockquote>
          <div className="rule mx-auto mb-6" style={{ width: 48 }} />
          <p className="text-sm font-medium" style={{ color: 'var(--bronze)' }}>— Martha, Ohio</p>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: 'var(--papaya)' }}>
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
            Every family has stories worth keeping
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6A6A5A' }}>
            Start writing yours today. It&apos;s free to begin, and your memories grow more valuable with every year.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            Create your memory book
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 md:px-10 border-t" style={{ borderColor: 'rgba(212,163,115,0.15)', backgroundColor: 'var(--beige)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <p className="text-sm" style={{ color: '#6A6A5A' }}>Memory Project</p>
          </div>
          <p className="text-sm" style={{ color: '#6A6A5A' }}>© 2024 · Made with care for families</p>
        </div>
      </footer>
    </div>
  );
}
