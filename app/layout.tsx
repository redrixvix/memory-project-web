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
  title: {
    default: "Memory Project — Capture Your Family's Stories",
    template: "%s | Memory Project",
  },
  description: "Write your family's stories and print them as beautiful hardcover books. Free to start. Preserve memories with text, photos, and audio for generations to come.",
  keywords: ["memory book", "family stories", "life story", "legacy book", "printed memory book", "family history", "keepsake book", "personal memoir"],
  authors: [{ name: "Memory Project" }],
  creator: "Memory Project",
  metadataBase: new URL('https://memoryproject.com'),
  openGraph: {
    title: "Memory Project — Write Your Family's Story. Print It to Last.",
    description: "A keepsake your family will read for generations. Free to start, printed books from $99.",
    url: "https://memoryproject.com",
    siteName: "Memory Project",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Project — Write Your Family's Story. Print It to Last.",
    description: "A keepsake your family will read for generations. Free to start, printed books from $99.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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