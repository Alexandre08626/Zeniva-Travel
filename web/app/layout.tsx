
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
    "Zeniva Travel AI is a premium travel agency and concierge. We design custom trips, private villa stays, luxury resorts, yacht charters, and curated experiences—powered by Lina AI for faster, smarter planning.",
  keywords: [
    "Zeniva Travel",
    "Zeniva Travel AI",
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
      "Custom-made journeys with private villas, luxury resorts, yacht charters, and curated experiences—planned by Lina AI and our expert travel team.",
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
      "Custom-made journeys with private villas, luxury resorts, yacht charters, and curated experiences—planned by Lina AI and our expert travel team.",
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
