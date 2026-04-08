import nodemailer from "nodemailer";
import { convert } from "html-to-text";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || "info@zenivatravel.com",
        pass: process.env.SMTP_PASS || "",
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateDelta: 5000,
      rateLimit: 1,
    });
  }
  return _transporter;
}

const FROM_EMAIL = process.env.SMTP_USER || "info@zenivatravel.com";
const PHYSICAL_ADDRESS = "Zeniva LLC · 8 The Green, Ste A · Dover, DE 19901 · USA";
const UNSUBSCRIBE_EMAIL = "unsubscribe@zenivatravel.com";

function addUnsubscribeFooter(html: string, recipientEmail: string): string {
  const unsubLink = `mailto:${UNSUBSCRIBE_EMAIL}?subject=Unsubscribe&body=Please%20remove%20${encodeURIComponent(recipientEmail)}%20from%20your%20mailing%20list.`;
  const footer = `
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
      <p style="margin:0 0 8px;">${PHYSICAL_ADDRESS}</p>
      <p style="margin:0 0 4px;">You received this email because you interacted with Zeniva Travel.</p>
      <p style="margin:0;"><a href="${unsubLink}" style="color:#6366f1;text-decoration:underline;">Unsubscribe</a> · <a href="https://www.zenivatravel.com/privacy" style="color:#6366f1;text-decoration:underline;">Privacy Policy</a></p>
    </div>`;

  // Insert before closing </body> or </html>, or append
  if (html.includes("</body>")) return html.replace("</body>", footer + "</body>");
  if (html.includes("</html>")) return html.replace("</html>", footer + "</html>");
  return html + footer;
}

function htmlToPlainText(html: string): string {
  try {
    return convert(html, { wordwrap: 80, selectors: [{ selector: "a", options: { hideLinkHrefIfSameAsText: true } }] });
  } catch {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
};

export async function sendEmail(opts: SendEmailOptions) {
  const fromName = opts.fromName || "Zeniva Travel";
  const from = `"${fromName}" <${opts.from || FROM_EMAIL}>`;
  const toAddr = Array.isArray(opts.to) ? opts.to[0] : opts.to;

  // Add unsubscribe footer + physical address to HTML
  const htmlWithFooter = addUnsubscribeFooter(opts.html, toAddr);
  // Generate plain text version
  const textVersion = htmlToPlainText(htmlWithFooter);

  await getTransporter().sendMail({
    from,
    to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
    subject: opts.subject,
    html: htmlWithFooter,
    text: textVersion,
    replyTo: opts.replyTo,
    headers: {
      "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_EMAIL}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
