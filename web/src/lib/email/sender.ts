import nodemailer from "nodemailer";

const FROM_NAME = process.env.EMAIL_FROM_NAME || "Zeniva Travel";
const FROM_EMAIL = process.env.EMAIL_FROM || "info@zenivatravel.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const useSMTP = process.env.SMTP_HOST && process.env.SMTP_USER;
  if (useSMTP) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS || "",
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "info@zenivatravel.com",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }

  return transporter;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const t = getTransporter();

  if (!process.env.SMTP_PASS && !process.env.SMTP_USER) {
    return { success: false, error: "SMTP not configured — set SMTP_PASS / SMTP_USER in .env.local" };
  }

  try {
    const info = await t.sendMail({
      from: `"${params.fromName || FROM_NAME}" <${params.from || FROM_EMAIL}>`,
      replyTo: params.replyTo || process.env.EMAIL_REPLY_TO || "info@zenivatravel.com",
      to: params.to,
      subject: params.subject,
      text: params.text || "",
      html: params.html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown email error" };
  }
}

export function getEmailConfig() {
  return {
    fromEmail: FROM_EMAIL,
    fromName: FROM_NAME,
    smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.SMTP_PORT || "587",
    smtpUser: process.env.SMTP_USER || "info@zenivatravel.com",
    smtpPassSet: !!process.env.SMTP_PASS,
    replyTo: process.env.EMAIL_REPLY_TO || "info@zenivatravel.com",
  };
}
