/**
 * /api/agent/inbox
 * HQ sees all messages. Regular agents see all messages (so they can see client chats).
 * Non-HQ agents see messages from their own client channels + hq channel.
 * Auth: x-user-email header or zeniva_email cookie → direct Supabase DB check.
 * No JWT required — uses service role to bypass RLS.
 */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

const HQ_ROLES = ["hq", "admin", "super_admin"];
const AGENT_ROLES = ["travel_agent", "yacht_broker", "influencer", "hq", "admin", "super_admin"];

function getEmailFromRequest(request: Request): string {
  const emailHeader = request.headers.get("x-user-email") || "";
  if (emailHeader) return emailHeader.toLowerCase().trim();
  const raw = request.headers.get("cookie") || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith("zeniva_email="));
  if (!match) return "";
  try { return decodeURIComponent(match.split("=").slice(1).join("=")); } catch { return ""; }
}

function emailToChannelSlug(email: string): string {
  const local = email.split("@")[0] || "";
  return local.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function getAccountInfo(email: string): Promise<{ role: string } | null> {
  if (!email) return null;
  const { client } = getSupabaseAdminClient();
  const { data } = await client
    .from("accounts")
    .select("role")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  return data || null;
}

export async function GET(request: Request) {
  try {
    const email = getEmailFromRequest(request);
    const account = await getAccountInfo(email);

    if (!account || !AGENT_ROLES.includes(account.role)) {
      return NextResponse.json({ error: "Unauthorized", email }, { status: 401 });
    }

    const { client } = getSupabaseAdminClient();
    const isHq = HQ_ROLES.includes(account.role);
    const url = new URL(request.url);
    const channelParam = url.searchParams.get("channel");
    const limitParam = parseInt(url.searchParams.get("limit") || "500");

    if (isHq) {
      // HQ sees ALL messages
      let query = client
        .from("agent_inbox_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(limitParam);

      // Optional channel filter for HQ
      if (channelParam && channelParam !== "all") {
        query = client
          .from("agent_inbox_messages")
          .select("*")
          .filter("channel_ids", "cs", JSON.stringify([channelParam]))
          .order("created_at", { ascending: true })
          .limit(limitParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ data: data || [] });
    } else {
      // Non-HQ agent: sees ALL messages (they manage their own client conversations)
      // The front-end filters by channel - agent can see all client conversations
      // This allows agents to reply to any client that contacts them
      const { data, error } = await client
        .from("agent_inbox_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(limitParam);
      if (error) throw error;

      // Filter out HQ-only channels if needed (keep all client + agent channels)
      const slug = emailToChannelSlug(email);
      const agentChannel = `agent-alexandre-${slug}`;

      return NextResponse.json({ data: data || [], agentChannel });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
