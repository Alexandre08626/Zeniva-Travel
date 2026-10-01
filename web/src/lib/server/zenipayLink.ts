// Création d'un lien de paiement ZeniPay (zenipay.ca) pour le marchand Zeniva.
//
// Avant : si zenipay.ca refusait la clé, le site fabriquait une URL
// https://zenipay.ca/pay/LINK-… qui n'existe nulle part → le client tapait sa
// carte puis recevait « Payment link not found ». On ne fabrique plus de faux
// lien : on renvoie null et l'appelant affiche un message + alerte HQ.
import { sendPushToHQ } from "@/src/lib/server/pushNotify";

const ZENIPAY_CREATE_LINK = "https://zenipay.ca/api/zenipay/create-link";

export type ZeniPayLink = { id: string; url: string };

export async function createZeniPayPayLink(opts: {
  amount: number | string;
  currency?: string;
  description?: string;
}): Promise<ZeniPayLink | null> {
  const amount = parseFloat(String(opts.amount));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const currency = String(opts.currency || "USD").toUpperCase() === "CAD" ? "CAD" : "USD";
  // Clé marchand Zeniva (tableau de bord ZeniPay) — variable d'environnement seulement.
  // L'ancienne clé écrite en dur était refusée par zenipay.ca (401).
  const apiKey = (process.env.ZENIPAY_API_KEY || "").trim();
  if (!apiKey) {
    console.error("[zenipay-link] ZENIPAY_API_KEY manquante dans Vercel (zeniva-web)");
    return null;
  }
  try {
    const res = await fetch(ZENIPAY_CREATE_LINK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        description: opts.description || "Zeniva Travel",
        merchant: "Zeniva",
        api_key: apiKey,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.url && data?.id) return { id: String(data.id), url: String(data.url) };
    console.error("[zenipay-link] refus de zenipay.ca", { status: res.status, error: data?.error || null });
  } catch (err: any) {
    console.error("[zenipay-link] erreur", err?.message || err);
  }
  return null;
}

/** Alerte HQ : un client voulait payer mais le lien ZeniPay n'a pas pu être créé. */
export async function alertPayLinkFailure(info: {
  amount: number | string;
  currency?: string;
  description?: string;
  customerEmail?: string;
  customerName?: string;
}) {
  const who = [info.customerName, info.customerEmail].filter(Boolean).join(" · ") || "client inconnu";
  await sendPushToHQ({
    title: "Paiement bloqué : lien ZeniPay refusé",
    body: `${who} — ${info.amount} ${info.currency || "USD"} — ${info.description || ""}`.slice(0, 240),
    url: "/agent/finance",
    tag: "zenipay-link-failed",
  });
}

export const PAY_LINK_UNAVAILABLE_MESSAGE =
  "Online payment is temporarily unavailable. Your request has been sent to our team and an advisor will send you a secure payment link shortly.";
