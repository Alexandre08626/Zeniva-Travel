import { sendEmail } from "./email";

const SITE = "https://www.zenivatravel.com";
const ZENIPAY = "https://www.zenipay.com";

// ── Sofia: Welcome email for new leads ──────────────────────────────
export async function sofiaWelcomeLead(to: string, name: string, destination?: string) {
  const firstName = name.split(" ")[0] || "there";
  const dest = destination || "your dream destination";

  await sendEmail({
    to,
    fromName: "Sofia — Zeniva Travel",
    subject: `${firstName}, your trip to ${dest} starts now — 15% OFF inside!`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#0B1B4D,#0F6CF5);padding:40px 30px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Welcome to Zeniva Travel!</h1>
  <p style="margin:10px 0 0;color:#c7d2fe;font-size:15px;">Your AI concierge is ready</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:30px;">
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi ${firstName}!</p>
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    I'm <strong>Sofia</strong>, part of the Zeniva AI team. Thank you for your interest in <strong>${dest}</strong>!
    Our AI concierge <strong>Lina</strong> is already working on a personalized proposal for you.
  </p>

  <!-- 15% Banner -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;">
  <tr><td style="padding:28px;text-align:center;">
    <h2 style="margin:0 0 8px;color:#fff;font-size:36px;font-weight:900;">15% OFF</h2>
    <p style="margin:0;color:#d1fae5;font-size:16px;font-weight:600;">Your First Booking with Zeniva</p>
    <p style="margin:8px 0 0;color:#a7f3d0;font-size:13px;">Applied automatically — hotels, flights, yachts, or villas</p>
  </td></tr>
  </table>

  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 24px;">
    Here's what happens next:
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">&#10003; Lina analyzes your preferences</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">&#10003; You'll receive a custom proposal within 24h</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">&#10003; 15% discount applied on your first booking</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">&#10003; Secure payment via ZeniPay</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center">
    <a href="${SITE}" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0B1B4D);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(15,108,245,0.4);">
      Talk to Lina →
    </a>
  </td></tr>
  </table>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f8fafc;padding:24px 30px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0 0 8px;color:#64748b;font-size:12px;">Sofia — AI Email Assistant at Zeniva Travel</p>
  <p style="margin:0;color:#94a3b8;font-size:11px;">
    <a href="${SITE}" style="color:#0F6CF5;text-decoration:none;">zenivatravel.com</a> ·
    <a href="${ZENIPAY}" style="color:#0F6CF5;text-decoration:none;">zenipay.com</a>
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`,
  });
}

// ── Sofia: Congratulations for new account signup ────────────────────
export async function sofiaCongratulations(to: string, name: string) {
  const firstName = name.split(" ")[0] || "there";

  await sendEmail({
    to,
    fromName: "Sofia — Zeniva Travel",
    subject: `Congratulations ${firstName}! Your Zeniva account is ready — 15% OFF awaits`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#0B1B4D,#7c3aed);padding:40px 30px;text-align:center;">
  <div style="font-size:48px;margin-bottom:12px;">🎉</div>
  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Welcome to the Zeniva Family!</h1>
  <p style="margin:10px 0 0;color:#c4b5fd;font-size:15px;">Your account is officially active</p>
</td></tr>

<tr><td style="padding:30px;">
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">Congratulations ${firstName}! 🎊</p>
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    You're now part of an exclusive community of travelers who experience the world differently.
    Lina AI is your personal concierge — available 24/7 to plan your perfect trips.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;">
  <tr><td style="padding:28px;text-align:center;">
    <h2 style="margin:0 0 8px;color:#fff;font-size:36px;font-weight:900;">15% OFF</h2>
    <p style="margin:0;color:#d1fae5;font-size:16px;font-weight:600;">Your First Booking — Any Destination</p>
  </td></tr>
  </table>

  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 24px;">Ready to plan your first trip? Just tell Lina where you want to go!</p>

  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center">
    <a href="${SITE}/chat" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0B1B4D);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
      Start Planning with Lina →
    </a>
  </td></tr>
  </table>
</td></tr>

<tr><td style="background:#f8fafc;padding:24px 30px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0 0 8px;color:#64748b;font-size:12px;">Sofia — AI Email Assistant at Zeniva Travel</p>
  <p style="margin:0;color:#94a3b8;font-size:11px;">
    <a href="${SITE}" style="color:#0F6CF5;text-decoration:none;">zenivatravel.com</a> ·
    <a href="${ZENIPAY}" style="color:#0F6CF5;text-decoration:none;">zenipay.com</a>
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`,
  });
}

// ── Ben: Auto-reply for ZeniPay emails ─────────────────────────────
export async function benAutoReplyZeniPay(to: string, originalSubject: string) {
  await sendEmail({
    to,
    from: "zenipay@zeniva.ca",
    fromName: "Ben — ZeniPay AI",
    subject: `Re: ${originalSubject || "Your message"} — ZeniPay Support`,
    replyTo: "zenipay@zeniva.ca",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#0B1B4D,#0F6CF5);padding:30px;text-align:center;">
  <div style="font-size:36px;margin-bottom:8px;">💳</div>
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">ZeniPay Support</h1>
  <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;">Powered by Ben AI</p>
</td></tr>

<tr><td style="padding:30px;">
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">Hello,</p>
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    Thank you for contacting <strong>ZeniPay</strong>. I'm <strong>Ben</strong>, the AI finance agent at ZeniPay. Your message has been received and our team will review it promptly.
  </p>
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    Here's what I can help with:
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">💳 Payment processing & transactions</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">📊 Financial reports & statements</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">🔒 Security & compliance questions</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">💰 Merchant onboarding & payouts</td></tr>
    <tr><td style="padding:8px 0;color:#1e293b;font-size:15px;">🛡️ Disputes & chargebacks</td></tr>
  </table>

  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    A member of our team will respond within <strong>24 hours</strong>. For urgent payment issues, reply directly to this email.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="https://www.zenipay.ca" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0B1B4D);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;">
      Visit ZeniPay Dashboard →
    </a>
  </td></tr>
  </table>

  <p style="color:#64748b;font-size:14px;line-height:1.5;margin:20px 0 0;">
    Best regards,<br>
    <strong>Ben — ZeniPay AI Finance Agent</strong><br>
    <span style="color:#94a3b8;font-size:13px;">zenipay@zeniva.ca | zenipay.ca</span><br>
    <span style="color:#94a3b8;font-size:13px;">Zeniva Inc. · Delaware, USA</span>
  </p>
</td></tr>

<tr><td style="background:#f8fafc;padding:24px 30px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;">💳 ZeniPay — Secure Payments by Zeniva</p>
  <p style="margin:0;color:#94a3b8;font-size:11px;">
    <a href="https://www.zenipay.ca" style="color:#0F6CF5;text-decoration:none;">zenipay.ca</a> ·
    <a href="${SITE}" style="color:#0F6CF5;text-decoration:none;">zenivatravel.com</a>
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`,
  });
}

// ── Sofia: Auto-reply for emails to Alexandre ────────────────────────
export async function sofiaAutoReplyAlexandre(to: string, originalSubject: string) {
  await sendEmail({
    to,
    fromName: "Zeniva Travel & ZeniPay",
    subject: `Re: ${originalSubject || "Your message"} — We'll get back to you shortly`,
    replyTo: "info@zenivatravel.com",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#0B1B4D,#0F6CF5);padding:30px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Thank you for reaching out!</h1>
</td></tr>

<tr><td style="padding:30px;">
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">Hello,</p>
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    Thank you for your message. Alexandre has received your email and will get back to you shortly by email.
  </p>
  <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 20px;">
    In the meantime, feel free to explore our platform or chat with <strong>Lina</strong>, our AI travel concierge, who is available 24/7 to assist you.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="${SITE}/chat" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0B1B4D);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;">
      Chat with Lina →
    </a>
  </td></tr>
  </table>

  <p style="color:#64748b;font-size:14px;line-height:1.5;margin:20px 0 0;">
    Warm regards,<br>
    <strong>The Zeniva Team</strong><br>
    <span style="color:#94a3b8;font-size:13px;">info@zeniva.ca | Cell: +1 581-748-7017 | Office: +1 332-290-0021</span><br>
    <a href="${SITE}" style="color:#0F6CF5;text-decoration:none;font-size:13px;">www.zenivatravel.com</a>
  </p>
</td></tr>

<tr><td style="background:#f8fafc;padding:24px 30px;text-align:center;border-top:1px solid #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="text-align:center;padding:8px;">
      <img src="${SITE}/branding/logo.png" width="28" height="28" alt="Zeniva" style="border-radius:6px;vertical-align:middle;margin-right:8px;">
      <strong style="color:#0B1B4D;font-size:14px;">Zeniva Travel</strong>
      <span style="color:#94a3b8;margin:0 8px;">·</span>
      <strong style="color:#0B1B4D;font-size:14px;">ZeniPay</strong>
    </td>
  </tr>
  </table>
  <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;">
    <a href="${SITE}" style="color:#0F6CF5;text-decoration:none;">zenivatravel.com</a> ·
    <a href="${ZENIPAY}" style="color:#0F6CF5;text-decoration:none;">zenipay.com</a> ·
    Delaware, USA
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`,
  });
}
