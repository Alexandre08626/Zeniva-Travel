/**
 * GET /api/zenipay/bank-balance
 * Returns real-time Unit.co bank account balance + card info
 * This replaces the "wallet balance" concept — the bank IS the wallet
 */
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const UNIT_URL = () => process.env.UNIT_API_URL || "https://api.s.unit.co";
const UNIT_TOKEN = () => process.env.UNIT_API_TOKEN || "";

export async function GET() {
  const token = UNIT_TOKEN();
  if (!token) {
    return Response.json({ error: "UNIT_API_TOKEN not configured" }, { status: 500 });
  }

  try {
    // Get accounts from Unit.co directly
    const res = await fetch(`${UNIT_URL()}/accounts?filter[status]=Open`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/vnd.api+json" },
    });

    if (!res.ok) {
      const t = await res.text();
      return Response.json({ error: `Unit API error: ${t.slice(0,200)}` }, { status: 500 });
    }

    const data = await res.json();
    const accounts = (data.data || []).map((a: Record<string, unknown>) => {
      const attr = a.attributes as Record<string,unknown> || {};
      return {
        id: a.id,
        type: a.type,
        name: "Zeniva Travel LLC",
        status: attr.status || "Unknown",
        balanceCents: (attr.balance as number) || 0,
        availableCents: (attr.available as number) || (attr.balance as number) || 0,
        routingNumber: (attr.routingNumber as string) || "",
        accountNumber: (attr.accountNumber as string) || "",
        currency: (attr.currency as string) || "USD",
        createdAt: (attr.createdAt as string) || "",
      };
    });

    // Also get cards
    const cardRes = await fetch(`${UNIT_URL()}/cards?filter[status]=Active`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/vnd.api+json" },
    });
    let cards: unknown[] = [];
    if (cardRes.ok) {
      const cd = await cardRes.json();
      cards = cd.data || [];
    }

    return Response.json({ accounts, cards, token_ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
