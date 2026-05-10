import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import BreadcrumbSchema from '@/components/breadcrumb-schema';

const pricingFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What happens to my free memories if I never upgrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'They stay yours, forever. Even on the free plan, your text memories are yours to keep, edit, and export any time.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does printing work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "When you're ready to print, we'll format your book as a hardcover with archival paper, smyth-sewn binding, and a custom dust jacket. Starting at $99 for a 200-page book.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch plans later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, you can upgrade at any time. You can also add photo storage à la carte without upgrading your whole plan.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Pricing — Memory Project",
    template: "%s | Memory Project",
  },
  description: "Start free. Pay only for printing. Unlimited text memories forever, or upgrade for photo storage and beautifully printed hardcover books starting at $99.",
  keywords: ["memory book pricing", "family memory book cost", "printed memory book price", "hardcover book printing cost", "photo storage plans"],
  openGraph: {
    title: "Pricing — Memory Project",
    description: "Start free. Pay only for printing. Unlimited text memories forever, upgrade for photo storage and printed hardcover books from $99.",
    url: "https://web-redrixvixs-projects.vercel.app/pricing",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project pricing — free to start, printed books from $99",
      },
    ],
  },
};

type PricingPageProps = {
  searchParams: Promise<{ book?: string | string[] | undefined }>;
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const resolvedSearchParams = await searchParams;
  const bookParam = Array.isArray(resolvedSearchParams.book)
    ? resolvedSearchParams.book[0]
    : resolvedSearchParams.book;
  const upgradeHref = bookParam ? `/upgrade?book=${encodeURIComponent(bookParam)}` : '/upgrade';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}>
      {/* Minimal header */}
      <header
        className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b"
        style={{
          background: 'rgba(254,250,224,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--bronze-18)',
        }}
      >
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>Memory Project</span>
          </Link>
          <Link
            href="/signup"
            className="h-11 flex items-center justify-center rounded-full px-5 text-sm font-medium min-w-[88px] text-center"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <main id="main" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Pricing</p>
          <h1 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>
            Simple, honest pricing
          </h1>
          <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
            Start free. Pay only for printing.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>
            Join 12,000+ families preserving their stories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          {/* Free — solid, confident styling */}
          <Card
            className="p-7 rounded-2xl h-full flex flex-col"
            style={{
              backgroundColor: 'var(--card)',
              border: '1.5px solid var(--bronze-30)',
              boxShadow: '0 4px 24px var(--bronze-08)',
            }}
          >
            <CardContent className="pt-0 flex flex-col flex-1">
              <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Free</p>
              <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$0</p>
              <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Unlimited text memories, forever free</p>
              <div style={{ height: 1, background: 'var(--bronze-25)', marginBottom: 32 }} />
              <ul className="space-y-3 mb-10 flex-1">
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
                  <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--muted-foreground)', opacity: 0.45, fontFamily: 'var(--font-sans)' }}>
                    <span className="mt-1 w-3 h-px shrink-0 block" style={{ backgroundColor: 'currentColor' }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-full py-3 text-sm font-semibold transition-all duration-200 hover:opacity-85 active:scale-[0.98] mt-auto min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bronze)]"
                style={{
                  border: '1.5px solid var(--bronze-55)',
                  color: 'var(--charcoal)',
                  backgroundColor: 'var(--bronze-08)',
                }}
              >
                Get started free
              </Link>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.65, fontFamily: 'var(--font-sans)' }}>Free forever — cancel anytime</span>
              </div>
            </CardContent>
          </Card>

          {/* Premium — featured card */}
          <Card
            className="p-7 rounded-2xl h-full relative flex flex-col"
            style={{
              backgroundColor: 'var(--papaya)',
              border: '2px solid var(--bronze)',
              boxShadow: '0 16px 56px var(--bronze-26)',
            }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Badge className="h-7 px-4 py-1 rounded-full font-semibold text-xs shadow-md" style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}>
                Most Popular
              </Badge>
            </div>
            <CardContent className="pt-10 flex flex-col flex-1">
              <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Premium</p>
              <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$50</p>
              <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>for 5 years</p>
              <div style={{ height: 1, background: 'var(--bronze-30)', marginBottom: 32 }} />
              <ul className="space-y-3 mb-10 flex-1">
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
                href={upgradeHref}
                className="block text-center rounded-full py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 mt-auto min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bronze)]"
                style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
              >
                Upgrade
              </Link>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.65, fontFamily: 'var(--font-sans)' }}>End-to-end encrypted · 5-year guarantee</span>
              </div>
            </CardContent>
          </Card>

          {/* Plus — complete tier */}
          <Card
            className="p-7 rounded-2xl h-full flex flex-col"
            style={{
              backgroundColor: 'var(--card)',
              border: '1.5px solid var(--bronze-25)',
              boxShadow: '0 4px 24px var(--bronze-08)',
            }}
          >
            <CardContent className="pt-0 flex flex-col flex-1">
              <p className="label-caps mb-3" style={{ color: 'var(--bronze)' }}>Plus</p>
              <p className="text-4xl font-medium mb-1" style={{ color: 'var(--charcoal)' }}>$100</p>
              <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>for 5 years</p>
              <div style={{ height: 1, background: 'var(--bronze-25)', marginBottom: 32 }} />
              <ul className="space-y-3 mb-10 flex-1">
                {[
                  'Everything in Premium',
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
                href={upgradeHref}
                className="block text-center rounded-full py-3 text-sm font-semibold transition-all duration-200 hover:opacity-85 active:scale-[0.98] mt-auto min-h-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bronze)]"
                style={{ backgroundColor: 'var(--bronze-22)', color: 'var(--charcoal)' }}
              >
                Upgrade
              </Link>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.65, fontFamily: 'var(--font-sans)' }}>End-to-end encrypted · 5-year guarantee</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Single testimonial */}
        <div className="mt-16 max-w-xl mx-auto text-center">
          <div
            className="p-8 rounded-2xl"
            style={{
              backgroundColor: 'var(--bronze-06)',
              border: '1px solid var(--bronze-12)',
              boxShadow: '0 4px 24px var(--bronze-06)',
            }}
          >
            <div className="flex justify-center gap-0.5 mb-5">
              {[1,2,3,4,5].map((_, si) => (
                <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--bronze)' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-base italic leading-relaxed mb-5" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
              &ldquo;The best investment I&rsquo;ve made in years. When my mother passed, her Memory Project book was the only thing that let us hear her voice again. It&rsquo;s the most precious thing we own.&rdquo;
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>Sarah J. · Austin, TX</p>
          </div>
        </div>

        {/* FAQ — interactive accordion */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 role="heading" aria-level={2} className="display-md text-center mb-12" style={{ color: 'var(--charcoal)' }}>Common questions</h2>
          <FaqAccordion
            items={[
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
              {
                q: 'How do I get started?',
                a: "It's free to start. Sign up in seconds, choose your first memory book, and begin answering guided prompts about the people and moments that matter most. Add photos or audio any time — or just write. When you're ready, we'll print a beautiful hardcover book to treasure.",
              },
            ]}
          />
        </div>
      </main>
      <Script
        id="pricing-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqJsonLd) }}
      />
      <BreadcrumbSchema items={[{ name: 'Pricing', href: '/pricing' }]} />
    </div>
  );
}