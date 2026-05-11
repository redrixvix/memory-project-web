import type { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: "Create Your Memory Book — Free Forever",
  description: "Start your free memory book today. Unlimited text memories — no credit card required. Add photos, voice, and print a beautiful hardcover from $99.",
  openGraph: {
    title: "Create Your Memory Book — Memory Project",
    description: "Start free. No credit card required. Write unlimited memories and print a beautiful hardcover book from $99.",
    url: "https://web-redrixvixs-projects.vercel.app/signup",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project — start your free memory book",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Your Memory Book — Free Forever",
    description: "Start your free memory book today. Unlimited text memories — no credit card required.",
    images: ["/og-image.png"],
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
