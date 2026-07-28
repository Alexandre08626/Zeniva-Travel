import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), ".data");

export async function GET() {
  const leadsFile = path.join(DATA_DIR, "leads.json");
  const logsFile = path.join(DATA_DIR, "logs.json");
  const messagesFile = path.join(DATA_DIR, "messages.json");

  const leads: any[] = [];
  const logs: any[] = [];
  const messages: any[] = [];

  if (fs.existsSync(leadsFile)) {
    try { leads.push(...JSON.parse(fs.readFileSync(leadsFile, "utf-8"))); } catch {}
  }
  if (fs.existsSync(logsFile)) {
    try { logs.push(...JSON.parse(fs.readFileSync(logsFile, "utf-8"))); } catch {}
  }
  if (fs.existsSync(messagesFile)) {
    try { messages.push(...JSON.parse(fs.readFileSync(messagesFile, "utf-8"))); } catch {}
  }

  const stats = {
    total_leads: leads.length,
    by_type: {} as Record<string, number>,
    by_status: {} as Record<string, number>,
    total_messages: messages.length,
    total_logs: logs.length,
  };

  for (const l of leads) {
    stats.by_type[l.lead_type] = (stats.by_type[l.lead_type] || 0) + 1;
    stats.by_status[l.outreach_status] = (stats.by_status[l.outreach_status] || 0) + 1;
  }

  return NextResponse.json({
    stats,
    leads: leads.map((l: any) => ({
      id: l.id,
      type: l.lead_type,
      name: l.name,
      company: l.company || l.agency || "",
      email_count: l.email_count,
      phone: l.phone,
      country: l.country,
      destination: l.destination || "",
      status: l.outreach_status,
      budget: l.budget || "",
      created: l.created_at || l._savedAt,
    })),
    logs: logs.slice(-20).reverse(),
    messages: messages.map((m: any) => ({
      id: m.id,
      channel: m.channel,
      recipient: m.recipient,
      status: m.status,
      body_preview: m.body?.substring(0, 100),
      error: m.error || null,
      sent_at: m.sent_at || m.created_at,
    })),
  });
}
