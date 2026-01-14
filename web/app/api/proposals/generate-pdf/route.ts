import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface ShortlistItem {
    type: string;
    title: string;
    price: string;
    selected?: boolean;
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
                <div style="font-size: 20px; color: #f8fafc; font-weight: 700; margin-bottom: 12px;">Sélections personnalisées</div>
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
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposition de Voyage - ${proposal.clientName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0b1220 0%, #1e293b 100%);
            color: #e2e8f0;
            line-height: 1.6;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 50px;
        }

        .logo-section {
            background: linear-gradient(135deg, #0f1a30 0%, #1e293b 50%, #0f1a30 100%);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            border: 1px solid #334155;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .logo {
            display: inline-block;
            background: linear-gradient(45deg, #35f2c1, #7df2ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 10px;
        }

        .tagline {
            color: #94a3b8;
            font-size: 16px;
            font-weight: 400;
        }

        .lina-section {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid #475569;
            display: flex;
            align-items: center;
            gap: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .lina-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(45deg, #35f2c1, #7df2ff);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 700;
            color: #0b1220;
            flex-shrink: 0;
        }

        .lina-content h3 {
            color: #f1f5f9;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .lina-content p {
            color: #cbd5e1;
            font-size: 16px;
            line-height: 1.6;
        }

        .proposal-card {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-radius: 16px;
            padding: 32px;
            margin: 30px 0;
            border: 1px solid #334155;
            box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }

        .proposal-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .proposal-title {
            font-size: 28px;
            font-weight: 800;
            color: #f8fafc;
            margin-bottom: 8px;
        }

        .proposal-subtitle {
            color: #94a3b8;
            font-size: 16px;
            font-weight: 400;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .info-item {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #334155;
        }

        .info-label {
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .info-value {
            color: #f1f5f9;
            font-size: 18px;
            font-weight: 700;
        }

        .itinerary-section {
            margin: 40px 0;
        }

        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title::before {
            content: '✈️';
            font-size: 24px;
        }

        .price-highlight {
            background: linear-gradient(135deg, #35f2c1 0%, #7df2ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 36px;
            font-weight: 800;
            text-align: center;
            margin: 40px 0;
        }

        .cta-section {
            text-align: center;
            margin: 50px 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #35f2c1 0%, #7df2ff 100%);
            color: #0b1220;
            padding: 16px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 8px 25px rgba(53, 242, 193, 0.3);
            transition: transform 0.2s ease;
        }

        .cta-button:hover {
            transform: translateY(-2px);
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #334155;
        }

        .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .footer-logo {
            color: #35f2c1;
            font-weight: 700;
            font-size: 18px;
        }

        .badge {
            display: inline-block;
            background: linear-gradient(45deg, #35f2c1, #7df2ff);
            color: #0b1220;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            margin: 20px 0;
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px 15px;
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
                <img src="data:image/png;base64,tCBtorchs578+A1E5rnVR5KKPEIsc6kYTaFn8wg+MHmM2GWyDXfZlIMpdkr7tsP/7xMLMR3zazEjkk8z/yDfmzkiOfVz5mJ0W9j0W+BoP8/88PukUxb6zMAAAAASUVORK5CYII=" width="60" height="60" style="vertical-align:middle;border-radius:12px;box-shadow:0 2px 8px #35f2c1;margin-bottom:10px;" alt="Zeniva Logo" />
                <div class="logo" style="margin-top:8px;">ZENIVA TRAVEL</div>
                <div class="tagline">Voyages d'exception conçus par IA</div>
            </div>
        </div>

        <!-- Lina Introduction -->
        <div class="lina-section">
            <div class="lina-avatar" style="background:none;padding:0;">
                                <img
                                    src="data:image/png;base64,/9j/4QDKRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAITAAMAAAABAAEAAIdpAAQAAAABAAAAZgAAAAAAAADYAAAAAQAAANgAAAABAAeQAAAHAAAABDAyMjGRAQAHAAAABAECAwCgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAABA2gAwAEAAAAAQAABCukBgADAAAAAQAAAAAAAAAAAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYYXBwbAQAAABtbnRyUkdCIFhZWiAH5gABAAEAAAAAAABhY3NwQVBQTAAAAABBUFBMAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWFwcGzs/aOOOIVHw220vU962hgvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAADBjcHJ0AAABLAAAAFB3dHB0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAACBjaGFkAAAB7AAAACxiVFJDAAABzAAAACBnVFJDAAABzAAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAABQAAAAcAEQAaQBzAHAAbABhAHkAIABQADNtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADQAAAAcAEMAbwBwAHkAcgBpAGcAaAB0ACAAQQBwAHAAbABlACAASQBuAGMALgAsACAAMgAwADIAMlhZWiAAAAAAAAD21QABAAAAANMsWFlaIAAAAAAAAIPfAAA9v////7tYWVogAAAAAAAASr8AALE3AAAKuVhZWiAAAAAAAAAoOAAAEQsAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltzZjMyAAAAAAABDEIAAAXe///zJgAAB5MAAP2Q///7ov///aMAAAPcAADAbv/bAIQAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCQEBAQECAgIEAgIECQYFBgkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ/90ABAAw/8AAEQgEKwL9AwEiAAIRAQMRAf/EAaIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6AQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsRAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/0P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooppOKAAH5sUNwvFNXrk0jHtQJuwgZv8AP/6qkXkZqGplGBim0iYNjqKKKRYUUUwEk4oAQsR14pu805wT+FRKO1CQE6nNOpowopcigBaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACii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"
                                    width="80"
                                    height="80"
                                    style="border-radius:50%;box-shadow:0 2px 8px #7df2ff;"
                                    alt="Lina Avatar"
                                />
            </div>
            <div class="lina-content">
                <h3>Rencontrez Lina, votre assistante IA</h3>
                <p>J'ai analysé plus de 10 000 options de voyage pour créer cette proposition sur mesure. Chaque détail a été optimisé pour votre expérience parfaite à ${proposal.destination}.</p>
            </div>
        </div>

        <!-- Proposal Card -->
        <div class="proposal-card">
            <div class="proposal-header">
                <h1 class="proposal-title">Proposition Personnalisée</h1>
                <p class="proposal-subtitle">Conçue spécialement pour ${proposal.clientName}</p>
                <div class="badge">Proposition Premium</div>
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Destination</div>
                    <div class="info-value">${proposal.destination}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Dates de voyage</div>
                    <div class="info-value">${proposal.travelDates}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Voyageurs</div>
                    <div class="info-value">${proposal.pax} personne${proposal.pax > 1 ? 's' : ''}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Budget estimé</div>
                    <div class="info-value">${proposal.budget}</div>
                </div>
            </div>


            <!-- Sélections personnalisées (SHORTLIST) -->
            ${shortlistSection}

            <!-- Itinéraire -->
            <div class="itinerary-section">
                <h2 class="section-title">Votre Itinéraire Sur Mesure</h2>
                ${itineraryItems}
            </div>

            <!-- Price -->
            <div style="text-align: center; margin: 40px 0;">
                <div style="color: #94a3b8; font-size: 16px; margin-bottom: 10px;">Prix Total Estimé</div>
                <div class="price-highlight">${proposal.totalPrice}</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 10px;">
                    *Prix définitif confirmé après réservation
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
            <a href="https://zeniva.travel" class="cta-button">
                Réserver Cette Proposition
            </a>
            <div style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
                Proposition valide 7 jours • Support 24/7 inclus
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Cette proposition a été générée par Lina, notre IA de voyage avancée
            </div>
            <div class="footer-text">
                Pour toute question, contactez votre agent Zeniva Travel
            </div>
            <div class="footer-logo">ZENIVA TRAVEL</div>
            <div style="color: #475569; font-size: 12px; margin-top: 10px;">
                Généré le ${new Date(proposal.createdAt).toLocaleDateString('fr-FR')}
            </div>
        </div>
    </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const proposal: ProposalData = await request.json();

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
        'Content-Disposition': `attachment; filename="Proposition-${proposal.clientName}-${proposal.destination}.pdf"`
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