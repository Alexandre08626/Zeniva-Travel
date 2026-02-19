import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { computePrice, formatCurrency } from '../../../../src/lib/pricing';

interface ShortlistItem {
    type: string;
    title: string;
    price: string;
    selected?: boolean;
    image?: string;
}

interface ProposalData {
  id: string;
  dossierId: string;
  clientName: string;
  destination: string;
  travelDates: string;
  pax: number;
  budget: string;
  itinerary: string[];
  totalPrice: string;
  createdAt: string;
  status: "draft" | "ready" | "sent";
  shortlist?: ShortlistItem[];
  format?: "pdf" | "html";
  departureCity?: string;
  accommodationType?: string;
  transportationType?: string;
  style?: string;
  notes?: string;
  images?: string[];
  imagesHTML?: string;
  logo?: string;
  logoDataUri?: string | null;
  linaAvatar?: string | null;
  linaNote?: string;
  linaIntroText?: string;
  heroImage?: string | null;
  galleryHTML?: string;
  imageGridHTML?: string;
  selection?: any;
  tripDraft?: any;
  extraHotels?: any[];
  extraActivities?: any[];
  extraTransfers?: any[];
}

function generateProposalHTML(proposal: ProposalData): string {
  const selection = proposal.selection || {};
  const tripDraft = proposal.tripDraft || {};
  const extraHotels = proposal.extraHotels || tripDraft.extraHotels || [];
  const extraActivities = proposal.extraActivities || tripDraft.extraActivities || [];
  const extraTransfers = proposal.extraTransfers || tripDraft.extraTransfers || [];

  const selectionHotels = Array.isArray(selection.hotels) ? selection.hotels : [];
  const selectionActivities = Array.isArray(selection.activities) ? selection.activities : [];
  const selectionTransfers = Array.isArray(selection.transfers) ? selection.transfers : [];

  const hotels = [selection.hotel, ...selectionHotels, ...extraHotels].filter(Boolean);
  const activities = [selection.activity, ...selectionActivities, ...extraActivities].filter(Boolean);
  const transfers = [selection.transfer, ...selectionTransfers, ...extraTransfers].filter(Boolean);

  const flight = selection.flight;
  const pricingDraft = { ...tripDraft, extraHotels: hotels.filter((h: any) => h && h !== selection.hotel), extraActivities: activities.filter((a: any) => a && a !== selection.activity), extraTransfers: transfers.filter((t: any) => t && t !== selection.transfer) };
  const pricing = computePrice({ flight, hotel: selection.hotel, activity: selection.activity, transfer: selection.transfer }, pricingDraft);
  const hasFlightPrice = Boolean(flight?.price);
  const hasHotelPrice = hotels.some((item: any) => item?.price !== undefined && item?.price !== null);
  const hasActivityPrice = activities.some((item: any) => item?.price !== undefined && item?.price !== null);
  const hasTransferPrice = transfers.some((item: any) => item?.price !== undefined && item?.price !== null);
  const hasAnyPrice = hasFlightPrice || hasHotelPrice || hasActivityPrice || hasTransferPrice;
  const priceFallback = proposal.totalPrice || proposal.budget || "On request";
  const title = proposal.destination || tripDraft.destination || proposal.clientName || "Your trip";
  const dateLine = tripDraft?.checkIn && tripDraft?.checkOut
    ? `${tripDraft.checkIn} to ${tripDraft.checkOut}`
    : proposal.travelDates || "Flexible dates";

  const tripOverview = `${tripDraft?.departureCity || proposal.departureCity || "Departure"} → ${tripDraft?.destination || proposal.destination || "Destination"} · ${dateLine}`;

  const renderGallery = (images?: string[]) => {
    if (!images || images.length === 0) return "";
    const slots = images.slice(0, 6);
    return `<div class="photo-grid">${slots.map((src) => `
      <div class="photo"><img src="${src}" /></div>
    `).join("")}</div>`;
  };

  const renderHotel = (item: any) => {
    const inferredType = (item?.room || "").toLowerCase().includes("yacht")
      ? "Yacht"
      : (item?.room || "").toLowerCase().includes("residence")
        ? "Residence"
        : "Hotel";
    const rawType = item?.accommodationType || tripDraft?.accommodationType || inferredType;
    const type = rawType === "Airbnb" ? "Residence" : rawType;
    const isResidence = type === "Residence";
    const label = type === "Yacht" ? "Yacht" : isResidence ? "Short-term rental" : "Hotel";
    const images = item?.images || (item?.image ? [item.image] : []);
    return `
      <section class="card">
        <div class="card-label">${label}</div>
        <div class="card-title">${item?.name || "Accommodation"} • ${item?.location || "Central"}</div>
        <div class="card-sub">${type === "Yacht"
          ? `Specs: ${item?.specs || "Yacht specs"}`
          : isResidence
            ? `Stay: ${item?.room || "Private stay"} • Rating: ${item?.rating || "4.9"}`
            : `Room: ${item?.room || "Deluxe"} • Board: Breakfast • Rating: ${item?.rating || "4.5"}`}</div>
        <div class="card-note">${type === "Yacht"
          ? `Amenities: ${(item?.amenities || []).join(" • ") || "Yacht amenities"}`
          : "Policies: Free cancellation until 7 days before arrival; pay at property or prepaid per partner terms."}</div>
        ${renderGallery(images)}
      </section>
    `;
  };

  const renderActivity = (item: any) => `
    <section class="card">
      <div class="card-label">Activity</div>
      <div class="card-title">${item?.name || "Activity"}</div>
      <div class="card-sub">${item?.date || ""} ${item?.time ? `at ${item.time}` : ""} ${item?.supplier ? `• ${item.supplier}` : ""}</div>
      <div class="card-note">Includes: Guided tour, entrance fees, transportation.</div>
      ${renderGallery(item?.images || [])}
    </section>
  `;

  const renderTransfer = (item: any) => `
    <section class="card">
      <div class="card-label">Transfer</div>
      <div class="card-title">${item?.name || "Transfer"}</div>
      <div class="card-sub">${item?.route || ""} ${item?.date ? `• ${item.date}` : ""} ${item?.supplier ? `• ${item.supplier}` : ""}</div>
      <div class="card-note">Vehicle: ${item?.vehicle || "Vehicle"} • ${item?.shared ? "Shared transfer" : "Private transfer"}.</div>
      ${renderGallery(item?.images || [])}
    </section>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Travel Proposal - ${proposal.clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; }
    .container { max-width: 1120px; margin: 0 auto; padding: 32px 24px; }
    .eyebrow { color: #2563eb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; }
    .page-title { font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 6px; }
    .subtle { color: #2563eb; font-size: 13px; font-weight: 600; }
    .hero-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 140px); gap: 6px; border-radius: 18px; overflow: hidden; margin: 18px 0; }
    .hero-grid .hero-main { grid-column: span 2; grid-row: span 2; }
    .hero-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .overview { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 18px; }
    .grid { display: grid; grid-template-columns: 1fr 340px; gap: 22px; align-items: start; margin-top: 18px; }
    .card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 18px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); margin-bottom: 14px; }
    .card-label { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .card-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 6px; }
    .card-sub { color: #64748b; font-size: 13px; margin-top: 4px; }
    .card-note { color: #0f172a; font-size: 13px; font-weight: 600; margin-top: 6px; }
    .photo-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .photo-grid .photo { border-radius: 10px; overflow: hidden; height: 110px; }
    .photo-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .price-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 18px; }
    .price-row { display: flex; justify-content: space-between; font-size: 13px; color: #0f172a; margin-top: 6px; }
    .price-total { margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-weight: 800; color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="eyebrow">Zeniva travel</div>
    <div class="page-title">Your tailored trip</div>
    <div class="subtle">${title} · Review before payment</div>

    ${proposal.imageGridHTML || ''}

    <div class="overview">
      <div style="font-weight:800;color:#0f172a;">Trip overview</div>
      <div style="margin-top:4px;color:#64748b;font-size:13px;">${tripOverview}</div>
      <div style="margin-top:10px;color:#2563eb;font-size:13px;font-weight:600;">4.92 · 52 reviews</div>
    </div>

    <div class="grid">
      <div>
        ${flight ? `
          <section class="card">
            <div class="card-label">Flight</div>
            <div class="card-title">${flight.airline || "Airline"} • ${flight.route || ""}</div>
            <div class="card-sub">${flight.times || ""} • ${flight.fare || ""} • ${flight.bags || ""}</div>
            ${flight.flightNumber ? `<div class="card-sub">Flight: ${flight.flightNumber}</div>` : ""}
            ${flight.date ? `<div class="card-sub">Date: ${flight.date}</div>` : ""}
            ${flight.duration ? `<div class="card-sub">Duration: ${flight.duration}</div>` : ""}
            ${flight.layovers ? `<div class="card-sub">Layovers: ${flight.layovers}</div>` : ""}
            <div class="card-note">Fare rules: flexible changes with fee, cancellation subject to airline policy.</div>
          </section>
        ` : ""}

        ${hotels.map(renderHotel).join("")}
        ${activities.map(renderActivity).join("")}
        ${transfers.map(renderTransfer).join("")}

        <section class="card">
          <div class="card-label">Price breakdown</div>
          <div class="price-row"><span>Flights</span><span>${hasFlightPrice ? formatCurrency(pricing.flightTotal) : "On request"}</span></div>
          <div class="price-row"><span>Accommodation</span><span>${hasHotelPrice ? formatCurrency(pricing.hotelTotal) : "On request"}</span></div>
          ${activities.length ? `<div class="price-row"><span>Activities</span><span>${hasActivityPrice ? formatCurrency(pricing.activityTotal) : "Included"}</span></div>` : ""}
          ${transfers.length ? `<div class="price-row"><span>Transfers</span><span>${hasTransferPrice ? formatCurrency(pricing.transferTotal) : "Included"}</span></div>` : ""}
          <div class="price-row"><span>Service fee (6%)</span><span>${hasAnyPrice ? formatCurrency(pricing.fees) : "Included"}</span></div>
          <div class="price-total"><span>Total</span><span>${hasAnyPrice ? formatCurrency(pricing.total) : priceFallback}</span></div>
          <div class="card-sub">Based on ${pricing.travelers} traveler(s). Final pricing is confirmed at payment with live availability.</div>
        </section>
      </div>

      <div>
        <div class="price-card">
          <div style="font-weight:800;font-size:18px;color:#0f172a;">Summary</div>
          <div class="price-row"><span>Destination</span><span>${proposal.destination || "TBD"}</span></div>
          <div class="price-row"><span>Dates</span><span>${dateLine}</span></div>
          <div class="price-row"><span>Travelers</span><span>${pricing.travelers}</span></div>
          <div class="price-row"><span>Budget</span><span>${proposal.budget || "On request"}</span></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const proposal: ProposalData = await request.json();

    // Helper to inline images (URL or local public file) into data URIs
    async function inlineImage(urlOrPath?: string | null) {
      if (!urlOrPath) return null;
      try {
        // If looks like an absolute URL, fetch it
        if (/^https?:\/\//i.test(urlOrPath)) {
          const res = await fetch(urlOrPath);
          if (!res.ok) return null;
          const buf = Buffer.from(await res.arrayBuffer());
          const mime = res.headers.get('content-type') || 'image/jpeg';
          return `data:${mime};base64,${buf.toString('base64')}`;
        }

        // Otherwise, try local public path
        const publicPath = path.join(process.cwd(), 'public', urlOrPath.replace(/^\//, ''));
        if (fs.existsSync(publicPath)) {
          const buf = fs.readFileSync(publicPath);
          // Guess mime from extension
          const ext = path.extname(publicPath).slice(1).toLowerCase();
          const mime = ext === 'png' ? 'image/png' : (ext === 'svg' ? 'image/svg+xml' : 'image/jpeg');
          return `data:${mime};base64,${buf.toString('base64')}`;
        }

        return null;
      } catch (err) {
        let msg = String(err);
        if (err && typeof err === 'object' && 'message' in err) {
          const errObj = err as { message?: string };
          if (errObj.message) msg = errObj.message;
        }
        console.error('Failed to inline image', urlOrPath, msg);
        return null;
      }
    }

    // Inline logo (prefer public/branding/logo.png)
    let logoDataUri = null;
    const logoPath = path.join('branding', 'logo.png');
    logoDataUri = await inlineImage(`/${logoPath}`) || await inlineImage(proposal.logo) || null;

    // Inline Lina avatar if provided via proposal.linaAvatar or use public branding avatar
    const linaAvatar = await inlineImage('/branding/lina-avatar.png') || await inlineImage(proposal.linaAvatar) || null;

    // Build images HTML gallery from proposal.images or shortlist items with image property
    const imageSources: string[] = [];
    if (Array.isArray(proposal.images) && proposal.images.length > 0) {
      imageSources.push(...proposal.images);
    }
    if (proposal.selection?.hotel?.image) imageSources.push(proposal.selection.hotel.image);
    if (Array.isArray(proposal.selection?.hotel?.images)) imageSources.push(...proposal.selection.hotel.images);
    if (Array.isArray(proposal.extraHotels)) {
      for (const h of proposal.extraHotels) {
        if (h?.image) imageSources.push(h.image);
        if (Array.isArray(h?.images)) imageSources.push(...h.images);
      }
    }
    if (Array.isArray(proposal.extraActivities)) {
      for (const a of proposal.extraActivities) {
        if (Array.isArray(a?.images)) imageSources.push(...a.images);
      }
    }
    if (Array.isArray(proposal.extraTransfers)) {
      for (const t of proposal.extraTransfers) {
        if (Array.isArray(t?.images)) imageSources.push(...t.images);
      }
    }
    if (proposal.shortlist && Array.isArray(proposal.shortlist)) {
      for (const s of proposal.shortlist) {
        if (s.image) imageSources.push(s.image);
      }
    }

    // Deduplicate and limit
    const uniqueImages = Array.from(new Set(imageSources)).slice(0, 8);
    const inlined = [] as { src: string; caption?: string }[];
    for (const img of uniqueImages) {
      const dataUri = await inlineImage(img);
      if (dataUri) {
        inlined.push({ src: dataUri, caption: (img && img.split('/').pop()) || '' });
      }
    }

    // Prepare hero grid layout (review-style)
    let heroImage: string | null = null;
    let imageGridHTML = '';

    if (inlined.length > 0) {
      const hero = inlined[0];
      heroImage = hero.src;
      const rest = inlined.slice(1);

      const gridImages = [hero, ...rest];
      while (gridImages.length < 5) gridImages.push(hero);
      const grid = gridImages.slice(0, 5);

      imageGridHTML = `
        <div class="hero-grid" style="margin: 18px 0;">
          <div class="hero-main"><img src="${grid[0].src}" alt="Hero" /></div>
          <div><img src="${grid[1].src}" alt="Gallery" /></div>
          <div><img src="${grid[2].src}" alt="Gallery" /></div>
          <div><img src="${grid[3].src}" alt="Gallery" /></div>
          <div><img src="${grid[4].src}" alt="Gallery" /></div>
        </div>
      `;
    }

    // Build Lina's summary text based on selections (shortlist, itinerary, and key fields)
    const selectedItems = [] as string[];
    if (proposal.shortlist && Array.isArray(proposal.shortlist)) {
      for (const s of proposal.shortlist) {
        if (s.selected !== false) selectedItems.push(`${s.type || ''}${s.title ? `: ${s.title}` : ''}`.trim());
      }
    }
    // Fallback to itinerary items if no shortlist
    if (selectedItems.length === 0 && Array.isArray(proposal.itinerary) && proposal.itinerary.length > 0) {
      selectedItems.push(proposal.itinerary[0]);
    }

    const linaIntroText = proposal.linaNote || `Hello ${proposal.clientName || 'Client'}, I recommend this curated selection for ${proposal.destination || ''} (${proposal.travelDates || 'Dates not specified'}). Key picks: ${selectedItems.join(' · ') || 'to be defined'}. Estimated price: ${proposal.totalPrice || 'on request'}.`;

    // Attach computed values to the proposal so template can use them
    proposal.logoDataUri = logoDataUri;
    proposal.linaAvatar = linaAvatar;
    proposal.heroImage = heroImage || null;
    proposal.imageGridHTML = imageGridHTML || '';
    proposal.linaIntroText = linaIntroText;

    const html = generateProposalHTML(proposal);

        if (proposal.format === "html") {
            return new NextResponse(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Content-Disposition': `attachment; filename="Proposal-${proposal.clientName}-${proposal.destination}.html"`
                }
            });
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proposal-${proposal.clientName}-${proposal.destination}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}