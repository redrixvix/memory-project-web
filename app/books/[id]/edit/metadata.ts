import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Memory — Memory Project',
  description: 'Add or edit a memory in your family memory book.',
  openGraph: {
    title: 'Edit Memory — Memory Project',
    description: 'Add or edit a memory in your family memory book.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit Memory — Memory Project',
    description: 'Add or edit a memory in your family memory book.',
    images: ['/og-image.png'],
  },
};
