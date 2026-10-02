// EN guide — "Destination wedding planning: legal steps, budget and guests"
// Target location: web/app/guides/content/destination-wedding-planning.en.ts
// Same slug as the FR version (web/app/fr/guides/content/destination-wedding-planning.fr.ts)
// so hreflang en-US / fr-CA and workTranslation link up automatically.
// Sources checked 2026-10-02. USD/CAD rate: Bank of Canada, 1.4243 (2026-10-01 daily average).

import type { GuideData } from "../guides-data";

export const GUIDE_EN_DESTINATION_WEDDING: GuideData = {
  slug: "destination-wedding-planning",
  title: "Destination wedding planning: legal steps, budget and guests",
  description:
    "How to plan an all-inclusive destination wedding in Mexico or the Caribbean: legal marriage vs. symbolic ceremony, published resort wedding package prices, the guest room block, documents for Canadian couples, timeline and the mistakes that cost couples money.",
  datePublished: "2026-10-02",
  dateModified: "2026-10-02",
  readingMinutes: 9,
  tags: [
    "destination wedding planning",
    "all-inclusive wedding",
    "destination wedding cost",
    "Mexico destination wedding",
    "Punta Cana wedding",
    "wedding room block",
    "symbolic ceremony",
    "Zeniva Travel",
  ],
  shortAnswer:
    "To plan a destination wedding, settle the legal question first (the simplest route is a civil marriage at home, then a symbolic ceremony at the resort), then pick a resort and its wedding package, then block rooms for your guests, with each guest paying for their own trip. As a reference point, Royalton Splash Riviera Cancún publishes 2025–2026 wedding packages from US$769 (couple only, about C$1,095) to US$13,199 (40 guests included, about C$18,800), and waives its base package when the group books at least 35 room nights.",
  keyTakeaways: [
    "A symbolic ceremony has no legal effect. To be legally married, either marry at home before you leave or hold a civil ceremony at the destination under local law.",
    "For Canadians, the Government of Canada says a marriage legally performed abroad is usually valid in Canada and does not need to be validated on return.",
    "Resort wedding packages are tied to room bookings: in Royalton's published example, 75% of guests must stay at the resort and the base package is free from 35 group room nights.",
    "Keep two budgets: the couple pays the wedding package and add-ons; each guest pays their own flight and stay in the room block.",
    "Atlantic and Caribbean hurricane season runs from early June to the end of November, and the Government of Canada currently advises against non-essential travel to Cuba.",
  ],
  sections: [
    {
      h: "Step 1: decide how you will be legally married",
      paragraphs: [
        "This decision drives the documents, the deadlines and part of the cost, so make it before you sign anything with a resort.",
        "Option A, the simplest: civil marriage at home, symbolic ceremony at the resort. You marry legally where you live, a few days or weeks before departure, and the resort stages a symbolic ceremony on the beach. Every province and state sets its own licence and waiting rules, so check with the office that issues marriage licences where you live. In Quebec, for example, the publication notice must be posted on the Directeur de l'état civil website for 20 days before the wedding, and a civil marriage performed by the clerk at a courthouse costs C$324 plus tax.",
        "Option B: civil marriage at the destination, performed under local law by the local civil registry or a notary. The Government of Canada advises contacting the embassy, high commission or consulate of the country where the marriage will take place; it will tell you which documents you need and whether they must be authenticated. Ask the resort whether it arranges this and at what price: in the Royalton example below, packages include a symbolic ceremony and a civil ceremony is an upgrade with notary fees added.",
        "Same-sex couples should check before booking: the Government of Canada notes that many countries do not recognize same-sex marriage.",
      ],
    },
    {
      h: "Step 2: paperwork if you marry legally abroad",
      paragraphs: [
        "Canada does not issue certificates of non-impediment to marriage. If the destination country asks for one, Global Affairs Canada provides a statement in lieu of a certificate of non-impediment, which states that Canada does not issue such certificates.",
        "The destination may also ask for authenticated home documents such as a birth certificate. For Quebec-issued documents, the apostille is issued by Quebec's Ministère de la Justice at C$66.50 per document; documents from federal authorities or other provinces go through their own issuing authorities.",
        "Back home, the Government of Canada states that a marriage legally performed abroad is usually valid in Canada and does not need to be validated. Quebec residents can still ask the Directeur de l'état civil to insert the foreign marriage record into the Quebec register, free of charge, which lets them order a Quebec certificate later; a record in another language must come with a certified French translation.",
        "US couples: recognition is a matter of state law, so confirm with the authority in your state that will need to recognize the marriage before choosing option B.",
      ],
    },
    {
      h: "Step 3: choose the resort and the wedding package",
      paragraphs: [
        "Read a resort wedding package on four lines: the fixed price, the number of guests included, the fee per additional guest, and the accommodation conditions (couple staying at the resort, minimum share of guests staying on site, number of room nights booked by the group). Compare those four lines across resorts before you compare photos.",
        "For a verifiable order of magnitude, here is the price list one Riviera Maya resort publishes for 2025 and 2026 wedding dates. It is not a quote: prices, inclusions and conditions vary by resort and by year. Canadian-dollar amounts are converted at the Bank of Canada rate for October 1, 2026 (US$1 = C$1.4243), before tax and card exchange fees.",
      ],
      table: {
        caption: "Example: wedding packages published by Royalton Splash Riviera Cancún (2025 and 2026 dates)",
        columns: ["Package", "Published price (USD)", "About (CAD)", "Guests included", "Each extra adult guest"],
        rows: [
          ["Just the Two of Us (couple only)", "$769", "C$1,095", "The couple", "—"],
          ["Luxury Complimentary Wedding", "Free with 35 room nights (or 14 in Diamond Club); otherwise $1,099", "C$0 or C$1,565", "10", "US$25 (about C$36)"],
          ["Refined Wedding", "$4,599", "C$6,550", "30", "US$90 (about C$128)"],
          ["Exclusive Wedding", "$13,199", "C$18,800", "40", "US$130 (about C$185)"],
        ],
      },
    },
    {
      h: "The budget: what the couple pays, what guests pay",
      paragraphs: [
        "The cleanest setup is to split the two budgets clearly in the invitation. The couple pays the wedding package, guests beyond those included, add-ons (photographer, private reception, flowers, welcome party) and any legal fees. Each guest pays their own package (flight, hotel, transfers) inside the group room block.",
        "A guest's week depends mostly on the travel week, the room category and the departure city. Our guide to what an all-inclusive Cancún week costs a family of four breaks those lines down with sources; for your exact dates, a Zeniva Travel proposal shows the full price.",
      ],
      table: {
        caption: "Destination wedding budget lines (amounts checked October 2, 2026)",
        columns: ["Line", "Who pays", "Amount or benchmark", "Source"],
        rows: [
          ["Civil marriage at home (option A)", "Couple", "Set by your province or state; Quebec courthouse example: C$324 + tax", "Government of Québec court fee schedule"],
          ["Resort wedding package", "Couple", "Published example: US$769 to US$13,199, or base package free with enough room nights", "Resort price list"],
          ["Guests beyond the package", "Couple", "Published example: US$25 to US$130 per adult, depending on the package", "Resort price list"],
          ["Civil ceremony at the destination (option B)", "Couple", "Notary fees on top of the package, per the resort", "Resort price list"],
          ["Apostille of a Quebec document", "Couple", "C$66.50 per document", "Québec Ministère de la Justice"],
          ["Each guest's flight, stay and transfers", "Each guest", "Depends on week, room and departure city", "Zeniva proposal for your dates"],
        ],
      },
    },
    {
      h: "Guests: room block, timeline and communication",
      paragraphs: [
        "Room block: once the resort is chosen, group rooms are held under the supplier's contract, with a deposit date, a name-list deadline and a final payment date. Those dates are written into the proposal, and payment is made online through ZeniPay.",
        "Timeline: start early, especially for holiday or spring-break weeks, and leave room for any waiting period on a civil marriage at home before departure.",
        "Communication: send an invitation early that states the resort, the dates, the per-person price for the week, the deadline to book in the block, and what the couple is paying for. Remind every guest to check their passport and to buy travel insurance with cancellation coverage.",
      ],
    },
    {
      h: "Mistakes that cost couples money",
      paragraphs: [
        "Mixing up symbolic and legal. In Royalton's published example, every package includes a symbolic ceremony, not a civil marriage. If you want to be legally married, plan the civil marriage at home or the civil ceremony on site.",
        "Ignoring the on-site rule. In the same example, 75% of guests must stay at the resort for the wedding to be held there. Ask what the resort allows for a guest staying elsewhere.",
        "Counting invitations instead of room nights. A free package often depends on a minimum number of group room nights (35 in the example). Count confirmed rooms, not invitations sent.",
        "Short passports. For the Dominican Republic, the Government of Canada says Canadian tourists need a passport valid for the length of the stay until December 31, 2026; otherwise the rule is at least 6 months beyond the arrival date. For a 2027 wedding, have every guest check their passport when the invitation goes out.",
        "Hurricane season without a plan B. Hurricane season runs from early June to the end of November in the Atlantic, the Caribbean Sea and the Gulf of Mexico. If you pick those months, ask the resort about its bad-weather option (indoor venue, rescheduling) and check what the insurance covers.",
        "Choosing Cuba right now. The Government of Canada advises avoiding non-essential travel to Cuba because of shortages of fuel, electricity, food, water and medicine, and reports that all Canadian airlines have suspended service to Cuba until further notice (advisory updated September 28, 2026).",
      ],
    },
    {
      h: "How Zeniva Travel handles a destination wedding",
      paragraphs: [
        "Zeniva Travel is an online travel agency founded by Quebec entrepreneur Alexandre Blais. It serves travelers in Canada and the United States, in English and French, and combines Lina, a 24/7 AI travel concierge, with human follow-up. Weddings are part of its group-travel service, ZeniGroup.",
        "Describe the wedding to Lina or by phone at 581-748-7017: destination or resort style, possible dates, approximate guest count, budget per person and where guests fly from. You receive a proposal to adjust, then the room block and payment schedule are set under the supplier's contract, and payments are made securely through ZeniPay.",
      ],
    },
  ],
  faq: [
    {
      q: "Is a destination wedding in Mexico or the Dominican Republic legally valid in Canada?",
      a: "According to the Government of Canada, a marriage legally performed in a foreign country is usually valid in Canada and does not need to be validated on return. Quebec residents can also have the foreign record inserted into the Quebec civil register at no charge. A symbolic ceremony, however, has no legal effect.",
    },
    {
      q: "What is the difference between a symbolic ceremony and a legal destination wedding?",
      a: "A symbolic ceremony is a celebration with no legal effect; it is what every package in Royalton's published list includes. A legal wedding is a civil marriage, done either at home before you leave or at the destination under local law, with the documents and fees that country requires.",
    },
    {
      q: "How much does an all-inclusive destination wedding cost?",
      a: "It depends mainly on the resort and the guest count. Royalton Splash Riviera Cancún, for example, publishes 2025–2026 wedding packages from US$769 (couple only) to US$13,199 (40 guests included), and waives its base package when the group books at least 35 room nights. Guests usually pay for their own trip, which depends on the week and the room.",
    },
    {
      q: "Do guests pay their own way to a destination wedding?",
      a: "That is the simplest arrangement: each guest pays their flight and stay in the room block, and the couple pays the wedding package and extras. State it clearly in the invitation, with the per-person price and the booking deadline.",
    },
    {
      q: "What documents do Canadians need to marry legally abroad?",
      a: "The destination country sets the list, so contact its embassy or consulate. Canada does not issue certificates of non-impediment; Global Affairs Canada provides a statement in lieu of one. Quebec-issued documents are apostilled by Quebec's Ministère de la Justice for C$66.50 each.",
    },
    {
      q: "When is hurricane season in Mexico and the Caribbean?",
      a: "In the Atlantic, the Caribbean Sea and the Gulf of Mexico, hurricane season runs from early June to the end of November, according to the Government of Canada's travel advice. If you choose those months, ask the resort about its bad-weather plan and check your insurance.",
    },
    {
      q: "Can we get married in Cuba right now?",
      a: "The Government of Canada advises avoiding non-essential travel to Cuba and reports that all Canadian airlines have suspended service there until further notice (advisory updated September 28, 2026). Mexico or the Dominican Republic are simpler to organize at the moment.",
    },
    {
      q: "Can Zeniva Travel set up the room block for our guests?",
      a: "Yes. Weddings are part of Zeniva Travel's group service. Describe the wedding to Lina, 24/7, or call 581-748-7017; the room block and payment schedule are set under the supplier's contract, and payments go through ZeniPay.",
    },
  ],
  sources: [
    { name: "Government of Canada — Marriage outside Canada", url: "https://travel.gc.ca/travelling/documents/marriage-outside-canada" },
    { name: "Global Affairs Canada — Statement in lieu of certificate of non-impediment to marriage abroad", url: "https://international.canada.ca/en/global-affairs/services/document-authentication/lieu" },
    { name: "Directeur de l'état civil du Québec — Insertion of an act made outside Québec", url: "https://www.etatcivil.gouv.qc.ca/en/insertion-act.html" },
    { name: "Government of Québec — Court fees: civil marriage and civil union", url: "https://www.quebec.ca/en/justice-and-civil-status/judicial-system/tariff-court-costs/civil-marriage-civil-union" },
    { name: "Government of Québec — Applying for an apostille (fees)", url: "https://www.quebec.ca/en/justice-and-civil-status/services/apostille/applying" },
    { name: "Royalton Splash Riviera Cancún — Wedding packages 2025 & 2026 (PDF)", url: "https://marriott.cdn.tambourine.com/royalton-resorts/media/royalton-splash-riviera-cancun---wedding-packages-68debbc2988a4.pdf" },
    { name: "Bank of Canada — Daily exchange rates", url: "https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/" },
    { name: "Government of Canada — Travel advice: Dominican Republic", url: "https://travel.gc.ca/destinations/dominican-republic" },
    { name: "Government of Canada — Travel advice: Cuba", url: "https://travel.gc.ca/destinations/cuba" },
  ],
  cta: { label: "Plan our wedding trip with Lina", href: "/chat" },
  aboutId: "https://www.zenivatravel.com/#organization",
};
