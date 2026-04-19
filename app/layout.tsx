import type { Metadata } from "next";
import { Lora, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`min-h-screen antialiased ${lora.variable}`} style={{ fontFamily: "var(--font-lora), 'Lora', Georgia, serif" }}>{children}</body>
    </html>
  );
}