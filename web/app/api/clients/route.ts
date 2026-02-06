import { NextResponse } from "next/server";
import crypto from "crypto";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../src/lib/server/db";
import { requireRbacPermission } from "../../../src/lib/server/rbac";

type ClientRecord = {
  id: string;
  name: string;
  email?: string;
  ownerEmail: string;
  phone?: string;
  origin: "house" | "agent" | "web_signup";
  assignedAgents?: string[];
  primaryDivision?: string;
  createdAt: string;
};

function mapClientRow(row: any): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    ownerEmail: row.owner_email,
    phone: row.phone || undefined,
    origin: row.origin || "house",
    assignedAgents: row.assigned_agents || [],
    primaryDivision: row.primary_division || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const accessAll = await requireRbacPermission(request, "clients:all");
    const accessOwn = await requireRbacPermission(request, "clients:own");
    const accessLegacyOwn = await requireRbacPermission(request, "read_own_clients");
    if (!accessAll.ok && !accessOwn.ok && !accessLegacyOwn.ok) {
      return NextResponse.json({ error: accessAll.error }, { status: accessAll.status });
    }

    if (accessAll.ok) {
      const { rows } = await dbQuery(
        "SELECT id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at FROM clients ORDER BY created_at DESC"
      );
      return NextResponse.json({ data: rows.map(mapClientRow) });
    }

    const ownerEmail = accessOwn.session?.email || accessLegacyOwn.session?.email || "";
    const { rows } = await dbQuery(
      "SELECT id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at FROM clients WHERE lower(owner_email) = lower($1) OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(assigned_agents) elem WHERE elem = $1) ORDER BY created_at DESC",
      [ownerEmail]
    );
    return NextResponse.json({ data: rows.map(mapClientRow) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const accessAll = await requireRbacPermission(request, "clients:all");
    const accessOwn = await requireRbacPermission(request, "clients:own");
    const accessLegacyOwn = await requireRbacPermission(request, "read_own_clients");
    if (!accessAll.ok && !accessOwn.ok && !accessLegacyOwn.ok) {
      return NextResponse.json({ error: accessAll.error }, { status: accessAll.status });
    }
    const body = await request.json();
    const required = ["name", "ownerEmail", "origin"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const name = String(body.name).trim() || "Client";
    const email = body.email ? normalizeEmail(String(body.email)) : undefined;
    const ownerEmail = normalizeEmail(String(body.ownerEmail));
    if (!accessAll.ok) {
      const sessionEmail = accessOwn.session?.email
        ? normalizeEmail(accessOwn.session.email)
        : accessLegacyOwn.session?.email
          ? normalizeEmail(accessLegacyOwn.session.email)
          : "";
      if (!sessionEmail || sessionEmail !== ownerEmail) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const origin = body.origin === "agent" ? "agent" : body.origin === "web_signup" ? "web_signup" : "house";
    const assignedAgents = Array.isArray(body.assignedAgents) ? body.assignedAgents : [];
    const primaryDivision = body.primaryDivision ? String(body.primaryDivision) : undefined;

    if (email) {
      const { rows } = await dbQuery(
        "SELECT id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at FROM clients WHERE lower(email) = lower($1) LIMIT 1",
        [email]
      );
      if (rows[0]) {
        return NextResponse.json({ data: mapClientRow(rows[0]) });
      }
    }

    const id = body.id || `C-${crypto.randomUUID()}`;
    const { rows } = await dbQuery(
      "INSERT INTO clients (id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now()) RETURNING id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at",
      [id, name, email || null, ownerEmail, phone || null, origin, assignedAgents || [], primaryDivision || null]
    );
    const record = mapClientRow(rows[0]);
    console.log(`CLIENT CREATED: id=${record.id} email=${record.email || ""}`);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save client" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
