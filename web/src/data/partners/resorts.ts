export type ResortStatus = "active" | "onboarding" | "suspended";

export type ResortMediaCategory = {
  name: string;
  images: string[];
};

export type ResortPartner = {
  id: string;
  name: string;
  destination: string;
  type: string;
  status: ResortStatus;
  website: string;
  bookingUrl?: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  commercials: {
    model: string;
    commission: string;
    netRate?: string;
    blackoutNotes?: string;
  };
  positioning: string;
  keywords: string[];
  description: string;
  roomTypes: string[];
  amenities: string[];
  policies: string[];
  media: ResortMediaCategory[];
  pricing: {
    publicRateFrom: string;
    netRateFrom?: string;
    seasonality: string;
    blackoutDates?: string;
    availabilityNotes?: string;
  };
  marketing: {
    adHooks: string[];
    socialCaptions: string[];
    videoScript: string;
    targetMarkets: string[];
    clientTypes: string[];
    budgetRange: string;
    campaignHistory: string[];
  };
};

export const resortPartners: ResortPartner[] = [
  {
    id: "le-bora-bora",
    name: "Le Bora Bora by Pearl Resorts",
    destination: "Bora Bora, French Polynesia",
    type: "Luxury resort",
    status: "active",
    website: "https://www.leborabora.com/",
    bookingUrl: "https://booking.leborabora.com/",
    contact: {
      name: "Hina Terai",
      email: "sales@leborabora.com",
    },
    commercials: {
      model: "Commissionable BAR",
      commission: "15% on BAR",
      netRate: "On request for series",
      blackoutNotes: "Festive: Dec 20 - Jan 5",
    },
    positioning: "Overwater luxury, honeymoon, private island lagoon",
    keywords: ["overwater bungalow", "lagoon views", "luxury", "Polynesian design", "couples"],
    description:
      "Iconic overwater and beach villas set on Motu Tevairoa with direct lagoon access, Polynesian design, and views of Mount Otemanu."
    ,
    roomTypes: [
      "Overwater Bungalow",
      "Otemanu View Overwater Bungalow",
      "Beach Villa with Pool",
      "Garden Villa",
    ],
    amenities: [
      "Private decks with lagoon access",
      "Full-service spa and fitness",
      "Multiple restaurants and bars",
      "Private boat transfers",
      "Complimentary snorkeling and kayaks",
    ],
    policies: ["Check-in 3pm / Check-out 11am", "No smoking in villas", "Flexible 30-day cancellation (contract)", "Credit card guarantee"],
    media: [
      {
        name: "Overwater",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/3088,1004,1,6,4,0,1600,900/-4153-/20251113085013/garden-villa-with-pool-le-bora-bora-by-pearl-resorts.jpeg",
        ],
      },
      {
        name: "Pools & Lagoon",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/3088,1004,1,6,4,0,1600,900/-4153-/20251113085013/garden-villa-with-pool-le-bora-bora-by-pearl-resorts.jpeg",
        ],
      },
      {
        name: "Dining",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/3088,1004,1,6,4,0,1600,900/-4153-/20251113085013/garden-villa-with-pool-le-bora-bora-by-pearl-resorts.jpeg",
        ],
      },
    ],
    pricing: {
      publicRateFrom: "From $890 BAR",
      netRateFrom: "Series from $720",
      seasonality: "High: Jun-Sep, Festive; Shoulder: Apr-May, Oct-Nov; Low: Jan-Mar",
      blackoutDates: "Dec 20 - Jan 5",
      availabilityNotes: "Strong couples demand; lead time 45-60 days for OWB",
    },
    marketing: {
      adHooks: [
        "Wake up over the Bora Bora lagoon",
        "Private decks facing Mount Otemanu",
        "Polynesian-luxury villas with boat transfers",
      ],
      socialCaptions: [
        "Overwater mornings > everything else. Bora Bora’s lagoon, private deck, your coffee. #Zeniva",
        "Beach villas with plunge pools and Mount Otemanu in frame. Partner-only perks via Zeniva.",
      ],
      videoScript:
        "Open with drone over Motu Tevairoa, cut to overwater deck breakfast, underwater shot in clear lagoon, end on sunset dinner with Otemanu silhouette.",
      targetMarkets: ["US", "Canada", "Europe"],
      clientTypes: ["Honeymoon", "Luxury leisure", "Celebrations"],
      budgetRange: "$8k - $18k per stay",
      campaignHistory: [
        "Q1 Meta ads CTR 3.4% | CPL $42",
        "Q2 retargeting video view rate 41%",
      ],
    },
  },
  {
    id: "le-tahiti",
    name: "Le Tahiti by Pearl Resorts",
    destination: "Tahiti, French Polynesia",
    type: "Beach resort",
    status: "active",
    website: "https://www.letahiti.com/",
    bookingUrl: "https://booking.letahiti.com/",
    contact: {
      name: "Moana Teriitahi",
      email: "sales@letahiti.com",
    },
    commercials: {
      model: "Net rate",
      commission: "10% override on upsell",
      netRate: "From $320",
      blackoutNotes: "Heiva festival weeks",
    },
    positioning: "Oceanfront black-sand beach, close to Papeete, strong pre/post-cruise",
    keywords: ["black sand", "oceanfront", "spa", "close to Papeete"],
    description:
      "Oceanfront suites on Lafayette black-sand beach, minutes from Papeete with spa, infinity pool, and cruise-friendly logistics.",
    roomTypes: ["Ocean View Room", "Premium Ocean Suite", "Family Suite"],
    amenities: ["Infinity pool", "Spa and hammam", "Shuttle to Papeete", "Oceanfront dining"],
    policies: ["Check-in 3pm / Check-out 11am", "City tax applies", "Credit card guarantee"],
    media: [
      {
        name: "Beach & Pool",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/1974,1004,1,6,4,0,1600,900/-4620-/20201124084419/ocean-view-room-le-tahiti-by-pearl-resorts.jpeg",
        ],
      },
      {
        name: "Rooms",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/1974,1004,1,6,4,0,1600,900/-4620-/20201124084419/ocean-view-room-le-tahiti-by-pearl-resorts.jpeg",
        ],
      },
    ],
    pricing: {
      publicRateFrom: "From $280 BAR",
      netRateFrom: "From $320 net (packages)",
      seasonality: "High: Jul-Aug; Shoulder: Mar-Jun, Sep-Nov; Low: Dec-Feb",
      availabilityNotes: "Cruise pre/post demand spikes Thu-Sun",
    },
    marketing: {
      adHooks: ["Tahiti stopover made luxe", "Black-sand sunrise spa", "Closest premium resort to Papeete"],
      socialCaptions: [
        "Overnight in Tahiti before Bora Bora? Black-sand beach, infinity pool, spa hammam.",
        "5 minutes from Papeete, all the oceanfront views. Partner perks via Zeniva.",
      ],
      videoScript: "Open on black-sand beach sunrise, spa hammam steam, pool-to-ocean pan, night city lights from balcony.",
      targetMarkets: ["US", "Canada", "Europe"],
      clientTypes: ["Pre/post cruise", "Leisure", "Short stays"],
      budgetRange: "$600 - $1.5k per stay",
      campaignHistory: ["Awaiting first flighted campaign (onboarding)", "Creative kit delivered to marketing"],
    },
  },
  {
    id: "le-tikehau",
    name: "Le Tikehau by Pearl Resorts",
    destination: "Tikehau, Tuamotu",
    type: "Boutique island resort",
    status: "active",
    website: "https://www.letikehau.com/",
    bookingUrl: "https://booking.letikehau.com/",
    contact: {
      name: "Tehani Moe",
      email: "sales@letikehau.com",
    },
    commercials: {
      model: "Commissionable BAR",
      commission: "15%",
      blackoutNotes: "Peak dive weeks limited OWB",
    },
    positioning: "Pink-sand motu, lagoon-facing bungalows, top diving spot",
    keywords: ["diving", "pink sand", "lagoon", "boutique", "overwater"],
    description:
      "Intimate motu escape with pink-sand beaches, overwater and beach bungalows, renowned lagoon diving and manta encounters.",
    roomTypes: ["Overwater Bungalow", "Beach Bungalow", "Suite Beach Bungalow"],
    amenities: ["Diving center", "Snorkeling with mantas", "Restaurant & bar", "Bikes and kayaks"],
    policies: ["Check-in 2pm / Check-out 11am", "Island eco-fees apply", "Credit card guarantee"],
    media: [
      {
        name: "Lagoon",
        images: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80",
        ],
      },
      {
        name: "Overwater & Beach",
        images: [
          "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
        ],
      },
    ],
    pricing: {
      publicRateFrom: "From $520 BAR",
      seasonality: "High: Jun-Oct; Low: Jan-Mar",
      availabilityNotes: "OWB limited inventory; divers book 60+ days out",
    },
    marketing: {
      adHooks: ["Pink-sand motu hideaway", "Dive with mantas in Tikehau", "Boutique overwater without crowds"],
      socialCaptions: [
        "Tikehau = pink sand + manta dives. Boutique overwater bungalows, lagoon that glows.",
        "Lagoon bikes, kayaks, and dives from your doorstep. Partner perks via Zeniva.",
      ],
      videoScript: "Open on pink-sand shoreline, cut to manta glide, overwater sunset from deck, bonfire on the beach.",
      targetMarkets: ["US", "Europe"],
      clientTypes: ["Diving", "Boutique luxury", "Couples"],
      budgetRange: "$4k - $9k per stay",
      campaignHistory: ["Q1 dive push CTR 3.1%", "Email to divers: OR 41%, CR 6%"],
    },
  },
  {
    id: "le-tahaa",
    name: "Le Taha'a by Pearl Resorts",
    destination: "Motu Tautau, Taha'a (near Bora Bora)",
    type: "Luxury island resort",
    status: "active",
    website: "https://www.letahaa.com/",
    contact: {
      name: "Pearl Resorts",
      email: "info@pearlresorts.com",
    },
    commercials: {
      model: "Commissionable BAR",
      commission: "15%",
      blackoutNotes: "Festive and peak French holidays",
    },
    positioning: "Relais & Châteaux private motu facing Taha'a and Bora Bora",
    keywords: ["overwater", "private island", "luxury", "relais & chateaux", "Bora Bora views"],
    description:
      "59 suites and villas on a private motu between Taha'a and Bora Bora, combining overwater suites and beach villas with pools, classic Polynesian style, and Michelin Keys recognition.",
    roomTypes: ["Pool Beach Villa", "Taha'a Overwater Suite", "Bora Bora Overwater Suite", "End of Pontoon Suite"],
    amenities: [
      "Private motu transfers (boat/helicopter)",
      "Beach villas with private pools",
      "Overwater suites facing Bora Bora",
      "Multiple restaurants including Titiraina beach dining",
      "Spa and lagoon activities",
    ],
    policies: ["Check-in 3pm / Check-out 11am", "Credit card guarantee", "Festive policies apply"],
    media: [
      {
        name: "Villas & Suites",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/923,1004,1,6,4,0,1600,900/-4294-/20240501080926/pool-beach-villa-le-taha-a-by-pearl-resorts.jpeg",
        ],
      },
      {
        name: "Overwater",
        images: [
          "https://dbijapkm3o6fj.cloudfront.net/resources/923,1004,1,6,4,0,1600,900/-4294-/20240501080926/pool-beach-villa-le-taha-a-by-pearl-resorts.jpeg",
        ],
      },
    ],
    pricing: {
      publicRateFrom: "From $1,050 BAR",
      seasonality: "High: Jun-Oct & Festive; Shoulder: Apr-May, Nov; Low: Jan-Mar",
      blackoutDates: "Festive",
      availabilityNotes: "Overwater suites high demand; helicopter transfers from Bora Bora available",
    },
    marketing: {
      adHooks: [
        "Private motu between Taha'a and Bora Bora",
        "Relais & Châteaux hideaway with overwater suites",
        "Pool beach villas steps from the lagoon",
      ],
      socialCaptions: [
        "Bora Bora on the horizon, your pool villa on a private motu. Relais & Châteaux calm via Zeniva.",
        "Heli from Bora Bora, check into overwater serenity at Le Taha'a."
      ],
      videoScript:
        "Open on heli approach over the lagoon, glide to pool beach villa, overwater deck breakfast with Bora Bora silhouette, sunset dinner on the sand.",
      targetMarkets: ["US", "Canada", "Europe"],
      clientTypes: ["Luxury leisure", "Honeymoon", "Celebrations"],
      budgetRange: "$8k - $18k per stay",
      campaignHistory: ["Onboarded for Pearl collection; awaiting first Zeniva flight"],
    },
  },
  {
    id: "le-nuku-hiva",
    name: "Le Nuku Hiva by Pearl Resorts",
    destination: "Taiohae Bay, Nuku Hiva (Marquesas)",
    type: "Boutique lodge",
    status: "active",
    website: "https://www.lenukuhiva.com/",
    contact: {
      name: "Pearl Resorts",
      email: "info@pearlresorts.com",
    },
    commercials: {
      model: "Net + commission",
      commission: "12%",
      blackoutNotes: "Limited inventory; coordinate for cultural festivals",
    },
    positioning: "Marquesan hillside lodge with panoramic bay views and cultural focus",
    keywords: ["Marquesas", "cultural", "hillside lodge", "bay views"],
    description:
      "20-bungalow lodge on the hillside above Taiohae Bay with infinity pool, cultural experiences, and access to the Marquesas' wild landscapes.",
    roomTypes: ["Bay View Bungalow", "Premium Bay View Bungalow"],
    amenities: [
      "Infinity pool facing Taiohae Bay",
      "Restaurant, bar, and lounge",
      "Cultural excursions and sculpture workshops",
      "Free Wi-Fi and bike rentals",
    ],
    policies: ["Check-in 2pm / Check-out 11am", "Marquesas time zone (+30 min)"],
    media: [
      {
        name: "Lodge & Pool",
        images: [
          "https://www.lenukuhiva.com/uploads/66d9f82606097_PISCINE.jpg",
        ],
      },
      {
        name: "Island & Culture",
        images: [
          "https://www.lenukuhiva.com/img/2024-01-03-tikehau.jpg",
        ],
      },
    ],
    pricing: {
      publicRateFrom: "From $420 BAR",
      seasonality: "High: Jun-Sep; Shoulder: Apr-May, Oct; Low: Nov-Mar",
      availabilityNotes: "Small inventory; align with festival dates and flight schedules",
    },
    marketing: {
      adHooks: [
        "Marquesas vistas from your hillside bungalow",
        "Culture-first lodge with infinity pool over Taiohae Bay",
        "Remote, authentic Marquesas with guided excursions",
      ],
      socialCaptions: [
        "Taiohae Bay at sunrise, infinity pool and carvings nearby. The Marquesas via Zeniva.",
        "20 bungalows, wild valleys, and cultural encounters in Nuku Hiva.",
      ],
      videoScript:
        "Drone over Taiohae Bay, pool deck sunrise, carving workshop, cliffside vistas, night sky over the lodge.",
      targetMarkets: ["US", "Europe"],
      clientTypes: ["Adventure luxury", "Culture", "Explorers"],
      budgetRange: "$5k - $10k per trip",
      campaignHistory: ["Onboarding; assets sourced from partner site"],
    },
  },
  {
    id: "tribe-resorts",
    name: "Tribe Resorts",
    destination: "Juan Dolio, Dominican Republic",
    type: "Boutique beach resort",
    status: "active",
    website: "https://triberesorts.com/",
    contact: {
      name: "Sonia (Tribe Resorts)",
      email: "info@coachsonia.com",
    },
    commercials: {
      model: "Net + commission",
      commission: "12% override on net",
      netRate: "From $210 net (retreat blocks)",
      blackoutNotes: "Peak holidays and large retreat buyouts may limit inventory",
    },
    positioning: "Wellness-first boutique on a private Dominican beach with retreat and events focus",
    keywords: ["wellness", "retreats", "private beach", "events", "Dominican Republic", "boutique"],
    description:
      "46-key boutique resort on Playa Juan Dolio blending private beach access, wellness studio (sauna, ice bath, gym), and media-ready spaces for retreats, events, and small corporate offsites.",
    roomTypes: ["Ocean View Room", "Garden View Room", "Suites for retreats", "Connecting rooms for groups"],
    amenities: [
      "Private beach with beach club and bonfire pit",
      "Olympic-length pool and beachfront jacuzzi",
      "Fitness studio, sauna, and ice baths",
      "Media centre and podcast room",
      "Airport transfers from SDQ / PUJ / LRM",
      "Event and wedding setup support",
    ],
    policies: [
      "Check-in 3pm / Check-out 11am",
      "Group/event minimums may apply for full studio use",
      "Deposit required for retreat blocks",
    ],
    media: [
      {
        name: "Beach & Pool",
        images: [
          "https://triberesorts.com/wp-content/uploads/2023/02/Dj-Beach-Party-1024x683.jpg",
          "https://triberesorts.com/wp-content/uploads/2025/02/wholepalce.webp",
          "https://triberesorts.com/wp-content/uploads/2025/02/traveler-image32.jpg",
        ],
      },
      {
        name: "Rooms & Suites",
        images: [
          "https://triberesorts.com/wp-content/uploads/2025/02/food-plate.webp",
          "https://triberesorts.com/wp-content/uploads/2025/02/bushtribe.webp",
        ],
      },
      {
        name: "Wellness & Events",
        images: [
          "https://triberesorts.com/wp-content/uploads/2025/02/foodiiie.webp",
          "https://triberesorts.com/wp-content/uploads/2025/02/wholepalce-228x228.webp",
        ],
      },
    ],
    pricing: {
      publicRateFrom: "From $260 BAR",
      netRateFrom: "Retreat blocks from $210 net",
      seasonality: "High: Dec-Apr; Shoulder: May-Jul; Low: Aug-Nov (hurricane watch)",
      blackoutDates: "Festive and major holiday weekends",
      availabilityNotes: "Buyouts and retreats block inventory; plan 45-90 days lead time",
    },
    marketing: {
      adHooks: [
        "Private Dominican beach for your retreat",
        "Sauna, ice baths, and oceanfront recovery in one place",
        "Boutique 46-room hideaway with media-ready studios",
      ],
      socialCaptions: [
        "Wellness meets the Caribbean. Sauna + ice baths + private beach nights — curated by Zeniva.",
        "Retreats without the crowd: 46 keys, Juan Dolio sands, and a team that handles events end-to-end.",
      ],
      videoScript:
        "Open on sunrise over Juan Dolio beach, cut to ice bath/sauna contrast, gym reps, then golden-hour pool and bonfire by the beach.",
      targetMarkets: ["US", "Canada", "LatAm"],
      clientTypes: ["Retreats", "Wellness groups", "Boutique leisure", "Small corporate offsites"],
      budgetRange: "$3k - $8k per stay; custom for retreats",
      campaignHistory: [
        "Pending first Zeniva campaign (onboarding)",
        "High intent on retreats and weddings landing pages",
      ],
    },
  },
];

export default resortPartners;
