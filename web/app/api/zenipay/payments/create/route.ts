import { NextRequest, NextResponse } from "next/server";
import { createZeniPayPayLink, alertPayLinkFailure, PAY_LINK_UNAVAILABLE_MESSAGE } from "@/src/lib/server/zenipayLink";

// Lien de paiement ZeniPay pour une proposition (page /proposals/[tripId]/review, ZeniPayButton).
export async function POST(req: NextRequest) {
  const { customer_id, booking_id, amount, currency = "USD", description, customerName, customerEmail } = await req.json();

  if (!amount || parseFloat(String(amount)) <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const link = await createZeniPayPayLink({ amount, currency, description: description || "Zeniva Travel" });
  if (link) {
    return NextResponse.json({
      payment_id: link.id,
      checkout_url: link.url,
      amount, currency, status: "pending", customer_id, booking_id,
      created_at: new Date().toISOString(),
    });
  }

  // Pas de faux lien : le client verrait « Payment link not found » après avoir tapé sa carte.
  await alertPayLinkFailure({ amount, currency, description, customerEmail, customerName });
  return NextResponse.json(
    { error: "PAYMENT_LINK_UNAVAILABLE", message: PAY_LINK_UNAVAILABLE_MESSAGE },
    { status: 503 },
  );
}
