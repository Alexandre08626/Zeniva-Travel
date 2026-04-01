import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const audience = url.searchParams.get("audience") || "agencies";
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "25", 10);
  const offset = (page - 1) * limit;

  const { client } = getSupabaseAdminClient();

  let data: any[] = [];
  let total = 0;

  if (audience === "travelers") {
    // Travelers = leads + clients merged
    // First get leads
    let leadsQuery = client
      .from("leads")
      .select("id, email, first_name, last_name, status, source, language, created_at, phone", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") leadsQuery = leadsQuery.eq("status", status);
    if (search) {
      leadsQuery = leadsQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Also get clients
    let clientsQuery = client
      .from("clients")
      .select("id, email, name, phone, origin, lead_source, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      clientsQuery = clientsQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const [leadsResult, clientsResult] = await Promise.all([
      leadsQuery,
      status && status !== "all" && status !== "client" ? Promise.resolve({ data: [], count: 0, error: null }) : clientsQuery,
    ]);

    if (leadsResult.error) return NextResponse.json({ error: leadsResult.error.message }, { status: 500 });

    // Map clients to same shape as leads
    const mappedClients = (clientsResult.data || []).map((c: any) => {
      const nameParts = (c.name || "").split(" ");
      return {
        id: c.id,
        email: c.email || "",
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        status: "client",
        source: c.lead_source || c.origin || "client",
        language: "",
        created_at: c.created_at,
        phone: c.phone || "",
      };
    });

    // Filter clients by status if needed
    const filteredClients = (status === "client") ? mappedClients : (status && status !== "all") ? [] : mappedClients;

    // Merge and sort by date
    const allContacts = [...(leadsResult.data || []), ...filteredClients]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    total = allContacts.length;
    data = allContacts.slice(offset, offset + limit);
  } else if (audience === "agents") {
    // Agent leads — future agents (from leads table with source containing 'agent')
    // or from a dedicated agent_leads concept
    // For now, use leads that have agent-related sources
    let query = client
      .from("leads")
      .select("id, email, first_name, last_name, status, source, language, created_at, phone", { count: "exact" })
      .ilike("source", "%agent%")
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: rows, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows || [];
    total = count || 0;
  } else {
    let query = client
      .from("leads_business")
      .select("id, contact_email, contact_name, contact_phone, company_name, city, province, status, source, priority, last_contacted_at, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      query = query.or(`contact_name.ilike.%${search}%,contact_email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data: rows, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows || [];
    total = count || 0;
  }

  return NextResponse.json({ ok: true, contacts: data, total });
}
