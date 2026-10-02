// Guide FR — « Croisières au départ de Montréal et de Québec : itinéraires, saison et documents »
// Guide FR seulement (pas de version EN) : /fr/guides/[slug] n'annonce la version anglaise que si elle existe.
// Complète la page de conversion /fr/croisieres (types de croisières, ce qui est inclus, choix de cabine) sans la
// dupliquer : ici, la logistique des départs de Québec et de Montréal (terminaux, horaire, stationnement, documents,
// douanes au retour). La page /fr/croisieres reste la cible du CTA.
// Sources vérifiées le 2026-10-02 :
//  - Port de Québec : croisières au départ de Québec, terminaux, débarquement, horaire 2026 (PDF mis à jour le 2026-10-02 11 h).
//  - Tourisme Montréal (mtl.org) : Grand Quai du Port de Montréal. port-montreal.com répond 403 : aucun chiffre de l'APM repris.
//  - voyage.gc.ca : États-Unis (exigences d'entrée, croisières ; 28 sept. 2026), santé et sécurité en croisière (2026-09-03).
//  - ASFC : carte de déclaration E311 (exemptions personnelles, modifiée le 2022-11-23).
//  - Princess, Holland America, Norwegian : frais de service quotidiens publiés (USD).

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_CROISIERES_QC_MTL: GuideData = {
  slug: "croisieres-depuis-montreal-et-quebec",
  title: "Croisières au départ de Montréal et de Québec : itinéraires, saison et documents",
  description:
    "Partir en croisière sans prendre l'avion : quelles compagnies embarquent à Québec, ce que dessert le Grand Quai de Montréal, la saison selon l'horaire du Port de Québec, les terminaux et le stationnement, les documents pour entrer aux États-Unis et les douanes au retour.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 7,
  tags: [
    "croisière au départ de Québec",
    "croisière au départ de Montréal",
    "croisière Canada Nouvelle-Angleterre",
    "croisière Québec Boston",
    "passeport croisière États-Unis",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Oui, on peut partir en croisière de Québec ou de Montréal sans prendre l'avion à l'aller : le Port de Québec est un port de départ et d'arrivée sur l'itinéraire Canada et Nouvelle-Angleterre, desservi notamment par Crystal, Cunard, Holland America, Norwegian, Pearl Seas et Princess, et le Grand Quai du Port de Montréal accueille entre autres le parcours entre New York et Montréal et des circuits vers les Grands Lacs. L'automne est une période active : l'horaire du Port de Québec compte 39 arrivées de navires, à quai ou attendus, du 2 octobre au 1er novembre 2026, dont 9 avec embarquement ou débarquement de passagers. Prévoyez un passeport valide : ces itinéraires passent par les États-Unis, et le gouvernement du Canada le recommande pour toute croisière.",
  keyTakeaways: [
    "Port de Québec : deux terminaux de croisière, le Terminal Ross-Gaudreault (quais 21 et 22) et le Terminal de croisière 30, construit en 2020.",
    "Présentez-vous au quai d'embarquement au moins 2 heures avant le départ du navire (Port de Québec).",
    "Stationnement longue durée du bassin Louise : 84 $ pour 7 jours, 165 $ pour 30 jours, par l'application mobile du Port.",
    "Entrée aux États-Unis par la mer : passeport ou carte d'un programme de voyageurs dignes de confiance à 16 ans et plus ; mais un retour en avion depuis Boston ou New York exige le passeport (ou NEXUS au guichet).",
    "Au retour, le contrôle douanier se fait au premier port canadien touché par le navire ; exemption de 800 $ après 48 heures d'absence (ASFC).",
    "Les horaires peuvent changer en raison de la météo ou des marées (Port de Québec).",
  ],
  sections: [
    {
      h: "Les itinéraires au départ de Québec et de Montréal",
      paragraphs: [
        "Le Port de Québec se décrit comme un port de départ et de destination sur l'itinéraire de croisière au Canada et en Nouvelle-Angleterre : on peut partir ou arriver à Québec à bord d'un navire. Il nomme les compagnies qui offrent des croisières au départ ou à l'arrivée de Québec : Crystal Cruises, Cunard (Queen Mary 2), Holland America Line, Norwegian Cruise Line, Pearl Seas Cruises et Princess Cruises. Leurs sites sont en anglais.",
        "À Montréal, les croisières accostent au Grand Quai du Port de Montréal, dans le Vieux-Port. Tourisme Montréal cite parmi les itinéraires populaires le parcours entre New York et Montréal et des circuits sur les Grands Lacs vers Toronto, Detroit ou Chicago.",
        "Beaucoup de ces croisières sont des allers simples : vous embarquez à Québec ou à Montréal et débarquez à Boston ou à New York, ou l'inverse. Le transport de retour fait donc partie du budget et du choix des documents.",
      ],
      table: {
        caption: "Types d'itinéraires au départ ou à l'arrivée de Québec et de Montréal",
        columns: ["Type d'itinéraire", "Embarquement ou débarquement", "Retour à prévoir", "Document à prévoir"],
        rows: [
          ["Canada et Nouvelle-Angleterre, aller simple", "Québec ou Montréal d'un côté, Boston ou New York de l'autre", "Vol ou train entre la ville américaine et le Québec", "Passeport : entrée aux États-Unis par la mer, puis retour en avion"],
          ["Montréal – New York", "Grand Quai du Port de Montréal", "Vol ou train si aller simple", "Passeport"],
          ["Grands Lacs", "Montréal (Grand Quai)", "Selon la ville d'arrivée (Toronto, Detroit, Chicago)", "Passeport si l'itinéraire passe par les États-Unis"],
          ["Saint-Laurent et Maritimes", "Québec ou Montréal", "Selon l'itinéraire", "Pièce d'identité exigée par la compagnie ; passeport selon l'itinéraire (Port de Québec)"],
        ],
      },
    },
    {
      h: "La saison : ce que montre l'horaire du Port de Québec",
      paragraphs: [
        "L'horaire 2026 publié par le Port de Québec, mis à jour le 2 octobre 2026, compte 39 arrivées de navires, à quai ou attendus, entre le 2 octobre et le 1er novembre. 30 sont des escales ; 9 sont indiquées en embarquement-débarquement, dont des navires de Princess, Cunard, Norwegian et Holland America. La dernière arrivée inscrite est le 1er novembre 2026.",
        "Le Port précise que les horaires sont susceptibles d'être modifiés en raison de la météo ou des marées. Les départs de la saison suivante sont publiés par chaque compagnie ; demandez-les tôt si vous visez l'automne, la période des couleurs.",
      ],
    },
    {
      h: "Embarquer à Québec : terminaux, stationnement et horaires",
      paragraphs: [
        "Les navires utilisent deux terminaux : le Terminal de croisière Ross-Gaudreault, près du Petit Champlain et du Vieux-Québec (quais 21 et 22), et le Terminal de croisière 30, construit en 2020 pour les plus grands navires. Votre billet indique le terminal.",
        "Le Port conseille d'arriver au quai d'embarquement au moins 2 heures avant le départ du navire, de s'enregistrer en ligne auprès de la compagnie, et de ne jamais mettre les documents de voyage ni les médicaments dans la valise enregistrée.",
        "Au débarquement à Québec, la plupart des passagers quittent le navire entre 6 h 30 et 10 h 30. Une consigne à bagages est ouverte de 8 h à 17 h, à 10 $ par bagage : pratique si votre vol ou votre train part plus tard.",
      ],
      table: {
        caption: "Accès au Port de Québec pour les croisiéristes (tarifs publiés par le Port)",
        columns: ["Service", "Tarif ou délai", "Précisions"],
        rows: [
          ["Stationnement longue durée du bassin Louise", "84 $ pour 7 jours ; 165 $ pour 30 jours", "Tarifs offerts seulement dans l'application mobile ; 30 jours au maximum ; environ 12 à 15 minutes de marche des terminaux"],
          ["Zone de dépôt près du terminal", "10 minutes gratuites, puis 6 $ l'heure", "Pour un proche qui vient vous déposer"],
          ["Consigne à bagages", "10 $ par bagage", "De 8 h à 17 h"],
          ["Aéroport Jean-Lesage", "Environ 20 minutes", "Distance indiquée par le Port"],
          ["Gare du Palais (VIA Rail)", "Environ 15 minutes à pied", "Distance indiquée par le Port"],
        ],
      },
    },
    {
      h: "Documents : passeport, enfants et retour au Canada",
      paragraphs: [
        "Pour entrer aux États-Unis par voie terrestre ou maritime, le gouvernement du Canada indique qu'un citoyen canadien de 16 ans et plus doit présenter un passeport valide ou une carte d'un programme de voyageurs dignes de confiance ; un enfant de moins de 16 ans peut présenter son passeport, l'original ou une copie de son certificat de naissance, ou sa carte de citoyenneté originale.",
        "Mais pour une croisière, le gouvernement du Canada recommande d'avoir un passeport canadien valide, parce que certains ports peuvent refuser les passagers qui n'en ont pas, et que l'équipage peut conserver les passeports pendant le voyage (demandez un reçu et gardez une photocopie). Et si vous rentrez en avion de Boston ou de New York, le passeport est exigé (ou une carte NEXUS au guichet libre-service).",
        "Si un enfant voyage sans ses deux parents, prévoyez une lettre de consentement ; notre guide sur les documents pour voyager à l'étranger l'explique en détail.",
        "Au retour, le contrôle douanier se fait au premier port canadien où le navire accoste. Les exemptions personnelles de l'Agence des services frontaliers du Canada sont de 200 $ après 24 heures d'absence et de 800 $ après 48 heures ou 7 jours ; l'alcool n'est admis que dans l'exemption de 48 heures ou plus (par exemple 1,5 litre de vin ou 1,14 litre de spiritueux, ou 24 canettes ou bouteilles de bière de 355 ml).",
        "Assurance : le gouvernement du Canada recommande une assurance qui couvre l'hospitalisation à l'étranger et l'évacuation médicale, et une consultation santé-voyage au moins six semaines avant le départ.",
      ],
    },
    {
      h: "Le budget en plus du prix de la croisière",
      paragraphs: [
        "Les compagnies publient leurs frais de service quotidiens par personne : 18 à 20 $ US chez Princess et chez Holland America, 20 à 25 $ US chez Norwegian, selon la cabine. Pour deux personnes sur 7 jours, comptez 252 $ à 350 $ US, soit environ 359 $ à 499 $ CA au taux de la Banque du Canada du 1er octobre 2026 (1 $ US = 1,4243 $ CA). Princess et Holland America ajoutent aussi 20 % de frais de service sur les boissons et les restaurants de spécialité.",
        "Ajoutez selon votre itinéraire : le stationnement ou le transport jusqu'au port, le vol ou le train de retour pour un aller simple, une nuit d'hôtel si vous débarquez tard ou repartez le lendemain, l'assurance voyage et les excursions. La page Croisières de Zeniva Travel détaille ce qui est habituellement inclus dans le prix d'une croisière.",
      ],
    },
    {
      h: "Les pièges à éviter",
      paragraphs: [
        "Réserver un aller simple sans le retour. Une croisière Québec–Boston se termine à Boston : le vol ou le train de retour se planifie en même temps que la cabine.",
        "Partir avec un certificat de naissance seulement. Il peut suffire pour entrer aux États-Unis par la mer à moins de 16 ans, mais pas pour un vol de retour, et le gouvernement du Canada recommande le passeport pour toute croisière.",
        "Prendre un vol trop tôt le jour du débarquement. À Québec, la plupart des passagers quittent le navire entre 6 h 30 et 10 h 30, et l'horaire peut changer avec la météo ou les marées.",
        "Mettre ses documents ou ses médicaments dans la valise enregistrée. Le Port de Québec recommande de les garder avec soi.",
        "Rapporter de l'alcool après une croisière de moins de 48 heures. L'exemption de 24 heures n'inclut ni l'alcool ni le tabac.",
      ],
    },
    {
      h: "Comment Zeniva Travel prépare une croisière au départ du Québec",
      paragraphs: [
        "Dites-nous la période, le budget, le type de cabine et si vous voulez partir de Québec, de Montréal ou d'un autre port, par le formulaire de la page Croisières, au 581-748-7017 ou avec Lina, la concierge virtuelle, 24 heures sur 24. Nous comparons les compagnies et les itinéraires, et la proposition additionne la croisière, le retour et les frais à prévoir pour que vous compariez des prix complets.",
        "La demande et la proposition sont gratuites et sans engagement. Une fois la proposition acceptée, le paiement se fait en ligne par ZeniPay.",
      ],
    },
  ],
  faq: [
    {
      q: "Peut-on partir en croisière directement de Québec ?",
      a: "Oui. Le Port de Québec est un port de départ et d'arrivée sur l'itinéraire Canada et Nouvelle-Angleterre. Crystal Cruises, Cunard, Holland America Line, Norwegian Cruise Line, Pearl Seas Cruises et Princess Cruises offrent des croisières au départ ou à l'arrivée de Québec, souvent en aller simple vers ou depuis Boston ou New York.",
    },
    {
      q: "Quand partent les croisières de Québec ?",
      a: "Notamment à l'automne, la période des couleurs. L'horaire du Port de Québec mis à jour le 2 octobre 2026 compte 39 arrivées de navires, à quai ou attendus, du 2 octobre au 1er novembre 2026, dont 9 en embarquement-débarquement ; la dernière arrivée inscrite est le 1er novembre. Les horaires peuvent changer selon la météo ou les marées.",
    },
    {
      q: "Faut-il un passeport pour une croisière Québec–Boston ?",
      a: "Prévoyez-en un. Par la mer, un adulte peut entrer aux États-Unis avec un passeport ou une carte d'un programme de voyageurs dignes de confiance, mais le gouvernement du Canada recommande un passeport valide pour toute croisière, et le vol de retour depuis Boston exige le passeport (ou NEXUS au guichet).",
    },
    {
      q: "Mon enfant peut-il faire une croisière vers les États-Unis avec son certificat de naissance ?",
      a: "Pour entrer aux États-Unis par la mer, un enfant de moins de 16 ans peut présenter son certificat de naissance ou sa carte de citoyenneté. Mais si le retour se fait en avion, il lui faut un passeport, et le gouvernement du Canada recommande le passeport pour toute croisière.",
    },
    {
      q: "Où se stationner pour une croisière au départ de Québec ?",
      a: "Au stationnement longue durée du bassin Louise, à environ 12 à 15 minutes de marche des terminaux : 84 $ pour 7 jours ou 165 $ pour 30 jours, tarifs offerts dans l'application mobile du Port de Québec. Un proche peut aussi vous déposer : 10 minutes gratuites, puis 6 $ l'heure.",
    },
    {
      q: "Combien d'heures avant le départ faut-il arriver au port ?",
      a: "Le Port de Québec recommande d'être au quai d'embarquement au moins 2 heures avant le départ du navire, avec le billet de croisière, les pièces d'identité, le passeport selon l'itinéraire, les billets d'avion s'il y a lieu et les étiquettes de bagages.",
    },
    {
      q: "Combien d'alcool peut-on rapporter après une croisière ?",
      a: "Après 48 heures d'absence ou plus, l'exemption personnelle de l'ASFC est de 800 $ et inclut par exemple 1,5 litre de vin, ou 1,14 litre de spiritueux, ou 24 canettes ou bouteilles de bière de 355 ml. Après 24 heures, l'exemption est de 200 $ et n'inclut pas l'alcool.",
    },
  ],
  sources: [
    { name: "Port de Québec — Croisières au départ de Québec", url: "https://www.portquebec.ca/croisieres/informations-aux-croisieristes/croisieres-au-depart-de-quebec/" },
    { name: "Port de Québec — Horaires des croisières (horaire 2026)", url: "https://www.portquebec.ca/croisieres/horaires-des-croisieres/" },
    { name: "Port de Québec — Terminaux de croisière", url: "https://www.portquebec.ca/croisieres/ligne-de-croisiere/terminaux-de-croisiere/" },
    { name: "Port de Québec — Débarquement à Québec", url: "https://www.portquebec.ca/croisieres/informations-aux-croisieristes/debarquement-a-quebec/" },
    { name: "Tourisme Montréal — Grand Quai, terminal de croisières", url: "https://www.mtl.org/fr/quoi-faire/la-ville/grand-quai-terminal-des-croisieres-montreal" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : États-Unis (exigences d'entrée)", url: "https://voyage.gc.ca/destinations/etats-unis" },
    { name: "Gouvernement du Canada — Santé et sécurité en croisière", url: "https://voyage.gc.ca/voyager/sante-securite/conseils-pour-voyageurs/voyage-croisiere" },
    { name: "Agence des services frontaliers du Canada — Carte de déclaration E311 (exemptions personnelles)", url: "https://www.cbsa-asfc.gc.ca/publications/forms-formulaires/e311-fra.html" },
    { name: "Gouvernement du Canada — Lettre de consentement pour les enfants voyageant à l'extérieur du Canada", url: "https://voyage.gc.ca/voyager/enfant/lettre-consentement" },
    { name: "Princess Cruises — Crew Appreciation and Service Charge Policy", url: "https://www.princess.com/html/global/disclaimers/crew-appreciation/" },
    { name: "Holland America Line — Crew Appreciation and service charges", url: "https://www.hollandamerica.com/en_US/hotel-service-charge.html" },
    { name: "Norwegian Cruise Line — What is the onboard service charge?", url: "https://www.ncl.com/cruise-faq/what-is-onboard-service-charge" },
    { name: "Banque du Canada — Taux de change quotidiens", url: "https://www.banqueducanada.ca/taux/taux-de-change/taux-de-change-quotidiens/" },
  ],
  cta: { label: "Recevoir une proposition de croisière", href: "/fr/croisieres" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Renseignements tirés des sources officielles ci-dessus, consultées le 2 octobre 2026. Les horaires des navires, les tarifs du Port et les frais des compagnies changent : vérifiez-les pour votre départ. Les exigences d'entrée changent aussi : consultez voyage.gc.ca avant de réserver et avant de partir. Ce guide ne donne aucun prix de croisière : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
