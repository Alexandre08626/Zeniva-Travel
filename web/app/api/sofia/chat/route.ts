import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Auth (same pattern as all outreach routes) ── */
function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

/* ── Config ── */
const ZENIVA_API_URL = process.env.ZENIVA_API_URL || "http://217.216.88.202:8000/chat";
const TIMEOUT_MS = 45000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

/* ── Sofia System Prompt ── */
const SOFIA_SYSTEM_PROMPT = `Tu es Sofia, specialiste IA en email marketing pour Zeniva Travel (zenivatravel.com).

ROLE: Experte en creation de campagnes email, design de templates HTML professionnels, et analyse de performance marketing. Tu es creative, data-driven, et efficace.

CAPACITES:
1. CREER DES TEMPLATES HTML EMAIL: Quand on te demande de creer un template/modele email, genere un template HTML complet et professionnel avec CSS inline. Encadre TOUJOURS le HTML avec ces delimiteurs exacts:
   TEMPLATE_START
   (code HTML complet ici)
   TEMPLATE_END
   TEMPLATE_SUBJECT: (ligne de sujet suggeree)
   TEMPLATE_NAME: (nom du template)

2. STRATEGIE CAMPAGNE: Aide a planifier les campagnes email - segments d'audience, timing optimal, lignes de sujet accrocheuses, strategies A/B testing, sequences de follow-up.

3. RAPPORTS & ANALYSE: Quand des donnees de campagne sont fournies dans le contexte, analyse-les et donne des insights actionables sur les taux de delivrabilite, engagement, et recommandations d'amelioration.

4. COPYWRITING EMAIL: Redige du contenu email convaincant pour l'industrie du voyage (travelers, agents, agencies).

5. FOLLOW-UP: Suggere des sequences de suivi, timing de relance, et strategies de nurturing pour convertir les leads.

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
- Sois concise et actionable
- Utilise des bullet points pour les recommandations
- Formate bien les statistiques quand tu presentes des rapports
- Reponds dans la langue du message (francais par defaut)
- Ne mentionne jamais OpenAI, GPT, Claude ou l'IA qui te propulse
- Tu es Sofia, une membre de l'equipe Zeniva

Signature: "— Sofia, Zeniva Marketing"`;

/* ── Primary: Zeniva VPS API (Claude Sonnet) ── */
async function callZenivaAPI(
  prompt: string,
  history: { role: string; content: string }[],
  requestId: string,
  systemContext?: string
): Promise<{ reply: string; sessionId?: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const fullHistory = systemContext
      ? [{ role: "system", content: systemContext }, ...history.slice(-20)]
      : history.slice(-20);

    const resp = await fetch(ZENIVA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        sessionId: requestId,
        source: "sofia-outreach",
        language: "fr",
        history: fullHistory.map((m) => ({ role: m.role, content: m.content })),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    const reply = data?.response || data?.reply || "";
    if (!reply) return null;
    return { reply, sessionId: data?.sessionId };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/* ── Fallback: OpenAI direct ── */
async function callOpenAIFallback(
  prompt: string,
  history: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  if (!OPENAI_KEY) return "Sofia est temporairement indisponible. Contactez info@zeniva.ca";

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
    if (!resp.ok) return "Sofia est temporairement indisponible. Contactez info@zeniva.ca";
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    clearTimeout(timeout);
    return "Sofia est temporairement indisponible. Contactez info@zeniva.ca";
  }
}

/* ── POST Handler ── */
export async function POST(req: NextRequest) {
  const session = getAuth(req);
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

  /* ── Call AI ── */
  // Primary: Zeniva VPS
  const primary = await callZenivaAPI(prompt, history, sessionId, systemPrompt);
  if (primary?.reply) {
    return NextResponse.json({
      reply: primary.reply,
      sessionId: primary.sessionId || sessionId,
      requestId,
      meta: { provider: "zeniva-claude" },
    });
  }

  // Fallback: OpenAI
  console.warn(`[sofia] ${sessionId} VPS unavailable, falling back to OpenAI`);
  const fallbackReply = await callOpenAIFallback(prompt, history, systemPrompt);

  return NextResponse.json({
    reply: fallbackReply,
    sessionId,
    requestId,
    meta: { provider: "openai-fallback", model: MODEL },
  });
}
