import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ─── Invoice keyword detection ─────────────────────────────────────────────
const INVOICE_KEYWORDS = [
  "invoice", "receipt", "facture", "reçu", "recu",
  "payment confirmation", "confirmation de paiement",
  "billing", "statement", "amount due", "amount paid",
  "subscription renewal", "order confirmation", "your order",
  "charge", "payment received", "debit", "credit note",
  "purchase order", "estimate", "devis", "bon de commande",
  "contabo", "vercel", "openai", "twilio", "supabase",
  "google", "facebook ads", "meta ads", "stripe"
];

const IGNORE_SENDERS = [
  "noreply@zeniva", "no-reply@zeniva", "info@zeniva",
  "mailer-daemon", "postmaster"
];

function isInvoiceEmail(subject: string, from: string, body: string): boolean {
  const sub = subject.toLowerCase();
  const text = (body || "").toLowerCase();
  if (IGNORE_SENDERS.some(s => from.toLowerCase().includes(s))) return false;
  return INVOICE_KEYWORDS.some(kw => sub.includes(kw) || text.includes(kw));
}

function extractAmount(text: string): number {
  const patterns = [
    /total[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /amount[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /montant[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /\$([\d,]+\.?\d*)/,
    /([\d,]+\.?\d*)\s*(USD|CAD|EUR)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (val > 0 && val < 1000000) return val;
    }
  }
  return 0;
}

// ─── Gmail IMAP scanner ────────────────────────────────────────────────────
async function scanGmail(limit = 100): Promise<Array<{
  subject: string; from: string; date: string; snippet: string; amount: number;
}>> {
  // Dynamic import to avoid build issues
  const { ImapFlow } = await import("imapflow");
  
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: "info@zeniva.ca",
      pass: "zsyqqdjltafwhlyc", // Gmail App Password
    },
    logger: false,
  });

  const emails: Array<{ subject: string; from: string; date: string; snippet: string; amount: number }> = [];

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    // Search for emails with invoice-related keywords
    const searches = [
      "invoice", "receipt", "facture", "billing", "payment",
      "statement", "order", "subscription", "charge"
    ];

    const uids = new Set<number>();
    for (const kw of searches) {
      try {
        const results = await client.search({ subject: kw }, { uid: true });
        results.forEach(uid => uids.add(uid as number));
        // Also search body
        const bodyResults = await client.search({ body: kw }, { uid: true });
        bodyResults.forEach(uid => uids.add(uid as number));
      } catch {}
    }

    // Take latest N emails
    const uidList = Array.from(uids).sort((a, b) => b - a).slice(0, limit);
    
    if (uidList.length > 0) {
      for await (const msg of client.fetch(uidList.join(","), {
        envelope: true,
        bodyStructure: true,
        bodyParts: ["TEXT", "1"],
        uid: true,
      })) {
        try {
          const subject = msg.envelope?.subject || "";
          const from = msg.envelope?.from?.[0]?.address || msg.envelope?.from?.[0]?.name || "";
          const date = msg.envelope?.date?.toISOString() || new Date().toISOString();
          
          // Get body text
          let bodyText = "";
          const textPart = msg.bodyParts?.get("1") || msg.bodyParts?.get("TEXT");
          if (textPart) {
            bodyText = textPart.toString().slice(0, 1000);
          }
          
          if (isInvoiceEmail(subject, from, bodyText)) {
            emails.push({
              subject,
              from,
              date,
              snippet: bodyText.replace(/\s+/g, " ").trim().slice(0, 300),
              amount: extractAmount(subject + " " + bodyText),
            });
          }
        } catch {}
      }
    }

    await client.logout();
  } catch (err: any) {
    console.error("[imap-scan]", err.message);
    throw err;
  }

  return emails;
}

// ─── Route handler ─────────────────────────────────────────────────────────
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

    console.log("[invoice-scan] Connecting to Gmail IMAP...");
    let emails: Awaited<ReturnType<typeof scanGmail>> = [];
    let scanError = "";
    
    try {
      emails = await scanGmail(150);
      console.log(`[invoice-scan] Found ${emails.length} invoice emails`);
    } catch (err: any) {
      scanError = err.message;
      console.error("[invoice-scan] IMAP failed:", err.message);
    }

    if (scanError) {
      return NextResponse.json({ 
        error: "IMAP connection failed: " + scanError,
        added: 0,
        hint: "Check Gmail App Password in the code"
      }, { status: 500 });
    }

    // Save to Supabase
    let added = 0;
    let skipped = 0;
    
    for (const email of emails) {
      // Check duplicate
      const { data: existing } = await supabase
        .from("invoices")
        .select("id")
        .eq("email_subject", email.subject)
        .eq("email_from", email.from)
        .limit(1);

      if (existing && existing.length > 0) { skipped++; continue; }

      const { error } = await supabase.from("invoices").insert({
        type: "incoming",
        source: "email",
        email_subject: email.subject,
        email_from: email.from,
        email_date: email.date,
        amount: email.amount || 0,
        currency: "CAD",
        status: "pending",
        notes: email.snippet,
        items: [],
      });
      
      if (!error) added++;
    }

    return NextResponse.json({ 
      added, 
      skipped,
      scanned: emails.length,
      message: `Scanned ${emails.length} invoice emails — ${added} new, ${skipped} already imported`
    });

  } catch (error: any) {
    console.error("[invoice-scan]", error);
    return NextResponse.json({ error: error.message, added: 0 }, { status: 500 });
  }
}
