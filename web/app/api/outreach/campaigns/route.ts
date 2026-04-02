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

export async function GET() {
  const { client } = getSupabaseAdminClient();
  const { data, error } = await client
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, campaigns: data || [] });
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { client } = getSupabaseAdminClient();

  const record = {
    name: body.name,
    template_id: body.template_id || null,
    subject: body.subject,
    html_body: body.html_body,
    preview_text: body.preview_text || null,
    from_name: body.from_name || "Alexandre Blais",
    from_email: body.from_email || "info@zeniva.ca",
    audience_type: body.audience_type,
    audience_filters: body.audience_filters || {},
    status: body.status || "draft",
    scheduled_at: body.scheduled_at || null,
    recipient_count: body.recipients?.length || 0,
  };

  const { data, error } = await client
    .from("email_campaigns")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Failed to create campaign:", error.message, error.details, error.hint);
    return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 });
  }

  if (body.recipients && body.recipients.length > 0) {
    const recipients = body.recipients.map((r: any) => ({
      campaign_id: data.id,
      email: r.email,
      name: r.name || null,
      company_name: r.company_name || null,
      variables: r.variables || {},
      source_table: r.source_table || null,
      source_id: r.source_id || null,
      status: "pending",
    }));

    const { error: recError } = await client
      .from("email_campaign_recipients")
      .insert(recipients);

    if (recError) console.error("Failed to insert recipients:", recError.message);
  }

  return NextResponse.json({ ok: true, campaign: data });
}
