import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

interface HotelData {
  ok?: boolean;
  hotelId?: string;
  name?: string;
  photos?: string[];
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  rating?: number;
  stars?: number;
}

const SITE = "https://www.zenivatravel.com";

async function fetchHotel(id: string): Promise<HotelData | null> {
  try {
    const res = await fetch(
      `${SITE}/api/partners/liteapi/hotels/details?hotelId=${encodeURIComponent(id)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as HotelData;
    if (!json?.ok) return null;
    return json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const hotel = await fetchHotel(id);
  if (!hotel) {
    return {
      title: "Hotel · Zeniva Travel",
      description: "Discover this exclusive hotel selection by Zeniva Travel.",
    };
  }

  const locationParts = [hotel.city, hotel.country].filter(Boolean);
  const locationStr = locationParts.join(", ");
  const title = hotel.name
    ? `${hotel.name}${locationStr ? ` · ${locationStr}` : ""} · Zeniva Travel`
    : "Hotel · Zeniva Travel";
  const desc =
    (hotel.description && hotel.description.slice(0, 200)) ||
    `Exclusive hotel selected by Zeniva Travel${locationStr ? ` in ${locationStr}` : ""}. Contact us to book your stay.`;
  const ogImage = hotel.photos?.[0] || `${SITE}/branding/zeniva-og.jpg`;
  const url = `${SITE}/hotel/${slug}/${id}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      type: "website",
      siteName: "Zeniva Travel",
      images: [{ url: ogImage, width: 1200, height: 630, alt: hotel.name || "Hotel" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function HotelSharePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;
  const hotel = await fetchHotel(id);
  if (!hotel || !hotel.name) notFound();

  const photos = (hotel.photos || []).slice(0, 12);
  const hero = photos[0];
  const rest = photos.slice(1);
  const locationParts = [hotel.city, hotel.country].filter(Boolean);
  const locationStr = locationParts.join(", ");
  const stars = hotel.stars || hotel.rating || 0;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-[#0B1B4D]">
              ZENIVA <span className="text-[#E6B85A]">TRAVEL</span>
            </span>
          </a>
          <a
            href="/chat"
            className="text-xs font-bold text-[#0B1B4D] hover:text-[#0F6CF5] transition"
          >
            Get a quote →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {hero ? (
          <div className="relative w-full h-[420px] sm:h-[520px] bg-slate-200">
            <Image
              src={hero}
              alt={hotel.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <div className="max-w-5xl mx-auto">
                <span className="inline-block bg-[#E6B85A]/95 text-[#0B1B4D] text-[11px] font-black tracking-widest px-3 py-1 rounded-full mb-3">
                  ZENIVA TRAVEL · EXCLUSIVE
                </span>
                <h1 className="text-3xl sm:text-5xl font-black drop-shadow-lg leading-tight">
                  {hotel.name}
                </h1>
                {locationStr && (
                  <p className="mt-2 text-sm sm:text-base text-white/90 font-medium">
                    📍 {locationStr}
                  </p>
                )}
                {stars > 0 && (
                  <p className="mt-1 text-sm text-[#E6B85A] font-bold">
                    {"★".repeat(Math.round(stars))} <span className="text-white/70 font-normal">· {stars}/5</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#0F6CF5] to-[#0B1B4D] text-white py-16 px-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-black">{hotel.name}</h1>
            {locationStr && <p className="mt-3 text-white/85">📍 {locationStr}</p>}
          </div>
        )}
      </section>

      {/* Body */}
      <section className="max-w-5xl mx-auto px-5 py-10 space-y-10">
        {/* Description */}
        {hotel.description && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-3">
              About this hotel
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
            {hotel.address && (
              <p className="mt-4 text-sm text-slate-500">📍 {hotel.address}</p>
            )}
          </div>
        )}

        {/* Photo gallery */}
        {rest.length > 0 && (
          <div>
            <h2 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-4">
              Gallery ({photos.length} photos)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {rest.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200 shadow-sm"
                >
                  <Image
                    src={src}
                    alt={`${hotel.name} photo ${i + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition duration-500"
                    sizes="(min-width: 640px) 33vw, 50vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#0B1B4D] to-[#0F3A8A] rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg">
          <p className="text-[11px] font-black text-[#E6B85A] tracking-widest uppercase">
            Ready to book?
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black">
            Reserve {hotel.name}
          </h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto text-sm sm:text-base">
            Contact a Zeniva Travel agent for exclusive rates, custom packages, and concierge service.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/chat"
              className="px-7 py-3 rounded-full bg-[#E6B85A] text-[#0B1B4D] font-black text-sm hover:opacity-90 transition"
            >
              💬 Chat with our concierge
            </a>
            <a
              href="mailto:hello@zenivatravel.com"
              className="px-7 py-3 rounded-full bg-white/10 border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition"
            >
              ✉ hello@zenivatravel.com
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Powered by Zeniva Travel · zenivatravel.com
        </p>
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";
