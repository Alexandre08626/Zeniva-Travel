import { NextRequest, NextResponse } from "next/server";
import { createZeniPayPayLink, alertPayLinkFailure, recordPaymentIntent, PAY_LINK_UNAVAILABLE_MESSAGE } from "@/src/lib/server/zenipayLink";

const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// Lien de paiement ZeniPay pour une proposition (checkout, /payment, /proposals/[tripId]/review).
export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const { customer_id, booking_id, amount, currency = "USD" } = body;
  const description = clip(body.description, 300) || "Zeniva Travel";
  const customerName = clip(body.customerName, 120);
  const customerEmail = clip(body.customerEmail, 200);
  const customerPhone = clip(body.customerPhone, 40);
  const proposalId = clip(body.proposalId || body.proposal_id, 120);

  if (!amount || !(parseFloat(String(amount)) > 0)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // La référence (client + proposition) reste visible dans la transaction ZeniPay.
  const ref = [customerName, customerEmail, proposalId ? `#${proposalId}` : ""].filter(Boolean).join(" · ");
  const fullDescription = ref ? `${description} — ${ref}`.slice(0, 400) : description;

  const link = await createZeniPayPayLink({ amount, currency, description: fullDescription });
  if (link) {
    await recordPaymentIntent({ linkId: link.id, url: link.url, amount, currency, description: fullDescription, customerName, customerEmail, customerPhone, proposalId });
    return NextResponse.json({
      payment_id: link.id,
      checkout_url: link.url,
      amount, currency, status: "pending", customer_id, booking_id,
      created_at: new Date().toISOString(),
    });
  }

  // Pas de faux lien : le client verrait « Payment link not found » après avoir tapé sa carte.
  await alertPayLinkFailure({ amount, currency, description: fullDescription, customerEmail, customerName });
  return NextResponse.json(
    { error: "PAYMENT_LINK_UNAVAILABLE", message: PAY_LINK_UNAVAILABLE_MESSAGE },
    { status: 503 },
  );
}
