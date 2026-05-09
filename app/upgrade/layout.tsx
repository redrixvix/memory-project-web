import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Upgrade Your Memory Book',
    template: '%s | Memory Project',
  },
  description:
    'Unlock unlimited photo storage, high-quality printing, and lifetime access for your family memories. Upgrade your Memory Project book today.',
  keywords: [
    'memory book upgrade',
    'photo storage plans',
    'memory book printing',
    'family memory storage',
    'hardcover book upgrade',
  ],
  openGraph: {
    title: 'Upgrade Your Memory Book — Memory Project',
    description:
      'Unlock unlimited photo storage, high-quality printing, and lifetime access. Preserve your family stories forever.',
    url: 'https://web-redrixvixs-projects.vercel.app/upgrade',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Memory Project — upgrade your memory book',
      },
    ],
  },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
