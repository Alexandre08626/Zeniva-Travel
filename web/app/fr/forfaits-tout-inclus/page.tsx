import type { Metadata } from "next";
import Link from "next/link";
import DemandeVoyageForm from "../_components/DemandeVoyageForm.client";
import { BASE, BandeauAction, Faq, FilAriane, FrNav, PiedFr, TEL_AFFICHE, TEL_LIEN, serviceJsonLd, type QR } from "../_components/FrBlocs";

const URL = `${BASE}/fr/forfaits-tout-inclus`;
const DESCRIPTION =
  "Forfaits soleil tout inclus au départ de Québec et Montréal : Cancún, Riviera Maya, Punta Cana, Jamaïque. Vol, hôtel, repas, boissons et transferts. Proposition gratuite en français, prix total pour vos dates.";

export const metadata: Metadata = {
  title: "Forfaits tout inclus au départ de Québec et Montréal",
  description: DESCRIPTION,
  alternates: {
    canonical: URL,
    languages: {
      "fr-CA": URL,
      "en-CA": `${BASE}/packages/all-inclusive`,
    },
  },
  openGraph: {
    title: "Forfaits soleil tout inclus au départ de Québec et Montréal",
    description: DESCRIPTION,
    url: URL,
    siteName: "Zeniva Travel",
    type: "website",
    locale: "fr_CA",
  },
};

const DESTINATIONS = [
  {
    nom: "Cancún et Riviera Maya (Mexique)",
    vol: "environ 4 h 30 de vol depuis Montréal",
    pour: "Familles, couples, groupes d'amis",
    texte:
      "Le plus grand choix de complexes tout inclus, de l'économique au très haut de gamme. Zone hôtelière animée à Cancún, ambiance plus calme et cénotes du côté de Playa del Carmen et Tulum.",
  },
  {
    nom: "Punta Cana (République dominicaine)",
    vol: "environ 4 h de vol depuis Montréal",
    pour: "Familles, longues plages",
    texte:
      "De grandes plages de sable blanc et beaucoup de complexes avec clubs pour enfants. Un classique de l'hiver québécois, avec des vols directs saisonniers au départ de Québec et de Montréal.",
  },
  {
    nom: "Varadero, Cayo Coco, Cayo Santa María (Cuba)",
    vol: "environ 3 h 30 à 4 h de vol",
    pour: "Avis aux voyageurs en vigueur",
    texte:
      "Avis du gouvernement du Canada mis à jour le 28 septembre 2026 : évitez tout voyage non essentiel à Cuba ; les compagnies aériennes canadiennes y ont suspendu leurs vols jusqu'à nouvel ordre. Vérifiez voyage.gc.ca avant de planifier un séjour à Cuba.",
  },
  {
    nom: "Montego Bay et Negril (Jamaïque)",
    vol: "environ 4 h 30 de vol",
    pour: "Couples, complexes pour adultes",
    texte:
      "Beaucoup de complexes réservés aux adultes et d'excellentes options pour les voyages de noces.",
  },
  {
    nom: "Puerto Plata et Samaná (République dominicaine)",
    vol: "environ 4 h de vol",
    pour: "Nature, excursions",
    texte:
      "Côte nord plus verte et montagneuse, souvent un peu moins chère que Punta Cana.",
  },
  {
    nom: "Aruba, Sainte-Lucie, Bahamas",
    vol: "selon les liaisons de la saison",
    pour: "Haut de gamme, plongée, lune de miel",
    texte:
      "Moins de vols directs depuis le Québec, mais des complexes haut de gamme et des plages remarquables. Une escale est parfois nécessaire.",
  },
];

const FAQ: QR[] = [
  {
    q: "Qu'est-ce qui est compris dans un forfait tout inclus ?",
    r: "En général : le vol aller-retour, les transferts entre l'aéroport et l'hôtel, l'hébergement, tous les repas et collations, les boissons (souvent alcoolisées), les activités non motorisées et l'animation. Ne sont habituellement pas compris : l'assurance voyage, certains restaurants ou boissons haut de gamme, les excursions, les pourboires et les sièges choisis à l'avance. Chaque proposition de Zeniva Travel indique ce qui est inclus ou non.",
  },
  {
    q: "Quand réserver un voyage dans le sud au départ de Québec ?",
    r: "Pour les périodes les plus demandées (Fêtes, semaine de relâche en février et mars), réservez tôt, souvent dès l'été ou l'automne : les vols directs au départ de Québec se remplissent vite. Pour les autres semaines d'hiver, les prix varient beaucoup d'une semaine à l'autre ; comparer plusieurs dates est souvent la meilleure économie.",
  },
  {
    q: "Vaut-il mieux partir de Québec ou de Montréal ?",
    r: "Partir de Québec (YQB) évite la route et le stationnement à Montréal, mais l'offre de vols directs est plus petite et surtout saisonnière. Montréal (YUL) offre plus de destinations et de dates. Nous comparons les deux pour vos dates, en incluant le coût du déplacement.",
  },
  {
    q: "Combien coûte une semaine tout inclus ?",
    r: "Le prix dépend surtout de la semaine, de la catégorie de l'hôtel et de la ville de départ. Notre guide sur Cancún détaille le coût réel pour une famille de quatre, poste par poste, avec les sources. Pour vos dates précises, demandez une proposition : elle indique le prix total.",
  },
  {
    q: "Ai-je besoin d'un passeport ?",
    r: "Oui, un passeport valide est exigé pour le Mexique, les Caraïbes et Cuba. Certains pays demandent aussi un formulaire d'entrée en ligne. Les exigences changent : vérifiez-les pour votre destination sur voyage.gc.ca, le site officiel du gouvernement du Canada.",
  },
  {
    q: "Comment se fait le paiement ?",
    r: "Une fois la proposition acceptée, vous payez en ligne par ZeniPay, notre plateforme de paiement sécurisée. Le dépôt et le solde suivent les conditions du fournisseur (transporteur, hôtel), indiquées dans la proposition.",
  },
];

export default function ForfaitsToutInclus() {
  const service = serviceJsonLd(
    "Forfaits soleil tout inclus au départ de Québec et Montréal",
    DESCRIPTION,
    URL,
    "Forfaits vacances tout inclus"
  );

  return (
    <div lang="fr-CA" className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <FrNav />
      <FilAriane items={[{ nom: "Accueil", url: `${BASE}/fr` }, { nom: "Forfaits tout inclus", url: URL }]} />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Forfaits tout inclus au départ de Québec et Montréal
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Une semaine au soleil sans rien gérer : vol, hôtel, repas, boissons et transferts dans un seul forfait.
              Dites-nous vos dates, votre budget et qui voyage ; nous comparons les complexes et les vols au départ de
              Québec (YQB) et de Montréal (YUL), et vous recevez le prix total.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#demande" className="rounded-full bg-[#0B1B4D] px-6 py-3 font-black text-white">Recevoir une proposition</a>
              <a href={TEL_LIEN} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-900">📞 {TEL_AFFICHE}</a>
            </div>
            <ul className="mt-6 space-y-2 text-slate-700">
              <li>✓ Prix total pour vos dates, détaillé dans la proposition</li>
              <li>✓ Comparaison Québec / Montréal</li>
              <li>✓ Service en français, avant et pendant le voyage</li>
            </ul>
          </div>
          <div id="demande" className="scroll-mt-24">
            <DemandeVoyageForm source="/fr/forfaits-tout-inclus" typeVoyage="Forfait soleil tout inclus" titre="Votre forfait tout inclus" />
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Où partir dans le sud cet hiver ?</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Les durées de vol sont approximatives et varient selon le transporteur et l'escale.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DESTINATIONS.map((d) => (
                <article key={d.nom} className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900">{d.nom}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">{d.vol} · {d.pour}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.texte}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Bien choisir son tout inclus</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-slate-700">
            <p>
              <strong>La semaine compte plus que la destination.</strong> La même chambre peut coûter beaucoup plus cher
              pendant les Fêtes ou la semaine de relâche qu'une semaine plus tard. Si vos dates sont flexibles,
              dites-le : nous comparons plusieurs semaines.
            </p>
            <p>
              <strong>Regardez la catégorie de chambre et les restaurants à la carte.</strong> Deux complexes « 4 étoiles »
              peuvent être très différents : nombre de restaurants à la carte, réservation obligatoire ou non, section
              réservée aux adultes, club pour enfants.
            </p>
            <p>
              <strong>Pensez aux à-côtés.</strong> Assurance voyage, bagages enregistrés, sièges, pourboires et excursions
              s'ajoutent au prix du forfait. Notre proposition les indique pour éviter les surprises.
            </p>
            <p>
              Pour un exemple chiffré, lisez notre guide{" "}
              <Link href="/fr/guides/all-inclusive-cancun-cost-family-of-four" className="font-semibold text-blue-700 underline">
                Combien coûte une semaine tout inclus à Cancún pour une famille de quatre
              </Link>
              . Pour choisir la semaine, lisez{" "}
              <Link href="/fr/guides/quand-partir-dans-le-sud" className="font-semibold text-blue-700 underline">quand partir dans le sud</Link>
              ; pour trancher entre les destinations,{" "}
              <Link href="/fr/guides/cuba-mexique-ou-republique-dominicaine-depuis-quebec" className="font-semibold text-blue-700 underline">Cuba, Mexique ou République dominicaine</Link>
              ; et pour les passeports et les enfants,{" "}
              <Link href="/fr/guides/documents-voyage-etranger-passeport-enfant" className="font-semibold text-blue-700 underline">les documents pour voyager à l'étranger</Link>
              . Vous partez avec des enfants ? Voyez{" "}
              <Link href="/fr/guides/voyage-tout-inclus-en-famille-quoi-verifier" className="font-semibold text-blue-700 underline">quoi vérifier pour un tout-inclus en famille</Link>
              . En voyage de noces ? Comparez{" "}
              <Link href="/fr/guides/lune-de-miel-sud-ou-croisiere-budget" className="font-semibold text-blue-700 underline">lune de miel dans le sud ou en croisière</Link>
              . Vous organisez un voyage pour 10 personnes ou plus ? Voyez nos{" "}
              <Link href="/fr/voyage-de-groupe" className="font-semibold text-blue-700 underline">voyages de groupe</Link>.
            </p>
            <p className="text-sm text-slate-500">
              Source pour les exigences d'entrée : gouvernement du Canada,{" "}
              <a href="https://voyage.gc.ca/destinations" className="underline" rel="noopener">voyage.gc.ca/destinations</a>.
            </p>
          </div>
        </section>

        <Faq items={FAQ} titre="Questions fréquentes sur les forfaits tout inclus" />
        <BandeauAction texte="Votre semaine au soleil, au bon prix, sans y passer vos soirées." />
      </main>
      <PiedFr />
    </div>
  );
}
