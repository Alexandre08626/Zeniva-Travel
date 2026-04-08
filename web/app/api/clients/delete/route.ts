import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Auth: HQ/admin only
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = decodeURIComponent(req.cookies.get("zeniva_roles")?.value || "");
  if (sessionCookie.length < 10 || (!rolesCookie.includes("hq") && !rolesCookie.includes("admin"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { client } = getSupabaseAdminClient();

  // Delete from clients table
  await client.from("clients").delete().eq("email", email);

  // Block the account (if exists) so they can't log back in
  await client.from("accounts").update({ status: "blocked", updated_at: new Date().toISOString() }).eq("email", email);

  // Delete from Supabase auth
  try {
    const { data: authUsers } = await (client.auth.admin as any).listUsers({ perPage: 1000 });
    const match = (authUsers?.users || []).find((u: any) => String(u?.email || "").toLowerCase() === email.toLowerCase());
    if (match?.id) {
      await (client.auth.admin as any).deleteUser(match.id);
    }
  } catch { /* ignore */ }

  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
