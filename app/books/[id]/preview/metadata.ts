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
    description: 'Preview your memory book before ordering a printed hardcover copy.',
    openGraph: {
      title,
      description: 'Preview your memory book before ordering a printed hardcover copy.',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Preview your memory book before ordering a printed hardcover copy.',
      images: ['/og-image.png'],
    },
  };
}
