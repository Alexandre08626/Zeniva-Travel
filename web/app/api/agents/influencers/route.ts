import { NextRequest, NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    assertBackendEnv();
    // Auth: require agent session (same pattern as agents-proxy)
    const sessionCookie = request.cookies.get("zeniva_session")?.value || "";
    const rolesCookie = request.cookies.get("zeniva_roles")?.value || "";
    const hasSession = sessionCookie.length > 10 && (rolesCookie.includes("hq") || rolesCookie.includes("admin"));
    if (!hasSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await dbQuery(
      `SELECT id, name, email, role, roles, status, created_at
       FROM accounts
       WHERE roles::text LIKE '%influencer%'
       ORDER BY created_at DESC`,
      []
    );

    const agents = rows.map((row: any) => ({
      id: row.id,
      name: row.name || "Influencer",
      email: row.email,
      agent_type: "influencer",
      status: row.status || "active",
      leads_count: 0,
      commission_rate: 5,
      ref_code: "",
      created_at: row.created_at,
    }));

    return NextResponse.json({ agents });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
