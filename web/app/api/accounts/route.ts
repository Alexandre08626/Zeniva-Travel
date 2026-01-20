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

export async function GET() {
  try {
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
