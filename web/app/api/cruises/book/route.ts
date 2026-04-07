import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VPS = "https://vmi3097009.contaboserver.net";
const VPS_AUTH = "Bearer zeniva-secret-2025";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rvlcgtlcjylozbihtpkr.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function supabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, phone,
      cruiseRef, cruiseName, operator,
      cabinType, cabinPrice, dateFrom, dateTo,
      duration, ship, region, guests,
      specialRequests,
    } = body;

    if (!email || !firstName || !cruiseRef) {
      return NextResponse.json({ error: "email, firstName and cruiseRef are required" }, { status: 400 });
    }

    const bookingRef = `ZV-CRZ-${Date.now().toString(36).toUpperCase()}`;
    const destination = cruiseName || region || "Cruise";

    // 1. Save lead to Supabase
    const db = supabase();
    const { data: existingLead } = await db.from("leads").select("id").eq("email", email).single();

    if (!existingLead) {
      await db.from("leads").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        destination,
        departure_date: dateFrom,
        return_date: dateTo,
        adults: guests || 2,
        trip_type: "cruise",
        status: "new",
        budget: cabinPrice ? `From $${cabinPrice} USD` : null,
        source: "cruise-search",
        notes: `Cruise booking inquiry\nRef: ${cruiseRef}\nShip: ${ship}\nCabin: ${cabinType}\nPrice: $${cabinPrice}/pp\nBooking ref: ${bookingRef}${specialRequests ? `\nRequests: ${specialRequests}` : ""}`,
      });
    } else {
      // Update existing lead notes
      await db.from("leads").update({
        status: "hot",
        notes: `[UPDATE] Cruise inquiry: ${cruiseName} / ${cabinType} / $${cabinPrice}pp\nRef: ${bookingRef}`,
      }).eq("id", existingLead.id);
    }

    // 2. Send email via VPS notify-lead
    try {
      await fetch(`${VPS}/notify-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: VPS_AUTH },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          destination: `🚢 ${cruiseName}`,
          tripType: `Cruise — ${operator} — ${cabinType}`,
          budget: cabinPrice ? `$${cabinPrice} USD/person` : "N/A",
          pax: guests || 2,
          departureDate: dateFrom,
          returnDate: dateTo,
          notes: `Ship: ${ship} | Cabin: ${cabinType} | Booking ref: ${bookingRef}${specialRequests ? ` | Requests: ${specialRequests}` : ""}`,
        }),
      });
    } catch (_) {
      // Email failure is non-blocking
    }

    return NextResponse.json({
      success: true,
      bookingRef,
      message: "Your cruise inquiry has been received. Lina will contact you within 2 hours.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
