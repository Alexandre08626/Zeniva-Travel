import { NextRequest, NextResponse } from "next/server";
import { getOutreachAuth } from "../auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOFIA_EMAIL_SYSTEM_PROMPT = `Tu es Sofia, la specialiste email marketing de Zeniva Travel, une plateforme technologique de voyage premium basee au Canada. Zeniva agit uniquement comme intermediaire technologique — les services de voyage sont fournis par des fournisseurs tiers.

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
  const session = getOutreachAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, audience, tone } = await req.json();
  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!apiKey && !groqKey) return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
  const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const userPrompt = `Genere un email HTML pour une campagne ${audience || "voyage"}.
Ton: ${tone || "professionnel et engageant"}
Brief: ${prompt}

Retourne uniquement le HTML complet.`;

  async function callChat(systemMsg: string, userMsg: string, maxTokens: number, temperature: number): Promise<{ content: string; ok: boolean; status?: number }> {
    const messages = [
      { role: "system", content: systemMsg },
      { role: "user", content: userMsg },
    ];
    // Primary: Groq
    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({ model: groqModel, messages, max_tokens: maxTokens, temperature }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "";
          if (content) return { content, ok: true };
        }
      } catch { /* fall through */ }
    }
    // Fallback: OpenAI
    if (!apiKey) return { content: "", ok: false, status: 500 };
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI error:", res.status, errText);
      return { content: "", ok: false, status: res.status };
    }
    const data = await res.json();
    return { content: data.choices?.[0]?.message?.content || "", ok: true };
  }

  try {
    const htmlRes = await callChat(SOFIA_EMAIL_SYSTEM_PROMPT, userPrompt, 4000, 0.7);
    if (!htmlRes.ok) {
      if (htmlRes.status === 401) return NextResponse.json({ error: "Cle API invalide" }, { status: 500 });
      if (htmlRes.status === 429) return NextResponse.json({ error: "Limite AI atteinte, reessayez plus tard" }, { status: 429 });
      return NextResponse.json({ error: "Erreur AI" }, { status: 500 });
    }
    let html = htmlRes.content;
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    // Generate subject line
    const subjectRes = await callChat(
      "Tu generes des objets d'email marketing accrocheurs pour Zeniva Travel. Retourne uniquement l'objet, sans guillemets ni explication.",
      `Genere un objet d'email pour: ${prompt}`,
      100,
      0.8
    );
    const subject = subjectRes.ok
      ? subjectRes.content.trim().replace(/^["']|["']$/g, "")
      : "";

    return NextResponse.json({ ok: true, html, subject });
  } catch (err: any) {
    console.error("AI compose error:", err);
    return NextResponse.json({ error: "Erreur de connexion a l'AI" }, { status: 500 });
  }
}
