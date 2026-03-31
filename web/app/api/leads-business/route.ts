import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const source = url.searchParams.get("source");

  const { client } = getSupabaseAdminClient();
  let query = client.from("leads_business").select("*").order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, leads: data || [] });
}

export async function POST(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(t);
  if (!s?.email) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const body = await req.json();
  const { client } = getSupabaseAdminClient();

  const record = {
    type: body.type || "travel_agent",
    contact_name: body.contact_name,
    contact_email: body.contact_email || null,
    contact_phone: body.contact_phone || null,
    company_name: body.company_name || null,
    website: body.website || null,
    number_of_agents: body.number_of_agents || null,
    current_suppliers: body.current_suppliers || null,
    city: body.city || null,
    province: body.province || null,
    status: body.status || "new",
    source: body.source || null,
    priority: body.priority || "medium",
    estimated_setup_value: body.estimated_setup_value || null,
    estimated_monthly_value: body.estimated_monthly_value || null,
    notes: body.notes || null,
    last_contacted_at: body.last_contacted_at || null,
    next_followup_at: body.next_followup_at || null,
    created_by: s.email,
  };

  const { data, error } = await client.from("leads_business").insert(record).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, lead: data });
}
