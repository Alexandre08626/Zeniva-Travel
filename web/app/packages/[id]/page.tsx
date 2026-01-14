import Link from "next/link";
import PACKAGES from "@/src/data/packages";
import { getImagesForDestination } from "@/src/lib/images";

export default async function PackageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = PACKAGES.find((p) => p.slug === id);

  if (!pkg) {
    return (
      <main className="min-h-screen p-10 bg-slate-50">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-4">Package not found</h1>
          <p className="text-slate-600">We couldn't find the package "{id}".</p>
          <div className="mt-4">
            <Link href="/packages" className="inline-block rounded-full px-4 py-2 bg-slate-100 text-slate-800">Back to packages</Link>
          </div>
        </div>
      </main>
    );
  }

  const images = getImagesForDestination(pkg.destination);

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <div className="h-96 w-full overflow-hidden rounded-lg mb-4">
            <img src={images[0]} alt={pkg.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {images.map((src, i) => (
              <div key={i} className="h-24 w-32 flex-shrink-0 rounded-lg overflow-hidden">
                <img src={src} alt={`${pkg.title} ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-black mb-2">{pkg.title}</h1>
          <div className="text-slate-600 mb-4">{pkg.duration} • {pkg.destination}</div>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Highlights</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Signature stays curated for {pkg.destination}</li>
              <li>Private/priority transfers and concierge check-in</li>
              <li>Curated experiences tailored to your travel style</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Itinerary (sample)</h3>
            <ol className="list-decimal pl-5 text-slate-700 space-y-1">
              <li>Day 1: Arrival, welcome transfer, sunset aperitif</li>
              <li>Day 2: Guided highlights & dining reservation</li>
              <li>Day 3: Optional excursion / leisure</li>
              <li>Day 4: Signature experience + spa or tasting</li>
              <li>Day 5+: Free day, curated list of recommendations</li>
            </ol>
          </section>

          <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Includes</h3>
              <ul className="list-disc pl-5 text-slate-700 space-y-1">
                <li>Premium hotel options</li>
                <li>Breakfast daily</li>
                <li>Highlighted experiences</li>
                <li>Concierge support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Exclusions / Policies</h3>
              <ul className="list-disc pl-5 text-slate-700 space-y-1">
                <li>International flights (priced on next step)</li>
                <li>City taxes, tips, personal expenses</li>
                <li>Flexible cancellation varies by hotel/airline</li>
              </ul>
            </div>
          </section>

        </div>

        <aside className="bg-white rounded-2xl shadow p-6 sticky top-6 h-fit space-y-4">
          <div className="mb-2">
            <div className="text-sm text-slate-500">From</div>
            <div className="text-2xl font-black">{pkg.price}</div>
          </div>

          <label className="block text-sm text-slate-600 mb-1">Departure airport/city</label>
          <input placeholder="e.g. JFK or New York" className="w-full mb-3 rounded-md border px-3 py-2" />

          <label className="block text-sm text-slate-600 mb-1">Dates</label>
          <input type="date" className="w-full mb-3 rounded-md border px-3 py-2" />

          <label className="block text-sm text-slate-600 mb-1">Travelers</label>
          <input placeholder="2 adults" className="w-full mb-3 rounded-md border px-3 py-2" />

          <label className="block text-sm text-slate-600 mb-1">Cabin / hotel style</label>
          <input placeholder="Business + Boutique" className="w-full mb-4 rounded-md border px-3 py-2" />

          <button className="w-full mb-2 inline-block rounded-md px-4 py-2 bg-slate-200 text-slate-800">See flight + hotel options</button>
          <Link href={`/proposals/${pkg.slug}/select`} className="w-full inline-block text-center rounded-md px-4 py-2 bg-blue-600 text-white font-bold">Continue to booking</Link>

          <div className="mt-2 text-sm text-slate-500">Your selection will prefill flight and hotel options in the next step.</div>
        </aside>
      </div>
    </main>
  );
}
