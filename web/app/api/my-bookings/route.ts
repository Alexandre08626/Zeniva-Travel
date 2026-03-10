import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionCookieName, verifySession } from "../../../src/lib/server/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export async function POST(req: NextRequest) {
  try {
    const email = getEmailFromRequest(req);
    const body = await req.json();

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
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
