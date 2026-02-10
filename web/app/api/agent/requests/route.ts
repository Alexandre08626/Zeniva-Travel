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

async function readRequestsFromSupabase(channelId?: string): Promise<AgentRequest[]> {
  const { client } = getSupabaseAdminClient();
  let query = client
    .from("agent_inbox_messages")
    .select(
      "id, created_at, channel_ids, message, yacht_name, desired_date, full_name, phone, email, source_path, property_name, author, sender_role, source"
    )
    .order("created_at", { ascending: false });
  if (channelId) {
    query = query.contains("channel_ids", [channelId]);
  }
  const { data, error } = await query;
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

async function deleteRequestByIdSupabase(messageId: string) {
  const { client } = getSupabaseAdminClient();
  const { error } = await client
    .from("agent_inbox_messages")
    .delete({ count: "exact" })
    .eq("id", messageId);
  if (error) throw new Error(error.message);
}

async function readRequests(channelId?: string): Promise<AgentRequest[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw || "[]");
    if (!channelId) return parsed;
    return parsed.filter((row: AgentRequest) => Array.isArray(row.channelIds) && row.channelIds.includes(channelId));
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeRequests(requests: AgentRequest[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const channelId = url.searchParams.get("channelId") || undefined;
    if (hasSupabaseEnv()) {
      const requests = await readRequestsFromSupabase(channelId);
      return NextResponse.json({ data: requests });
    }

    const requests = await readRequests(channelId);
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
    const messageId = searchParams.get("messageId");
    if (!channelId && !messageId) {
      return NextResponse.json({ error: "Missing channelId or messageId" }, { status: 400 });
    }

    if (hasSupabaseEnv()) {
      if (messageId) {
        await deleteRequestByIdSupabase(messageId);
        return NextResponse.json({ data: { removed: 1 } });
      }
      const before = await readRequestsFromSupabase();
      await deleteRequestsByChannelIdSupabase(channelId as string);
      const after = await readRequestsFromSupabase();
      return NextResponse.json({ data: { removed: Math.max(0, before.length - after.length) } });
    }

    const requests = await readRequests();
    const filtered = messageId
      ? requests.filter((req) => req.id !== messageId)
      : requests.filter(
          (req) => !Array.isArray(req.channelIds) || !req.channelIds.includes(channelId as string)
        );
    await writeRequests(filtered);

    return NextResponse.json({ data: { removed: requests.length - filtered.length } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete requests" }, { status: 500 });
  }
}
