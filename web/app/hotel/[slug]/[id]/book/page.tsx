import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import BookHotelClient from "./BookHotelClient";

const SITE = "https://www.zenivatravel.com";

async function fetchHotelMini(id: string): Promise<{ name?: string; city?: string; country?: string; photo?: string } | null> {
  try {
    const res = await fetch(
      `${SITE}/api/partners/liteapi/hotels/details?hotelId=${encodeURIComponent(id)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.ok) return null;
    return {
      name: json.name,
      city: json.city,
      country: json.country,
      photo: Array.isArray(json.photos) ? json.photos[0] : undefined,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hotel = await fetchHotelMini(id);
  return {
    title: hotel?.name ? `Book ${hotel.name} · Zeniva Travel` : "Book your stay · Zeniva Travel",
    robots: { index: false, follow: false },
  };
}

export default async function BookHotelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, id } = await params;
  const sp = await searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] || "" : "";
  };

  const hotel = await fetchHotelMini(id);
  if (!hotel || !hotel.name) notFound();

  const initial = {
    hotelId: id,
    hotelSlug: slug,
    hotelName: hotel.name,
    hotelLocation: [hotel.city, hotel.country].filter(Boolean).join(", "),
    hotelPhoto: hotel.photo || "",
    from: pick("from"),
    checkIn: pick("checkIn"),
    checkOut: pick("checkOut"),
    travelers: pick("travelers"),
    price: pick("price"),
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <BookHotelClient initial={initial} />
    </Suspense>
  );
}

export const revalidate = 3600;
