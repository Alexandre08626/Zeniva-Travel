import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Keywords that indicate an invoice/receipt in an email
const INVOICE_KEYWORDS = [
  "invoice", "receipt", "facture", "reçu", "payment confirmation", "confirmation de paiement",
  "billing statement", "statement of account", "your bill", "amount due", "amount paid",
  "subscription renewal", "charge", "payment received", "order confirmation"
];

const AMOUNT_PATTERNS = [
  /\$\s*[\d,]+\.?\d*/g,
  /USD\s*[\d,]+\.?\d*/gi,
  /CAD\s*[\d,]+\.?\d*/gi,
  /[\d,]+\.?\d*\s*(USD|CAD|EUR)/gi,
  /total[:\s]+\$?\s*[\d,]+\.?\d*/gi,
  /amount[:\s]+\$?\s*[\d,]+\.?\d*/gi,
];

function extractAmount(text: string): number {
  for (const pattern of AMOUNT_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      const nums = matches[0].match(/[\d,]+\.?\d*/);
      if (nums) return parseFloat(nums[0].replace(/,/g, ""));
    }
  }
  return 0;
}

function isInvoiceEmail(subject: string, body: string): boolean {
  const text = (subject + " " + body).toLowerCase();
  return INVOICE_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== "Bearer zeniva-secret-2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch recent emails via n8n Gmail IMAP or direct Gmail API
    // Using n8n webhook to fetch emails
    let emails: Array<{ subject: string; from: string; date: string; body: string; snippet: string }> = [];
    
    try {
      // Try to fetch from Gmail via n8n
      const n8nRes = await fetch("https://vmi3097009.contaboserver.net/webhook/fetch-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "info@zeniva.ca", limit: 50 }),
        signal: AbortSignal.timeout(10000),
      });
      if (n8nRes.ok) {
        const data = await n8nRes.json();
        emails = data.emails || [];
      }
    } catch {
      // n8n not configured for this endpoint — use demo mode
    }

    // If no emails from n8n, return helpful message
    if (!emails.length) {
      return NextResponse.json({ 
        added: 0, 
        message: "Email scanner not yet configured. Connect your Gmail in n8n to enable automatic invoice detection.",
        hint: "Create a n8n workflow at /webhook/fetch-invoices to scan your inbox"
      });
    }

    // Filter invoice emails and save to DB
    let added = 0;
    for (const email of emails) {
      if (!isInvoiceEmail(email.subject, email.body || email.snippet || "")) continue;
      
      const amount = extractAmount(email.body || email.snippet || "");
      
      // Check if already exists (by subject + date)
      const { data: existing } = await supabase
        .from("invoices")
        .select("id")
        .eq("email_subject", email.subject)
        .eq("email_date", email.date)
        .limit(1);
      
      if (existing && existing.length > 0) continue;

      // Save incoming invoice
      await supabase.from("invoices").insert({
        type: "incoming",
        source: "email",
        email_subject: email.subject,
        email_from: email.from,
        email_date: email.date,
        amount: amount || 0,
        currency: "CAD",
        status: "pending",
        notes: email.snippet || email.body?.slice(0, 200),
        items: [],
      });
      added++;
    }

    return NextResponse.json({ added, total: emails.length });
  } catch (error: any) {
    console.error("[invoice-scan]", error);
    return NextResponse.json({ error: error.message, added: 0 }, { status: 500 });
  }
}
