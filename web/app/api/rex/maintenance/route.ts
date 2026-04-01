import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

interface Finding {
  category: string;
  severity: "info" | "warning" | "critical";
  message: string;
  detail?: string;
}

export async function GET(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const findings: Finding[] = [];
  const startTime = Date.now();

  // 1. Check Supabase connectivity
  try {
    const { client } = getSupabaseAdminClient();
    const { error } = await client.from("leads").select("id", { count: "exact", head: true });
    if (error) {
      findings.push({ category: "Database", severity: "critical", message: "Supabase connection failed", detail: error.message });
    } else {
      findings.push({ category: "Database", severity: "info", message: "Supabase connection OK" });
    }
  } catch (e: any) {
    findings.push({ category: "Database", severity: "critical", message: "Supabase unreachable", detail: e?.message });
  }

  // 2. Check table health — row counts
  try {
    const { client } = getSupabaseAdminClient();
    const tables = [
      { name: "leads", label: "Traveler Leads" },
      { name: "leads_business", label: "Business Leads" },
      { name: "agents", label: "Agents" },
      { name: "profiles", label: "Profiles" },
      { name: "comms_log", label: "Communications Log" },
      { name: "email_campaigns", label: "Email Campaigns" },
      { name: "email_templates", label: "Email Templates" },
      { name: "email_campaign_recipients", label: "Campaign Recipients" },
    ];

    for (const t of tables) {
      const { count, error } = await client.from(t.name).select("id", { count: "exact", head: true });
      if (error) {
        findings.push({ category: "Database", severity: "warning", message: `Table ${t.label} error`, detail: error.message });
      } else {
        findings.push({ category: "Database", severity: "info", message: `${t.label}: ${count ?? 0} rows` });
      }
    }
  } catch { /* silent */ }

  // 3. Check for orphaned campaign recipients (campaign deleted but recipients remain)
  try {
    const { client } = getSupabaseAdminClient();
    const { data: orphans } = await client.rpc("", {}).catch(() => ({ data: null })) as any;
    // Simple check: campaigns with status 'sending' for more than 1 hour (stuck)
    const { data: stuckCampaigns } = await client
      .from("email_campaigns")
      .select("id, name, status, updated_at")
      .eq("status", "sending");

    if (stuckCampaigns && stuckCampaigns.length > 0) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const stuck = stuckCampaigns.filter((c: any) => c.updated_at < oneHourAgo);
      if (stuck.length > 0) {
        findings.push({
          category: "Campaigns",
          severity: "warning",
          message: `${stuck.length} campaign(s) stuck in "sending" status`,
          detail: stuck.map((c: any) => c.name).join(", "),
        });
      }
    }
  } catch { /* silent */ }

  // 4. Check for failed campaign recipients that could be retried
  try {
    const { client } = getSupabaseAdminClient();
    const { count } = await client
      .from("email_campaign_recipients")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed");

    if (count && count > 0) {
      findings.push({
        category: "Campaigns",
        severity: "warning",
        message: `${count} failed email recipient(s) across all campaigns`,
        detail: "These can be retried from the campaign detail view",
      });
    }
  } catch { /* silent */ }

  // 5. Check for leads without email
  try {
    const { client } = getSupabaseAdminClient();
    const { count: noEmailLeads } = await client
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("email", null);

    const { count: noEmailBiz } = await client
      .from("leads_business")
      .select("id", { count: "exact", head: true })
      .is("contact_email", null);

    if ((noEmailLeads ?? 0) > 0) {
      findings.push({ category: "Data Quality", severity: "warning", message: `${noEmailLeads} traveler lead(s) without email` });
    }
    if ((noEmailBiz ?? 0) > 0) {
      findings.push({ category: "Data Quality", severity: "warning", message: `${noEmailBiz} business lead(s) without email` });
    }
  } catch { /* silent */ }

  // 6. Check API routes health
  const apiChecks = [
    { path: "/api/outreach/campaigns", label: "Outreach Campaigns" },
    { path: "/api/outreach/templates", label: "Outreach Templates" },
    { path: "/api/rex/health-check", label: "Rex Health Check" },
    { path: "/api/rex/dashboard-stats", label: "Rex Dashboard Stats" },
  ];

  const baseUrl = req.headers.get("host") || "localhost:3000";
  const protocol = baseUrl.includes("localhost") ? "http" : "https";

  for (const check of apiChecks) {
    try {
      const r = await fetch(`${protocol}://${baseUrl}${check.path}`, {
        headers: { cookie: req.headers.get("cookie") || "" },
      });
      if (r.ok) {
        findings.push({ category: "API Routes", severity: "info", message: `${check.label}: OK (${r.status})` });
      } else {
        findings.push({ category: "API Routes", severity: "warning", message: `${check.label}: ${r.status}`, detail: `HTTP ${r.status}` });
      }
    } catch (e: any) {
      findings.push({ category: "API Routes", severity: "critical", message: `${check.label}: unreachable`, detail: e?.message });
    }
  }

  // 7. Environment variable checks
  const requiredEnvs = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXTAUTH_SECRET",
  ];

  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      findings.push({ category: "Environment", severity: "critical", message: `Missing env var: ${env}` });
    } else {
      findings.push({ category: "Environment", severity: "info", message: `${env}: configured` });
    }
  }

  // Summary
  const duration = Date.now() - startTime;
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;

  const overallStatus = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "healthy";

  return NextResponse.json({
    ok: true,
    status: overallStatus,
    summary: {
      critical: criticalCount,
      warnings: warningCount,
      passed: infoCount,
      duration_ms: duration,
      checked_at: new Date().toISOString(),
    },
    findings,
  });
}
