
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
    default: "Zeniva Travel | AI Travel Concierge USA — Luxury Trips & Custom Vacations",
    template: "%s | Zeniva Travel",
  },
  description:
    "Zeniva Travel is a US-based AI travel company (Delaware, New York, Virginia). Plan luxury trips, custom vacations, and group travel with Lina AI — your 24/7 AI travel concierge serving all 50 states and Canada.",
  keywords: [
    "Zeniva Travel",
    "travel agency USA",
    "travel agency New York",
    "travel agency Delaware",
    "travel agency Virginia",
    "luxury travel agency USA",
    "AI travel concierge",
    "AI travel planner USA",
    "custom vacation planner",
    "luxury trip planning",
    "all-inclusive vacations",
    "group travel USA",
    "yacht charter USA",
    "travel agency Canada",
    "best travel agency USA",
    "online travel agency",
    "plan a trip online",
    "Lina AI",
    "Zeniva Travel AI",
    "travel concierge online",
    "vacation planning service",
    "international travel agency",
  ],
  alternates: {
    canonical: "https://zenivatravel.com",
    languages: {
      "en-US": "https://zenivatravel.com",
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
    title: "Zeniva Travel | AI Travel Concierge USA — Luxury Trips & Custom Vacations",
    description:
      "US-based AI travel company. Lina AI plans your dream trip — luxury vacations, group travel, yacht charters. Serving all 50 states & Canada. Delaware incorporated, offices in New York & Virginia.",
    siteName: "Zeniva Travel",
    locale: "en_US",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "Zeniva Travel — AI Travel Concierge USA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva Travel | AI Travel Concierge USA",
    description:
      "Plan luxury trips with Lina AI. US-based travel agency (Delaware, NY, Virginia) serving all 50 states & Canada.",
    images: ["/branding/lina-avatar.png"],
  },
  icons: {
    icon: "/branding/logo.png",
    apple: "/branding/logo.png",
    shortcut: "/branding/logo.png",
  },
  category: "travel",
  classification: "Travel Agency",
  authors: [{ name: "Zeniva Travel", url: "https://zenivatravel.com" }],
  creator: "Zeniva Travel",
  publisher: "Zeniva Travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Ads Tag */}
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
        {/* Meta Pixel */}
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
        {/* JSON-LD Structured Data — Organization + TravelAgency */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": ["TravelAgency", "Organization"],
                "name": "Zeniva Travel",
                "legalName": "Zeniva Travel LLC",
                "url": "https://zenivatravel.com",
                "logo": "https://zenivatravel.com/branding/logo.png",
                "image": "https://zenivatravel.com/branding/lina-avatar.png",
                "description": "Zeniva Travel is a US-based AI travel company offering luxury trip planning, custom vacations, group travel, and yacht charters. Powered by Lina AI, our 24/7 AI concierge serves all 50 states and Canada.",
                "foundingDate": "2024",
                "foundingLocation": "Delaware, USA",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "US",
                  "addressRegion": "DE"
                },
                "areaServed": [
                  { "@type": "Country", "name": "United States" },
                  { "@type": "Country", "name": "Canada" }
                ],
                "serviceType": [
                  "Luxury Travel Planning",
                  "AI Travel Concierge",
                  "Custom Vacation Planning",
                  "Group Travel",
                  "Yacht Charters",
                  "All-Inclusive Vacations"
                ],
                "sameAs": [
                  "https://www.tiktok.com/@zeniva.travel"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["English", "French"],
                  "contactOption": "TollFree",
                  "areaServed": ["US", "CA"]
                },
                "hasMap": "https://zenivatravel.com/about"
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Zeniva Travel",
                "url": "https://zenivatravel.com",
                "description": "AI-powered luxury travel agency — USA & Canada",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://zenivatravel.com/chat?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
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
