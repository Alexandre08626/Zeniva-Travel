import { NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeEmail, dbQuery } from "../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../src/lib/server/auth";

function getSessionFromRequest(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(sessionToken);
}

function requireAdmin(session: ReturnType<typeof getSessionFromRequest>) {
  if (!session) return false;
  const roles = session.roles || [];
  return roles.includes("hq") || roles.includes("admin");
}

function makeCode(role: string) {
  const prefix = role === "hq" ? "Z-HQ" : role === "admin" ? "ZA" : role === "yacht-partner" ? "ZY" : "ZT";
  const seed = crypto.randomBytes(3).toString("hex");
  return `${prefix}-${seed.toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(String(body?.email || ""));
    const role = String(body?.role || "agent").trim();
    const note = String(body?.note || "").trim() || null;

    if (!email || !name) {
      return NextResponse.json({ ok: false, error: "Missing name or email" }, { status: 400 });
    }

    const existing = await dbQuery(
      "SELECT id, status, code FROM agent_requests WHERE lower(email) = $1 AND status IN ('pending','approved') ORDER BY requested_at DESC LIMIT 1",
      [email]
    );
    if (existing.rows.length) {
      return NextResponse.json({ ok: false, error: "Request already exists" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await dbQuery(
      "INSERT INTO agent_requests (id, name, email, role, status, note) VALUES ($1,$2,$3,$4,'pending',$5)",
      [id, name, email, role, note]
    );

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to submit request" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!requireAdmin(session)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await dbQuery(
      "SELECT id, name, email, role, status, code, note, requested_at, reviewed_at, reviewed_by, completed_at FROM agent_requests ORDER BY requested_at DESC"
    );
    return NextResponse.json({ ok: true, data: result.rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to load requests" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request);
  if (!requireAdmin(session)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const action = String(body?.action || "").trim();
    const note = String(body?.note || "").trim() || null;

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: "Missing id or action" }, { status: 400 });
    }

    const current = await dbQuery("SELECT id, role, status, code FROM agent_requests WHERE id = $1", [id]);
    if (!current.rows.length) {
      return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      const role = current.rows[0].role || "agent";
      const code = current.rows[0].code || makeCode(role);
      const updated = await dbQuery(
        "UPDATE agent_requests SET status='approved', code=$1, reviewed_at=now(), reviewed_by=$2, note=COALESCE($3,note) WHERE id=$4 RETURNING id, name, email, role, status, code, note, requested_at, reviewed_at, reviewed_by, completed_at",
        [code, session?.email || null, note, id]
      );
      return NextResponse.json({ ok: true, data: updated.rows[0] });
    }

    if (action === "reject") {
      const updated = await dbQuery(
        "UPDATE agent_requests SET status='rejected', reviewed_at=now(), reviewed_by=$1, note=COALESCE($2,note) WHERE id=$3 RETURNING id, name, email, role, status, code, note, requested_at, reviewed_at, reviewed_by, completed_at",
        [session?.email || null, note, id]
      );
      return NextResponse.json({ ok: true, data: updated.rows[0] });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to update request" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
