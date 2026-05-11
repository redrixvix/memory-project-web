import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: "Dashboard — Memory Project",
  description: "Your Memory Project library. Manage your family memory books, add new stories, and track your captured memories.",
  openGraph: {
    title: "My Dashboard — Memory Project",
    description: "Your Memory Project library.",
    url: "/dashboard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "My Dashboard — Memory Project",
    description: "Your Memory Project library.",
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}