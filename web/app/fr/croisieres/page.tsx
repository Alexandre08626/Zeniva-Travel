import type { Metadata } from "next";
import Link from "next/link";
import DemandeVoyageForm from "../_components/DemandeVoyageForm.client";
import { BASE, BandeauAction, Faq, FilAriane, FrNav, PiedFr, TEL_AFFICHE, TEL_LIEN, serviceJsonLd, type QR } from "../_components/FrBlocs";

const URL = `${BASE}/fr/croisieres`;
const DESCRIPTION =
  "Croisières pour les voyageurs du Québec : Caraïbes avec vol au départ de Québec ou Montréal, Méditerranée, Alaska, et croisières Canada et Nouvelle-Angleterre qui partent du port de Québec. Proposition gratuite en français.";

export const metadata: Metadata = {
  title: "Croisières au départ de Québec et Montréal",
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { "fr-CA": URL } },
  openGraph: {
    title: "Croisières pour les voyageurs du Québec",
    description: DESCRIPTION,
    url: URL,
    siteName: "Zeniva Travel",
    type: "website",
    locale: "fr_CA",
  },
};

const TYPES = [
  {
    t: "Canada et Nouvelle-Angleterre, depuis le port de Québec",
    d: "La croisière la plus simple pour un Québécois : on embarque ou on débarque à Québec, sans vol. Ces itinéraires relient habituellement Québec ou Montréal à Boston ou New York, en passant par les Maritimes. Ils ont lieu surtout à la fin de l'été et à l'automne, pendant les couleurs.",
  },
  {
    t: "Caraïbes, avec vol depuis Québec ou Montréal",
    d: "Départs de Miami, Fort Lauderdale, Port Canaveral (Orlando) ou San Juan. Nous réservons le vol et, idéalement, une nuit d'hôtel la veille de l'embarquement pour ne pas risquer de manquer le navire en cas de retard.",
  },
  {
    t: "Méditerranée et Europe du Nord",
    d: "Barcelone, Rome, les îles grecques, la côte adriatique, ou les fjords de Norvège. On combine souvent la croisière avec quelques jours dans la ville d'embarquement.",
  },
  {
    t: "Alaska",
    d: "De mai à septembre, au départ de Vancouver ou Seattle : glaciers, fjords et faune. Souvent combinée avec un séjour dans les Rocheuses.",
  },
];

const FAQ: QR[] = [
  {
    q: "Peut-on partir en croisière directement de Québec ?",
    r: "Oui. Le port de Québec accueille des navires de croisière surtout de la fin de l'été à l'automne. Certains itinéraires commencent ou se terminent à Québec (souvent vers ou depuis Boston ou New York) ; d'autres font seulement escale à Québec. Les dates changent chaque année : demandez-nous les départs de la saison.",
  },
  {
    q: "Qu'est-ce qui est inclus dans le prix d'une croisière ?",
    r: "Habituellement : la cabine, les repas dans les restaurants principaux et le buffet, les spectacles et la plupart des activités à bord. Ne sont généralement pas inclus : les frais de service quotidiens (pourboires), les taxes et frais portuaires s'ils ne sont pas déjà ajoutés, les forfaits de boissons, le Wi-Fi, les restaurants de spécialité et les excursions. Notre proposition indique le prix total et ce qui est inclus.",
  },
  {
    q: "Comment choisir sa cabine ?",
    r: "Cabine intérieure pour le meilleur prix, avec hublot pour la lumière, avec balcon pour profiter de la mer en privé, suite pour plus d'espace et de services. Au milieu du navire et sur un pont bas, on ressent moins le mouvement : à retenir si vous avez le mal de mer.",
  },
  {
    q: "Faut-il un passeport pour une croisière ?",
    r: "Pour une croisière qui passe par les États-Unis ou les Caraïbes, prévoyez un passeport valide. Les exigences varient selon les escales ; vérifiez-les sur voyage.gc.ca, le site du gouvernement du Canada.",
  },
  {
    q: "Une croisière convient-elle à un groupe ?",
    r: "Très bien : un seul prix couvre l'hébergement, les repas et les déplacements, et chacun choisit ses activités. Les compagnies offrent des conditions de groupe à partir d'un certain nombre de cabines. Voyez notre page sur les voyages de groupe.",
  },
];

export default function Croisieres() {
  const service = serviceJsonLd("Croisières pour les voyageurs du Québec", DESCRIPTION, URL, "Réservation de croisières");

  return (
    <div lang="fr-CA" className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <FrNav />
      <FilAriane items={[{ nom: "Accueil", url: `${BASE}/fr` }, { nom: "Croisières", url: URL }]} />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Croisières au départ de Québec et Montréal
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Caraïbes, Méditerranée, Alaska, ou une croisière qui part du port de Québec. Dites-nous la période, le
              budget et le type de cabine : nous comparons les compagnies et les itinéraires, puis nous réservons la
              croisière, le vol et la nuit d'hôtel avant l'embarquement.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#demande" className="rounded-full bg-[#0B1B4D] px-6 py-3 font-black text-white">Recevoir une proposition</a>
              <a href={TEL_LIEN} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-900">📞 {TEL_AFFICHE}</a>
            </div>
          </div>
          <div id="demande" className="scroll-mt-24">
            <DemandeVoyageForm source="/fr/croisieres" typeVoyage="Croisière" destinationParDefaut="Croisière " titre="Votre croisière" />
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Quelle croisière pour vous ?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {TYPES.map((x) => (
                <article key={x.t} className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900">{x.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{x.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Le vrai prix d'une croisière</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-slate-700">
            <p>
              Le prix affiché par les compagnies est rarement le prix final. Il faut ajouter, selon le cas, les taxes et
              frais portuaires, les frais de service quotidiens par personne, le vol jusqu'au port, la nuit d'hôtel
              avant l'embarquement, l'assurance voyage, et les extras à bord (boissons, Wi-Fi, excursions).
            </p>
            <p>
              Notre proposition additionne ces postes pour que vous compariez des prix complets, pas des prix d'appel.
              Vous voyagez à plusieurs ? Voyez les{" "}
              <Link href="/fr/voyage-de-groupe" className="font-semibold text-blue-700 underline">voyages de groupe</Link>. Vous préférez
              la plage sans bouger d'hôtel ? Voyez les{" "}
              <Link href="/fr/forfaits-tout-inclus" className="font-semibold text-blue-700 underline">forfaits tout inclus</Link>.
            </p>
            <p className="text-sm text-slate-500">
              Sources : Port de Québec,{" "}
              <a href="https://www.portquebec.ca/" className="underline" rel="noopener">portquebec.ca</a> ; exigences
              d'entrée : gouvernement du Canada,{" "}
              <a href="https://voyage.gc.ca/destinations" className="underline" rel="noopener">voyage.gc.ca</a>.
            </p>
          </div>
        </section>

        <Faq items={FAQ} titre="Questions fréquentes sur les croisières" />
        <BandeauAction texte="La bonne croisière, au prix complet, expliquée en français." />
      </main>
      <PiedFr />
    </div>
  );
}
