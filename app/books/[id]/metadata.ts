import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Memory Book — Memory Project',
  description: 'View and relive the memories in your family memory book.',
  openGraph: {
    title: 'Memory Book — Memory Project',
    description: 'View and relive the memories in your family memory book.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memory Book — Memory Project',
    description: 'View and relive the memories in your family memory book.',
    images: ['/og-image.png'],
  },
};
