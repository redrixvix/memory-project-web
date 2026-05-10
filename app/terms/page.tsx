import type { Metadata } from 'next';
import Link from 'next/link';
import BreadcrumbSchema from '@/components/breadcrumb-schema';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions for using Memory Project. By using our service, you agree to these terms.',
  openGraph: {
    title: 'Terms of Service — Memory Project',
    description: 'The terms and conditions for using Memory Project. By using our service, you agree to these terms.',
    url: 'https://web-redrixvixs-projects.vercel.app/terms',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Memory Project terms of service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — Memory Project',
    description: 'The terms and conditions for using Memory Project. By using our service, you agree to these terms.',
    images: ['/og-image.png'],
  },
};

export default function TermsPage() {
  return (
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
            <span className="text-base font-medium tracking-tight" style={{ color: 'var(--charcoal)' }}>
              Memory Project
            </span>
          </Link>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main id="main" className="px-6 md:px-10 py-16 max-w-3xl mx-auto w-full">
        <div className="mb-12">
          <p className="label-caps mb-4" style={{ color: 'var(--bronze)' }}>Legal</p>
          <h1 className="display-md mb-4" style={{ color: 'var(--charcoal)' }}>
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: '#6A6A5A' }}>
            Last updated: April 23, 2026
          </p>
        </div>

        <div className="space-y-10">
          {[
            {
              title: 'Acceptance of terms',
              body: 'By creating an account or using Memory Project, you agree to these Terms of Service. If you do not agree, do not use the service. These terms form a binding agreement between you and Memory Project.',
            },
            {
              title: 'The service',
              body: "Memory Project provides a platform for writing, preserving, and printing personal memories and family stories. We offer free text-only accounts and paid plans that include photo storage, audio recording, and printed hardcover books. We reserve the right to modify, suspend, or discontinue any part of the service at any time.",
            },
            {
              title: 'Your content',
              body: "You own all memories, photos, audio, and text you create in Memory Project. By uploading content, you grant us a limited license to process, store, and format it to provide the service — including printing your book when you request it. We do not claim ownership of your content. You are responsible for ensuring you have the right to share any content you upload.",
            },
            {
              title: 'Account responsibilities',
              body: 'You are responsible for keeping your account credentials secure. You must be 13 or older to create an account. You are responsible for all activity under your account. We may suspend or terminate accounts that violate these terms or are used for unlawful purposes.',
            },
            {
              title: 'Paid plans and billing',
              body: 'Paid plans are billed as described on the pricing page at the time of purchase. Storage plans are billed for a set period (currently 5 years). Printed books are charged separately at the time of order. All sales of printed books are final once production begins. Storage plan refunds are available within 7 days of purchase if you have not uploaded content.',
            },
            {
              title: 'Family collaboration',
              body: 'You may invite others to contribute to your books. You control their access level. You are responsible for how collaborators use your shared content. You must have the right to share any content you invite others to view or edit.',
            },
            {
              title: 'Printed books',
              body: 'Book printing is handled by a third-party fulfillment partner. Production typically takes 2–4 weeks. Shipping times vary by location. Books are customized per order — we do not accept returns on printed books. If your book arrives damaged, contact us within 7 days for a replacement.',
            },
            {
              title: 'Prohibited content',
              body: 'You may not use Memory Project to store or share content that is unlawful, defamatory, obscene, or infringes on others\' intellectual property rights. We may remove content that violates these restrictions and terminate accounts that repeatedly violate this policy.',
            },
            {
              title: 'Intellectual property',
              body: "The Memory Project name, logo, website design, and software are our property. You may not copy, modify, or distribute them without permission. The warm café design system and brand elements are proprietary.",
            },
            {
              title: 'Disclaimer',
              body: 'Memory Project is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or secure. We are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
            },
            {
              title: 'Indemnification',
              body: 'You agree to indemnify Memory Project from any claims, damages, or expenses arising from your violation of these terms or your use of the service.',
            },
            {
              title: 'Changes to terms',
              body: 'We may update these terms at any time. Material changes will be communicated by email or notice in the app. Your continued use after the change constitutes acceptance of the new terms.',
            },
            {
              title: 'Governing law',
              body: 'These terms are governed by the laws of the United States. Any disputes will be resolved in the courts of the United States.',
            },
            {
              title: 'Contact',
              body: 'For questions about these terms, contact hello@memoryproject.com.',
            },
          ].map((section, i) => (
            <div key={i} className="pb-8 border-b" style={{ borderColor: 'rgba(212,163,115,0.1)' }}>
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6A6A5A' }}>
                {section.body}
              </p>
            </div>
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
            Questions about these terms?
          </h2>
          <p className="text-sm mb-6" style={{ color: '#6A6A5A' }}>
            We&apos;re happy to clarify anything. Reach out anytime.
          </p>
          <Link
            href="mailto:hello@memoryproject.com"
            className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
          >
            hello@memoryproject.com
          </Link>
        </div>
      </main>
      <BreadcrumbSchema items={[{ name: 'Terms of Service', href: '/terms' }]} />
    </div>
  );
}
