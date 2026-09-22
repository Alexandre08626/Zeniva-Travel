// Newsroom — each announcement is a /news/[slug] page with NewsArticle schema, authored by
// the founder and linked (about) to the brand entity. English counterpart of zeniva.ca/nouvelles.

export interface NewsItem {
  slug: string;
  title: string;
  summary: string;
  datePublished: string;
  dateline: string;
  aboutId: string;
  brand: string;
  paragraphs: string[];
  quote?: string;
  boilerplate: string;
  links: { label: string; href: string }[];
}

export const NEWS: NewsItem[] = [
  {
    slug: 'zeniva-travel-launches-lina-ai-travel-concierge',
    title: 'Zeniva Travel launches Lina, an AI travel concierge that builds bookable trip proposals in seconds — 24/7, by chat or voice',
    summary:
      'Travelers describe a trip in plain language and Lina returns a complete, priced proposal — flights, hotel or villa, transfers, experiences — from live inventory, in seconds, in English or French. Complex bookings are validated by licensed humans before any deposit.',
    datePublished: '2026-09-22',
    dateline: 'Wilmington, DE',
    aboutId: 'https://www.zenivatravel.com/#organization',
    brand: 'Zeniva Travel',
    paragraphs: [
      'Zeniva Travel (Zeniva LLC), a Delaware-incorporated travel agency serving all 50 US states and Canada, today announced the public availability of Lina, its AI travel concierge. Travelers describe a trip in plain language — destination, dates, budget, who is going — and Lina returns a complete proposal with flights, hotel or villa, transfers and experiences, priced from live inventory, in seconds. Lina works by chat and by voice call, in English and French, around the clock.',
      'Unlike chatbots attached to travel websites, Lina is connected to live inventory and re-prices the whole proposal when a traveler changes a date or adds a guest. Complex bookings — private yacht charters through the ZeniYacht division, group contracts, multi-country itineraries — are validated by a licensed human agent or yacht broker before any deposit is taken.',
      'Zeniva Travel also announced its independent-agent program: agents who work with Lina keep 70% of net profit on their bookings, with Zeniva providing the technology, supplier contracts and payment infrastructure.',
      'Travelers can start at zenivatravel.com/chat. Guides on what a yacht charter really costs in 2026 and how an AI travel agent works are at zenivatravel.com/guides.',
    ],
    quote: 'People do not want a list of links at 11 pm; they want a priced trip they can say yes to. Lina does the research and the drafting. Humans validate what needs validating.',
    boilerplate:
      'Zeniva Travel (Zeniva LLC) is a US-based AI travel agency founded in 2024 by Alexandre Blais, part of Zeniva Group. It plans luxury vacations, custom trips, group travel and private yacht charters (ZeniYacht) for travelers in the United States and Canada. zenivatravel.com',
    links: [
      { label: 'Plan a trip with Lina', href: '/chat' },
      { label: 'ZeniYacht — private yacht charters', href: '/zeniyacht' },
      { label: 'Travel guides with real 2026 prices', href: '/guides' },
      { label: 'Independent agent program', href: '/agents' },
    ],
  },
  {
    slug: 'alexandre-blais-unites-four-companies-under-zeniva-group',
    title: 'Quebec entrepreneur Alexandre Blais unites four companies under Zeniva Group: AI travel, fintech, construction and technology',
    summary:
      'Zeniva Group is the parent group for Zeniva Travel (AI travel agency, USA), ZeniPay (fintech, Canada & US), ZeniCorp (construction and renovation platform, Quebec) and ZeniTech (technology). One principle: build the technology for the group\'s own businesses first, then offer it to clients.',
    datePublished: '2026-09-22',
    dateline: 'Québec City, QC',
    aboutId: 'https://www.zeniva.ca/#group',
    brand: 'Zeniva Group',
    paragraphs: [
      'Alexandre Blais today announced Zeniva Group, the parent group for four companies he founded and operates across Canada and the United States: Zeniva Travel, an AI-powered travel agency incorporated in Delaware; ZeniPay, a Canadian fintech platform; ZeniCorp, a construction and renovation platform in Quebec; and ZeniTech, the group\'s technology division.',
      'The four companies share one operating principle: build the technology first for the group\'s own businesses, then offer it to clients. Lina, the AI travel concierge that plans and prices trips 24/7 on zenivatravel.com, was built by ZeniTech. The commission-split and payout engine that pays Zeniva Travel\'s independent agents is ZeniPay. The lead-management and automation tools that run ZeniCorp\'s contractor network are the same tools ZeniTech now sells to Quebec businesses.',
      'Zeniva Travel (zenivatravel.com) — luxury vacations, custom trips, group travel and private yacht charters (ZeniYacht) for travelers in all 50 US states and Canada, planned by Lina, an AI concierge available by chat and voice in English and French.',
      'ZeniPay (zenipay.ca) — a fintech platform for Canada and the United States: personal and business accounts, card payment acceptance, payouts, invoicing, accounting, and a built-in team of AI financial specialists.',
      'ZeniCorp (zeniva.ca) — a construction and renovation platform in Quebec with four divisions (epoxy, asphalt, roofing, insulation) and a network of RBQ-certified contractors: free quotes, firm pricing, contact within 24 hours.',
      'ZeniTech (zenitech.dev) — websites, SEO and GEO (visibility in AI answer engines), digital marketing, CRM, custom code, automation and AI agents for businesses in Quebec, Canada and the US.',
    ],
    quote: 'Every tool we sell has already run a real company with real customers. That is the whole idea. We are not an agency that builds demos — we are operators who happen to build the software.',
    boilerplate:
      'Alexandre Blais is a Quebec entrepreneur based between Québec City and the US East Coast. He founded Zeniva Travel in 2024 and has since launched ZeniPay, ZeniCorp and ZeniTech. Profile: zenivatravel.com/alexandre-blais.',
    links: [
      { label: 'Zeniva Group — the four brands', href: 'https://www.zeniva.ca/groupe' },
      { label: 'Alexandre Blais', href: '/alexandre-blais' },
      { label: 'ZeniPay', href: 'https://zenipay.ca' },
      { label: 'ZeniTech', href: 'https://zenitech.dev' },
    ],
  },
  {
    slug: 'zenipay-launches-fintech-platform-with-ai-financial-specialists',
    title: 'ZeniPay launches a Canadian fintech platform with a built-in team of AI financial specialists',
    summary:
      'Payments, payouts, invoicing and accounting with a team of AI specialists — Leo, Ben, Atlas, Vera and Kai — that read live account data. Built to run Zeniva Travel; available to other platforms under their own brand.',
    datePublished: '2026-09-22',
    dateline: 'Québec City, QC',
    aboutId: 'https://zenipay.ca/#organization',
    brand: 'ZeniPay',
    paragraphs: [
      'ZeniPay Inc. today announced ZeniPay, a fintech platform for personal and business customers in Canada and the United States. Each account combines payments (card acceptance, ACH and wire), payouts, invoicing, payment links and accounting with a team of AI specialists — Leo (accounting), Ben (finance), Atlas (security), Vera (compliance) and Kai (revenue) — that read the account\'s live data and answer questions in plain English or French.',
      'ZeniPay was built to run Zeniva Travel, the group\'s AI travel agency: it onboards independent agents as sub-merchants, applies commission-split rules on net profit, pays each party automatically and pushes the ledger to QuickBooks, Xero, Wave or FreshBooks. The same rails are now available to other platforms, agencies and contractor networks under their own brand.',
      'ZeniPay is not affiliated with ZenPay, Zen.com, Zenus Bank or Zenai Pay.',
    ],
    quote: 'Most platforms still split commissions in a spreadsheet at the end of the month. We made that a rule that fires at payment time, with an audit trail per booking. Then we gave every account an accountant, a security analyst and a compliance officer that never sleep.',
    boilerplate: 'ZeniPay Inc. is a Canadian fintech company founded in 2026 by Alexandre Blais, part of Zeniva Group. zenipay.ca',
    links: [
      { label: 'ZeniPay', href: 'https://zenipay.ca' },
      { label: 'How commission splits work for travel agents and platforms', href: 'https://zenipay.ca/blog/how-commission-splits-work-travel-agents-platforms' },
    ],
  },
];

export function findNews(slug: string): NewsItem | null {
  return NEWS.find((n) => n.slug === slug) ?? null;
}
