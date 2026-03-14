import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const apiToken = process.env.HELCIM_API_TOKEN;
  const pageToken = process.env.HELCIM_PAGE_TOKEN || "220ddb965adc8d55a10b60";
  const pageSecret = process.env.HELCIM_PAGE_SECRET;

  if (!apiToken) {
    return NextResponse.json({ error: "Helcim not configured" }, { status: 500 });
  }

  try {
    const { amount, currency = "CAD" } = await req.json();
    const amountNum = Number(amount);
    const amountStr = amountNum.toFixed(2);

    // Try HelcimPay.js first (requires active terminal)
    const helcimRes = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "api-token": apiToken,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        paymentType: "purchase",
        amount: amountNum,
        currency,
      }),
    });

    const helcimData = await helcimRes.json();

    // If HelcimPay.js works (has terminal), return checkoutToken
    if (helcimRes.ok && helcimData.checkoutToken) {
      return NextResponse.json({ checkoutToken: helcimData.checkoutToken, method: "iframe" });
    }

    // Fallback: Helcim Hosted Payment Page
    let hostedUrl = `https://zeniva-travel.myhelcim.com/hosted/?token=${pageToken}&amount=${amountStr}`;
    
    // Add HMAC hash if secret is configured
    if (pageSecret) {
      const amountHash = crypto
        .createHmac("sha256", pageSecret)
        .update(amountStr)
        .digest("hex");
      hostedUrl += `&amountHash=${amountHash}`;
    }

    return NextResponse.json({ hostedUrl, method: "hosted" });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
