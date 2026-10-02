// Guide FR — « Lune de miel dans le sud ou en croisière : choisir et budgéter »
// Guide FR seulement (pas de version EN) : /fr/guides/[slug] n'annonce la version anglaise que si elle existe.
// Complète sans le dupliquer destination-wedding-planning (cérémonie, documents du mariage, bloc de chambres) :
// ici, seulement le voyage du couple après le mariage.
// Sources vérifiées le 2026-10-02 :
//  - Code civil du Québec, art. 393 (LégisQuébec) : chaque époux conserve son nom en mariage.
//  - voyage.gc.ca : exigences d'identification avant l'embarquement (modifiée le 2026-09-01), santé et sécurité en
//    croisière (mise à jour le 2026-09-03), États-Unis (28 sept. 2026), Cuba (28 sept. 2026).
//  - Princess Cruises, Holland America Line, Norwegian Cruise Line : frais de service quotidiens publiés (USD).
//  - Banque du Canada : 1 $ US = 1,4243 $ CA (moyenne du 2026-10-01).
//  - canada.ca : frais de passeport depuis le 31 mars 2026. NHC : saison des ouragans.
// Aucun prix de forfait ni de croisière : seuls les frais publiés par les compagnies sont chiffrés.

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_LUNE_DE_MIEL: GuideData = {
  slug: "lune-de-miel-sud-ou-croisiere-budget",
  title: "Lune de miel dans le sud ou en croisière : comment choisir et budgéter",
  description:
    "Tout-inclus dans le sud ou croisière pour un voyage de noces au départ du Québec : comparatif point par point, frais de service quotidiens publiés par les compagnies de croisière, postes de budget à prévoir, nom sur le billet après le mariage et pièges à éviter.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 7,
  tags: [
    "lune de miel dans le sud",
    "voyage de noces croisière",
    "budget lune de miel",
    "tout inclus ou croisière",
    "frais de service croisière",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Choisissez le tout-inclus dans le sud si vous voulez vous reposer au même endroit avec un budget presque entièrement connu d'avance, et la croisière si vous voulez voir plusieurs escales en une semaine en acceptant plus de frais variables à bord : frais de service quotidiens de 18 à 25 $ US par personne chez Princess, Holland America et Norwegian, soit environ 359 $ à 499 $ CA pour un couple sur 7 jours, en plus des boissons, du Wi-Fi et des excursions selon le forfait choisi. Dans les deux cas, réservez au nom inscrit sur votre passeport : au Québec, chaque époux conserve son nom en mariage (article 393 du Code civil), et le nom sur la pièce d'identité doit correspondre à celui du billet.",
  keyTakeaways: [
    "Tout-inclus : un seul endroit, repas et boissons compris, peu de frais imprévus ; idéal pour se reposer après le mariage.",
    "Croisière : plusieurs escales sans refaire ses valises, mais des frais variables à bord (frais de service, boissons, Wi-Fi, restaurants de spécialité, excursions).",
    "Frais de service quotidiens publiés : Princess 18 à 20 $ US, Holland America 18 à 20 $ US, Norwegian 20 à 25 $ US par personne et par jour selon la cabine.",
    "Au Québec, on ne prend pas le nom de son conjoint en se mariant : réservez au nom qui figure sur votre passeport.",
    "Mariage à l'automne ? De juin à novembre, c'est la saison des ouragans dans l'Atlantique et les Caraïbes ; le pic est vers le 10 septembre (National Hurricane Center).",
  ],
  sections: [
    {
      h: "Tout-inclus ou croisière : le comparatif",
      paragraphs: [
        "La bonne formule dépend surtout de ce que vous voulez faire de vos journées. Le tableau suivant compare les deux sur les points qui comptent pour un couple.",
      ],
      table: {
        caption: "Lune de miel : tout-inclus dans le sud ou croisière",
        columns: ["Critère", "Tout-inclus dans le sud", "Croisière"],
        rows: [
          ["Rythme", "Un seul endroit, aucune valise à refaire", "Une escale différente presque chaque jour, sans refaire ses valises"],
          ["Ce qui est compris", "Chambre, repas, boissons de base, activités non motorisées ; souvent vol et transferts dans le forfait", "Cabine, repas des restaurants principaux et du buffet, spectacles ; vol et nuit d'hôtel avant l'embarquement en plus"],
          ["Frais variables", "Peu : pourboires, excursions, spa, restaurants ou boissons haut de gamme selon le complexe", "Plus nombreux : frais de service quotidiens, boissons, Wi-Fi, restaurants de spécialité, excursions"],
          ["Intimité", "Complexes ou sections réservés aux adultes, chambres et suites avec vue", "Cabine avec balcon ou suite ; navires plus ou moins grands"],
          ["Départ du Québec", "Vols de Québec (YQB) et de Montréal (YUL) vers le sud, surtout en hiver", "Vol vers le port (Miami, Fort Lauderdale, etc.) ou, à l'automne, embarquement à Québec ou à Montréal"],
          ["Pour qui", "Le couple qui veut d'abord se reposer", "Le couple qui veut voir plusieurs endroits en une semaine"],
        ],
      },
    },
    {
      h: "Le budget : les postes à prévoir",
      paragraphs: [
        "Le prix du forfait ou de la croisière dépend de la semaine, de la catégorie de chambre ou de cabine et de la ville de départ : il se compare seulement pour vos dates. Les montants ci-dessous sont ceux que publient les compagnies et le gouvernement ; ils s'ajoutent au prix de base. Les conversions en dollars canadiens utilisent le taux de la Banque du Canada du 1er octobre 2026 (1 $ US = 1,4243 $ CA), avant frais de change.",
      ],
      table: {
        caption: "Frais publiés à ajouter au prix de base (au 2 octobre 2026)",
        columns: ["Poste", "Montant publié", "Pour un couple, 7 jours", "Précisions"],
        rows: [
          ["Frais de service quotidiens, Princess Cruises", "18 $ US (cabines), 19 $ US (mini-suites), 20 $ US (suites) par personne et par jour", "252 $ à 280 $ US (environ 359 $ à 399 $ CA)", "Ajoutés au compte de bord ; ajustables à bord avant le débarquement"],
          ["Frais de service quotidiens, Holland America Line", "18 $ US (cabines), 20 $ US (suites) par personne et par jour", "252 $ à 280 $ US (environ 359 $ à 399 $ CA)", "Frais de service de 20 % sur les boissons et les restaurants de spécialité"],
          ["Frais de service quotidiens, Norwegian Cruise Line", "20 $ US (jusqu'à Club Balcony Suite), 25 $ US (The Haven et suites) par personne et par jour", "280 $ à 350 $ US (environ 399 $ à 499 $ CA)", "Facturés à tous les passagers de 3 ans et plus"],
          ["Achats à bord (Princess)", "Frais de service de 20 % ajoutés automatiquement", "Selon la consommation", "Boissons, restaurants de spécialité et autres services optionnels"],
          ["Passeport adulte, 10 ans", "163,50 $ par personne", "327 $", "Gouvernement du Canada, depuis le 31 mars 2026"],
          ["Assurance voyage", "Selon l'assureur", "Selon l'âge et la durée", "Hospitalisation et évacuation médicale à vérifier pour une croisière (voyage.gc.ca)"],
          ["Tout-inclus : pourboires, excursions, spa", "Selon le complexe", "Selon vos choix", "Le pourboire est facultatif ; la proposition indique ce qui est inclus ou non"],
        ],
      },
    },
    {
      h: "Le nom sur les billets : le piège québécois",
      paragraphs: [
        "Au Québec, l'article 393 du Code civil prévoit que chacun des époux conserve, en mariage, son nom, et exerce ses droits civils sous ce nom. Se marier ne change donc pas le nom qui figure sur votre passeport.",
        "Le gouvernement du Canada rappelle que le nom sur la pièce d'identité doit correspondre au nom inscrit sur le billet et la carte d'embarquement. Réservez vols, hôtel et croisière exactement au nom de votre passeport, même si vous utilisez socialement le nom de votre conjoint.",
        "Si vous vous mariez à l'étranger, les démarches pour faire reconnaître le mariage au Québec sont expliquées dans notre guide sur le mariage à destination.",
      ],
    },
    {
      h: "Choisir la période",
      paragraphs: [
        "Si votre mariage a lieu entre juin et novembre, la lune de miel tombe dans la saison des ouragans de l'Atlantique (du 1er juin au 30 novembre, pic vers le 10 septembre selon le National Hurricane Center). Partir quand même est possible ; prévoyez une assurance qui couvre l'annulation et l'interruption de voyage, et lisez ce qu'elle prévoit en cas de tempête.",
        "Si vous pouvez attendre, de décembre à avril est hors de la saison des ouragans dans les Caraïbes. Notre guide sur le meilleur moment pour partir dans le sud compare les mois les plus secs par destination. Pour une croisière, des navires embarquent et débarquent des passagers à Québec à l'automne, sur l'itinéraire Canada et Nouvelle-Angleterre : voyez notre guide sur les croisières au départ de Montréal et de Québec.",
        "Cuba : dans son avis mis à jour le 28 septembre 2026, le gouvernement du Canada recommande d'éviter tout voyage non essentiel à Cuba et indique que les compagnies aériennes canadiennes y ont suspendu leurs vols. Vérifiez voyage.gc.ca avant de réserver.",
      ],
    },
    {
      h: "Les pièges à éviter",
      paragraphs: [
        "Comparer un tout-inclus et une croisière sur le prix de base. Ajoutez à la croisière le vol jusqu'au port, la nuit d'hôtel avant l'embarquement, les frais de service quotidiens et les extras ; ajoutez au tout-inclus les excursions et l'assurance. Comparez des totaux.",
        "Prendre le vol le jour même de l'embarquement. Un retard suffit pour manquer le navire ; arrivez la veille.",
        "Réserver au nom de votre conjoint. Au Québec, votre nom ne change pas en vous mariant : le billet doit porter le nom du passeport.",
        "Oublier la validité du passeport. Pour une croisière, le gouvernement du Canada recommande un passeport valide, et certains ports peuvent refuser les passagers qui n'en ont pas.",
        "Partir le lendemain du mariage sans marge. Prévoyez une journée tampon si le mariage a lieu loin de l'aéroport.",
      ],
    },
    {
      h: "Comment Zeniva Travel prépare une lune de miel",
      paragraphs: [
        "Dites-nous vos dates possibles, votre budget, votre ville de départ et ce que vous préférez (repos, découvertes, plusieurs escales), par le formulaire, au 581-748-7017 ou avec Lina, la concierge virtuelle, 24 heures sur 24. Nous pouvons comparer un tout-inclus et une croisière pour les mêmes dates : la proposition indique ce qui est inclus ou non et le prix total.",
        "La demande et la proposition sont gratuites et sans engagement. Une fois la proposition acceptée, le paiement se fait en ligne par ZeniPay.",
      ],
    },
  ],
  faq: [
    {
      q: "Vaut-il mieux faire sa lune de miel dans un tout-inclus ou en croisière ?",
      a: "Le tout-inclus convient au couple qui veut se reposer au même endroit avec un budget presque entièrement connu d'avance. La croisière convient au couple qui veut voir plusieurs escales en une semaine, en acceptant des frais variables à bord : frais de service quotidiens, boissons, Wi-Fi et excursions.",
    },
    {
      q: "Combien coûtent les pourboires sur une croisière ?",
      a: "Les compagnies facturent des frais de service quotidiens par personne. Au 2 octobre 2026 : Princess 18 à 20 $ US, Holland America 18 à 20 $ US, Norwegian 20 à 25 $ US par personne et par jour selon la cabine. Pour un couple sur 7 jours, cela représente 252 $ à 350 $ US, soit environ 359 $ à 499 $ CA.",
    },
    {
      q: "Faut-il réserver la lune de miel à son nom de jeune fille ?",
      a: "Au Québec, oui : selon l'article 393 du Code civil, chaque époux conserve son nom en mariage. Le nom sur le billet et la carte d'embarquement doit correspondre à celui de la pièce d'identité, donc à celui de votre passeport.",
    },
    {
      q: "Quel budget prévoir en plus du forfait pour une lune de miel ?",
      a: "Pour une croisière : le vol jusqu'au port, une nuit d'hôtel la veille, les frais de service quotidiens et les extras à bord. Pour un tout-inclus : les excursions, le spa, les pourboires et les restaurants haut de gamme selon le complexe. Dans les deux cas : l'assurance voyage et, au besoin, le passeport (163,50 $ pour 10 ans).",
    },
    {
      q: "Peut-on partir en lune de miel en septembre ou en octobre dans le sud ?",
      a: "Oui, mais c'est la période la plus active de la saison des ouragans de l'Atlantique (pic vers le 10 septembre selon le National Hurricane Center). Prenez une assurance qui couvre l'annulation et l'interruption de voyage, et suivez les avis jusqu'au départ.",
    },
    {
      q: "Peut-on faire une croisière de noces sans prendre l'avion au Québec ?",
      a: "Oui, à l'automne surtout : le Port de Québec est un port de départ et d'arrivée sur l'itinéraire Canada et Nouvelle-Angleterre. Prévoyez un passeport valide, et un vol ou un train de retour si la croisière se termine à Boston ou à New York.",
    },
  ],
  sources: [
    { name: "LégisQuébec — Code civil du Québec, article 393", url: "https://www.legisquebec.gouv.qc.ca/fr/document/lc/CCQ-1991" },
    { name: "Gouvernement du Canada — Exigences en matière d'identification avant l'embarquement", url: "https://voyage.gc.ca/avion/exigences-d-identification" },
    { name: "Gouvernement du Canada — Santé et sécurité en croisière", url: "https://voyage.gc.ca/voyager/sante-securite/conseils-pour-voyageurs/voyage-croisiere" },
    { name: "Princess Cruises — Crew Appreciation and Service Charge Policy", url: "https://www.princess.com/html/global/disclaimers/crew-appreciation/" },
    { name: "Holland America Line — Crew Appreciation and service charges", url: "https://www.hollandamerica.com/en_US/hotel-service-charge.html" },
    { name: "Norwegian Cruise Line — What is the onboard service charge?", url: "https://www.ncl.com/cruise-faq/what-is-onboard-service-charge" },
    { name: "Banque du Canada — Taux de change quotidiens", url: "https://www.banqueducanada.ca/taux/taux-de-change/taux-de-change-quotidiens/" },
    { name: "Gouvernement du Canada — Modification des frais de passeport et de documents de voyage", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/frais/modification-frais-passeport.html" },
    { name: "National Hurricane Center (NOAA) — Tropical cyclone climatology", url: "https://www.nhc.noaa.gov/climo/" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Cuba", url: "https://voyage.gc.ca/destinations/cuba" },
    { name: "Port de Québec — Croisières au départ de Québec", url: "https://www.portquebec.ca/croisieres/informations-aux-croisieristes/croisieres-au-depart-de-quebec/" },
  ],
  cta: { label: "Comparer tout-inclus et croisière pour mes dates", href: "/fr/forfaits-tout-inclus" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Frais de service publiés par les compagnies de croisière et consultés le 2 octobre 2026 ; ils peuvent changer sans préavis. Les conversions en dollars canadiens sont indicatives (taux de la Banque du Canada du 1er octobre 2026). Ce guide ne donne aucun prix de forfait ni de croisière : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
