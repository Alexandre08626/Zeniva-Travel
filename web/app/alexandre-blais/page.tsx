import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export const metadata: Metadata = {
  title: "Alexandre Blais — Founder & President of Zeniva | Entrepreneur",
  description:
    "Official profile of Alexandre Blais, founder and president of Zeniva. Entrepreneur building travel, AI, fintech and service technology projects across Canada and the United States.",
  alternates: {
    canonical: "https://www.zenivatravel.com/alexandre-blais",
  },
  openGraph: {
    title: "Alexandre Blais — Founder & President of Zeniva",
    description:
      "Entrepreneur and founder of Zeniva, building technology-driven projects in travel, AI, fintech and services across Canada and the United States.",
    url: "https://www.zenivatravel.com/alexandre-blais",
    type: "profile",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://www.zenivatravel.com/alexandre-blais#person",
  name: "Alexandre Blais",
  url: "https://www.zenivatravel.com/alexandre-blais",
  jobTitle: "Founder & President",
  description:
    "Entrepreneur and founder of Zeniva, active in travel technology, artificial intelligence, fintech and service platforms in Canada and the United States.",
  worksFor: {
    "@type": "Organization",
    name: "Zeniva",
    legalName: "Zeniva LLC",
    url: "https://www.zenivatravel.com",
  },
  knowsAbout: [
    "Travel technology",
    "Artificial intelligence",
    "Financial technology",
    "Digital platforms",
    "Entrepreneurship",
  ],
  sameAs: ["https://github.com/Alexandre08626"],
};

export default function AlexandreBlaisPage() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-24 text-white">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">
              Founder · President · Entrepreneur
            </p>
            <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
              Alexandre Blais
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-relaxed text-blue-100">
              Founder and president of Zeniva, Alexandre Blais is an entrepreneur focused on building technology-driven businesses and platforms across travel, artificial intelligence, financial technology and service industries in Canada and the United States.
            </p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.35fr_0.65fr]">
            <div>
              <h2 className="text-3xl font-bold">Building an interconnected business ecosystem</h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Alexandre's work is centered on one operating principle: use technology to simplify complex customer journeys and connect sales, operations, payments and artificial intelligence in one coherent ecosystem.
              </p>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Through Zeniva and related projects, his portfolio spans custom travel, AI-powered customer experiences, payment technology, business software and digital service platforms. The common thread is practical execution: build systems that can be used by real customers, sales teams and operating partners.
              </p>
            </div>

            <aside className="rounded-3xl border border-gray-200 bg-gray-50 p-7">
              <h2 className="text-lg font-bold">Executive profile</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-gray-900">Name</dt>
                  <dd className="text-gray-600">Alexandre Blais</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Role</dt>
                  <dd className="text-gray-600">Founder & President</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Core markets</dt>
                  <dd className="text-gray-600">Canada & United States</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Focus</dt>
                  <dd className="text-gray-600">Travel · AI · Fintech · Digital Platforms</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Selected ventures</p>
            <h2 className="mt-3 text-3xl font-bold">Projects across multiple industries</h2>
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {[
                ["Zeniva Travel", "Custom travel and AI-enabled travel technology serving clients in Canada and the United States."],
                ["ZeniPay", "Financial technology and payment infrastructure focused on intelligent business workflows."],
                ["Zenitech", "Technology, software and artificial-intelligence development for business operations."],
                ["ZeniCorp", "Digital service-platform initiatives designed to connect customers, sales teams and qualified operating partners."],
              ].map(([title, body]) => (
                <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-gray-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-blue-700 p-9 text-white md:p-12">
            <h2 className="text-3xl font-bold">Zeniva</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100">
              Zeniva is the travel pillar of the ecosystem, combining digital travel planning, human expertise and AI-assisted customer service.
            </p>
            <Link href="/about" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-blue-700">
              Learn more about Zeniva →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
