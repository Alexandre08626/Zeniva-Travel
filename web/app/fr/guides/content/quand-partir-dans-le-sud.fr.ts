// Guide FR — « Quand partir dans le sud : meilleur moment par destination (ouragans, prix, foules) »
// Emplacement prévu : web/app/fr/guides/content/quand-partir-dans-le-sud.fr.ts
// Guide FR seulement (pas de version EN) : appliquer le correctif fr-guides-slug-page.patched.tsx
// pour que la page n'annonce pas une version anglaise inexistante (/guides/<slug> = 404).
// Sources vérifiées le 2026-10-02 :
//  - Normales climatiques : Organisation météorologique mondiale (worldweather.wmo.int), données fournies par
//    les services météorologiques nationaux (SMN Mexique, ONAMET, Meteorological Service Jamaica, Bahamas Dept.
//    of Meteorology, INSMET Cuba, IMN Costa Rica, Meteorological Department Curaçao pour Oranjestad).
//  - Ouragans : National Hurricane Center (NOAA) et voyage.gc.ca.
//  - Avis Cuba : voyage.gc.ca, mise à jour du 28 septembre 2026.
// Aucun prix chiffré : aucune source officielle ne publie d'écart de prix par semaine au départ de Québec.

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_QUAND_PARTIR_SUD: GuideData = {
  slug: "quand-partir-dans-le-sud",
  title: "Quand partir dans le sud : le meilleur moment par destination (ouragans, prix, foules)",
  description:
    "Le meilleur moment pour partir dans le sud au départ du Québec, destination par destination : mois les plus secs et les plus pluvieux selon les normales des services météorologiques nationaux, saison des ouragans, semaines les plus demandées et pièges à éviter.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 8,
  tags: [
    "quand partir dans le sud",
    "meilleur moment pour aller dans le sud",
    "saison des ouragans Caraïbes",
    "meilleur mois Cancún",
    "meilleur mois Punta Cana",
    "voyage dans le sud départ Québec",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Le meilleur moment pour partir dans le sud au départ du Québec va de décembre à avril : c'est en dehors de la saison des ouragans de l'Atlantique (du 1er juin au 30 novembre, avec un pic autour du 10 septembre selon le National Hurricane Center) et, à Cancún, à Punta Cana, à La Havane et à Montego Bay, mars et avril figurent parmi les mois les moins pluvieux selon les normales des services météorologiques nationaux. Il y a deux exceptions à connaître : la côte nord de la République dominicaine (Puerto Plata) reçoit ses plus fortes pluies de novembre à janvier, et la côte Pacifique du Mexique (Puerto Vallarta) a sa propre saison des ouragans dès la mi-mai. Côté prix et foules, les semaines des Fêtes et de la relâche sont les plus demandées : la même chambre peut y coûter beaucoup plus cher qu'une semaine plus tard.",
  keyTakeaways: [
    "Saison des ouragans de l'Atlantique et des Caraïbes : du 1er juin au 30 novembre ; la plus grande partie de l'activité se produit de la mi-août à la mi-octobre (National Hurricane Center).",
    "Pacifique mexicain (Puerto Vallarta, Los Cabos) : la saison commence plus tôt, à la mi-mai, et se termine aussi à la fin novembre.",
    "Mars et avril figurent parmi les mois les moins pluvieux à Cancún, à Punta Cana, à La Havane et à Montego Bay selon les normales climatiques publiées par l'Organisation météorologique mondiale.",
    "Puerto Plata (côte nord de la République dominicaine) est l'exception : novembre, décembre et janvier y sont les mois les plus pluvieux de l'année.",
    "Nassau et La Havane sont plus fraîches en janvier (minimums moyens d'environ 17 à 19 °C) : prévoyez une petite laine pour les soirées.",
    "Cuba : le gouvernement du Canada recommande d'éviter tout voyage non essentiel et indique que les compagnies aériennes canadiennes ont suspendu leurs vols (avis du 28 septembre 2026).",
  ],
  sections: [
    {
      h: "La saison des ouragans, en dates précises",
      paragraphs: [
        "Dans l'Atlantique, la mer des Caraïbes et le golfe du Mexique, la saison officielle des ouragans va du 1er juin au 30 novembre. Le National Hurricane Center des États-Unis situe son pic au 10 septembre, la plupart de l'activité se concentrant entre la mi-août et la mi-octobre. Sur la côte Pacifique du Mexique, la saison commence dès le 15 mai.",
        "Le gouvernement du Canada rappelle que pendant cette période, même une faible tempête tropicale peut se transformer rapidement en ouragan majeur, et qu'il faut être prêt à modifier, écourter ou annuler son voyage. Il recommande de consulter les conseils aux voyageurs au moins deux fois : au moment de planifier, puis juste avant le départ.",
        "Concrètement : de décembre à mai, le risque d'ouragan dans les Caraïbes est hors saison. Juin, juillet et novembre sont dans la saison, mais en dehors de la période la plus active. De la mi-août à la mi-octobre, le risque est le plus élevé ; si vous partez quand même, choisissez une assurance qui couvre l'annulation et l'interruption de voyage et lisez ce qu'elle prévoit en cas de tempête.",
      ],
    },
    {
      h: "Destination par destination : mois secs, mois pluvieux",
      paragraphs: [
        "Le tableau suivant reprend les normales climatiques que les services météorologiques nationaux publient par l'intermédiaire de l'Organisation météorologique mondiale (précipitations moyennes mensuelles). Ce sont des moyennes sur 30 ans, pas des prévisions : une semaine donnée peut être plus sèche ou plus pluvieuse. Les périodes de référence varient selon la station (de 1951-1980 à 1981-2010).",
      ],
      table: {
        caption: "Meilleur moment par destination selon les normales climatiques et la saison des ouragans",
        columns: ["Destination", "Mois les moins pluvieux (normales)", "Mois les plus pluvieux (normales)", "Saison des ouragans", "À savoir"],
        rows: [
          ["Cancún et Riviera Maya (Mexique)", "Février à avril (38 à 53 mm par mois)", "Septembre et octobre (environ 220 mm par mois)", "1er juin au 30 novembre (Atlantique)", "Janvier est plus arrosé que février (136 mm en moyenne)."],
          ["Punta Cana (République dominicaine)", "Février et mars (54 mm), avril (69 mm)", "Octobre (152 mm), mai (124 mm)", "1er juin au 30 novembre", "Maximums moyens de 27,6 à 28,7 °C de janvier à avril."],
          ["Puerto Plata (côte nord, République dominicaine)", "Juin à septembre (57 à 81 mm)", "Novembre à janvier (190 à 232 mm)", "1er juin au 30 novembre", "L'hiver y est la saison la plus pluvieuse, à l'inverse de Punta Cana."],
          ["La Havane (Cuba)", "Mars et avril (46 et 54 mm)", "Juin (182 mm), octobre (181 mm)", "1er juin au 30 novembre", "Saison des pluies d'avril à octobre selon voyage.gc.ca ; avis « Évitez tout voyage non essentiel » en vigueur."],
          ["Montego Bay (Jamaïque)", "Mars (27 mm), avril et juillet (53 mm)", "Octobre (166 mm), septembre (127 mm)", "1er juin au 30 novembre", "Minimums moyens d'environ 20 à 22 °C de décembre à mars."],
          ["Nassau (Bahamas)", "Décembre à mars (47 à 54 mm)", "Juin (219 mm) et août (236 mm)", "1er juin au 30 novembre", "Le plus frais de la liste en janvier : 17,1 °C la nuit, 25,6 °C le jour en moyenne."],
          ["Puerto Vallarta (Pacifique mexicain)", "Février à mai (moins de 16 mm par mois)", "Juillet à septembre (312 à 370 mm)", "15 mai au 30 novembre (Pacifique)", "Hiver presque sans pluie ; été très arrosé."],
          ["Oranjestad (Aruba)", "Mars et avril (9 et 12 mm)", "Novembre (94 mm), décembre (82 mm)", "1er juin au 30 novembre", "Faibles précipitations toute l'année selon les normales."],
          ["Guanacaste (Liberia, Costa Rica)", "Décembre à avril (moins de 20 mm par mois)", "Septembre (362 mm) et octobre (317 mm)", "Côte Pacifique : mi-mai au 30 novembre", "Pluies abondantes de la mi-mai à la fin novembre selon voyage.gc.ca."],
        ],
      },
    },
    {
      h: "Mois par mois : météo, risque et demande",
      paragraphs: [
        "Le prix d'un forfait suit surtout la demande. Les semaines les plus recherchées au Québec sont celles des Fêtes et de la semaine de relâche (dont la date est fixée par chaque centre de services scolaire) : l'offre de vols directs au départ de Québec est plus petite et surtout saisonnière, et la même chambre peut y coûter beaucoup plus cher qu'une semaine plus tard. Entre ces pointes, les prix varient beaucoup d'une semaine à l'autre ; comparer plusieurs dates est souvent la meilleure économie.",
      ],
      table: {
        caption: "Calendrier du sud au départ du Québec",
        columns: ["Période", "Météo (Caraïbes et Mexique)", "Ouragans", "Demande au départ du Québec"],
        rows: [
          ["Début décembre (avant les Fêtes)", "Moins pluvieux qu'en octobre à Cancún et Punta Cana ; pluvieux à Puerto Plata", "Hors saison", "Avant la pointe des Fêtes"],
          ["Fêtes (fin décembre, début janvier)", "Comme décembre", "Hors saison", "Très forte : réservez le plus tôt possible"],
          ["Janvier et février", "Peu de pluie à Punta Cana, Nassau et Puerto Vallarta ; janvier plus arrosé à Cancún et Puerto Plata ; nuits plus fraîches à Nassau et La Havane", "Hors saison", "Variable selon la semaine"],
          ["Semaine de relâche (fin février ou mars)", "Mars figure parmi les mois les moins pluvieux presque partout", "Hors saison", "Très forte : réservez tôt"],
          ["Avril et mai", "Avril parmi les mois les plus secs à Cancún ; mai plus pluvieux à Punta Cana (124 mm) ; plus chaud", "Hors saison dans l'Atlantique ; le Pacifique mexicain commence le 15 mai", "Variable"],
          ["Juin à la mi-août", "Plus chaud et plus humide ; averses fréquentes à Nassau et Puerto Vallarta", "Dans la saison, avant la période la plus active", "Vacances scolaires d'été"],
          ["Mi-août à mi-octobre", "Mois les plus pluvieux pour la majorité des destinations", "Période la plus active (pic vers le 10 septembre)", "Aucune semaine de pointe québécoise"],
          ["Fin octobre et novembre", "Encore pluvieux à Cancún et Puerto Plata", "Dans la saison jusqu'au 30 novembre", "Variable"],
        ],
      },
    },
    {
      h: "Les pièges à éviter",
      paragraphs: [
        "Choisir Puerto Plata pour Noël en pensant au climat de Punta Cana. Les deux côtes de la République dominicaine ont des régimes de pluie opposés : novembre à janvier sont les mois les plus arrosés à Puerto Plata.",
        "Oublier le Pacifique. Puerto Vallarta et Los Cabos sont dans la saison des ouragans dès le 15 mai, deux semaines avant les Caraïbes.",
        "Partir en septembre ou en octobre sans la bonne assurance. Le gouvernement du Canada recommande de s'assurer que l'assurance voyage couvre l'annulation et l'interruption de voyage. Lisez aussi ce que votre police prévoit en cas de tempête avant de l'acheter.",
        "Réserver les Fêtes ou la relâche à la dernière minute au départ de Québec. L'offre de vols directs y est plus petite et surtout saisonnière ; comparer avec Montréal élargit le choix.",
        "Ne pas vérifier les avis aux voyageurs. Pour Cuba, le gouvernement du Canada recommande actuellement d'éviter tout voyage non essentiel. Vérifiez voyage.gc.ca au moment de réserver et juste avant de partir, et inscrivez-vous gratuitement au service d'Inscription des Canadiens à l'étranger.",
      ],
    },
    {
      h: "Comment Zeniva Travel vous aide à choisir la semaine",
      paragraphs: [
        "Dites-nous vos dates possibles, votre budget, qui voyage et votre ville de départ, par le formulaire, au 581-748-7017 ou avec Lina, la concierge virtuelle, 24 heures sur 24. Si vos dates sont flexibles, dites-le : Zeniva Travel compare plusieurs semaines et les départs de Québec (YQB) et de Montréal (YUL), et la proposition indique le prix total pour vos dates.",
        "La demande et la proposition sont gratuites et sans engagement. Une fois la proposition acceptée, le paiement se fait en ligne par ZeniPay.",
      ],
    },
  ],
  faq: [
    {
      q: "Quel est le meilleur mois pour partir dans le sud ?",
      a: "Pour la météo et le risque d'ouragan, mars et avril sont les meilleurs mois pour Cancún, Punta Cana, La Havane et Montego Bay : ils figurent parmi les moins pluvieux selon les normales des services météorologiques nationaux, et ils sont hors de la saison des ouragans. Évitez seulement la semaine de relâche si vous cherchez moins de monde et un meilleur prix.",
    },
    {
      q: "Quand est la saison des ouragans dans le sud ?",
      a: "Dans l'Atlantique, les Caraïbes et le golfe du Mexique, du 1er juin au 30 novembre, avec un pic vers le 10 septembre ; la plupart de l'activité se produit de la mi-août à la mi-octobre (National Hurricane Center). Sur la côte Pacifique du Mexique, elle commence le 15 mai.",
    },
    {
      q: "Est-ce une mauvaise idée de partir dans le sud en septembre ou en octobre ?",
      a: "C'est la période où le risque d'ouragan est le plus élevé et, dans la plupart des destinations, la plus pluvieuse de l'année. Si vous partez quand même, gardez de la flexibilité, prenez une assurance qui couvre l'annulation et l'interruption de voyage, et suivez les avis de voyage.gc.ca et du National Hurricane Center jusqu'au départ.",
    },
    {
      q: "Quand est-ce le moins cher de partir dans le sud au départ de Québec ?",
      a: "En dehors des Fêtes et de la semaine de relâche, qui sont les semaines les plus demandées. Le prix varie beaucoup d'une semaine à l'autre, même en plein hiver : si vos dates sont flexibles, faites comparer plusieurs semaines et les départs de Québec et de Montréal.",
    },
    {
      q: "Où fait-il le plus sec dans le sud en hiver ?",
      a: "Selon les normales climatiques, Puerto Vallarta et le Guanacaste (Costa Rica) ne reçoivent presque pas de pluie de décembre à avril, et Aruba a de faibles précipitations toute l'année. À l'inverse, Puerto Plata, sur la côte nord de la République dominicaine, reçoit ses plus fortes pluies de novembre à janvier.",
    },
    {
      q: "Fait-il assez chaud en janvier aux Bahamas ou à Cuba ?",
      a: "Il fait chaud le jour, mais les nuits sont plus fraîches qu'au Mexique : à Nassau, la normale de janvier est de 25,6 °C le jour et 17,1 °C la nuit ; à La Havane, 25,8 °C et 18,6 °C. Pour se baigner sans hésiter, Cancún, Punta Cana et Aruba sont plus chauds à cette période.",
    },
    {
      q: "Peut-on partir à Cuba cet hiver ?",
      a: "Dans son avis mis à jour le 28 septembre 2026, le gouvernement du Canada recommande d'éviter tout voyage non essentiel à Cuba en raison de pénuries de carburant, d'électricité, de nourriture, d'eau et de médicaments, et indique que toutes les compagnies aériennes canadiennes y ont suspendu leurs vols jusqu'à nouvel ordre. Vérifiez l'avis à jour sur voyage.gc.ca avant de réserver.",
    },
    {
      q: "Combien de temps à l'avance réserver un voyage dans le sud pour les Fêtes ou la relâche ?",
      a: "Le plus tôt possible : ce sont les semaines les plus demandées, et l'offre de vols directs au départ de Québec est plus petite et surtout saisonnière. Pour un groupe ou un mariage pendant ces périodes, prévoyez de 6 à 12 mois ou davantage.",
    },
  ],
  sources: [
    { name: "National Hurricane Center (NOAA) — Tropical cyclone climatology", url: "https://www.nhc.noaa.gov/climo/" },
    { name: "Gouvernement du Canada — Les tempêtes violentes à l'extérieur du Canada", url: "https://voyage.gc.ca/voyager/sante-securite/tempetes-violentes" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Mexique", url: "https://voyage.gc.ca/destinations/mexique" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : République dominicaine", url: "https://voyage.gc.ca/destinations/republique-dominicaine" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Cuba", url: "https://voyage.gc.ca/destinations/cuba" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Costa Rica", url: "https://voyage.gc.ca/destinations/costa-rica" },
    { name: "Gouvernement du Canada — Assurance voyage", url: "https://voyage.gc.ca/voyager/documents/assurance-voyage" },
    { name: "Gouvernement du Canada — Inscription des Canadiens à l'étranger", url: "https://voyage.gc.ca/voyager/inscription" },
    { name: "OMM, World Weather Information Service — Cancún (SMN, Mexique)", url: "https://worldweather.wmo.int/fr/city.html?cityId=1209" },
    { name: "OMM, World Weather Information Service — Punta Cana (ONAMET)", url: "https://worldweather.wmo.int/fr/city.html?cityId=596" },
    { name: "OMM, World Weather Information Service — Puerto Plata (ONAMET)", url: "https://worldweather.wmo.int/fr/city.html?cityId=595" },
    { name: "OMM, World Weather Information Service — La Havane (INSMET)", url: "https://worldweather.wmo.int/fr/city.html?cityId=280" },
    { name: "OMM, World Weather Information Service — Montego Bay (Meteorological Service, Jamaica)", url: "https://worldweather.wmo.int/fr/city.html?cityId=99" },
    { name: "OMM, World Weather Information Service — Nassau (Bahamas Department of Meteorology)", url: "https://worldweather.wmo.int/fr/city.html?cityId=97" },
    { name: "OMM, World Weather Information Service — Puerto Vallarta (SMN, Mexique)", url: "https://worldweather.wmo.int/fr/city.html?cityId=1205" },
    { name: "OMM, World Weather Information Service — Oranjestad", url: "https://worldweather.wmo.int/fr/city.html?cityId=1829" },
    { name: "OMM, World Weather Information Service — Liberia, Costa Rica (IMN)", url: "https://worldweather.wmo.int/fr/city.html?cityId=1124" },
  ],
  cta: { label: "Comparer plusieurs semaines pour mon voyage", href: "/fr/forfaits-tout-inclus" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Renseignements tirés des sources officielles ci-dessus, consultées le 2 octobre 2026. Les exigences et les avis aux voyageurs changent : vérifiez voyage.gc.ca avant de réserver et avant de partir. Les normales climatiques sont des moyennes, pas des prévisions. Ce guide ne donne aucun prix de forfait : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
