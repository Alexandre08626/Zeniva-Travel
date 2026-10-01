import { NextRequest, NextResponse } from "next/server";
import { createZeniPayPayLink, alertPayLinkFailure, PAY_LINK_UNAVAILABLE_MESSAGE } from "@/src/lib/server/zenipayLink";

// Lien de paiement ZeniPay (résidences ZeniStay, croisières, expériences, transferts).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, currency = "USD", description, customerName, customerEmail } = body;

  if (!amount || parseFloat(String(amount)) <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const link = await createZeniPayPayLink({ amount, currency, description: description || "Zeniva" });
  if (link) {
    return NextResponse.json({
      paymentId: link.id,
      payment_id: link.id,
      checkout_url: link.url,
      url: link.url,
      amount, currency, status: "pending",
      created_at: new Date().toISOString(),
    });
  }

  // Pas de faux lien : le client verrait « Payment link not found » après avoir tapé sa carte.
  await alertPayLinkFailure({ amount, currency, description, customerEmail, customerName });
  return NextResponse.json(
    { error: PAY_LINK_UNAVAILABLE_MESSAGE, code: "PAYMENT_LINK_UNAVAILABLE" },
    { status: 503 },
  );
}
