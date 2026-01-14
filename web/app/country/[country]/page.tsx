import Link from "next/link";
import PACKAGES from "@/src/data/packages";
import { getImagesForDestination } from "@/src/lib/images";

const destinationToCountry: Record<string, string> = {
  Paris: 'france',
  'French Riviera': 'france',
  Nice: 'france',
  Rome: 'italy',
  Tuscany: 'italy',
  Bali: 'indonesia',
  Maldives: 'maldives',
  Santorini: 'greece',
  Dubai: 'uae',
  Tokyo: 'japan',
  Kenya: 'kenya',
  "New York": 'usa',
  'Hawaii': 'usa',
  'Costa Rica': 'costa-rica',
  'Portugal': 'portugal'
};

export default function CountryPage({ params, searchParams }: { params: { country: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  const { country } = params;
  const rawPage = searchParams?.page;
  const page = Number(Array.isArray(rawPage) ? rawPage[0] : (rawPage ?? '1')) || 1;
  const perPage = 12;

  const items = PACKAGES.filter((p) => {
    const mapped = destinationToCountry[p.destination] || p.destination.toLowerCase();
    return mapped === country.toLowerCase() || p.destination.toLowerCase().includes(country.toLowerCase());
  });

  const start = (page - 1) * perPage;
  const paged = items.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">{country.charAt(0).toUpperCase()+country.slice(1)}</h1>
          <div className="text-sm text-slate-500">{items.length} packages</div>
        </div>

        {paged.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">No packages found for {country}.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map((p) => (
              <div key={p.slug} className="bg-white rounded-2xl shadow p-4">
                <div className="h-44 w-full overflow-hidden rounded-lg mb-4">
                  <img src={getImagesForDestination(p.destination)[0]} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                <div className="text-sm text-slate-500 mb-3">{p.duration} • {p.destination}</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-black">{p.price}</div>
                  <Link href={`/packages/${p.slug}`} className="text-sm font-semibold underline text-slate-700">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link key={i} href={`/country/${country}?page=${i+1}`} className={`px-3 py-1 rounded ${i+1===page? 'bg-slate-800 text-white':'bg-white'}`}>
              {i+1}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
