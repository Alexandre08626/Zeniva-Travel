import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VPS_SECRET = process.env.VPS_WEBHOOK_SECRET || "zeniva-secret-2025";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  // Use service role if available; fall back to anon key (RLS policies allow insert)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) throw new Error("Missing Supabase env");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function POST(req: NextRequest) {
  // Verify VPS secret
  const auth = req.headers.get("authorization") || "";
  if (auth.replace("Bearer ", "") !== VPS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { session_id, email, role, content, first_name, last_name } = body;

  const safeId = (v: string) =>
    v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const channelIds: string[] = ["hq"];
  if (email) {
    const safeEmail = safeId(email);
    channelIds.push(`acct-${safeEmail}-trip-lina-chat`);
    channelIds.push(`contact-${safeEmail}`);
  } else if (session_id) {
    channelIds.push(`session-${safeId(session_id).slice(0, 40)}`);
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
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("agent_inbox_messages").insert({
      channel_ids: channelIds,
      message: content,
      author,
      sender_role: senderRole,
      source: "lina-chat",
      source_path: "/chat",
    });

    if (error) {
      console.error("[lina-message] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[lina-message] Error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
