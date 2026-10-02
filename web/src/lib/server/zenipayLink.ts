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

/**
 * zenipay.ca's create-link only takes amount/currency/description: no metadata, no return URL,
 * and it does not call Zeniva back after payment. So we keep the who/what on our side:
 * a pending payment intent (Supabase, best effort) + an HQ push, so the team can match the
 * ZeniPay payment to the trip and confirm the booking.
 */
export async function recordPaymentIntent(info: {
  linkId: string;
  url: string;
  amount: number | string;
  currency?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  proposalId?: string;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = new Date().toISOString();
  if (url && key) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);
      const row: Record<string, unknown> = {
        id: info.linkId,
        url: info.url,
        amount: parseFloat(String(info.amount)),
        currency: String(info.currency || "USD").toUpperCase(),
        description: info.description || "",
        status: "pending",
        uses: 0,
        created_at: now,
        updated_at: now,
      };
      const metadata = {
        proposal_id: info.proposalId || null,
        customer_name: info.customerName || null,
        customer_email: info.customerEmail || null,
        customer_phone: info.customerPhone || null,
        source: "zenivatravel.com",
      };
      let { error } = await supabase.from("zenipay_pay_links").upsert({ ...row, metadata }, { onConflict: "id" });
      // Older table without a metadata column: keep the who/what in the description.
      if (error) ({ error } = await supabase.from("zenipay_pay_links").upsert({ ...row, description: `${row.description} | ${JSON.stringify(metadata)}`.slice(0, 1000) }, { onConflict: "id" }));
      if (error) console.error("[zenipay-link] intent not saved:", error.message);
    } catch (err: any) {
      console.error("[zenipay-link] intent error", err?.message || err);
    }
  }
  const who = [info.customerName, info.customerEmail, info.customerPhone].filter(Boolean).join(" · ") || "client";
  await sendPushToHQ({
    title: "Paiement ZeniPay lancé — à confirmer",
    body: `${who} — ${info.amount} ${info.currency || "USD"} — ${info.description || ""}${info.proposalId ? ` — proposition ${info.proposalId}` : ""} — lien ${info.linkId}`.slice(0, 240),
    url: "/agent/finance",
    tag: "zenipay-intent",
  }).catch(() => undefined);
}
