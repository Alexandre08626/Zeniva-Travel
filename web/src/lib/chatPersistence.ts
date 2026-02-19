import { getSupabaseClient } from "./supabase/client";

type ChatSavePayload = {
  channelIds: string[];
  message: string;
  author: string;
  senderRole: "agent" | "hq" | "lina" | "client";
  source: string;
  sourcePath: string;
  propertyName?: string;
};

const safeId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function buildChatChannelId(userEmail: string | undefined, context: string) {
  const email = (userEmail || "").trim().toLowerCase();
  if (!email) return "";
  const safeEmail = safeId(email || "guest");
  const safeContext = safeId(context || "chat");
  return `acct-${safeEmail}-${safeContext}`;
}

export function buildContactChannelId(userEmail: string | undefined) {
  const email = (userEmail || "").trim().toLowerCase();
  if (!email) return "";
  return `contact-${safeId(email)}`;
}

export async function saveChatMessage(payload: ChatSavePayload) {
  const channelIds = Array.from(new Set(payload.channelIds.filter(Boolean)));
  if (!channelIds.length) return;
  const record = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    channelIds,
    message: payload.message,
    author: payload.author,
    senderRole: payload.senderRole,
    source: payload.source,
    sourcePath: payload.sourcePath,
    propertyName: payload.propertyName,
  };
  try {
    const client = getSupabaseClient();
    const { error } = await client.from("agent_inbox_messages").insert({
      id: record.id,
      created_at: record.createdAt,
      channel_ids: record.channelIds,
      message: record.message,
      author: record.author,
      sender_role: record.senderRole,
      source: record.source,
      source_path: record.sourcePath,
      property_name: record.propertyName || null,
    });
    if (!error) return;
  } catch {
    // fall through to API fallback
  }

  try {
    await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  } catch {
    // ignore
  }
}

export async function fetchChatMessages(channelId: string) {
  if (!channelId) return [] as any[];
  const mapById = new Map<string, any>();

  try {
    const resp = await fetch(`/api/agent/requests?channelId=${encodeURIComponent(channelId)}`);
    const payload = await resp.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    rows.forEach((row: any) => {
      const key = String(row?.id || "");
      if (key) mapById.set(key, row);
    });
  } catch {
    // ignore
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("agent_inbox_messages")
      .select("id, created_at, channel_ids, message, author, sender_role, source, source_path, property_name")
      .filter("channel_ids", "cs", JSON.stringify([channelId]))
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    rows.forEach((row: any) => {
      const key = String(row?.id || "");
      if (key) mapById.set(key, row);
    });
  } catch {
    // ignore
  }

  const merged = Array.from(mapById.values());
  merged.sort((a, b) => {
    const aTime = new Date(a?.created_at || a?.createdAt || 0).getTime();
    const bTime = new Date(b?.created_at || b?.createdAt || 0).getTime();
    return bTime - aTime;
  });
  return merged;
}
