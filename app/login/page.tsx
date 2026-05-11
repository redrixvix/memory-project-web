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

const skipLinkStyle = `.skip-link{position:fixed;top:0;left:0;z-index:9999;padding:.75rem 1.25rem;background:var(--bronze);color:var(--charcoal);font-weight:600;font-size:.875rem;border-radius:0 0 .5rem;transform:translateY(-100%);transition:transform .15s;text-decoration:none}.skip-link:focus{transform:translateY(0)}`;

export default function LoginPage() {
  return (
    <>
      <style>{skipLinkStyle}</style>
      <a href="#main" className="skip-link">Skip to main content</a>
      <LoginClient />
    </>
  );
}
