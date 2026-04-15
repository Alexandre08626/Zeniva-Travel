import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sofiaAutoReplyAlexandre, benAutoReplyZeniPay } from "../../../../src/lib/server/sofia-emails";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { client } = getSupabaseAdminClient();
    const { data: pending } = await client
      .from("agent_inbox_messages")
      .select("id, message, source, created_at")
      .in("source", ["contact-form", "email-inbound"])
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    let sofiaReplied = 0;
    let benReplied = 0;

    for (const msg of pending || []) {
      const emailMatch = (msg.message || "").match(/[\w.-]+@[\w.-]+\.\w+/);
      if (!emailMatch) continue;

      const email = emailMatch[0].toLowerCase();
      // Don't auto-reply to internal emails
      if (email.includes("zeniva") || email.includes("zenivatravel") || email.includes("zenipay")) continue;

      // Determine if this is a ZeniPay email or Zeniva Travel email
      const isZeniPay = (msg.message || "").toLowerCase().includes("zenipay") ||
                        (msg.source || "").toLowerCase().includes("zenipay");

      try {
        if (isZeniPay) {
          // Ben handles ZeniPay emails
          await benAutoReplyZeniPay(email, "Your inquiry to ZeniPay");
          benReplied++;
        } else {
          // Sofia handles Zeniva Travel emails
          await sofiaAutoReplyAlexandre(email, "Your inquiry to Zeniva Travel");
          sofiaReplied++;
        }
        await client.from("agent_inbox_messages").update({ status: "auto_replied" }).eq("id", msg.id);
      } catch (err) {
        console.error("Auto-reply failed for", email, err);
      }
    }

    return NextResponse.json({ ok: true, sofiaReplied, benReplied, total: sofiaReplied + benReplied });
  } catch (err: any) {
    console.error("Auto-reply cron error:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
