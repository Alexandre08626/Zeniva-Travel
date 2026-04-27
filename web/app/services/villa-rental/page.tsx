import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Villa Rentals — Caribbean, Europe, Florida | Zeniva",
  description:
    "Rent a private villa with staff, chef, and concierge. Caribbean, Tuscany, Provence, Florida, Bali. Curated by Zeniva and bookable through Lina AI.",
  keywords: [
    "private villa rental", "luxury villa rental", "villa rental Caribbean", "villa rental Tuscany",
    "villa rental Florida", "villa rental Bali", "villa rental Provence",
    "private villa with chef", "villa rental with staff", "luxury vacation rental USA",
  ],
  openGraph: {
    title: "Private Villa Rentals Worldwide | Zeniva",
    description: "Curated luxury villas with optional chef, concierge, and driver. Caribbean, Europe, Asia, Florida.",
    url: "https://www.zenivatravel.com/services/villa-rental",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Private Villa Rental — Zeniva" }],
  },
  alternates: { canonical: "https://www.zenivatravel.com/services/villa-rental" },
};

export default function VillaRentalPage() {
  return (
    <SeoPage
      h1="Private Villa Rentals Worldwide"
      subtitle="Cliffside estates in Italy, beachfront compounds in Turks and Caicos, ski chalets in the Alps — vetted villas booked end-to-end by Zeniva."
      heroImage="https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-stone-900/60"
      badge="With Optional Staff"
      sections={[
        {
          heading: "Why Book a Villa Through Zeniva",
          content: `<p>Private villas offer something hotels can't: space, privacy, and the feeling of having a place rather than a room. Booking one well requires more work than a hotel — you're choosing not just a property but a setup, a staff arrangement, a neighborhood. Most online villa platforms list thousands of properties with limited information and no quality control. Zeniva curates a smaller portfolio of villas we've inspected, in destinations we know.</p>
<p>For every booking, your Zeniva advisor handles the contract, escrow payment, pre-arrival provisioning, dietary requests for any chef, ground transfers from the airport, and a 24/7 contact during your stay. If something needs fixing — the WiFi drops, you want to add a private boat day, the chef should swap to vegetarian — we handle it without you needing to chase the property manager.</p>`,
        },
        {
          heading: "Caribbean & Florida Villas",
          content: `<p>Zeniva's Caribbean villa portfolio spans Turks and Caicos, the Bahamas, the Dominican Republic, St. Barths, Anguilla, and Jamaica. Many properties come with a full staff — house manager, housekeeper, chef, driver — included in the rate. Beachfront compounds in Turks and Caicos sleeping 8 to 12 typically run $8,000 to $25,000 per week with staff. St. Barths and Anguilla skew higher, particularly during winter peak.</p>
<p>For domestic US travelers, our Florida portfolio focuses on the Keys, Naples, Miami Beach, and Palm Beach. Pet-friendly options, kid-friendly compounds with pool and game room, and adult-only minimalist retreats are all available. We can also arrange chef service, daily housekeeping, and pool maintenance as add-ons.</p>`,
        },
        {
          heading: "European Villas",
          content: `<p>European villa season runs late April through October. Tuscany and Provence are perennial favorites — restored farmhouses with pools, vineyards, and access to truffle hunts and wine tastings. The Amalfi Coast and Capri offer dramatic cliffside properties with terraces overlooking the sea. Greek islands (Mykonos, Paros, Crete) have grown rapidly as a villa destination, often at lower prices than Italy.</p>
<p>For larger groups or events (multi-generational reunions, milestone birthdays, destination weddings), we can source estate-scale properties sleeping 16 to 30 with on-site event coordinators. These typically book 9 to 12 months ahead for peak weeks.</p>`,
        },
        {
          heading: "Asia & Indian Ocean",
          content: `<p>Bali remains Zeniva's strongest Asian villa market — Seminyak, Canggu, and Ubud each offer distinct settings, from beach club access to jungle privacy. Phuket, Koh Samui, and Sri Lanka round out our Southeast Asia portfolio. The Maldives operates differently: most "villas" are overwater bungalows at private island resorts rather than true private rentals, but Zeniva can also source the handful of true private island properties available.</p>`,
        },
      ]}
      highlights={[
        { icon: "home", title: "Vetted Properties", description: "Every villa has been personally inspected or vouched for by trusted local partners we've worked with for years." },
        { icon: "star", title: "Optional Full Staff", description: "Add a chef, housekeeper, driver, or concierge to most properties — included in the daily rate or billed separately." },
        { icon: "phone", title: "24/7 In-Trip Support", description: "Your Zeniva advisor is on call during your stay to handle any issue with the property or local logistics." },
        { icon: "shield", title: "Escrow Protected", description: "All payments held in escrow until check-in — your booking is protected if the property fails to deliver." },
        { icon: "gift", title: "Pre-Arrival Provisioning", description: "Send your grocery list, dietary requirements, and special requests in advance — everything ready when you arrive." },
        { icon: "users", title: "Group-Friendly", description: "Sleeping arrangements for 6 to 30 guests, with experience coordinating multi-family trips and events." },
      ]}
      faqs={[
        { question: "How much do private villas cost?", answer: "It depends entirely on destination, size, and season. A 4-bedroom Caribbean villa with staff typically runs $8,000 to $25,000 per week. A Tuscan farmhouse for 8 in shoulder season starts around $5,000 per week. Estate-scale properties in St. Barths or Capri during peak season can exceed $100,000 per week." },
        { question: "Are staff included?", answer: "It varies. Caribbean villas and many Asian properties include full staff in the rate. European villas typically don't — staff (chef, housekeeper, driver) can be added at an extra daily cost. Your Zeniva advisor will tell you exactly what's included before you book." },
        { question: "Can you arrange a private chef?", answer: "Yes. Whether or not the villa includes one, we can source local chefs in most destinations. Send your dietary preferences, allergies, and a sample menu — the chef will provision and prepare meals during your stay." },
        { question: "What about insurance and security deposits?", answer: "Most villas require a refundable damage deposit (typically $1,000–$5,000) held during the stay. We strongly recommend trip cancellation insurance — Zeniva can quote and book a policy as part of your reservation." },
        { question: "How far in advance should I book?", answer: "For Christmas, New Year, and summer holidays (July–August in Europe, February in the Caribbean), 9 to 12 months ahead. For shoulder seasons, 3 to 6 months is usually fine." },
      ]}
      ctaText="Find My Villa"
      ctaPrompt="I'd like to rent a private villa"
      internalLinks={[
        { label: "Florida Villas", href: "/florida-villas" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Private Villa Rental Service",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Vacation Rental",
        description: "Curated private villa rentals worldwide with optional chef, housekeeping, and concierge service.",
        areaServed: "Worldwide",
      }}
    />
  );
}
