import { getYcnPackages } from '@/src/data/partners/ycn';
import { getImagesForDestination } from '@/src/lib/images';
import Link from 'next/link';
import Image from 'next/image';
import YcnGallery from '@/src/components/YcnGallery.client';
import YachtRatePicker from '@/src/components/yachts/YachtRatePicker.client';
import AirbnbAvailability from '@/src/components/airbnbs/AirbnbAvailability.client';
import AddToProposalButton from '@/src/components/proposals/AddToProposalButton.client';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractSpecValue(specs: string | null | undefined, label: string) {
  if (!specs) return null;
  const match = specs.match(new RegExp(`(\\d+)\\s*${label}`, 'i'));
  return match?.[1] || null;
}

function extractSleeps(specs: string | null | undefined) {
  if (!specs) return null;
  const match = specs.match(/(\d+)\s*sleeps/i);
  return match?.[1] || null;
}

function parsePrice(label?: string) {
  if (!label) return null;
  const match = label.match(/\$\s*([0-9,.]+)/);
  if (!match) return null;
  return Number(match[1].replace(/,/g, '')) || null;
}

function isLocalImage(src: string) {
  return src.startsWith('/');
}

function isLocalYachtImage(src: string) {
  return src.startsWith('/yachts/');
}

export default async function YcnPartnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = getYcnPackages();
  const item = data.find((p: any) => slugify(p.title) === slug);

  if (!item) {
    return (
      <main className="min-h-screen p-10 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">Partner listing not found.</div>
      </main>
    );
  }

  const destinationKey = item.destination || item.title || 'yacht';
  const partnerImages = (item.images && item.images.length ? item.images : []).filter(Boolean);
  let gallery = Array.from(new Set([
    item.thumbnail,
    ...partnerImages,
    ...(partnerImages.length === 0 ? getImagesForDestination(destinationKey) : []),
  ].filter(Boolean))) as string[];

  // If the partner didn't provide images, try to fetch a gallery from the partner site (server-side)
  if (gallery.length < 3) {
    try {
      const partnerUrl = `https://ycn.miami/${slug}`;
      const resp = await fetch(partnerUrl, { method: 'GET' });
      if (resp.ok) {
        const html = await resp.text();
        // crude but effective extraction of <img src="...">
        const matches = Array.from(html.matchAll(/<img[^>]+src=['"]([^'"\s>]+)['"]/gi)).map((m) => m[1]);
        const unique = Array.from(new Set(matches));
        const normalized = unique
          .map((src) => {
            try {
              return new URL(src, 'https://ycn.miami').toString();
            } catch (e) {
              return null;
            }
          })
          .filter((s): s is string => Boolean(s))
          .filter((s) => /\.(jpe?g|png|webp|avif)(\?|$)/i.test(s));
        const cleaned = normalized.slice(0, 12);
        if (cleaned.length > 0) {
          gallery = Array.from(new Set([...gallery, ...cleaned]));
        }
      }
    } catch (e) {
      console.log('Failed to fetch partner images from ycn.miami for', slug, e);
    }
  }

  const hero = gallery[0] || '/branding/icon-proposals.svg';
  const hoursParam = typeof resolvedSearchParams?.hours === "string" ? resolvedSearchParams.hours : undefined;
  const priceParam = typeof resolvedSearchParams?.price === "string" ? resolvedSearchParams.price : undefined;
  const noteParam = typeof resolvedSearchParams?.note === "string" ? resolvedSearchParams.note : undefined;
  const bookNowQuery = new URLSearchParams();
  bookNowQuery.set("yacht", item.title);
  if (hoursParam) bookNowQuery.set("hours", hoursParam);
  if (priceParam) bookNowQuery.set("price", priceParam);
  if (noteParam) bookNowQuery.set("note", noteParam);
  const bookNowHref = bookNowQuery.toString() ? `/payment?${bookNowQuery.toString()}` : "/payment";

  const specs = item.specs || '';
  const beds = extractSpecValue(specs, 'beds');
  const baths = extractSpecValue(specs, 'baths');
  const sleeps = extractSleeps(specs);
  const gridImages = gallery.length > 0 ? gallery : [hero];
  while (gridImages.length < 5) gridImages.push(hero);

  const baseRateLabel = (item.prices || [])[0] || '';
  const parsedBasePrice = parsePrice(baseRateLabel) || 0;
  const selectedHours = hoursParam ? Number(hoursParam) : (baseRateLabel.match(/(\d+)\s*hrs?/i)?.[1] ? Number(baseRateLabel.match(/(\d+)\s*hrs?/i)?.[1]) : 4);
  const selectedPrice = priceParam ? Number(priceParam) : parsedBasePrice;
  const fees = 150;
  const taxes = Math.round(selectedPrice * 0.08);
  const total = selectedPrice + fees + taxes;

  const storageKey = `yachtDates:${slug}`;
  const selectedPriceLabel = selectedPrice ? `$${selectedPrice}` : baseRateLabel || undefined;
  const charterLabel = `${selectedHours} hours charter`;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-center justify-between text-sm">
          <Link href="/yachts" className="text-blue-700 font-semibold">Back to yachts</Link>
          <div className="flex items-center gap-2">
            <Link href="/chat?prompt=Plan%20a%20yacht%20charter" className="flex items-center gap-3 rounded-full border border-blue-200 bg-white px-3 py-2 shadow-sm hover:bg-blue-50 transition">
              <Image src="/branding/lina-avatar.png" alt="Lina" width={64} height={64} sizes="64px" quality={100} className="rounded-full ring-2 ring-blue-200" />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Lina AI</p>
                <p className="text-[11px] font-semibold text-blue-700">Concierge option</p>
              </div>
            </Link>
            <button className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">Share</button>
            <button className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">Save</button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Zeniva travel</p>
          <h1 className="text-3xl font-black text-slate-900">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">4.92 · 41 reviews</span>
            <span>· Superhost</span>
            {item.destination && <span>· {item.destination}</span>}
          </div>
          {item.specs && <p className="text-sm text-slate-600">{item.specs}</p>}
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 rounded-3xl overflow-hidden">
          <div className="lg:col-span-2 lg:row-span-2 h-80 lg:h-full">
            {isLocalYachtImage(gridImages[0]) ? (
              <img
                src={gridImages[0]}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <Image
                src={gridImages[0]}
                alt={item.title}
                width={1200}
                height={900}
                unoptimized={isLocalImage(gridImages[0])}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />
            )}
          </div>
          {gridImages.slice(1, 5).map((img, i) => (
            <div key={i} className="h-40 lg:h-full">
              {isLocalYachtImage(img) ? (
                <img
                  src={img}
                  alt={`${item.title} photo ${i + 2}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Image
                  src={img}
                  alt={`${item.title} photo ${i + 2}`}
                  width={800}
                  height={600}
                  unoptimized={isLocalImage(img)}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 1024px) 20vw, 100vw"
                />
              )}
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-blue-100 bg-white p-6">
          <p className="text-lg font-bold text-slate-900">
            Yacht charter in {item.destination || "your destination"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {`${sleeps ? `${sleeps} guests` : "Up to 6 guests"}${beds ? ` · ${beds} beds` : ""}${baths ? ` · ${baths} baths` : ""}`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">4.92</span>
            <span>· 41 reviews</span>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">About this yacht</h2>
                  <p className="text-sm text-blue-700">Hosted by Zeniva Concierge</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Verified</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                {item.specs || "Yacht charter with full crew, tailored route, and concierge service."}
              </p>
            </section>

            {item.amenities && item.amenities.length > 0 && (
              <section className="rounded-2xl border border-blue-100 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">Included</h3>
                <ul className="mt-3 space-y-1 text-sm text-blue-800">
                  {item.amenities.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Rates</h3>
              <ul className="mt-3 space-y-1 text-sm text-blue-800">
                {(item.prices || []).map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </section>

            <AirbnbAvailability storageKey={storageKey} />

          </div>

          <aside className="space-y-4">
            <div className="sticky top-24 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900">${selectedPrice || 0}</p>
                  <p className="text-xs text-blue-700">{selectedHours} hours · taxes included</p>
                </div>
                <div className="text-xs text-blue-700 font-semibold">4.92 · 41</div>
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-white p-3">
                <p className="text-xs font-semibold text-blue-700">Quick price</p>
                <div className="mt-2">
                  <YachtRatePicker rates={item.prices || []} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>{selectedHours} hours charter</span>
                  <span>${selectedPrice || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Port & cleaning</span>
                  <span>${fees}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Taxes</span>
                  <span>${taxes}</span>
                </div>
                <div className="border-t border-blue-200 pt-3 flex items-center justify-between text-sm font-bold text-slate-900">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              {noteParam && (
                <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 text-xs text-blue-700">
                  Note: {noteParam}
                </div>
              )}

              <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 text-xs text-blue-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Secure payment</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Stripe verified</span>
                </div>
                <p>Payments are encrypted and processed by Stripe. Your card details are never stored on Zeniva servers.</p>
                <div className="flex items-center gap-2 text-[10px] font-semibold">
                  <span className="rounded-md border border-blue-200 bg-white px-2 py-1">VISA</span>
                  <span className="rounded-md border border-blue-200 bg-white px-2 py-1">Mastercard</span>
                  <span className="rounded-md border border-blue-200 bg-white px-2 py-1">Amex</span>
                  <span className="rounded-md border border-blue-200 bg-white px-2 py-1">Apple Pay</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <AddToProposalButton
                  title={item.title}
                  destination={item.destination || ""}
                  accommodationType="Yacht"
                  style="Yacht charter"
                  price={selectedPriceLabel}
                  image={hero}
                  images={gallery}
                  description={item.specs || undefined}
                  specs={item.specs || undefined}
                  amenities={item.amenities || []}
                  roomLabel={charterLabel}
                  datesStorageKey={storageKey}
                  className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-900"
                />
                <Link href={bookNowHref} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-700 text-white py-3.5 text-sm font-semibold shadow-lg shadow-blue-200/60 hover:bg-blue-800 transition">
                  Book
                </Link>
              </div>
              <a
                href={`/chat/agent?channel=agent-jason&listing=${encodeURIComponent(item.title)}&source=${encodeURIComponent(`/partners/ycn/${slug}`)}`}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 text-blue-700 py-3 text-sm font-semibold hover:bg-blue-50 transition"
              >
                Message agent
              </a>
              <p className="mt-3 text-center text-xs text-blue-700">You won’t be charged yet</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
