// Guide FR — « Documents pour voyager à l'étranger : passeport, enfant mineur, lettre de consentement »
// Emplacement prévu : web/app/fr/guides/content/documents-voyage-etranger-passeport-enfant.fr.ts
// Guide FR seulement (pas de version EN) : appliquer le correctif fr-guides-slug-page.patched.tsx
// pour que la page n'annonce pas une version anglaise inexistante (/guides/<slug> = 404).
// Sources vérifiées le 2026-10-02 :
//  - Frais de passeport : canada.ca, tableau « Modification des frais » (nouveaux frais au 31 mars 2026, page du 2026-07-20).
//  - Délais : canada.ca, normes de service (10 / 20 jours ouvrables ; urgent ; express 2 à 9 jours ouvrables).
//  - Lettre de consentement : voyage.gc.ca/voyager/enfant/lettre-consentement (modifiée le 2026-09-02).
//  - Exigences d'entrée : voyage.gc.ca, pages destinations (Mexique 1er oct. 2026 ; Cuba 28 sept. 2026 ; autres 26 mai 2026).
// Les frais de passeport sont indexés chaque année : revalider le tableau canada.ca avant chaque mise à jour.

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_DOCUMENTS_VOYAGE: GuideData = {
  slug: "documents-voyage-etranger-passeport-enfant",
  title: "Documents pour voyager à l'étranger : passeport, enfant mineur et lettre de consentement",
  description:
    "Ce qu'il faut pour partir dans le sud ou ailleurs à l'étranger au départ du Québec : passeport canadien (frais et délais 2026), validité exigée par destination, formulaires d'entrée en ligne, passeport pour enfant et lettre de consentement quand un parent ne voyage pas.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 9,
  tags: [
    "documents pour voyager",
    "passeport canadien prix 2026",
    "passeport enfant",
    "lettre de consentement voyage enfant",
    "voyager seul avec son enfant",
    "validité passeport République dominicaine",
    "formulaire entrée Mexique",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Pour voyager à l'étranger en avion, chaque voyageur, enfant compris, a besoin de son propre passeport canadien valide. Depuis le 31 mars 2026, il coûte 163,50 $ (adulte, 10 ans), 122,50 $ (adulte, 5 ans) ou 58,50 $ (enfant, 5 ans), et le traitement prend de 10 à 20 jours ouvrables au Canada, sans compter la poste. Un enfant qui part sans l'un de ses parents, par exemple avec un seul parent, ses grands-parents ou un groupe scolaire, devrait aussi avoir une lettre de consentement signée par chaque parent absent ; le gouvernement du Canada recommande fortement qu'un notaire en soit témoin. Enfin, vérifiez la validité exigée par la destination : la durée du séjour au Mexique, à Cuba ou en Jamaïque, mais 6 mois après l'arrivée en République dominicaine et 6 mois après le départ aux Bahamas.",
  keyTakeaways: [
    "Passeport adulte : 163,50 $ pour 10 ans ou 122,50 $ pour 5 ans ; passeport enfant : 58,50 $, valide 5 ans au maximum (frais au Canada depuis le 31 mars 2026).",
    "Délais : 10 jours ouvrables en personne dans un bureau des passeports, 20 jours ouvrables par la poste, en ligne ou dans un Centre Service Canada ordinaire, sans le délai postal.",
    "Le passeport d'un enfant ne se renouvelle pas : il faut une nouvelle demande, signée par tous les parents ou tuteurs légaux.",
    "La lettre de consentement n'est pas exigée par la loi canadienne, mais les douaniers et les compagnies aériennes peuvent la demander ; sans elle, l'enfant peut être retardé ou refusé.",
    "La validité exigée varie : durée du séjour (Mexique, Cuba, Jamaïque, Aruba, Costa Rica), 3 mois après le départ (Sainte-Lucie), 6 mois après l'arrivée (République dominicaine) ou après le départ (Bahamas).",
    "Plusieurs destinations exigent un formulaire en ligne : FMMN au Mexique, billet électronique en République dominicaine, formulaire douanier à Cuba, carte ED à Aruba.",
  ],
  sections: [
    {
      h: "Le passeport canadien : frais et délais en 2026",
      paragraphs: [
        "Les frais de passeport ont augmenté le 31 mars 2026 et seront ajustés chaque année selon la Loi sur les frais de service. Une demande envoyée par la poste est facturée selon la date de réception, pas la date d'envoi.",
      ],
      table: {
        caption: "Frais de passeport pour les Canadiens qui habitent au Canada (depuis le 31 mars 2026)",
        columns: ["Document ou service", "Frais", "Délai (norme de service)"],
        rows: [
          ["Passeport adulte, 10 ans (16 ans et plus)", "163,50 $", "10 jours ouvrables en personne dans un bureau des passeports ; 20 jours ouvrables par la poste, en ligne ou dans un Centre Service Canada ordinaire"],
          ["Passeport adulte, 5 ans (16 ans et plus)", "122,50 $", "Mêmes délais"],
          ["Passeport enfant (15 ans et moins), 5 ans au maximum", "58,50 $", "Mêmes délais"],
          ["Service de retrait urgent", "125,75 $ en frais supplémentaires", "Avant la fin du jour ouvrable suivant, avec preuve de voyage"],
          ["Service de retrait express", "Frais supplémentaires possibles", "De 2 à 9 jours ouvrables (de 4 à 9 à Pointe-Claire), avec preuve de voyage"],
          ["Service de fin de semaine ou de jour férié", "383,50 $ en frais supplémentaires", "Urgence seulement"],
        ],
      },
    },
    {
      h: "Renouveler ou faire une nouvelle demande",
      paragraphs: [
        "Un adulte qui a déjà un passeport adulte peut souvent le renouveler, ce qui est plus simple : pas de répondant, pas de preuve de citoyenneté ni de preuve d'identité. Le renouvellement en ligne peut être possible si vous avez besoin du passeport dans 20 jours ouvrables ou plus.",
        "Le passeport d'un enfant ne se renouvelle jamais : il faut présenter une nouvelle demande à chaque expiration. Il reste valide jusqu'à sa date d'expiration même si l'enfant a 16 ans entre-temps ; à 16 ans, l'enfant demande un passeport adulte.",
        "Qui peut demander le passeport d'un enfant : un des parents s'ils ne sont pas séparés, le parent qui a la garde ou la responsabilité décisionnelle s'ils sont séparés ou divorcés, ou le tuteur légal. Tous les parents ou tuteurs légaux doivent signer le formulaire, et Passeport Canada peut communiquer avec l'autre parent.",
        "Le gouvernement du Canada recommande d'attendre d'avoir reçu le passeport avant de finaliser vos plans de voyage. Si votre forfait est déjà payé, l'itinéraire confirmé sert de preuve de voyage pour les services urgent et express.",
      ],
    },
    {
      h: "Validité du passeport et formulaires par destination",
      paragraphs: [
        "La compagnie aérienne peut avoir des règles de validité plus strictes que le pays d'arrivée : vérifiez aussi auprès d'elle. Le tableau reprend les exigences publiées par le gouvernement du Canada au 2 octobre 2026 pour un passeport canadien régulier.",
      ],
      table: {
        caption: "Exigences d'entrée pour les voyageurs canadiens (passeport régulier)",
        columns: ["Destination", "Validité du passeport", "Visa de touriste", "Formulaire ou document à prévoir"],
        rows: [
          ["Mexique", "Pendant la durée prévue du séjour", "Non exigé jusqu'à 180 jours", "Formulaire migratoire multiple numérique (FMMN) à remplir en ligne à l'arrivée par avion ; gardez-en une copie. Frais d'entrée généralement inclus dans le billet d'avion."],
          ["République dominicaine", "Au moins 6 mois après l'arrivée (règle générale ; exception touristique annoncée jusqu'au 31 décembre 2026 : durée du séjour)", "Non exigé jusqu'à 30 jours", "Billet électronique d'entrée et de sortie à remplir avant d'embarquer, à chaque voyage ; carte de touriste incluse dans le billet d'avion."],
          ["Cuba", "Pendant la durée du séjour", "Exigé (généralement inclus dans les forfaits avec vol direct du Canada)", "Formulaire douanier en ligne, à remplir dans les 72 heures avant l'entrée. Avis : évitez tout voyage non essentiel."],
          ["Jamaïque", "Pendant la durée prévue du séjour", "Non exigé jusqu'à 90 jours", "Aucun formulaire particulier mentionné par voyage.gc.ca."],
          ["Bahamas", "Au moins 6 mois après la date de départ prévue", "Non exigé jusqu'à 8 mois", "Aucun formulaire particulier mentionné par voyage.gc.ca."],
          ["Aruba", "Pendant la durée du séjour", "Non exigé jusqu'à 90 jours par période de 180 jours", "Carte d'embarquement et de débarquement (carte ED) à remplir en ligne dans les 7 jours avant le voyage ; preuve d'assurance maladie possible."],
          ["Sainte-Lucie", "Au moins 3 mois après la date de départ prévue", "Non exigé pour moins de 6 semaines", "Formulaire électronique d'immigration, un par famille ou groupe, 3 jours avant l'arrivée."],
          ["Costa Rica", "Pendant la durée du séjour", "Non exigé pour moins de 180 jours", "Règles strictes de sortie pour les mineurs ayant la double citoyenneté."],
        ],
      },
    },
    {
      h: "Voyager avec un enfant : la lettre de consentement",
      paragraphs: [
        "Une lettre de consentement est une déclaration écrite par laquelle un parent, ou une personne ayant la responsabilité décisionnelle, qui n'accompagne pas l'enfant l'autorise à voyager à l'étranger. Elle n'est pas exigée par la loi au Canada, mais elle peut être demandée par les autorités d'immigration à l'étranger, par les agents des compagnies aériennes et par les autorités canadiennes au retour. Ne pas pouvoir la présenter peut entraîner des retards ou un refus d'entrée ou de sortie.",
        "Quand l'utiliser : quand l'enfant voyage seul, avec un seul parent (même si les deux parents sont présents pendant une partie du voyage), avec des amis ou d'autres membres de la famille, ou avec un groupe sportif, scolaire, musical ou religieux. Le gouvernement du Canada recommande d'en prévoir une pour tout enfant de moins de 19 ans qui voyage sans ses deux parents, même s'il a 16 ans ou plus.",
        "Qui signe : chaque parent ou personne ayant la responsabilité décisionnelle qui ne voyage pas avec l'enfant, que les parents soient mariés, conjoints de fait, séparés ou divorcés. Elle est recommandée même quand une ordonnance autorise un seul parent à décider des voyages ; apportez aussi une copie de l'ordonnance ou de l'entente parentale.",
        "Ce qu'elle contient habituellement : le nom de l'enfant ; les noms et coordonnées des parents ou tuteurs ; le nom complet, l'adresse, les coordonnées de l'adulte accompagnateur et son lien avec l'enfant ; la destination, la durée et les dates précises du voyage. Les enfants d'une même famille qui voyagent ensemble peuvent figurer sur une seule lettre.",
        "Signature : tout adulte peut être témoin, mais le gouvernement du Canada recommande fortement un notaire. Gardez l'original signé : les photocopies et les versions numériques peuvent être refusées. Le gouvernement du Canada offre un modèle de lettre à remplir à l'écran ou à la main sur voyage.gc.ca.",
      ],
    },
    {
      h: "Les autres documents d'un enfant",
      paragraphs: [
        "Selon la situation familiale, prévoyez aussi le certificat de naissance provincial, les documents de divorce, l'ordonnance ou l'entente de garde, ou l'acte de décès d'un parent.",
        "Double citoyenneté : dans certains pays, l'enfant d'un citoyen est considéré comme citoyen et suit les règles de sortie applicables aux citoyens. Par exemple, pour quitter le Mexique, un enfant de moins de 18 ans qui est citoyen ou résident mexicain doit avoir le formulaire de consentement mexicain, ou un consentement notarié s'il voyage sans tuteur légal. À Sainte-Lucie, un enfant qui voyage seul ou avec un seul parent peut devoir présenter une lettre de consentement notariée et une preuve de filiation.",
        "Vers les États-Unis par voie terrestre ou maritime, un enfant de 15 ans et moins peut utiliser son certificat de naissance ou de citoyenneté au lieu d'un passeport ; en avion vers le sud, il lui faut son passeport.",
      ],
    },
    {
      h: "Assurance et inscription : les deux oublis fréquents",
      paragraphs: [
        "Le gouvernement du Canada recommande de souscrire une assurance maladie de voyage et une assurance interruption de voyage avant de partir, même pour une journée aux États-Unis. Votre régime provincial peut ne couvrir qu'une partie de vos soins à l'étranger, ou pas du tout, et il ne paie jamais les factures à l'avance ; certains hôpitaux étrangers exigent un paiement immédiat.",
        "L'Inscription des Canadiens à l'étranger est un service gratuit : il permet au gouvernement du Canada de vous aviser en cas d'urgence à destination ou à la maison, et de vous transmettre des renseignements importants avant ou pendant une catastrophe naturelle.",
      ],
    },
    {
      h: "Votre liste, du plus tôt au départ",
      paragraphs: [
        "Dès que vous pensez partir : vérifiez la date d'expiration de chaque passeport de la famille par rapport à la règle de la destination (6 mois pour la République dominicaine et les Bahamas). Faites la demande si nécessaire, en comptant 20 jours ouvrables plus la poste.",
        "Un mois avant : faites signer la lettre de consentement devant notaire si un parent ne voyage pas ; rassemblez certificats de naissance et documents de garde ; souscrivez l'assurance voyage.",
        "Dans les jours avant le départ : remplissez le formulaire en ligne exigé (billet électronique dominicain avant d'embarquer, formulaire de Sainte-Lucie 3 jours avant, carte ED d'Aruba dans les 7 jours, FMMN mexicain à l'arrivée) et relisez l'avis aux voyageurs de la destination sur voyage.gc.ca.",
      ],
    },
    {
      h: "Comment Zeniva Travel vous accompagne",
      paragraphs: [
        "Chaque proposition de Zeniva Travel indique ce qui est inclus et les à-côtés à prévoir. Une fois le voyage confirmé et payé en ligne par ZeniPay, les documents de voyage sont transmis par courriel. Pour une question sur votre voyage, écrivez à Lina, la concierge virtuelle, 24 heures sur 24, ou appelez au 581-748-7017.",
        "Les exigences d'entrée changent : la source qui fait foi reste voyage.gc.ca et l'ambassade ou le consulat du pays de destination.",
      ],
    },
  ],
  faq: [
    {
      q: "Combien coûte un passeport canadien en 2026 ?",
      a: "Pour un Canadien qui habite au Canada, depuis le 31 mars 2026 : 163,50 $ pour un passeport adulte de 10 ans, 122,50 $ pour 5 ans et 58,50 $ pour un passeport d'enfant (valide 5 ans au maximum). Le service de retrait urgent ajoute 125,75 $. Les frais sont ajustés chaque année.",
    },
    {
      q: "Combien de temps faut-il pour obtenir un passeport ?",
      a: "Au Canada, la norme de service est de 10 jours ouvrables pour une demande faite en personne dans un bureau des passeports, et de 20 jours ouvrables par la poste, en ligne ou dans un Centre Service Canada ordinaire, sans compter la livraison postale. Avec une preuve de voyage, le service express prend de 2 à 9 jours ouvrables et le service urgent, jusqu'à la fin du jour ouvrable suivant.",
    },
    {
      q: "Mon bébé a-t-il besoin d'un passeport pour aller dans le sud ?",
      a: "Oui. Les enfants canadiens, bébés compris, ont besoin de leur propre passeport canadien pour voyager à l'extérieur du Canada. L'exception concerne les États-Unis par voie terrestre ou maritime pour les 15 ans et moins, pas les voyages en avion vers le Mexique ou les Caraïbes.",
    },
    {
      q: "Ai-je besoin d'une lettre de consentement si je pars seul avec mon enfant ?",
      a: "Le gouvernement du Canada la recommande fortement : elle n'est pas obligatoire selon la loi canadienne, mais la compagnie aérienne, les autorités d'immigration du pays de destination et les autorités canadiennes au retour peuvent la demander. Elle doit être signée par l'autre parent, idéalement devant notaire, et préciser la destination et les dates du voyage.",
    },
    {
      q: "La lettre de consentement doit-elle être notariée ?",
      a: "Tout adulte peut être témoin de la signature, mais le gouvernement du Canada recommande fortement qu'un notaire le soit, et certains pays, comme Sainte-Lucie, peuvent exiger une lettre notariée. Gardez l'original : les photocopies ou les versions numériques peuvent être refusées.",
    },
    {
      q: "Mon passeport expire dans 4 mois : puis-je aller en République dominicaine ?",
      a: "La règle générale publiée par le gouvernement du Canada exige un passeport valide au moins 6 mois après l'arrivée en République dominicaine ; une exception pour les touristes est annoncée jusqu'au 31 décembre 2026. Comme la compagnie aérienne peut appliquer une règle plus stricte, le plus sûr est de renouveler votre passeport avant de partir.",
    },
    {
      q: "Peut-on renouveler le passeport d'un enfant ?",
      a: "Non. Il faut faire une nouvelle demande chaque fois que le passeport d'un enfant expire, signée par tous les parents ou tuteurs légaux. À 16 ans, l'enfant demande un passeport adulte.",
    },
    {
      q: "Faut-il un visa pour aller à Cuba ?",
      a: "Oui, les touristes canadiens ont besoin d'un visa, généralement inclus dans les forfaits avec vol direct du Canada ; en passant par un pays tiers, il faut un visa électronique obtenu à l'avance. Un formulaire douanier en ligne est aussi exigé. Le gouvernement du Canada recommande actuellement d'éviter tout voyage non essentiel à Cuba.",
    },
  ],
  sources: [
    { name: "Gouvernement du Canada — Modification des frais de passeport et de documents de voyage", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/frais/modification-frais-passeport.html" },
    { name: "Gouvernement du Canada — Normes de service : passeports canadiens", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/delais-traitement.html" },
    { name: "Gouvernement du Canada — Services urgent, express et de fin de semaine", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/passeport-urgent-express.html" },
    { name: "Gouvernement du Canada — Comment demander un passeport pour enfant au Canada", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/passeport-enfant.html" },
    { name: "Gouvernement du Canada — Renouveler un passeport au Canada", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/renouvellement-passeport-adulte.html" },
    { name: "Gouvernement du Canada — Lettre de consentement pour les enfants voyageant à l'extérieur du Canada", url: "https://voyage.gc.ca/voyager/enfant/lettre-consentement" },
    { name: "Gouvernement du Canada — Documents de voyage pour enfants", url: "https://voyage.gc.ca/voyager/enfant/documents" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Mexique", url: "https://voyage.gc.ca/destinations/mexique" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : République dominicaine", url: "https://voyage.gc.ca/destinations/republique-dominicaine" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Cuba", url: "https://voyage.gc.ca/destinations/cuba" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Jamaïque", url: "https://voyage.gc.ca/destinations/jamaique" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Bahamas", url: "https://voyage.gc.ca/destinations/bahamas" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Aruba", url: "https://voyage.gc.ca/destinations/aruba" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Sainte-Lucie", url: "https://voyage.gc.ca/destinations/sainte-lucie" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Costa Rica", url: "https://voyage.gc.ca/destinations/costa-rica" },
    { name: "Gouvernement du Canada — Assurance voyage", url: "https://voyage.gc.ca/voyager/documents/assurance-voyage" },
    { name: "Gouvernement du Canada — Inscription des Canadiens à l'étranger", url: "https://voyage.gc.ca/voyager/inscription" },
  ],
  cta: { label: "Demander une proposition de voyage", href: "/fr/forfaits-tout-inclus" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Renseignements tirés des sources officielles ci-dessus, consultées le 2 octobre 2026. Les exigences et les avis aux voyageurs changent : vérifiez voyage.gc.ca avant de réserver et avant de partir. Les frais de passeport sont ajustés chaque année. Ce guide ne donne aucun prix de forfait : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
