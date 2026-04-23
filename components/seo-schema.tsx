'use client';

import Script from 'next/script';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Memory Project work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Write your memories using guided prompts or freely, then optionally add photos and audio. When you\'re ready, print a beautiful hardcover book to keep and share with family.',
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
        text: 'Most families spend a few weeks writing at their own pace — one memory at a time. There\'s no deadline, no pressure. You can add to your book anytime, even after you\'ve printed the first edition.',
      },
    },
    {
      '@type': 'Question',
      name: 'What\'s included in a printed book?',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Memory Project',
  url: 'https://memoryproject.com',
  logo: 'https://memoryproject.com/og-image.png',
  sameAs: [],
  description: 'A platform for preserving family stories, memories, and legacies in beautifully printed hardcover books.',
};

export default function SeoSchema() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
