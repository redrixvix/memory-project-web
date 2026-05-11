import type { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: "Create Your Memory Book — Free Forever",
  description: "Start your free memory book today. Unlimited text memories — no credit card required. Add photos, voice, and print a beautiful hardcover from $99.",
  openGraph: {
    title: "Create Your Memory Book — Memory Project",
    description: "Start free. No credit card required. Write unlimited memories and print a beautiful hardcover book from $99.",
    url: "/signup",
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

const skipLinkStyle = `.skip-link{position:fixed;top:0;left:0;z-index:9999;padding:.75rem 1.25rem;background:var(--bronze);color:var(--charcoal);font-weight:600;font-size:.875rem;border-radius:0 0 .5rem;transform:translateY(-100%);transition:transform .15s;text-decoration:none}.skip-link:focus{transform:translateY(0)}`;

export default function SignupPage() {
  return (
    <>
      <style>{skipLinkStyle}</style>
      <a href="#main" className="skip-link">Skip to main content</a>
      <SignupClient />
    </>
  );
}
