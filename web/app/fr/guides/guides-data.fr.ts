// Versions françaises des guides citables (mêmes slugs que app/guides/guides-data.ts).
// Les chiffres sont identiques aux versions anglaises — une seule source de vérité par guide.

import type { GuideData } from "../../guides/guides-data";

export const GUIDES_FR: GuideData[] = [
  {
    slug: "yacht-charter-cost",
    title: "Combien coûte vraiment un charter de yacht d'une semaine en 2026 ?",
    description:
      "Fourchettes de prix réelles 2026 pour 7 jours de charter avec équipage ou en bareboat aux Bahamas, aux Îles Vierges britanniques et en Méditerranée — ce qui est inclus, ce qui se facture en plus (APA, TVA, pourboire) et comment lire une soumission.",
    datePublished: "2026-09-21",
    dateModified: "2026-09-22",
    readingMinutes: 7,
    tags: ["prix charter yacht", "catamaran avec équipage prix", "charter Bahamas", "charter BVI", "charter Méditerranée", "ZeniYacht"],
    shortAnswer:
      "En 2026, un catamaran avec équipage tout-inclus pour 7 jours commence autour de 20 000 $ à 35 000 $ US aux Îles Vierges britanniques, 30 000 $ à 38 000 $ aux Bahamas (Exumas), et 55 000 $ à 90 000 $ et plus pour les plus grands yachts des Bahamas. En Méditerranée, on paie un tarif de base plus une provision (APA) de 25 à 35 % et une TVA de 13 à 22 %. Le bareboat (sans équipage) coûte beaucoup moins, mais carburant, nourriture, amarrage et skipper s'ajoutent.",
    keyTakeaways: [
      "Trois modèles de prix : tout-inclus (Caraïbes avec équipage), tarif de base + APA (Méditerranée et grands yachts), bareboat (vous naviguez vous-même).",
      "« Tout-inclus » veut généralement dire yacht, capitaine, chef, repas, bar standard, jouets nautiques et carburant pour un itinéraire normal — pas le pourboire, pas les taxes, pas l'alcool premium.",
      "Les Bahamas sont la destination la plus chère des Caraïbes à cause d'une taxe gouvernementale de 4 % et d'une TVA de 10 % sur le tarif du charter.",
      "Le pourboire de l'équipage est d'usage à 10–20 % du tarif de base, remis à la fin du voyage.",
      "Les semaines de pointe (Noël, Nouvel An, relâche, juillet–août en Méditerranée) sont les plus chères et se réservent 6 à 12 mois d'avance.",
    ],
    sections: [
      {
        h: "Les trois façons de tarifer un charter",
        paragraphs: [
          "Chaque soumission de charter suit l'un de trois modèles, et les confondre est la première raison pour laquelle on croit qu'un charter coûte moins — ou plus — qu'en réalité.",
          "Tout-inclus : un prix couvre le yacht, le capitaine et le chef, trois repas par jour plus collations, un bar standard, le carburant pour un itinéraire normal, les jouets nautiques, l'équipement de plongée en apnée et l'amarrage sur un parcours standard. C'est la norme pour les catamarans avec équipage aux BVI, aux Bahamas et dans la plupart des Caraïbes.",
          "Tarif de base plus APA : le tarif couvre le yacht et l'équipage seulement. Vous prépayez une provision (Advance Provisioning Allowance) — typiquement 25 à 35 % du tarif de base — dans laquelle le capitaine puise pour le carburant, la nourriture, les boissons, l'amarrage et les frais portuaires. Le solde inutilisé est remboursé. C'est la norme en Méditerranée et sur la plupart des yachts à moteur de plus de 80 pieds.",
          "Bareboat : vous louez le bateau, vous naviguez. Pas d'équipage, pas de nourriture, pas de carburant inclus. Il faut un CV de navigation (ou embaucher un skipper à la journée). C'est le moins cher sur l'eau, et le plus de travail.",
        ],
      },
      {
        h: "Fourchettes de prix 2026 par destination (7 jours)",
        paragraphs: [
          "Les chiffres ci-dessous sont des fourchettes de marché 2026 compilées à partir des tarifs publiés par des compagnies de charter (sources en fin de guide). Ils couvrent une semaine complète, pourboire exclu sauf mention. Votre prix réel dépend du yacht, de la semaine et du nombre d'invités.",
        ],
        table: {
          caption: "Coût typique d'un charter de yacht de 7 jours en 2026",
          columns: ["Destination", "Type", "Fourchette hebdomadaire typique (USD)", "En plus"],
          rows: [
            ["Îles Vierges britanniques", "Catamaran avec équipage, tout-inclus (jusqu'à 6–8 invités)", "20 000 $ – 35 000 $", "Pourboire 10–20 %, taxe de croisière et permis BVI"],
            ["Bahamas (Exumas)", "Catamaran avec équipage, tout-inclus (2–8 invités)", "30 000 $ – 38 000 $ à l'entrée ; 55 000 $ – 90 000 $+ pour les grands yachts", "Taxe gouvernementale 4 % + TVA 10 % sur le tarif, pourboire"],
            ["Caraïbes (Saint-Martin, Grenadines, USVI)", "Catamaran avec équipage, tout-inclus", "25 000 $ – 60 000 $", "Pourboire, permis de croisière locaux"],
            ["Méditerranée (Grèce, Croatie, Italie, France)", "Catamaran à voile ou à moteur avec équipage, tarif + APA", "Tarif de base + 25–35 % APA + 13–22 % TVA", "Pourboire, amarrage dans les ports prestigieux (Monaco, Capri, Mykonos)"],
            ["Méditerranée", "Catamaran bareboat 40–45 pi", "Environ 4 000 $ – 12 000 $ de base (selon la saison)", "Carburant, nourriture, amarrage, skipper si embauché, dépôt de garantie"],
            ["Toute destination", "Superyacht 100 pi+ avec équipage complet", "100 000 $ – 500 000 $+ de base", "APA 30–35 %, TVA le cas échéant, pourboire"],
          ],
        },
      },
      {
        h: "Ce que « tout-inclus » comprend vraiment",
        paragraphs: [
          "Inclus dans un charter avec équipage tout-inclus typique : le yacht, un capitaine licencié, un chef, tous les repas et collations préparés à bord, un bar standard (vin maison, bière, spiritueux, boissons gazeuses), le carburant pour un itinéraire standard, l'annexe, les planches à pagaie, les kayaks, l'équipement de plongée en apnée et l'amarrage standard.",
          "Généralement exclus : le pourboire de l'équipage (10–20 % du tarif de base est d'usage), les taxes gouvernementales et permis de croisière, les vins et spiritueux premium, la plongée bouteille, les repas au restaurant à terre, les nuits de marina hors itinéraire standard, et les vols vers le port d'embarquement.",
          "Lisez la fiche de préférences et le contrat avant de verser le dépôt. La différence entre deux soumissions « à 30 000 $ » est souvent 6 000 $ de choses que l'une inclut et que l'autre facture plus tard.",
        ],
      },
      {
        h: "Pourquoi les Bahamas coûtent plus cher que les BVI",
        paragraphs: [
          "Les bateaux se ressemblent ; les taxes, non. Les Bahamas prélèvent une taxe de charter de 4 % plus une TVA de 10 % sur le tarif, ce qui ajoute environ 4 000 $ à 5 000 $ à une semaine à 35 000 $. Les BVI prélèvent une taxe de croisière bien plus petite, par personne et par jour, plus des permis. Ajoutez les plus longues distances des Bahamas (plus de carburant) et l'écart est réel.",
          "En échange, vous avez les Exumas : cochons nageurs, iguanes, bancs de sable, la grotte de Thunderball et l'une des eaux les plus claires de l'hémisphère, avec moins de bateaux que les BVI en haute saison.",
        ],
      },
      {
        h: "Quand réserver et comment payer moins",
        paragraphs: [
          "Les semaines de pointe — Noël, Nouvel An, relâche américaine et Pâques dans les Caraïbes ; juillet et août en Méditerranée — sont les plus chères et se réservent typiquement 6 à 12 mois d'avance. La basse saison (fin avril à juin, novembre à mi-décembre dans les Caraïbes ; mai–juin et septembre en Méditerranée) est généralement 15 à 30 % moins chère pour le même yacht.",
          "Autres leviers : remplir le yacht (un catamaran de 8 invités coûte à peu près la même chose à 4 qu'à 8, donc le prix par personne est divisé par deux), choisir un bateau un peu plus âgé avec le même équipage, et réserver une semaine de repositionnement quand un yacht passe des Caraïbes à la Méditerranée.",
        ],
      },
      {
        h: "Comment ZeniYacht chiffre un charter",
        paragraphs: [
          "ZeniYacht est la division charters de yachts de Zeniva Travel. Vous décrivez le voyage — destination, dates, nombre d'invités, budget — à Lina, l'assistante IA de Zeniva, par clavardage ou par voix. Lina présélectionne les yachts qui correspondent, puis un courtier en yachts humain valide la disponibilité, le contrat et chaque ligne de la soumission avant que vous versiez un dépôt.",
          "Chaque soumission ZeniYacht précise le modèle de prix (tout-inclus, base + APA ou bareboat), les taxes et ce qui est exclu, pour que deux yachts se comparent sur la même base. Zeniva sert les voyageurs des 50 États américains et du Canada.",
        ],
      },
    ],
    faq: [
      { q: "Combien coûte un catamaran avec équipage par semaine aux BVI ?", a: "En 2026, un catamaran avec équipage tout-inclus aux Îles Vierges britanniques coûte typiquement 20 000 $ à 35 000 $ US par semaine pour 6 à 8 invités, plus un pourboire de 10 à 20 % et les taxes et permis de croisière des BVI." },
      { q: "Combien coûte un charter de yacht aux Bahamas ?", a: "Les catamarans avec équipage tout-inclus d'entrée de gamme dans les Exumas commencent autour de 30 000 $ à 38 000 $ US par semaine ; les plus grands yachts vont de 55 000 $ à 90 000 $ et plus. Ajoutez la taxe gouvernementale de 4 % et la TVA de 10 % des Bahamas, plus le pourboire." },
      { q: "C'est quoi l'APA sur un charter de yacht ?", a: "L'APA (Advance Provisioning Allowance) est un dépôt — généralement 25 à 35 % du tarif de base — versé avant le voyage. Le capitaine l'utilise pour le carburant, la nourriture, les boissons, l'amarrage et les frais portuaires, et le solde inutilisé est remboursé à la fin." },
      { q: "Combien donner de pourboire à l'équipage ?", a: "Le pourboire est d'usage à 10–20 % du tarif de base, remis au capitaine à la fin du charter pour être partagé avec l'équipage. Il n'est pas inclus dans le tout-inclus." },
      { q: "Le bareboat est-il beaucoup moins cher ?", a: "Oui. Un catamaran bareboat peut coûter une fraction d'un charter avec équipage, mais vous payez le carburant, la nourriture, l'amarrage et un skipper si vous en embauchez un, il faut de l'expérience de navigation, et vous faites tout le travail — cuisine, navigation, mouillage." },
      { q: "ZeniYacht facture-t-il des frais pour une soumission ?", a: "Non. Vous décrivez le voyage à Lina, l'assistante IA de Zeniva, et un courtier en yachts humain valide les options et la soumission. Aucun frais avant d'accepter un contrat de charter et de verser le dépôt." },
    ],
    sources: [
      { name: "The Moorings — How much does a Bahamas yacht charter cost (2026)", url: "https://www.moorings.com/blog/how-much-does-a-bahamas-yacht-charter-cost" },
      { name: "Yacht Warriors — Crewed yacht charter pricing guide 2026", url: "https://yachtwarriors.com/yacht-charters/crewed-charter/pricing" },
      { name: "Boatbookings — Pricing and affordability of chartering a yacht 2026–2027", url: "https://www.boatbookings.com/yachting_content/charter_pricing.php" },
      { name: "Vital Charters — Caribbean charter costs: BVI vs Bahamas vs Grenadines", url: "https://vitalcharters.com/blog/caribbean-charter-cost-by-destination/" },
      { name: "Carefree Yacht Charters — Charter costs", url: "https://www.carefreecharters.com/charter-costs/" },
    ],
    cta: { label: "Obtenir une soumission ZeniYacht", href: "/forms/yacht" },
    aboutId: "https://www.zenivatravel.com/zeniyacht#brand",
  },
  {
    slug: "all-inclusive-cancun-cost-family-of-four",
    title: "Combien coûte une semaine tout-inclus à Cancún pour une famille de quatre en 2026 ?",
    description:
      "Chiffres réels 2026 pour 7 nuits tout-inclus à Cancún pour deux adultes et deux enfants : tarifs de nuitée par catégorie de complexe, vols, transferts, taxes et pourboires, ce qui est vraiment inclus, et comment réduire le total sans changer de complexe.",
    datePublished: "2026-09-22",
    dateModified: "2026-09-22",
    readingMinutes: 7,
    tags: ["prix tout-inclus Cancún", "famille de quatre Cancún", "budget Cancún 2026", "tout-inclus Mexique famille", "Zeniva Travel"],
    shortAnswer:
      "En 2026, 7 nuits tout-inclus à Cancún pour une famille de quatre coûtent typiquement de 4 200 $ à 14 000 $ US tout compris. Les complexes familiaux milieu de gamme coûtent environ 350 $ à 550 $ par nuit pour une chambre familiale (environ 2 500 $ à 4 000 $ pour la semaine), les complexes de luxe 750 $ à 1 500 $ et plus par nuit, plus 1 600 $ à 3 200 $ de vols depuis la plupart des villes américaines, 100 $ à 200 $ de transferts privés et 50 $ à 100 $ par personne de taxes touristiques et aéroportuaires. Une semaine confortable en milieu de gamme revient autour de 6 000 $ à 8 000 $ ; une semaine de luxe, 10 000 $ à 14 000 $.",
    keyTakeaways: [
      "Les tarifs tout-inclus de Cancún ont monté de 10 à 15 % entre 2025 et 2026 ; le complexe représente maintenant environ la moitié du coût total du voyage, les vols un tiers.",
      "« Tout-inclus » couvre la chambre, les repas, les boissons maison, les piscines et le club enfants — pas le spa, certains restaurants premium, les excursions, les pourboires ni le transfert aéroport-complexe.",
      "Les promotions « enfants gratuits » (généralement moins de 12 ans, partageant la chambre de deux adultes) sont le plus gros levier pour une famille de quatre.",
      "La basse saison (fin avril à juin, septembre à début décembre, hors pics d'ouragans) coûte 20 à 35 % de moins que Noël, la relâche et février.",
      "Prévoyez 50 $ à 100 $ par personne de taxe touristique du Quintana Roo, de frais d'aéroport et de redevances facturés hors forfait.",
    ],
    sections: [
      {
        h: "Le budget 2026, ligne par ligne",
        paragraphs: [
          "Les chiffres ci-dessous sont des fourchettes de marché 2026 compilées à partir des tarifs publiés des complexes et de guides de coûts de voyage (sources en fin de page). Ils supposent deux adultes et deux enfants de moins de 12 ans dans une chambre familiale pour 7 nuits, une semaine standard (hors congés), au départ d'un grand aéroport américain.",
        ],
        table: {
          caption: "Voyage tout-inclus de 7 nuits à Cancún, famille de quatre, 2026",
          columns: ["Poste", "Complexe milieu de gamme", "Complexe de luxe", "Notes"],
          rows: [
            ["Complexe, 7 nuits (chambre familiale, tout-inclus)", "2 500 $ – 4 000 $", "5 500 $ – 10 500 $", "350 $–550 $ contre 750 $–1 500 $ par nuit"],
            ["Vols aller-retour, 4 personnes", "1 600 $ – 3 200 $", "1 600 $ – 3 200 $", "400 $–800 $ par personne depuis la plupart des hubs américains ; plus depuis la côte Ouest ou aux congés"],
            ["Transferts privés aéroport", "100 $ – 200 $", "150 $ – 250 $", "Aller-retour ; les navettes partagées coûtent moins"],
            ["Taxes touristiques et aéroportuaires", "200 $ – 400 $", "200 $ – 400 $", "50 $–100 $ par personne, payés hors forfait"],
            ["Pourboires et extras (spa, excursions, restaurants premium)", "300 $ – 800 $", "800 $ – 2 000 $", "Chichén Itzá ou Xcaret : 100 $–200 $ par personne"],
            ["Total pour la semaine", "4 700 $ – 8 600 $", "8 250 $ – 16 350 $", "La plupart des familles : 6 000 $–8 000 $ milieu de gamme, 10 000 $–14 000 $ luxe"],
          ],
        },
      },
      {
        h: "Ce que le tout-inclus comprend vraiment",
        paragraphs: [
          "Inclus dans presque tous les tout-inclus de Cancún : la chambre, les restaurants buffet et à la carte (certains limitent les réservations par séjour), les boissons de marque maison, les piscines, la plage, le club enfants et les spectacles en soirée. Généralement inclus dans les complexes familiaux : parcs aquatiques, clubs ados, minibar regarni chaque jour.",
          "Généralement exclus : les transferts aéroport, les soins de spa, les sports nautiques motorisés, les rencontres avec les dauphins, les excursions, l'alcool premium dans certains complexes, les restaurants « signature » dans certaines chaînes, et les pourboires. Le pourboire est facultatif mais d'usage — 1 $ à 5 $ par service, soit 100 $ à 300 $ sur une semaine.",
        ],
      },
      {
        h: "Les leviers qui changent vraiment le prix",
        paragraphs: [
          "Enfants gratuits : la plupart des grands complexes familiaux (Moon Palace, Hyatt Ziva, Hard Rock, Iberostar, Royalton) offrent des promotions « enfants de moins de 12 ans gratuits » à certaines dates, ce qui peut réduire le poste complexe de 20 à 35 % pour une famille de quatre. Demandez-le explicitement ; c'est rarement automatique.",
          "Dates : une semaine de février ou de Pâques peut coûter le double d'une semaine de fin mai ou d'octobre pour la même chambre. Si l'école le permet, la deuxième moitié d'avril, juin avant le 20 et de mi-septembre à début décembre offrent le meilleur rapport.",
          "Type de chambre : une « suite familiale » avec un coin enfants séparé coûte souvent seulement 60 $ à 120 $ de plus par nuit que deux chambres communicantes, et bien moins que deux chambres.",
          "Vols : réservez 6 à 10 semaines d'avance hors congés ; pour Noël et la relâche, 4 à 6 mois. Les vols directs depuis le Texas, la Floride, la Géorgie et le Nord-Est sont généralement les moins chers.",
        ],
      },
      {
        h: "Comment Lina chiffre un voyage à Cancún",
        paragraphs: [
          "Dites à Lina, l'assistante IA de Zeniva Travel, qui voyage, votre aéroport de départ, vos dates (ou « flexible en mai ») et le type de complexe que vous voulez. Elle renvoie une proposition complète — complexe, vols, transferts privés, promotion enfants gratuits appliquée si disponible, taxes montrées séparément — en quelques secondes, et la rechiffre quand vous déplacez les dates. Un agent humain révise les réservations de groupe et les demandes particulières avant que vous payiez.",
          "Zeniva Travel sert les voyageurs des 50 États américains et du Canada. Vous payez le prix affiché ; Zeniva est rémunérée par ses partenaires hôteliers et aériens, pas par des frais de réservation.",
        ],
      },
    ],
    faq: [
      { q: "Combien coûte un voyage tout-inclus à Cancún pour une famille de quatre ?", a: "En 2026, typiquement 4 200 $ à 14 000 $ US pour 7 nuits, vols inclus. Les complexes familiaux milieu de gamme placent la plupart des familles à 6 000 $–8 000 $ tout compris ; les complexes de luxe à 10 000 $–14 000 $." },
      { q: "Combien coûtent les complexes tout-inclus de Cancún par nuit en 2026 ?", a: "Les complexes familiaux milieu de gamme coûtent environ 350 $ à 550 $ par nuit pour une chambre familiale ; les complexes de luxe 750 $ à 1 500 $ et plus. Les tarifs sont 10 à 15 % plus élevés qu'en 2025." },
      { q: "Quand est-ce le moins cher d'aller à Cancún avec des enfants ?", a: "De fin avril à juin (avant le 20) et de mi-septembre à début décembre, en évitant les congés scolaires américains. Ces semaines coûtent typiquement 20 à 35 % de moins que Noël, février et la relâche." },
      { q: "Les enfants sont-ils gratuits dans les tout-inclus de Cancún ?", a: "Souvent, à certaines dates : beaucoup de grands complexes familiaux offrent des promotions « moins de 12 ans gratuits » quand deux enfants partagent la chambre de deux adultes. C'est rarement automatique — demandez-le à la réservation." },
      { q: "Les transferts aéroport sont-ils inclus dans les forfaits tout-inclus ?", a: "Généralement non. Prévoyez 100 $ à 250 $ aller-retour pour un transfert privé pour quatre, ou moins pour une navette partagée. Zeniva inclut les transferts privés dans ses propositions pour que le total soit complet." },
      { q: "Zeniva Travel facture-t-elle des frais de réservation pour Cancún ?", a: "Non. Vous payez le prix affiché ; Zeniva Travel est rémunérée par ses partenaires hôteliers et aériens. Décrivez votre voyage à Lina à zenivatravel.com/fr/chat pour une proposition chiffrée." },
    ],
    sources: [
      { name: "The Cancun Sun — What an all-inclusive week in Cancun will cost your family in 2026", url: "https://thecancunsun.com/what-an-all-inclusive-week-in-cancun-will-cost-your-family-in-2026/" },
      { name: "The Cancun Sun — How much resort prices have gone up in Cancun for 2026", url: "https://thecancunsun.com/here-is-how-much-resort-prices-have-gone-up-in-cancun-for-2026/" },
      { name: "Cancun All Inclusive — Cancun travel budget guide 2026", url: "https://www.cancunallinclusive.com/cancun-travel-budget-guide-2026-how-much-does-it-really-cost/" },
      { name: "Endless Travel Plans — All-inclusive resorts for families: 2026 costs and picks", url: "https://www.endlesstravelplans.com/guides/getting-started/all-inclusive-resorts-ultimate-family-guide" },
    ],
    cta: { label: "Chiffrer mon voyage à Cancún avec Lina", href: "/fr/chat" },
    aboutId: "https://www.zenivatravel.com/#organization",
  },
];

export function findGuideFr(slug: string): GuideData | null {
  return GUIDES_FR.find((g) => g.slug === slug) ?? null;
}
