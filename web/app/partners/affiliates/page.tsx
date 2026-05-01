import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate & Partner Embed Widgets — Earn 10% | Zeniva",
  description:
    "Earn 10% commission on every Zeniva booking. Free embeddable widgets for travel blogs, agencies, hotels, yacht brokers and influencers. No setup, paid monthly.",
  alternates: { canonical: "https://www.zenivatravel.com/partners/affiliates" },
};

const SITE = "https://www.zenivatravel.com";

const SNIPPETS: { id: string; label: string; rec: string; html: string }[] = [
  {
    id: "all-inclusive",
    label: "Voyage tout inclus (FR — Quebec affiliates)",
    rec: "Best for: Quebec / Montreal travel blogs, French-Canadian Facebook groups, ski-chalet partners.",
    html: `<a href="${SITE}/voyage-tout-inclus?utm_source=affiliate&utm_medium=embed" target="_blank" rel="sponsored noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:14px;background:linear-gradient(135deg,#0B1B4D,#0F6CF5);color:#fff;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(15,108,245,0.25)">
  <span style="font-size:18px">✈️</span> Voir les forfaits tout inclus — Zeniva
</a>`,
  },
  {
    id: "agence-quebec",
    label: "Agence voyage Québec (FR — Quebec partners)",
    rec: "Best for: Lac-Beauport chalet hosts, Quebec wedding planners, ski resorts, restaurants in tourist zones.",
    html: `<a href="${SITE}/agence-voyage-quebec?utm_source=affiliate&utm_medium=embed" target="_blank" rel="sponsored noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:14px;background:linear-gradient(135deg,#0F3A8A,#0F6CF5);color:#fff;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(15,108,245,0.25)">
  <span style="font-size:18px">🇨🇦</span> Agence voyage AI 24/7 — Zeniva
</a>`,
  },
  {
    id: "nyc",
    label: "Travel Agency New York (EN — NYC partners)",
    rec: "Best for: Manhattan concierge desks, Hamptons rentals, NYC honeymoon photographers, hotel concierges.",
    html: `<a href="${SITE}/travel-agency-new-york?utm_source=affiliate&utm_medium=embed" target="_blank" rel="sponsored noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:14px;background:linear-gradient(135deg,#0B1B4D,#7c3aed);color:#fff;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(124,58,237,0.25)">
  <span style="font-size:18px">🗽</span> Plan your trip — NYC Travel Agency
</a>`,
  },
  {
    id: "virginia",
    label: "Travel Agency Virginia (EN — VA partners)",
    rec: "Best for: Williamsburg attractions, Virginia Beach hotels, Norfolk cruise terminal partners, government contractor newsletters.",
    html: `<a href="${SITE}/travel-agency-virginia?utm_source=affiliate&utm_medium=embed" target="_blank" rel="sponsored noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:14px;background:linear-gradient(135deg,#065f46,#0F6CF5);color:#fff;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(15,108,245,0.25)">
  <span style="font-size:18px">🌳</span> Virginia Travel Agency — 24/7
</a>`,
  },
  {
    id: "miami-yachts",
    label: "Miami Yacht Charters (EN — South FL partners)",
    rec: "Best for: Miami Beach hotels, restaurants on the water, event planners, Coconut Grove businesses.",
    html: `<a href="${SITE}/yacht-charters/miami?utm_source=affiliate&utm_medium=embed" target="_blank" rel="sponsored noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:14px;background:linear-gradient(135deg,#0F6CF5,#06b6d4);color:#fff;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(6,182,212,0.25)">
  <span style="font-size:18px">🛥️</span> Charter a Miami yacht
</a>`,
  },
  {
    id: "palm-beach-yachts",
    label: "Palm Beach Yacht Charters (EN — PB County partners)",
    rec: "Best for: Palm Beach hotels, Singer Island, Jupiter, Lake Worth restaurants, Mar-a-Lago-area concierges.",
    html: `<a href="${SITE}/yacht-charters/palm-beach?utm_source=affiliate&utm_medium=embed" target="_blank" rel="sponsored noopener" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:14px;background:linear-gradient(135deg,#0d9488,#06b6d4);color:#fff;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(6,182,212,0.25)">
  <span style="font-size:18px">🛥️</span> Palm Beach yacht charters
</a>`,
  },
];

export default function AffiliatesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            🤝 Affiliate program
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black">Earn 10% on every Zeniva booking</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Drop one of the buttons below on your blog, hotel website, Linktree, Instagram bio link or YouTube
            description. Every visitor who books gets you 10% commission, paid monthly via Stripe / e-Transfer / wire.
            Zero approval delay — copy, paste, get paid.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:info@zeniva.ca?subject=Affiliate%20signup&body=Hi%20Zeniva%2C%20I%27d%20like%20to%20join%20the%20affiliate%20program.%20My%20website%20%2F%20social%20handle%20is%3A%20"
              className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-yellow-300"
            >
              Email us to register your handle
            </a>
            <a
              href="/chat?prompt=I+want+to+become+a+Zeniva+affiliate"
              className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/20"
            >
              💬 Chat with Lina
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 space-y-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900">How it works</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-slate-700">
            <li>Pick the snippet that matches your audience (FR/EN, region, niche).</li>
            <li>Copy the HTML — paste into your site, blog post, hotel concierge page or newsletter.</li>
            <li>Email <a href="mailto:info@zeniva.ca" className="text-blue-700 font-bold">info@zeniva.ca</a> with
              your domain so we can attribute your traffic and process payouts.</li>
            <li>10% commission on every confirmed booking. Tracked via the <code className="bg-slate-100 px-1 rounded">utm_source=affiliate</code> param baked into each link.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-500">
            All buttons use <code className="bg-slate-100 px-1 rounded">rel=&quot;sponsored noopener&quot;</code> per Google
            best-practice for monetized links — keeps your SEO clean.
          </p>
        </div>

        {SNIPPETS.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{s.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.rec}</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Live preview</div>
              <div dangerouslySetInnerHTML={{ __html: s.html }} />
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">HTML — copy & paste</div>
              <pre className="bg-slate-900 text-emerald-300 text-[11px] p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">{s.html}</pre>
            </div>
          </div>
        ))}

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <h3 className="text-lg font-black text-amber-900">For travel blogs / journalists</h3>
          <p className="mt-2 text-sm text-amber-800">
            We provide free editorial assets (Lina AI press photos, Zeniva logo pack, founder quotes, exclusive
            destination data) for any blog or publication that links back. Email <a href="mailto:info@zeniva.ca" className="font-bold underline">info@zeniva.ca</a> with
            your media kit request.
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Zeniva Affiliate & Partner Embed Widgets",
            description: "Free embeddable widgets that earn affiliates 10% on every Zeniva booking.",
            url: `${SITE}/partners/affiliates`,
            isPartOf: { "@type": "WebSite", name: "Zeniva Travel", url: SITE },
          }),
        }}
      />
    </main>
  );
}
