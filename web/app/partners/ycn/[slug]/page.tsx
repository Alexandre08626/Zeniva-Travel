import { getYcnPackages } from '@/src/data/partners/ycn';
import { getImagesForDestination } from '@/src/lib/images';
import Link from 'next/link';
import Image from 'next/image';
import YcnGallery from '@/src/components/YcnGallery.client';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function YcnPartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-80 w-full overflow-hidden">
            <Image
              src={hero}
              alt={item.title}
              width={1400}
              height={640}
              className="h-full w-full object-cover"
              sizes="(min-width: 1200px) 1200px, 100vw"
              priority
            />
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">Yacht Charter</p>
                <h1 className="text-3xl font-black text-slate-900">{item.title}</h1>
                {item.destination && <p className="text-slate-600 mt-1">{item.destination}</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                {item.calendar && (
                  <a href={item.calendar} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 rounded-full bg-white border text-sm font-semibold text-slate-800 shadow-sm">
                    Availability
                  </a>
                )}
                <Link href="/payment" className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
                  Book now
                </Link>
                <Link href="/chat?prompt=Plan%20a%20yacht%20charter" className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
                  Book with concierge
                </Link>
              </div>
            </div>

            {item.specs && (
              <div className="mt-4 text-slate-700 text-sm">{item.specs}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Rates</h3>
                <ul className="space-y-1 text-slate-700">
                  {(item.prices || []).map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              {item.amenities && item.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Included</h3>
                  <ul className="space-y-1 text-slate-700">
                    {item.amenities.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Client-side gallery: allows requesting partner photos when missing */}
          <YcnGallery initialGallery={gallery} slug={slug} />
        </div>

        <div className="flex gap-3">
          <Link href="/yachts" className="inline-flex items-center px-4 py-2 rounded-full bg-white border text-sm font-semibold text-slate-800 shadow-sm">Back to yachts</Link>
          <Link href="/chat?prompt=Plan%20a%20yacht%20charter" className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">Plan with Lina</Link>
        </div>
      </div>
    </main>
  );
}
