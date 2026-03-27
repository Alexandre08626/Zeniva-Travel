import { NextRequest, NextResponse } from "next/server";

// Zeniva live API key for ZeniPay
const ZENIPAY_API_KEY = process.env.ZENIPAY_API_KEY || "zpk_live_zeniva_3k9";

export async function POST(req: NextRequest) {
  const { customer_id, booking_id, amount, currency = "USD", description, customerName, customerEmail } = await req.json();

  // Create a pay link on zenipay.ca linked to the Zeniva merchant account
  try {
    const zpRes = await fetch("https://zenipay.ca/api/zenipay/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        description: description || "Zeniva Travel",
        merchant: "Zeniva",
        merchant_id: "zeniva-001",
        api_key: ZENIPAY_API_KEY,
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
    desc: description || "Zeniva",
    m: "Zeniva",
    merchant_id: "zeniva-001",
  });
  return NextResponse.json({
    payment_id: paymentId,
    checkout_url: `https://zenipay.ca/pay/${paymentId}?${params}`,
    amount, currency, status: "pending", customer_id, booking_id,
    created_at: new Date().toISOString(),
  });
}
