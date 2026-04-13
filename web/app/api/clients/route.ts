import { NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeEmail } from "../../../src/lib/server/db";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";
import { requireRbacPermission } from "../../../src/lib/server/rbac";

type ClientRecord = {
  id: string;
  name: string;
  email?: string;
  ownerEmail: string;
  phone?: string;
  origin: "house" | "agent" | "web_signup";
  assignedAgents?: string[];
  primaryDivision?: string;
  createdAt: string;
  destination?: string;
  dealValue?: number;
  language?: string;
  source?: string;
  leadStatus?: string;
};

function mapClientRow(row: any, lead?: any): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    ownerEmail: row.owner_email,
    phone: row.phone || lead?.phone || undefined,
    origin: row.origin || "house",
    assignedAgents: row.assigned_agents || [],
    primaryDivision: row.primary_division || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    destination: lead?.destination || undefined,
    dealValue: lead?.deal_value || 0,
    language: lead?.language || undefined,
    source: lead?.source || row.lead_source || undefined,
    leadStatus: lead?.status || undefined,
  };
}

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}

export async function GET(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const accessAll = await requireRbacPermission(request, "clients:all");
    const accessOwn = await requireRbacPermission(request, "clients:own");
    const accessLegacyOwn = await requireRbacPermission(request, "read_own_clients");

    // Fallback: accept session cookie + roles cookie (same pattern as agents-proxy)
    let fallbackAll = false;
    let fallbackOwn = false;
    let fallbackEmail = "";
    if (!accessAll.ok && !accessOwn.ok && !accessLegacyOwn.ok) {
      const cookies = request.headers.get("cookie") || "";
      const sessionCookie = getCookieValue(cookies, "zeniva_session");
      const rolesCookie = decodeURIComponent(getCookieValue(cookies, "zeniva_roles"));
      const emailCookie = decodeURIComponent(getCookieValue(cookies, "zeniva_email"));
      const hasSession = sessionCookie.length > 10;
      if (hasSession && emailCookie) {
        if (rolesCookie.includes("hq") || rolesCookie.includes("admin")) {
          fallbackAll = true;
        } else if (rolesCookie.includes("agent") || rolesCookie.includes("broker") || rolesCookie.includes("influencer")) {
          fallbackOwn = true;
          fallbackEmail = emailCookie;
        }
      }
      if (!fallbackAll && !fallbackOwn) {
        return NextResponse.json({ error: accessAll.error }, { status: accessAll.status });
      }
    }

    // Helper: enrich clients with lead data (destination, deal_value, etc.)
    async function enrichWithLeads(clients: any[]) {
      const emails = clients.map((c) => c.email).filter(Boolean);
      if (!emails.length) return clients.map((c) => mapClientRow(c));
      const { data: leads } = await client
        .from("leads")
        .select("email, destination, deal_value, language, source, status, phone")
        .in("email", emails);
      const leadMap = new Map((leads || []).map((l: any) => [l.email?.toLowerCase(), l]));
      return clients.map((c) => mapClientRow(c, c.email ? leadMap.get(c.email.toLowerCase()) : undefined));
    }

    if (accessAll.ok || fallbackAll) {
      const { data, error } = await client
        .from("clients")
        .select("id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data: await enrichWithLeads(data || []) });
    }

    const ownerEmail = accessOwn.session?.email || accessLegacyOwn.session?.email || fallbackEmail || "";
    const { data, error } = await client
      .from("clients")
      .select("id, name, email, owner_email, phone, origin, assigned_agents, primary_division, lead_source, created_at")
      .or(`owner_email.ilike.${ownerEmail},assigned_agents.cs.["${ownerEmail}"]`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: await enrichWithLeads(data || []) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const accessAll = await requireRbacPermission(request, "clients:all");
    const accessOwn = await requireRbacPermission(request, "clients:own");
    const accessLegacyOwn = await requireRbacPermission(request, "read_own_clients");
    if (!accessAll.ok && !accessOwn.ok && !accessLegacyOwn.ok) {
      return NextResponse.json({ error: accessAll.error }, { status: accessAll.status });
    }
    const body = await request.json();
    const required = ["name", "ownerEmail", "origin"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const name = String(body.name).trim() || "Client";
    const email = body.email ? normalizeEmail(String(body.email)) : undefined;
    const ownerEmail = normalizeEmail(String(body.ownerEmail));
    if (!accessAll.ok) {
      const sessionEmail = accessOwn.session?.email
        ? normalizeEmail(accessOwn.session.email)
        : accessLegacyOwn.session?.email
          ? normalizeEmail(accessLegacyOwn.session.email)
          : "";
      if (!sessionEmail || sessionEmail !== ownerEmail) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const origin = body.origin === "agent" ? "agent" : body.origin === "web_signup" ? "web_signup" : "house";
    const assignedAgents = Array.isArray(body.assignedAgents) ? body.assignedAgents : [];
    const primaryDivision = body.primaryDivision ? String(body.primaryDivision) : undefined;

    if (email) {
      const { data: existingData, error: existingError } = await client
        .from("clients")
        .select("id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existingData) {
        return NextResponse.json({ data: mapClientRow(existingData) });
      }
    }

    const id = body.id || `C-${crypto.randomUUID()}`;
    const { data: insertedData, error: insertError } = await client
      .from("clients")
      .insert({
        id,
        name,
        email: email || null,
        owner_email: ownerEmail,
        phone: phone || null,
        origin,
        assigned_agents: assignedAgents || [],
        primary_division: primaryDivision || null,
        created_at: new Date().toISOString(),
      })
      .select("id, name, email, owner_email, phone, origin, assigned_agents, primary_division, created_at")
      .single();
    if (insertError) throw insertError;
    const record = mapClientRow(insertedData);
    console.log(`CLIENT CREATED: id=${record.id} email=${record.email || ""}`);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save client" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
