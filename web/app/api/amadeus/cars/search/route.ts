import { logUsage } from "@/lib/usage-tracker";
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

  // No car-rental supplier is connected yet: never invent offers or prices.
  // The proposal page shows "an advisor will add it" when offers is empty.
  const iata = getIata(parsed.data.destination);
  logUsage({ service: "api_search", action: "amadeus_cars_search", metadata: { iata, available: false } });
  return NextResponse.json({ ok: false, offers: [], iata, error: "Car rental search not available yet" });
}
