import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "info@zenivatravel.com";
const FROM_DOMAIN = FROM_EMAIL.split("@")[1] || "zeniva.ca";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export async function sendEmail(opts: SendEmailOptions) {
  const fromName = opts.fromName || "Zeniva Travel";
  const from = `${fromName} <${opts.from || FROM_EMAIL}>`;

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    headers: {
      "List-Unsubscribe": `<mailto:unsubscribe@${FROM_DOMAIN}?subject=unsubscribe>`,
      ...opts.headers,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/** Send a batch of emails with a delay between each to respect rate limits */
export async function sendEmailBatch(
  emails: SendEmailOptions[],
  opts?: { delayMs?: number; onProgress?: (sent: number, failed: number, total: number) => void }
) {
  const delayMs = opts?.delayMs ?? 250; // 250ms between sends = ~4/sec, well within Resend's limits
  let sent = 0;
  let failed = 0;
  const errors: { email: string; error: string }[] = [];

  for (const email of emails) {
    try {
      await sendEmail(email);
      sent++;
    } catch (err: any) {
      failed++;
      const to = Array.isArray(email.to) ? email.to.join(",") : email.to;
      errors.push({ email: to, error: err?.message || "Unknown error" });
    }

    opts?.onProgress?.(sent, failed, emails.length);

    // Throttle: wait between sends
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return { sent, failed, errors };
}
