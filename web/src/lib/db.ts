import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file: string): any[] {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function writeJSON(file: string, data: any[]) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

let _supabase: any = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export async function checkSupabase(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from("leads").select("id", { count: "exact", head: true }).limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function insertLead(lead: any): Promise<{ data?: any; error?: string }> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("leads").insert(lead).select().single();
      if (!error && data) return { data };
    } catch {}
  }
  const leads = readJSON(LEADS_FILE);
  const entry = { id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...lead, _savedAt: new Date().toISOString(), _synced: false };
  leads.push(entry);
  writeJSON(LEADS_FILE, leads);
  return { data: entry };
}

export async function getLeads(filter?: { lead_type?: string; outreach_status?: string; minEmailCount?: number }): Promise<any[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let q = sb.from("leads").select("*");
      if (filter?.lead_type) q = q.eq("lead_type", filter.lead_type);
      if (filter?.outreach_status) q = q.eq("outreach_status", filter.outreach_status);
      if (filter?.minEmailCount) q = q.gte("email_count", filter.minEmailCount);
      const { data } = await q.limit(50);
      if (data && data.length > 0) return data;
    } catch {}
  }
  let leads = readJSON(LEADS_FILE);
  if (filter?.lead_type) leads = leads.filter((l: any) => l.lead_type === filter.lead_type);
  if (filter?.outreach_status) leads = leads.filter((l: any) => l.outreach_status === filter.outreach_status);
  if (filter?.minEmailCount) leads = leads.filter((l: any) => (l.email_count || 0) >= filter.minEmailCount!);
  return leads;
}

export async function updateLead(id: string, updates: any): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("leads").update(updates).eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const leads = readJSON(LEADS_FILE);
  const idx = leads.findIndex((l: any) => l.id === id);
  if (idx >= 0) {
    leads[idx] = { ...leads[idx], ...updates, _synced: false };
    writeJSON(LEADS_FILE, leads);
    return true;
  }
  return false;
}

export async function insertMessage(msg: any): Promise<{ data?: any; error?: string }> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("outreach_messages").insert(msg).select().single();
      if (!error && data) return { data };
    } catch {}
  }
  const msgs = readJSON(MESSAGES_FILE);
  const entry = { id: `local_msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...msg, _savedAt: new Date().toISOString(), _synced: false };
  msgs.push(entry);
  writeJSON(MESSAGES_FILE, msgs);
  return { data: entry };
}

export async function getMessages(filter?: { channel?: string; status?: string; lead_id?: string; limit?: number; offset?: number }): Promise<{ data: any[]; total: number }> {
  const sb = getSupabase();
  if (sb) {
    try {
      let q = sb.from("outreach_messages").select("*", { count: "exact" });
      if (filter?.channel) q = q.eq("channel", filter.channel);
      if (filter?.status) q = q.eq("status", filter.status);
      if (filter?.lead_id) q = q.eq("lead_id", filter.lead_id);
      q = q.order("created_at", { ascending: false }).limit(filter?.limit || 100);
      const { data, count } = await q;
      if (data && data.length > 0) return { data, total: count || data.length };
    } catch {}
  }
  let msgs = readJSON(MESSAGES_FILE);
  if (filter?.channel) msgs = msgs.filter((m: any) => m.channel === filter.channel);
  if (filter?.status) msgs = msgs.filter((m: any) => m.status === filter.status);
  if (filter?.lead_id) msgs = msgs.filter((m: any) => m.lead_id === filter.lead_id);
  msgs.sort((a: any, b: any) => new Date(b.created_at || b._savedAt).getTime() - new Date(a.created_at || a._savedAt).getTime());
  return { data: msgs.slice(filter?.offset || 0, (filter?.offset || 0) + (filter?.limit || 100)), total: msgs.length };
}

export async function log(agent: string, message: string, status: string = "info") {
  const entry = { agent, status, message, ts: new Date().toISOString() };
  const logs = readJSON(LOGS_FILE);
  logs.push(entry);
  if (logs.length > 1000) logs.splice(0, logs.length - 1000);
  writeJSON(LOGS_FILE, logs);
  console.log(`[${agent}] ${message}`);

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("automation_logs").insert(entry);
    } catch {}
  }
}
