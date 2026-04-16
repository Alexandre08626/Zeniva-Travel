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
    // Try VPS first
    try {
      const auth = req.headers.get("Authorization") || AUTH;
      const forwardParams = new URLSearchParams();
      req.nextUrl.searchParams.forEach((v, k) => { if (k !== "path") forwardParams.set(k, v); });
      const qs = forwardParams.toString() ? `?${forwardParams.toString()}` : "";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const r = await fetch(`${VPS_BASE}/${pathParam}${qs}`, { headers: { Authorization: auth }, signal: controller.signal, next: { revalidate: 0 } });
      clearTimeout(timeout);
      if (r.ok) return NextResponse.json(await r.json());
    } catch { /* VPS down — fallback to Supabase */ }

    // Supabase fallback for all admin paths
    try {
      const { getSupabaseAdminClient } = await import("@/src/lib/supabase/server");
      const { client: sb } = getSupabaseAdminClient();
      const agentEmail = req.nextUrl.searchParams.get("agent_email") || "";

      if (pathParam === "admin/all-clients" || pathParam === "admin/clients") {
        if (agentEmail) {
          // Check if this agent is an influencer
          const { data: agentAccount } = await sb.from("accounts").select("role").eq("email", agentEmail.toLowerCase()).maybeSingle();
          const isInfluencer = agentAccount?.role === "influencer";

          if (isInfluencer) {
            // For influencers: only show clients they referred
            const { buildInfluencerCode } = await import("@/src/lib/influencerShared");
            const infCode = buildInfluencerCode(agentEmail);

            // Get referred emails from influencer_referrals
            const { data: referrals } = await sb.from("influencer_referrals").select("traveler_email").eq("referral_code", infCode);
            // Get referred emails from clients.lead_source
            const { data: refClients } = await sb.from("clients").select("email").ilike("lead_source", `influencer:${agentEmail}`);

            const referredEmails = new Set([
              ...(referrals || []).map((r: any) => r.traveler_email?.toLowerCase()).filter(Boolean),
              ...(refClients || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean),
            ]);

            if (referredEmails.size === 0) {
              return NextResponse.json({ clients: [] });
            }

            const { data } = await sb.from("accounts").select("*").in("email", [...referredEmails]).order("created_at", { ascending: false });
            return NextResponse.json({ clients: (data || []).map((a: any) => ({ id: a.id, name: a.name, email: a.email, phone: "", role: a.role, roles: a.roles, status: a.status, source: "referral", created_at: a.created_at })) });
          }

          // For regular agents: show clients they own
          const { data } = await sb.from("clients").select("id, name, email, phone, origin, lead_source, created_at").eq("owner_email", agentEmail.toLowerCase()).order("created_at", { ascending: false });
          return NextResponse.json({ clients: (data || []).map((c: any) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone || "", role: "client", roles: [], status: "active", source: c.lead_source || c.origin || "agent", created_at: c.created_at })) });
        }

        // No agent_email filter: return all (HQ view)
        const { data } = await sb.from("accounts").select("*").eq("status", "active").order("created_at", { ascending: false });
        return NextResponse.json({ clients: (data || []).map((a: any) => ({ id: a.id, name: a.name, email: a.email, phone: "", role: a.role, roles: a.roles, status: a.status, source: "signup", created_at: a.created_at })) });
      }
      if (pathParam === "admin/leads") {
        const { data } = await sb.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
        const total = data?.length || 0;
        return NextResponse.json({ leads: data || [], total });
      }
      if (pathParam === "admin/agents-list") {
        // Load from both agents table AND accounts table (merge, deduplicate)
        const [agentsResult, accountsResult] = await Promise.all([
          sb.from("agents").select("*").order("created_at", { ascending: false }),
          sb.from("accounts").select("*").or("role.eq.travel_agent,role.eq.yacht_broker,role.eq.hq,role.eq.admin,role.eq.influencer").neq("status", "blocked").order("created_at", { ascending: false }),
        ]);
        const agentsList = (agentsResult.data || []).map((a: any) => ({
          id: a.id, name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.email, email: a.email,
          first_name: a.first_name || "", last_name: a.last_name || "",
          agent_type: a.agent_type || "agent", status: a.status || "active",
          commission_rate: Number(a.commission_rate) || 0, ref_code: a.ref_code || "",
          leads_count: 0, role: a.agent_type, roles: a.roles || [],
        }));
        // Add accounts that aren't already in agents table
        const existingEmails = new Set(agentsList.map((a: any) => (a.email || "").toLowerCase()));
        for (const a of (accountsResult.data || [])) {
          if (!existingEmails.has((a.email || "").toLowerCase())) {
            agentsList.push({
              id: a.id, name: a.name || a.email, email: a.email,
              first_name: (a.name || "").split(" ")[0] || "", last_name: (a.name || "").split(" ").slice(1).join(" ") || "",
              agent_type: a.role || "agent", status: a.status || "active",
              commission_rate: 0, ref_code: "", leads_count: 0, role: a.role, roles: a.roles || [],
            });
            existingEmails.add((a.email || "").toLowerCase());
          }
        }
        return NextResponse.json({ agents: agentsList });
      }
      if (pathParam === "admin/dashboard-stats") {
        const [accounts, leads, leadsB, comms] = await Promise.all([
          sb.from("accounts").select("*", { count: "exact", head: true }).eq("status", "active"),
          sb.from("leads").select("*", { count: "exact", head: true }),
          sb.from("leads_business").select("*", { count: "exact", head: true }),
          sb.from("comms_log").select("*", { count: "exact", head: true }),
        ]);
        return NextResponse.json({ total_clients: accounts.count || 0, total_leads: (leads.count || 0) + (leadsB.count || 0), leads_today: 0, total_messages: comms.count || 0 });
      }
      if (pathParam === "admin/bookings") {
        const { data } = await sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(50);
        return NextResponse.json({ bookings: data || [] });
      }
      if (pathParam === "admin/commissions") {
        let q = sb.from("commissions").select("*").order("created_at", { ascending: false }).limit(100);
        if (agentEmail) q = q.ilike("agent_email", agentEmail);
        const { data } = await q;
        return NextResponse.json({ commissions: data || [] });
      }
      if (pathParam === "admin/dossiers") {
        const { data } = await sb.from("dossiers").select("*").order("created_at", { ascending: false }).limit(50);
        return NextResponse.json({ dossiers: data || [] });
      }
      if (pathParam === "admin/listings") {
        const { data } = await sb.from("listings").select("*").order("created_at", { ascending: false });
        return NextResponse.json({ listings: data || [] });
      }
      if (pathParam === "admin/health") {
        return NextResponse.json({ status: "ok", vps: "offline", supabase: "ok", mode: "supabase-fallback" });
      }
      if (pathParam.startsWith("admin/client-profile/")) {
        const email = decodeURIComponent(pathParam.replace("admin/client-profile/", ""));
        const { data } = await sb.from("accounts").select("*").ilike("email", email).maybeSingle();
        return NextResponse.json({ profile: data || null, dossiers: [], notes: [], conversations: [] });
      }
      if (pathParam.startsWith("admin/agent-profile/")) {
        const email = decodeURIComponent(pathParam.replace("admin/agent-profile/", ""));
        const { data } = await sb.from("accounts").select("*").ilike("email", email).maybeSingle();
        return NextResponse.json({ agent: data || null, stats: { total_clients: 0, total_leads: 0, total_bookings: 0 } });
      }
      if (pathParam.startsWith("admin/clients/")) {
        const email = decodeURIComponent(pathParam.replace("admin/clients/", ""));
        const { data } = await sb.from("accounts").select("*").ilike("email", email).maybeSingle();
        return NextResponse.json({ client: data || null });
      }
      if (pathParam === "admin/client-notes") {
        return NextResponse.json({ notes: [] });
      }
      // Default: return empty for unknown paths
      return NextResponse.json({ data: [], message: "VPS offline, no Supabase fallback for: " + pathParam });
    } catch (sbErr: any) {
      return NextResponse.json({ error: "VPS offline & Supabase fallback failed: " + (sbErr?.message || "") }, { status: 502 });
    }
  }

  const endpoint = req.nextUrl.searchParams.get("endpoint") || "health";

  try {
    if (endpoint === "health") {
      // VPS /health returns n8n HTML, not JSON. Check multiple endpoints instead.
      let apiOk = false;
      let dbOk = false;
      let linaOk = false;
      try {
        const r = await fetch(`${VPS_BASE}/admin/stats`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
        if (r.ok) { apiOk = true; const d = await r.json(); if (d?.total_leads !== undefined) dbOk = true; }
      } catch {}
      try {
        const r = await fetch(`${VPS_BASE}/chat`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify({ message: "ping", sessionId: "health-check", source: "health" }) });
        if (r.ok) linaOk = true;
      } catch {}
      return NextResponse.json({ status: apiOk ? "healthy" : "offline", supabase: dbOk ? "ok" : "error", lina: linaOk ? "online" : "offline" });
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
    // Get influencer accounts from Supabase with lead counts
    if (endpoint === "influencers") {
      const { getSupabaseAdminClient } = await import("../../../src/lib/supabase/server");
      const { buildInfluencerCode } = await import("../../../src/lib/influencerShared");
      const { client } = getSupabaseAdminClient();
      const { data } = await client
        .from("accounts")
        .select("id, name, email, role, roles, status, created_at")
        .eq("role", "influencer")
        .neq("status", "blocked")
        .order("created_at", { ascending: false });

      // Count leads per influencer (from referral_leads + referrals + clients with lead_source)
      const agents = await Promise.all((data || []).map(async (row: any) => {
        const infCode = buildInfluencerCode(row.email);
        let leadsCount = 0;
        try {
          // Count from influencer_referral_leads (form submissions)
          const { count: formLeads } = await client
            .from("influencer_referral_leads")
            .select("id", { count: "exact", head: true })
            .eq("referral_code", infCode);
          // Count from influencer_referrals (signup referrals)
          const { count: signupLeads } = await client
            .from("influencer_referrals")
            .select("id", { count: "exact", head: true })
            .eq("referral_code", infCode);
          // Count from clients table (lead_source tracks influencer)
          const { count: clientLeads } = await client
            .from("clients")
            .select("id", { count: "exact", head: true })
            .ilike("lead_source", `influencer:${row.email}`);
          leadsCount = (formLeads || 0) + (signupLeads || 0) + Math.max((clientLeads || 0) - (signupLeads || 0), 0);
        } catch { /* ignore count errors */ }

        return {
          id: row.id,
          name: row.name || "Influencer",
          email: row.email,
          agent_type: "influencer",
          status: row.status || "active",
          leads_count: leadsCount,
          commission_rate: 5,
          ref_code: infCode,
          created_at: row.created_at,
        };
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
