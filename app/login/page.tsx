import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: "Sign In — Memory Project",
  description: "Sign in to your Memory Project account. Access your family memory books, add new memories, and continue capturing the stories that matter.",
  openGraph: {
    title: "Sign In — Memory Project",
    description: "Sign in to your Memory Project account.",
    url: "/login",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project — sign in to your memory book",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In — Memory Project",
    description: "Sign in to your Memory Project account.",
    images: ["/og-image.png"],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
