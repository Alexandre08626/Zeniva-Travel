
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import HelpCenterButton from "../src/components/HelpCenterButton.client";
import BackButton from "../src/components/BackButton.client";

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
    default: "Zeniva Travel AI | Luxury Travel Concierge",
    template: "%s | Zeniva Travel AI",
  },
  description:
    "Zeniva Travel AI is a premium travel agency powered by Lina AI. Plan a luxury trip in minutes with AI‑curated flights, villas, resorts, yachts, and experiences—tailor‑made for you.",
  keywords: [
    "Zeniva Travel",
    "Zeniva Travel AI",
    "Lina AI",
    "AI travel planner",
    "AI trip planning",
    "plan a trip in minutes",
    "luxury travel agency",
    "custom travel planning",
    "travel concierge",
    "private villas",
    "luxury resorts",
    "yacht charter",
    "AI travel planner",
    "Lina AI",
  ],
  alternates: {
    canonical: "https://zenivatravel.com",
  },
  openGraph: {
    type: "website",
    url: "https://zenivatravel.com",
    title: "Zeniva Travel AI | Luxury Travel Concierge",
    description:
      "Plan a luxury trip in minutes with Lina AI—custom flights, villas, resorts, yachts, and curated experiences built around you.",
    siteName: "Zeniva Travel AI",
    images: [
      {
        url: "/branding/logo.png",
        width: 1200,
        height: 630,
        alt: "Zeniva Travel AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva Travel AI | Luxury Travel Concierge",
    description:
      "Plan a luxury trip in minutes with Lina AI—custom flights, villas, resorts, yachts, and curated experiences built around you.",
    images: ["/branding/logo.png"],
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
          <HelpCenterButton />
          {children}
        </Providers>
      </body>
    </html>
  );
}
