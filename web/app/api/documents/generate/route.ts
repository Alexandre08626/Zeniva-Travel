import { NextRequest, NextResponse } from "next/server";

// ─── Document Templates ───────────────────────────────────────────────────────

function zenivaBranding() {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f1f5f9; color: #0B1B4D; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { max-width: 800px; margin: 0 auto; padding: 24px; }
      .card { background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(11,27,77,0.08); overflow: hidden; margin-bottom: 20px; }
      .header { background: linear-gradient(135deg, #0B1B4D 0%, #1a3a8f 100%); padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; }
      .logo-area { display: flex; align-items: center; gap: 14px; }
      .logo-icon { width: 44px; height: 44px; background: rgba(230,184,90,0.15); border: 2px solid #E6B85A; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
      .logo-text { color: #fff; }
      .logo-text .name { font-size: 20px; font-weight: 900; letter-spacing: -0.02em; }
      .logo-text .tag { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 500; }
      .badge { background: rgba(230,184,90,0.15); border: 1.5px solid #E6B85A; border-radius: 20px; padding: 6px 16px; color: #E6B85A; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; }
      .section { padding: 28px 32px; }
      .section + .section { border-top: 1px solid #f1f5f9; }
      .label { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
      .value { font-size: 15px; font-weight: 600; color: #0B1B4D; }
      .value-lg { font-size: 22px; font-weight: 900; color: #0B1B4D; letter-spacing: -0.02em; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
      .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; }
      .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; }
      .flight-row { display: flex; align-items: center; gap: 20px; }
      .airport { text-align: center; flex: 1; }
      .airport-code { font-size: 42px; font-weight: 900; color: #0B1B4D; letter-spacing: -0.04em; }
      .airport-name { font-size: 12px; color: #64748b; margin-top: 2px; }
      .flight-line { flex: 2; display: flex; align-items: center; gap: 8px; }
      .line { flex: 1; height: 2px; background: linear-gradient(90deg, #E6B85A, #0F6CF5); }
      .plane { font-size: 24px; transform: rotate(90deg); }
      .gold-strip { background: linear-gradient(135deg, #E6B85A, #d4a027); padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
      .ref-box { background: #0B1B4D; color: #E6B85A; border-radius: 12px; padding: 12px 20px; font-size: 20px; font-weight: 900; letter-spacing: 0.08em; font-family: monospace; }
      .status-ok { display: inline-flex; align-items: center; gap: 6px; background: #d1fae5; color: #065f46; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; }
      .status-paid { display: inline-flex; align-items: center; gap: 6px; background: #dbeafe; color: #1e40af; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; }
      .divider { border: none; border-top: 2px dashed #e2e8f0; margin: 4px 0; }
      .footer { text-align: center; padding: 20px; background: #0B1B4D; color: rgba(255,255,255,0.5); font-size: 11px; }
      .footer a { color: #E6B85A; text-decoration: none; }
      .table { width: 100%; border-collapse: collapse; }
      .table th { background: #f8fafc; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e2e8f0; }
      .table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      .table tr:last-child td { border-bottom: none; }
      .total-row td { font-size: 16px; font-weight: 900; color: #0B1B4D; padding-top: 16px; }
      .qr-placeholder { width: 80px; height: 80px; background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
      @media print { body { background: #fff; } .page { padding: 0; } }
      @media (max-width: 600px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; } .section { padding: 20px; } .flight-row { flex-direction: column; } .airport-code { font-size: 32px; } }
    </style>
  `;
}

function docHeader(type: string, ref: string) {
  const labels: Record<string, string> = {
    flight: "✈️ FLIGHT CONFIRMATION",
    hotel: "🏨 HOTEL VOUCHER",
    transfer: "🚗 TRANSFER CONFIRMATION",
    excursion: "🎯 EXCURSION TICKET",
    invoice: "🧾 INVOICE & RECEIPT",
  };
  return `
    <div class="header">
      <div class="logo-area">
        <img src="https://www.zenivatravel.com/branding/lina-avatar.png" alt="Lina" style="width:40px;height:40px;border-radius:50%;border:2px solid rgba(230,184,90,0.8);object-fit:cover;" />
        <div class="logo-text">
          <div class="name">Zeniva</div>
          <div class="tag">AI-Powered Luxury Travel</div>
        </div>
      </div>
      <div>
        <div class="badge">${labels[type] || "DOCUMENT"}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:11px;text-align:right;margin-top:6px;">Ref: ${ref}</div>
      </div>
    </div>
  `;
}

function docFooter() {
  return `
    <div class="footer">
      <div style="margin-bottom:6px;">
        <strong style="color:#E6B85A;">Zeniva</strong> — AI-Powered Luxury Travel Concierge
      </div>
      <div>📧 <a href="mailto:info@zeniva.ca">info@zeniva.ca</a> &nbsp;·&nbsp; 📞 <a href="tel:+13322900021">+1 (332) 290-0021</a> &nbsp;·&nbsp; 🌐 <a href="https://www.zenivatravel.com">zenivatravel.com</a></div>
      <div style="margin-top:8px;font-size:10px;">Zeniva Inc. — Delaware, USA &nbsp;·&nbsp; Available 24/7</div>
    </div>
  `;
}

// ─── Flight Confirmation ──────────────────────────────────────────────────────
function generateFlightDoc(params: URLSearchParams) {
  const ref = params.get("ref") || "ZNV" + Math.floor(Math.random() * 9000 + 1000);
  const passenger = params.get("passenger") || "John Doe";
  const from = params.get("from") || "YUL";
  const to = params.get("to") || "CDG";
  const fromCity = params.get("fromCity") || "Montreal";
  const toCity = params.get("toCity") || "Paris";
  const depart = params.get("depart") || "2026-06-15 08:30";
  const arrive = params.get("arrive") || "2026-06-15 21:45";
  const airline = params.get("airline") || "Air Canada";
  const flight = params.get("flight") || "AC870";
  const seat = params.get("seat") || "14C";
  const cabin = params.get("cabin") || "Economy";
  const baggage = params.get("baggage") || "1x23kg + 1x10kg carry-on";
  const pnr = params.get("pnr") || ref.toUpperCase();
  const price = params.get("price") || "0";
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flight Confirmation — ${ref}</title>${zenivaBranding()}</head><body>
<div class="page">
  <div class="card">
    ${docHeader("flight", ref)}
    
    <!-- PNR Strip -->
    <div class="gold-strip">
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(11,27,77,0.6);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Booking Reference (PNR)</div>
        <div class="ref-box">${pnr}</div>
      </div>
      <div style="text-align:right;">
        <span class="status-ok">✓ Confirmed</span>
        <div style="font-size:11px;color:rgba(11,27,77,0.5);margin-top:6px;">Issued ${generatedDate}</div>
      </div>
    </div>

    <!-- Flight Info -->
    <div class="section">
      <div style="margin-bottom:20px;">
        <div class="label">Airline & Flight Number</div>
        <div class="value-lg">${airline} &nbsp;<span style="color:#0F6CF5;">${flight}</span></div>
      </div>

      <div class="info-box" style="margin-bottom:20px;">
        <div class="flight-row">
          <div class="airport">
            <div class="airport-code">${from}</div>
            <div class="airport-name">${fromCity}</div>
            <div style="font-size:13px;font-weight:700;color:#0B1B4D;margin-top:8px;">${depart}</div>
          </div>
          <div class="flight-line">
            <div class="line"></div>
            <div class="plane">✈</div>
            <div class="line"></div>
          </div>
          <div class="airport">
            <div class="airport-code">${to}</div>
            <div class="airport-name">${toCity}</div>
            <div style="font-size:13px;font-weight:700;color:#0B1B4D;margin-top:8px;">${arrive}</div>
          </div>
        </div>
      </div>

      <div class="grid-4">
        <div class="info-box">
          <div class="label">Passenger</div>
          <div class="value" style="font-size:13px;">${passenger}</div>
        </div>
        <div class="info-box">
          <div class="label">Seat</div>
          <div class="value">${seat}</div>
        </div>
        <div class="info-box">
          <div class="label">Cabin Class</div>
          <div class="value">${cabin}</div>
        </div>
        <div class="info-box">
          <div class="label">Baggage</div>
          <div class="value" style="font-size:12px;">${baggage}</div>
        </div>
      </div>
    </div>

    <hr class="divider">

    <!-- Terminal Info -->
    <div class="section">
      <div class="grid-2">
        <div>
          <div class="label">⚠️ Important Reminders</div>
          <ul style="margin-top:8px;padding-left:18px;font-size:13px;color:#475569;line-height:1.8;">
            <li>Arrive at airport <strong>2–3 hours</strong> before departure</li>
            <li>Carry a <strong>valid photo ID</strong> or passport</li>
            <li>Check in online 24h before for best seats</li>
            <li>Liquids under 100ml in carry-on bag</li>
          </ul>
        </div>
        <div style="text-align:center;">
          <div class="qr-placeholder" style="margin:0 auto;">🎫</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:8px;">Mobile boarding pass<br>available at check-in</div>
        </div>
      </div>
    </div>

    ${price !== "0" ? `
    <div class="gold-strip" style="padding:12px 32px;">
      <div style="font-size:13px;font-weight:600;color:rgba(11,27,77,0.7);">Total Paid</div>
      <div style="font-size:22px;font-weight:900;color:#0B1B4D;">$${Number(price).toLocaleString()}</div>
    </div>` : ""}

    ${docFooter()}
  </div>
</div>
</body></html>`;
}

// ─── Hotel Voucher ────────────────────────────────────────────────────────────
function generateHotelDoc(params: URLSearchParams) {
  const ref = params.get("ref") || "H-" + Math.floor(Math.random() * 90000 + 10000);
  const guest = params.get("guest") || "John Doe";
  const hotel = params.get("hotel") || "Grand Palace Hotel";
  const address = params.get("address") || "123 Rue de Rivoli, Paris, France";
  const checkin = params.get("checkin") || "2026-06-15";
  const checkout = params.get("checkout") || "2026-06-22";
  const room = params.get("room") || "Deluxe Double Room";
  const nights = params.get("nights") || "7";
  const guests = params.get("guests") || "2";
  const price = params.get("price") || "0";
  const phone = params.get("phone") || "+33 1 40 20 90 98";
  const checkinTime = params.get("checkinTime") || "15:00";
  const checkoutTime = params.get("checkoutTime") || "11:00";
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hotel Voucher — ${ref}</title>${zenivaBranding()}</head><body>
<div class="page">
  <div class="card">
    ${docHeader("hotel", ref)}

    <div class="gold-strip">
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(11,27,77,0.6);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Booking Reference</div>
        <div class="ref-box">${ref}</div>
      </div>
      <div style="text-align:right;">
        <span class="status-ok">✓ Confirmed</span>
        <span class="status-paid" style="margin-left:8px;">💳 Paid</span>
        <div style="font-size:11px;color:rgba(11,27,77,0.5);margin-top:6px;">Issued ${generatedDate}</div>
      </div>
    </div>

    <div class="section">
      <div style="margin-bottom:20px;">
        <div class="label">Property</div>
        <div class="value-lg">🏨 ${hotel}</div>
        <div style="font-size:13px;color:#64748b;margin-top:4px;">📍 ${address}</div>
        ${phone ? `<div style="font-size:13px;color:#0F6CF5;margin-top:2px;">📞 ${phone}</div>` : ""}
      </div>

      <div class="grid-2" style="margin-bottom:20px;">
        <div class="info-box" style="border:2px solid #d1fae5;">
          <div class="label">✅ Check-In</div>
          <div class="value-lg" style="font-size:18px;">${new Date(checkin).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</div>
          <div style="font-size:13px;color:#64748b;margin-top:4px;">After ${checkinTime}</div>
        </div>
        <div class="info-box" style="border:2px solid #fef3c7;">
          <div class="label">🚪 Check-Out</div>
          <div class="value-lg" style="font-size:18px;">${new Date(checkout).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</div>
          <div style="font-size:13px;color:#64748b;margin-top:4px;">Before ${checkoutTime}</div>
        </div>
      </div>

      <div class="grid-3">
        <div class="info-box">
          <div class="label">Room Type</div>
          <div class="value" style="font-size:13px;">${room}</div>
        </div>
        <div class="info-box">
          <div class="label">Duration</div>
          <div class="value">${nights} nights</div>
        </div>
        <div class="info-box">
          <div class="label">Guests</div>
          <div class="value">${guests} guests</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="label" style="margin-bottom:12px;">👤 Guest Information</div>
      <div class="grid-2">
        <div class="info-box">
          <div class="label">Guest Name</div>
          <div class="value">${guest}</div>
        </div>
        <div class="info-box">
          <div class="label">Booked By</div>
          <div class="value">Zeniva</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="label" style="margin-bottom:10px;">⚠️ Important Information</div>
      <ul style="padding-left:18px;font-size:13px;color:#475569;line-height:1.8;">
        <li>Present this voucher and a <strong>valid photo ID</strong> at check-in</li>
        <li>Early check-in/late check-out subject to availability — contact hotel directly</li>
        <li>Any incidental charges (mini-bar, room service) payable at hotel</li>
        <li>Cancellation policy: 48h notice required</li>
      </ul>
    </div>

    ${price !== "0" ? `
    <div class="gold-strip">
      <div style="font-size:13px;font-weight:600;color:rgba(11,27,77,0.7);">Total Accommodation Cost</div>
      <div style="font-size:22px;font-weight:900;color:#0B1B4D;">$${Number(price).toLocaleString()}</div>
    </div>` : ""}

    ${docFooter()}
  </div>
</div>
</body></html>`;
}

// ─── Transfer Confirmation ────────────────────────────────────────────────────
function generateTransferDoc(params: URLSearchParams) {
  const ref = params.get("ref") || "TR-" + Math.floor(Math.random() * 9000 + 1000);
  const passenger = params.get("passenger") || "John Doe";
  const from = params.get("from") || "CDG Airport — Terminal 2E";
  const to = params.get("to") || "Grand Palace Hotel, Paris";
  const date = params.get("date") || "2026-06-15";
  const time = params.get("time") || "22:30";
  const vehicle = params.get("vehicle") || "Mercedes E-Class (Private)";
  const driver = params.get("driver") || "Available on request";
  const passengers = params.get("passengers") || "2";
  const luggage = params.get("luggage") || "2 large bags";
  const price = params.get("price") || "0";
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Transfer Confirmation — ${ref}</title>${zenivaBranding()}</head><body>
<div class="page">
  <div class="card">
    ${docHeader("transfer", ref)}

    <div class="gold-strip">
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(11,27,77,0.6);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Transfer Reference</div>
        <div class="ref-box">${ref}</div>
      </div>
      <div style="text-align:right;">
        <span class="status-ok">✓ Confirmed</span>
        <div style="font-size:11px;color:rgba(11,27,77,0.5);margin-top:6px;">Issued ${generatedDate}</div>
      </div>
    </div>

    <div class="section">
      <div style="margin-bottom:24px;">
        <div class="label" style="margin-bottom:12px;">Transfer Route</div>
        <div style="display:flex;align-items:center;gap:16px;background:#f8fafc;border-radius:16px;padding:20px;">
          <div style="flex:1;text-align:center;">
            <div style="font-size:28px;margin-bottom:6px;">🛬</div>
            <div style="font-size:13px;font-weight:700;color:#0B1B4D;">${from}</div>
          </div>
          <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:60px;height:2px;background:linear-gradient(90deg,#E6B85A,#0F6CF5);border-radius:2px;"></div>
            <div style="font-size:18px;">🚗</div>
            <div style="width:60px;height:2px;background:linear-gradient(90deg,#0F6CF5,#E6B85A);border-radius:2px;"></div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="font-size:28px;margin-bottom:6px;">🏨</div>
            <div style="font-size:13px;font-weight:700;color:#0B1B4D;">${to}</div>
          </div>
        </div>
      </div>

      <div class="grid-4" style="margin-bottom:20px;">
        <div class="info-box">
          <div class="label">Date</div>
          <div class="value" style="font-size:13px;">${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
        </div>
        <div class="info-box">
          <div class="label">Pickup Time</div>
          <div class="value">${time}</div>
        </div>
        <div class="info-box">
          <div class="label">Passengers</div>
          <div class="value">${passengers}</div>
        </div>
        <div class="info-box">
          <div class="label">Luggage</div>
          <div class="value" style="font-size:12px;">${luggage}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="info-box">
          <div class="label">Vehicle</div>
          <div class="value">🚗 ${vehicle}</div>
        </div>
        <div class="info-box">
          <div class="label">Driver / Contact</div>
          <div class="value" style="font-size:13px;">${driver}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="label" style="margin-bottom:10px;">ℹ️ Instructions</div>
      <ul style="padding-left:18px;font-size:13px;color:#475569;line-height:1.8;">
        <li>Your driver will be waiting at the <strong>arrivals hall</strong> with a name sign</li>
        <li>If you cannot find your driver, call <strong>Zeniva: +1 (332) 290-0021</strong></li>
        <li>Transfer includes waiting time: <strong>60 min for flights, 15 min for hotels</strong></li>
        <li>Extra stops may be subject to additional charge</li>
      </ul>
    </div>

    ${price !== "0" ? `
    <div class="gold-strip">
      <div style="font-size:13px;font-weight:600;color:rgba(11,27,77,0.7);">Transfer Price (Prepaid)</div>
      <div style="font-size:22px;font-weight:900;color:#0B1B4D;">$${Number(price).toLocaleString()}</div>
    </div>` : ""}

    ${docFooter()}
  </div>
</div>
</body></html>`;
}

// ─── Invoice / Receipt ────────────────────────────────────────────────────────
function generateInvoiceDoc(params: URLSearchParams) {
  const ref = params.get("ref") || "INV-" + Math.floor(Math.random() * 9000 + 1000);
  const client = params.get("client") || "John Doe";
  const email = params.get("email") || "";
  const destination = params.get("destination") || "Paris, France";
  const total = parseFloat(params.get("total") || "0");
  const discount = parseFloat(params.get("discount") || "0");
  const taxes = parseFloat(params.get("taxes") || "0");
  const paid = parseFloat(params.get("paid") || total.toString());
  const date = params.get("date") || new Date().toISOString().split("T")[0];
  const departure = params.get("departure") || "";
  const travelers = params.get("travelers") || "1";
  const promo = params.get("promo") || "";
  
  // Parse line items
  const itemsRaw = params.get("items") || "";
  const items: { name: string; price: number }[] = itemsRaw
    ? itemsRaw.split("|").map(i => {
        const [name, price] = i.split(":");
        return { name, price: parseFloat(price) || 0 };
      })
    : [
        { name: "International Flight — Round Trip", price: total * 0.45 },
        { name: "Hotel Accommodation (7 nights)", price: total * 0.35 },
        { name: "Private Airport Transfer", price: total * 0.1 },
        { name: "Zeniva Concierge Service", price: total * 0.1 },
      ];

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discountAmt = discount || (promo ? subtotal * 0.15 : 0);
  const taxAmt = taxes || (subtotal - discountAmt) * 0.05;
  const grandTotal = total || (subtotal - discountAmt + taxAmt);
  const generatedDate = new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${ref} — Zeniva</title>${zenivaBranding()}</head><body>
<div class="page">
  <div class="card">
    ${docHeader("invoice", ref)}

    <div class="section">
      <div class="grid-2" style="margin-bottom:24px;">
        <div>
          <div class="label" style="margin-bottom:8px;">Bill To</div>
          <div class="value" style="font-size:18px;">${client}</div>
          ${email ? `<div style="font-size:13px;color:#64748b;margin-top:2px;">📧 ${email}</div>` : ""}
          ${travelers !== "1" ? `<div style="font-size:13px;color:#64748b;margin-top:2px;">👥 ${travelers} travelers</div>` : ""}
        </div>
        <div style="text-align:right;">
          <div class="label" style="margin-bottom:8px;">Invoice Details</div>
          <div class="value" style="font-size:18px;">${ref}</div>
          <div style="font-size:13px;color:#64748b;margin-top:2px;">📅 ${generatedDate}</div>
          ${departure ? `<div style="font-size:13px;color:#64748b;margin-top:2px;">✈️ Departs: ${new Date(departure).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>` : ""}
          <div style="margin-top:8px;"><span class="status-paid">💳 PAID IN FULL</span></div>
        </div>
      </div>

      ${destination ? `
      <div class="info-box" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(15,108,245,0.04),rgba(230,184,90,0.04));border-color:#E6B85A;">
        <div class="label">Trip Destination</div>
        <div class="value-lg" style="font-size:18px;">🌍 ${destination}</div>
      </div>` : ""}

      <!-- Line items -->
      <table class="table">
        <thead>
          <tr>
            <th>Service</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align:right;font-weight:600;">$${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`).join("")}
          
          <tr style="background:#f8fafc;">
            <td style="color:#64748b;">Subtotal</td>
            <td style="text-align:right;color:#64748b;">$${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          ${discountAmt > 0 ? `
          <tr style="background:#fefce8;">
            <td style="color:#92400e;">🎁 Promo discount${promo ? ` (${promo})` : ""} — 15% OFF</td>
            <td style="text-align:right;color:#92400e;font-weight:700;">-$${discountAmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ""}
          
          ${taxAmt > 0 ? `
          <tr style="background:#f8fafc;">
            <td style="color:#64748b;">Service fee & taxes (5%)</td>
            <td style="text-align:right;color:#64748b;">$${taxAmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ""}
        </tbody>
        <tfoot>
          <tr class="total-row" style="border-top:2px solid #0B1B4D;">
            <td>TOTAL PAID (CAD)</td>
            <td style="text-align:right;color:#0F6CF5;">$${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="gold-strip">
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(11,27,77,0.6);letter-spacing:0.08em;text-transform:uppercase;">Payment Status</div>
        <div style="font-size:16px;font-weight:900;color:#0B1B4D;margin-top:4px;">💳 PAID IN FULL — $${(paid || grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD</div>
      </div>
      <div class="qr-placeholder">🧾</div>
    </div>

    <div class="section" style="background:#f8fafc;">
      <div style="font-size:11px;color:#94a3b8;line-height:1.7;text-align:center;">
        This invoice serves as official proof of payment for services rendered by <strong>Zeniva Inc.</strong>, incorporated in Delaware, USA.<br>
        For questions or support: <strong>info@zeniva.ca</strong> · <strong>+1 (332) 290-0021</strong> · <strong>zenivatravel.com</strong>
      </div>
    </div>

    ${docFooter()}
  </div>
</div>
</body></html>`;
}

// ─── Excursion Ticket ─────────────────────────────────────────────────────────
function generateExcursionDoc(params: URLSearchParams) {
  const ref = params.get("ref") || "EX-" + Math.floor(Math.random() * 9000 + 1000);
  const guest = params.get("guest") || "John Doe";
  const excursion = params.get("excursion") || "Private City Tour";
  const provider = params.get("provider") || "Local Expert Tours";
  const date = params.get("date") || "2026-06-17";
  const time = params.get("time") || "09:00";
  const duration = params.get("duration") || "4 hours";
  const meeting = params.get("meeting") || "Hotel lobby";
  const participants = params.get("participants") || "2";
  const price = params.get("price") || "0";
  const includes = params.get("includes") || "Guide,Transport,Entrance fees";
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Excursion Ticket — ${ref}</title>${zenivaBranding()}</head><body>
<div class="page">
  <div class="card">
    ${docHeader("excursion", ref)}

    <div class="gold-strip">
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(11,27,77,0.6);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Ticket Reference</div>
        <div class="ref-box">${ref}</div>
      </div>
      <div style="text-align:right;">
        <span class="status-ok">✓ Confirmed</span>
        <div style="font-size:11px;color:rgba(11,27,77,0.5);margin-top:6px;">Issued ${generatedDate}</div>
      </div>
    </div>

    <div class="section">
      <div style="margin-bottom:24px;">
        <div class="label">Experience</div>
        <div class="value-lg">🎯 ${excursion}</div>
        <div style="font-size:13px;color:#64748b;margin-top:4px;">by ${provider}</div>
      </div>

      <div class="grid-4" style="margin-bottom:20px;">
        <div class="info-box">
          <div class="label">Date</div>
          <div class="value" style="font-size:13px;">${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
        </div>
        <div class="info-box">
          <div class="label">Start Time</div>
          <div class="value">${time}</div>
        </div>
        <div class="info-box">
          <div class="label">Duration</div>
          <div class="value" style="font-size:13px;">${duration}</div>
        </div>
        <div class="info-box">
          <div class="label">Participants</div>
          <div class="value">${participants}</div>
        </div>
      </div>

      <div class="info-box" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(15,108,245,0.04),rgba(230,184,90,0.04));border-color:#E6B85A;">
        <div class="label">📍 Meeting Point</div>
        <div class="value" style="font-size:15px;margin-top:4px;">${meeting}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Be there 10 minutes before start time</div>
      </div>

      ${includes ? `
      <div>
        <div class="label" style="margin-bottom:10px;">✅ Included</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${includes.split(",").map(i => `<span style="background:#d1fae5;color:#065f46;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;">${i.trim()}</span>`).join("")}
        </div>
      </div>` : ""}
    </div>

    <div class="section">
      <div class="grid-2">
        <div class="info-box">
          <div class="label">Guest Name</div>
          <div class="value">${guest}</div>
        </div>
        <div class="info-box">
          <div class="label">Booked By</div>
          <div class="value">Zeniva</div>
        </div>
      </div>
    </div>

    ${price !== "0" ? `
    <div class="gold-strip">
      <div style="font-size:13px;font-weight:600;color:rgba(11,27,77,0.7);">Experience Price</div>
      <div style="font-size:22px;font-weight:900;color:#0B1B4D;">$${Number(price).toLocaleString()}</div>
    </div>` : ""}

    ${docFooter()}
  </div>
</div>
</body></html>`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "invoice";
  const download = url.searchParams.get("download") === "1";
  const ref = url.searchParams.get("ref") || "ZNV0001";

  let html = "";
  switch (type) {
    case "flight":    html = generateFlightDoc(url.searchParams);    break;
    case "hotel":     html = generateHotelDoc(url.searchParams);     break;
    case "transfer":  html = generateTransferDoc(url.searchParams);  break;
    case "excursion": html = generateExcursionDoc(url.searchParams); break;
    case "invoice":
    default:          html = generateInvoiceDoc(url.searchParams);   break;
  }

  const headers: HeadersInit = { "Content-Type": "text/html; charset=utf-8" };
  if (download) {
    const filename = `zeniva-${type}-${ref}.html`;
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return new NextResponse(html, { status: 200, headers });
}
