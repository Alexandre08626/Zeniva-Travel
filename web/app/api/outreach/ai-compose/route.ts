import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

const SOFIA_EMAIL_SYSTEM_PROMPT = `Tu es Sofia, la specialiste email marketing de Zeniva Travel, une agence de voyage premium basee au Canada.

Tu generes des emails HTML professionnels pour des campagnes marketing de voyage.

REGLES:
- Ecris en francais sauf si on te demande l'anglais
- Utilise les variables de personnalisation: {{FIRST_NAME}}, {{LAST_NAME}}, {{COMPANY_NAME}}, {{CITY}}
- Le HTML doit etre compatible avec tous les clients email (inline styles, tables pour le layout)
- Couleurs Zeniva: bleu primaire #0F6CF5, navy premium #0B1B4D, or accent #E6B85A, fond clair #F7F9FC
- Inclus toujours un header avec le logo Zeniva, un body attractif, un CTA clair, et un footer
- Le design doit etre moderne, epure et premium
- Optimise pour mobile (max-width: 600px)
- N'utilise PAS de CSS externe, tout en inline styles

Retourne UNIQUEMENT le code HTML complet de l'email, sans explication ni markdown.`;

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, audience, tone } = await req.json();
  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

  const userPrompt = `Genere un email HTML pour une campagne ${audience || "voyage"}.
Ton: ${tone || "professionnel et engageant"}
Brief: ${prompt}

Retourne uniquement le HTML complet.`;

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SOFIA_EMAIL_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI error:", res.status, errText);
      if (res.status === 401) return NextResponse.json({ error: "Cle API OpenAI invalide" }, { status: 500 });
      if (res.status === 429) return NextResponse.json({ error: "Limite OpenAI atteinte, reessayez plus tard" }, { status: 429 });
      return NextResponse.json({ error: "Erreur OpenAI" }, { status: 500 });
    }

    const data = await res.json();
    let html = data.choices?.[0]?.message?.content || "";
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    // Generate subject line
    const subjectRes = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Tu generes des objets d'email marketing accrocheurs pour Zeniva Travel. Retourne uniquement l'objet, sans guillemets ni explication." },
          { role: "user", content: `Genere un objet d'email pour: ${prompt}` },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    let subject = "";
    if (subjectRes.ok) {
      const subjectData = await subjectRes.json();
      subject = (subjectData.choices?.[0]?.message?.content || "").trim().replace(/^["']|["']$/g, "");
    }

    return NextResponse.json({ ok: true, html, subject });
  } catch (err: any) {
    console.error("AI compose error:", err);
    return NextResponse.json({ error: "Erreur de connexion a OpenAI" }, { status: 500 });
  }
}
