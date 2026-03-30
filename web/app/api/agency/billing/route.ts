import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(t);
  if (!s?.email) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  const { client } = getSupabaseAdminClient();
  const { data: p } = await client.from("profiles").select("agency_id").eq("account_email", s.email).single();
  if (!p?.agency_id) return NextResponse.json({ error: "No agency" }, { status: 403 });
  const { data: invoices } = await client.from("invoices").select("*").eq("agency_id", p.agency_id).order("created_at", { ascending: false }).limit(24);
  return NextResponse.json({ ok: true, invoices: invoices || [] });
}
