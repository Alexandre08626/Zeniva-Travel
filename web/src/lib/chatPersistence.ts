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
  try {
    await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });
  } catch {
    // ignore
  }
}

export async function fetchChatMessages(channelId: string) {
  if (!channelId) return [] as any[];
  try {
    const resp = await fetch(`/api/agent/requests?channelId=${encodeURIComponent(channelId)}`);
    const payload = await resp.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [] as any[];
  }
}
