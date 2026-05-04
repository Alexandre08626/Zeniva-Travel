export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Resort Partners — All-Inclusive Hotels & 5-Star Resorts | Zeniva USA",
  description:
    "Discover Zeniva's curated collection of 5-star resorts and all-inclusive hotels worldwide. Exclusive rates on luxury properties in Cancún, Maldives, Bali, Dubai, Caribbean & more. Book with Lina AI.",
  keywords: [
    "luxury resorts USA",
    "best all-inclusive resorts 2025",
    "5 star hotels booking",
    "luxury hotel deals USA",
    "Cancun all-inclusive resorts",
    "Maldives luxury resort",
    "Caribbean resort packages",
    "Bali luxury hotels",
    "Dubai 5 star hotels",
    "best technology platform resorts",
    "Zeniva resorts",
    "all-inclusive vacation packages",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/partners/resorts",
    languages: {
      "en-US": "https://www.zenivatravel.com/partners/resorts",
      "fr-CA": "https://www.zenivatravel.com/fr/partners/resorts",
    },
  },
  openGraph: {
    title: "Luxury Resort Partners — All-Inclusive Hotels & 5-Star Resorts | Zeniva",
    description:
      "Exclusive access to 5-star resorts worldwide. All-inclusive Cancún, Maldives, Caribbean, Dubai & more. Booked by Lina AI, your personal travel concierge.",
    url: "https://www.zenivatravel.com/partners/resorts",
    siteName: "Zeniva",
    type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva Luxury Resorts" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Resort Partners | Zeniva USA",
    description: "5-star resorts worldwide — Cancún, Maldives, Dubai, Caribbean. Book with Lina AI 24/7.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function ResortsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
