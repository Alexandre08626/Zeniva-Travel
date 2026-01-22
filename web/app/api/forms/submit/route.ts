import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { FORM_DEFINITIONS } from "../../../../src/lib/forms/catalog";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "clients.json");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");

const DEFAULT_OWNER_EMAIL = "info@zeniva.ca";
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

async function readClients(): Promise<ClientRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeClients(clients: ClientRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(clients, null, 2), "utf-8");
}

async function readAccounts(): Promise<AccountRecord[]> {
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAccounts(accounts: AccountRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
}

function getFormConfig(formId: string) {
  return FORM_DEFINITIONS.find((f) => f.id === formId) || null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureTravelerAccount(email: string, name: string, division: string) {
  if (!email) return;
  const accounts = await readAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (existing) return;
  const record: AccountRecord = {
    id: `acct-${email.replace(/[^a-z0-9]/gi, "-")}`,
    name: name || "Traveler",
    email,
    role: "traveler",
    roles: ["traveler"],
    divisions: [division],
    status: "active",
    createdAt: new Date().toISOString(),
  };
  accounts.push(record);
  await writeAccounts(accounts);
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

    const clients = await readClients();
    const existing = clients.find((c) => (
      (email && (c.email || "").toLowerCase() === email) ||
      (phone && (c.phone || "") === phone)
    ));

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

      const next = clients.map((c) => (c.id === existing.id ? updated : c));
      await writeClients(next);
      if (email) {
        await ensureTravelerAccount(email, name || existing.name || "Traveler", form.division);
      }
      return NextResponse.json({ data: updated, updated: true });
    }

    const record: ClientRecord = {
      id: body?.id || `C-${clients.length + 100}`,
      name: name || email || phone || "Client",
      email: email || undefined,
      phone: phone || undefined,
      ownerEmail,
      origin: form.origin,
      assignedAgents: [ownerEmail],
      primaryDivision: form.division,
      leadSource: form.leadSource,
      notes: [body?.notes ? String(body.notes).trim() : "", extraNotes].filter(Boolean).join("\n") || undefined,
      createdAt: new Date().toISOString(),
    };

    clients.push(record);
    await writeClients(clients);
    if (email) {
      await ensureTravelerAccount(email, record.name, form.division);
    }

    return NextResponse.json({ data: record, created: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to submit form" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
