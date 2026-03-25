export const dynamic = "force-dynamic";

/**
 * ZeniPay Invoice Backfill
 * Creates missing invoices for all succeeded payments
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const auth = req.headers.get("authorization") || "";
    const secret = auth.replace("Bearer ", "").trim();
    const expectedSecret = process.env.ZENIPAY_WEBHOOK_SECRET || "zeniva-secret-2025";

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // Get all succeeded payments from zenipay_merchants
    const { data: merchants } = await supabase
      .from("zenipay_merchants")
      .select("merchant_data");

    const allTransactions: any[] = [];
    for (const m of (merchants || [])) {
      const txns: any[] = Array.isArray(m.merchant_data?.transactions)
        ? m.merchant_data.transactions
        : [];
      allTransactions.push(...txns);
    }

    // Filter succeeded transactions only
    const succeededTxns = allTransactions.filter(t => t.status === "succeeded");

    // Get existing invoices
    const { data: existingInvoices } = await supabase
      .from("zenipay_invoices")
      .select("payment_id");

    const existingPaymentIds = new Set(
      (existingInvoices || []).map((inv: any) => inv.payment_id)
    );

    // Find transactions without invoices
    const missingInvoices = succeededTxns.filter(
      txn => !existingPaymentIds.has(txn.id)
    );

    console.log(`[Backfill] Found ${succeededTxns.length} succeeded payments`);
    console.log(`[Backfill] Found ${existingInvoices?.length || 0} existing invoices`);
    console.log(`[Backfill] Creating ${missingInvoices.length} missing invoices`);

    // Create missing invoices
    const created: any[] = [];
    for (const txn of missingInvoices) {
      const invoiceId = `INV-${txn.id}`;
      const description = txn.description || "ZeniPay Payment";

      const invoiceData = {
        id: invoiceId,
        payment_id: txn.id,
        booking_id: `BK-${txn.id}`,
        customer_name: txn.customer_name || "Client",
        customer_email: txn.customer_email || "",
        items: JSON.stringify([{
          description: description,
          qty: 1,
          unit_price: txn.amount,
          total: txn.amount
        }]),
        subtotal: txn.amount,
        tax: 0,
        total: txn.amount,
        currency: txn.currency || "USD",
        status: "paid",
        paid_at: txn.createdAt || new Date().toISOString(),
        notes: `ZeniPay Payment — ${txn.id}`,
        created_at: txn.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("zenipay_invoices")
        .upsert(invoiceData, { onConflict: "id" });

      if (error) {
        console.error(`[Backfill] Error creating invoice ${invoiceId}:`, error);
      } else {
        created.push(invoiceId);
        console.log(`[Backfill] Created invoice ${invoiceId}`);
      }
    }

    return NextResponse.json({
      success: true,
      total_payments: succeededTxns.length,
      existing_invoices: existingInvoices?.length || 0,
      created_invoices: created.length,
      invoice_ids: created,
    });

  } catch (err) {
    console.error("[Backfill] Error:", err);
    return NextResponse.json({
      error: "Backfill error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
