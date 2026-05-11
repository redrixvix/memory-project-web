import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "Capture the Stories That Matter — Memory Project",
  description: "Unlimited text memories — free forever. Photos, audio, and beautifully printed hardcover books from $99. Start your family memory book today.",
  openGraph: {
    title: "Capture the Stories That Matter — Memory Project",
    description: "Unlimited text memories — free forever. Photos, audio, and beautifully printed hardcover books from $99.",
    url: "https://web-redrixvixs-projects.vercel.app/",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project — capture the stories that matter",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Capture the Stories That Matter — Memory Project",
    description: "Unlimited text memories — free forever. Start your family memory book today.",
  },
};

export default function Home() {
  return <HomeClient />;
}
