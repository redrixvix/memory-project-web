import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'You\'ve Been Invited — Memory Project',
  description: 'Accept your invitation to join a Memory Project book and start contributing to your family\'s story.',
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
