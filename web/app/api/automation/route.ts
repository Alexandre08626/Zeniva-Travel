import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VPS_BASE = "http://217.216.88.202:8000";
const AUTH = "Bearer zeniva-secret-2025";

type AutomationResult = { agent: string; status: string; message: string; error?: string };

async function callAgent(agentId: string, command: string, payload: Record<string, unknown> = {}): Promise<AutomationResult> {
  try {
    const r = await fetch(`${VPS_BASE}/agent-command`, {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, agent_name: agentId, message: command, ...payload }),
    });
    if (!r.ok) return { agent: agentId, status: "error", message: `VPS returned ${r.status}`, error: await r.text() };
    const data = await r.json();
    return { agent: agentId, status: "ok", message: data?.reply || "done" };
  } catch (err: any) {
    return { agent: agentId, status: "error", message: err?.message || "unreachable", error: err?.stack };
  }
}

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return "no api key";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.7, max_tokens: 500 }),
  });
  if (!r.ok) return "openai error";
  const data = await r.json();
  return data?.choices?.[0]?.message?.content?.trim() || "no reply";
}

function log(msg: string): void {
  console.log(`[AUTOMATION ${new Date().toISOString()}] ${msg}`);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret") || "";
  const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";
  if (auth !== CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const agent = req.nextUrl.searchParams.get("agent") || "all";
  log(`Automation trigger: agent=${agent}`);

  const results: AutomationResult[] = [];

  if (agent === "all" || agent === "travel") {
    try {
      const r = await fetch(`${req.nextUrl.origin}/api/automation/travel`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      const d = await r.json();
      results.push({ agent: "travel", status: d?.status || "ok", message: d?.message || "done" });
    } catch (e: any) { results.push({ agent: "travel", status: "error", message: e?.message }); }
  }
  if (agent === "all" || agent === "agency") {
    try {
      const r = await fetch(`${req.nextUrl.origin}/api/automation/agency`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      const d = await r.json();
      results.push({ agent: "agency", status: d?.status || "ok", message: d?.message || "done" });
    } catch (e: any) { results.push({ agent: "agency", status: "error", message: e?.message }); }
  }
  if (agent === "all" || agent === "zenipay") {
    try {
      const r = await fetch(`${req.nextUrl.origin}/api/automation/zenipay`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      const d = await r.json();
      results.push({ agent: "zenipay", status: d?.status || "ok", message: d?.message || "done" });
    } catch (e: any) { results.push({ agent: "zenipay", status: "error", message: e?.message }); }
  }
  if (agent === "all" || agent === "dev") {
    try {
      const r = await fetch(`${req.nextUrl.origin}/api/automation/dev`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      const d = await r.json();
      results.push({ agent: "dev", status: d?.status || "ok", message: d?.message || "done" });
    } catch (e: any) { results.push({ agent: "dev", status: "error", message: e?.message }); }
  }
  if (agent === "all" || agent === "proposals") {
    try {
      const r = await fetch(`${req.nextUrl.origin}/api/automation/proposals`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      const d = await r.json();
      results.push({ agent: "proposals", status: d?.status || "ok", message: d?.message || "done" });
    } catch (e: any) { results.push({ agent: "proposals", status: "error", message: e?.message }); }
  }
  if (agent === "all" || agent === "onboarding") {
    try {
      const r = await fetch(`${req.nextUrl.origin}/api/automation/onboarding`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
      const d = await r.json();
      results.push({ agent: "onboarding", status: d?.status || "ok", message: d?.message || "done" });
    } catch (e: any) { results.push({ agent: "onboarding", status: "error", message: e?.message }); }
  }

  log(`Automation complete: ${JSON.stringify(results)}`);
  return NextResponse.json({ ts: new Date().toISOString(), agent, results });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
