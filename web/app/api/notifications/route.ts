import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    if (!email) return NextResponse.json({ notifications: [] });
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("notifications").select("*")
      .eq("recipient_email", email.toLowerCase())
      .order("created_at", { ascending: false }).limit(limit);
    if (error) return NextResponse.json({ notifications: [], error: error.message });
    return NextResponse.json({ notifications: data || [] });
  } catch (e: any) {
    return NextResponse.json({ notifications: [], error: e?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipient_email, type, title, message, data } = body;
    if (!recipient_email) return NextResponse.json({ error: "Missing recipient_email" }, { status: 400 });
    const supabase = getSupabase();
    const { data: created, error } = await supabase.from("notifications")
      .insert({ recipient_email: recipient_email.toLowerCase(), type, title, message, data })
      .select("id").single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, email } = body;
    const supabase = getSupabase();
    let query = supabase.from("notifications").update({ read_at: new Date().toISOString() });
    if (ids?.length) { query = query.in("id", ids); }
    else if (email) { query = query.eq("recipient_email", email.toLowerCase()).is("read_at", null); }
    const { error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
