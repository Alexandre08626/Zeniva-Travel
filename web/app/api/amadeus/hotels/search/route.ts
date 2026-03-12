import { NextResponse } from "next/server";
import { searchAmadeusHotels } from "@/services/amadeus/hotelService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const destination = url.searchParams.get("destination") || "";
  const checkIn = url.searchParams.get("checkIn") || "";
  const checkOut = url.searchParams.get("checkOut") || "";
  const guests = Number(url.searchParams.get("guests") || 2);
  const rooms = Number(url.searchParams.get("rooms") || 1);

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });
  }

  try {
    const { hotels } = await searchAmadeusHotels({ destination, checkIn, checkOut, guests, rooms });
    return NextResponse.json({ ok: true, hotels });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Amadeus hotel search failed", hotels: [] });
  }
}
