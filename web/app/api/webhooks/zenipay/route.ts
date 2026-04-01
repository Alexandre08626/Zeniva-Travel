/**
 * Zeniva — ZeniPay Webhook Receiver
 * Called by ZeniPay when a payment is confirmed.
 * Automatically creates a booking in Zeniva.
 *
 * Auth: Authorization: Bearer ZENIPAY_WEBHOOK_SECRET
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const auth = req.headers.get("authorization") || "";
  const secret = auth.replace("Bearer ", "").trim();
  const expectedSecret = process.env.ZENIPAY_WEBHOOK_SECRET || "zeniva-secret-2025";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      event,
      payment_id,
      transaction_id,
      amount,
      description,
      customer_name,
      customer_email,
      invoice_id,
      invoice_url,
      metadata = {},
      paid_at,
    } = data;

    console.log(`[Zeniva Webhook] Event: ${event} | Payment: ${payment_id}`);

    if (event !== "payment.succeeded") {
      return NextResponse.json({ received: true, skipped: true });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // ── AUTO-CREATE BOOKING ───────────────────────────────────────────────
    const bookingId = metadata.booking_id || `BK-${payment_id}`;
    const { error } = await supabase.from("bookings").upsert({
      id: bookingId,
      client_name: customer_name || "Client",
      client_email: customer_email || "",
      destination: metadata.destination || description || "Zeniva",
      departure_date: metadata.checkin || metadata.departure_date || null,
      return_date: metadata.checkout || metadata.return_date || null,
      travelers: metadata.guests || metadata.travelers || 1,
      total_price: amount,
      status: "confirmed",
      notes: `ZeniPay: ${payment_id} | Finix: ${transaction_id} | Invoice: ${invoice_id}`,
      created_at: paid_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) {
      console.error("[Zeniva Webhook] Booking upsert error:", error);
    } else {
      console.log(`[Zeniva Webhook] Booking auto-created: ${bookingId}`);
    }

    // ── AUTO-GENERATE INVOICE ─────────────────────────────────────────────
    const generatedInvoiceId = invoice_id || `INV-${payment_id}`;
    const dest = metadata.destination || description || "Zeniva";
    const { error: invoiceError } = await supabase.from("zenipay_invoices").upsert({
      id: generatedInvoiceId,
      payment_id,
      booking_id: bookingId,
      customer_name: customer_name || "Client",
      customer_email: customer_email || "",
      items: JSON.stringify([{ description: dest, qty: 1, unit_price: amount, total: amount }]),
      subtotal: amount,
      tax: 0,
      total: amount,
      currency: "USD",
      status: "paid",
      paid_at: paid_at || new Date().toISOString(),
      notes: `ZeniPay: ${payment_id} | Finix: ${transaction_id}`,
      created_at: paid_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (invoiceError) {
      console.error("[Zeniva Webhook] Invoice upsert error:", invoiceError);
    } else {
      console.log(`[Zeniva Webhook] Invoice auto-created: ${generatedInvoiceId}`);
    }

    // ── AUTO-BOOK WITH PARTNERS (if proposal_id in metadata) ─────────────
    const proposalId = metadata.proposal_id;
    if (proposalId) {
      try {
        // Load proposal from Supabase
        const { data: proposals } = await supabase
          .from("proposals")
          .select("payload")
          .eq("trip_id", proposalId)
          .limit(1);

        const proposal = proposals?.[0];
        if (proposal?.payload) {
          const { selections, passengers, hotelGuests, tripDraft } = proposal.payload;

          // Execute bookings with partners (Duffel flights + LiteAPI hotel)
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com";
          const execRes = await fetch(`${baseUrl}/api/bookings/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proposalId, selections, passengers, hotelGuests, tripDraft }),
          });
          const execData = await execRes.json();

          // Update proposal status to "Booked"
          await supabase.from("proposals").update({
            status: "Booked",
            payload: { ...proposal.payload, bookingConfirmations: execData.confirmations },
            updated_at: new Date().toISOString(),
          }).eq("trip_id", proposalId);

          // Send confirmation email to client
          await fetch(`${baseUrl}/api/bookings/confirmation-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientEmail: customer_email,
              clientName: customer_name,
              destination: metadata.destination || tripDraft?.destination,
              dates: `${tripDraft?.checkIn || ""} → ${tripDraft?.checkOut || ""}`,
              totalPrice: amount,
              confirmations: execData.confirmations,
              bookingId,
            }),
          }).catch(() => {});

          console.log(`[Zeniva Webhook] Auto-booked proposal ${proposalId}:`, execData.confirmations);
        }
      } catch (execErr) {
        console.error("[Zeniva Webhook] Auto-booking error:", execErr);
      }
    }

    return NextResponse.json({
      received: true,
      booking_id: bookingId,
      invoice_id: generatedInvoiceId,
      invoice_url: invoice_url || `https://www.zenivatravel.com/agent/invoices/${generatedInvoiceId}`,
    });

  } catch (err) {
    console.error("[Zeniva Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
