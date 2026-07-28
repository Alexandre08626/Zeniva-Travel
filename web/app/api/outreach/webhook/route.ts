import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function updateMessageByRecipient(recipient: string, channel: string, status: string, metadata: Record<string, any> = {}) {
  const { data } = await supabase
    .from("outreach_messages")
    .select("id, lead_id")
    .eq("recipient", recipient)
    .eq("channel", channel)
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const msg = data[0];
    await supabase
      .from("outreach_messages")
      .update({ status, ...metadata, metadata: metadata })
      .eq("id", msg.id);

    if (msg.lead_id && (status === "replied" || status === "opened")) {
      await supabase
        .from("leads")
        .update({ outreach_response: status, outreach_status: status === "replied" ? "replied" : "opened" })
        .eq("id", msg.lead_id);
    }
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();

    if (body.EventType === "Bounce") {
      for (const bounce of body.Bounce?.bouncedRecipients || []) {
        await updateMessageByRecipient(bounce.EmailAddress, "email", "bounced");
      }
      return NextResponse.json({ ok: true });
    }

    if (body.EventType === "Open") {
      for (const open of body.Open?.recipients || []) {
        await updateMessageByRecipient(open.EmailAddress, "email", "opened", { opened_at: new Date().toISOString() });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.EventType === "Click") {
      for (const click of body.Click?.recipients || []) {
        await updateMessageByRecipient(click.EmailAddress, "email", "clicked", { clicked_at: new Date().toISOString(), url: click.URL });
      }
      return NextResponse.json({ ok: true });
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    const from = formData.get("From")?.toString() || "";
    const to = formData.get("To")?.toString() || "";
    const body = formData.get("Body")?.toString() || "";
    const messageSid = formData.get("MessageSid")?.toString() || "";
    const numMedia = parseInt(formData.get("NumMedia")?.toString() || "0");

    if (from && body) {
      const isWhatsApp = from.startsWith("whatsapp:");
      const channel = isWhatsApp ? "whatsapp" : "sms";
      const recipient = isWhatsApp ? from.replace("whatsapp:", "") : from;

      await updateMessageByRecipient(recipient, channel, "replied", {
        reply_body: body,
        reply_sid: messageSid,
        reply_media: numMedia > 0,
        replied_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
