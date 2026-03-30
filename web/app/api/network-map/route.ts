import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { client } = getSupabaseAdminClient();
  const pins: any[] = [];

  // 1. Agencies
  const { data: agencies } = await client.from("agencies").select("id, name, contact_email, config, is_active, created_at").eq("is_active", true);
  for (const a of agencies || []) {
    pins.push({ id: a.id, name: a.name, type: "agency", city: (a.config as any)?.city || "", extra: a.contact_email || "", created_at: a.created_at });
  }

  // 2. Agents
  const { data: profiles } = await client.from("profiles").select("id, full_name, agency_name, country, created_at").not("agency_name", "is", null);
  for (const p of profiles || []) {
    pins.push({ id: p.id, name: p.full_name || p.agency_name || "Agent", type: "agent", city: p.country || "", extra: p.agency_name || "", created_at: p.created_at });
  }

  // 3. Traveler leads with destination
  const { data: travelers } = await client.from("leads").select("id, first_name, last_name, email, destination, status, source, created_at").not("destination", "is", null).neq("destination", "").limit(200);
  for (const t of travelers || []) {
    const name = `${t.first_name || ""} ${t.last_name || ""}`.trim() || t.email?.split("@")[0] || "Traveler";
    pins.push({ id: t.id, name, type: "traveler", city: t.destination || "", extra: `${t.source || ""} - ${t.status || ""}`, created_at: t.created_at });
  }

  // 4. Business leads (all, not just signed)
  const { data: biz } = await client.from("leads_business").select("id, contact_name, company_name, city, status, type, created_at");
  for (const b of biz || []) {
    pins.push({ id: b.id, name: b.company_name || b.contact_name, type: "lead", city: b.city || "", extra: `${b.type} - ${b.status}`, created_at: b.created_at });
  }

  return NextResponse.json({ ok: true, pins, counts: { agencies: agencies?.length || 0, agents: profiles?.length || 0, travelers: travelers?.length || 0, leads: biz?.length || 0, total: pins.length } });
}
