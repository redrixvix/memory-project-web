import type { Metadata } from 'next';
import NewBookClient from './NewBookClient';

export const metadata: Metadata = {
  title: 'Create New Memory Book — Memory Project',
  description: 'Start a new memory book for your family. Capture stories with text, photos, and audio — then print a beautiful hardcover keepsake.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Create New Memory Book — Memory Project',
    description: 'Start a new memory book for your family. Capture stories with text, photos, and audio — then print a beautiful hardcover keepsake.',
    url: '/books/new',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create New Memory Book — Memory Project',
    description: 'Start a new memory book for your family. Capture stories with text, photos, and audio — then print a beautiful hardcover keepsake.',
    images: ['/og-image.png'],
  },
};

export default function NewBookPage() {
  return <NewBookClient />;
}
