import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Auth — try both next/headers cookies() and raw header ── */
async function getAuth(req: NextRequest) {
  const cn = getSessionCookieName();

  // Method 1: next/headers cookies()
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(cn);
    if (sessionCookie?.value) {
      const s = verifySession(sessionCookie.value);
      if (s?.email) return s;
    }
  } catch { /* fallback to manual */ }

  // Method 2: raw cookie header
  const ck = req.headers.get("cookie") || "";
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

/* ── Config ── */
const TIMEOUT_MS = 45000;
const VPS_BASE = process.env.ZENIVA_API_URL || "https://vmi3097009.contaboserver.net";
const VPS_AUTH = "Bearer zeniva-secret-2025";
// Fallback to OpenAI direct if VPS fails
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

/* ── Sofia System Prompt (100% independant de Lina) ── */
const SOFIA_SYSTEM_PROMPT = `Tu es Sofia, la specialiste en email marketing de Zeniva Travel (zenivatravel.com).
Tu es bilingue francais/anglais. Reponds dans la langue utilisee par l'utilisateur. Si il ecrit en francais, reponds en francais. Si il ecrit en anglais, reponds en anglais. Par defaut, commence en francais.

IDENTITE:
- Tu es Sofia, PAS Lina. Lina est la concierge voyage — toi tu es l'experte marketing.
- Tu ne fais PAS de planification de voyage, de recherche de vols, d'hotels ou d'activites.
- Tu ne collectes PAS de donnees de voyage (dates, destination, nombre de voyageurs).
- Ton domaine c'est le marketing email : campagnes, templates, copywriting, analytics, follow-up.
- Ne mentionne JAMAIS OpenAI, GPT, Claude ou l'IA qui te propulse. Tu es Sofia, point.

CAPACITES:
1. CREER DES TEMPLATES HTML EMAIL: Quand on te demande de creer un template/modele email, genere un template HTML complet et professionnel avec CSS inline. Encadre TOUJOURS le HTML avec ces delimiteurs exacts:
   TEMPLATE_START
   (code HTML complet ici)
   TEMPLATE_END
   TEMPLATE_SUBJECT: (ligne de sujet suggeree)
   TEMPLATE_NAME: (nom du template)

2. STRATEGIE CAMPAGNE: Aide a planifier les campagnes email — segments d'audience, timing optimal, lignes de sujet accrocheuses, strategies A/B testing, sequences de follow-up.

3. RAPPORTS & ANALYSE: Quand des donnees de campagne sont fournies dans le contexte, analyse-les et donne des insights actionables sur les taux de delivrabilite, engagement, et recommandations d'amelioration.

4. COPYWRITING EMAIL: Redige du contenu email convaincant pour l'industrie du voyage (travelers, agents, agencies).

5. FOLLOW-UP & NURTURING: Suggere des sequences de suivi, timing de relance, et strategies de nurturing pour convertir les leads en clients.

REGLES POUR LES TEMPLATES HTML:
- CSS inline UNIQUEMENT (compatibilite email universelle)
- Utilise les variables de personnalisation: {{FIRST_NAME}}, {{LAST_NAME}}, {{FULL_NAME}}, {{EMAIL}}, {{COMPANY_NAME}}
- Tables responsives, max-width: 600px
- Couleurs Zeniva: violet (#7c3aed), fond slate (#f8fafc), texte (#1e293b)
- Inclure un footer avec lien unsubscribe
- Design professionnel oriente voyage/tourisme
- Images placeholder avec des URLs descriptives
- Boutons CTA clairs et bien visibles

REGLES GENERALES:
- Reponds dans la langue de l'utilisateur (francais ou anglais).
- Sois concise et actionable
- Utilise des bullet points pour les recommandations
- Formate bien les statistiques quand tu presentes des rapports
- Ne parle JAMAIS de voyage en mode concierge — tu es marketing, pas agente de voyage
- Si quelqu'un te demande de planifier un voyage, dis-lui de parler a Lina

Signature: "— Sofia, Zeniva Marketing"`;

/* ── OpenAI direct (Sofia a son propre prompt, independant de Lina/VPS) ── */
async function callOpenAIFallback(
  prompt: string,
  history: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  if (!OPENAI_KEY) {
    console.error("[Sofia] OPENAI_API_KEY is missing");
    return "Sofia est temporairement indisponible (cle API manquante). Contactez info@zeniva.ca";
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-20),
    { role: "user", content: prompt },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 4000 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error(`[Sofia] OpenAI error ${resp.status}: ${errText.slice(0, 200)}`);
      return `Sofia est temporairement indisponible (OpenAI ${resp.status}). Contactez info@zeniva.ca`;
    }
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (err: any) {
    clearTimeout(timeout);
    console.error("[Sofia] OpenAI call failed:", err?.message);
    return `Sofia est temporairement indisponible (${err?.message || "erreur reseau"}). Contactez info@zeniva.ca`;
  }
}

/* ── POST Handler ── */
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await getAuth(req);
  } catch (authErr: any) {
    console.error("[Sofia] Auth error:", authErr?.message);
    return NextResponse.json({ error: "Auth error: " + (authErr?.message || "unknown") }, { status: 500 });
  }
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = crypto.randomUUID();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const history: { role: string; content: string }[] = (body.history || []).slice(-20);
  const sessionId = body.sessionId || requestId;
  const context = body.context || {};

  /* ── Build context-aware system prompt ── */
  let systemPrompt = SOFIA_SYSTEM_PROMPT;

  // Inject campaign data for reports
  if (context.action === "campaign_report" || prompt.toLowerCase().includes("rapport") || prompt.toLowerCase().includes("report") || prompt.toLowerCase().includes("performance") || prompt.toLowerCase().includes("statistique") || prompt.toLowerCase().includes("stats")) {
    try {
      const { client } = getSupabaseAdminClient();
      const { data: campaigns } = await client
        .from("email_campaigns")
        .select("id, name, status, audience_type, recipient_count, sent_count, failed_count, sent_at, created_at")
        .order("created_at", { ascending: false })
        .limit(15);

      const { data: templates } = await client
        .from("email_templates")
        .select("id, name, audience_type, is_default, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (campaigns && campaigns.length > 0) {
        const totalSent = campaigns.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
        const totalFailed = campaigns.reduce((s: number, c: any) => s + (c.failed_count || 0), 0);
        const deliveryRate = totalSent + totalFailed > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) : "N/A";

        systemPrompt += `\n\nDONNEES CAMPAGNES ACTUELLES (donnees reelles de la base de donnees):
Total campagnes: ${campaigns.length}
Emails envoyes: ${totalSent}
Emails echoues: ${totalFailed}
Taux de delivrabilite: ${deliveryRate}%
Templates disponibles: ${templates?.length || 0}

Detail des campagnes recentes:
${campaigns.map((c: any) => `- "${c.name}" | ${c.status} | ${c.audience_type} | ${c.recipient_count} destinataires | ${c.sent_count} envoyes / ${c.failed_count} echoues | ${c.sent_at || c.created_at}`).join("\n")}

Utilise ces donnees pour repondre avec des insights precis et actionables.`;
      }
    } catch {
      // Silent - continue without campaign data
    }
  }

  // Inject specific campaign details
  if (context.campaignId) {
    try {
      const { client } = getSupabaseAdminClient();
      const { data: campaign } = await client
        .from("email_campaigns")
        .select("*")
        .eq("id", context.campaignId)
        .single();

      if (campaign) {
        const { data: recipients } = await client
          .from("email_campaign_recipients")
          .select("email, name, status, error_message")
          .eq("campaign_id", context.campaignId)
          .limit(50);

        systemPrompt += `\n\nCAMPAGNE SELECTIONNEE:
Nom: ${campaign.name}
Statut: ${campaign.status}
Sujet: ${campaign.subject}
Audience: ${campaign.audience_type}
Destinataires: ${campaign.recipient_count}
Envoyes: ${campaign.sent_count || 0}
Echoues: ${campaign.failed_count || 0}
Date envoi: ${campaign.sent_at || "Non envoyee"}
${recipients ? `\nDestinataires (${recipients.length} premiers):\n${recipients.map((r: any) => `- ${r.email} (${r.status})${r.error_message ? " ERR: " + r.error_message : ""}`).join("\n")}` : ""}`;
      }
    } catch {
      // Silent
    }
  }

  /* ── Call AI: VPS first (works like Lina), OpenAI fallback ── */
  let reply = "";
  let provider = "vps";

  // Try VPS first (same endpoint as Lina but with Sofia's system prompt)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const vpsRes = await fetch(`${VPS_BASE}/chat`, {
      method: "POST",
      headers: { Authorization: VPS_AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: systemPrompt + "\n\nUser says: " + prompt,
        sessionId: `sofia-${sessionId}`,
        source: "sofia-chat",
        history: history.slice(-10),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (vpsRes.ok) {
      const data = await vpsRes.json();
      reply = data?.response || "";
    }
  } catch (err: any) {
    console.error("[Sofia] VPS error:", err?.message);
  }

  // Fallback to OpenAI direct if VPS failed
  if (!reply) {
    provider = "openai-fallback";
    reply = await callOpenAIFallback(prompt, history, systemPrompt);
  }

  return NextResponse.json({
    reply,
    sessionId,
    requestId,
    meta: { provider, model: provider === "openai-fallback" ? MODEL : "vps-claude" },
  });
}
