import { NextResponse } from "next/server";
import crypto from "crypto";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../../src/lib/server/db";

const JASON_EMAIL = "lantierj6@gmail.com";
const ALLOWED_DIVISION = "YACHT";
const REQUIRED_ORIGIN = "agent-added";
const REQUIRED_LEAD_SOURCE = "marketing Jason";

type ClientRecord = {
  id: string;
  name: string;
  email?: string;
  ownerEmail: string;
  phone?: string;
  origin: "house" | "agent" | "agent-added";
  assignedAgents?: string[];
  primaryDivision?: string;
  leadSource?: string;
  createdAt: string;
  updatedAt?: string;
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
    leadSource: row.lead_source || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

function hashKey(value: string) {
  if (!value) return "";
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 8);
}

function getBearerToken(request: Request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return "";
  return auth.slice(7).trim();
}

function logUnauthorized(reason: string, received: string, expectedPresent: boolean) {
  const receivedHash = received ? `${hashKey(received)}...` : "(missing)";
  const expectedState = expectedPresent ? "present" : "absent";
  console.warn(`Unauthorized: ${reason} | received=${receivedHash} | expected=${expectedState}`);
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const apiKey = getBearerToken(request);
    const expected = process.env.JASON_YACHT_API_KEY || "";

    if (!apiKey) {
      logUnauthorized("API key missing", apiKey, Boolean(expected));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!expected || apiKey !== expected) {
      logUnauthorized("API key mismatch", apiKey, Boolean(expected));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const firstName = body?.first_name ? String(body.first_name).trim() : "";
    const lastName = body?.last_name ? String(body.last_name).trim() : "";
    const fullNameFromParts = `${firstName} ${lastName}`.trim();
    const name = String(body?.name || fullNameFromParts || "").trim();
    const email = body?.email ? normalizeEmail(String(body.email)) : "";
    const phone = body?.phone ? String(body.phone).trim() : "";
    const notes = body?.notes ? String(body.notes).trim() : "";

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone is required." }, { status: 400 });
    }

    const filters: string[] = [];
    const params: any[] = [];
    if (email) {
      params.push(email);
      filters.push(`lower(email) = lower($${params.length})`);
    }
    if (phone) {
      params.push(phone);
      filters.push(`phone = $${params.length}`);
    }
    const existingResult = filters.length
      ? await dbQuery(
          `SELECT id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, created_at, updated_at FROM clients WHERE ${filters.join(
            " OR "
          )} LIMIT 1`,
          params
        )
      : { rows: [] };
    const existing = existingResult.rows[0] ? mapClientRow(existingResult.rows[0]) : null;

    if (existing) {
      const owner = (existing.ownerEmail || "").toLowerCase();
      const assigned = (existing.assignedAgents || []).map((a) => a.toLowerCase());
      const division = (existing.primaryDivision || "").toUpperCase();

      if (owner && owner !== JASON_EMAIL.toLowerCase()) {
        return NextResponse.json({ error: "Lead belongs to another agent." }, { status: 403 });
      }
      if (assigned.length && !assigned.includes(JASON_EMAIL.toLowerCase())) {
        return NextResponse.json({ error: "Lead assigned to another agent." }, { status: 403 });
      }
      if (division && division !== ALLOWED_DIVISION) {
        return NextResponse.json({ error: "Lead belongs to another division." }, { status: 403 });
      }

      const updated: ClientRecord = {
        ...existing,
        name: name || existing.name || (email || phone || "Client"),
        email: email || existing.email,
        phone: phone || existing.phone,
        ownerEmail: JASON_EMAIL,
        assignedAgents: [JASON_EMAIL],
        primaryDivision: ALLOWED_DIVISION,
        origin: REQUIRED_ORIGIN,
        leadSource: REQUIRED_LEAD_SOURCE,
        updatedAt: new Date().toISOString(),
      };

      if (notes) {
        (updated as any).notes = notes;
      }

      const { rows } = await dbQuery(
        "UPDATE clients SET name = $2, email = $3, phone = $4, owner_email = $5, assigned_agents = $6, primary_division = $7, origin = $8, lead_source = $9, notes = $10, updated_at = now() WHERE id = $1 RETURNING id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, created_at, updated_at",
        [
          existing.id,
          updated.name,
          updated.email || null,
          updated.phone || null,
          updated.ownerEmail,
          updated.assignedAgents || [],
          updated.primaryDivision || null,
          updated.origin,
          updated.leadSource || null,
          notes || null,
        ]
      );
      const saved = mapClientRow(rows[0]);
      return NextResponse.json({ data: saved, updated: true });
    }

    const record: ClientRecord = {
      id: body?.id || `C-${crypto.randomUUID()}`,
      name: name || email || phone || "Client",
      email: email || undefined,
      phone: phone || undefined,
      ownerEmail: JASON_EMAIL,
      origin: REQUIRED_ORIGIN,
      assignedAgents: [JASON_EMAIL],
      primaryDivision: ALLOWED_DIVISION,
      leadSource: REQUIRED_LEAD_SOURCE,
      createdAt: new Date().toISOString(),
    };

    if (notes) {
      (record as any).notes = notes;
    }

    const { rows } = await dbQuery(
      "INSERT INTO clients (id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, notes, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, created_at",
      [
        record.id,
        record.name,
        record.email || null,
        record.ownerEmail,
        record.phone || null,
        record.origin,
        record.assignedAgents || [],
        record.primaryDivision || null,
        record.leadSource || null,
        notes || null,
      ]
    );
    const saved = mapClientRow(rows[0]);
    console.log(`CLIENT CREATED: id=${saved.id} email=${saved.email || ""}`);
    return NextResponse.json({ data: saved, created: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save client" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export const runtime = "nodejs";