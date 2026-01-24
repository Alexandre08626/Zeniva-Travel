import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../src/lib/server/db";

type AccountRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  divisions?: string[];
  status?: "active" | "disabled" | "suspended";
  createdAt: string;
};

function getRolesFromRequest(request: Request): string[] {
  const cookieHeader = request.headers.get("cookie") || "";
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const roleEntry = parts.find((part) => part.startsWith("zeniva_roles="));
  if (!roleEntry) return [];
  const raw = roleEntry.slice("zeniva_roles=".length);
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function requireHQ(request: Request) {
  const roles = getRolesFromRequest(request);
  if (!roles.includes("hq") && !roles.includes("admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function mapAccountRow(row: any): AccountRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    roles: row.roles || undefined,
    divisions: row.divisions || undefined,
    status: row.status || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const gate = requireHQ(request);
    if (gate) return gate;
    assertBackendEnv();
    const { rows } = await dbQuery(
      "SELECT id, name, email, role, roles, divisions, status, created_at FROM accounts ORDER BY created_at DESC"
    );
    return NextResponse.json({ data: rows.map(mapAccountRow) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const required = ["name", "email", "role"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const email = normalizeEmail(String(body.email));
    const name = String(body.name).trim() || "Agent";
    const role = String(body.role);
    const roles = Array.isArray(body.roles) ? body.roles : undefined;
    const divisions = Array.isArray(body.divisions) ? body.divisions : undefined;
    const status = body.status === "suspended" ? "suspended" : body.status === "disabled" ? "disabled" : "active";

    const existing = await dbQuery("SELECT id FROM accounts WHERE email = $1", [email]);
    if (existing.rows.length) {
      const { rows } = await dbQuery(
        "UPDATE accounts SET name = $2, role = $3, roles = $4, divisions = $5, status = $6, updated_at = now() WHERE email = $1 RETURNING id, name, email, role, roles, divisions, status, created_at",
        [email, name, role, roles || null, divisions || null, status]
      );
      const record = mapAccountRow(rows[0]);
      console.log(`ACCOUNT UPDATED: id=${record.id} email=${record.email}`);
      return NextResponse.json({ data: record });
    }

    const id = `acct-${email.replace(/[^a-z0-9]/gi, "-")}`;
    const { rows } = await dbQuery(
      "INSERT INTO accounts (id, name, email, role, roles, divisions, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7, now()) RETURNING id, name, email, role, roles, divisions, status, created_at",
      [id, name, email, role, roles || null, divisions || null, status]
    );
    const record = mapAccountRow(rows[0]);
    console.log(`ACCOUNT CREATED: id=${record.id} email=${record.email}`);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const gate = requireHQ(request);
    if (gate) return gate;
    assertBackendEnv();
    const url = new URL(request.url);
    const emailParam = url.searchParams.get("email") || "";
    const email = normalizeEmail(String(emailParam));
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    await dbQuery("DELETE FROM accounts WHERE email = $1", [email]);

    return NextResponse.json({ ok: true, deleted: email });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete account" }, { status: 500 });
  }
}

export const runtime = "nodejs";
