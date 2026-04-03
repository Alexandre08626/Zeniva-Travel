import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
import { sendEmail } from "@/src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DELAY_BETWEEN_SENDS_MS = 2000;

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
  }
  result = result.replace(/\{\{[A-Z_]+\}\}/g, "");
  return result;
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaignId } = await req.json();
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const { client } = getSupabaseAdminClient();

  const { data: campaign, error: campError } = await client
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const { data: recipients, error: recError } = await client
    .from("email_campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  if (recError) return NextResponse.json({ error: recError.message }, { status: 500 });
  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ error: "No pending recipients" }, { status: 400 });
  }

  await client.from("email_campaigns").update({ status: "sending" }).eq("id", campaignId);

  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    const vars = (recipient.variables || {}) as Record<string, string>;
    const personalizedHtml = replaceVariables(campaign.html_body, vars);
    const personalizedSubject = replaceVariables(campaign.subject, vars);

    try {
      await sendEmail({
        from: campaign.from_email || undefined,
        fromName: campaign.from_name || "Zeniva Travel",
        to: recipient.email,
        subject: personalizedSubject,
        html: personalizedHtml,
      });

      await client
        .from("email_campaign_recipients")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", recipient.id);

      sentCount++;

      await client.from("comms_log").insert({
        type: "email",
        recipient: recipient.email,
        subject: personalizedSubject,
        lead_id: recipient.source_id || null,
        status: "sent",
      });

      if (recipient.source_table === "leads_business" && recipient.source_id) {
        await client
          .from("leads_business")
          .update({ last_contacted_at: new Date().toISOString(), status: "contacted" })
          .eq("id", recipient.source_id)
          .eq("status", "new");
      } else if (recipient.source_table === "leads" && recipient.source_id) {
        await client
          .from("leads")
          .update({ status: "contacted" })
          .eq("id", recipient.source_id)
          .eq("status", "new");
      }
    } catch (err: any) {
      failedCount++;
      const errMsg = err?.message || "Unknown error";
      errors.push(`${recipient.email}: ${errMsg}`);

      await client
        .from("email_campaign_recipients")
        .update({ status: "failed", error_message: errMsg })
        .eq("id", recipient.id);

      await client.from("comms_log").insert({
        type: "email",
        recipient: recipient.email,
        subject: personalizedSubject,
        lead_id: recipient.source_id || null,
        status: "failed",
      });
    }

    // Throttle to avoid rate limits
    if (DELAY_BETWEEN_SENDS_MS > 0) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SENDS_MS));
    }
  }

  await client
    .from("email_campaigns")
    .update({
      sent_count: sentCount,
      failed_count: failedCount,
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  return NextResponse.json({ ok: true, sent: sentCount, failed: failedCount, errors });
}
