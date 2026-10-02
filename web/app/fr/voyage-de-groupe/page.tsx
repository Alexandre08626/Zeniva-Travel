import type { Metadata } from "next";
import Link from "next/link";
import DemandeVoyageForm from "../_components/DemandeVoyageForm.client";
import { BASE, BandeauAction, Faq, FilAriane, FrNav, PiedFr, TEL_AFFICHE, TEL_LIEN, serviceJsonLd, type QR } from "../_components/FrBlocs";

const URL = `${BASE}/fr/voyage-de-groupe`;
const DESCRIPTION =
  "Voyage de groupe au départ de Québec et Montréal : clubs, associations, voyages d'entreprise et incitatifs, mariages à destination, réunions de famille. Une seule demande, des options chiffrées et un échéancier clair.";

export const metadata: Metadata = {
  title: "Voyage de groupe au départ du Québec — clubs, entreprises, mariages",
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { "fr-CA": URL } },
  openGraph: {
    title: "Voyage de groupe au départ du Québec",
    description: DESCRIPTION,
    url: URL,
    siteName: "Zeniva Travel",
    type: "website",
    locale: "fr_CA",
  },
};

const GROUPES = [
  { t: "Clubs et associations", d: "Clubs sociaux, clubs de golf, associations de retraités, groupes paroissiaux : une destination soleil ou une croisière pour vos membres." },
  { t: "Entreprises et voyages incitatifs", d: "Voyage de récompense pour l'équipe des ventes, voyage de fin d'année, séminaire au soleil avec salle de réunion." },
  { t: "Mariages à destination", d: "Bloc de chambres pour les invités, cérémonie sur la plage, coordination avec le complexe." },
  { t: "Familles et amis", d: "Réunion de famille, 50e anniversaire, enterrement de vie de garçon ou de fille : tout le monde au même endroit, aux mêmes dates." },
  { t: "Équipes sportives et écoles", d: "Tournois, camps d'entraînement, voyages de fin d'études, avec les autorisations et l'encadrement à prévoir." },
];

const ETAPES = [
  { t: "La demande", d: "Destination ou type de voyage, dates possibles, nombre approximatif de voyageurs, budget par personne, ville de départ." },
  { t: "Les options", d: "Nous demandons les tarifs de groupe aux fournisseurs (complexes, compagnies de croisière, transporteurs) et vous présentons des options comparées." },
  { t: "Le bloc et l'échéancier", d: "Une fois l'option choisie, les places sont bloquées selon le contrat du fournisseur : dépôt, date limite pour la liste des noms, date du solde." },
  { t: "Les inscriptions et le paiement", d: "Le paiement se fait en ligne de façon sécurisée par ZeniPay, selon l'échéancier convenu." },
  { t: "Le départ", d: "Documents de voyage, rappels avant le départ et un contact en français pendant le séjour." },
];

const FAQ: QR[] = [
  {
    q: "À partir de combien de personnes parle-t-on d'un voyage de groupe ?",
    r: "Cela dépend du fournisseur. Beaucoup d'hôtels parlent de groupe à partir d'environ 10 chambres et les compagnies de croisière à partir d'environ 8 cabines. Pour un plus petit groupe, nous réservons souvent des chambres individuelles aux mêmes dates : écrivez-nous quand même, nous vous dirons la meilleure formule.",
  },
  {
    q: "Quels sont les avantages d'un tarif de groupe ?",
    r: "Selon le fournisseur : un prix bloqué pour tout le groupe, des conditions de dépôt adaptées, parfois une place gratuite ou un crédit selon le nombre de personnes payantes, et une date limite pour fournir la liste des noms plutôt que tous les noms dès le départ. Les avantages exacts sont écrits dans chaque contrat ; nous vous les expliquons avant de signer.",
  },
  {
    q: "Combien de temps à l'avance faut-il réserver ?",
    r: "Le plus tôt possible : de 6 à 12 mois à l'avance pour une destination soleil pendant l'hiver ou une croisière, et davantage pour un mariage à destination ou un grand groupe pendant les Fêtes ou la relâche. Plus tôt, il y a plus de choix de chambres et de vols au départ de Québec.",
  },
  {
    q: "Qui s'occupe de recueillir les noms et les paiements ?",
    r: "L'organisateur nous transmet la liste des voyageurs avant la date limite du fournisseur. Nous préparons ensemble la façon de percevoir les paiements selon votre groupe ; les montants et les dates sont indiqués dans la proposition et le paiement se fait en ligne par ZeniPay.",
  },
  {
    q: "Pouvez-vous organiser un voyage d'entreprise ou un voyage incitatif ?",
    r: "Oui. Indiquez le nombre de participants, l'objectif (récompense, réunion, fin d'année), le budget par personne et les dates possibles. Nous proposons des destinations et des complexes adaptés, avec salle de réunion ou activités de groupe si nécessaire.",
  },
  {
    q: "Et si des participants annulent ?",
    r: "Les conditions d'annulation et de remplacement dépendent du contrat du fournisseur et sont indiquées avant la signature. Nous recommandons à chaque voyageur une assurance voyage avec garantie annulation.",
  },
];

export default function VoyageDeGroupe() {
  const service = serviceJsonLd("Voyages de groupe au départ du Québec", DESCRIPTION, URL, "Organisation de voyages de groupe");

  return (
    <div lang="fr-CA" className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <FrNav />
      <FilAriane items={[{ nom: "Accueil", url: `${BASE}/fr` }, { nom: "Voyage de groupe", url: URL }]} />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Voyage de groupe au départ du Québec
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Vous organisez un voyage pour un club, une entreprise, un mariage ou la famille ? Envoyez une seule
              demande pour tout le groupe. Nous obtenons les tarifs de groupe, comparons les options et vous
              remettons un échéancier clair : dépôt, liste des noms, solde.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#demande" className="rounded-full bg-[#0B1B4D] px-6 py-3 font-black text-white">Demander une soumission de groupe</a>
              <a href={TEL_LIEN} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-900">📞 {TEL_AFFICHE}</a>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Organisateur, vous n'avez pas à tout savoir dès le départ : une fourchette de participants et quelques dates suffisent pour commencer.
            </p>
          </div>
          <div id="demande" className="scroll-mt-24">
            <DemandeVoyageForm source="/fr/voyage-de-groupe" typeVoyage="Voyage de groupe" titre="Soumission pour votre groupe" />
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Pour quels groupes ?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {GROUPES.map((g) => (
                <article key={g.t} className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900">{g.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Comment se déroule un voyage de groupe</h2>
          <ol className="mt-6 space-y-4">
            {ETAPES.map((e, i) => (
              <li key={e.t} className="flex gap-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0F6CF5] font-black text-white">{i + 1}</span>
                <div>
                  <p className="font-black text-slate-900">{e.t}</p>
                  <p className="mt-1 leading-relaxed text-slate-600">{e.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 leading-relaxed text-slate-700">
            Idées pour votre groupe : une semaine{" "}
            <Link href="/fr/forfaits-tout-inclus" className="font-semibold text-blue-700 underline">tout inclus dans le sud</Link>, une{" "}
            <Link href="/fr/croisieres" className="font-semibold text-blue-700 underline">croisière</Link> (pratique pour les groupes : un seul prix
            pour l'hébergement, les repas et les déplacements) ou un{" "}
            <Link href="/fr/yachts" className="font-semibold text-blue-700 underline">yacht privé</Link> pour un petit groupe.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            Pour aller plus loin, lisez nos guides{" "}
            <Link href="/fr/guides/organiser-voyage-de-groupe-entreprise" className="font-semibold text-blue-700 underline">organiser un voyage de groupe ou d'entreprise</Link>{" "}
            (échéancier, budget, règles de l'ARC) et{" "}
            <Link href="/fr/guides/destination-wedding-planning" className="font-semibold text-blue-700 underline">organiser un mariage à destination dans le sud</Link>.
          </p>
        </section>

        <Faq items={FAQ} titre="Questions des organisateurs de groupe" />
        <BandeauAction texte="Un groupe à faire voyager ? Une demande suffit pour commencer." />
      </main>
      <PiedFr />
    </div>
  );
}
