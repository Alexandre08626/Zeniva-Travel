import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" as any });

  try {
    const { amount, currency = "usd", description, referenceId, redirectUrl, customerEmail } = await req.json();

    if (!amount || !description) {
      return NextResponse.json({ error: "Missing amount or description" }, { status: 400 });
    }

    const rawAmount = Math.round(parseFloat(String(amount).replace(/[^0-9.]/g, "")) * 100); // cents

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com";
    const successUrl = redirectUrl || `${baseUrl}/payment/confirmation?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancelled`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: rawAmount,
            product_data: {
              name: description,
              description: referenceId ? `Ref: ${referenceId}` : undefined,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        referenceId: referenceId || "",
        source: "zenivatravel",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
