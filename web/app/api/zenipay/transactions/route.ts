export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ transactions: [] });

  try {
    // Read from zenipay_payments table
    const { data: tablePays } = await supabase
      .from("zenipay_payments")
      .select("id, amount, status, created_at, customer_name, currency, description")
      .order("created_at", { ascending: false })
      .limit(100);

    // Also read from merchant_data.transactions (ZeniPay /pay/[id] payments)
    const { data: merchants } = await supabase
      .from("zenipay_merchants")
      .select("merchant_data");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mdTxns: any[] = [];
    for (const m of (merchants || [])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txns: any[] = Array.isArray(m.merchant_data?.transactions) ? m.merchant_data.transactions : [];
      for (const t of txns) mdTxns.push(t);
    }

    // Merge & deduplicate
    const existingIds = new Set((tablePays || []).map((p: { id: string }) => p.id));
    const merged = [
      ...(tablePays || []).map((p: { id: string; amount: number; status: string; created_at: string; customer_name: string; currency: string; description: string }) => ({
        id: p.id, customerName: p.customer_name || "—", amount: Number(p.amount),
        currency: p.currency || "USD", status: p.status === "succeeded" ? "completed" : p.status,
        paymentMethod: "Card", gateway: "ZeniPay",
        description: p.description || "", createdAt: p.created_at,
      })),
      ...mdTxns.filter(t => !existingIds.has(t.id)).map(t => ({
        id: t.id, customerName: t.customer_name || "—", amount: Number(t.amount),
        currency: t.currency || "USD", status: t.status === "succeeded" ? "completed" : (t.status || "completed"),
        paymentMethod: t.card_last4 ? `Card ···· ${t.card_last4}` : "Card", gateway: "ZeniPay",
        description: t.description || "", createdAt: t.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ transactions: merged });
  } catch (err) {
    console.error("[ZeniPay Transactions]", err);
    return NextResponse.json({ transactions: [] });
  }
}
