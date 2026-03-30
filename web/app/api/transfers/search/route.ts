import { logUsage } from "@/lib/usage-tracker";
import { NextRequest, NextResponse } from "next/server";

const VPS = "http://217.216.88.202:8000";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "";
  const passengers = req.nextUrl.searchParams.get("passengers") || "2";
  if (!city) return NextResponse.json({ error: "Missing city" }, { status: 400 });
  try {
    const res = await fetch(`${VPS}/experiences/search?city=${encodeURIComponent(city)}&type=transfers&passengers=${passengers}`, { cache: "no-store" });
    const data = await res.json();
    // Remap to transfers format
    const transfers = (data.items || []).map((item: any, i: number) => ({
      id: item.id || String(i),
      title: item.title,
      city: item.city,
      country: item.country || "US",
      type: item.type || "private",
      photo: item.photo,
      priceFrom: item.priceFrom,
      capacity: item.capacity || "1-8 passengers",
      duration: item.duration || "Varies",
      freeCancellation: true,
      highlights: item.highlights || ["Meet & greet", "Flight monitoring", "Door-to-door"],
      productSlug: item.productSlug,
    }));
    logUsage({ service: "api_search", action: "transfers_search", metadata: { city } });
    return NextResponse.json({ transfers, total: transfers.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "VPS error" }, { status: 500 });
  }
}
