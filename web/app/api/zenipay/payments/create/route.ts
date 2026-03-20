import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { customer_id, booking_id, amount, currency = "USD", description, customerName, customerEmail } = await req.json();

  // Create a pay link on zenipay.ca and return its hosted checkout URL
  try {
    const zpRes = await fetch("https://zenipay.ca/api/zenipay/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        description: description || "Zeniva Travel",
        merchant: "Zeniva Travel",
      }),
    });
    const zpData = await zpRes.json();
    if (zpRes.ok && zpData.url) {
      return NextResponse.json({
        payment_id: zpData.id,
        checkout_url: zpData.url,
        amount, currency, status: "pending", customer_id, booking_id,
        created_at: new Date().toISOString(),
      });
    }
  } catch {
    // fall through to fallback
  }

  // Fallback: direct URL construction if zenipay.ca is unreachable
  const paymentId = `LINK-${Date.now().toString(36).toUpperCase()}`;
  const params = new URLSearchParams({
    amount: String(amount), currency,
    desc: description || "Zeniva Travel",
    m: "Zeniva Travel",
  });
  return NextResponse.json({
    payment_id: paymentId,
    checkout_url: `https://zenipay.ca/pay/${paymentId}?${params}`,
    amount, currency, status: "pending", customer_id, booking_id,
    created_at: new Date().toISOString(),
  });
}
