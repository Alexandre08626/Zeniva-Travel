import { NextRequest, NextResponse } from "next/server";

// Zeniva live API key for ZeniPay
const ZENIPAY_API_KEY = process.env.ZENIPAY_API_KEY || "zpk_live_zeniva_3k9";

// The Zeniva merchant account on ZeniPay settles in this currency. Until
// Finix is live with USD support, every charge has to land in CAD or the
// founder loses ~26% per transaction (USD-priced trip charged as CAD).
const ZENIPAY_SETTLEMENT_CURRENCY = (process.env.ZENIPAY_SETTLEMENT_CURRENCY || "CAD").toUpperCase();

// Static FX baseline used when the proposal is priced in a different
// currency than ZeniPay's settlement currency. Rough — within ~1-2% — but
// good enough as long as we round UP slightly so we never under-collect.
const FX_TO_CAD: Record<string, number> = {
  USD: 1.37,
  EUR: 1.48,
  GBP: 1.73,
  AUD: 0.90,
  CHF: 1.55,
  MXN: 0.078,
  JPY: 0.0091,
};

function convertToSettlement(amount: number, fromCurrency: string): {
  amount: number;
  currency: string;
  fxApplied: boolean;
  fxRate: number | null;
} {
  const from = (fromCurrency || "USD").toUpperCase();
  if (from === ZENIPAY_SETTLEMENT_CURRENCY) {
    return { amount, currency: from, fxApplied: false, fxRate: null };
  }
  // Only support converting INTO CAD for now. If a different settlement
  // currency is configured, fall back to passing the amount through.
  if (ZENIPAY_SETTLEMENT_CURRENCY === "CAD" && FX_TO_CAD[from]) {
    const rate = FX_TO_CAD[from];
    const converted = Math.ceil(amount * rate * 100) / 100; // round UP to the cent
    return { amount: converted, currency: "CAD", fxApplied: true, fxRate: rate };
  }
  return { amount, currency: from, fxApplied: false, fxRate: null };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customer_id,
    booking_id,
    amount: rawAmount,
    currency: rawCurrency = "USD",
    description,
    customerName,
    customerEmail,
  } = body;

  const numericAmount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || "0")) || 0;
  const { amount: settledAmount, currency: settledCurrency, fxApplied, fxRate } = convertToSettlement(
    numericAmount,
    rawCurrency,
  );

  // Stamp the description with the original price so the customer sees the
  // USD figure they agreed to + the CAD charge that lands on their card.
  const baseDesc = description || "Zeniva Travel";
  const finalDesc = fxApplied
    ? `${baseDesc} · ${rawCurrency.toUpperCase()} ${numericAmount.toFixed(2)} (charged ${settledCurrency} ${settledAmount.toFixed(2)} @ ${fxRate?.toFixed(4)})`
    : baseDesc;

  // Create a pay link on zenipay.ca linked to the Zeniva merchant account
  try {
    const zpRes = await fetch("https://zenipay.ca/api/zenipay/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: settledAmount,
        currency: settledCurrency,
        description: finalDesc,
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
        amount: settledAmount,
        currency: settledCurrency,
        original_amount: numericAmount,
        original_currency: rawCurrency.toUpperCase(),
        fx_rate: fxRate,
        status: "pending",
        customer_id,
        booking_id,
        created_at: new Date().toISOString(),
      });
    }
  } catch {
    // fall through to fallback
  }

  // Fallback: direct URL construction if zenipay.ca is unreachable
  const paymentId = `LINK-${Date.now().toString(36).toUpperCase()}`;
  const params = new URLSearchParams({
    amount: String(settledAmount),
    currency: settledCurrency,
    desc: finalDesc,
    m: "Zeniva",
    merchant_id: "zeniva-001",
  });
  return NextResponse.json({
    payment_id: paymentId,
    checkout_url: `https://zenipay.ca/pay/${paymentId}?${params}`,
    amount: settledAmount,
    currency: settledCurrency,
    original_amount: numericAmount,
    original_currency: rawCurrency.toUpperCase(),
    fx_rate: fxRate,
    status: "pending",
    customer_id,
    booking_id,
    created_at: new Date().toISOString(),
  });
}
