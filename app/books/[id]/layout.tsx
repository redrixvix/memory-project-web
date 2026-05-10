import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Book — Memory Project`,
    description: `View and share memories in this Memory Project book. Open book ID: ${id}. Full personalization available when you sign in.`,
  };
}

export default function BookDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
