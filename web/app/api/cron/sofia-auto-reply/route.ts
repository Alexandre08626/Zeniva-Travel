import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sofiaAutoReplyAlexandre } from "../../../../src/lib/server/sofia-emails";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check for unprocessed contact messages that need auto-reply
    const { client } = getSupabaseAdminClient();
    const { data: pending } = await client
      .from("agent_inbox_messages")
      .select("id, message, source, created_at")
      .in("source", ["contact-form", "email-inbound"])
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5);

    let replied = 0;
    for (const msg of pending || []) {
      // Extract email from message
      const emailMatch = (msg.message || "").match(/[\w.-]+@[\w.-]+\.\w+/);
      if (!emailMatch) continue;

      const email = emailMatch[0].toLowerCase();
      // Don't auto-reply to internal emails
      if (email.includes("zeniva") || email.includes("zenivatravel")) continue;

      try {
        await sofiaAutoReplyAlexandre(email, "Your inquiry to Zeniva Travel");
        // Mark as processed
        await client.from("agent_inbox_messages").update({ status: "auto_replied" }).eq("id", msg.id);
        replied++;
      } catch (err) {
        console.error("Sofia auto-reply failed for", email, err);
      }
    }

    return NextResponse.json({ ok: true, replied });
  } catch (err: any) {
    console.error("Sofia auto-reply cron error:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
