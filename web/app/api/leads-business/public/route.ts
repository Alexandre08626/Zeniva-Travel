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
  const isOnboarding = body.source === "agency_onboarding";
  const plan = body.plan || "standard";
  const setupBase = plan === "premium" ? 9999 : 1999;
  const estimatedSetupValue = setupBase + numberOfAgents * 399;

  const record: Record<string, unknown> = {
    type: "travel_agency",
    source: body.source || "website",
    status: "new",
    priority: isOnboarding ? "high" : "medium",
    contact_name,
    contact_email: body.contact_email || null,
    contact_phone: body.contact_phone || null,
    company_name: body.company_name || null,
    website: body.website || null,
    number_of_agents: numberOfAgents,
    estimated_setup_value: estimatedSetupValue,
    notes: body.notes || body.message || null,
  };

  // Fill in extra fields from onboarding data if available
  if (isOnboarding && body.form_data) {
    try {
      const fd = typeof body.form_data === "string" ? JSON.parse(body.form_data) : body.form_data;
      record.current_suppliers = fd.suppliers || null;
      record.city = fd.address || null;
      // Store full questionnaire JSON in notes
      record.notes = JSON.stringify(fd);
    } catch {
      // Keep notes as-is if parsing fails
    }
  }

  const { client } = getSupabaseAdminClient();
  const { data, error } = await client.from("leads_business").insert(record).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: data?.id });
}
