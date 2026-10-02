// Guide FR — « Cuba, Mexique ou République dominicaine : quel tout-inclus choisir au départ de Québec »
// Emplacement prévu : web/app/fr/guides/content/cuba-mexique-ou-republique-dominicaine-depuis-quebec.fr.ts
// Guide FR seulement (pas de version EN) : appliquer le correctif fr-guides-slug-page.patched.tsx
// pour que la page n'annonce pas une version anglaise inexistante (/guides/<slug> = 404).
// Sources vérifiées le 2026-10-02. Les avis aux voyageurs changent : revalider avant chaque mise à jour.

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_CUBA_MEXIQUE_RD: GuideData = {
  slug: "cuba-mexique-ou-republique-dominicaine-depuis-quebec",
  title: "Cuba, Mexique ou République dominicaine : quel tout-inclus choisir au départ de Québec ?",
  description:
    "Comparatif à jour pour l'hiver 2026-2027 : avis du gouvernement du Canada, vols, passeport, visa, formulaires d'entrée et taxes locales à Cuba, au Mexique et en République dominicaine, avec les pièges à éviter quand on part de Québec.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 8,
  tags: [
    "Cuba ou Mexique",
    "Mexique ou République dominicaine",
    "tout inclus départ Québec",
    "voyage dans le sud hiver 2027",
    "Punta Cana ou Cancún",
    "avis aux voyageurs Cuba",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Au départ de Québec cet hiver, le choix se fait en pratique entre le Mexique et la République dominicaine : dans son avis mis à jour le 28 septembre 2026, le gouvernement du Canada recommande d'éviter tout voyage non essentiel à Cuba et indique que toutes les compagnies aériennes canadiennes y ont suspendu leurs vols jusqu'à nouvel ordre. Le Mexique et la République dominicaine sont tous deux au niveau « Faites preuve d'une grande prudence » ; la différence se joue surtout sur le complexe, la semaine, la ville de départ et quelques formalités (FMMN et taxe VISITAX au Mexique, billet électronique en République dominicaine).",
  keyTakeaways: [
    "Cuba : avis « Évitez tout voyage non essentiel » et vols des transporteurs canadiens suspendus jusqu'à nouvel ordre, selon le gouvernement du Canada (28 septembre 2026).",
    "Mexique : « Faites preuve d'une grande prudence » à l'échelle du pays ; l'avertissement régional d'éviter les voyages non essentiels vise une liste d'États qui ne comprend pas le Quintana Roo (Cancún, Riviera Maya).",
    "République dominicaine : « Faites preuve d'une grande prudence » ; billet électronique obligatoire avant l'embarquement, à chaque voyage.",
    "Passeport : jusqu'au 31 décembre 2026, un passeport valide pour la durée du séjour suffit pour la République dominicaine (tourisme) ; sinon, la règle est de 6 mois après l'arrivée. Au Mexique, il doit être valide pour la durée du séjour.",
    "La saison des ouragans va du début juin à la fin novembre ; pour un départ d'hiver, ce sont surtout la semaine et la catégorie du complexe qui font varier le prix.",
  ],
  sections: [
    {
      h: "Où en est Cuba à l'automne 2026",
      paragraphs: [
        "Le gouvernement du Canada recommande d'éviter tout voyage non essentiel à Cuba en raison de l'aggravation des pénuries de carburant, d'électricité et de produits de première nécessité, notamment de nourriture, d'eau et de médicaments. Selon l'avis, ces pénuries peuvent aussi toucher les services dans les stations balnéaires, et les coupures d'électricité sont quotidiennes, longues et imprévisibles.",
        "Le même avis indique que toutes les compagnies aériennes canadiennes ont suspendu leur service vers Cuba jusqu'à nouvel ordre, et que la capacité de l'ambassade du Canada à La Havane à fournir des services consulaires pourrait être réduite.",
        "En pratique, pour un forfait tout inclus au départ de Québec cet hiver, Cuba n'est pas une option à planifier tant que cet avis est en vigueur. Si vous aviez déjà un voyage réservé, communiquez avec votre transporteur ou votre voyagiste et vérifiez les conditions de votre assurance.",
      ],
    },
    {
      h: "Comparatif des formalités au 2 octobre 2026",
      paragraphs: [
        "Le tableau reprend ce que publie le gouvernement du Canada pour chaque pays, plus la taxe touristique du Quintana Roo. Ces règles peuvent changer à tout moment : vérifiez-les sur voyage.gc.ca avant le départ.",
      ],
      table: {
        caption: "Cuba, Mexique et République dominicaine : ce qu'il faut savoir avant de réserver (sources officielles, 2 octobre 2026)",
        columns: ["Critère", "Cuba", "Mexique", "République dominicaine"],
        rows: [
          ["Avis du gouvernement du Canada", "Évitez tout voyage non essentiel (mis à jour le 28 sept. 2026)", "Faites preuve d'une grande prudence, avec avertissements régionaux pour certains États (mis à jour le 1er oct. 2026)", "Faites preuve d'une grande prudence (mis à jour le 26 mai 2026)"],
          ["Vols des transporteurs canadiens", "Suspendus jusqu'à nouvel ordre", "Pas de suspension mentionnée dans l'avis", "Pas de suspension mentionnée dans l'avis"],
          ["Passeport canadien", "Valide pour la durée du séjour", "Valide pour la durée du séjour", "Valide pour la durée du séjour jusqu'au 31 déc. 2026 (tourisme) ; sinon 6 mois après l'arrivée"],
          ["Visa de touriste", "Exigé", "Non exigé jusqu'à 180 jours", "Non exigé pour 30 jours ou moins"],
          ["Formulaire d'entrée", "Formulaire douanier en ligne D'Viajeros, dès 72 h avant l'entrée (code QR)", "Formulaire migratoire multiple numérique (FMMN) rempli en ligne à l'arrivée par avion", "Billet électronique à remplir avant l'embarquement, à l'entrée et à la sortie"],
          ["Frais sur place à prévoir", "Preuve d'assurance maladie exigée à l'arrivée ; factures médicales payables en espèces (USD)", "Taxe VISITAX du Quintana Roo, obligatoire pour tous les touristes étrangers, enfants compris", "Carte de touriste incluse dans le billet d'avion pour les arrivées par avion"],
          ["Présence consulaire canadienne en zone touristique", "Ambassade à La Havane (services possiblement réduits)", "Agences consulaires à Cancún et à Playa del Carmen", "Bureau de l'ambassade à Punta Cana"],
        ],
      },
    },
    {
      h: "Mexique ou République dominicaine : comment trancher",
      paragraphs: [
        "Sur le plan des formalités et de l'avis du gouvernement du Canada, les deux destinations se valent pour un séjour dans un complexe. Le choix se fait donc sur ce que vous voulez vivre et sur le prix réel pour vos dates.",
        "Le Mexique (Cancún, Riviera Maya) convient bien si vous voulez un très grand choix de complexes, de l'économique au haut de gamme, et sortir du complexe pour des excursions, comme les cénotes et les sites mayas. Prévoyez la taxe VISITAX et gardez votre FMMN sur vous pendant tout le séjour.",
        "La République dominicaine (Punta Cana, côte nord) convient bien à ceux qui veulent surtout la plage et le complexe, notamment en famille. Le billet électronique se remplit avant de partir, et la carte de touriste est incluse dans le billet d'avion.",
        "Dans les deux cas, la semaine compte plus que la destination : la même chambre peut coûter beaucoup plus cher pendant les Fêtes ou la semaine de relâche qu'une semaine plus tard. Comparez aussi le départ de Québec (YQB), plus pratique mais avec une offre de vols directs plus petite et surtout saisonnière, et celui de Montréal (YUL), qui offre plus de dates et de destinations.",
      ],
    },
    {
      h: "Les étapes pour bien réserver au départ de Québec",
      paragraphs: [
        "1. Vérifiez l'avis aux voyageurs du pays sur voyage.gc.ca le jour où vous réservez, puis de nouveau avant le départ.",
        "2. Vérifiez la date d'expiration de chaque passeport du groupe. Pour la République dominicaine, la règle assouplie (passeport valide pour la durée du séjour) est annoncée jusqu'au 31 décembre 2026 ; pour un départ en 2027, prévoyez au moins 6 mois de validité après l'arrivée, à moins d'une nouvelle annonce.",
        "3. Donnez une plage de dates plutôt qu'une semaine fixe, et demandez la comparaison YQB et YUL en incluant le coût du déplacement et du stationnement.",
        "4. Comparez les complexes sur le même gabarit : catégorie de chambre, nombre de restaurants à la carte, réservation obligatoire ou non, section adultes, club pour enfants.",
        "5. Ajoutez au budget ce que le forfait n'inclut pas : assurance voyage, bagages et sièges selon le transporteur, pourboires, excursions et, au Quintana Roo, la taxe VISITAX.",
        "6. Remplissez les formulaires officiels au bon moment : billet électronique dominicain avant l'embarquement ; FMMN mexicain en ligne à l'arrivée, à télécharger et à garder sur vous.",
      ],
    },
    {
      h: "Les pièges à éviter",
      paragraphs: [
        "Réserver Cuba parce que le prix semble bas. Tant que l'avis « Évitez tout voyage non essentiel » est en vigueur et que les transporteurs canadiens ne desservent plus l'île, un prix bas ne compense pas le risque d'annulation, de pénuries au complexe et de services consulaires réduits.",
        "Perdre son FMMN au Mexique. Le gouvernement du Canada indique qu'au départ, si vous ne pouvez pas présenter votre FMMN ou votre passeport avec le tampon d'entrée, vous pourriez devoir payer un remplacement.",
        "Oublier le billet électronique dominicain. Il est obligatoire, il faut en remplir un nouveau à chaque voyage, et il doit être fait avant l'embarquement. Il ne remplace pas la carte de touriste.",
        "Se fier à l'assurance maladie provinciale. Le gouvernement du Canada rappelle qu'elle offre une couverture très limitée à l'extérieur du Canada et n'inclut pas l'évacuation médicale. Prenez une assurance voyage qui couvre les soins à l'étranger et, idéalement, l'annulation.",
        "Partir en saison des ouragans sans flexibilité. La saison s'étend du début juin à la fin novembre dans l'Atlantique, la mer des Caraïbes et le golfe du Mexique. Si vous voyagez à ces dates, suivez les prévisions et gardez les coordonnées d'urgence de votre transporteur ou de votre voyagiste.",
      ],
    },
    {
      h: "Comment Zeniva Travel compare les options pour vous",
      paragraphs: [
        "Vous indiquez vos dates (ou une plage de dates), le nombre de voyageurs, votre budget et votre ville de départ. Zeniva Travel compare les complexes et les vols au départ de Québec (YQB) et de Montréal (YUL), et aussi d'Ottawa ou d'une autre ville si c'est plus avantageux, et vous remet une proposition avec le prix total pour vos dates.",
        "La proposition est gratuite et sans engagement. Vous la faites modifier au besoin (autre complexe, autres dates, autre budget), puis vous confirmez et payez en ligne de façon sécurisée par ZeniPay. Le service est offert en français et en anglais, par formulaire, au 581-748-7017 ou avec Lina, la concierge virtuelle, 24 heures sur 24.",
      ],
    },
  ],
  faq: [
    {
      q: "Est-ce qu'on peut encore aller à Cuba au départ de Québec cet hiver ?",
      a: "Le gouvernement du Canada recommande d'éviter tout voyage non essentiel à Cuba et indique que toutes les compagnies aériennes canadiennes y ont suspendu leurs vols jusqu'à nouvel ordre (avis mis à jour le 28 septembre 2026). Des vols de compagnies étrangères existent, mais leur disponibilité peut diminuer à court préavis. Pour un forfait tout inclus au départ de Québec, regardez plutôt le Mexique ou la République dominicaine tant que cet avis est en vigueur.",
    },
    {
      q: "Mexique ou République dominicaine : lequel est le plus sécuritaire selon le gouvernement du Canada ?",
      a: "Les deux pays sont au même niveau national : « Faites preuve d'une grande prudence ». Le Mexique a en plus des avertissements régionaux d'éviter les voyages non essentiels dans certains États ; le Quintana Roo, où se trouvent Cancún et la Riviera Maya, ne fait pas partie de cette liste au 1er octobre 2026.",
    },
    {
      q: "Est-ce que j'ai besoin d'un visa pour aller au Mexique ou en République dominicaine ?",
      a: "Non pour un séjour touristique : le visa n'est pas exigé pour les Canadiens jusqu'à 180 jours au Mexique et pour 30 jours ou moins en République dominicaine. Il faut toutefois remplir le FMMN à l'arrivée au Mexique et le billet électronique avant l'embarquement pour la République dominicaine.",
    },
    {
      q: "Mon passeport expire dans quatre mois, est-ce que je peux aller à Punta Cana ?",
      a: "Jusqu'au 31 décembre 2026, le gouvernement du Canada indique que les Canadiens peuvent entrer en République dominicaine pour du tourisme avec un passeport valide pour la durée du séjour. Pour un voyage en 2027, la règle publiée est un passeport valide au moins 6 mois après l'arrivée. Vérifiez aussi les exigences de votre transporteur, qui peuvent être plus strictes.",
    },
    {
      q: "C'est quoi la taxe VISITAX à Cancún ?",
      a: "C'est une contribution obligatoire de l'État du Quintana Roo (Cancún, Riviera Maya, Cozumel) que doivent payer tous les touristes étrangers, enfants compris, quel que soit leur moyen de départ. Elle se paie sur le site officiel visitax.gob.mx ; demandez si elle est comprise dans votre forfait.",
    },
    {
      q: "Quand est la saison des ouragans dans le sud ?",
      a: "Du début juin à la fin novembre dans l'Atlantique, la mer des Caraïbes et le golfe du Mexique, selon le gouvernement du Canada. Les départs de décembre à avril sont en dehors de cette période.",
    },
    {
      q: "Vaut-il mieux partir de Québec ou de Montréal pour aller dans le sud ?",
      a: "Partir de Québec (YQB) évite la route et le stationnement à Montréal, mais l'offre de vols directs est plus petite et surtout saisonnière. Montréal (YUL) offre plus de destinations et de dates. Le bon choix dépend de vos dates : comparez les deux en incluant le coût du déplacement.",
    },
    {
      q: "Zeniva Travel peut-elle comparer le Mexique et la République dominicaine pour mes dates ?",
      a: "Oui. Décrivez vos dates, le nombre de voyageurs, votre budget et votre ville de départ par le formulaire, au 581-748-7017 ou avec Lina, 24 heures sur 24. Vous recevez une proposition gratuite et sans engagement avec le prix total, au départ de Québec ou de Montréal, et vous payez en ligne par ZeniPay seulement si vous confirmez.",
    },
  ],
  sources: [
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Cuba (mis à jour le 28 septembre 2026)", url: "https://voyage.gc.ca/destinations/cuba" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Mexique (mis à jour le 1er octobre 2026)", url: "https://voyage.gc.ca/destinations/mexique" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : République dominicaine (mis à jour le 26 mai 2026)", url: "https://voyage.gc.ca/destinations/republique-dominicaine" },
    { name: "Gouvernement du Quintana Roo — VISITAX (site officiel)", url: "https://www.visitax.gob.mx/sitio/" },
    { name: "Gouvernement de Cuba — Portail D'Viajeros", url: "https://dviajeros.mitrans.gob.cu/" },
  ],
  cta: { label: "Comparer le Mexique et la République dominicaine pour mes dates", href: "/fr/forfaits-tout-inclus" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Renseignements tirés des sources officielles ci-dessus, consultées le 2 octobre 2026. Les exigences et les avis aux voyageurs changent : vérifiez voyage.gc.ca avant de réserver et avant de partir. Ce guide ne donne aucun prix de forfait : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
