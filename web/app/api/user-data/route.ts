import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "user-data");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function readUserFile(email: string) {
  const safe = normalizeEmail(email).replace(/[^a-z0-9@._-]/g, "_");
  const file = path.join(DATA_DIR, `${safe}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (err: any) {
    if (err?.code === "ENOENT") return {};
    throw err;
  }
}

async function writeUserFile(email: string, data: Record<string, unknown>) {
  const safe = normalizeEmail(email).replace(/[^a-z0-9@._-]/g, "_");
  const file = path.join(DATA_DIR, `${safe}.json`);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

function getEmailFromCookie(request: NextRequest) {
  const cookieEmail = request.cookies.get("zeniva_email")?.value || "";
  return cookieEmail ? normalizeEmail(cookieEmail) : "";
}

export async function GET(request: NextRequest) {
  try {
    const email = getEmailFromCookie(request);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await readUserFile(email);
    return NextResponse.json({ data, tripsState: data?.tripsState || null });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load user data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = getEmailFromCookie(request);
    const body = await request.json();
    const bodyEmail = body?.email ? normalizeEmail(String(body.email)) : "";

    if (!email || !bodyEmail || email !== bodyEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await readUserFile(email);
    const next = {
      ...existing,
      tripsState: body?.tripsState || existing.tripsState || null,
      updatedAt: new Date().toISOString(),
    };

    await writeUserFile(email, next);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save user data" }, { status: 500 });
  }
}
