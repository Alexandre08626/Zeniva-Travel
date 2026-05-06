import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Emails that must never be deletable as an "agent" — these belong to
// the founder / HQ accounts and blocking them locks the operator out.
const PROTECTED_EMAILS = new Set([
  "info@zeniva.ca",
  "info@zenivatravel.com",
  "info@zeniva.com",
  "zenipay@zeniva.ca",
]);
const PROTECTED_AGENT_IDS = new Set(["hq-zeniva"]);

export async function POST(req: NextRequest) {
  // Auth: HQ or admin only (cookie-based, same as agents-proxy)
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = decodeURIComponent(req.cookies.get("zeniva_roles")?.value || "");
  if (sessionCookie.length < 10 || (!rolesCookie.includes("hq") && !rolesCookie.includes("admin"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId, email } = await req.json();
  if (!agentId && !email) {
    return NextResponse.json({ error: "agentId or email required" }, { status: 400 });
  }

  const lcEmail = email ? String(email).toLowerCase() : "";
  if (
    (lcEmail && PROTECTED_EMAILS.has(lcEmail)) ||
    (agentId && PROTECTED_AGENT_IDS.has(String(agentId)))
  ) {
    return NextResponse.json(
      { error: "This account is a protected HQ account and cannot be deleted." },
      { status: 403 },
    );
  }

  const { client } = getSupabaseAdminClient();
  const results: string[] = [];

  // 1. Block the account (set status to 'blocked')
  if (email) {
    const { error } = await client
      .from("accounts")
      .update({ status: "blocked", updated_at: new Date().toISOString() })
      .eq("email", email);
    results.push(error ? `accounts_block: ${error.message}` : "accounts_blocked");
  }

  // 2. Delete from agents table (if exists)
  if (agentId && agentId !== "hq-zeniva") {
    const { error } = await client.from("agents").delete().eq("id", agentId);
    if (error && !error.message.includes("does not exist")) {
      results.push(`agents_delete: ${error.message}`);
    } else {
      results.push("agents_deleted");
    }
  }

  // 3. Delete from profiles table
  if (email) {
    await client.from("profiles").delete().eq("account_email", email).catch(() => {});
    results.push("profiles_cleaned");
  }

  // 4. Delete from Supabase auth (prevents re-signup)
  if (email) {
    try {
      const { data: authUsers } = await (client.auth.admin as any).listUsers({ perPage: 1000 });
      const match = (authUsers?.users || []).find((u: any) => String(u?.email || "").toLowerCase() === email.toLowerCase());
      if (match?.id) {
        await (client.auth.admin as any).deleteUser(match.id);
        results.push("auth_deleted");
      } else {
        results.push("auth_not_found");
      }
    } catch (err: any) {
      results.push(`auth_error: ${err?.message}`);
    }
  }

  // 5. Clean up agent_requests
  if (email) {
    await client.from("agent_requests").delete().eq("email", email).catch(() => {});
  }

  // 6. Unassign leads
  if (agentId && agentId !== "hq-zeniva") {
    await client.from("leads").update({ agent_id: null }).eq("agent_id", agentId).catch(() => {});
  }

  return NextResponse.json({ ok: true, deleted: { agentId, email }, results });
}
