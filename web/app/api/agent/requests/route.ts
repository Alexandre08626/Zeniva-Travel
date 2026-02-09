import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

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

const hasSupabaseEnv = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

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

async function readRequestsFromSupabase(): Promise<AgentRequest[]> {
  const { client } = getSupabaseAdminClient();
  const { data, error } = await client
    .from("agent_inbox_messages")
    .select(
      "id, created_at, channel_ids, message, yacht_name, desired_date, full_name, phone, email, source_path, property_name, author, sender_role, source"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapDbRow);
}

async function writeRequestToSupabase(request: AgentRequest) {
  const { client } = getSupabaseAdminClient();
  const channelIds = Array.isArray(request.channelIds) ? request.channelIds : [];
  const { error } = await client.from("agent_inbox_messages").insert({
    id: request.id,
    created_at: request.createdAt || new Date().toISOString(),
    channel_ids: channelIds,
    message: request.message || null,
    yacht_name: request.yachtName || null,
    desired_date: request.desiredDate || null,
    full_name: request.fullName || null,
    phone: request.phone || null,
    email: request.email || null,
    source_path: request.sourcePath || null,
    property_name: request.propertyName || null,
    author: request.author || null,
    sender_role: request.senderRole || null,
    source: request.source || null,
  });
  if (error) throw new Error(error.message);
}

async function deleteRequestsByChannelIdSupabase(channelId: string) {
  const { client } = getSupabaseAdminClient();
  const { error } = await client
    .from("agent_inbox_messages")
    .delete({ count: "exact" })
    .contains("channel_ids", [channelId]);
  if (error) throw new Error(error.message);
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
    if (hasSupabaseEnv()) {
      const requests = await readRequestsFromSupabase();
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

    if (hasSupabaseEnv()) {
      await writeRequestToSupabase(newRequest);
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

    if (hasSupabaseEnv()) {
      const before = await readRequestsFromSupabase();
      await deleteRequestsByChannelIdSupabase(channelId);
      const after = await readRequestsFromSupabase();
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
