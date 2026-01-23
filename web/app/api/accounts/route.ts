import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "accounts.json");

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

async function readAccounts(): Promise<AccountRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAccounts(accounts: AccountRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const gate = requireHQ(request);
    if (gate) return gate;
    const accounts = await readAccounts();
    return NextResponse.json({ data: accounts });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["name", "email", "role"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const name = String(body.name).trim() || "Agent";
    const role = String(body.role);
    const roles = Array.isArray(body.roles) ? body.roles : undefined;
    const divisions = Array.isArray(body.divisions) ? body.divisions : undefined;
    const status = body.status === "suspended" ? "suspended" : body.status === "disabled" ? "disabled" : "active";

    const accounts = await readAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === email);
    if (existing) {
      return NextResponse.json({ data: existing });
    }

    const record: AccountRecord = {
      id: `acct-${email.replace(/[^a-z0-9]/gi, "-")}`,
      name,
      email,
      role,
      roles,
      divisions,
      status,
      createdAt: new Date().toISOString(),
    };

    accounts.push(record);
    await writeAccounts(accounts);

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const gate = requireHQ(request);
    if (gate) return gate;
    const url = new URL(request.url);
    const emailParam = url.searchParams.get("email") || "";
    const email = String(emailParam).trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const accounts = await readAccounts();
    const remaining = accounts.filter((a) => a.email.toLowerCase() !== email);
    await writeAccounts(remaining);

    return NextResponse.json({ ok: true, deleted: email });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete account" }, { status: 500 });
  }
}
