import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Book Preview — Memory Project`,
    description: 'Preview your memory book before printing. See how your memories will look in a real published book.',
  };
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
