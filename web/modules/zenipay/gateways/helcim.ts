// ZeniPay — Helcim Gateway

export interface GatewayResult {
  success: boolean;
  transactionId?: string;
  checkoutToken?: string;
  hostedUrl?: string;
  method?: "iframe" | "hosted";
  error?: string;
  raw?: unknown;
}

export async function initializeHelcimPayment(
  amount: number,
  currency = "CAD"
): Promise<GatewayResult> {
  const apiToken = process.env.HELCIM_API_TOKEN;
  const pageToken = process.env.HELCIM_PAGE_TOKEN || "220ddb965adc8d55a10b60";

  if (!apiToken) return { success: false, error: "Helcim not configured" };

  try {
    const res = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "api-token": apiToken,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ paymentType: "purchase", amount, currency }),
    });

    const data = await res.json();

    if (res.ok && data.checkoutToken) {
      return { success: true, checkoutToken: data.checkoutToken, method: "iframe", raw: data };
    }

    // Fallback: hosted payment page
    const amountStr = Number(amount).toFixed(2);
    const hostedUrl = `https://zeniva-travel.myhelcim.com/hosted/?token=${pageToken}&amount=${amountStr}`;
    return { success: true, hostedUrl, method: "hosted" };

  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Gateway error" };
  }
}
