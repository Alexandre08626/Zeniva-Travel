export const dynamic = "force-dynamic";

/**
 * ZeniPay — Get Payment by ID
 * GET /api/zenipay/payments/[paymentId]
 */

import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(
  _request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return Response.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }

    // Fetch payment record
    const { data: payment, error: paymentErr } = await supabase
      .from("zenipay_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentErr || !payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    // Fetch related ledger entries
    const { data: ledgerEntries } = await supabase
      .from("zenipay_ledger")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });

    // Fetch related accounting entries
    const { data: accountingEntries } = await supabase
      .from("zenipay_accounting_entries")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });

    return Response.json({
      payment,
      ledger_entries: ledgerEntries || [],
      accounting_entries: accountingEntries || [],
    });

  } catch (err) {
    console.error("[ZeniPay Payment GET] Error:", err);
    return Response.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}
