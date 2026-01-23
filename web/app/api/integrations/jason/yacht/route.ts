import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "clients.json");

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
    const email = body?.email ? String(body.email).trim().toLowerCase() : "";
    const phone = body?.phone ? String(body.phone).trim() : "";
    const notes = body?.notes ? String(body.notes).trim() : "";

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone is required." }, { status: 400 });
    }

    const clients = await readClients();
    const existing = clients.find((c) => (
      (email && (c.email || "").toLowerCase() === email) ||
      (phone && (c.phone || "") === phone)
    ));

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

      const next = clients.map((c) => (c.id === existing.id ? updated : c));
      await writeClients(next);

      return NextResponse.json({ data: updated, updated: true });
    }

    const record: ClientRecord = {
      id: body?.id || `C-${clients.length + 100}`,
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

    clients.push(record);
    await writeClients(clients);

    return NextResponse.json({ data: record, created: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save client" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}