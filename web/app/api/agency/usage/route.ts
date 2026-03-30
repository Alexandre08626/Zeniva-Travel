import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = verifySession(t);
  if (!s?.email) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  const { client } = getSupabaseAdminClient();
  const { data: profile } = await client.from("profiles").select("id, agency_id").eq("account_email", s.email).single();
  if (!profile?.agency_id) return NextResponse.json({ error: "No agency" }, { status: 403 });
  const now = new Date();
  const start = req.nextUrl.searchParams.get("start") || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = req.nextUrl.searchParams.get("end") || new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const { data: logs } = await client.from("api_usage_logs").select("service, quantity, unit_cost, unit_price, created_at").eq("agency_id", profile.agency_id).gte("created_at", start).lt("created_at", end);
  const svcMap = new Map<string, { quantity: number; cost: number; price: number }>();
  const dayMap = new Map<string, { quantity: number; price: number }>();
  for (const l of logs || []) {
    const e = svcMap.get(l.service) || { quantity: 0, cost: 0, price: 0 };
    e.quantity += l.quantity; e.cost += parseFloat(l.unit_cost) * l.quantity; e.price += parseFloat(l.unit_price) * l.quantity;
    svcMap.set(l.service, e);
    const d = l.created_at.split("T")[0];
    const de = dayMap.get(d) || { quantity: 0, price: 0 };
    de.quantity += l.quantity; de.price += parseFloat(l.unit_price) * l.quantity;
    dayMap.set(d, de);
  }
  const services = Array.from(svcMap.entries()).map(([service, data]: [string, any]) => ({ service, ...data }));
  const daily = Array.from(dayMap.entries()).map(([date, data]: [string, any]) => ({ date, ...data })).sort((a: any, b: any) => a.date.localeCompare(b.date));
  const total = services.reduce((s: number, x: any) => s + x.price, 0);
  return NextResponse.json({ ok: true, services, daily, total, period: { start, end } });
}
