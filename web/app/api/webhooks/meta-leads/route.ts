import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Meta (Facebook/Instagram) Lead Ads webhook endpoint.
 *
 * SETUP:
 * 1. Vercel env vars required:
 *    - META_VERIFY_TOKEN         (any random string, e.g. "zeniva-meta-verify-2026")
 *    - META_PAGE_ACCESS_TOKEN    (from Meta Business: Business Settings → System Users → generate long-lived token with pages_manage_metadata + leads_retrieval + pages_read_engagement)
 * 2. In Meta Business: App Dashboard → Webhooks → Page → Subscribe
 *    - Callback URL: https://www.zenivatravel.com/api/webhooks/meta-leads
 *    - Verify Token: value of META_VERIFY_TOKEN
 *    - Subscribe to field: "leadgen"
 * 3. Connect Page to App + subscribe Page to leadgen via Graph API.
 * 4. Create a Lead Ad in Ads Manager → form with email + phone fields.
 *
 * FLOW:
 *   GET  (verification) → returns hub.challenge so Meta confirms the endpoint
 *   POST (lead event)   → receives {entry:[{changes:[{value:{leadgen_id,form_id,page_id}}]}]}
 *                         → fetch full lead via Graph API
 *                         → insert into Supabase leads table with source="meta:lead_ad"
 */

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "";
const PAGE_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || "";

type MetaFieldData = { name: string; values: string[] };

type MetaLead = {
  id: string;
  created_time: string;
  field_data: MetaFieldData[];
  ad_id?: string;
  form_id?: string;
  campaign_id?: string;
};

function pickField(data: MetaFieldData[], ...keys: string[]): string {
  for (const k of keys) {
    const f = data.find(d => d.name.toLowerCase().replace(/\s+/g, "_") === k);
    if (f?.values?.[0]) return f.values[0];
  }
  return "";
}

async function fetchLead(leadgenId: string): Promise<MetaLead | null> {
  if (!PAGE_TOKEN) return null;
  try {
    const url = `https://graph.facebook.com/v20.0/${leadgenId}?fields=id,created_time,field_data,ad_id,form_id,campaign_id&access_token=${PAGE_TOKEN}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      console.log(`[meta-leads] fetchLead fail: ${r.status}`);
      return null;
    }
    return await r.json();
  } catch (e: any) {
    console.log(`[meta-leads] fetchLead error: ${e?.message || e}`);
    return null;
  }
}

// GET: Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST: Meta leadgen event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const entries = body?.entry || [];

    const { client } = getSupabaseAdminClient();
    let saved = 0;
    const leads: any[] = [];

    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        if (change?.field !== "leadgen") continue;
        const v = change?.value || {};
        const leadgenId: string = v.leadgen_id || "";
        if (!leadgenId) continue;

        const lead = await fetchLead(leadgenId);
        if (!lead || !Array.isArray(lead.field_data)) continue;

        const email = pickField(lead.field_data, "email", "email_address");
        const phone = pickField(lead.field_data, "phone_number", "phone");
        const firstName = pickField(lead.field_data, "first_name", "firstname") || "Lead";
        const lastName = pickField(lead.field_data, "last_name", "lastname") || "";
        const fullName = pickField(lead.field_data, "full_name", "name");
        const finalFirst = firstName !== "Lead" ? firstName : (fullName.split(" ")[0] || "Lead");
        const finalLast = lastName || (fullName.split(" ").slice(1).join(" ") || "");
        const destination = pickField(lead.field_data, "destination", "trip_destination", "where_would_you_like_to_go", "city");
        const budget = pickField(lead.field_data, "budget", "trip_budget", "what_is_your_budget");
        const language = pickField(lead.field_data, "language") || "en";

        if (!email) {
          console.log(`[meta-leads] no email for leadgen_id=${leadgenId}`);
          continue;
        }

        const dealValue = Number(String(budget).replace(/[^\d]/g, "")) || 0;

        try {
          const { error } = await client.from("leads").insert({
            email: email.toLowerCase().trim(),
            first_name: finalFirst,
            last_name: finalLast,
            phone: phone || null,
            destination: destination || null,
            deal_value: dealValue,
            language: language.toLowerCase().slice(0, 2),
            status: "new",
            source: "meta:lead_ad",
            source_ref: `https://business.facebook.com/leads_center/?leadgen_id=${leadgenId}`,
            created_at: lead.created_time || new Date().toISOString(),
          });
          if (!error) {
            saved++;
            leads.push({ email, phone, firstName: finalFirst, destination, budget });
          } else {
            console.log(`[meta-leads] insert error:`, error.message);
          }
        } catch (e: any) {
          console.log(`[meta-leads] insert throw:`, e?.message || e);
        }
      }
    }

    return NextResponse.json({ ok: true, saved, leads });
  } catch (err: any) {
    console.log(`[meta-leads] fatal:`, err?.message);
    return NextResponse.json({ error: err?.message || "Meta webhook failed" }, { status: 500 });
  }
}
