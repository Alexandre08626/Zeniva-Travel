export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZeniStay — Luxury Villas & Vacation Rentals | Zeniva",
  description:
    "Book luxury ZeniStay villas, private homes, and premium vacation rentals worldwide through Zeniva. Curated properties in top destinations — planned by Zeniva AI.",
  keywords: [
    "ZeniStay",
    "luxury ZeniStays USA",
    "private villas vacation rental",
    "luxury Airbnb USA",
    "vacation homes worldwide",
    "villa rental Caribbean",
    "luxury apartments rental",
    "best vacation rentals 2025",
    "private homes USA",
    "Zeniva rentals",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/zenistay",
  },
  openGraph: {
    title: "ZeniStay — Luxury Villas & Vacation Rentals | Zeniva",
    description: "Premium vacation homes, private villas & luxury rentals worldwide. Curated by Zeniva AI.",
    url: "https://www.zenivatravel.com/zenistay",
    siteName: "Zeniva",
    type: "website",
    images: [{ url: "/api/og?title=ZeniStay&description=Luxury+Villas+%26+Vacation+Rentals+Worldwide&type=zenistay", width: 1200, height: 630, alt: "ZeniStay — Luxury Villas & Vacation Rentals" }],
  },
};

export default function ZeniStayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
