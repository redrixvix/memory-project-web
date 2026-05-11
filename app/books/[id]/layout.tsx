import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  let bookTitle = 'Memory Book';
  try {
    const API_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://web-redrixvixs-projects.vercel.app';
    const res = await fetch(`${API_URL}/api/books/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const book = await res.json();
      if (book?.title) bookTitle = book.title;
    }
  } catch {
    // Keep fallback title on error
  }

  const title = `${bookTitle} — Memory Project`;

  return {
    title,
    description: `View and share the memories in "${bookTitle}" on Memory Project.`,
    openGraph: {
      title,
      description: `View and share the memories in "${bookTitle}" on Memory Project.`,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: bookTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `View and share the memories in "${bookTitle}" on Memory Project.`,
      images: ['/og-image.png'],
    },
  };
}

export default function BookDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
