import { getAirbnbs } from '@/src/data/partners/airbnbs';
import Link from 'next/link';

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-80 w-full overflow-hidden">
            <img src={hero} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">Partner Airbnb</p>
                <h1 className="text-3xl font-black text-slate-900">{item.title}</h1>
                {item.location && <p className="text-slate-600 mt-1">{item.location}</p>}
              </div>
              <div className="flex gap-3">
                <Link href="/chat?prompt=Plan%20an%20Airbnb%20stay" className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">
                  Book with concierge
                </Link>
              </div>
            </div>

            {item.description && (
              <div className="mt-4 text-slate-700 text-sm leading-relaxed">{item.description}</div>
            )}
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <div key={i} className="h-40 rounded-xl overflow-hidden bg-slate-100">
                  <img src={img} alt={`${item.title} photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/airbnbs" className="inline-flex items-center px-4 py-2 rounded-full bg-white border text-sm font-semibold text-slate-800 shadow-sm">Back to Airbnbs</Link>
          <Link href="/chat?prompt=Plan%20an%20Airbnb%20stay" className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm font-semibold shadow">Plan with Lina</Link>
        </div>
      </div>
    </main>
  );
}
