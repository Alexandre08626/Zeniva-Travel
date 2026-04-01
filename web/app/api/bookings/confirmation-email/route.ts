import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * POST /api/bookings/confirmation-email
 * Sends a booking confirmation email to the client after successful payment & booking.
 */
export async function POST(request: Request) {
  try {
    const { clientEmail, clientName, destination, dates, totalPrice, confirmations, bookingId } =
      await request.json();

    if (!clientEmail) {
      return NextResponse.json({ error: "Missing clientEmail" }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || "info@zeniva.ca";
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (!smtpPass) {
      return NextResponse.json({ error: "SMTP not configured" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const flightRef = confirmations?.flight?.bookingReference || "Pending";
    const hotelRef = confirmations?.hotel?.confirmationNumber || "Pending";

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0B1B4D,#0F6CF5);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <h1 style="color:white;font-size:28px;margin:0;font-weight:800;">Booking Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your trip is booked and ready to go</p>
    </div>

    <!-- Content -->
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <p style="color:#334155;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Hi ${clientName || "there"},
      </p>
      <p style="color:#334155;font-size:16px;line-height:1.6;margin:0 0 24px;">
        Great news! Your payment has been received and your trip to <strong>${destination || "your destination"}</strong> is now confirmed.
      </p>

      <!-- Trip Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h3 style="color:#0B1B4D;margin:0 0 16px;font-size:18px;">Trip Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">Destination</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${destination || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">Dates</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${dates || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">Flight Reference</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${flightRef}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;">Hotel Confirmation</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${hotelRef}</td>
          </tr>
          <tr style="border-top:2px solid #e2e8f0;">
            <td style="padding:12px 0 0;color:#0f172a;font-size:16px;font-weight:800;">Total Paid</td>
            <td style="padding:12px 0 0;color:#0d9488;font-size:20px;font-weight:800;text-align:right;">$${totalPrice || "0"}</td>
          </tr>
        </table>
      </div>

      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        You will receive your detailed flight itinerary and hotel voucher within 24 hours. If you have any questions, simply reply to this email or chat with Lina at zenivatravel.com.
      </p>

      <div style="text-align:center;">
        <a href="https://www.zenivatravel.com" style="display:inline-block;background:linear-gradient(135deg,#0d9488,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px;">
          Visit Zeniva Travel
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#94a3b8;font-size:12px;">
      <p style="margin:0;">Zeniva LLC · Wilmington, Delaware · USA</p>
      <p style="margin:4px 0 0;">Booking ID: ${bookingId || "—"}</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: '"Zeniva Travel" <info@zeniva.ca>',
      to: clientEmail,
      subject: `Booking Confirmed — ${destination || "Your Trip"} | Zeniva`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Booking Confirmation Email] Error:", err);
    return NextResponse.json({ error: err?.message || "Failed to send" }, { status: 500 });
  }
}
