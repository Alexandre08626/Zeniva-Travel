
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BackButton from "../src/components/BackButton.client";
import LinaAssistantDock from "../src/components/LinaAssistantDock";
import CookieConsent from "../src/components/legal/CookieConsent.client";
import PlatformOsTag from "../src/components/PlatformOsTag.client";

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
      <head>
        {/* Google Ads Tag - Replace G-XXXXXXX with your actual ID */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
            `}} />
          </>
        )}
        {/* Meta Pixel - Replace PIXEL_ID with your actual ID */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}} />
        )}
      </head>
      <body data-brand="blue" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <PlatformOsTag />
          <BackButton />
          <LinaAssistantDock />
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
