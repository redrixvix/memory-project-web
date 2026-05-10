'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/ui/mobile-nav';
import SeoSchema from '@/components/seo-schema';


export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 40), []);

  const observeReveal = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return observer;
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          router.replace('/dashboard');
        } else {
          setLoggedIn(false);
        }
      })
      .catch(() => setLoggedIn(false));

    const observer = observeReveal();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [router, handleScroll, observeReveal]);

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
      accent: "var(--papaya)",
    },
  ];

  return (
    <>
      {/* Skip to main content — WCAG 2.1 SC 2.4.1 "Bypass Blocks" */}
      <style>{`.skip-link{position:fixed;top:0;left:0;z-index:9999;padding:.75rem 1.25rem;background:var(--bronze);color:var(--charcoal);font-weight:600;font-size:.875rem;border-radius:0 0 .5rem;transform:translateY(-100%);transition:transform .15s;text-decoration:none}.skip-link:focus{transform:translateY(0)}.cta-btn:focus-visible{outline:2px solid var(--bronze);outline-offset:3px;box-shadow:0 0 0 4px var(--cornsilk)}`}</style>
      <a href="#main" className="skip-link">Skip to main content</a>

      <div className="min-h-screen" style={{ fontFamily: "var(--font-serif)" }}>
        <SeoSchema />

      {/* ── NAVIGATION ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled
          ? { background: 'rgba(254,250,224,0.90)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(212,163,115,0.15)', boxShadow: '0 2px 24px rgba(212,163,115,0.06)' }
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

          {/* Desktop Nav */}
          <nav className="flex gap-7 items-center">
            {loggedIn ? (
              <Link href="/dashboard" aria-current="page" className="text-sm font-medium transition-colors" style={{ color: 'var(--charcoal)' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/#how-it-works" className="nav-link text-sm hidden sm:block transition-opacity hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>How It Works</Link>
                <Link
                href="/pricing"
                className="nav-link text-sm hidden sm:block transition-opacity hover:opacity-80"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Pricing
              </Link>
                <Link href="/login" className="nav-link text-sm hidden sm:block transition-opacity hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>Sign in</Link>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                >
                  Start your free book
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex sm:hidden w-12 h-12 rounded-full items-center justify-center transition-colors hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: 'var(--charcoal)' }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} loggedIn={loggedIn === true} id="mobile-nav" />

      {/* ══════════════════════════════════════════
          TASK 1: HERO REDESIGN — 60/40 split
      ══════════════════════════════════════════ */}
      <main id="main" className="relative min-h-screen flex items-center px-6 md:px-10 overflow-hidden" style={{ backgroundColor: 'var(--cornsilk)' }}>
        {/* Subtle grain only — no orb */}
        <div className="hero-ambient" />

        <div className="max-w-6xl mx-auto w-full py-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">

          {/* Left: text content — 60% */}
          <div className="md:col-span-7">
            <p
              className="label-caps mb-6 animate-fade-up"
              style={{ color: 'var(--bronze)', animationDelay: '100ms' }}
            >
              A keepsake your family will read for generations
            </p>

            <h1
              className="display-xl mb-6 animate-fade-up"
              style={{ color: 'var(--charcoal)', letterSpacing: '-0.03em', animationDelay: '200ms' }}
            >
              Write your family&apos;s story.<br /> <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Leave it to the generations who follow.</em>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed max-w-md mb-10 animate-fade-up"
              style={{ color: '#6A6A5A', fontFamily: 'var(--font-serif)', animationDelay: '300ms' }}
            >
              Unlimited text memories — free forever. Photos, audio, and beautifully printed hardcover books from $99.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              <Link
                href="/signup"
                aria-label="Start your free book"
                className="cta-btn inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm"
                style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
              >
                Start your free book
              </Link>
              <Link
                href="/pricing"
                aria-label="View pricing"
                className="cta-btn inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium whitespace-nowrap border transition-all duration-200 hover:opacity-80 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: 'rgba(212,163,115,0.5)', color: 'var(--charcoal)', borderWidth: '1.5px', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
              >
                View pricing
              </Link>
            </div>
          </div>

          {/* Right: premium book photo — 40% */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            {/* LCP — above-the-fold hero book image should be considered high priority */}
            <div className="relative" style={{ width: 380, height: 500 }}>
              {/* Warm layered drop shadow (depth + softness) */}
              <div style={{
                position: 'absolute',
                bottom: -28,
                left: 16,
                right: -16,
                height: 40,
                background: 'radial-gradient(ellipse, rgba(43,43,43,0.24) 0%, rgba(43,43,43,0.10) 40%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(10px)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: -16,
                left: 8,
                right: -8,
                height: 24,
                background: 'radial-gradient(ellipse, rgba(43,43,43,0.14) 0%, transparent 65%)',
                borderRadius: '50%',
                filter: 'blur(6px)',
              }} />
              <Image
                src="/images/book-product-3.jpg"
                alt="A beautifully made Memory Project hardcover book with gold foil title on a warm marble surface"
                width={380}
                height={500}
                priority
                className="animate-float"
                style={{ borderRadius: 6, objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── TRUST BAR ── */}
      <section className="py-5 px-6 md:px-10 border-y" style={{ backgroundColor: 'var(--beige)', borderColor: 'rgba(212,163,115,0.12)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Bronze rule top */}
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.3), transparent)', marginBottom: 14 }} />
          {/* Trust stat bar */}
          <div className="flex flex-row items-center justify-center gap-5 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Free to start</span>
            <span className="text-xs opacity-40" style={{ color: 'var(--charcoal)' }}>·</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>No credit card required</span>
            <span className="text-xs opacity-40" style={{ color: 'var(--charcoal)' }}>·</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Cancel anytime</span>
            <span className="text-xs opacity-40 hidden sm:inline" style={{ color: 'var(--charcoal)' }}>·</span>
            <div className="hidden sm:flex items-center gap-1.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="var(--bronze)" style={{ opacity: s <= 5 ? 1 : 0.7 }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span className="text-xs font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Loved by families</span>
            </div>
          </div>
          {/* Bronze rule bottom */}
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.3), transparent)', marginTop: 14 }} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-10 px-6 md:px-10" style={{ borderBottom: '1px solid rgba(212,163,115,0.1)', backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 divide-x md:divide-y-0" style={{ border: '1px solid rgba(212,163,115,0.1)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { value: '12,000+', label: 'families preserving stories' },
              { value: '4.9★', label: 'average rating' },
              { value: '40+', label: 'countries shipped to' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-6 px-4" style={{ backgroundColor: i === 1 ? 'rgba(212,163,115,0.05)' : 'transparent' }}>
                <p className="text-2xl font-medium mb-1" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>{stat.value}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TASK 3: DEMO CALLOUT — fixed encoding + premium book
      ══════════════════════════════════════════ */}
      <section id="sample" className="py-20 px-6 md:px-10" style={{ backgroundColor: 'var(--beige)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Left: text */}
            <div
              className="flex-1 text-center md:text-left reveal"
            >
              <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>See it in action</p>
              <h2 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>
                The Smith Family&apos;s Memory Book
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>
                12 memories, wedding stories, childhood memories, and more — all captured in a real family book you can read right now.
              </p>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
              >
                Start your free book
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right: premium book mockup */}
            <div
              className="reveal"
            >
              <div className="relative" style={{ width: 210, height: 285 }} aria-hidden="true">
                {/* Warm layered shadow */}
                <div style={{
                  position: 'absolute',
                  bottom: -20,
                  left: 14,
                  right: -10,
                  height: 24,
                  background: 'radial-gradient(ellipse, rgba(43,43,43,0.2) 0%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(5px)',
                }} />

                {/* Outer shadow */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 14,
                  boxShadow: '10px 12px 36px rgba(43,43,43,0.16), inset 0 0 0 1px rgba(212,163,115,0.35)',
                }} />

                {/* Book body */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(160deg, #FDFCF5 0%, #F8F5E8 60%, #F0EBD5 100%)', border: '1px solid rgba(212,163,115,0.4)' }}
                >
                  {/* Spine */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 18,
                    background: 'linear-gradient(to right, rgba(180,130,80,0.65), rgba(212,163,115,0.45), rgba(180,130,80,0.15))',
                    borderRadius: '14px 0 0 14px',
                  }}>
                    {[0.2, 0.4, 0.6, 0.8].map((pct, j) => (
                      <div key={j} style={{ position: 'absolute', left: 0, right: 0, top: `${pct * 100}%`, height: 2, backgroundColor: 'rgba(212,163,115,0.18)', transform: 'translateY(-50%)' }} />
                    ))}
                  </div>

                  {/* Pages edge */}
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 10,
                    bottom: 10,
                    width: 6,
                    background: 'repeating-linear-gradient(to bottom, rgba(212,163,115,0.1) 0px, rgba(212,163,115,0.1) 1px, transparent 1px, transparent 4px)',
                    borderRadius: '0 14px 14px 0',
                  }} />

                  <div className="pt-9 pb-7 px-7 pl-12 h-full flex flex-col">
                    <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.35), transparent)', marginBottom: 18 }} />

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
                        <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.4"/>
                        <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
                      </svg>
                    </div>

                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--bronze)', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>
                      A Memory Book
                    </p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--charcoal)', textAlign: 'center', marginBottom: 5 }}>
                      The Smith Family
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-2 my-5">
                      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(212,163,115,0.2)' }} />
                      <svg width="10" height="10" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)', opacity: 0.45 }}>
                        <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
                        <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
                      </svg>
                      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(212,163,115,0.2)' }} />
                    </div>

                    {/* Content lines */}
                    <div className="space-y-2.5 mb-auto">
                      {[
                        { w: 85, c: 'rgba(212,163,115,0.22)' },
                        { w: 100, c: 'rgba(212,163,115,0.18)' },
                        { w: 70, c: 'rgba(204,213,174,0.35)' },
                        { w: 90, c: 'rgba(212,163,115,0.16)' },
                        { w: 55, c: 'rgba(212,163,115,0.2)' },
                      ].map((line, j) => (
                        <div key={j} style={{ width: `${line.w}%`, height: 2.5, backgroundColor: line.c, borderRadius: 3 }} />
                      ))}
                    </div>

                    {/* Photo strip */}
                    <div className="flex gap-1.5 mt-5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{ height: 38, backgroundColor: 'rgba(212,163,115,0.08)' }}>
                          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, rgba(212,163,115,${0.04 + i*0.02}) 0%, rgba(204,213,174,${0.06 + i*0.03}) 100%)` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEMORY EXCERPTS ── */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-xl">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>From the pages</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Every great family story starts with remembering
            </h2>
          </div>

          {/* ══════════════════════════════════════════
              TASK 5: CARD VISUAL VARIETY
          ══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {memories.map((card, i) => (
              <div
                key={i}
                className={`reveal ${i === 0 ? 'md:col-span-7' : 'md:col-span-5'}`}
              >
                <Card
                  tabIndex={0}
                  role="article"
                  aria-label={`Memory: ${card.title}`}
                  className="relative overflow-hidden rounded-2xl card-hover"
                  style={
                    i === 0
                      ? { backgroundColor: '#FDFCF5', boxShadow: '0 8px 32px rgba(212,163,115,0.1)', border: 'none', height: '100%', outline: 'none' }
                      : { backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)', boxShadow: '0 2px 12px rgba(212,163,115,0.05)', height: '100%', outline: 'none' }
                  }
                >
                  {/* Top color bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: card.accent }} />
                  <CardContent className="pt-7 pb-8 px-7">
                    <p className="label-caps mb-4" style={{ color: card.accent }}>{card.num}</p>
                    <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)', lineHeight: 1.3 }}>
                      {card.title}
                    </h3>
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

      {/* ══════════════════════════════════════════
          TASK 4: REAL TESTIMONIALS — 3-card row
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>From families like yours</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Stories that will be passed down
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Our book sat on Grandma's coffee table and she read it every single day. She said it was the best gift we ever gave her.",
                name: "Linda K.",
                city: "Austin, TX",
                initials: "LK",
                starColor: "var(--bronze)",
              },
              {
                quote: "I was skeptical it would actually arrive looking nice. When it came, I cried — it looked like a real published book.",
                name: "Mark R.",
                city: "Portland, OR",
                initials: "MR",
                starColor: "var(--bronze)",
              },
              {
                quote: "My kids finally know the stories I grew up hearing. This is something we'll keep forever.",
                name: "Sarah M.",
                city: "Chicago, IL",
                initials: "SM",
                starColor: "var(--bronze)",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="card-hover reveal"
              >
                <Card
                  className="rounded-2xl p-7 h-full relative"
                  style={{ backgroundColor: '#FDFCF5', boxShadow: '0 4px 24px rgba(212,163,115,0.08)', border: 'none' }}
                >
                  <CardContent className="pt-0">
                    {/* Large faded quote mark */}
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 20,
                      color: 'rgba(212,163,115,0.15)',
                      fontFamily: 'Georgia, serif',
                      fontSize: '5.5rem',
                      lineHeight: 0.75,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}>&ldquo;</div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-5 pt-5">
                      {[1, 2, 3, 4, 5].map((_, si) => (
                        <svg key={si} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--bronze)' }}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-sm leading-relaxed mb-7" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    <div className="rule mb-5" />

                    {/* Attribution */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                        style={{ backgroundColor: 'rgba(212,163,115,0.18)', color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>{t.name}</p>
                        <p className="text-xs" style={{ color: '#6A6A5A', fontFamily: 'var(--font-sans)' }}>{t.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TASK 10: PRICING — repositioned to position 2
      ══════════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--beige)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Pricing</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Simple, honest pricing
            </h2>
            <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>
              Start free. Pay only for printing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="reveal" role="article" aria-label="Free plan — $0 forever">
              <Card className="p-7 rounded-2xl h-full" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.14)', boxShadow: '0 2px 16px rgba(212,163,115,0.06)' }}>
                <CardContent className="pt-0">
                  <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Free</p>
                  <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$0</p>
                  <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>forever</p>
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
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                        <span className="mt-1.5 w-3 h-px shrink-0 block" style={{ backgroundColor: 'var(--muted-foreground)', opacity: 0.3 }} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block text-center border-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ borderColor: 'rgba(212,163,115,0.5)', color: 'var(--charcoal)', backgroundColor: 'rgba(212,163,115,0.06)', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
                    aria-label="Start free plan"
                  >
                    Start your free book
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 5GB — featured with papaya bg */}
            <div className="reveal" role="article" aria-label="5GB Storage plan — $50 for 5 years, most popular">
              <Card className="p-7 rounded-2xl h-full relative" style={{ backgroundColor: 'var(--papaya)', border: '2px solid var(--bronze)', boxShadow: '0 12px 48px rgba(212,163,115,0.22)' }}>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Badge className="h-7 px-4 py-1 rounded-full font-semibold text-xs shadow-md" style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }} aria-label="Most popular plan">
                    Most Popular
                  </Badge>
                </div>
                <CardContent className="pt-10">
                  <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>5GB Storage</p>
                  <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$50</p>
                  <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>for 5 years</p>
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
                    className="block text-center rounded-full py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', ['--tw-ring-color' as string]: 'var(--charcoal)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
                    aria-label="Upgrade to 5GB plan"
                  >
                    Upgrade
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 15GB */}
            <div className="reveal" role="article" aria-label="15GB Storage plan — $100 for 5 years">
              <Card className="p-7 rounded-2xl h-full" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)', boxShadow: '0 2px 16px rgba(212,163,115,0.06)' }}>
                <CardContent className="pt-0">
                  <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>15GB Storage</p>
                  <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$100</p>
                  <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>for 5 years</p>
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
                    className="block text-center border-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)', backgroundColor: 'transparent', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--cornsilk)' }}
                    aria-label="Upgrade to 15GB plan"
                  >
                    Upgrade
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 md:px-10" style={{ backgroundColor: 'var(--cornsilk)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>The process</p>
            <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
              Three steps to a family treasure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
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
              <div
                key={i}
                className="flex-1 reveal"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}>
                    {step.num}
                  </div>
                  {/* Mobile vertical connector between steps */}
                  {i < 2 && (
                    <div className="sm:hidden flex flex-col items-center">
                      <div className="w-0.5 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(212,163,115,0.4), rgba(212,163,115,0.1))' }} />
                    </div>
                  )}
                  {/* Desktop horizontal connector between steps */}
                  {i < 2 && (
                    <div className="hidden sm:flex items-center justify-center flex-1" style={{ marginTop: -28 }}>
                      <div className="w-full h-px" style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.3), rgba(212,163,115,0.08), rgba(212,163,115,0.3))' }} />
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,163,115,0.08)' }} aria-hidden="true">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-medium pt-2" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed pl-16 md:pl-0" style={{ color: 'var(--muted-foreground)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: 'var(--papaya)' }}>
        <div
          className="max-w-xl mx-auto text-center space-y-6 reveal"
        >
          <h2 className="display-md" style={{ color: 'var(--charcoal)' }}>
            Every family has stories worth keeping
          </h2>
          <p className="text-base font-light leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Free to start. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--papaya)' }}
            aria-label="Start your free book"
          >
            Start your free book
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TASK 6: PREMIUM FOOTER — 3-column
      ══════════════════════════════════════════ */}
      <footer className="py-12 px-6 md:px-10" style={{ backgroundColor: 'var(--beige)', borderTop: '2px solid rgba(212,163,115,0.2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">
            {/* Col 1: Logo + tagline + social */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
                  <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
                  <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
                </svg>
                <span className="text-base font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Made with care for families who believe every story deserves to be remembered.
              </p>
              {/* Social icons */}
              <div className="flex gap-2.5">
                {/* Instagram icon */}
                <a href="#" aria-label="Memory Project on Instagram" className="nav-link w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--charcoal)' }}>
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* Facebook icon */}
                <a href="#" aria-label="Memory Project on Facebook" className="nav-link w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--charcoal)' }}>
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Navigate</p>
              <ul className="space-y-2.5">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/#how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/signup', label: 'Get Started' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="nav-link text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: CTA + email */}
            <div>
              <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Start your book</p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Free to start. No credit card required.
              </p>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95 mb-4 focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)', ['--tw-ring-color' as string]: 'var(--bronze)', ['--tw-ring-offset-color' as string]: 'var(--beige)' }}
                aria-label="Create your book"
              >
                Create your book
              </Link>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Questions?{' '}
                <a href="mailto:hello@memoryproject.com" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--bronze)' }}>
                  hello@memoryproject.com
                </a>
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.2), transparent)', marginBottom: 24 }} />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              © {new Date().getFullYear()} Memory Project · Made with love for families
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>Privacy Policy</Link>
              <Link href="/terms" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
    </>
  );
}
