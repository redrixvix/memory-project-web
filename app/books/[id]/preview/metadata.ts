import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preview Memory Book — Memory Project',
  description: 'Preview your memory book before ordering a printed hardcover copy.',
  openGraph: {
    title: 'Preview Memory Book — Memory Project',
    description: 'Preview your memory book before ordering a printed hardcover copy.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preview Memory Book — Memory Project',
    description: 'Preview your memory book before ordering a printed hardcover copy.',
    images: ['/og-image.png'],
  },
};
