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
    let query = client
      .from("leads")
      .select("id, email, first_name, last_name, status, source, language, created_at, phone", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: rows, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows || [];
    total = count || 0;
  } else if (audience === "agents") {
    let query = client
      .from("agents")
      .select("id, email, first_name, last_name, phone, agent_type, status", { count: "exact" })
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
