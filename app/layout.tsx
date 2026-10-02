import type { Metadata, Viewport } from "next";
import type React from "react";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ── Fonts ───────────────────────────────────────────────── */

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-bolt",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

/* ── Metadata ────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Kaziin — Find work. Go global. Hire talent.",
    template: "%s | Kaziin",
  },
  description:
    "A smarter way to connect people with opportunity — locally, remotely and across borders.",
  openGraph: {
    title: "Kaziin — Find work. Go global. Hire talent.",
    description:
      "A smarter way to connect people with opportunity — locally, remotely and across borders.",
    type: "website",
    siteName: "Kaziin",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

/* ── Root Layout ─────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232F6D53'/%3E%3Cpath d='M11 7 L11 25 M11 16 L21 7 M11 16 L21 25' stroke='%23F7F4EC' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
