import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from "../src/components/legal/CookieConsent.client";
import PlatformOsTag from "../src/components/PlatformOsTag.client";
import PWAPromptAfterLogin from "../src/components/PWAPromptAfterLogin.client";
import WelcomeBanner from "../src/components/WelcomeBanner.client";
import PushNotifManager from "../src/components/PushNotifManager.client";
import HelpCenterButton from "../src/components/HelpCenterButton.client";
import ClientLayoutShell from "../src/components/ClientLayoutShell.client";



const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://zenivatravel.com"),
  title: {
    default: "Zeniva | AI Travel Concierge USA — Luxury Trips & Custom Vacations",
    template: "%s | Zeniva",
  },
  description:
    "Zeniva is a US-based AI travel company (Delaware, New York, Virginia). Plan luxury trips, custom vacations, and group travel with Lina AI — your 24/7 AI travel concierge serving all 50 states and Canada.",
  keywords: [
    "Zeniva",
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
    "Zeniva",
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
    title: "Zeniva | AI Travel Concierge USA — Luxury Trips & Custom Vacations",
    description:
      "US-based AI travel company. Lina AI plans your dream trip — luxury vacations, group travel, yacht charters. Serving all 50 states & Canada. Delaware incorporated, offices in New York & Virginia.",
    siteName: "Zeniva",
    locale: "en_US",
    images: [
      {
        url: "/api/og?title=Zeniva+%E2%80%94+AI+Travel+Concierge&description=Plan+luxury+trips+with+Lina+AI.+Serving+USA+%26+Canada+24/7.",
        width: 1200,
        height: 630,
        alt: "Zeniva — AI Travel Concierge USA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva | AI Travel Concierge USA",
    description:
      "Plan luxury trips with Lina AI. US-based travel agency (Delaware, NY, Virginia) serving all 50 states & Canada.",
    images: ["/api/og?title=Zeniva+%E2%80%94+AI+Travel+Concierge&description=Plan+luxury+trips+with+Lina+AI.+Serving+USA+%26+Canada+24/7."],
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
  authors: [{ name: "Zeniva", url: "https://zenivatravel.com" }],
  creator: "Zeniva",
  publisher: "Zeniva",
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
        <meta name="application-name" content="Zeniva" />
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
        {/* JSON-LD Structured Data — Zeniva Group umbrella + TravelAgency/Organization + WebSite (site FAQ lives in app/page.tsx) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                // Umbrella entity — same @id is declared on zenipay.ca, zeniva.ca and zenitech.dev
                // so AI engines resolve all brands to one parent instead of confusing them.
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://www.zeniva.ca/#group",
                "name": "Zeniva Group",
                "alternateName": ["Groupe Zeniva"],
                "url": "https://www.zeniva.ca/groupe",
                "description": "Zeniva Group (Groupe Zeniva) is the parent group founded by Alexandre Blais. It operates Zeniva Travel (AI travel agency, USA), ZeniPay (fintech / online banking, Canada & USA), ZeniCorp (construction and renovation platform with an RBQ-certified contractor network, Quebec) and ZeniTech (technology division).",
                "founder": { "@id": "https://www.zenivatravel.com/alexandre-blais#person" },
                "subOrganization": [
                  { "@id": "https://www.zenivatravel.com/#organization" },
                  { "@id": "https://zenipay.ca/#organization" },
                  { "@id": "https://www.zeniva.ca/#organization" },
                  { "@id": "https://zenitech.dev/#organization" }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": ["TravelAgency", "Organization"],
                "@id": "https://www.zenivatravel.com/#organization",
                "name": "Zeniva Travel",
                "alternateName": ["Zeniva", "Zeniva Travel AI"],
                "legalName": "Zeniva LLC",
                "url": "https://www.zenivatravel.com",
                "parentOrganization": { "@id": "https://www.zeniva.ca/#group" },
                "founder": { "@id": "https://www.zenivatravel.com/alexandre-blais#person" },
                "brand": [
                  {
                    "@type": "Brand",
                    "@id": "https://www.zenivatravel.com/zeniyacht#brand",
                    "name": "ZeniYacht",
                    "url": "https://www.zenivatravel.com/zeniyacht",
                    "description": "Zeniva Travel's private yacht charter and sailing division."
                  },
                  {
                    "@type": "Brand",
                    "@id": "https://www.zenivatravel.com/ai-travel-concierge#brand",
                    "name": "Lina AI",
                    "url": "https://www.zenivatravel.com/ai-travel-concierge",
                    "description": "Zeniva Travel's 24/7 AI travel concierge that plans trips, builds proposals and answers by chat or voice."
                  }
                ],
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.zenivatravel.com/branding/logo.png",
                  "width": 200,
                  "height": 60
                },
                "image": "https://www.zenivatravel.com/branding/lina-avatar.png",
                "description": "Zeniva is a US-based AI travel company offering luxury trip planning, custom vacations, group travel, and yacht charters. Powered by Lina AI, our 24/7 AI concierge serves all 50 states and Canada.",
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
                  "ZeniTransfers",
                  "Travel Packages"
                ],
                // Only external profiles of THIS brand. zeniva.ca is now ZeniCorp (construction) —
                // listing it here made AI engines merge the travel agency with the contractor network.
                "sameAs": [
                  "https://www.tiktok.com/@zeniva.travel",
                  "https://www.instagram.com/zeniva_lina/",
                  "https://www.facebook.com/61557743041715"
                ],
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "email": "info@zeniva.ca",
                    "contactType": "customer service",
                    "availableLanguage": ["English", "French", "Spanish"],
                    "areaServed": ["US", "CA"]
                  }
                ]
                // No aggregateRating here on purpose. Self-declared review markup with no
                // verifiable reviews behind it is ignored by Google, flagged by AI answer
                // engines as an unsupported claim, and counts as a deceptive review claim
                // under US FTC rules. Re-add it only when it is generated from real reviews
                // (Google Business, Trustpilot) — with individual Review nodes to match.
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://www.zenivatravel.com/#website",
                "name": "Zeniva Travel",
                "url": "https://www.zenivatravel.com",
                "publisher": { "@id": "https://www.zenivatravel.com/#organization" },
                "inLanguage": ["en-US", "fr-CA"],
                "description": "AI-powered luxury travel agency — USA & Canada",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.zenivatravel.com/chat?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-JB30PQXZD1"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JB30PQXZD1', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <body data-brand="blue" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <PlatformOsTag />
          
          
          <PushNotifManager />
          
          <ClientLayoutShell />
          <HelpCenterButton />
          <PWAPromptAfterLogin />
          <WelcomeBanner />
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
