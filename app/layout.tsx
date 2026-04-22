import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memory Project — Capture the stories that matter",
  description: "A digital life story app for families: capture memories with text, photos, and audio, then print beautiful hardcover books.",
  keywords: ["memory book", "family stories", "life story", "legacy", "printed book", "family history", "memories"],
  authors: [{ name: "Memory Project" }],
  openGraph: {
    title: "Memory Project — Capture the stories that matter",
    description: "Write your family's stories. Print them to last. Free to start.",
    url: "https://web-redrixvixs-projects.vercel.app",
    siteName: "Memory Project",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://web-redrixvixs-projects.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project — A keepsake your family will read for generations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Project — Capture the stories that matter",
    description: "Write your family's stories. Print them to last. Free to start.",
    images: ["https://web-redrixvixs-projects.vercel.app/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'><path d='M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z' fill='%23D4A373' fill-opacity='0.5'/><path d='M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z' fill='%23D4A373'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, lora.variable)}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}