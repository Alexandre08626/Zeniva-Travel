// Guide FR — « Voyage tout inclus en famille avec enfants : quoi vérifier »
// Guide FR seulement (pas de version EN) : /fr/guides/[slug] n'annonce la version anglaise que si elle existe.
// Complète sans les dupliquer : all-inclusive-cancun-cost-family-of-four (budget chiffré Cancún) et
// documents-voyage-etranger-passeport-enfant (passeport et lettre de consentement, résumés ici en deux lignes).
// Sources vérifiées le 2026-10-02 :
//  - voyage.gc.ca : Mexique (mis à jour le 1er oct. 2026), République dominicaine (26 mai 2026), Voyager avec des enfants
//    (modifiée le 2026-09-03), Assurance voyage.
//  - Transports Canada : ensembles de retenue d'enfants dans les aéronefs commerciaux (autorisés depuis 1990, non obligatoires).
//  - Santé Canada : conseils de sécurité au soleil pour les parents (moins de 6 mois, moins d'un an).
//  - Québec.ca : séjours hors du Québec (la RAMQ ne rembourse qu'en partie).
//  - canada.ca : frais de passeport depuis le 31 mars 2026 (mêmes montants que le guide documents).
//  - visitax.gob.mx : contribution obligatoire pour tous les touristes étrangers, sans tarif enfant distinct.
// Retiré faute de source officielle accessible : montant quotidien remboursé par la RAMQ à l'étranger (ramq.gouv.qc.ca
// répond 403), montant de la VISITAX en pesos, prix de forfaits.

import type { GuideData } from "../../../guides/guides-data";

export const GUIDE_FR_FAMILLE_TOUT_INCLUS: GuideData = {
  slug: "voyage-tout-inclus-en-famille-quoi-verifier",
  title: "Voyage tout inclus en famille avec enfants : quoi vérifier avant de réserver",
  description:
    "La liste de vérification d'un tout-inclus en famille au départ du Québec : occupation de la chambre, club enfants, piscines et plage, avion avec un bébé, santé et soleil, documents des enfants, assurance et frais à prévoir, avec les sources officielles.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 8,
  tags: [
    "tout inclus en famille",
    "voyage dans le sud avec enfants",
    "club enfants tout inclus",
    "voyager avec un bébé dans le sud",
    "assurance voyage famille Québec",
    "Zeniva Travel",
  ],
  shortAnswer:
    "Avant de réserver un tout-inclus en famille, vérifiez cinq choses : que la chambre accepte vraiment votre nombre de personnes, bébé compris ; l'âge d'admission et l'horaire du club enfants ; la sécurité des piscines et de la plage, car selon le gouvernement du Canada les services de sauvetage au Mexique et en République dominicaine ne sont pas toujours conformes aux normes canadiennes ; les documents de chaque enfant (son propre passeport et, si un parent ne voyage pas, une lettre de consentement) ; et une assurance voyage qui couvre les soins à l'étranger, parce que la RAMQ ne rembourse ces frais qu'en partie. Le reste, c'est-à-dire la destination et la semaine, se compare ensuite à prix total.",
  keyTakeaways: [
    "L'occupation maximale d'une chambre se vérifie avant le prix : demandez si le bébé y est compté et combien de lits il y a réellement.",
    "Le club enfants a ses propres règles : âges admis, heures d'ouverture, inscription, présence d'un parent pour les plus petits. Elles varient d'un complexe à l'autre.",
    "Mexique et République dominicaine : contre-courants fréquents, sauvetage pas toujours conforme aux normes canadiennes et drapeaux d'avertissement parfois absents (voyage.gc.ca).",
    "Bébé de moins d'un an : pas d'exposition directe au soleil ; pas de crème solaire avant 6 mois sans avis d'un professionnel de la santé (Santé Canada).",
    "Chaque enfant a besoin de son propre passeport pour l'avion vers le sud : 58,50 $ pour un enfant de 15 ans et moins depuis le 31 mars 2026.",
    "Consultez un professionnel de la santé ou une clinique santé-voyage environ six semaines avant le départ (voyage.gc.ca).",
  ],
  sections: [
    {
      h: "Le complexe : la liste de vérification",
      paragraphs: [
        "Deux complexes de même catégorie peuvent être très différents pour une famille. Les points ci-dessous se vérifient dans la description de la chambre, les conditions du complexe ou en posant la question avant de réserver. Les règles changent d'un établissement à l'autre : aucune ne doit être tenue pour acquise.",
      ],
      table: {
        caption: "Ce qu'il faut vérifier dans un tout-inclus avec des enfants",
        columns: ["Point à vérifier", "Pourquoi c'est important", "La question à poser"],
        rows: [
          ["Occupation maximale de la chambre", "Une chambre peut être limitée en nombre de personnes, et certains complexes y comptent les bébés.", "Combien de personnes au maximum, bébé compris ? Faut-il une chambre familiale ou deux chambres communicantes ?"],
          ["Lits", "« Chambre pour quatre » ne veut pas toujours dire quatre places pour dormir.", "Combien de lits et de quelle taille ? Un canapé-lit ou un lit de bébé est-il ajouté, et est-ce payant ?"],
          ["Club enfants", "Les âges admis, les heures et les règles d'inscription varient.", "À partir de quel âge ? Quelles heures ? Un parent doit-il rester avec les tout-petits ? Y a-t-il un club ados ?"],
          ["Équipement pour bébé", "Lit de bébé, chaise haute, poussette ou chauffe-biberon ne sont pas offerts partout.", "Qu'est-ce qui est fourni, sur demande, et ce qui est payant ?"],
          ["Piscines", "Pataugeoire, profondeur et surveillance changent d'un complexe à l'autre.", "Y a-t-il une piscine pour enfants ? Les piscines sont-elles surveillées, et à quelles heures ?"],
          ["Plage", "Contre-courants et sauvetage inégal selon le gouvernement du Canada.", "La plage du complexe est-elle surveillée ? Y a-t-il un système de drapeaux ? Une zone de baignade protégée ?"],
          ["Restaurants à la carte", "Certains ont un âge minimum, une tenue exigée ou une réservation obligatoire.", "Les enfants sont-ils admis dans tous les restaurants ? Faut-il réserver ?"],
          ["Section ou piscine réservée aux adultes", "Elle peut réduire les espaces accessibles aux familles.", "Quels espaces sont interdits aux enfants ?"],
          ["Promotion pour enfants", "Les conditions d'âge et de chambre sont précises.", "Jusqu'à quel âge, calculé à quelle date ? Dans quelle catégorie de chambre ? Pour combien d'enfants ?"],
          ["Durée du transfert", "Un long trajet en navette après le vol pèse sur les jeunes enfants.", "Combien de temps entre l'aéroport et le complexe ? Transfert partagé ou privé ?"],
        ],
      },
    },
    {
      h: "Plage et piscines : ce que dit le gouvernement du Canada",
      paragraphs: [
        "Pour le Mexique, le gouvernement du Canada signale des contre-courants fréquents, des services de sauvetage qui ne sont pas toujours conformes aux normes canadiennes, et des plages où les drapeaux d'avertissement sont absents. Il recommande de demander aux gens de l'endroit où l'on peut se baigner en sécurité.",
        "Pour la République dominicaine, il précise que les changements de marée et les vents forts peuvent provoquer de dangereux contre-courants, que plusieurs noyades surviennent chaque année et que beaucoup de plages ne sont pas surveillées adéquatement. Il recommande de respecter les zones de baignade, de suivre les drapeaux et de ne pas plonger en eaux inconnues.",
        "En pratique : un adulte désigné surveille les enfants dans l'eau à tour de rôle, les plus jeunes portent un vêtement de flottaison adapté, et on choisit, si possible, un complexe dont la plage a une zone protégée ou des sauveteurs aux heures où vous vous baignerez.",
      ],
    },
    {
      h: "L'avion avec un bébé ou un jeune enfant",
      paragraphs: [
        "Transports Canada autorise depuis 1990 l'utilisation d'un ensemble de retenue d'enfant, comme un siège d'auto conçu pour l'avion, sans l'exiger. Il précise que les sièges et les ceintures des avions ne sont pas adaptés pour retenir de façon sûre les jeunes enfants dont le poids ou la taille est sous un certain seuil.",
        "Pour utiliser un siège d'auto à bord, il faut réserver un siège pour l'enfant et vérifier auprès du transporteur que le modèle est accepté. Les conditions et les frais pour un enfant de moins de deux ans, avec ou sans siège réservé, dépendent du transporteur : demandez-les avant de réserver.",
        "Gardez dans le bagage à main les médicaments, les documents de voyage et de quoi changer et nourrir l'enfant pendant le vol et le transfert.",
      ],
    },
    {
      h: "Santé et soleil",
      paragraphs: [
        "Le gouvernement du Canada recommande de consulter un professionnel de la santé ou une clinique santé-voyage environ six semaines avant le départ, et de vérifier que les vaccins de routine sont à jour (rougeole, oreillons, rubéole, diphtérie, tétanos, coqueluche, polio, varicelle, entre autres). Même si le départ est proche, le rendez-vous reste utile.",
        "Au Mexique et en République dominicaine, la dengue est transmise par les moustiques : couvrez la peau et utilisez un insectifuge approuvé sur la peau découverte. Pour l'eau et la nourriture, la règle du gouvernement du Canada est de ne consommer que ce qui a été bouilli, cuit ou pelé.",
        "Soleil : Santé Canada recommande de ne pas exposer les bébés de moins d'un an au soleil, pour éviter les dommages à la peau et la déshydratation, et de ne pas leur mettre de crème solaire avant 6 mois sans avoir consulté un professionnel de la santé. Ombre, chapeau à large bord, vêtements amples et hydratation font partie de la valise.",
      ],
    },
    {
      h: "Documents, assurance et frais à prévoir",
      paragraphs: [
        "Chaque enfant doit avoir son propre passeport pour prendre l'avion vers le sud. Si un parent ne voyage pas, le gouvernement du Canada recommande une lettre de consentement signée par ce parent, idéalement devant notaire. Les détails, les délais et le modèle de lettre sont dans notre guide sur les documents pour voyager à l'étranger.",
        "Assurance : le gouvernement du Québec indique que, dans la plupart des situations, la RAMQ ne rembourse qu'en partie les soins reçus hors du Canada et recommande une assurance privée avant le départ. Vérifiez que la police couvre chaque enfant, les soins d'urgence, le rapatriement, l'annulation et l'interruption de voyage.",
        "Le tableau suivant regroupe les montants publiés par des sources officielles. Le prix du forfait lui-même dépend de la semaine, du complexe et de la ville de départ ; pour un exemple chiffré, voyez notre guide sur une semaine à Cancún pour une famille de quatre.",
      ],
      table: {
        caption: "Frais hors forfait pour une famille (montants officiels au 2 octobre 2026)",
        columns: ["Poste", "Montant", "Source et précisions"],
        rows: [
          ["Passeport enfant (15 ans et moins), valide 5 ans au maximum", "58,50 $", "Gouvernement du Canada, depuis le 31 mars 2026"],
          ["Passeport adulte, 10 ans / 5 ans", "163,50 $ / 122,50 $", "Gouvernement du Canada, depuis le 31 mars 2026"],
          ["Lettre de consentement", "Modèle gratuit ; frais de notaire s'il y a lieu", "voyage.gc.ca"],
          ["VISITAX (Cancún, Riviera Maya, Cozumel)", "Montant publié sur visitax.gob.mx ; pas de tarif enfant distinct", "Gouvernement du Quintana Roo : obligatoire pour tous les touristes étrangers"],
          ["Assurance voyage", "Selon l'assureur, l'âge et la durée", "La RAMQ ne rembourse qu'en partie les soins hors du Canada (Québec.ca)"],
          ["Siège réservé pour un enfant de moins de 2 ans", "Selon le transporteur", "Nécessaire pour utiliser un ensemble de retenue à bord (Transports Canada)"],
        ],
      },
    },
    {
      h: "Les pièges à éviter",
      paragraphs: [
        "Réserver la chambre la moins chère sans vérifier l'occupation. Si la famille dépasse l'occupation permise, vous risquez de devoir changer de chambre ou payer un supplément à l'arrivée.",
        "Supposer que le club enfants accepte les tout-petits. Les clubs ont souvent un âge minimum ; sous cet âge, un parent peut devoir rester sur place.",
        "Oublier le passeport du bébé. Un nouveau-né a besoin de son propre passeport pour l'avion ; comptez les délais de traitement et de photo.",
        "Partir sans lettre de consentement quand un parent reste au Canada. Elle n'est pas exigée par la loi canadienne, mais elle peut être demandée à l'embarquement, à l'arrivée ou au retour.",
        "Se fier à la RAMQ pour une urgence à l'étranger. Elle ne rembourse qu'une partie des frais ; l'assurance privée couvre le reste selon la police.",
        "Choisir la semaine seulement selon le congé scolaire. Les Fêtes et la semaine de relâche sont les plus demandées ; notre guide sur le meilleur moment pour partir dans le sud compare la météo et la saison des ouragans.",
      ],
    },
    {
      h: "Comment Zeniva Travel prépare un voyage en famille",
      paragraphs: [
        "Indiquez dans votre demande le nombre d'adultes, l'âge de chaque enfant, vos dates possibles, votre budget et votre ville de départ, par le formulaire, au 581-748-7017 ou avec Lina, la concierge virtuelle, 24 heures sur 24. Posez-nous les questions de la liste ci-dessus pour les complexes qui vous intéressent : la proposition indique ce qui est inclus ou non et le prix total pour vos dates, au départ de Québec (YQB) ou de Montréal (YUL).",
        "La demande et la proposition sont gratuites et sans engagement. Une fois la proposition acceptée, le paiement se fait en ligne par ZeniPay.",
      ],
    },
  ],
  faq: [
    {
      q: "Qu'est-ce qu'il faut vérifier avant de réserver un tout-inclus avec des enfants ?",
      a: "L'occupation maximale de la chambre (bébé compris) et le nombre de lits, l'âge d'admission et l'horaire du club enfants, la surveillance des piscines et de la plage, les restaurants accessibles aux enfants, les conditions exactes des promotions pour enfants, la durée du transfert, puis les documents et l'assurance de chaque membre de la famille.",
    },
    {
      q: "Mon bébé a-t-il besoin d'un passeport pour aller dans le sud ?",
      a: "Oui. Pour prendre l'avion vers le Mexique, la République dominicaine ou les Caraïbes, chaque enfant, même un nouveau-né, doit avoir son propre passeport. Depuis le 31 mars 2026, le passeport d'un enfant de 15 ans et moins coûte 58,50 $ et est valide 5 ans au maximum.",
    },
    {
      q: "Faut-il une lettre de consentement si un seul parent part avec les enfants ?",
      a: "Le gouvernement du Canada la recommande pour tout enfant de moins de 19 ans qui voyage sans ses deux parents. Elle n'est pas exigée par la loi canadienne, mais elle peut être demandée par les autorités étrangères, les compagnies aériennes ou au retour. Un modèle gratuit est offert sur voyage.gc.ca, et la signature devant notaire est fortement recommandée.",
    },
    {
      q: "Est-ce sécuritaire de se baigner à la mer avec des enfants au Mexique ou à Punta Cana ?",
      a: "Avec prudence. Le gouvernement du Canada signale des contre-courants fréquents, des services de sauvetage pas toujours conformes aux normes canadiennes et des plages sans drapeaux d'avertissement. Choisissez une plage surveillée ou une zone protégée, respectez les drapeaux et gardez un adulte désigné près des enfants dans l'eau.",
    },
    {
      q: "Peut-on apporter un siège d'auto dans l'avion pour un bébé ?",
      a: "Oui, si le modèle est accepté par le transporteur et qu'un siège a été réservé pour l'enfant. Transports Canada autorise les ensembles de retenue d'enfant depuis 1990 sans les rendre obligatoires, et précise que les ceintures des avions ne sont pas adaptées aux jeunes enfants sous un certain poids ou une certaine taille.",
    },
    {
      q: "La RAMQ couvre-t-elle mes enfants dans le sud ?",
      a: "En partie seulement. Le gouvernement du Québec indique que, dans la plupart des situations, la RAMQ ne rembourse qu'une partie des soins reçus hors du Canada et recommande une assurance privée avant le départ. Vérifiez que la police couvre chaque enfant, l'hospitalisation et le rapatriement.",
    },
    {
      q: "Peut-on mettre de la crème solaire à un bébé de 4 mois ?",
      a: "Santé Canada recommande de ne pas mettre de crème solaire à un bébé de moins de 6 mois sans avoir consulté un professionnel de la santé, et de ne pas exposer un bébé de moins d'un an au soleil direct. Misez sur l'ombre, un chapeau à large bord, des vêtements amples et l'hydratation.",
    },
    {
      q: "Combien de temps avant le départ faut-il voir un médecin pour un voyage dans le sud avec des enfants ?",
      a: "Le gouvernement du Canada recommande de consulter un professionnel de la santé ou une clinique santé-voyage environ six semaines avant le départ, pour vérifier les vaccins de routine et recevoir des conseils adaptés à la destination. Même si le départ est proche, le rendez-vous reste utile.",
    },
  ],
  sources: [
    { name: "Gouvernement du Canada — Conseils aux voyageurs : Mexique (mis à jour le 1er octobre 2026)", url: "https://voyage.gc.ca/destinations/mexique" },
    { name: "Gouvernement du Canada — Conseils aux voyageurs : République dominicaine (mis à jour le 26 mai 2026)", url: "https://voyage.gc.ca/destinations/republique-dominicaine" },
    { name: "Gouvernement du Canada — Voyager avec des enfants", url: "https://voyage.gc.ca/voyager/enfant" },
    { name: "Gouvernement du Canada — Lettre de consentement pour les enfants voyageant à l'extérieur du Canada", url: "https://voyage.gc.ca/voyager/enfant/lettre-consentement" },
    { name: "Gouvernement du Canada — Modification des frais de passeport et de documents de voyage", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens/frais/modification-frais-passeport.html" },
    { name: "Transports Canada — Obligation d'utiliser des ensembles de retenue d'enfants dans les aéronefs commerciaux", url: "https://tc.canada.ca/fr/aviation/services-aeriens-commerciaux/transport-passagers/obligation-utiliser-ensembles-retenue-enfants-dans-aeronefs-commerciaux" },
    { name: "Santé Canada — Conseils sur la sécurité au soleil pour les parents", url: "https://www.canada.ca/fr/sante-canada/services/securite-soleil/conseils-securite-soleil-pour-parents.html" },
    { name: "Gouvernement du Québec — Séjours hors du Québec", url: "https://www.quebec.ca/sante/systeme-et-services-de-sante/sejours-hors-du-quebec" },
    { name: "Gouvernement du Canada — Assurance voyage", url: "https://voyage.gc.ca/voyager/documents/assurance-voyage" },
    { name: "Gouvernement du Quintana Roo — VISITAX (site officiel)", url: "https://www.visitax.gob.mx/sitio/" },
  ],
  cta: { label: "Recevoir une proposition pour ma famille", href: "/fr/forfaits-tout-inclus" },
  aboutId: "https://www.zenivatravel.com/#organization",
  disclaimer:
    "Renseignements tirés des sources officielles ci-dessus, consultées le 2 octobre 2026. Les règles des complexes (occupation, club enfants, restaurants) varient d'un établissement à l'autre : vérifiez-les pour votre réservation. Les avis aux voyageurs changent : consultez voyage.gc.ca avant de réserver et avant de partir. Ce guide ne donne aucun prix de forfait : chaque proposition Zeniva Travel est chiffrée pour vos dates.",
};
