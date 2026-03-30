import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const contact_name = (body.contact_name || "").trim();
  if (!contact_name) {
    return NextResponse.json({ error: "contact_name is required" }, { status: 400 });
  }

  const numberOfAgents = parseInt(body.number_of_agents, 10) || 1;
  const estimatedSetupValue = 1999 + numberOfAgents * 399;

  const record = {
    type: "travel_agency" as const,
    source: "website",
    status: "new" as const,
    priority: "medium" as const,
    contact_name,
    contact_email: body.contact_email || null,
    contact_phone: body.contact_phone || null,
    company_name: body.company_name || null,
    website: body.website || null,
    number_of_agents: numberOfAgents,
    notes: body.message || null,
    estimated_setup_value: estimatedSetupValue,
  };

  const { client } = getSupabaseAdminClient();
  const { error } = await client.from("leads_business").insert(record);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
