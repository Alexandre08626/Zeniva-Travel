/**
 * /api/agent/inbox
 * Dedicated endpoint for the HQ agent inbox.
 * Auth: zeniva_email cookie verified directly against Supabase accounts table.
 * No JWT required — uses service role to bypass RLS.
 */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

const HQ_ROLES = ["hq", "admin", "super_admin"];

function getEmailFromRequest(request: Request): string {
  // 1. Header sent by React component (most reliable — no cookie timing issues)
  const emailHeader = request.headers.get("x-user-email") || "";
  if (emailHeader) return emailHeader.toLowerCase().trim();
  // 2. Cookie fallback
  const raw = request.headers.get("cookie") || "";
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith("zeniva_email="));
  if (!match) return "";
  try { return decodeURIComponent(match.split("=").slice(1).join("=")); } catch { return ""; }
}

async function verifyHqEmail(email: string): Promise<boolean> {
  if (!email) return false;
  const { client } = getSupabaseAdminClient();
  const { data } = await client.from("accounts").select("role").eq("email", email.toLowerCase().trim()).maybeSingle();
  return HQ_ROLES.includes(data?.role || "");
}

export async function GET(request: Request) {
  try {
    const email = getEmailFromRequest(request);
    const isHq = await verifyHqEmail(email);
    if (!isHq) {
      return NextResponse.json({ error: "Unauthorized", email }, { status: 401 });
    }

    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("agent_inbox_messages")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
