// Guide FR — « Organiser un voyage de groupe ou d'entreprise : étapes et budget »
// Emplacement prévu : web/app/fr/guides/content/organiser-voyage-de-groupe-entreprise.fr.ts
// Guide FR seulement (pas de version EN) : appliquer le correctif fr-guides-slug-page.patched.tsx
// pour que la page n'annonce pas une version anglaise inexistante (/guides/<slug> = 404).
// Complète la page de conversion /fr/voyage-de-groupe (qui reste la cible du CTA) sans la dupliquer :
// ce guide couvre la méthode, l'échéancier, la grille de budget et la fiscalité d'un voyage d'entreprise.
// Sources vérifiées le 2026-10-02 : ARC (cadeaux et récompenses, activités mondaines, frais de déplacement,
// dépenses de congrès), voyage.gc.ca (lettre de consentement, inscription, Cuba, tempêtes violentes),
// canada.ca (normes de service des passeports), NHC.
// Aucun prix de forfait : la grille de budget donne la méthode, pas de montants inventés.

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_VOYAGE_GROUPE_ENTREPRISE: GuideData = {
  slug: "organiser-voyage-de-groupe-entreprise",
  title: "Organiser un voyage de groupe ou d'entreprise : étapes, échéancier et budget",
  description:
    "La méthode pour organiser un voyage de groupe ou un voyage d'entreprise au départ du Québec : objectif et budget par personne, tarifs de groupe, contrat de bloc, échéancier de dépôts, liste des noms, grille de budget poste par poste et règles fiscales de l'ARC pour un voyage incitatif.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 9,
  tags: [
    "organiser un voyage de groupe",
    "voyage d'entreprise",
    "voyage incitatif",
    "budget voyage de groupe",
    "voyage de récompense employés impôt",
    "bloc de chambres groupe",
    "voyage de groupe départ Québec",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Pour organiser un voyage de groupe ou d'entreprise, fixez d'abord l'objectif, le budget par personne, une fourchette de participants et deux ou trois dates possibles ; demandez ensuite des tarifs de groupe de 6 à 12 mois à l'avance, puis signez un contrat de bloc qui précise le dépôt, la date limite de la liste des noms et la date du solde. Le budget se calcule par personne : hébergement et vol (ou forfait), transferts, salle de réunion et activités, assurance voyage, pourboires et une réserve pour les imprévus. Pour un voyage d'entreprise, prévoyez l'impôt dès le départ : selon l'Agence du revenu du Canada, un voyage offert pour récompenser le rendement, par exemple l'atteinte d'objectifs de vente, est un avantage imposable pour l'employé, à sa juste valeur marchande.",
  keyTakeaways: [
    "Commencez avec une fourchette : un nombre approximatif de participants et quelques dates suffisent pour obtenir des tarifs de groupe.",
    "Beaucoup d'hôtels parlent de groupe à partir d'environ 10 chambres, et les compagnies de croisière à partir d'environ 8 cabines ; en dessous, on réserve souvent des chambres individuelles aux mêmes dates.",
    "Tout se joue dans le contrat de bloc : dépôt, date limite pour la liste des noms, date du solde, conditions d'annulation et de remplacement.",
    "Voyage incitatif : selon l'ARC, une récompense liée au rendement est imposable en entier ; la limite de 500 $ pour les cadeaux et récompenses non monétaires ne s'y applique pas.",
    "Groupe avec des mineurs (équipe sportive, école) : chaque enfant devrait avoir une lettre de consentement signée par ses parents, recommande le gouvernement du Canada.",
    "Évitez de fixer un grand voyage de groupe de la mi-août à la mi-octobre : c'est la période la plus active de la saison des ouragans dans l'Atlantique.",
  ],
  sections: [
    {
      h: "Étape 1 : définir l'objectif, le budget et le groupe",
      paragraphs: [
        "Avant de demander un seul prix, écrivez en une phrase pourquoi le groupe part : récompenser une équipe de vente, tenir un séminaire, souligner une fin d'année, réunir un club ou une famille. L'objectif décide de tout le reste : un séminaire exige une salle de réunion et un horaire ; un voyage de récompense mise sur le complexe et le temps libre ; un club cherche surtout un prix par personne accessible.",
        "Fixez ensuite trois chiffres : le budget par personne (ou le budget total de l'entreprise), une fourchette de participants (par exemple de 20 à 30) et deux ou trois dates possibles. Précisez la ville de départ : Québec (YQB), Montréal (YUL), Ottawa ou une combinaison si les participants viennent de plusieurs régions.",
        "Décidez enfin qui paie quoi : l'entreprise paie tout, chaque participant paie sa part, ou une formule mixte (l'entreprise paie le participant, le conjoint paie sa place). Cette décision change la façon de percevoir les paiements et, pour une entreprise, le traitement fiscal.",
      ],
    },
    {
      h: "Étape 2 : obtenir et comparer les tarifs de groupe",
      paragraphs: [
        "Les tarifs de groupe sont négociés avec chaque fournisseur : complexe hôtelier, compagnie de croisière, transporteur aérien. Selon le fournisseur, un tarif de groupe peut offrir un prix bloqué pour tout le groupe, des conditions de dépôt adaptées, parfois une place gratuite ou un crédit selon le nombre de personnes payantes, et une date limite pour fournir la liste des noms plutôt que tous les noms dès le départ.",
        "Comparez les options sur la même base : prix par personne en occupation double, supplément pour une personne seule, ce qui est inclus (repas, boissons, transferts, salle de réunion), conditions de dépôt et d'annulation. Deux soumissions au même prix peuvent cacher des conditions très différentes.",
        "Pour un groupe, la croisière est souvent pratique : un seul prix couvre l'hébergement, les repas et les déplacements entre les escales. Le tout-inclus dans le sud convient bien à un séminaire au soleil avec salle de réunion.",
      ],
    },
    {
      h: "Étape 3 : signer le contrat de bloc et suivre l'échéancier",
      paragraphs: [
        "Une fois l'option choisie, les places sont bloquées selon le contrat du fournisseur. Lisez-y quatre dates et conditions : le montant et la date du dépôt ; la date limite pour la liste des noms ; la date du solde ; les règles d'annulation et de remplacement d'un participant. C'est aussi là qu'on voit, le cas échéant, combien de chambres ou de cabines peuvent être libérées sans pénalité si le groupe rétrécit.",
        "Inscrivez ces dates dans le calendrier de l'organisateur et fixez à vos participants des échéances quelques jours avant celles du fournisseur. C'est la façon la plus simple de ne jamais payer pour une chambre vide.",
      ],
      table: {
        caption: "Échéancier type d'un voyage de groupe dans le sud ou en croisière",
        columns: ["Quand", "Étape", "Responsable"],
        rows: [
          ["12 à 6 mois avant (plus tôt pour les Fêtes et la relâche)", "Demande, comparaison des options, choix de la destination et des dates", "Organisateur et agence"],
          ["Dès le choix fait", "Signature du contrat de bloc et versement du dépôt du groupe", "Organisateur"],
          ["Dans les semaines suivantes", "Invitation aux participants avec le prix par personne, ce qui est inclus et la date limite d'inscription ; vérification des passeports", "Organisateur"],
          ["Avant la date limite du fournisseur", "Envoi de la liste des noms, tels qu'ils figurent au passeport", "Organisateur"],
          ["Avant la date du solde", "Perception des paiements des participants et paiement du solde", "Organisateur et participants"],
          ["Dernier mois", "Documents de voyage, formulaires d'entrée en ligne, lettres de consentement pour les mineurs, assurance, inscription du groupe auprès du gouvernement du Canada", "Agence, organisateur et participants"],
        ],
      },
    },
    {
      h: "Étape 4 : bâtir le budget, poste par poste",
      paragraphs: [
        "Le budget d'un voyage de groupe se calcule par personne, puis se multiplie par le nombre de participants. Les montants dépendent de la destination, de la semaine, de la catégorie d'hôtel et de la ville de départ : la grille ci-dessous sert à ne rien oublier quand vous comparez les soumissions.",
      ],
      table: {
        caption: "Grille de budget d'un voyage de groupe ou d'entreprise",
        columns: ["Poste", "Ce qui fait varier le montant", "À vérifier dans la soumission"],
        rows: [
          ["Vol et hébergement, ou forfait tout inclus", "Semaine, catégorie de chambre, ville de départ, nombre de chambres", "Prix par personne en occupation double, supplément occupation simple"],
          ["Transferts aéroport et déplacements sur place", "Autocar privé ou navette partagée, nombre d'arrivées différentes", "Inclus ou en supplément"],
          ["Salle de réunion, équipement, pauses", "Durée, nombre de jours, audiovisuel", "Inclus dans le contrat de groupe ou facturé à part"],
          ["Activités de groupe, soirée, excursions", "Exclusivité, transport, taille du groupe", "Prix par personne, minimum de participants"],
          ["Taxes et frais d'entrée", "Destination", "Inclus dans le billet ou à payer sur place"],
          ["Assurance voyage (annulation et soins)", "Âge, durée, couverture", "Recommandée pour chaque voyageur"],
          ["Pourboires et extras", "Destination, niveau de service", "À prévoir hors forfait"],
          ["Places gratuites ou crédits du fournisseur", "Nombre de personnes payantes", "Conditions écrites au contrat"],
          ["Réserve pour imprévus", "Taille du groupe, devise", "Un pourcentage fixé à l'avance par l'organisateur"],
        ],
      },
    },
    {
      h: "Voyage d'entreprise : ce que dit l'ARC",
      paragraphs: [
        "Voyage incitatif ou de récompense. Selon la politique administrative de l'Agence du revenu du Canada, un cadeau ou une récompense offert pour le rendement au travail, par exemple atteindre ou dépasser des objectifs de vente ou terminer un projet, est une « reconnaissance » : c'est un avantage imposable pour l'employé, à sa juste valeur marchande. La limite de 500 $ par année pour les cadeaux et récompenses non monétaires ne s'applique qu'aux cadeaux d'occasion spéciale et aux récompenses qui soulignent la contribution globale d'un employé, pas au rendement.",
        "Conjoint qui accompagne un employé en voyage d'affaires. Selon l'ARC, le remboursement des frais de déplacement du conjoint n'est pas imposable seulement si le montant est raisonnable, que l'employeur a demandé sa présence et que le conjoint était principalement engagé dans des activités liées à l'entreprise. Si un employé prolonge un voyage d'affaires pour des vacances, seule la partie liée à la prolongation est imposable.",
        "Fête ou activité sur place. Une activité mondaine offerte à tous les employés n'est pas un avantage imposable si elle coûte 150 $ ou moins par personne, taxes comprises, selon la politique de l'ARC ; le transport et l'hébergement pour la nuit ne sont pas inclus dans cette limite.",
        "Congrès. Un travailleur autonome ou une société de personnes peut déduire le coût de sa participation à un maximum de deux congrès par année, liés à son activité et tenus par une organisation dans les limites du territoire où elle fait habituellement affaire. Ces règles ont des nuances : validez le traitement de votre voyage avec votre comptable avant de signer.",
      ],
    },
    {
      h: "Les pièges les plus coûteux",
      paragraphs: [
        "Des noms qui ne correspondent pas au passeport. Demandez à chaque participant son nom exactement tel qu'il figure à son passeport. Vérifiez aussi les dates d'expiration dès l'inscription : un passeport se fait en 10 à 20 jours ouvrables au Canada, sans compter la poste.",
        "Des mineurs sans lettre de consentement. Pour une équipe sportive ou un groupe scolaire, le gouvernement du Canada recommande une lettre de consentement pour chaque enfant qui voyage sans ses parents, idéalement signée devant notaire.",
        "Une date en pleine saison des ouragans. La saison va du 1er juin au 30 novembre dans l'Atlantique, et la plus grande partie de l'activité se produit de la mi-août à la mi-octobre. Un séminaire de 40 personnes se déplace mal à la dernière minute.",
        "Une destination sous avis. Pour Cuba, le gouvernement du Canada recommande d'éviter tout voyage non essentiel et indique que les compagnies aériennes canadiennes ont suspendu leurs vols (avis du 28 septembre 2026). Vérifiez voyage.gc.ca avant de signer et avant de partir.",
        "Pas d'assurance annulation. Les conditions d'annulation et de remplacement dépendent du contrat du fournisseur : chaque voyageur devrait avoir une assurance voyage avec garantie annulation.",
        "Oublier l'inscription du groupe. Le service gratuit d'Inscription des Canadiens à l'étranger permet d'inscrire un groupe en ligne, en commençant par les 15 premiers voyageurs, puis d'en ajouter d'autres.",
      ],
    },
    {
      h: "Comment Zeniva Travel organise un voyage de groupe",
      paragraphs: [
        "Vous envoyez une seule demande pour tout le groupe : destination ou type de voyage, dates possibles, nombre approximatif de voyageurs, budget par personne, ville de départ. Pour un voyage d'entreprise, indiquez aussi l'objectif (récompense, réunion, fin d'année). Zeniva Travel demande les tarifs de groupe aux fournisseurs (complexes, compagnies de croisière, transporteurs) et vous présente des options comparées, avec salle de réunion ou activités de groupe si nécessaire.",
        "Une fois l'option choisie, les places sont bloquées selon le contrat du fournisseur, avec l'échéancier : dépôt, date limite pour la liste des noms, date du solde. Le paiement se fait en ligne par ZeniPay selon cet échéancier. Avant le départ, vous recevez les documents de voyage et des rappels, et le groupe a un contact en français pendant le séjour.",
        "La demande et la proposition sont gratuites et sans engagement. Service en français et en anglais, par formulaire, au 581-748-7017 ou avec Lina, la concierge virtuelle, 24 heures sur 24.",
      ],
    },
  ],
  faq: [
    {
      q: "Comment organiser un voyage de groupe étape par étape ?",
      a: "1) Définir l'objectif, le budget par personne, une fourchette de participants et quelques dates. 2) Demander des tarifs de groupe et les comparer sur la même base. 3) Signer le contrat de bloc et noter le dépôt, la date limite de la liste des noms et la date du solde. 4) Inviter les participants et percevoir les paiements avant les dates du fournisseur. 5) Préparer documents, formulaires d'entrée, assurance et lettres de consentement pour les mineurs.",
    },
    {
      q: "À partir de combien de personnes a-t-on droit à un tarif de groupe ?",
      a: "Cela dépend du fournisseur. Beaucoup d'hôtels parlent de groupe à partir d'environ 10 chambres et les compagnies de croisière à partir d'environ 8 cabines. Pour un plus petit groupe, on réserve souvent des chambres individuelles aux mêmes dates.",
    },
    {
      q: "Combien de temps à l'avance faut-il organiser un voyage de groupe ?",
      a: "De 6 à 12 mois à l'avance pour une destination soleil en hiver ou une croisière, et davantage pour un grand groupe pendant les Fêtes ou la relâche. Plus tôt, il y a plus de choix de chambres et de vols au départ de Québec.",
    },
    {
      q: "Comment calculer le budget d'un voyage d'entreprise ?",
      a: "Par personne : vol et hébergement ou forfait, transferts, salle de réunion et équipement, activités et soirée de groupe, taxes et frais d'entrée, assurance voyage, pourboires, puis une réserve pour les imprévus. Multipliez par le nombre de participants et ajoutez le coût fiscal si le voyage est un avantage imposable pour les employés.",
    },
    {
      q: "Un voyage de récompense offert aux employés est-il imposable ?",
      a: "Selon l'Agence du revenu du Canada, oui s'il récompense le rendement, par exemple l'atteinte d'objectifs de vente : c'est une « reconnaissance » imposable à sa juste valeur marchande, et la limite de 500 $ pour les cadeaux non monétaires ne s'applique pas. Faites valider le traitement par votre comptable.",
    },
    {
      q: "Qui recueille les noms et les paiements des participants ?",
      a: "L'organisateur transmet la liste des voyageurs avant la date limite du fournisseur. La façon de percevoir les paiements se prépare avec l'agence selon le groupe ; les montants et les dates sont indiqués dans la proposition et le paiement se fait en ligne par ZeniPay.",
    },
    {
      q: "Que se passe-t-il si des participants annulent ?",
      a: "Les conditions d'annulation et de remplacement dépendent du contrat du fournisseur et sont indiquées avant la signature. Chaque voyageur devrait avoir une assurance voyage avec garantie annulation.",
    },
    {
      q: "Faut-il une lettre de consentement pour un voyage d'équipe sportive ou scolaire ?",
      a: "Le gouvernement du Canada la recommande pour chaque enfant qui voyage avec un groupe sportif, scolaire, musical ou religieux sans ses parents. Elle est signée par chaque parent absent, idéalement devant notaire, et précise la destination, les dates et l'adulte accompagnateur.",
    },
  ],
  sources: [
    { name: "Agence du revenu du Canada — Cadeaux, récompenses et récompenses pour années de service", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/retenues-paie/avantages-allocations/cadeaux-recompenses-activites-mondaines/cadeaux-recompenses-recompenses-annees-service.html" },
    { name: "Agence du revenu du Canada — Activités mondaines et fonctions d'accueil", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/retenues-paie/avantages-allocations/social.html" },
    { name: "Agence du revenu du Canada — Frais de déplacement", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/retenues-paie/avantages-allocations/frais-deplacement.html" },
    { name: "Agence du revenu du Canada — Dépenses de congrès", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/entreprise-individuelle-societe-personnes/depenses-entreprise/depenses-congres.html" },
    { name: "Gouvernement du Canada — Lettre de consentement pour les enfants voyageant à l'extérieur du Canada", url: "https://voyage.gc.ca/voyager/enfant/lettre-consentement" },
    { name: "Gouvernement du Canada — Inscription des Canadiens à l'étranger", url: "https://voyage.gc.ca/voyager/inscription" },
    { name: "Gouvernement du Canada — Normes de service : passeports canadiens", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/delais-traitement.html" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Cuba", url: "https://voyage.gc.ca/destinations/cuba" },
    { name: "Gouvernement du Canada — Les tempêtes violentes à l'extérieur du Canada", url: "https://voyage.gc.ca/voyager/sante-securite/tempetes-violentes" },
    { name: "National Hurricane Center (NOAA) — Tropical cyclone climatology", url: "https://www.nhc.noaa.gov/climo/" },
  ],
  cta: { label: "Demander une soumission pour notre groupe", href: "/fr/voyage-de-groupe" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Renseignements tirés des sources officielles ci-dessus, consultées le 2 octobre 2026. Les exigences et les avis aux voyageurs changent : vérifiez voyage.gc.ca avant de réserver et avant de partir. La section fiscale résume la politique de l'ARC et ne constitue pas un avis fiscal : validez avec votre comptable. Ce guide ne donne aucun prix de forfait : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
