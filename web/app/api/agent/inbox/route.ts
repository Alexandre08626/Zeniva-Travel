/**
 * /api/agent/inbox
 * 
 * PRIVACY RULES:
 * - HQ (info@zeniva.ca) → sees ALL messages from ALL clients ✅
 * - Non-HQ agents (Louis, Jason, Luca...) → ONLY see messages from clients
 *   where owner_email = their email OR assigned_agents contains their email
 * - No agent can see another agent's client conversations
 */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

const HQ_ROLES = ["hq", "admin", "super_admin"];
const HQ_EMAILS = ["info@zeniva.ca", "info@zenivatravel.com", "info@zeniva.com"];
const AGENT_ROLES = ["travel_agent", "yacht_broker", "influencer", "hq", "admin", "super_admin"];

function getEmailFromRequest(request: Request): string {
  const emailHeader = request.headers.get("x-user-email") || "";
  if (emailHeader) return emailHeader.toLowerCase().trim();
  const raw = request.headers.get("cookie") || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith("zeniva_email="));
  if (!match) return "";
  try { return decodeURIComponent(match.split("=").slice(1).join("=")); } catch { return ""; }
}

function emailToSafeSlug(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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

/** Get all client emails that belong to this agent */
async function getAgentClientEmails(agentEmail: string): Promise<string[]> {
  const { client } = getSupabaseAdminClient();
  const { data } = await client
    .from("clients")
    .select("email, owner_email, assigned_agents");

  if (!data) return [];

  const agentLower = agentEmail.toLowerCase();
  const myClients = data.filter((row: any) => {
    const owner = (row.owner_email || "").toLowerCase();
    if (owner === agentLower) return true;

    // Check assigned_agents
    let assigned: string[] = [];
    if (Array.isArray(row.assigned_agents)) {
      assigned = row.assigned_agents;
    } else if (typeof row.assigned_agents === "string") {
      try { assigned = JSON.parse(row.assigned_agents); } catch { assigned = []; }
    }
    return assigned.some((a: string) => a.toLowerCase() === agentLower);
  });

  return myClients.map((c: any) => (c.email || "").toLowerCase()).filter(Boolean);
}

export async function GET(request: Request) {
  try {
    const email = getEmailFromRequest(request);
    const account = await getAccountInfo(email);

    if (!account || !AGENT_ROLES.includes(account.role)) {
      return NextResponse.json({ error: "Unauthorized", email }, { status: 401 });
    }

    const { client } = getSupabaseAdminClient();
    const isHq = HQ_ROLES.includes(account.role) || HQ_EMAILS.includes(email.toLowerCase());
    const url = new URL(request.url);
    const channelParam = url.searchParams.get("channel");
    const limitParam = parseInt(url.searchParams.get("limit") || "500");

    if (isHq) {
      // ✅ HQ sees ALL messages
      let query = client
        .from("agent_inbox_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(limitParam);

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
      // Exclude forwarded email notifications (they clutter the inbox)
      const filtered = (data || []).filter((msg: any) =>
        !String(msg.message || "").match(/^Email from .+:/i)
      );
      return NextResponse.json({ data: filtered });

    } else {
      // 🔒 Non-HQ agent: ONLY their own clients' messages
      const myClientEmails = await getAgentClientEmails(email);

      if (myClientEmails.length === 0) {
        // Agent has no clients assigned → return empty
        return NextResponse.json({ data: [] });
      }

      // Build allowed channel prefixes: acct-{safe-email} for each client
      const allowedPrefixes = myClientEmails.map(e => `acct-${emailToSafeSlug(e)}`);
      // Also include their own agent channel
      const agentSlug = `agent-alexandre-${emailToSafeSlug(email.split("@")[0])}`;
      allowedPrefixes.push(agentSlug);
      // Also include contact- channels for their clients
      myClientEmails.forEach(e => allowedPrefixes.push(`contact-${emailToSafeSlug(e)}`));

      // Fetch all messages then filter by allowed channels
      const { data, error } = await client
        .from("agent_inbox_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1000); // fetch more, then filter

      if (error) throw error;

      // Filter: message must have at least one channel matching allowed prefixes
      const filtered = (data || []).filter((msg: any) => {
        const channels: string[] = Array.isArray(msg.channel_ids) ? msg.channel_ids : [];
        return channels.some(ch =>
          allowedPrefixes.some(prefix => ch.startsWith(prefix))
        );
      });

      if (channelParam && channelParam !== "all") {
        const channelFiltered = filtered.filter((msg: any) =>
          Array.isArray(msg.channel_ids) && msg.channel_ids.includes(channelParam)
        );
        return NextResponse.json({ data: channelFiltered });
      }

      // Exclude forwarded email notifications
      const emailFiltered = filtered.filter((msg: any) =>
        !String(msg.message || "").match(/^Email from .+:/i)
      );
      return NextResponse.json({ data: emailFiltered });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
