import type { Metadata } from 'next';
import UpgradeClient from './UpgradeClient';

export const metadata: Metadata = {
  title: 'Upgrade Your Memory Book — Memory Project',
  description:
    'Upgrade your memory book to Plus or Premium and unlock unlimited photo storage, voice recording capture, and beautifully printed hardcover heirlooms.',
  openGraph: {
    title: 'Upgrade Your Memory Book — Memory Project',
    description:
      'Unlock unlimited photos, voice recordings, and lifetime printed heirlooms. Give your family stories the home they deserve.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Upgrade your Memory Project book',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upgrade Your Memory Book — Memory Project',
    description:
      'Unlock unlimited photos, voice recordings, and lifetime printed heirlooms. Give your family stories the home they deserve.',
    images: ['/og-image.png'],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function UpgradePage() {
  return <UpgradeClient />;
}