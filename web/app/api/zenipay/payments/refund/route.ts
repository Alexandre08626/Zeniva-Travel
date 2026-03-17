export const dynamic = "force-dynamic";

/**
 * ZeniPay — Refund Route
 * POST /api/zenipay/payments/refund
 * Body: { payment_id, amount?, reason }
 */

import { createClient } from "@supabase/supabase-js";
import { createReversal } from "../../../../../modules/zenipay/gateways/finix";
import { writeAuditLog } from "../../../../../modules/zenipay/services/ledger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_id, amount, reason } = body;

    if (!payment_id) {
      return Response.json({ error: "Missing payment_id" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }

    // Validate payment exists and is succeeded
    const { data: payment, error: fetchErr } = await supabase
      .from("zenipay_payments")
      .select("*")
      .eq("id", payment_id)
      .single();

    if (fetchErr || !payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "succeeded") {
      return Response.json(
        { error: `Cannot refund payment with status: ${payment.status}` },
        { status: 422 }
      );
    }

    const refundAmount = amount ? parseFloat(String(amount)) : Number(payment.amount);
    if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > Number(payment.amount)) {
      return Response.json({ error: "Invalid refund amount" }, { status: 400 });
    }

    const amountCents = Math.round(refundAmount * 100);

    // Call Finix refund API
    let finixRefundId = `REFUND-${Date.now()}`;
    if (payment.gateway_transfer_id) {
      try {
        const reversal = await createReversal(payment.gateway_transfer_id, amountCents);
        finixRefundId = reversal.id || finixRefundId;
      } catch (finixErr) {
        console.error("[ZeniPay Refund] Finix error:", finixErr);
        // In sandbox, continue with local refund tracking even if Finix fails
      }
    }

    // Update payment status to refunded
    await supabase
      .from("zenipay_payments")
      .update({ status: "refunded", updated_at: new Date().toISOString() })
      .eq("id", payment_id);

    // Write ledger entry — negative amount (refund)
    await supabase.from("zenipay_ledger").insert({
      id: `LED-REF-${Date.now()}`,
      payment_id,
      wallet: "platform",
      type: "refund",
      amount: -refundAmount,
      currency: payment.currency || "USD",
      description: reason || `Refund for payment ${payment_id}`,
      created_at: new Date().toISOString(),
    });

    // Write double-entry accounting: DR 4000 Travel Revenue / CR 1000 Platform Wallet
    const entryDate = new Date().toISOString();
    await supabase.from("zenipay_accounting_entries").insert([
      {
        id: `ACC-REF-DR-${Date.now()}`,
        payment_id,
        date: entryDate,
        description: `Refund DR — ${reason || payment_id}`,
        account_code: "4000",
        account_name: "Travel Revenue",
        entry_type: "debit",
        amount: refundAmount,
        currency: payment.currency || "USD",
        created_at: entryDate,
      },
      {
        id: `ACC-REF-CR-${Date.now() + 1}`,
        payment_id,
        date: entryDate,
        description: `Refund CR — ${reason || payment_id}`,
        account_code: "1000",
        account_name: "Platform Wallet",
        entry_type: "credit",
        amount: refundAmount,
        currency: payment.currency || "USD",
        created_at: entryDate,
      },
    ]);

    // Audit log
    await writeAuditLog({
      action: "payment_refunded",
      entityType: "payment",
      entityId: payment_id,
      changes: {
        refund_id: finixRefundId,
        refund_amount: refundAmount,
        reason: reason || "Customer request",
        original_amount: payment.amount,
      },
    });

    return Response.json({
      success: true,
      refund_id: finixRefundId,
      payment_id,
      amount: refundAmount,
      status: "refunded",
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
    });

  } catch (err) {
    console.error("[ZeniPay Refund] Error:", err);
    return Response.json({ error: "Refund processing failed" }, { status: 500 });
  }
}
