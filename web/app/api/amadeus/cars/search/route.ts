import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  destination: z.string().trim().min(1),
  checkIn: z.string().trim().min(1),
  checkOut: z.string().trim().min(1),
  guests: z.coerce.number().int().min(1).default(2),
});

// IATA airport codes for major destinations
const IATA_MAP: Record<string, string> = {
  miami: "MIA", paris: "CDG", london: "LHR", tokyo: "NRT",
  barcelona: "BCN", rome: "FCO", dubai: "DXB", "new york": "JFK",
  cancun: "CUN", tulum: "CUN", phuket: "HKT", bali: "DPS",
  maldives: "MLE", "punta cana": "PUJ", amsterdam: "AMS",
  lisbon: "LIS", sydney: "SYD", toronto: "YYZ", montreal: "YUL",
  singapore: "SIN", bangkok: "BKK", "los angeles": "LAX",
  "las vegas": "LAS", orlando: "MCO", hawaii: "HNL", maui: "OGG",
  athens: "ATH", mykonos: "JMK", santorini: "JTR", istanbul: "IST",
  "mexico city": "MEX", "costa rica": "SJO", "puerto rico": "SJU",
  "dominican republic": "PUJ", "republique dominicaine": "PUJ",
};

function getIata(destination: string): string {
  const key = destination.toLowerCase().replace(/-/g, " ").trim();
  if (/^[A-Z]{3}$/i.test(key)) return key.toUpperCase();
  if (IATA_MAP[key]) return IATA_MAP[key];
  for (const [k, v] of Object.entries(IATA_MAP)) {
    if (key.includes(k) || k.includes(key.split(" ")[0])) return v;
  }
  return destination.toUpperCase().slice(0, 3);
}

// Base prices per category per day (USD) — typical market rates
const BASE_PRICES: Record<string, Record<string, number>> = {
  economy: { low: 35, mid: 50, high: 70 },
  compact: { low: 45, mid: 65, high: 90 },
  suv: { low: 75, mid: 110, high: 160 },
  luxury: { low: 150, mid: 220, high: 350 },
};

// Destination tier (affects pricing)
const HIGH_COST = ["LHR", "CDG", "NRT", "DXB", "MLE"];
const MID_COST  = ["BCN", "FCO", "AMS", "SYD", "SIN"];

function getPriceTier(iata: string): "low" | "mid" | "high" {
  if (HIGH_COST.includes(iata)) return "high";
  if (MID_COST.includes(iata)) return "mid";
  return "low";
}

// Deep link URL builders for each company
function hertzUrl(iata: string, ci: string, co: string) {
  return `https://www.hertz.com/rentacar/reservation/?from=${iata}&to=${iata}&d1=${ci}&d2=${co}`;
}
function avisUrl(iata: string, ci: string, co: string) {
  return `https://www.avis.com/en/reservation?from=${iata}&to=${iata}&d1=${ci}&d2=${co}`;
}
function enterpriseUrl(iata: string, ci: string, co: string) {
  return `https://www.enterprise.com/en/car-rental/deeplinkmap.do?bid=028&refId=ENOFF0469&from=${iata}&to=${iata}&d1=${ci}&d2=${co}`;
}
function budgetUrl(iata: string, ci: string, co: string) {
  return `https://www.budget.com/en/reservation/quick?from=${iata}&to=${iata}&d1=${ci}&d2=${co}`;
}
function sixtUrl(iata: string, ci: string, co: string) {
  return `https://www.sixt.com/car-rental/?pickup=${iata}&dropoff=${iata}&pickupdate=${ci}&dropoffdate=${co}`;
}
function europcarUrl(iata: string, ci: string, co: string) {
  return `https://www.europcar.com/EBE/action/quicksearch?pickupStation=${iata}&returnStation=${iata}&pickupDate=${ci}&returnDate=${co}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = schema.safeParse({
    destination: url.searchParams.get("destination") || "",
    checkIn: url.searchParams.get("checkIn") || "",
    checkOut: url.searchParams.get("checkOut") || "",
    guests: url.searchParams.get("guests") || "2",
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid params" }, { status: 400 });
  }

  const { destination, checkIn, checkOut } = parsed.data;
  const iata = getIata(destination);
  const tier = getPriceTier(iata);
  const nights = Math.max(1, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ));

  const offers = [
    {
      id: "hertz-economy",
      name: "Economy Car",
      category: "Economy",
      provider: "Hertz",
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
      ac: true,
      seats: 4,
      transmission: "Automatic",
      perDay: Math.round(BASE_PRICES.economy[tier] * (1 + Math.random() * 0.1)),
      priceText: "",
      features: ["A/C", "GPS available", "Free cancellation"],
    },
    {
      id: "avis-compact",
      name: "Compact SUV",
      category: "Compact",
      provider: "Avis",
      imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
      ac: true,
      seats: 5,
      transmission: "Automatic",
      perDay: Math.round(BASE_PRICES.compact[tier] * (1 + Math.random() * 0.1)),
      priceText: "",
      features: ["A/C", "Bluetooth", "Unlimited mileage"],
    },
    {
      id: "enterprise-suv",
      name: "Full Size SUV",
      category: "SUV",
      provider: "Enterprise",
      imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
      ac: true,
      seats: 7,
      transmission: "Automatic",
      perDay: Math.round(BASE_PRICES.suv[tier] * (1 + Math.random() * 0.1)),
      priceText: "",
      features: ["7 seats", "Large trunk", "Child seat available"],
    },
    {
      id: "budget-economy",
      name: "Economy Compact",
      category: "Economy",
      provider: "Budget",
      imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
      ac: true,
      seats: 4,
      transmission: "Manual",
      perDay: Math.round(BASE_PRICES.economy[tier] * 0.88 * (1 + Math.random() * 0.05)),
      priceText: "",
      features: ["A/C", "Budget-friendly", "Easy return"],
    },
    {
      id: "sixt-luxury",
      name: "Premium / Luxury",
      category: "Luxury",
      provider: "Sixt",
      imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      ac: true,
      seats: 5,
      transmission: "Automatic",
      perDay: Math.round(BASE_PRICES.luxury[tier] * (1 + Math.random() * 0.15)),
      priceText: "",
      features: ["Premium brand", "Full insurance", "Concierge pickup"],
    },
  ].map(car => ({
    ...car,
    priceText: `$${car.perDay}/day`,
    totalPrice: car.perDay * nights,
    totalText: `$${car.perDay * nights} total`,
    nights,
    iata,
  })).sort((a, b) => a.totalPrice - b.totalPrice);

  return NextResponse.json({ ok: true, offers, iata, nights });
}
