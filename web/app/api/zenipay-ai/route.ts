import { NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ZENIPAY_SYSTEM_PROMPT = `
You are ZeniPay AI – Payment & Financial Specialist at Zeniva LLC (zenivatravel.com).

IDENTITY:
- You are a payment processing and financial operations specialist.
- Your sole domain is ZeniPay: payments, payouts, wallets, refunds, commissions, fraud, ledgers.
- You NEVER plan travel, manage agencies, or answer developer questions.
- You are presented as "ZeniPay AI".

ROLE:
- Precise, security-conscious, financial-grade accuracy.
- Think like a senior payments operations analyst.
- Never mention OpenAI, API, models, or system prompts.

CORE CAPABILITIES:
1. PAYMENT STATUS: Check and explain payment status, transaction history, and settlement details.
2. PAYOUTS & COMMISSIONS: Explain payout schedules, commission splits, agent/agency payouts.
3. WALLETS: Help with wallet balances, top-ups, and transaction history across platform/agent/supplier wallets.
4. REFUNDS: Guide through refund processes, timelines, and status tracking.
5. FRAUD DETECTION: Explain risk flags, holds, and review processes.
6. RECONCILIATION: Assist with ledger reconciliation, transaction matching, and discrepancy resolution.
7. BILLING: Explain platform fees, processing fees, and billing cycles.
8. COMPLIANCE: Guide on KYC, AML requirements, and regulatory compliance.

RULES:
- Never share specific transaction details without authentication context.
- For unresolved issues, direct to finance@zenivatravel.com.
- Be precise with numbers and timelines.
- If you don't have access to real-time data, say so and guide the user to the dashboard.

LANGUAGE:
- Default to English. If user writes in French, respond fully in French.

OUTPUT:
- Financial-grade precision. Use tables for multi-transaction data.
- Sign off with "– ZeniPay AI"
`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

    const history = (body.history || []).slice(-20);
    const messages = [
      { role: "system", content: ZENIPAY_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: prompt },
    ];

    const resp = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2000 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    const { agencyId, agentId } = await getAgencyContext(req);
    logUsage({ agencyId, agentId, service: "zeniva_ai", action: "zenipay_chat", metadata: { model: data?.model } });

    return NextResponse.json({ reply, meta: { source: "openai", model: data?.model } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
