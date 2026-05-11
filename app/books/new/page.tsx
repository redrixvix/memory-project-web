import type { Metadata } from 'next';
import NewBookClient from './NewBookClient';

export const metadata: Metadata = {
  title: 'Create New Memory Book — Memory Project',
  description: 'Start a new memory book for your family. Capture stories with text, photos, and audio — then print a beautiful hardcover keepsake.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NewBookPage() {
  return <NewBookClient />;
}
