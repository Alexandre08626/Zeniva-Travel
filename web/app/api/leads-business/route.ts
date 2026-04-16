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
  const city = url.searchParams.get("city");
  const province = url.searchParams.get("province");

  let query = client.from("leads_business").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (source) query = query.eq("source", source);
  if (city) query = query.ilike("city", `%${city}%`);
  if (province) query = query.ilike("province", `%${province}%`);

  // Supabase caps at 1000 per request — paginate to get all
  const allLeads: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let totalCount = 0;

  while (true) {
    const { data: batch, error, count } = await query.range(from, from + batchSize - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (count !== null) totalCount = count;
    if (!batch || batch.length === 0) break;
    allLeads.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  return NextResponse.json({ ok: true, leads: allLeads, total: totalCount });
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
