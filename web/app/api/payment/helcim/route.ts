import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiToken = process.env.HELCIM_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json({ error: "Helcim not configured" }, { status: 500 });
  }

  try {
    const { amount, description, referenceId, currency = "CAD" } = await req.json();
    if (!amount || !description) {
      return NextResponse.json({ error: "Missing amount or description" }, { status: 400 });
    }

    const amountNum = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com";

    // Initialize Helcim checkout session
    const resp = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "api-token": apiToken,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        paymentType: "purchase",
        amount: amountNum,
        currency: currency,
        customerCode: referenceId || undefined,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data?.errors?.[0]?.message || "Helcim error" }, { status: 400 });
    }

    return NextResponse.json({
      checkoutToken: data.checkoutToken,
      secretToken: data.secretToken,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
