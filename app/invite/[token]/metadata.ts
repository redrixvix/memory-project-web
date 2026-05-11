import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Memory Book — Memory Project',
  description: 'Accept your invitation to join a family memory book.',
  openGraph: {
    title: 'Join Memory Book — Memory Project',
    description: 'Accept your invitation to join a family memory book.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Memory Book — Memory Project',
    description: 'Accept your invitation to join a family memory book.',
    images: ['/og-image.png'],
  },
};
