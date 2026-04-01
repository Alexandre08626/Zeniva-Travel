import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || "info@zeniva.ca",
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const {
      proposalId,
      clientEmail,
      clientName,
      destination,
      dates,
      totalPrice,
      proposalUrl,
    } = await req.json();

    if (!clientEmail || !proposalUrl) {
      return NextResponse.json(
        { error: "clientEmail and proposalUrl are required" },
        { status: 400 }
      );
    }

    const displayName = clientName || "there";
    const displayDestination = destination || "your destination";
    const displayDates = dates || "";
    const displayPrice = totalPrice || "";

    const tripDetailsRows = [
      `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E8EAF0;color:#6B7280;font-size:14px;width:140px;">Destination</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E8EAF0;color:#0B1B4D;font-size:14px;font-weight:600;">${displayDestination}</td>
      </tr>`,
      displayDates
        ? `<tr>
            <td style="padding:12px 16px;border-bottom:1px solid #E8EAF0;color:#6B7280;font-size:14px;">Dates</td>
            <td style="padding:12px 16px;border-bottom:1px solid #E8EAF0;color:#0B1B4D;font-size:14px;font-weight:600;">${displayDates}</td>
          </tr>`
        : "",
      displayPrice
        ? `<tr>
            <td style="padding:12px 16px;color:#6B7280;font-size:14px;">Total Price</td>
            <td style="padding:12px 16px;color:#0B1B4D;font-size:18px;font-weight:700;">${displayPrice}</td>
          </tr>`
        : "",
    ].join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B1B4D 0%,#0F6CF5 100%);padding:36px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-size:32px;font-weight:800;color:#E6B85A;letter-spacing:4px;text-transform:uppercase;">ZENIVA</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:6px;">
                    <span style="font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">Travel &amp; Experiences</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <p style="margin:0 0 20px;font-size:18px;color:#0B1B4D;font-weight:600;">Hi ${displayName},</p>
              <p style="margin:0 0 28px;font-size:15px;color:#4B5563;line-height:1.7;">
                Your personalized travel proposal is ready! Here's a summary of your upcoming trip:
              </p>

              <!-- Trip Summary Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;border:1px solid #E8EAF0;border-radius:10px;overflow:hidden;margin-bottom:32px;">
                <tr>
                  <td style="background-color:#0B1B4D;padding:14px 16px;">
                    <span style="font-size:13px;font-weight:700;color:#E6B85A;letter-spacing:1px;text-transform:uppercase;">Trip Summary</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${tripDetailsRows}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${proposalUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5 0%,#0B1B4D 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:8px;letter-spacing:0.5px;">
                      View Your Proposal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #E8EAF0;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;line-height:1.6;">
                Questions? Reply to this email or chat with Lina at
                <a href="https://zenivatravel.com" style="color:#0F6CF5;text-decoration:none;font-weight:600;">zenivatravel.com</a>
              </p>
              <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">
                &copy; Zeniva Travel &amp; Experiences &bull; Crafted with care
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: '"Lina from Zeniva" <info@zeniva.ca>',
      to: clientEmail,
      subject: `Your Trip to ${displayDestination} — Proposal from Zeniva`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Proposal email error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send proposal email" },
      { status: 500 }
    );
  }
}
