import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Pricing — Simple, Honest Plans',
  description: 'Start free. Pay only for printing. Unlimited text memories forever, or upgrade for photo storage and printed hardcover books starting at $99.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      {/* Minimal header */}
      <header className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b" style={{ background: 'rgba(254,250,224,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(212,163,115,0.18)' }}>
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </Link>
          <Link href="/signup" className="h-9 flex items-center justify-center rounded-full px-5 text-sm font-medium" style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}>
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Pricing</p>
          <h1 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>
            Simple, honest pricing
          </h1>
          <p className="text-base" style={{ color: '#6A6A5A' }}>
            Start free. Pay only for printing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <Card className="p-7 rounded-2xl h-full" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.14)', boxShadow: '0 2px 16px rgba(212,163,115,0.06)' }}>
            <CardContent className="pt-0">
              <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Free</p>
              <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$0</p>
              <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>forever</p>
              <div style={{ height: 1, background: 'rgba(212,163,115,0.15)', marginBottom: 32 }} />
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
                  <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#8A8A7A' }}>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#B0B09A' }}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center border-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-80" style={{ borderColor: 'rgba(212,163,115,0.5)', color: 'var(--charcoal)', backgroundColor: 'rgba(212,163,115,0.06)' }}>
                Get started free
              </Link>
            </CardContent>
          </Card>

          {/* 5GB — featured */}
          <Card className="p-7 rounded-2xl h-full relative" style={{ backgroundColor: 'var(--papaya)', border: '2px solid var(--bronze)', boxShadow: '0 12px 48px rgba(212,163,115,0.22)' }}>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Badge className="h-7 px-4 py-1 rounded-full font-semibold text-xs shadow-md" style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}>
                Most Popular
              </Badge>
            </div>
            <CardContent className="pt-10">
              <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>5GB Storage</p>
              <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$50</p>
              <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>for 5 years</p>
              <div style={{ height: 1, background: 'rgba(212,163,115,0.15)', marginBottom: 32 }} />
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
              <Link href="/signup" className="block text-center rounded-full py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95" style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}>
                Upgrade
              </Link>
            </CardContent>
          </Card>

          {/* 15GB */}
          <Card className="p-7 rounded-2xl h-full" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.08)', boxShadow: '0 2px 16px rgba(212,163,115,0.06)' }}>
            <CardContent className="pt-0">
              <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>15GB Storage</p>
              <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$100</p>
              <p className="text-sm mb-8" style={{ color: '#6A6A5A' }}>for 5 years</p>
              <div style={{ height: 1, background: 'rgba(212,163,115,0.15)', marginBottom: 32 }} />
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
              <Link href="/signup" className="block text-center border-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-80" style={{ borderColor: 'rgba(212,163,115,0.4)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}>
                Upgrade
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="display-md text-center mb-12" style={{ color: 'var(--charcoal)' }}>Common questions</h2>
          {[
            {
              q: 'What happens to my free memories if I never upgrade?',
              a: 'They stay yours, forever. Even on the free plan, your text memories are yours to keep, edit, and export any time.',
            },
            {
              q: 'How does printing work?',
              a: "When you're ready to print, we'll format your book as a hardcover with archival paper, smyth-sewn binding, and a custom dust jacket. Starting at $99 for a 200-page book.",
            },
            {
              q: 'Can I switch plans later?',
              a: 'Yes, you can upgrade at any time. You can also add photo storage à la carte without upgrading your whole plan.',
            },
          ].map((item, i) => (
            <div key={i} className="mb-8 pb-8 border-b" style={{ borderColor: 'rgba(212,163,115,0.1)' }}>
              <h3 className="text-base font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>{item.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6A6A5A' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
