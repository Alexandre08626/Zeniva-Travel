export const dynamic = "force-dynamic";

/**
 * Zeniva Travel — Payment Processing Route
 *
 * Flow:
 * 1. If ZENIPAY_API_URL is configured → calls ZeniPay external API
 *    ZeniPay processes the payment, generates the invoice, and sends
 *    a webhook to Zeniva Travel (/api/webhooks/zenipay) which auto-creates the booking.
 * 2. Fallback → internal processing (gateway + booking + invoice locally)
 */

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  let paymentId = "";

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
      customer_email,
      customer_name,
      metadata,
    } = body;

    paymentId = payment_id || `ZNV-${Date.now()}`;
    const parsedAmount = parseFloat(String(amount));

    if (!paymentId || !parsedAmount || parsedAmount <= 0) {
      return Response.json({ error: "Missing required fields: payment_id and amount" }, { status: 400 });
    }

    // ── ROUTE 1: ZeniPay External API ────────────────────────────────────
    const zenipayApiUrl = process.env.ZENIPAY_API_URL;
    const zenipayApiKey = process.env.ZENIPAY_API_KEY;

    if (zenipayApiUrl && zenipayApiKey) {
      const zpRes = await fetch(`${zenipayApiUrl}/api/external/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${zenipayApiKey}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          amount: parsedAmount,
          currency,
          card_number,
          expiry_month,
          expiry_year,
          cvc,
          cardholder_name,
          billing_zip,
          description,
          customer_email: customer_email || body.customer_email,
          customer_name: customer_name || cardholder_name,
          metadata: {
            ...metadata,
            destination: description,
            booking_id: `BK-${paymentId}`,
          },
        }),
      });

      const zpData = await zpRes.json();

      if (!zpData.success) {
        return Response.json({
          success: false,
          status: "failed",
          error: zpData.error || "Payment declined. Please try another card.",
        }, { status: 402 });
      }

      // ZeniPay confirmed payment — auto-create booking locally as well (backup)
      const supabase = getSupabase();
      if (supabase) {
        const bookingId = `BK-${paymentId}`;
        const meta = metadata || {};
        await supabase.from("bookings").upsert({
          id: bookingId,
          client_name: customer_name || cardholder_name || "Client",
          client_email: customer_email || "",
          destination: meta.destination || description || "Zeniva Travel",
          departure_date: meta.checkin || meta.departure_date || null,
          return_date: meta.checkout || meta.return_date || null,
          travelers: meta.guests || meta.travelers || 1,
          total_price: parsedAmount,
          status: "confirmed",
          notes: `ZeniPay: ${paymentId} | Invoice: ${zpData.invoice_id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" }).then(() => {});
      }

      const confirmUrl = `/booking/confirmation?ref=${paymentId}&total=$${parsedAmount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}`;

      return Response.json({
        success: true,
        payment_id: paymentId,
        transaction_id: zpData.transaction_id,
        amount: parsedAmount,
        currency,
        status: "succeeded",
        invoice_id: zpData.invoice_id,
        invoice_url: zpData.invoice_url,
        confirmation_url: confirmUrl,
      });
    }

    // ── ROUTE 2: Internal Fallback (no ZeniPay API configured) ───────────
    const { checkIdempotency, saveIdempotency, recordPaymentReceived, writeAuditLog } = await import("../../../../../modules/zenipay/services/ledger");

    const idemKey = `pay_${paymentId}`;
    const cached = await checkIdempotency(idemKey);
    if (cached) {
      return Response.json({ ...cached, idempotent_replay: true });
    }

    const amountCents = Math.round(parsedAmount * 100);
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

    void amountCents; // used for logging only in fallback

    if (card_number && expiry_month && expiry_year && cvc) {
      const { processPayment } = await import("../../../../../modules/zenipay/gateways/index");

      const result = await processPayment({
        cardNumber: card_number,
        expiryMonth: expiry_month,
        expiryYear: expiry_year,
        cvc,
        cardholderName: cardholder_name || "Cardholder",
        postalCode: billing_zip || "00000",
        amount: parsedAmount,
        currency,
        description: description || `Payment ${paymentId}`,
        paymentId,
      });

      if (!result.success) {
        if (supabase) {
          await supabase.from("zenipay_payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", paymentId);
        }
        await writeAuditLog({ action: "payment_failed", entityType: "payment", entityId: paymentId, changes: { error: result.error, amount: parsedAmount } });
        return Response.json({ success: false, status: "failed", error: result.error || "Payment declined." }, { status: 402 });
      }

      if (supabase) {
        await supabase.from("zenipay_payments").update({ status: "succeeded", gateway_transfer_id: result.transactionId, updated_at: new Date().toISOString() }).eq("id", paymentId);
      }

      // Auto-create booking
      const meta = body.metadata || {};
      const dest = meta.destination || description || "Zeniva Travel";
      const bookingId = meta.booking_id || `BK-${paymentId}`;
      const custEmail = meta.customer_email || body.customer_email || "";

      if (supabase) {
        await supabase.from("bookings").upsert({
          id: bookingId,
          client_name: cardholder_name || meta.customer_name || "Client",
          client_email: custEmail,
          destination: dest,
          departure_date: meta.checkin || meta.departure_date || null,
          return_date: meta.checkout || meta.return_date || null,
          travelers: meta.guests || meta.travelers || 1,
          total_price: parsedAmount,
          status: "confirmed",
          notes: `Payment ${paymentId} — Finix ${result.transactionId}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" }).then(() => {});

        // Auto-generate invoice
        const invoiceId = `INV-${paymentId}`;
        await supabase.from("zenipay_invoices").upsert({
          id: invoiceId,
          payment_id: paymentId,
          booking_id: bookingId,
          customer_name: cardholder_name || meta.customer_name || "Client",
          customer_email: custEmail,
          items: JSON.stringify([{ description: dest, qty: 1, unit_price: parsedAmount, total: parsedAmount }]),
          subtotal: parsedAmount,
          tax: 0,
          total: parsedAmount,
          currency,
          status: "paid",
          paid_at: new Date().toISOString(),
          notes: `Finix: ${result.transactionId}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" }).then(() => {});
      }

      // Send confirmation email
      if (custEmail) {
        const vpsBase = process.env.VPS_API_URL || "https://vmi3097009.contaboserver.net";
        fetch(`${vpsBase}/admin/send-payment-confirmation`, {
          method: "POST",
          headers: { "Authorization": "Bearer zeniva-secret-2025", "Content-Type": "application/json" },
          body: JSON.stringify({
            client_email: custEmail,
            client_name: cardholder_name || meta.customer_name || "Client",
            payment_id: paymentId,
            amount: parsedAmount,
            currency,
            description: description || dest,
            invoice_url: `https://www.zenivatravel.com/agent/invoices/INV-${paymentId}`,
          }),
        }).catch(e => console.error("[Zeniva] Email error:", e));
      }

      await recordPaymentReceived({ paymentId, amount: parsedAmount, currency });
      await writeAuditLog({ action: "payment_succeeded", entityType: "payment", entityId: paymentId, changes: { amount: parsedAmount, currency, gateway_transfer_id: result.transactionId } });

      const responsePayload = {
        success: true,
        payment_id: paymentId,
        transaction_id: result.transactionId,
        amount: parsedAmount,
        currency,
        status: "succeeded",
        confirmation_url: `/booking/confirmation?ref=${paymentId}&total=$${parsedAmount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}`,
      };

      await saveIdempotency(idemKey, "payment", responsePayload as Record<string, unknown>);
      return Response.json(responsePayload);
    }

    // ACH / Reserve now
    const pendingPayload = {
      success: true,
      payment_id: paymentId,
      status: "pending",
      message: "Reserve confirmed. Payment due at check-in.",
      confirmation_url: `/booking/confirmation?ref=${paymentId}&total=$${parsedAmount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}&payment=pending`,
    };
    return Response.json(pendingPayload);

  } catch (err) {
    console.error("[Zeniva] Process error:", err);
    if (paymentId) {
      const supabase = getSupabase();
      if (supabase) await supabase.from("zenipay_payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", paymentId).then(() => {});
    }
    return Response.json({ success: false, error: "Payment processing error. Please try again." }, { status: 500 });
  }
}
