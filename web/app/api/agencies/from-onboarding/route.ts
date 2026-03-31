import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lead_id } = await req.json();
  if (!lead_id) return NextResponse.json({ error: "lead_id is required" }, { status: 400 });

  const { client } = getSupabaseAdminClient();

  // 1. Get the onboarding lead
  const { data: lead, error: leadErr } = await client
    .from("leads_business")
    .select("*")
    .eq("id", lead_id)
    .single();

  if (leadErr || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // 2. Parse onboarding data
  let formData: Record<string, unknown> = {};
  try {
    formData = typeof lead.notes === "string" ? JSON.parse(lead.notes) : (lead.notes || {});
  } catch {
    formData = {};
  }

  const companyName = (formData.legalName as string) || (formData.tradeName as string) || lead.company_name || "New Agency";
  const slug = slugify((formData.tradeName as string) || companyName);

  // 3. Check if agency with this slug already exists
  const { data: existing } = await client
    .from("agencies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    // Update lead status and link to existing agency
    await client.from("leads_business").update({ status: "signed", updated_at: new Date().toISOString() }).eq("id", lead_id);
    return NextResponse.json({ ok: true, agency_id: existing.id, already_exists: true });
  }

  // 4. Create the agency
  const agencyRecord = {
    name: companyName,
    slug,
    domain: (formData.website as string)?.replace(/^https?:\/\//, "").replace(/\/$/, "") || null,
    contact_email: lead.contact_email || (formData.primaryEmail as string) || null,
    contact_phone: lead.contact_phone || (formData.primaryPhone as string) || null,
    primary_color: (formData.primaryColor as string) || null,
    secondary_color: (formData.secondaryColor as string) || null,
    is_active: false, // starts as inactive until setup is complete
    setup_fee_paid: false,
    config: {
      plan: (formData.selectedPlan as string) || "standard",
      onboarding: formData,
      number_of_agents: lead.number_of_agents || parseInt(formData.totalAdvisors as string) || 1,
      estimated_setup_value: lead.estimated_setup_value,
      opc_permit: formData.opcPermit || null,
      year_established: formData.yearEstablished || null,
      address: formData.address || null,
      city: null,
      province: null,
      specialties: formData.specialties || [],
      suppliers: formData.suppliers || null,
      gds: formData.gds || [],
      languages: formData.languages || [],
      default_language: formData.defaultLanguage || null,
      brand_tone: formData.brandTone || [],
      slogan: formData.slogan || null,
      social_links: formData.socialLinks || null,
      lina_config: {
        welcome_message: formData.welcomeMessage || null,
        weekday_hours: formData.weekdayHours || null,
        weekend_hours: formData.weekendHours || null,
        restrictions: formData.linaRestrictions || null,
        promotions: formData.promotions || null,
        widget_placement: formData.widgetPlacement || [],
      },
      advisors: formData.advisorList || null,
      work_style: formData.workStyle || [],
      current_crm: formData.currentCRM || [],
      import_clients: formData.importClients || [],
      active_clients: formData.activeClients || null,
      accounting_system: formData.accountingSystem || null,
      payment_methods: formData.paymentMethods || [],
      // Premium app config
      app_name: formData.appName || null,
      dev_accounts: formData.devAccounts || [],
      app_icon: formData.appIcon || [],
      // Goals
      main_reason: formData.mainReason || null,
      challenges: formData.challenges || [],
      timeline: formData.timeline || [],
      additional_notes: formData.anythingElse || null,
      // Contacts
      tech_contact: { name: formData.techName, email: formData.techEmail },
      billing_contact: { name: formData.billingName, email: formData.billingEmail },
      website_platform: formData.websitePlatform || [],
      preferred_comm: formData.preferredComm || [],
      logo_option: formData.logoOption || [],
    },
  };

  const { data: agency, error: agencyErr } = await client
    .from("agencies")
    .insert(agencyRecord)
    .select()
    .single();

  if (agencyErr) {
    return NextResponse.json({ error: agencyErr.message }, { status: 500 });
  }

  // 5. Update lead status to "signed"
  await client.from("leads_business").update({
    status: "signed",
    updated_at: new Date().toISOString(),
  }).eq("id", lead_id);

  return NextResponse.json({ ok: true, agency_id: agency.id, agency });
}
