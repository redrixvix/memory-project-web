import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: "Sign In — Memory Project",
  description: "Sign in to your Memory Project account. Access your family memory books, add new memories, and continue capturing the stories that matter.",
  openGraph: {
    title: "Sign In — Memory Project",
    description: "Sign in to your Memory Project account.",
    url: "https://web-redrixvixs-projects.vercel.app/login",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign In — Memory Project",
    description: "Sign in to your Memory Project account.",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
