// Blocs partagés des pages françaises : barre de navigation, FAQ (visible + JSON-LD),
// fil d'Ariane (JSON-LD) et appel à l'action. Composants serveur, aucun JS client.
import Link from "next/link";

export const BASE = "https://www.zenivatravel.com";
export const TEL_AFFICHE = "581-748-7017";
export const TEL_LIEN = "tel:+15817487017";

export function FrNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/fr" className="flex items-center gap-2">
          <img src="/branding/lina-avatar.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
          <span className="text-base font-black text-[#0B1B4D]">Zeniva Travel</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-5 text-sm font-semibold text-slate-700 md:flex">
          <Link href="/fr/forfaits-tout-inclus">Tout inclus</Link>
          <Link href="/fr/croisieres">Croisières</Link>
          <Link href="/fr/voyage-de-groupe">Groupes</Link>
          <Link href="/fr/guides">Guides</Link>
          <Link href="/" hrefLang="en">English</Link>
        </nav>
        <a href={TEL_LIEN} className="rounded-full bg-[#0B1B4D] px-4 py-2 text-sm font-bold text-white">
          📞 {TEL_AFFICHE}
        </a>
      </div>
      <nav aria-label="Navigation mobile" className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm font-semibold text-slate-700 md:hidden">
        <Link href="/fr/forfaits-tout-inclus" className="whitespace-nowrap">Tout inclus</Link>
        <Link href="/fr/croisieres" className="whitespace-nowrap">Croisières</Link>
        <Link href="/fr/voyage-de-groupe" className="whitespace-nowrap">Groupes</Link>
        <Link href="/fr/guides" className="whitespace-nowrap">Guides</Link>
        <Link href="/" hrefLang="en" className="whitespace-nowrap">English</Link>
      </nav>
    </header>
  );
}

export type QR = { q: string; r: string };

export function Faq({ items, titre = "Questions fréquentes" }: { items: QR[]; titre?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "fr-CA",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  };
  return (
    <section className="mx-auto max-w-3xl px-4 py-14" aria-labelledby="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 id="faq" className="text-2xl sm:text-3xl font-black text-slate-900">{titre}</h2>
      <div className="mt-6 space-y-3">
        {items.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white open:shadow-sm">
            <summary className="cursor-pointer list-none p-5 font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
              {f.q}
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-slate-600">{f.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FilAriane({ items }: { items: { nom: string; url: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nom, item: it.url })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Fil d'Ariane" className="mx-auto max-w-6xl px-4 pt-4 text-xs text-slate-500">
        {items.map((it, i) => (
          <span key={it.url}>
            {i > 0 && " › "}
            {i < items.length - 1 ? <Link href={it.url.replace(BASE, "") || "/"} className="underline">{it.nom}</Link> : it.nom}
          </span>
        ))}
      </nav>
    </>
  );
}

/** Schéma Service rattaché à l'agence déclarée dans layout.tsx. */
export function serviceJsonLd(nom: string, description: string, url: string, typeService: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: nom,
    serviceType: typeService,
    description,
    url,
    inLanguage: "fr-CA",
    provider: { "@id": `${BASE}/#organization` },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Québec" },
      { "@type": "Country", name: "Canada" },
    ],
    availableChannel: [
      { "@type": "ServiceChannel", serviceUrl: `${BASE}/chat`, availableLanguage: ["fr", "en"] },
      { "@type": "ServiceChannel", servicePhone: { "@type": "ContactPoint", telephone: "+1-581-748-7017", availableLanguage: ["fr", "en"] } },
    ],
  };
}

export function BandeauAction({ texte = "Prêt à partir ? Décrivez votre voyage, on s'occupe du reste." }: { texte?: string }) {
  return (
    <section className="bg-[#0B1B4D] px-4 py-12 text-center text-white">
      <p className="mx-auto max-w-2xl text-xl sm:text-2xl font-black">{texte}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#demande" className="rounded-full bg-white px-6 py-3 font-bold text-[#0B1B4D]">Demander une proposition</a>
        <a href={TEL_LIEN} className="rounded-full border border-white/40 px-6 py-3 font-bold">📞 {TEL_AFFICHE}</a>
        <Link href="/chat" className="rounded-full border border-white/40 px-6 py-3 font-bold">Écrire à Lina 24/7</Link>
      </div>
    </section>
  );
}

export function PiedFr() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
        <div>
          <p className="font-black text-slate-900">Zeniva Travel</p>
          <p className="mt-2">Agence de voyage en ligne fondée par Alexandre Blais, entrepreneur de Québec. Service en français et en anglais.</p>
        </div>
        <div>
          <p className="font-bold text-slate-900">Nous joindre</p>
          <p className="mt-2">
            <a href={TEL_LIEN} className="underline">{TEL_AFFICHE}</a><br />
            <a href="mailto:info@zeniva.ca" className="underline">info@zeniva.ca</a><br />
            <Link href="/chat" className="underline">Lina, concierge virtuelle 24/7</Link>
          </p>
        </div>
        <div>
          <p className="font-bold text-slate-900">Voyages</p>
          <p className="mt-2">
            <Link href="/fr/forfaits-tout-inclus" className="underline">Forfaits tout inclus</Link><br />
            <Link href="/fr/croisieres" className="underline">Croisières</Link><br />
            <Link href="/fr/voyage-de-groupe" className="underline">Voyages de groupe</Link><br />
            <Link href="/fr/guides" className="underline">Guides et prix réels</Link><br />
            <Link href="/about" className="underline">À propos (anglais)</Link>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-slate-500">
        Zeniva Travel est exploitée par Zeniva LLC. Paiements sécurisés par ZeniPay.{" "}
        <a href="https://zenitech.dev/" className="underline">Site conçu par Zenitech — agence web et IA</a>
      </p>
    </footer>
  );
}
