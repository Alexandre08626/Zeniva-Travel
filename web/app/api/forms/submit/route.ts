import { NextResponse } from "next/server";
import crypto from "crypto";
import { FORM_DEFINITIONS } from "../../../../src/lib/forms/catalog";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";
import { signSession } from "../../../../src/lib/server/auth";
import { sendPushToHQ } from "../../../../src/lib/server/pushNotify";

const DEFAULT_OWNER_EMAIL = "info@zenivatravel.com";
const VPS_API_URL = process.env.LINA_API_URL || "https://vmi3097009.contaboserver.net";

// ── Twilio SMS helper ──────────────────────────────────────────────────────
async function sendWelcomeSMS(phone: string, name: string, destination: string) {
  try {
    if (!phone || phone.length < 8) return;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE || "+13322900021";
    if (!sid || !auth) { console.warn("[sms-welcome] Twilio env missing"); return; }
    const firstName = name.split(" ")[0];
    const cleanPhone = phone.replace(/\D/g, "");
    const toPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;
    const smsBody = `Hi ${firstName}! 👋 Welcome to Zeniva!\n\nA member of our team will be in touch shortly about your trip to ${destination}. Log in to your account:\nhttps://zenivatravel.com/login\n\nThe Zeniva Team ✈️`;
    const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${auth}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: toPhone, Body: smsBody }).toString(),
    });
    const d = await resp.json();
    console.log("[sms-welcome]", d.sid || d.message);
  } catch (e) {
    console.error("[sms-welcome]", e);
  }
}

// ── Email helpers ──────────────────────────────────────────────────────────
let _mailer: any = null;
function getMailer() {
  if (_mailer) return _mailer;
  try {
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpPass) { console.warn("[mailer] SMTP_PASS env missing"); return null; }
    const nodemailer = require("nodemailer");
    _mailer = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: process.env.SMTP_USER || "info@zeniva.ca", pass: smtpPass },
    });
  } catch {}
  return _mailer;
}

async function sendWelcomeEmail(name: string, email: string, destination: string) {
  try {
    const mailer = getMailer();
    if (!mailer) return;
    const firstName = name.split(" ")[0];
    await mailer.sendMail({
      from: '"Zeniva Team" <info@zeniva.ca>',
      to: email,
      subject: `Welcome ${firstName} — Your trip to ${destination} starts now!`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;background:#040d1f;color:white;border-radius:16px">
          <div style="text-align:center;margin-bottom:24px">
            <img src="https://www.zenivatravel.com/branding/logo.png" width="140" alt="Zeniva"/>
          </div>
          <h1 style="text-align:center;font-size:22px;font-weight:900;color:white;margin-bottom:8px">Welcome, ${firstName}!</h1>
          <p style="color:#94a3b8;text-align:center;font-size:15px;margin-bottom:24px">Your Zeniva account is ready. A member of our team will be in touch shortly about your trip to <strong style="color:white">${destination}</strong>!</p>
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px">YOUR ACCOUNT</p>
            <p style="color:white;margin:4px 0;font-size:14px">Destination: <strong>${destination}</strong></p>
            <p style="color:#94a3b8;margin:8px 0 0;font-size:13px">Click the button below to access your account and set your password.</p>
          </div>
          <div style="text-align:center;margin-bottom:24px">
            <a href="https://zenivatravel.com/login?email=${encodeURIComponent(email)}" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0851c4);color:white;border-radius:50px;padding:14px 32px;font-weight:700;font-size:15px;text-decoration:none">Access my account</a>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center">Zeniva Travel · <a href="https://zenivatravel.com" style="color:#0F6CF5">zenivatravel.com</a></p>
        </div>
      `,
    });
  } catch (e) {
    console.error("[welcome-email]", e);
  }
}

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
    assignedAgents: (() => { const v = row.assigned_agents; if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } })(),
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

      // HQ emails are all equivalent — same owner
      const HQ_ALL = ["info@zeniva.ca", "info@zenivatravel.com", "info@zeniva.com"];
      const bothHQ = HQ_ALL.includes(existingOwner) && HQ_ALL.includes(ownerEmail);
      if (existingOwner && existingOwner !== ownerEmail && !bothHQ) {
        return NextResponse.json({ error: "Lead belongs to another agent." }, { status: 403 });
      }
      // HQ equivalence for assigned_agents too
      const assignedHqOk = HQ_ALL.includes(ownerEmail) && assigned.some(a => HQ_ALL.includes(a));
      if (assigned.length && !assigned.includes(ownerEmail) && !assignedHqOk) {
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
        // Generate setup token for existing client too — lets them set/update password
        const setupExp = Math.floor(Date.now() / 1000) + 60 * 60 * 2;
        const setupToken = signSession({ email, roles: ["traveler"], exp: setupExp, type: "setup" } as any);
        const setupUrl = `/api/auth/auto-login?token=${encodeURIComponent(setupToken)}&redirect=${encodeURIComponent("/set-password?new=1")}`;
        const HQ_ALL_EMAILS2 = ["info@zeniva.ca", "info@zenivatravel.com", "info@zeniva.com"];
        if (!HQ_ALL_EMAILS2.includes(email.toLowerCase()) && body?.phone) {
          sendWelcomeSMS(String(body.phone), saved.name, body?.destination || "travel").catch(() => {});
        }
        notifyVpsNewLead(saved, body).catch(() => {});
        return NextResponse.json({ data: saved, updated: true, setupUrl });
      }
      notifyVpsNewLead(saved, body).catch(() => {});
      return NextResponse.json({ data: saved, updated: true });
    }

    // HQ emails — never treated as "referring agents", these are the owner
    const HQ_EMAILS = ["info@zeniva.ca", "info@zenivatravel.com"];
    const isHqReferrer = HQ_EMAILS.includes(referringAgent);

    // Build assigned agents list: only include real external referring agents
    const assignedAgentsList = [ownerEmail];
    if (referringAgent && referringAgent !== ownerEmail && !isHqReferrer) {
      assignedAgentsList.push(referringAgent);
    }

    // Add commission note only for real external agents (not HQ)
    const commissionNote = referringAgent && referringAgent !== ownerEmail && !isHqReferrer
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
      // Send welcome email to new client (fire and forget)
      const HQ_ALL_EMAILS = ["info@zeniva.ca", "info@zenivatravel.com", "info@zeniva.com"];
      if (!HQ_ALL_EMAILS.includes(email.toLowerCase())) {
        const dest = body?.destination || "your dream destination";
        sendWelcomeEmail(saved.name, email, dest).catch(() => {});
        if (body?.phone) sendWelcomeSMS(String(body.phone), saved.name, dest).catch(() => {});
      }

      // Generate a one-time setup token so the client can auto-login + set password
      const setupExp = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2h
      const setupToken = signSession({ email, roles: ["traveler"], exp: setupExp, type: "setup" } as any);
      const setupUrl = `/api/auth/auto-login?token=${encodeURIComponent(setupToken)}&redirect=${encodeURIComponent("/set-password?new=1")}`;

      // Push notification to HQ — new lead!
      sendPushToHQ({
        title: "🆕 New Lead!",
        body: `${saved.name} is interested in ${body?.destination || "travel"}`,
        url: "/agent/clients",
        tag: "new-lead",
      }).catch(() => {});

      // Notify VPS for lead capture + email notification
      notifyVpsNewLead(saved, body).catch(() => {});

      return NextResponse.json({ data: saved, created: true, setupUrl }, { status: 201 });
    }
    // Notify VPS for lead capture + email notification (fallback if no email)
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
