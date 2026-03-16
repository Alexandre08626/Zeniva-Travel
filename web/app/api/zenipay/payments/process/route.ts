export const dynamic = "force-dynamic";

/**
 * ZeniPay — Payment Processing Route — Production Grade
 * Architecture: Zeniva → ZeniPay → Finix → Card Network → Zeniva Bank Account
 *
 * SAFETY GUARANTEES:
 * 1. Idempotency: duplicate requests return cached result (no double charge)
 * 2. Ledger: every payment creates append-only ledger entries
 * 3. Accounting: double-entry bookkeeping generated on success
 * 4. Audit: every action logged in audit table
 * 5. No raw card numbers stored — Finix tokenization only
 */

import { checkIdempotency, saveIdempotency, recordPaymentReceived, writeAuditLog } from "../../../../../modules/zenipay/services/ledger";
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  let paymentId = "";
  let ipAddress = request.headers.get("x-forwarded-for") || "unknown";

  try {
    const body = await request.json();
    const {
      payment_id,
      amount,
      currency = "USD",
      card_number,
      expiry_month,
      expiry_year,
      cvc,
      cardholder_name,
      billing_zip,
      description,
      idempotency_key,
    } = body;

    paymentId = payment_id || `ZNV-${Date.now()}`;

    // ── IDEMPOTENCY CHECK ─────────────────────────────────────────────────
    const idemKey = idempotency_key || `pay_${paymentId}`;
    const cached = await checkIdempotency(idemKey);
    if (cached) {
      console.log(`[ZeniPay] Idempotent replay for key: ${idemKey}`);
      return Response.json({ ...cached, idempotent_replay: true });
    }

    // ── INPUT VALIDATION ──────────────────────────────────────────────────
    if (!paymentId || !amount) {
      return Response.json({ error: "Missing required fields: payment_id and amount" }, { status: 400 });
    }

    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const amountCents = Math.round(parsedAmount * 100);

    // ── PERSIST PAYMENT RECORD ────────────────────────────────────────────
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("zenipay_payments").upsert({
        id: paymentId,
        idempotency_key: idemKey,
        customer_name: cardholder_name || "",
        amount: parsedAmount,
        currency,
        status: "pending",
        gateway: "finix",
        description: description || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // ── CARD PAYMENT VIA FINIX ────────────────────────────────────────────
    if (card_number && expiry_month && expiry_year && cvc) {
      const { processPayment } = await import("../../../../../modules/zenipay/gateways/index");

      const result = await processPayment({
        cardNumber: card_number,
        expiryMonth: expiry_month,
        expiryYear: expiry_year,
        cvc,
        cardholderName: cardholder_name || "Cardholder",
        postalCode: billing_zip || "00000",
        amount: parsedAmount, // dollars — processFinixPayment converts to cents internally
        currency,
        description: description || `ZeniPay Payment ${paymentId}`,
        paymentId,
      });

      if (!result.success) {
        // Update payment status to failed
        if (supabase) {
          await supabase.from("zenipay_payments").update({
            status: "failed",
            updated_at: new Date().toISOString(),
          }).eq("id", paymentId);
        }

        await writeAuditLog({
          action: "payment_failed",
          entityType: "payment",
          entityId: paymentId,
          changes: { error: result.error, amount: parsedAmount },
        });

        return Response.json({
          success: false,
          error: result.error || "Payment declined. Please try another card.",
        }, { status: 402 });
      }

      // ── SUCCESS: update DB + write ledger ─────────────────────────────
      if (supabase) {
        await supabase.from("zenipay_payments").update({
          status: "succeeded",
          gateway_transfer_id: result.transactionId,
          updated_at: new Date().toISOString(),
        }).eq("id", paymentId);
      }

      // ── AUTO-CREATE BOOKING IN SUPABASE ──────────────────────────────
      if (supabase) {
        // Parse destination/dates from description or metadata
        const meta = body.metadata || {};
        const bookingId = meta.booking_id || `BK-${paymentId}`;
        await supabase.from("bookings").upsert({
          id: bookingId,
          client_name: cardholder_name || meta.customer_name || "Client",
          client_email: meta.customer_email || body.customer_email || "",
          destination: meta.destination || description || "Zeniva Travel",
          departure_date: meta.checkin || meta.departure_date || null,
          return_date: meta.checkout || meta.return_date || null,
          travelers: meta.guests || meta.travelers || 1,
          total_price: parsedAmount,
          currency,
          status: "confirmed",
          notes: `ZeniPay payment ${paymentId} — Finix ${result.transactionId}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" }).then(() => {});
      }

      // Append-only ledger entry (100% → Platform Wallet)
      await recordPaymentReceived({
        paymentId,
        amount: parsedAmount,
        currency,
      });

      // Audit log
      await writeAuditLog({
        action: "payment_succeeded",
        entityType: "payment",
        entityId: paymentId,
        changes: {
          amount: parsedAmount,
          currency,
          gateway_transfer_id: result.transactionId,
          wallet: "platform",
        },
      });

      console.log(`[ZeniPay] ✅ Payment SUCCESS — $${parsedAmount} ${currency} → Platform Wallet`);
      console.log(`[ZeniPay] Finix Transfer ID: ${result.transactionId}`);

      const responsePayload = {
        success: true,
        payment_id: paymentId,
        transaction_id: result.transactionId,
        amount: parsedAmount,
        currency,
        status: "succeeded",
        gateway: "Finix",
        wallet: "platform",
        message: `$${parsedAmount} received. Funds added to Zeniva Travel Platform Wallet.`,
        confirmation_url: `/booking/confirmation?ref=${paymentId}&total=$${parsedAmount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}`,
      };

      // Save idempotency result (24h TTL)
      await saveIdempotency(idemKey, "payment", responsePayload as Record<string, unknown>);

      return Response.json(responsePayload);
    }

    // ── ACH / RESERVE NOW PAY LATER ───────────────────────────────────────
    const pendingPayload = {
      success: true,
      payment_id: paymentId,
      status: "pending",
      message: "Reserve confirmed. Payment due at check-in.",
      confirmation_url: `/booking/confirmation?ref=${paymentId}&total=$${parsedAmount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}&payment=pending`,
    };

    await saveIdempotency(idemKey, "payment_pending", pendingPayload as Record<string, unknown>);

    return Response.json(pendingPayload);

  } catch (err) {
    console.error("[ZeniPay] Process error:", err);

    if (paymentId) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("zenipay_payments").update({
          status: "failed",
          updated_at: new Date().toISOString(),
        }).eq("id", paymentId).then(() => {});
      }
    }

    return Response.json({
      success: false,
      error: "Payment processing error. Please try again or contact support.",
    }, { status: 500 });
  }
}
