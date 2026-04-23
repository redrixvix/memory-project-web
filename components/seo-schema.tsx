'use client';

import Script from 'next/script';

// Homepage schema: Organization + WebApplication (no FAQPage — that's on /faq only)
const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Memory Project',
  url: 'https://web-redrixvixs-projects.vercel.app',
  description: 'A keepsake your family will read for generations. Free to start — write unlimited text memories, add photos and voice recordings, and print a beautiful hardcover book from $99.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://web-redrixvixs-projects.vercel.app/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Memory Project',
  url: 'https://web-redrixvixs-projects.vercel.app',
  logo: 'https://web-redrixvixs-projects.vercel.app/og-image.png',
  sameAs: [],
  description: 'A platform for preserving family stories, memories, and legacies in beautifully printed hardcover books.',
};


const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Memory Project',
  url: 'https://web-redrixvixs-projects.vercel.app',
  description: 'A keepsake your family will read for generations. Free to start — write unlimited text memories, add photos and voice recordings, and print a beautiful hardcover book from $99.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web Browser',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Unlimited text memories — free forever.',
      name: 'Free Plan',
    },
    {
      '@type': 'Offer',
      price: '50',
      priceCurrency: 'USD',
      description: '5GB photo & audio storage for 5 years.',
      name: '5GB Storage Plan',
    },
    {
      '@type': 'Offer',
      price: '100',
      priceCurrency: 'USD',
      description: '15GB photo & audio storage for 5 years.',
      name: '15GB Storage Plan',
    },
  ],
  // aggregateRating omitted — only include when real verified reviews exist
  screenshot: 'https://web-redrixvixs-projects.vercel.app/og-image.png',
  browserRequirements: 'Requires JavaScript and a modern web browser.',
};

export default function SeoSchema() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="webapplication-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
    </>
  );
}
