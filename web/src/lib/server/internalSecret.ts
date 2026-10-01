// Jeton interne serveur-à-serveur de Zeniva Travel.
//
// Remplace l'ancien jeton écrit en dur dans le code (exposé publiquement).
// - ZENIVA_INTERNAL_SECRET (optionnel) : valeur explicite.
// - Sinon : dérivé (HMAC) d'un secret serveur déjà présent (NEXTAUTH_SECRET),
//   donc jamais visible dans le code ni dans le navigateur.
// - Si aucun secret n'est disponible : refus (aucun repli permissif).
//
// Ne jamais importer ce fichier depuis un composant client.
import crypto from "crypto";

export function getInternalSecret(): string {
  const explicit = (process.env.ZENIVA_INTERNAL_SECRET || "").trim();
  if (explicit) return explicit;
  const base = (process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!base) return "";
  return crypto.createHmac("sha256", base).update("zeniva-internal-v1").digest("hex");
}

/** En-tête Authorization à envoyer aux routes internes ("" si aucun secret). */
export function internalAuthHeader(): string {
  const s = getInternalSecret();
  return s ? `Bearer ${s}` : "";
}

/** Vrai seulement si l'en-tête correspond au jeton interne (comparaison à temps constant). */
export function isInternalAuth(header: string | null | undefined): boolean {
  const expected = internalAuthHeader();
  if (!expected || !header) return false;
  const a = Buffer.from(header.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Ancien serveur d'automatisation (VPS). L'IP codée en dur est morte et
 * appartient maintenant à un tiers : on ne l'appelle plus. Définir
 * ZENIVA_VPS_BASE seulement si un nouveau serveur est remis en service.
 */
export function getVpsBase(): string {
  return (process.env.ZENIVA_VPS_BASE || "").trim().replace(/\/+$/, "");
}
