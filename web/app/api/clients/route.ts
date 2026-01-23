import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "clients.json");

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

export async function GET() {
  try {
    const clients = await readClients();
    return NextResponse.json({ data: clients });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["name", "ownerEmail", "origin"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const name = String(body.name).trim() || "Client";
    const email = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const ownerEmail = String(body.ownerEmail).trim().toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const origin = body.origin === "agent" ? "agent" : body.origin === "web_signup" ? "web_signup" : "house";
    const assignedAgents = Array.isArray(body.assignedAgents) ? body.assignedAgents : [];
    const primaryDivision = body.primaryDivision ? String(body.primaryDivision) : undefined;

    const clients = await readClients();
    const existing = email ? clients.find((c) => (c.email || "").toLowerCase() === email) : undefined;
    if (existing) {
      return NextResponse.json({ data: existing });
    }

    const record: ClientRecord = {
      id: body.id || `C-${clients.length + 100}`,
      name,
      email,
      ownerEmail,
      phone,
      origin,
      assignedAgents,
      primaryDivision,
      createdAt: new Date().toISOString(),
    };

    clients.push(record);
    await writeClients(clients);

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save client" }, { status: 500 });
  }
}
