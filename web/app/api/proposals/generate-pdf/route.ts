import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

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

    // Optional fields used by PDF renderer
    images?: string[];
    imagesHTML?: string;
    logo?: string;
    logoDataUri?: string | null;
    linaAvatar?: string | null;
    linaNote?: string;
    linaIntroText?: string;
    heroImage?: string | null;
    galleryHTML?: string;
}

function generateProposalHTML(proposal: ProposalData): string {
    const itineraryItems = (proposal.itinerary && Array.isArray(proposal.itinerary)) 
        ? proposal.itinerary.map(item =>
            `<div style="background: #f8fafc; border-left: 4px solid #35f2c1; padding: 16px; margin: 12px 0; border-radius: 8px;">
                <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.5;">${item}</p>
            </div>`
        ).join('')
        : `<div style="background: #f8fafc; border-left: 4px solid #35f2c1; padding: 16px; margin: 12px 0; border-radius: 8px;">
            <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.5;">Itinerary details will be provided upon confirmation.</p>
        </div>`;

    // Génère la section shortlist si elle existe
    let shortlistSection = '';
    if (proposal.shortlist && proposal.shortlist.length > 0) {
        shortlistSection = `
            <div style="margin: 40px 0;">
                <div style="font-size: 20px; color: #f8fafc; font-weight: 700; margin-bottom: 12px;">Selected Picks</div>
                <ul style="list-style: none; padding: 0;">
                    ${proposal.shortlist.filter(s => s.selected !== false).map(item => `
                        <li style="background: #1e293b; border-radius: 10px; margin-bottom: 10px; padding: 16px 20px; color: #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                            <span><strong>${item.type}:</strong> ${item.title}</span>
                            <span style="color: #35f2c1; font-weight: 700;">${item.price}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Proposal - ${proposal.clientName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #0b1220;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 24px;
        }

        .header {
            text-align: left;
            margin-bottom: 24px;
        }

        .logo-section {
            background: #ffffff;
            border-radius: 12px;
            padding: 18px 20px;
            margin-bottom: 12px;
            border: 1px solid #e6eef6;
            box-shadow: 0 6px 18px rgba(16,24,40,0.06);
            display:flex;align-items:center;gap:14px;
        }

        .logo {
            font-size: 20px;
            font-weight: 800;
            color: #0b1220;
            letter-spacing: 0.02em;
        }

        .tagline {
            color: #61708a;
            font-size: 13px;
            font-weight: 500;
        }

        .lina-section {
            background: #fbfdff;
            border-radius: 12px;
            padding: 18px;
            margin: 18px 0;
            border: 1px solid #eef5fb;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 6px 18px rgba(16,24,40,0.04);
        }

        .lina-avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: #0b1220;
            flex-shrink: 0;
            background: transparent;
        }

        .lina-content h3 {
            color: #0b1220;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
        }

        .lina-content p {
            color: #495669;
            font-size: 13px;
            line-height: 1.5;
        }

        .proposal-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            margin: 18px 0;
            border: 1px solid #eef5fb;
            box-shadow: 0 10px 30px rgba(16,24,40,0.05);
        }

        .proposal-header {
            text-align: left;
            margin-bottom: 16px;
        }

        .proposal-title {
            font-size: 26px;
            font-weight: 800;
            color: #0b1220;
            margin-bottom: 6px;
        }

        .proposal-subtitle {
            color: #495669;
            font-size: 14px;
            font-weight: 500;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin: 18px 0;
        }

        .info-item {
            background: #fbfdff;
            border-radius: 10px;
            padding: 14px;
            border: 1px solid #eef5fb;
        }

        .info-label {
            color: #8290a8;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .info-value {
            color: #0b1220;
            font-size: 16px;
            font-weight: 700;
        }

        .itinerary-section {
            margin: 28px 0;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #0b1220;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title::before {
            content: '🏨';
            font-size: 18px;
        }

        .price-highlight {
            color: #0b1220;
            font-size: 28px;
            font-weight: 800;
            text-align: center;
            margin: 30px 0;
        }

        .cta-section {
            text-align: center;
            margin: 40px 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(90deg, #0b7df2 0%, #0058e6 100%);
            color: #ffffff;
            padding: 12px 26px;
            border-radius: 40px;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 8px 22px rgba(11,125,242,0.18);
            transition: transform 0.15s ease;
        }

        .cta-button:hover {
            transform: translateY(-2px);
        }

        .page-break { page-break-after: always; break-after: page; }

        .footer {
            text-align: center;
            margin-top: 36px;
            padding-top: 18px;
            border-top: 1px solid #eef5fb;
        }

        .footer-text {
            color: #8290a8;
            font-size: 12px;
            margin-bottom: 8px;
        }

        .footer-logo {
            color: #0b1220;
            font-weight: 700;
            font-size: 14px;
        }

        .badge {
            display: inline-block;
            background: #f3fbff;
            color: #0b1220;
            padding: 6px 14px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 700;
            margin: 12px 0;
        }

        @media (max-width: 600px) {
            .container {
                padding: 16px 12px;
            }

            .lina-section {
                flex-direction: column;
                text-align: center;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->

        <div class="header">
            <div class="logo-section">
                <img src="${proposal.logoDataUri || 'data:image/png;base64,tCBtorchs578+A1E5rnVR5KKPEIsc6kYTaFn8wg+MHmM2GWyDXfZlIMpdkr7tsP/7xMLMR3zazEjkk8z/yDfmzkiOfVz5mJ0W9j0W+BoP8/88PukUxb6zMAAAAASUVORK5CYII='}" width="60" height="60" style="vertical-align:middle;border-radius:12px;box-shadow:0 2px 8px #35f2c1;margin-bottom:10px;" alt="Zeniva Logo" />
                <div class="logo" style="margin-top:8px;">ZENIVA TRAVEL</div>
                <div class="tagline">Exceptional journeys crafted by AI</div>
            </div>
        </div>

        <!-- Lina Introduction removed; Lina will be rendered inside the proposal card -->

        <!-- Proposal Card -->
        <div class="proposal-card">
            <div class="proposal-header">
                <h1 class="proposal-title">Personalized Proposal</h1>
                <p class="proposal-subtitle">Tailored for ${proposal.clientName}</p>
                <div class="badge">Premium Proposal</div>
            </div>

            <!-- Lina (assistant) -->
            <div style="margin: 18px 0;">
                <div class="lina-section" style="margin:0;">
                    <div class="lina-avatar" style="background:none;padding:0;">
                        ${proposal.linaAvatar ? `<img src="${proposal.linaAvatar}" width="72" height="72" style="border-radius:50%;box-shadow:0 2px 8px #7df2ff;" alt="Lina Avatar"/>` : `<div style="width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#eef5fb;color:#0b1220;font-weight:800;font-size:28px;">L</div>`}
                    </div>
                    <div class="lina-content" style="margin-left:12px;">
                        <h3>Meet Lina, your travel assistant</h3>
                        <p>${proposal.linaIntroText || 'I\'m Lina — I handcraft your trip and keep an eye on availability, pricing and upgrades to make sure this proposal becomes reality.'}</p>
                    </div>
                </div>
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Destination</div>
                    <div class="info-value">${proposal.destination}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Travel Dates</div>
                    <div class="info-value">${proposal.travelDates}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Travelers</div>
                    <div class="info-value">${proposal.pax} traveler${proposal.pax > 1 ? 's' : ''}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Estimated Budget</div>
                    <div class="info-value">${proposal.budget}</div>
                </div>
            </div>

            <!-- Accommodations & Photos (si disponibles) -->
            ${proposal.imagesHTML || ''}


            <!-- Selected items (SHORTLIST) -->
            ${shortlistSection}

            <!-- Itinéraire -->
            <div class="itinerary-section">
                <h2 class="section-title">Your Tailored Itinerary</h2>
                ${itineraryItems}
            </div>

            <!-- Price -->
            <div style="text-align: center; margin: 40px 0;">
                <div style="color: #94a3b8; font-size: 16px; margin-bottom: 10px;">Estimated Total Price</div>
                <div class="price-highlight">${proposal.totalPrice}</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 10px;">
                    *Final price confirmed upon booking
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
            <a href="https://zeniva.travel" class="cta-button">
                Book This Proposal
            </a>
            <div style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
                Proposal valid for 7 days • 24/7 support included
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                This proposal was generated by Lina, our advanced travel AI
            </div>
            <div class="footer-text">
                For any questions, contact your Zeniva Travel agent
            </div>
            <div class="footer-logo">ZENIVA TRAVEL</div>
            <div style="color: #475569; font-size: 12px; margin-top: 10px;">
                Generated on ${new Date(proposal.createdAt).toLocaleDateString('en-US')}
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

    // Prepare hero and gallery HTML and attach separately for clear layout control
    let imagesHTML = '';
    let heroImage: string | null = null;
    let galleryHTML = '';

    if (inlined.length > 0) {
      const hero = inlined[0];
      heroImage = hero.src;
      const rest = inlined.slice(1);

      // Gallery (rest images)
      if (rest.length > 0) {
        galleryHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:12px;">${rest.map(it => `
          <div style="border-radius:10px;overflow:hidden;border:1px solid #eef5fb;background:#fff;">
            <img src="${it.src}" style="width:100%;height:150px;object-fit:cover;display:block;" />
            <div style="padding:8px 10px;color:#0b1220;font-weight:700;font-size:13px;">${it.caption || ''}</div>
          </div>`).join('')}</div>`;
      }

      // imagesHTML will be a combined hero + gallery block when used
      imagesHTML = `<div style="margin: 24px 0;">
        <div style="border-radius:12px;overflow:hidden;border:1px solid #eef5fb;background:#fff;">
          <img src="${hero.src}" style="width:100%;height:320px;object-fit:cover;display:block;" />
          ${hero.caption ? `<div style="padding:12px 16px;color:#0b1220;font-weight:700;font-size:14px;">${hero.caption}</div>` : ''}
        </div>
        ${galleryHTML}
      </div>`;
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
    proposal.imagesHTML = imagesHTML;
    proposal.heroImage = heroImage || null;
    proposal.galleryHTML = galleryHTML || '';
    proposal.linaIntroText = linaIntroText;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const html = generateProposalHTML(proposal);

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