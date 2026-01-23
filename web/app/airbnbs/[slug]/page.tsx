import { getAirbnbs } from '@/src/data/partners/airbnbs';
import Link from 'next/link';
import Image from 'next/image';
import AirbnbAvailability from '@/src/components/airbnbs/AirbnbAvailability.client';
import AirbnbBookingSummary from '@/src/components/airbnbs/AirbnbBookingSummary.client';
import AddToProposalButton from '@/src/components/proposals/AddToProposalButton.client';
import { formatCurrencyAmount, normalizeListingTitle, normalizePetFriendly } from '@/src/lib/format';

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractField(description: string, label: string) {
  if (!description) return null;
  const re = new RegExp(`${label}\\s*\\n+\\s*([^\\n]+)`, 'i');
  const match = description.match(re);
  return match?.[1]?.trim() || null;
}

function cleanDescription(description: string) {
  if (!description) return '';
  const withoutHeader = description.replace(/Property Description\s*/i, '');
  const beforeContact = withoutHeader.split('Contact Agent')[0];
  const beforeDetails = beforeContact.split('Property Details')[0];
  const cleaned = normalizePetFriendly(beforeDetails.replace(/\n{3,}/g, '\n\n').trim());
  return cleaned.length < 40 ? 'Curated boutique stay with Zeniva concierge support.' : cleaned;
}


export default async function AirbnbDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getAirbnbs();
  const item = data.find((p: any) => (p.id && p.id === slug) || slugify(p.title) === slug);

  if (!item) {
    return (
      <main className="min-h-screen p-10 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">Residence not found.</div>
      </main>
    );
  }

  const gallery = [item.thumbnail, ...(item.images || [])].filter(Boolean) as string[];
  const hero = gallery[0] || '/branding/icon-proposals.svg';
  const gridImages = [...gallery];
  while (gridImages.length < 5) gridImages.push(hero);

  const displayTitle = normalizeListingTitle(item.title || 'Residence');

  const propertyType = extractField(item.description || '', 'Property Type');
  const bedrooms = extractField(item.description || '', 'Bedrooms');
  const bathrooms = extractField(item.description || '', 'Bathrooms');
  const propertyLocation = extractField(item.description || '', 'Property Location') || item.location || '';
  const metaLine = [
    propertyType || 'Private stay',
    bedrooms ? `${bedrooms} bedroom${bedrooms === '1' ? '' : 's'}` : null,
    bathrooms ? `${bathrooms} bath${bathrooms === '1' ? '' : 's'}` : null,
  ].filter(Boolean).join(' · ');
  const descriptionText = cleanDescription(item.description || '');
  const pricePerNight = 980;
  const storageKey = `airbnbDates:${slug}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-center justify-between text-sm">
          <Link href="/airbnbs" className="text-blue-700 font-semibold">Back to Airbnbs</Link>
          <div className="flex items-center gap-2">
            <Link href="/chat?prompt=Plan%20an%20Airbnb%20stay" className="flex items-center gap-3 rounded-full border border-blue-200 bg-white px-3 py-2 shadow-sm hover:bg-blue-50 transition">
              <Image src="/branding/lina-avatar.png" alt="Lina" width={64} height={64} sizes="64px" quality={100} className="rounded-full ring-2 ring-blue-200" />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Lina AI</p>
                <p className="text-[11px] font-semibold text-blue-700">VIP concierge option</p>
              </div>
            </Link>
            <button className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">Share</button>
            <button className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">Save</button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Zeniva travel</p>
          <h1 className="text-3xl font-black text-slate-900">{displayTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">4.94 · 87 reviews</span>
            <span>· Superhost</span>
            {propertyLocation && <span>· {propertyLocation}</span>}
          </div>
          <p className="text-sm text-slate-600">{metaLine}</p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 rounded-3xl overflow-hidden">
          <div className="lg:col-span-2 lg:row-span-2 h-80 lg:h-full">
            <Image
              src={gridImages[0]}
              alt={displayTitle}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
          </div>
          {gridImages.slice(1, 5).map((img, i) => (
            <div key={i} className="h-40 lg:h-full">
              <Image
                src={img}
                alt={`${displayTitle} photo ${i + 2}`}
                width={800}
                height={600}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 20vw, 100vw"
              />
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-blue-100 bg-white p-6">
          <p className="text-lg font-bold text-slate-900">
            {propertyType ? `Entire ${propertyType.toLowerCase()}` : "Entire guest suite"} in {propertyLocation || "your destination"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {`2 guests${bedrooms ? ` · ${bedrooms} ${bedrooms === "1" ? "bedroom" : "bedrooms"}` : " · Studio"}${bathrooms ? ` · ${bathrooms} ${bathrooms === "1" ? "bath" : "baths"}` : " · 1 bath"}`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">4.94</span>
            <span>· 87 reviews</span>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">About this place</h2>
                  <p className="text-sm text-blue-700">Hosted by Zeniva Concierge</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Verified</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {descriptionText || "Curated boutique stay with Zeniva concierge support."}
              </p>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">What this place offers</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-blue-800">
                <span>• Ocean view</span>
                <span>• Private pool</span>
                <span>• Concierge check‑in</span>
                <span>• Fast Wi‑Fi</span>
                <span>• Full kitchen</span>
                <span>• Daily housekeeping</span>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Where you’ll sleep</h3>
              <p className="mt-2 text-sm text-slate-700">{bedrooms ? `${bedrooms} bedroom` : "Private suite"} with premium linens and resort amenities.</p>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Location</h3>
              <p className="mt-2 text-sm text-blue-800">Address shared after final reservation.</p>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Reviews</h3>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <p>“Perfect stay, Zeniva team handled everything smoothly.” — Camille</p>
                <p>“Stunning views and the concierge was super responsive.” — Marc</p>
              </div>
            </section>

            <AirbnbAvailability storageKey={storageKey} />
          </div>

          <div className="space-y-3">
            <AirbnbBookingSummary
              pricePerNight={pricePerNight}
              storageKey={storageKey}
              propertyName={displayTitle}
              sourcePath={`/airbnbs/${slug}`}
              beforeBook={
                <AddToProposalButton
                  title={displayTitle}
                  destination={propertyLocation || item.location || ""}
                  accommodationType="Airbnb"
                  style="Private residence"
                  price={`${formatCurrencyAmount(pricePerNight, "USD")}/night`}
                  image={hero}
                  images={gallery}
                  description={descriptionText}
                  roomLabel={propertyType ? `${propertyType} stay` : "Residence"}
                  datesStorageKey={storageKey}
                  className="w-full rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
                />
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
