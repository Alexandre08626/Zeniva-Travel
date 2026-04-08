import { NextRequest, NextResponse } from "next/server";

const VPS_BASE = "https://vmi3097009.contaboserver.net";
const VPS_WEBHOOK = "https://vmi3097009.contaboserver.net/webhook/zeniva-lina-chat";
const AUTH = "Bearer zeniva-secret-2025";

export async function GET(req: NextRequest) {
  // Auth check — require agent session cookie or Bearer token
  const authHeader = req.headers.get("authorization") || "";
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = req.cookies.get("zeniva_roles")?.value || "";
  const isInternalAuth = authHeader === AUTH;
  const hasAgentSession = sessionCookie.length > 10 && (rolesCookie.includes("hq") || rolesCookie.includes("agent") || rolesCookie.includes("admin") || rolesCookie.includes("broker") || rolesCookie.includes("influencer"));
  if (!isInternalAuth && !hasAgentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Support both ?endpoint=xxx and ?path=admin/xxx
  const pathParam = req.nextUrl.searchParams.get("path");
  if (pathParam) {
    try {
      const auth = req.headers.get("Authorization") || AUTH;
      // Forward all query params (including agent_email) to VPS
      const forwardParams = new URLSearchParams();
      req.nextUrl.searchParams.forEach((v, k) => { if (k !== "path") forwardParams.set(k, v); });
      const qs = forwardParams.toString() ? `?${forwardParams.toString()}` : "";
      const r = await fetch(`${VPS_BASE}/${pathParam}${qs}`, { headers: { Authorization: auth }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    } catch (err: any) {
      return NextResponse.json({ error: err?.message }, { status: 502 });
    }
  }

  const endpoint = req.nextUrl.searchParams.get("endpoint") || "health";

  try {
    if (endpoint === "health") {
      const r = await fetch(`${VPS_BASE}/health`, { next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "stats") {
      const r = await fetch(`${VPS_BASE}/admin/stats`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "webhook-test") {
      // Replaced: no longer sends messages to Lina — use /health instead
      const r = await fetch(`${VPS_BASE}/`, { next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "leads") {
      const r = await fetch(`${VPS_BASE}/admin/leads?limit=100`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "activity") {
      const r = await fetch(`${VPS_BASE}/admin/activity`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "tiktok") {
      const r = await fetch(`${VPS_BASE}/tiktok/content`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "tiktok-video") {
      const filename = req.nextUrl.searchParams.get("file") || "";
      const r = await fetch(`${VPS_BASE}/tiktok/video/${filename}`);
      if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const buffer = await r.arrayBuffer();
      return new NextResponse(buffer, { headers: { "Content-Type": "video/mp4", "Content-Length": String(buffer.byteLength), "Cache-Control": "public, max-age=3600" } });
    }
    // Serve any video/audio from video-assets or video-queue
    if (endpoint === "video-serve") {
      const filename = req.nextUrl.searchParams.get("file") || "";
      const r = await fetch(`${VPS_BASE}/video-serve/${filename}`, { headers: { Authorization: AUTH } });
      if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const buffer = await r.arrayBuffer();
      const ct = filename.endsWith(".mp3") ? "audio/mpeg" : "video/mp4";
      return new NextResponse(buffer, { headers: { "Content-Type": ct, "Content-Length": String(buffer.byteLength), "Cache-Control": "no-cache" } });
    }
    // Get video queue (uploaded videos pending approval)
    if (endpoint === "video-queue") {
      const r = await fetch(`${VPS_BASE}/video-queue`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    // Get influencer accounts from Supabase
    if (endpoint === "influencers") {
      const { getSupabaseAdminClient } = await import("../../../src/lib/supabase/server");
      const { client } = getSupabaseAdminClient();
      const { data } = await client
        .from("accounts")
        .select("id, name, email, role, roles, status, created_at")
        .eq("role", "influencer")
        .neq("status", "blocked")
        .order("created_at", { ascending: false });
      const agents = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name || "Influencer",
        email: row.email,
        agent_type: "influencer",
        status: row.status || "active",
        leads_count: 0,
        commission_rate: 5,
        ref_code: "",
        created_at: row.created_at,
      }));
      return NextResponse.json({ agents });
    }
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "VPS unreachable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  // Support ?path=admin/xxx for direct VPS passthrough
  const pathParam = req.nextUrl.searchParams.get("path");
  if (pathParam) {
    try {
      const auth = req.headers.get("Authorization") || AUTH;
      const body = await req.text();
      const r = await fetch(`${VPS_BASE}/${pathParam}`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body,
      });
      return NextResponse.json(await r.json());
    } catch (err: any) {
      return NextResponse.json({ error: err?.message }, { status: 502 });
    }
  }

  const endpoint = req.nextUrl.searchParams.get("endpoint") || "";
  try {
    if (endpoint === "tiktok-action") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/tiktok/action`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "video-queue-action") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/video-queue/action`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "upload-video") {
      const formData = await req.formData();
      const r = await fetch(`${VPS_BASE}/video-queue/upload`, { method: "POST", headers: { Authorization: AUTH }, body: formData });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "add-voice") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/video-queue/add-voice`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "social-queue") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/social-queue`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "agent-command") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/agent-command`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "social-leads-scan") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/social-leads/scan`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "social-leads-outreach") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/social-leads/outreach`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "social-leads-save") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/social-leads/save`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = req.cookies.get("zeniva_roles")?.value || "";
  const bearerAuth = req.headers.get("Authorization") || "";
  const isHQ = rolesCookie.includes("hq") || rolesCookie.includes("admin") || bearerAuth === "Bearer zeniva-secret-2025";
  if (!isHQ && sessionCookie.length < 10) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pathParam = req.nextUrl.searchParams.get("path");
  if (!pathParam) return NextResponse.json({ error: "No path" }, { status: 400 });
  try {
    const r = await fetch(`${VPS_BASE}/${pathParam}`, {
      method: "DELETE",
      headers: { Authorization: AUTH },
    });
    return NextResponse.json(await r.json());
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}

export const runtime = "nodejs";
