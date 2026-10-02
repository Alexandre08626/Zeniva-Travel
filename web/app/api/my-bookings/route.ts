import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionCookieName, verifySession } from "../../../src/lib/server/auth";
import { sendPushToHQ } from "../../../src/lib/server/pushNotify";
import { isInternalRequest } from "@/lib/internal-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rvlcgtlcjylozbihtpkr.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

function getEmailFromRequest(req: NextRequest): string | null {
  try {
    const cookieName = getSessionCookieName();
    const token = req.cookies.get(cookieName)?.value || "";
    if (!token) return null;
    const payload = verifySession(token);
    return payload?.email || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = getEmailFromRequest(req);
    if (!email) return NextResponse.json({ bookings: [] });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_email", email)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ bookings: [], error: error.message });
    return NextResponse.json({ bookings: data || [] });
  } catch (e: any) {
    return NextResponse.json({ bookings: [], error: e?.message });
  }
}

// Création d'une réservation « payée » : seulement par un appel interne (webhook ZeniPay signé).
// Avant, /payment/confirmation l'appelait à chaque visite, sans aucune preuve de paiement.
export async function POST(req: NextRequest) {
  if (!isInternalRequest(req)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  try {
    const email = getEmailFromRequest(req);
    const body = await req.json();

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        client_email:   body.clientEmail || email || "",
        client_name:    body.clientName  || "",
        destination:    body.destination || "",
        departure_date: body.departure   || null,
        return_date:    body.returnDate  || null,
        travelers:      body.travelers   || 1,
        total_price:    body.totalPrice  || 0,
        status:         "confirmed",
        payment_status: "paid",
        paid_amount:    body.totalPrice  || 0,
        notes:          body.notes       || "",
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    // Alerte HQ (déplacée ici depuis le navigateur). À confirmer dans ZeniPay : la page de retour n'est pas une preuve de paiement.
    await sendPushToHQ({
      title: "Réservation payée (ZeniPay)",
      body: `${body.clientName || body.clientEmail || "Client"} — ${body.destination || ""} · $${Number(body.totalPrice || 0).toLocaleString()}`,
      url: "/agent/bookings",
      tag: "booking-confirmed",
    });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
