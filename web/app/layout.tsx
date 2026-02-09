
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BackButton from "../src/components/BackButton.client";
import LinaAssistantDock from "../src/components/LinaAssistantDock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zenivatravel.com"),
  title: {
    default: "Zeniva Travel AI | AI Travel Concierge",
    template: "%s | Zeniva Travel AI",
  },
  description:
    "Zeniva Travel AI is powered by Lina AI. Discover intent, build intelligent trip proposals, and finalize with human concierge support.",
  keywords: [
    "Zeniva Travel",
    "Zeniva Travel AI",
    "Lina AI",
    "AI travel planner",
    "AI trip planning",
    "plan a trip in minutes",
    "custom travel planning",
    "travel concierge",
    "yacht charter",
    "AI travel planner",
    "Lina AI",
  ],
  alternates: {
    canonical: "https://zenivatravel.com",
    languages: {
      "en-CA": "https://zenivatravel.com",
      "fr-CA": "https://zenivatravel.com/fr",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://zenivatravel.com",
    title: "Zeniva Travel AI | AI Travel Concierge",
    description:
      "Plan trips with Lina AI—intent discovery, intelligent proposals, and human concierge validation.",
    siteName: "Zeniva Travel AI",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "Lina AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva Travel AI | AI Travel Concierge",
    description:
      "Plan trips with Lina AI—intent discovery, intelligent proposals, and human concierge validation.",
    images: ["/branding/lina-avatar.png"],
  },
  icons: {
    icon: "/branding/logo.png",
    apple: "/branding/logo.png",
    shortcut: "/branding/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-brand="blue" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <BackButton />
          <LinaAssistantDock />
          {children}
        </Providers>
      </body>
    </html>
  );
}
