import nodemailer from "nodemailer";

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
      rateDelta: 2000,
      rateLimit: 1,
    });
  }
  return _transporter;
}

const FROM_EMAIL = process.env.SMTP_USER || "info@zenivatravel.com";

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

  await getTransporter().sendMail({
    from,
    to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    headers: {
      "List-Unsubscribe": `<mailto:unsubscribe@zenivatravel.com?subject=unsubscribe>`,
    },
  });
}
