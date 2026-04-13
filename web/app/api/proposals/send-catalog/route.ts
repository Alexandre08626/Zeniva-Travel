import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(s: string) { return (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

interface CatalogItem {
  type: string;
  name: string;
  location: string;
  price: string;
  thumbnail: string;
  url: string;
}

function itemCard(item: CatalogItem) {
  const colors: Record<string, { bg: string; text: string; badge: string }> = {
    ZeniStay:  { bg: "#FFF8E6", text: "#92400E", badge: "#F59E0B" },
    ZeniYacht: { bg: "#EFF6FF", text: "#1E40AF", badge: "#0F6CF5" },
    ZeniHotel: { bg: "#ECFDF5", text: "#065F46", badge: "#10B981" },
  };
  const c = colors[item.type] || colors.ZeniStay;

  return `
  <tr>
    <td style="padding:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border-radius:16px;overflow:hidden;">
        <tr>
          ${item.thumbnail ? `<td style="width:120px;vertical-align:top;">
            <img src="${esc(item.thumbnail)}" width="120" height="100" style="display:block;object-fit:cover;border-radius:16px 0 0 16px;" alt="">
          </td>` : ""}
          <td style="padding:16px;vertical-align:top;">
            <span style="display:inline-block;background:${c.badge};color:white;font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;margin-bottom:8px;">${esc(item.type)}</span>
            <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:#0B1B4D;">${esc(item.name)}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">${esc(item.location)}</p>
            ${item.price ? `<p style="margin:8px 0 0;font-size:14px;font-weight:800;color:${c.text};">${esc(item.price)}</p>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientEmail, clientName, agentName, items, flight } = body as {
      clientEmail: string;
      clientName?: string;
      agentName?: string;
      items: CatalogItem[];
      flight?: { from: string; departDate?: string; returnDate?: string; travelers?: number } | null;
    };

    if (!clientEmail || !items?.length) {
      return NextResponse.json({ error: "Missing clientEmail or items" }, { status: 400 });
    }

    const name = clientName || "there";
    const agent = agentName || "Your Zeniva Agent";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B1B4D 0%,#0F3A8A 100%);border-radius:20px 20px 0 0;padding:32px;text-align:center;">
            <img src="https://www.zenivatravel.com/branding/lina-avatar.png" width="60" height="60" style="border-radius:50%;border:3px solid rgba(255,255,255,0.3);" alt="Zeniva">
            <p style="margin:12px 0 0;font-size:22px;font-weight:900;color:white;">Curated For You</p>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Handpicked by ${esc(agent)}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:white;padding:32px 24px;">
            <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
              Hi ${esc(name)},<br><br>
              I found some amazing options for you! Here are my top picks from the Zeniva catalog:
            </p>

            <!-- Items -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${items.map(itemCard).join("")}
            </table>

            ${flight ? `
            <!-- Flight -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr><td style="padding:8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border-radius:16px;border:1px solid #BFDBFE;">
                  <tr><td style="padding:16px;">
                    <p style="margin:0;font-size:11px;font-weight:800;color:#1E40AF;text-transform:uppercase;letter-spacing:1px;">✈️ Flight Included</p>
                    <p style="margin:8px 0 0;font-size:15px;font-weight:800;color:#0B1B4D;">From ${esc(flight.from)}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">
                      ${flight.departDate ? `Depart: ${esc(flight.departDate)}` : ""}
                      ${flight.returnDate ? ` · Return: ${esc(flight.returnDate)}` : ""}
                      ${flight.travelers ? ` · ${flight.travelers} traveler${flight.travelers > 1 ? "s" : ""}` : ""}
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:#3B82F6;font-weight:600;">We'll find the best fares for you!</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
            ` : ""}

            <p style="margin:24px 0 0;font-size:14px;color:#64748B;line-height:1.6;">
              Interested in any of these? Just reply to this email or chat with me directly. I'll handle everything for you!
            </p>

            <!-- CTA -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr><td align="center">
                <a href="https://www.zenivatravel.com/chat" style="display:inline-block;background:linear-gradient(90deg,#0F3A8A,#0F6CF5);color:white;font-size:14px;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;">
                  Chat with Lina to Book
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border-radius:0 0 20px 20px;padding:24px;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="margin:0;font-size:11px;color:#94A3B8;">Zeniva Inc. · Delaware, USA · zenivatravel.com</p>
            <p style="margin:4px 0 0;font-size:11px;color:#94A3B8;">Sent by ${esc(agent)} via Zeniva</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendEmail({
      to: clientEmail,
      subject: `${agent} shared ${items.length} travel option${items.length > 1 ? "s" : ""} with you`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to send catalog email" }, { status: 500 });
  }
}
