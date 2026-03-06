
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BackButton from "../src/components/BackButton.client";
import LinaAssistantDock from "../src/components/LinaAssistantDock";
import CookieConsent from "../src/components/legal/CookieConsent.client";
import PlatformOsTag from "../src/components/PlatformOsTag.client";
import PWAInstallBanner from "../src/components/PWAInstallBanner.client";

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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },
  category: "travel",
  classification: "Travel Agency",
  authors: [{ name: "Zeniva Travel", url: "https://zenivatravel.com" }],
  creator: "Zeniva Travel",
  publisher: "Zeniva Travel",
  verification: {
    google: "9jSvDefvtj_0Fc0IsCwsdOz1Qdmw71P8qF1ekQfCgjQ",
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
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Zeniva Travel" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Zeniva" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0B1B4D" />
        <meta name="msapplication-TileColor" content="#0B1B4D" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `}} />
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
        {/* JSON-LD Structured Data — TravelAgency + Organization + WebSite + FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": ["TravelAgency", "Organization"],
                "name": "Zeniva Travel",
                "legalName": "Zeniva Travel LLC",
                "url": "https://www.zenivatravel.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.zenivatravel.com/branding/logo.png",
                  "width": 200,
                  "height": 60
                },
                "image": "https://www.zenivatravel.com/branding/lina-avatar.png",
                "description": "Zeniva Travel is a US-based AI travel company offering luxury trip planning, custom vacations, group travel, and yacht charters. Powered by Lina AI, our 24/7 AI concierge serves all 50 states and Canada.",
                "foundingDate": "2024",
                "foundingLocation": {
                  "@type": "Place",
                  "name": "Delaware, USA"
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "US",
                  "addressRegion": "DE",
                  "addressLocality": "Wilmington"
                },
                "areaServed": [
                  { "@type": "Country", "name": "United States" },
                  { "@type": "Country", "name": "Canada" }
                ],
                "priceRange": "$$-$$$$",
                "currenciesAccepted": "USD, CAD",
                "paymentAccepted": "Credit Card, Debit Card",
                "openingHours": "Mo-Su 00:00-24:00",
                "serviceType": [
                  "Luxury Travel Planning",
                  "AI Travel Concierge",
                  "Custom Vacation Planning",
                  "Group Travel",
                  "Yacht Charters",
                  "All-Inclusive Vacations",
                  "Flight Booking",
                  "Hotel Booking",
                  "Transfer Services",
                  "Travel Packages"
                ],
                "sameAs": [
                  "https://www.tiktok.com/@zeniva.travel",
                  "https://zenivatravel.com",
                  "https://zeniva.ca"
                ],
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "email": "info@zeniva.ca",
                    "contactType": "customer service",
                    "availableLanguage": ["English", "French", "Spanish"],
                    "areaServed": ["US", "CA"]
                  }
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "reviewCount": "47",
                  "bestRating": "5"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Zeniva Travel",
                "url": "https://www.zenivatravel.com",
                "description": "AI-powered luxury travel agency — USA & Canada",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.zenivatravel.com/chat?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is Zeniva Travel?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Zeniva Travel is a US-based AI travel agency incorporated in Delaware. We use Lina AI, our 24/7 artificial intelligence concierge, to plan luxury vacations, custom trips, group travel, and yacht charters for clients across all 50 US states and Canada."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How does Lina AI work?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Lina is Zeniva Travel's AI travel concierge. You simply describe your trip — destination, dates, budget, preferences — and Lina instantly builds a complete travel proposal including flights, hotels, transfers, and experiences. Available 24/7 via chat or voice call."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Does Zeniva Travel offer yacht charters?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. Zeniva Travel offers private yacht charters and sailing trips worldwide. Our expert yacht brokers validate every booking. Visit zenivatravel.com/yachts for more information."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What destinations does Zeniva Travel serve?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Zeniva Travel serves 200+ destinations worldwide including Cancún, Maldives, Bali, Dubai, Paris, Miami, Tokyo, Santorini, Caribbean, and more. We specialize in luxury vacations and all-inclusive packages for US and Canadian travelers."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is Zeniva Travel available in French?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. Zeniva Travel is fully bilingual. Lina AI and all our services are available in English and French. Visit zenivatravel.com/fr for the French version of our website."
                    }
                  }
                ]
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
          <PWAInstallBanner />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
