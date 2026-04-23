import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about Memory Project — how it works, pricing, printing, and more.',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Memory Project work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Write your memories using guided prompts or freely, then optionally add photos and audio. When you're ready, print a beautiful hardcover book to keep and share with family.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is Memory Project really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Writing unlimited text memories is free forever. You only pay if you want photo storage ($50/5yr for 5GB) or printed hardcover books (starting at $99).',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to make a memory book?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Most families spend a few weeks writing at their own pace — one memory at a time. There's no deadline, no pressure. You can add to your book anytime, even after you've printed the first edition.",
      },
    },
    {
      '@type': 'Question',
      name: "What's included in a printed book?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each book is a hardcover with archival-quality paper, smyth-sewn binding, and a fabric spine. Books start at 200+ pages and come in a custom printed dust jacket.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can my family contribute to a book?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! With our 5GB and 15GB plans, you can invite family members to add their own photos and memories to any entry. You remain the owner and control the final book.',
      },
    },
  ],
};

const faqs = [
  {
    q: 'How does Memory Project work?',
    a: "Write your memories using guided prompts or freely, then optionally add photos and audio. When you're ready, print a beautiful hardcover book to keep and share with family.",
  },
  {
    q: 'Is Memory Project really free?',
    a: 'Yes. Writing unlimited text memories is free forever. You only pay if you want photo storage ($50/5yr for 5GB) or printed hardcover books (starting at $99).',
  },
  {
    q: 'How long does it take to make a memory book?',
    a: "Most families spend a few weeks writing at their own pace — one memory at a time. There's no deadline, no pressure. You can add to your book anytime, even after you've printed the first edition.",
  },
  {
    q: "What's included in a printed book?",
    a: 'Each book is a hardcover with archival-quality paper, smyth-sewn binding, and a fabric spine. Books start at 200+ pages and come in a custom printed dust jacket.',
  },
  {
    q: 'Can my family contribute to a book?',
    a: 'Yes! With our 5GB and 15GB plans, you can invite family members to add their own photos and memories to any entry. You remain the owner and control the final book.',
  },
];

export default function FaqPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--cornsilk)', fontFamily: 'var(--font-serif)' }}
      >
        {/* ── HEADER ── */}
        <header
          className="sticky top-0 z-20 h-16 flex items-center px-6 md:px-10 border-b"
          style={{
            background: 'rgba(254,250,224,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(212,163,115,0.18)',
          }}
        >
          <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
            <Link href="/" className="flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--bronze)' }}>
                <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
                <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
              </svg>
              <span
                className="text-base font-medium tracking-tight"
                style={{ color: 'var(--charcoal)' }}
              >
                Memory Project
              </span>
            </Link>
          </div>
        </header>

        {/* ── FAQ CONTENT ── */}
        <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto w-full">
          <div className="text-center mb-16">
            <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>
              Got questions?
            </p>
            <h1
              className="display-md"
              style={{ color: 'var(--charcoal)' }}
            >
              Frequently Asked Questions
            </h1>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#FDFCF5',
                  border: '1px solid rgba(212,163,115,0.12)',
                  boxShadow: '0 2px 12px rgba(212,163,115,0.06)',
                }}
              >
                <summary
                  className="flex items-center justify-between gap-4 px-7 py-6 cursor-pointer list-none select-none"
                  style={{ color: 'var(--charcoal)' }}
                >
                  <span className="text-base font-medium">{faq.q}</span>
                  <svg
                    className="w-5 h-5 shrink-0 transition-transform duration-300 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: 'var(--bronze)' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div
                  className="px-7 pb-7 text-sm leading-relaxed border-t"
                  style={{
                    borderColor: 'rgba(212,163,115,0.1)',
                    color: '#6A6A5A',
                    paddingTop: '1.25rem',
                  }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div
            className="mt-16 text-center rounded-2xl p-10"
            style={{
              backgroundColor: 'var(--papaya)',
              border: '1px solid rgba(212,163,115,0.15)',
            }}
          >
            <h2 className="text-xl font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
              Still have questions?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6A6A5A' }}>
              We&apos;d love to hear from you. Send us a note and we&apos;ll get back to you shortly.
            </p>
            <Link
              href="mailto:hello@memoryproject.com"
              className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              Send us an email
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
