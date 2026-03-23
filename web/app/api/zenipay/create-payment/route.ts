import { NextRequest, NextResponse } from "next/server";

const ZENIPAY_API_KEY = process.env.ZENIPAY_API_KEY || "zpk_live_zeniva_3k9";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, currency = "USD", description, customerName, customerEmail } = body;

  // Call zenipay.ca to create a real hosted pay link
  try {
    const zpRes = await fetch("https://zenipay.ca/api/zenipay/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        description: description || "Zeniva",
        merchant: "Zeniva",
        api_key: ZENIPAY_API_KEY,
      }),
    });
    const zpData = await zpRes.json();
    if (zpRes.ok && zpData.url) {
      return NextResponse.json({
        paymentId: zpData.id,
        payment_id: zpData.id,
        checkout_url: zpData.url,
        url: zpData.url,
        amount, currency, status: "pending",
        created_at: new Date().toISOString(),
      });
    }
  } catch {}

  // Fallback: build zenipay.ca URL directly
  const paymentId = `LINK-${Date.now().toString(36).toUpperCase()}`;
  const params = new URLSearchParams({
    amount: String(amount), currency,
    desc: description || "Zeniva",
    m: "Zeniva",
  });
  const url = `https://zenipay.ca/pay/${paymentId}?${params}`;
  return NextResponse.json({
    paymentId,
    payment_id: paymentId,
    checkout_url: url,
    url,
    amount, currency, status: "pending",
    created_at: new Date().toISOString(),
  });
}
