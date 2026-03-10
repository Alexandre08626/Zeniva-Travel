import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

const VPS_SECRET = process.env.VPS_WEBHOOK_SECRET || "zeniva-secret-2025";

export async function POST(req: NextRequest) {
  // Verify VPS secret
  const auth = req.headers.get("authorization") || "";
  if (auth.replace("Bearer ", "") !== VPS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { session_id, email, role, content, first_name, last_name } = body;

  // Build channel IDs
  const safeId = (v: string) =>
    v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const channelIds: string[] = ["hq"];
  if (email) {
    const safeEmail = safeId(email);
    channelIds.push(`acct-${safeEmail}-trip-lina-chat`);
    channelIds.push(`contact-${safeEmail}`);
  } else if (session_id) {
    const safeSid = safeId(session_id).slice(0, 40);
    channelIds.push(`session-${safeSid}`);
  }

  const senderRole = role === "assistant" ? "lina" : "client";
  let author = "Lina AI";
  if (role !== "assistant") {
    if (first_name || last_name) {
      author = `${first_name || ""} ${last_name || ""}`.trim();
    } else if (email) {
      author = email;
    } else {
      author = `Visitor (${(session_id || "").slice(0, 8)})`;
    }
  }

  try {
    const { client } = getSupabaseAdminClient();
    const { error } = await client.from("agent_inbox_messages").insert({
      channel_ids: channelIds,
      message: content,
      author,
      sender_role: senderRole,
      source: "lina-chat",
      source_path: "/chat",
      property_name: null,
    });

    if (error) {
      console.error("[lina-message] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, channels: channelIds });
  } catch (e) {
    console.error("[lina-message] Exception:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
