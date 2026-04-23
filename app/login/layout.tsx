import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — Memory Project',
  description: 'Sign in to your Memory Project account to continue building your family memory book.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
