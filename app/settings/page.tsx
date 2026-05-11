import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: "Account Settings — Memory Project",
  description: "Manage your Memory Project profile, photo, and account preferences.",
  openGraph: {
    title: "Account Settings — Memory Project",
    description: "Manage your Memory Project profile, photo, and account preferences.",
    url: "https://web-redrixvixs-projects.vercel.app/settings",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project — Account Settings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Account Settings — Memory Project",
    description: "Manage your Memory Project profile, photo, and account preferences.",
    images: ["/og-image.png"],
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
