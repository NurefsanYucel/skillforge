import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load Geist Sans font and assign it to a CSS variable
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load Geist Mono font (useful for code or monospace text)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata used by Next.js for SEO and browser tab info
export const metadata: Metadata = {
  title: "SkillForge",
  description: "Learning tracker app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Root HTML structure for the entire app
    <html lang="en">
      <body
        // Apply custom fonts and base styling
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        {/* All pages will be rendered here */}
        {children}
      </body>
    </html>
  );
}