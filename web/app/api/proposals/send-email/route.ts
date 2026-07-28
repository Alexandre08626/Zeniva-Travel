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

function esc(s: string) { return (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function fmtPrice(n: number | string | undefined) {
  if (!n) return "";
  const num = typeof n === "number" ? n : parseFloat(String(n).replace(/[^0-9.]/g, ""));
  if (isNaN(num) || num === 0) return "";
  return `$${Math.round(num).toLocaleString()}`;
}

function flightRow(label: string, f: any) {
  if (!f) return "";
  const logo = f.airlineCode || f.carrierCode || "";
  const logoUrl = logo ? `https://images.kiwi.com/airlines/64/${logo}.png` : "";
  return `
  <tr>
    <td style="padding:16px;border-bottom:1px solid #E8EAF0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:40px;vertical-align:top;">
            ${logoUrl ? `<img src="${logoUrl}" width="32" height="32" style="border-radius:6px;" alt="">` : "✈️"}
          </td>
          <td style="padding-left:12px;">
            <p style="margin:0;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${esc(label)}</p>
            <p style="margin:4px 0 0;font-size:15px;color:#0B1B4D;font-weight:700;">${esc(f.airline || f.name || "Flight")} ${esc(f.flightNumber || "")}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#4B5563;">
              ${esc(f.departureAirport || f.route?.split("→")[0]?.trim() || "")} → ${esc(f.arrivalAirport || f.route?.split("→")[1]?.trim() || "")}
              ${f.departure ? ` · ${esc(f.departure)}` : ""}${f.departureTime ? ` · ${esc(f.departureTime)}` : ""}
            </p>
            <p style="margin:4px 0 0;font-size:12px;color:#9CA3AF;">
              ${f.duration ? esc(f.duration) : ""}${f.stops !== undefined ? ` · ${f.stops === 0 ? "Direct" : f.stops + " stop(s)"}` : ""}${f.cabinClass || f.class ? ` · ${esc(f.cabinClass || f.class)}` : ""}
            </p>
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:18px;font-weight:800;color:#0B1B4D;">${fmtPrice(f.price)}</p>
            <p style="margin:2px 0 0;font-size:11px;color:#9CA3AF;">/person</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function hotelRow(h: any) {
  if (!h) return "";
  const stars = h.stars ? "★".repeat(Math.min(Math.round(Number(h.stars)), 5)) : "";
  const img = h.image || (h.images && h.images[0]) || "";
  return `
  <tr>
    <td style="padding:16px;border-bottom:1px solid #E8EAF0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${img ? `<td style="width:100px;vertical-align:top;"><img src="${img}" width="96" height="64" style="border-radius:8px;object-fit:cover;" alt=""></td>` : ""}
          <td style="padding-left:${img ? "12" : "0"}px;">
            <p style="margin:0;font-size:15px;color:#0B1B4D;font-weight:700;">${esc(h.name || "Hotel")}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#4B5563;">${esc(h.location || "")}</p>
            ${stars ? `<p style="margin:4px 0 0;font-size:13px;color:#D97706;">${stars}</p>` : ""}
            ${h.room ? `<p style="margin:4px 0 0;font-size:12px;color:#6B7280;">${esc(h.room)}</p>` : ""}
            ${h.perks?.length ? `<p style="margin:6px 0 0;font-size:11px;color:#0D9488;">${h.perks.map(esc).join(" · ")}</p>` : ""}
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:18px;font-weight:800;color:#0B1B4D;">${fmtPrice(h.price)}</p>
            <p style="margin:2px 0 0;font-size:11px;color:#9CA3AF;">/night</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function activityRow(a: any) {
  if (!a) return "";
  return `
  <tr>
    <td style="padding:12px 16px;border-bottom:1px solid #E8EAF0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:14px;color:#0B1B4D;font-weight:600;">${esc(a.name || a.title || "Activity")}</p>
            ${a.duration ? `<p style="margin:2px 0 0;font-size:12px;color:#6B7280;">${esc(a.duration)}</p>` : ""}
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:15px;font-weight:700;color:#0B1B4D;">${fmtPrice(a.price)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      proposalId, clientEmail, clientName, destination, dates,
      totalPrice, proposalUrl,
      outboundFlight, returnFlight, hotels = [], activities = [], transfers = [],
      travelers, departureCity,
    } = body;

    if (!clientEmail) {
      return NextResponse.json({ error: "clientEmail is required" }, { status: 400 });
    }

    const name = esc(clientName || "there");
    const dest = esc(destination || "your destination");
    const viewUrl = proposalUrl || `https://www.zenivatravel.com/agent/proposals/preview/${proposalId || ""}`;

    // Build sections
    const hasFlights = outboundFlight || returnFlight;
    const hasHotels = hotels.length > 0;
    const hasActivities = activities.length > 0;
    const hasTransfers = transfers.length > 0;

    const flightsSection = hasFlights ? `
      <tr>
        <td style="padding:32px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #DBEAFE;border-radius:10px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#2563EB,#1D4ED8);padding:12px 16px;">
              <span style="font-size:13px;font-weight:700;color:white;letter-spacing:1px;">✈️ FLIGHTS</span>
            </td></tr>
            ${flightRow("Outbound", outboundFlight)}
            ${flightRow("Return", returnFlight)}
          </table>
        </td>
      </tr>` : "";

    const hotelsSection = hasHotels ? `
      <tr>
        <td style="padding:24px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E9D5FF;border-radius:10px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#7C3AED,#6D28D9);padding:12px 16px;">
              <span style="font-size:13px;font-weight:700;color:white;letter-spacing:1px;">🏨 ACCOMMODATION</span>
            </td></tr>
            ${hotels.map(hotelRow).join("")}
          </table>
        </td>
      </tr>` : "";

    const activitiesSection = hasActivities ? `
      <tr>
        <td style="padding:24px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #FDE68A;border-radius:10px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#D97706,#B45309);padding:12px 16px;">
              <span style="font-size:13px;font-weight:700;color:white;letter-spacing:1px;">🎯 EXPERIENCES</span>
            </td></tr>
            ${activities.map(activityRow).join("")}
          </table>
        </td>
      </tr>` : "";

    const transfersSection = hasTransfers ? `
      <tr>
        <td style="padding:24px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #A7F3D0;border-radius:10px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:12px 16px;">
              <span style="font-size:13px;font-weight:700;color:white;letter-spacing:1px;">🚗 TRANSFERS</span>
            </td></tr>
            ${transfers.map(activityRow).join("")}
          </table>
        </td>
      </tr>` : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Hero Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B1B4D 0%,#0F6CF5 100%);padding:48px 40px;text-align:center;">
              <span style="font-size:36px;font-weight:800;color:#E6B85A;letter-spacing:6px;text-transform:uppercase;">ZENIVA</span>
              <br>
              <span style="font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Travel & Experiences</span>
              <br><br>
              <span style="font-size:24px;font-weight:800;color:white;">Your Trip to ${dest}</span>
              ${dates ? `<br><span style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:8px;display:inline-block;">${esc(dates)}</span>` : ""}
              ${travelers ? `<span style="font-size:14px;color:rgba(255,255,255,0.6);"> · ${travelers} traveler${travelers > 1 ? "s" : ""}</span>` : ""}
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:18px;color:#0B1B4D;font-weight:700;">Hi ${name},</p>
              <p style="margin:0;font-size:15px;color:#4B5563;line-height:1.7;">
                Your personalized travel proposal is ready! Here's everything we've selected for your trip${departureCity ? ` from ${esc(departureCity)}` : ""} to <strong>${dest}</strong>.
              </p>
            </td>
          </tr>

          <!-- Trip Summary Bar -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
                <tr>
                  ${departureCity ? `<td style="padding:14px 16px;text-align:center;border-right:1px solid #E2E8F0;">
                    <p style="margin:0;font-size:10px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">From</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0B1B4D;font-weight:700;">${esc(departureCity)}</p>
                  </td>` : ""}
                  <td style="padding:14px 16px;text-align:center;border-right:1px solid #E2E8F0;">
                    <p style="margin:0;font-size:10px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Destination</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0B1B4D;font-weight:700;">${dest}</p>
                  </td>
                  ${dates ? `<td style="padding:14px 16px;text-align:center;border-right:1px solid #E2E8F0;">
                    <p style="margin:0;font-size:10px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Dates</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#0B1B4D;font-weight:600;">${esc(dates)}</p>
                  </td>` : ""}
                  ${totalPrice ? `<td style="padding:14px 16px;text-align:center;">
                    <p style="margin:0;font-size:10px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Total</p>
                    <p style="margin:4px 0 0;font-size:18px;color:#0D9488;font-weight:800;">${esc(totalPrice)}</p>
                  </td>` : ""}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Flights -->
          ${flightsSection}

          <!-- Hotels -->
          ${hotelsSection}

          <!-- Activities -->
          ${activitiesSection}

          <!-- Transfers -->
          ${transfersSection}

          <!-- CTA -->
          <tr>
            <td style="padding:36px 40px 12px;text-align:center;">
              <a href="${viewUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#7C3AED);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:12px;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(13,148,136,0.3);">
                View Full Proposal →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">Or reply to this email with any questions</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:16px 40px;"><hr style="border:none;border-top:1px solid #E8EAF0;margin:0;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#6B7280;line-height:1.6;">
                Questions? Reply to this email or visit
                <a href="https://zenivatravel.com" style="color:#0F6CF5;text-decoration:none;font-weight:600;">zenivatravel.com</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#9CA3AF;">
                © ${new Date().getFullYear()} Zeniva LLC · Wilmington, Delaware · USA
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
      from: '"Zeniva Travel" <info@zeniva.ca>',
      to: clientEmail,
      subject: `Your Trip to ${destination || "Paradise"} — Proposal from Zeniva ✈️`,
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
