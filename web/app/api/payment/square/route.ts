import { NextRequest, NextResponse } from "next/server";

const SQUARE_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
const SQUARE_BASE = process.env.SQUARE_SANDBOX === "true"
  ? "https://connect.squareupsandbox.com"
  : "https://connect.squareup.com";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "USD", description, referenceId, redirectUrl } = await req.json();

    if (!amount || !description) {
      return NextResponse.json({ error: "Missing amount or description" }, { status: 400 });
    }

    // Convert amount to cents (Square uses smallest currency unit)
    const amountCents = Math.round(parseFloat(String(amount).replace(/[^0-9.]/g, "")) * 100);

    const body = {
      idempotency_key: `zeniva-${referenceId || Date.now()}-${Math.random().toString(36).slice(2)}`,
      quick_pay: {
        name: description,
        price_money: {
          amount: amountCents,
          currency: currency.toUpperCase(),
        },
        location_id: process.env.SQUARE_LOCATION_ID || "",
      },
      checkout_options: {
        redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com"}/payment/confirmation`,
        allow_tipping: false,
        merchant_support_email: "info@zeniva.ca",
      },
      pre_populated_data: {
        buyer_email: undefined,
      },
      payment_note: `Zeniva Travel — ${description}`,
    };

    const res = await fetch(`${SQUARE_BASE}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Square API error:", data);
      return NextResponse.json({ error: data.errors?.[0]?.detail || "Square error" }, { status: 400 });
    }

    return NextResponse.json({
      paymentUrl: data.payment_link?.url,
      paymentLinkId: data.payment_link?.id,
      orderId: data.payment_link?.order_id,
    });
  } catch (err: unknown) {
    console.error("Square payment error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
