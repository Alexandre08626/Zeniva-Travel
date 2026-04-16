import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sendEmail } from "../../../../src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const VPS_BASE = "http://217.216.88.202:8000";
const VPS_AUTH = "Bearer zeniva-secret-2025";

type LeadCategory = "travelers" | "agencies" | "agents";

interface VPSLead {
  id: string;
  url: string;
  post: string;
  name: string;
  score: number;
  intent: string;
  destination: string;
  type: string;
  summary: string;
  outreach: string;
  source: string;
  platform: string;
  found_at: string;
}

/**
 * Scan VPS for real leads from social media (Facebook, Reddit, etc.)
 */
async function scanRealLeads(audience: LeadCategory): Promise<VPSLead[]> {
  try {
    const res = await fetch(`${VPS_BASE}/social-leads/scan`, {
      method: "POST",
      headers: { Authorization: VPS_AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ audience, source: "marco-auto" }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.leads) ? data.leads : [];
  } catch {
    return [];
  }
}

/**
 * Extract a usable name from VPS lead (falls back to profile URL parsing)
 */
function extractName(lead: VPSLead): { first: string; last: string } {
  const raw = lead.name || "";
  if (raw && raw !== "N/A" && raw !== "unknown" && raw !== "not specified") {
    const parts = raw.split(" ");
    return { first: parts[0], last: parts.slice(1).join(" ") || "" };
  }
  // Try to extract from Facebook URL: /username/posts/...
  const match = lead.url?.match(/facebook\.com\/([^/]+)/);
  if (match && match[1] !== "groups") {
    const username = match[1].replace(/\./g, " ").replace(/\d+/g, "").trim();
    const parts = username.split(" ").filter(Boolean);
    if (parts.length >= 1) {
      return { first: parts[0].charAt(0).toUpperCase() + parts[0].slice(1), last: parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") };
    }
  }
  return { first: "Unknown", last: "" };
}

/**
 * Deduplicate leads by post URL to avoid saving the same post twice
 */
function dedupeByUrl(leads: VPSLead[]): VPSLead[] {
  const seen = new Set<string>();
  return leads.filter(l => {
    const key = l.url || l.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(req: NextRequest) {
  try {
    // Auth: n8n webhook secret, cron secret, or session cookie
    const authHeader = req.headers.get("authorization") || "";
    const cronSecret = process.env.CRON_SECRET;
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isN8n = authHeader === `Bearer ${n8nSecret}`;
    const cookies = req.headers.get("cookie") || "";
    const hasSession = cookies.includes("zeniva_session=");

    if (!isCron && !isN8n && !hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const scanTravelers = body.travelers !== 0;
    const scanAgencies = body.agencies !== 0;
    const scanAgents = body.agents !== 0;

    // Scan REAL leads from VPS (Facebook, Reddit, etc.)
    const rawTravelers = scanTravelers ? await scanRealLeads("travelers") : [];
    const rawAgencies = scanAgencies ? await scanRealLeads("agencies") : [];
    const rawAgents = scanAgents ? await scanRealLeads("agents") : [];

    const travelers = dedupeByUrl(rawTravelers);
    const agencies = dedupeByUrl(rawAgencies);
    const agents = dedupeByUrl(rawAgents);

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let savedTravelers = 0;
    let savedAgencies = 0;
    let savedAgents = 0;

    // Save travelers to leads table
    for (const l of travelers) {
      const { first, last } = extractName(l);
      try {
        // Use post URL as unique identifier to prevent duplicates
        const { data: existing } = await client
          .from("leads")
          .select("id")
          .eq("source_ref", l.url)
          .limit(1);
        if (existing && existing.length > 0) continue;

        const { error } = await client.from("leads").insert({
          first_name: first,
          last_name: last,
          destination: l.destination || "",
          deal_value: l.score >= 8 ? 15000 : l.score >= 6 ? 8000 : 3000,
          language: "en",
          status: "new",
          source: `prospecting:${l.platform || l.source || "social"}`,
          source_ref: l.url,
          created_at: now,
        });
        if (!error) savedTravelers++;
      } catch { /* skip */ }
    }

    // Save agencies to leads_business table
    for (const l of agencies) {
      const { first, last } = extractName(l);
      try {
        const { data: existing } = await client
          .from("leads_business")
          .select("id")
          .eq("website", l.url)
          .limit(1);
        if (existing && existing.length > 0) continue;

        const { error } = await client.from("leads_business").insert({
          type: "travel_agency",
          contact_name: `${first} ${last}`.trim(),
          company_name: "",
          website: l.url,
          status: "new",
          source: `prospecting:${l.platform || l.source || "social"}`,
          priority: l.score >= 8 ? "high" : "medium",
          estimated_setup_value: 1999,
          estimated_monthly_value: 399,
          notes: `${l.summary}\n\nOriginal post: ${l.post?.slice(0, 300)}`,
          created_at: now,
        });
        if (!error) savedAgencies++;
      } catch { /* skip */ }
    }

    // Save independent agents to leads_business table
    for (const l of agents) {
      const { first, last } = extractName(l);
      try {
        const { data: existing } = await client
          .from("leads_business")
          .select("id")
          .eq("website", l.url)
          .limit(1);
        if (existing && existing.length > 0) continue;

        const { error } = await client.from("leads_business").insert({
          type: "travel_agent",
          contact_name: `${first} ${last}`.trim(),
          company_name: "Independent",
          website: l.url,
          status: "new",
          source: `prospecting:${l.platform || l.source || "social"}`,
          priority: l.score >= 8 ? "high" : "medium",
          estimated_setup_value: 199,
          estimated_monthly_value: 97,
          notes: `${l.summary}\n\nOriginal post: ${l.post?.slice(0, 300)}`,
          created_at: now,
        });
        if (!error) savedAgents++;
      } catch { /* skip */ }
    }

    const totalSaved = savedTravelers + savedAgencies + savedAgents;

    // Email report to HQ (no auto-outreach to leads — they don't have email/phone)
    if (totalSaved > 0) {
      const leadSummaries = [...travelers, ...agencies, ...agents]
        .slice(0, 10)
        .map(l => `<li style="margin-bottom:8px;font-size:13px;color:#334155;"><strong>${l.destination || l.type || "Travel"}</strong> — ${l.summary?.slice(0, 120)} <a href="${l.url}" style="color:#0F6CF5;">[Post]</a></li>`)
        .join("");

      const reportHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#ef4444;">🔥 Marco — Daily Hunt Report</h2>
          <p style="color:#64748b;font-size:13px;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0;">
            <div style="background:#EFF6FF;border-radius:12px;padding:16px;text-align:center;">
              <p style="font-size:24px;font-weight:900;color:#0F6CF5;">${savedTravelers}</p>
              <p style="font-size:11px;color:#6B7280;">Travelers</p>
            </div>
            <div style="background:#F0FDF4;border-radius:12px;padding:16px;text-align:center;">
              <p style="font-size:24px;font-weight:900;color:#10B981;">${savedAgencies}</p>
              <p style="font-size:11px;color:#6B7280;">Agencies</p>
            </div>
            <div style="background:#FEF3C7;border-radius:12px;padding:16px;text-align:center;">
              <p style="font-size:24px;font-weight:900;color:#F59E0B;">${savedAgents}</p>
              <p style="font-size:11px;color:#6B7280;">Agents</p>
            </div>
          </div>
          <h3 style="color:#1e293b;font-size:14px;margin:20px 0 8px;">Top Leads Found:</h3>
          <ul style="padding-left:16px;">${leadSummaries}</ul>
          <p style="color:#1e293b;font-size:14px;line-height:1.6;margin-top:16px;">
            ${totalSaved} real leads from social media. Review & reach out at
            <a href="https://www.zenivatravel.com/agent/leads" style="color:#0F6CF5;font-weight:bold;">Leads Page</a>.
          </p>
          <p style="color:#94a3b8;font-size:12px;margin-top:20px;">Marco Lead Hunter · Real social media scanning · Automated via n8n</p>
        </div>`;

      await sendEmail({
        to: "info@zenivatravel.com",
        fromName: "Marco — Zeniva Lead Hunter",
        subject: `🔥 ${totalSaved} real leads found — ${new Date().toLocaleDateString("en-CA")}`,
        html: reportHtml,
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      saved: { travelers: savedTravelers, agencies: savedAgencies, agents: savedAgents, total: totalSaved },
      scanned: { travelers: travelers.length, agencies: agencies.length, agents: agents.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Prospecting failed" }, { status: 500 });
  }
}
