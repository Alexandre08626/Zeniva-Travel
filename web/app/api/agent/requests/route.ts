import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { getSupabaseAdminClient, getSupabaseAnonClient } from "../../../../src/lib/supabase/server";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { normalizeRbacRoles } from "../../../../src/lib/rbac";
import { sendPushToHQ } from "../../../../src/lib/server/pushNotify";

// ── Email helpers ────────────────────────────────────────────────────────────
const smtpTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: "info@zeniva.ca", pass: "ffngbulfzfbzcoab" },
});

async function sendEmailNotification(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await smtpTransporter.sendMail({
      from: '"Zeniva" <info@zeniva.ca>',
      ...opts,
    });
  } catch (e) {
    console.error("[email] Failed to send:", e);
  }
}

async function findClientEmailInChannel(channelId: string): Promise<{ email: string; name: string } | null> {
  try {
    const client = getSupabaseAdminClient().client;
    const { data } = await client
      .from("agent_inbox_messages")
      .select("email, author, full_name")
      .filter("channel_ids", "cs", JSON.stringify([channelId]))
      .eq("sender_role", "client")
      .order("created_at", { ascending: false })
      .limit(1);
    const row = data?.[0];
    if (row?.email) return { email: row.email, name: row.full_name || row.author || "Client" };
  } catch { /* ignore */ }
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

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
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);

function getCookieValue(cookieHeader: string, name: string) {
  return (
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`))
      ?.split("=")[1] || ""
  );
}

async function requireAgentSessionAsync(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = getCookieValue(cookies, getSessionCookieName());
  const session = verifySession(token);

  // Try to get email from session OR from zeniva_email cookie fallback
  const emailFromCookie = decodeURIComponent(getCookieValue(cookies, "zeniva_email") || "").toLowerCase().trim();
  const emailToCheck = session?.email?.toLowerCase().trim() || emailFromCookie;

  if (!emailToCheck) {
    return { ok: false as const, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Determine roles: start from JWT if available, then check DB
  let roles = session ? normalizeRbacRoles(session.roles || []) : [];
  const isAdminFromJwt = roles.includes("hq") || roles.includes("admin");

  // Always check DB for actual current role (handles role upgrades + expired JWT)
  if (!isAdminFromJwt && hasSupabaseEnv()) {
    try {
      const client = getSupabaseAdminClient().client;
      const { data } = await client
        .from("accounts")
        .select("role")
        .eq("email", emailToCheck)
        .single();
      if (data?.role) {
        const dbRoles = normalizeRbacRoles([data.role]);
        if (dbRoles.length) roles = dbRoles;
      }
    } catch { /* ignore */ }
  }

  if (!roles.length) {
    return { ok: false as const, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  // Create a minimal session object if we only have cookie email (no JWT)
  const effectiveSession = session || { email: emailToCheck, roles, exp: 0 };
  const isAdmin = roles.includes("hq") || roles.includes("admin");
  const isYachtBroker = roles.includes("yacht_broker");
  return { ok: true as const, session: effectiveSession, roles, isAdmin, isYachtBroker };
}

// Sync wrapper kept for POST/DELETE which don't need DB lookup
function requireAgentSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = getCookieValue(cookies, getSessionCookieName());
  const session = verifySession(token);
  if (!session) {
    return { ok: false as const, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  let roles = normalizeRbacRoles(session.roles || []);
  // Check zeniva_roles cookie as lightweight upgrade signal
  const rolesCookie = getCookieValue(cookies, "zeniva_roles");
  if (rolesCookie) {
    try {
      const cookieRoles = normalizeRbacRoles(JSON.parse(decodeURIComponent(rolesCookie)));
      if (cookieRoles.includes("hq") || cookieRoles.includes("admin")) roles = cookieRoles;
    } catch { /* ignore */ }
  }
  if (!roles.length) {
    return { ok: false as const, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const isAdmin = roles.includes("hq") || roles.includes("admin");
  const isYachtBroker = roles.includes("yacht_broker");
  return { ok: true as const, session, roles, isAdmin, isYachtBroker };
}

function toAgentChannelIdFromEmail(email: string) {
  const local = String(email || "").split("@")[0] || "";
  const slug = local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug ? `agent-${slug}` : "agent";
}

function getSupabaseApiClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getSupabaseAdminClient().client;
  }
  return getSupabaseAnonClient().client;
}

function mapDbRow(row: any): AgentRequest {
  const channelIds = Array.isArray(row.channel_ids)
    ? row.channel_ids
    : typeof row.channel_ids === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(row.channel_ids);
            return Array.isArray(parsed) ? parsed : [row.channel_ids];
          } catch {
            return [row.channel_ids];
          }
        })()
      : ["hq"];
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    channelIds,
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
  const client = getSupabaseApiClient();
  const query = client
    .from("agent_inbox_messages")
    .select(
      "id, created_at, channel_ids, message, yacht_name, desired_date, full_name, phone, email, source_path, property_name, author, sender_role, source"
    )
    .order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const mapped = (data || []).map(mapDbRow);
  if (!channelId || channelId === "hq") return mapped;
  return mapped.filter((row) => Array.isArray(row.channelIds) && row.channelIds.includes(channelId));
}

async function readRequestsFromSupabaseByContains(channelId: string): Promise<AgentRequest[]> {
  const client = getSupabaseApiClient();
  const { data, error } = await client
    .from("agent_inbox_messages")
    .select(
      "id, created_at, channel_ids, message, yacht_name, desired_date, full_name, phone, email, source_path, property_name, author, sender_role, source"
    )
    .filter("channel_ids", "cs", JSON.stringify([channelId]))
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(mapDbRow);
}

async function writeRequestToSupabase(request: AgentRequest) {
  const client = getSupabaseApiClient();
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
  const client = getSupabaseApiClient();
  const rows = await readRequestsFromSupabase(channelId);
  if (!rows.length) return;
  const ids = rows.map((row) => row.id).filter(Boolean);
  const chunkSize = 100;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { error } = await client
      .from("agent_inbox_messages")
      .delete({ count: "exact" })
      .in("id", chunk);
    if (error) throw new Error(error.message);
  }
}

async function deleteRequestByIdSupabase(messageId: string) {
  const client = getSupabaseApiClient();
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
    if (channelId === "hq") return parsed;
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

    // Allow public read for a specific non-hq channel (client chat history)
    // Clients can read their own channel without agent auth
    // Allow clients to read their own chat history (acct- channels) without auth
    // Also allow reading agent- channels without auth
    const isPublicChannelRead = channelId && channelId !== "hq" && (channelId.startsWith("agent-") || channelId.startsWith("acct-") || channelId.startsWith("contact-"));
    if (isPublicChannelRead) {
      if (hasSupabaseEnv()) {
        const requests = await readRequestsFromSupabaseByContains(channelId);
        return NextResponse.json({ data: requests });
      }
      const requests = await readRequests(channelId);
      return NextResponse.json({ data: requests });
    }

    // Use async version that checks DB role if JWT role is insufficient
    const gate = await requireAgentSessionAsync(request);
    if (!gate.ok) return gate.error;

    const { isAdmin, isYachtBroker, session } = gate;

    // Non-admin agents only see their own direct channel (never "hq" or others' messages)
    const isAgent = !isAdmin;
    const agentChannelId = isAgent ? toAgentChannelIdFromEmail(session.email) : null;
    const effectiveChannelId = agentChannelId || channelId;

    if (hasSupabaseEnv()) {
      if (isAgent && agentChannelId) {
        // Agent sees only messages that include their channel
        const requests = await readRequestsFromSupabaseByContains(agentChannelId);
        return NextResponse.json({ data: requests });
      }

      const requests = await readRequestsFromSupabase(isAdmin ? channelId : effectiveChannelId || undefined);
      return NextResponse.json({ data: requests });
    }

    const requests = await readRequests(isAdmin ? channelId : effectiveChannelId || undefined);
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
    const channelIdsSeed: string[] = rawChannelIds.length
      ? Array.from(
          new Set(
            rawChannelIds.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
          )
        )
      : ["hq"];
    const channelIds = Array.from(new Set([...channelIdsSeed, "hq"]));

    const senderRole =
      body?.senderRole === "agent" || body?.senderRole === "hq" || body?.senderRole === "lina" || body?.senderRole === "client"
        ? body.senderRole
        : undefined;

    // Only authenticated agents/HQ/Lina can send non-client messages.
    if (senderRole && senderRole !== "client") {
      // Try x-user-email header first (used by AgentChat.client.tsx — bypasses JWT timing)
      const emailHeader = (request.headers.get("x-user-email") || "").toLowerCase().trim();
      if (emailHeader) {
        // Verify agent role via DB (any agent role can post)
        const { client: adminClient } = getSupabaseAdminClient();
        const { data: acct } = await adminClient.from("accounts").select("role").eq("email", emailHeader).maybeSingle();
        const dbRole = acct?.role || "";
        const validAgentRoles = ["hq", "admin", "super_admin", "travel_agent", "yacht_broker", "influencer"];
        if (!validAgentRoles.includes(dbRole)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        // Agent via header — allow posting to any channel (they're replying to client channels)
      } else {
        const gate = await requireAgentSessionAsync(request);
        if (!gate.ok) return gate.error;
        // Agents can post to the channel specified in the request (client channel)
        // Do NOT overwrite channelIds — agents reply into the client's channel
      }
    }

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

      // ── Email notifications ──────────────────────────────────────────────
      const msgText = newRequest.message || "";
      const clientEmail = newRequest.email || "";
      const clientName = newRequest.author || newRequest.fullName || "Client";
      const isSenderClient = senderRole === "client" || !senderRole;
      const isSenderAgent = senderRole === "hq" || senderRole === "agent";

      if (isSenderClient && msgText && clientEmail) {
        // ── Find owner of this client — send push ONLY to the right agent ──
        (async () => {
          try {
            const { client: adminClient } = getSupabaseAdminClient();
            // Find owner_email from clients table using client email
            const { data: clientRow } = await adminClient
              .from("clients")
              .select("owner_email")
              .eq("email", clientEmail)
              .maybeSingle();
            const ownerEmail = clientRow?.owner_email || "info@zeniva.ca";
            // Send push only to the owner agent
            const { sendPush } = await import("../../../../src/lib/server/pushNotify");
            sendPush({ title: `💬 ${clientName}`, body: msgText.slice(0, 100), url: "/agent/chat", tag: "new-message", targetEmail: ownerEmail }).catch(() => {});
          } catch {
            // Fallback to HQ
            sendPushToHQ({ title: `💬 ${clientName}`, body: msgText.slice(0, 100), url: "/agent/chat", tag: "new-message" }).catch(() => {});
          }
        })();

        // 1. Notify correct agent inbox — confirmation to client
        // Find owner for email notification
        const { client: ac } = getSupabaseAdminClient();
        const { data: cr } = await ac.from("clients").select("owner_email").eq("email", clientEmail).maybeSingle();
        const notifyEmail = cr?.owner_email || "info@zeniva.ca";
        void sendEmailNotification({
          to: notifyEmail,
          subject: `💬 New message from ${clientName}`,
          html: `<p><strong>${clientName}</strong> (${clientEmail}) sent a message via the Help chat:</p>
<blockquote style="border-left:4px solid #0F6CF5;padding:12px 16px;margin:16px 0;color:#333;">${msgText.replace(/\n/g,"<br/>")}</blockquote>
<p><a href="https://www.zenivatravel.com/agent/chat" style="background:#0F6CF5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Reply in Agent Inbox →</a></p>`,
        });
        // 2. Confirmation email to client
        void sendEmailNotification({
          to: clientEmail,
          subject: "✅ We received your message — Zeniva",
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
<h2 style="color:#0B1B4D">We got your message!</h2>
<p>Hi ${clientName},</p>
<p>Our team has received your message and will get back to you shortly.</p>
<blockquote style="border-left:4px solid #0F6CF5;padding:12px 16px;margin:16px 0;color:#555;">${msgText.replace(/\n/g,"<br/>")}</blockquote>
<p>In the meantime, you can explore your trips at <a href="https://www.zenivatravel.com">zenivatravel.com</a>.</p>
<p style="color:#888;font-size:12px">— The Zeniva Team</p>
</div>`,
        });
      }

      if (isSenderAgent && msgText) {
        // Find the client's email from the channel history
        const primaryChannel = channelIds.find((c) => c !== "hq") || "";
        if (primaryChannel) {
          findClientEmailInChannel(primaryChannel).then((clientInfo) => {
            if (clientInfo?.email) {
              void sendEmailNotification({
                to: clientInfo.email,
                subject: "💬 New reply from Zeniva",
                html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
<h2 style="color:#0B1B4D">You have a new reply</h2>
<p>Hi ${clientInfo.name},</p>
<p>Our team has replied to your message:</p>
<blockquote style="border-left:4px solid #E6B85A;padding:12px 16px;margin:16px 0;color:#333;">${msgText.replace(/\n/g,"<br/>")}</blockquote>
<p><a href="https://www.zenivatravel.com/chat" style="background:#0B1B4D;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">View your conversation →</a></p>
<p style="color:#888;font-size:12px">— The Zeniva Team</p>
</div>`,
              });
            }
          }).catch(() => {});
        }
      }
      // ────────────────────────────────────────────────────────────────────

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
    const gate = requireAgentSession(request);
    if (!gate.ok) return gate.error;
    if (!gate.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
