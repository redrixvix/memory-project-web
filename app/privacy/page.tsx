import type { Metadata } from 'next';
import Link from 'next/link';
import BreadcrumbSchema from '@/components/breadcrumb-schema';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Memory Project collects, uses, and protects your personal information. Your memories and data are yours — we never sell or share them.',
  openGraph: {
    title: 'Privacy Policy — Memory Project',
    description: 'How Memory Project collects, uses, and protects your personal information. Your memories and data are yours — we never sell or share them.',
    url: 'https://web-redrixvixs-projects.vercel.app/privacy',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Memory Project privacy policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — Memory Project',
    description: 'How Memory Project collects, uses, and protects your personal information. Your memories and data are yours — we never sell or share them.',
    images: ['/og-image.png'],
  },
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Last updated: April 23, 2026
          </p>
        </div>

        <div className="space-y-10">
          {[
            {
              title: 'Your data is yours',
              body: 'Memory Project stores your memories, photos, audio recordings, and account information to provide the service you signed up for. We do not sell, rent, or share your personal information with third parties for their marketing purposes.',
            },
            {
              title: 'What we collect',
              body: 'When you create an account, we collect your name and email address. When you write memories, we store the text, any photos or audio you upload, and the writing prompts you respond to. Payment information is handled by our payment processor — we do not store credit card numbers.',
            },
            {
              title: 'How we use your data',
              body: "We use your information to provide, maintain, and improve the service. Your memories are processed to generate book previews and print orders. We may send you account-related emails (like magic link sign-in codes) but we don't send marketing emails without your consent.",
            },
            {
              title: 'Family collaboration',
              body: "When you invite family members to contribute to a book, they can add their own photos and memories to entries you own. You control who can see and edit each book. Invited contributors cannot access your other books or account settings.",
            },
            {
              title: 'Printing and fulfillment',
              body: 'When you order a printed book, we share the necessary content (your memories and photos) with our book printing partner to fulfill your order. They are contractually obligated to use your content only for that purpose.',
            },
            {
              title: 'Data retention',
              body: 'Your account and all memories remain available as long as your account is active. You can export or delete your data at any time from your account settings. If you cancel, we retain your data for 30 days before permanent deletion.',
            },
            {
              title: 'Security',
              body: 'We use industry-standard encryption for data in transit and at rest. Access to our servers is restricted to authorized personnel only. No system is perfect, but we take reasonable measures to protect your data.',
            },
            {
              title: 'Cookies',
              body: 'We use essential cookies to keep you signed in. We do not use advertising or tracking cookies. Some analytics tools may collect anonymized, aggregated usage data — you can opt out by contacting us.',
            },
            {
              title: 'Children\'s privacy',
              body: 'Our service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has created an account without parental consent, contact us to delete the account.',
            },
            {
              title: 'Changes to this policy',
              body: 'If we make material changes to this policy, we will notify you by email or by posting a notice in the app before the change takes effect. Your continued use of the service after the change means you accept the new policy.',
            },
            {
              title: 'Contact',
              body: 'If you have questions about this Privacy Policy or want to exercise your data rights, email us at hello@memoryproject.com.',
            },
          ].map((section, i) => (
            <div key={i} className="pb-8 border-b" style={{ borderColor: 'rgba(212,163,115,0.1)' }}>
              <h2 className="text-lg font-medium mb-3" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
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
            Questions about your privacy?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            We&apos;re happy to help. Send us a note anytime.
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
      <BreadcrumbSchema items={[{ name: 'Privacy Policy', href: '/privacy' }]} />
    </div>
  );
}
