import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { client } = getSupabaseAdminClient();
  const pins: any[] = [];

  // 1. Agencies - full details
  const { data: agencies } = await client.from("agencies").select("*");
  for (const a of agencies || []) {
    const cfg = (a.config || {}) as any;
    pins.push({
      id: a.id, name: a.name, type: "agency",
      city: cfg?.city || a.domain || "",
      email: a.contact_email, phone: a.contact_phone,
      website: a.domain, status: a.is_active ? "active" : "inactive",
      agents_count: cfg?.suppliers?.length || 0,
      setup_paid: a.setup_fee_paid,
      created_at: a.created_at,
    });
  }

  // 2. Agents - full profiles
  const { data: profiles } = await client.from("profiles").select("*").not("agency_name", "is", null);
  for (const p of profiles || []) {
    pins.push({
      id: p.id, name: p.full_name || p.agency_name || "Agent", type: "agent",
      city: p.country || "", email: p.account_email, phone: p.phone,
      agency: p.agency_name, specialties: p.specialties,
      languages: p.languages_spoken, website: p.website,
      created_at: p.created_at,
    });
  }

  // 3. Traveler leads - full info
  const { data: travelers } = await client.from("leads").select("*").not("destination", "is", null).neq("destination", "").order("created_at", { ascending: false }).limit(200);
  for (const t of travelers || []) {
    const name = `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Traveler";
    pins.push({
      id: t.id, name, type: "traveler",
      city: t.destination || "", email: t.email, phone: t.phone,
      destination: t.destination, status: t.status, source: t.source,
      language: t.language, deal_value: t.deal_value,
      created_at: t.created_at,
    });
  }

  // 4. Business leads - full info
  const { data: biz } = await client.from("leads_business").select("*").order("priority", { ascending: false });
  for (const b of biz || []) {
    pins.push({
      id: b.id, name: b.company_name || b.contact_name, type: "lead",
      city: b.city || "", email: b.contact_email, phone: b.contact_phone,
      company: b.company_name, contact: b.contact_name,
      website: b.website, status: b.status, priority: b.priority,
      source: b.source, agents_count: b.number_of_agents,
      suppliers: b.current_suppliers, notes: b.notes,
      setup_value: b.estimated_setup_value, monthly_value: b.estimated_monthly_value,
      next_followup: b.next_followup_at, last_contacted: b.last_contacted_at,
      created_at: b.created_at,
    });
  }

  return NextResponse.json({
    ok: true, pins,
    counts: {
      agencies: agencies?.length || 0,
      agents: profiles?.length || 0,
      travelers: travelers?.length || 0,
      leads: biz?.length || 0,
      total: pins.length,
    },
  });
}
