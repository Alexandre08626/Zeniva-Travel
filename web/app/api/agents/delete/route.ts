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
  if (!s?.email) return null;
  // Only HQ/admin can delete agents
  const roles = s.roles || [];
  if (!roles.includes("hq") && !roles.includes("admin")) return null;
  return s;
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, email } = await req.json();
  if (!agentId && !email) {
    return NextResponse.json({ error: "agentId or email required" }, { status: 400 });
  }

  const { client } = getSupabaseAdminClient();
  const errors: string[] = [];

  // Delete from agents table
  if (agentId && agentId !== "hq-zeniva") {
    const { error } = await client.from("agents").delete().eq("id", agentId);
    if (error) errors.push("agents: " + error.message);
  }

  // Delete from profiles table by email
  if (email) {
    const { error } = await client.from("profiles").delete().eq("account_email", email);
    if (error) errors.push("profiles: " + error.message);
  }

  // Also remove any agent-specific data
  // Unassign leads that were assigned to this agent
  if (agentId && agentId !== "hq-zeniva") {
    await client.from("leads").update({ agent_id: null }).eq("agent_id", agentId);
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: { agentId, email } });
}
