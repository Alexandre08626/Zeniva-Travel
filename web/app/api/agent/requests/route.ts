import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { dbQuery } from "../../../src/lib/server/db";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "agent-requests.json");

type AgentRequest = {
  id: string;
  createdAt: string;
  channelIds?: string[];
  message?: string;
  yachtName?: string;
  desiredDate?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  sourcePath?: string;
  propertyName?: string;
  author?: string;
  senderRole?: "agent" | "hq" | "lina" | "client";
  source?: string;
};

const DB_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NO_SSL",
];

const hasDatabaseUrl = () => DB_ENV_KEYS.some((key) => Boolean(process.env[key]));

function mapDbRow(row: any): AgentRequest {
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    channelIds: Array.isArray(row.channel_ids) ? row.channel_ids : [],
    message: row.message || undefined,
    yachtName: row.yacht_name || undefined,
    desiredDate: row.desired_date || undefined,
    fullName: row.full_name || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    sourcePath: row.source_path || undefined,
    propertyName: row.property_name || undefined,
    author: row.author || undefined,
    senderRole: row.sender_role || undefined,
    source: row.source || undefined,
  };
}

async function readRequestsFromDb(): Promise<AgentRequest[]> {
  const { rows } = await dbQuery(
    "SELECT id, created_at, channel_ids, message, yacht_name, desired_date, full_name, phone, email, source_path, property_name, author, sender_role, source FROM agent_inbox_messages ORDER BY created_at DESC"
  );
  return rows.map(mapDbRow);
}

async function writeRequestToDb(request: AgentRequest) {
  const channelIds = Array.isArray(request.channelIds) ? request.channelIds : [];
  await dbQuery(
    "INSERT INTO agent_inbox_messages (id, created_at, channel_ids, message, yacht_name, desired_date, full_name, phone, email, source_path, property_name, author, sender_role, source) VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
    [
      request.id,
      request.createdAt || new Date().toISOString(),
      JSON.stringify(channelIds),
      request.message || null,
      request.yachtName || null,
      request.desiredDate || null,
      request.fullName || null,
      request.phone || null,
      request.email || null,
      request.sourcePath || null,
      request.propertyName || null,
      request.author || null,
      request.senderRole || null,
      request.source || null,
    ]
  );
}

async function deleteRequestsByChannelId(channelId: string) {
  await dbQuery("DELETE FROM agent_inbox_messages WHERE channel_ids ? $1", [channelId]);
}

async function readRequests(): Promise<AgentRequest[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeRequests(requests: AgentRequest[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

export async function GET() {
  try {
    if (hasDatabaseUrl()) {
      const requests = await readRequestsFromDb();
      return NextResponse.json({ data: requests });
    }

    const requests = await readRequests();
    return NextResponse.json({ data: requests });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hasChatPayload = Boolean(body?.message && body?.sourcePath);
    const required = ["yachtName", "desiredDate", "fullName", "phone", "email", "sourcePath"];
    const missing = required.filter((k) => !body?.[k]);
    if (!hasChatPayload && missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const rawChannelIds = Array.isArray(body.channelIds) ? body.channelIds : [];
    const channelIds: string[] = rawChannelIds.length
      ? Array.from(
          new Set(
            rawChannelIds.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
          )
        )
      : ["hq"];

    const senderRole =
      body?.senderRole === "agent" || body?.senderRole === "hq" || body?.senderRole === "lina" || body?.senderRole === "client"
        ? body.senderRole
        : undefined;
    const author = body?.author || body?.fullName || body?.email || "Client";
    const source = body?.source || (hasChatPayload ? "traveler-chat" : "form");

    const newRequest: AgentRequest = {
      id: body.id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      createdAt: body.createdAt || new Date().toISOString(),
      channelIds,
      message: body.message || "New yacht request",
      yachtName: body.yachtName,
      desiredDate: body.desiredDate,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      sourcePath: body.sourcePath,
      propertyName: body.propertyName,
      author,
      senderRole,
      source,
    };

    if (hasDatabaseUrl()) {
      await writeRequestToDb(newRequest);
      return NextResponse.json({ data: newRequest }, { status: 201 });
    }

    const requests = await readRequests();
    requests.push(newRequest);
    await writeRequests(requests);

    return NextResponse.json({ data: newRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json({ error: "Missing channelId" }, { status: 400 });
    }

    if (hasDatabaseUrl()) {
      const before = await readRequestsFromDb();
      await deleteRequestsByChannelId(channelId);
      const after = await readRequestsFromDb();
      return NextResponse.json({ data: { removed: Math.max(0, before.length - after.length) } });
    }

    const requests = await readRequests();
    const filtered = requests.filter(
      (req) => !Array.isArray(req.channelIds) || !req.channelIds.includes(channelId)
    );
    await writeRequests(filtered);

    return NextResponse.json({ data: { removed: requests.length - filtered.length } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete requests" }, { status: 500 });
  }
}
