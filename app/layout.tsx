import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "@uploadthing/react/styles.css";
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
    default: "Memory Project — Write Your Family's Story. Print It to Last.",
    template: "%s | Memory Project",
  },
  description: "Capture the stories that matter most. Free to write unlimited text memories — forever. Add photos, voice, and print a beautiful hardcover book from $99.",
  keywords: ["memory book", "family stories", "life story book", "family memory book", "printed memory book", "legacy book", "keepsake book", "personal memoir", "hardcover book", "family history book"],
  authors: [{ name: "Memory Project" }],
  creator: "Memory Project",
  metadataBase: new URL('https://web-redrixvixs-projects.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Memory Project — Write Your Family's Story. Print It to Last.",
    description: "Free to start. Unlimited text memories — forever. Add photos and voice, print a beautiful hardcover book from $99.",
    url: "https://web-redrixvixs-projects.vercel.app",
    siteName: "Memory Project",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memory Project — A keepsake your family will read for generations.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Project — Write Your Family's Story. Print It to Last.",
    description: "Free to start. Unlimited text memories — forever. Add photos and voice, print a beautiful hardcover book from $99.",
    images: ["/og-image.png"],
    creator: "@memoryproject",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'><path d='M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z' fill='%23D4A373' fill-opacity='0.5'/><path d='M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z' fill='%23D4A373'/></svg>",
        type: "image/svg+xml",
      },
    ],
    apple: [{ url: "/favicon.png" }],
  },
  referrer: 'origin-when-cross-origin',
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false },
  other: { "theme-color": "#FDF8EE" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, lora.variable)}>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
          style={{ backgroundColor: 'var(--charcoal)', color: 'var(--cornsilk)' }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
