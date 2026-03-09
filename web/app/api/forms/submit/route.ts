import { NextResponse } from "next/server";
import crypto from "crypto";
import { FORM_DEFINITIONS } from "../../../../src/lib/forms/catalog";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";

const DEFAULT_OWNER_EMAIL = "info@zenivatravel.com";
const VPS_API_URL = process.env.LINA_API_URL || "https://vmi3097009.contaboserver.net";

async function notifyVpsNewLead(clientData: any, formFields: Record<string, any>) {
  try {
    const referredBy = formFields.agentEmail || formFields.referredBy || "";
    const msg = `🆕 NEW LEAD from form: ${clientData.name || "Client"} (${clientData.email || ""}, ${clientData.phone || ""}). Destination: ${formFields.destination || "N/A"}. Budget: ${formFields.budget || "N/A"}. Travelers: ${formFields.pax || "N/A"}. Trip: ${formFields.tripType || "N/A"}. Dates: ${formFields.departureDate || "?"} → ${formFields.returnDate || "?"}${referredBy ? `. Referred by: ${referredBy}` : ""}.`;

    // Notify VPS webhook (for n8n / chat)
    await fetch(`${VPS_API_URL}/webhook/zeniva-lina-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, sessionId: `form-${clientData.id}` }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => {});

    // Send email notification to boss
    await fetch(`${VPS_API_URL}/notify-lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer zeniva-secret-2025" },
      body: JSON.stringify({
        to: "info@zeniva.ca",
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        destination: formFields.destination,
        budget: formFields.budget,
        pax: formFields.pax,
        tripType: formFields.tripType,
        departureDate: formFields.departureDate,
        returnDate: formFields.returnDate,
        referredBy,
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => {});
  } catch (_) {}
}
const TRAVEL_ALLOWED = (process.env.FORM_TRAVEL_ALLOWED_AGENTS || "")
  .split(",")
  .map((v) => v.trim().toLowerCase())
  .filter(Boolean);

type ClientRecord = {
  id: string;
  name: string;
  email?: string;
  ownerEmail: string;
  phone?: string;
  origin: string;
  assignedAgents?: string[];
  primaryDivision?: string;
  leadSource?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

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
    notes: row.notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

function getFormConfig(formId: string) {
  return FORM_DEFINITIONS.find((f) => f.id === formId) || null;
}

async function ensureTravelerAccount(email: string, name: string, division: string) {
  if (!email) return;
  const normalized = normalizeEmail(email);
  const existing = await dbQuery("SELECT id FROM accounts WHERE email = $1", [normalized]);
  if (existing.rows.length) return;
  const id = `acct-${normalized.replace(/[^a-z0-9]/gi, "-")}`;
  await dbQuery(
    "INSERT INTO accounts (id, name, email, role, roles, divisions, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7, now())",
    [id, name || "Traveler", normalized, "traveler", JSON.stringify(["traveler"]), JSON.stringify([division]), "active"]
  );
  console.log(`ACCOUNT CREATED: id=${id} email=${normalized}`);
}

function buildNotesFromPayload(formId: string, payload: Record<string, any>) {
  const ignored = new Set(["formId", "agentEmail", "name", "email", "phone", "notes"]);
  const rows = Object.entries(payload)
    .filter(([key, value]) => !ignored.has(key) && value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${String(value).trim()}`);
  if (!rows.length) return "";
  return `[Form ${formId}] ${rows.join(" | ")}`;
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const formId = String(body?.formId || "").trim();
    const form = getFormConfig(formId);

    if (!form) {
      return NextResponse.json({ error: "Invalid form." }, { status: 400 });
    }

    const name = String(body?.name || "").trim();
    const email = body?.email ? normalizeEmail(String(body.email)) : "";
    const phone = body?.phone ? String(body.phone).trim() : "";
    const extraNotes = buildNotesFromPayload(formId, body);

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required." }, { status: 400 });
    }

    // Track referring agent even for fixed-policy forms (commission tracking)
    const rawReferrer = (body?.agentEmail || body?.referredBy) as string | undefined;
    const referringAgent = rawReferrer ? normalizeEmail(String(rawReferrer)) : "";

    let ownerEmail = "";
    if (form.ownerPolicy === "fixed") {
      ownerEmail = (form as any).fixedOwnerEmail ? normalizeEmail(String((form as any).fixedOwnerEmail)) : DEFAULT_OWNER_EMAIL;
    } else {
      ownerEmail = body?.agentEmail ? normalizeEmail(String(body.agentEmail)) : "";
      if (!ownerEmail) {
        return NextResponse.json({ error: "Agent email is required." }, { status: 400 });
      }
      if (TRAVEL_ALLOWED.length && !TRAVEL_ALLOWED.includes(ownerEmail)) {
        return NextResponse.json({ error: "Agent not allowed for travel forms." }, { status: 403 });
      }
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
          `SELECT id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, notes, created_at, updated_at FROM clients WHERE ${filters.join(
            " OR "
          )} LIMIT 1`,
          params
        )
      : { rows: [] };

    const existing = existingResult.rows[0] ? mapClientRow(existingResult.rows[0]) : null;

    if (existing) {
      const existingOwner = normalizeEmail(existing.ownerEmail || "");
      const assigned = (existing.assignedAgents || []).map((a) => normalizeEmail(a));
      const division = String(existing.primaryDivision || "").toUpperCase();

      if (existingOwner && existingOwner !== ownerEmail) {
        return NextResponse.json({ error: "Lead belongs to another agent." }, { status: 403 });
      }
      if (assigned.length && !assigned.includes(ownerEmail)) {
        return NextResponse.json({ error: "Lead assigned to another agent." }, { status: 403 });
      }
      if (division && division !== form.division) {
        return NextResponse.json({ error: "Lead belongs to another division." }, { status: 403 });
      }

      const updatedNotes = [existing.notes, body?.notes ? String(body.notes).trim() : "", extraNotes]
        .filter(Boolean)
        .join("\n");

      const updated: ClientRecord = {
        ...existing,
        name: name || existing.name || (email || phone || "Client"),
        email: email || existing.email,
        phone: phone || existing.phone,
        ownerEmail,
        assignedAgents: [ownerEmail],
        primaryDivision: form.division,
        origin: form.origin,
        leadSource: form.leadSource,
        notes: updatedNotes || existing.notes,
        updatedAt: new Date().toISOString(),
      };

      const { rows } = await dbQuery(
        "UPDATE clients SET name = $2, email = $3, phone = $4, owner_email = $5, assigned_agents = $6, primary_division = $7, origin = $8, lead_source = $9, notes = $10, updated_at = now() WHERE id = $1 RETURNING id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, notes, created_at, updated_at",
        [
          existing.id,
          updated.name,
          updated.email || null,
          updated.phone || null,
          updated.ownerEmail,
          JSON.stringify(updated.assignedAgents || []),
          updated.primaryDivision || null,
          updated.origin,
          updated.leadSource || null,
          updated.notes || null,
        ]
      );
      const saved = mapClientRow(rows[0]);
      if (email) {
        await ensureTravelerAccount(email, name || saved.name || "Traveler", form.division);
      }
      notifyVpsNewLead(saved, body).catch(() => {});
      return NextResponse.json({ data: saved, updated: true });
    }

    // Build assigned agents list: always include Zeniva owner + referring agent if present
    const assignedAgentsList = [ownerEmail];
    if (referringAgent && referringAgent !== ownerEmail) {
      assignedAgentsList.push(referringAgent);
    }

    // Add commission note if referred by agent
    const commissionNote = referringAgent && referringAgent !== ownerEmail
      ? `[REFERRAL] Referred by agent: ${referringAgent} | Commission: 5% of net profit`
      : "";

    const record: ClientRecord = {
      id: body?.id || `C-${crypto.randomUUID()}`,
      name: name || email || phone || "Client",
      email: email || undefined,
      phone: phone || undefined,
      ownerEmail,
      origin: form.origin,
      assignedAgents: assignedAgentsList,
      primaryDivision: form.division,
      leadSource: referringAgent ? `agent-referral:${referringAgent}` : form.leadSource,
      notes: [body?.notes ? String(body.notes).trim() : "", extraNotes, commissionNote].filter(Boolean).join("\n") || undefined,
      createdAt: new Date().toISOString(),
    };

    const { rows } = await dbQuery(
      "INSERT INTO clients (id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, notes, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, notes, created_at",
      [
        record.id,
        record.name,
        record.email || null,
        record.ownerEmail,
        record.phone || null,
        record.origin,
        JSON.stringify(record.assignedAgents || []),
        record.primaryDivision || null,
        record.leadSource || null,
        record.notes || null,
      ]
    );
    const saved = mapClientRow(rows[0]);
    console.log(`CLIENT CREATED: id=${saved.id} email=${saved.email || ""}`);
    if (email) {
      await ensureTravelerAccount(email, saved.name, form.division);
    }
    // Notify VPS for lead capture + email notification
    notifyVpsNewLead(saved, body).catch(() => {});

    return NextResponse.json({ data: saved, created: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to submit form" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export const runtime = "nodejs";
