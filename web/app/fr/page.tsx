import type { Metadata } from "next";
import Link from "next/link";
import DemandeVoyageForm from "./_components/DemandeVoyageForm.client";
import { BASE, BandeauAction, Faq, FrNav, PiedFr, TEL_AFFICHE, TEL_LIEN, type QR } from "./_components/FrBlocs";

const URL = `${BASE}/fr`;

export const metadata: Metadata = {
  title: "Agence de voyage au Québec — tout inclus, croisières, groupes",
  description:
    "Zeniva Travel, agence de voyage en ligne fondée à Québec : forfaits soleil tout inclus, croisières et voyages de groupe au départ de Québec et Montréal. Proposition gratuite en français, paiement sécurisé par ZeniPay.",
  alternates: {
    canonical: URL,
    languages: {
      "fr-CA": URL,
      "en-CA": `${BASE}/`,
      "x-default": `${BASE}/`,
    },
  },
  openGraph: {
    title: "Zeniva Travel — Agence de voyage en ligne au Québec",
    description:
      "Tout inclus, croisières et voyages de groupe au départ de Québec et Montréal. Proposition gratuite, en français.",
    url: URL,
    siteName: "Zeniva Travel",
    type: "website",
    locale: "fr_CA",
    images: [{ url: "/branding/lina-hero.png", width: 1200, height: 630, alt: "Zeniva Travel" }],
  },
};

const FAQ: QR[] = [
  {
    q: "Qu'est-ce que Zeniva Travel ?",
    r: "Zeniva Travel est une agence de voyage en ligne fondée par Alexandre Blais, entrepreneur de Québec. Elle prépare des forfaits soleil tout inclus, des croisières, des voyages de groupe et des voyages sur mesure pour les voyageurs du Québec et du reste du Canada, en français et en anglais. L'entreprise qui l'exploite est Zeniva LLC.",
  },
  {
    q: "Comment se passe une réservation avec Zeniva Travel ?",
    r: "Vous décrivez votre voyage (destination, dates, nombre de voyageurs, budget) avec le formulaire, par téléphone ou en écrivant à Lina, notre concierge virtuelle. Nous vous transmettons une proposition détaillée. Vous la faites modifier au besoin, puis vous la confirmez et payez en ligne de façon sécurisée par ZeniPay.",
  },
  {
    q: "Est-ce que la proposition est gratuite ?",
    r: "Oui. La demande et la proposition sont gratuites et sans engagement. Vous payez seulement si vous confirmez le voyage.",
  },
  {
    q: "Partez-vous de Québec ou seulement de Montréal ?",
    r: "Les deux. Nous cherchons les vols au départ de l'aéroport de Québec (YQB) et de Montréal (YUL), et aussi d'Ottawa ou d'une autre ville si c'est plus avantageux pour vos dates.",
  },
  {
    q: "Qui est Lina ?",
    r: "Lina est la concierge virtuelle de Zeniva Travel. Elle répond 24 heures sur 24 par écrit ou par la voix, pose les bonnes questions sur votre voyage et prépare une première proposition. Si vous préférez parler à une personne, appelez-nous au 581-748-7017.",
  },
  {
    q: "Organisez-vous des voyages de groupe ?",
    r: "Oui : clubs, associations, entreprises (voyages incitatifs ou de fin d'année), mariages à destination et réunions de famille. Une seule demande suffit pour tout le groupe ; nous revenons avec des options et l'échéancier de dépôts du fournisseur.",
  },
];

const VOYAGES = [
  {
    titre: "Forfaits soleil tout inclus",
    texte: "Cancún, Riviera Maya, Punta Cana, Jamaïque : vol, hôtel, repas, boissons et transferts, au départ de Québec ou Montréal.",
    href: "/fr/forfaits-tout-inclus",
    emoji: "🏝️",
  },
  {
    titre: "Croisières",
    texte: "Caraïbes, Méditerranée, Alaska, ou Canada et Nouvelle-Angleterre au départ du port de Québec.",
    href: "/fr/croisieres",
    emoji: "🚢",
  },
  {
    titre: "Voyages de groupe",
    texte: "Clubs, entreprises, incitatifs, mariages et familles : une seule demande pour tout le groupe.",
    href: "/fr/voyage-de-groupe",
    emoji: "👥",
  },
  {
    titre: "Yacht privé",
    texte: "Location de yacht avec équipage dans les Caraïbes, les Bahamas ou la Méditerranée.",
    href: "/fr/yachts",
    emoji: "🛥️",
  },
];

const ETAPES = [
  { n: "1", t: "Vous décrivez le voyage", d: "Destination, dates, voyageurs, budget : par formulaire, par téléphone ou avec Lina, 24/7." },
  { n: "2", t: "Vous recevez une proposition", d: "Vols, hébergement, transferts et options, avec le prix total pour vos dates." },
  { n: "3", t: "On ajuste avec vous", d: "Autre hôtel, autres dates, budget différent : la proposition est modifiée jusqu'à ce qu'elle vous convienne." },
  { n: "4", t: "Vous confirmez et payez en ligne", d: "Paiement sécurisé par ZeniPay, puis documents de voyage par courriel." },
];

export default function AccueilFr() {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${URL}#webpage`,
    url: URL,
    name: "Zeniva Travel — Agence de voyage en ligne au Québec",
    inLanguage: "fr-CA",
    isPartOf: { "@id": `${BASE}/#website` },
    about: { "@id": `${BASE}/#organization` },
  };

  return (
    <div lang="fr-CA" className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <FrNav />

      <main>
        <section className="bg-gradient-to-br from-[#0B1B4D] via-[#0F3A8A] to-[#0F6CF5] px-4 py-12 text-white sm:py-16">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">Agence de voyage en ligne · Québec</p>
              <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                Votre agence de voyage au Québec, en ligne et en français
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-blue-100">
                Forfaits soleil tout inclus, croisières et voyages de groupe au départ de Québec et de Montréal.
                Dites-nous où vous voulez aller : vous recevez une proposition complète, gratuite et sans engagement.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#demande" className="rounded-full bg-white px-6 py-3 font-black text-[#0B1B4D]">Demander une proposition</a>
                <a href={TEL_LIEN} className="rounded-full border border-white/40 px-6 py-3 font-bold">📞 {TEL_AFFICHE}</a>
                <Link href="/chat" className="rounded-full border border-white/40 px-6 py-3 font-bold">Écrire à Lina 24/7</Link>
              </div>
              <ul className="mt-7 grid gap-2 text-sm text-blue-100 sm:grid-cols-2">
                <li>✓ Service en français et en anglais</li>
                <li>✓ Départs de Québec (YQB) et Montréal (YUL)</li>
                <li>✓ Proposition gratuite, sans engagement</li>
                <li>✓ Paiement en ligne sécurisé par ZeniPay</li>
              </ul>
            </div>
            <div id="demande" className="scroll-mt-24 text-slate-900">
              <DemandeVoyageForm source="/fr" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Ce que nous réservons</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VOYAGES.map((v) => (
              <Link key={v.href} href={v.href} className="rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="text-3xl" aria-hidden>{v.emoji}</div>
                <h3 className="mt-3 text-lg font-black text-slate-900">{v.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.texte}</p>
                <span className="mt-3 inline-block text-sm font-bold text-blue-700">Voir les détails →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Comment ça fonctionne</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ETAPES.map((e) => (
                <li key={e.n} className="rounded-3xl bg-white p-6 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F6CF5] font-black text-white">{e.n}</span>
                  <p className="mt-3 font-black text-slate-900">{e.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{e.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Des prix réels avant de réserver</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Nos guides détaillent ce que coûte vraiment un voyage, poste par poste, avec les sources.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/fr/guides/all-inclusive-cancun-cost-family-of-four" className="rounded-3xl border border-slate-200 p-6 hover:shadow-lg">
              <p className="font-black text-slate-900">Combien coûte une semaine tout inclus à Cancún pour une famille de quatre ?</p>
              <span className="mt-2 inline-block text-sm font-bold text-blue-700">Lire le guide →</span>
            </Link>
            <Link href="/fr/guides/yacht-charter-cost" className="rounded-3xl border border-slate-200 p-6 hover:shadow-lg">
              <p className="font-black text-slate-900">Combien coûte vraiment un charter de yacht d'une semaine ?</p>
              <span className="mt-2 inline-block text-sm font-bold text-blue-700">Lire le guide →</span>
            </Link>
            <Link href="/fr/guides/quand-partir-dans-le-sud" className="rounded-3xl border border-slate-200 p-6 hover:shadow-lg">
              <p className="font-black text-slate-900">Quand partir dans le sud : le meilleur moment par destination</p>
              <span className="mt-2 inline-block text-sm font-bold text-blue-700">Lire le guide →</span>
            </Link>
            <Link href="/fr/guides/cuba-mexique-ou-republique-dominicaine-depuis-quebec" className="rounded-3xl border border-slate-200 p-6 hover:shadow-lg">
              <p className="font-black text-slate-900">Cuba, Mexique ou République dominicaine : quel tout-inclus choisir ?</p>
              <span className="mt-2 inline-block text-sm font-bold text-blue-700">Lire le guide →</span>
            </Link>
          </div>
          <p className="mt-6 text-slate-600">
            <Link href="/fr/guides" className="font-bold text-blue-700 underline">Tous nos guides</Link> : documents de voyage et passeport d'enfant, mariage à destination, voyage de groupe ou d'entreprise.
          </p>
        </section>

        <Faq items={FAQ} />
        <BandeauAction />
      </main>
      <PiedFr />
    </div>
  );
}
