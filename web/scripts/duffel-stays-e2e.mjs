import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { chromium } from 'playwright-chromium';

const BASE = process.env.LINA_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const artifactsDir = path.resolve(process.cwd(), 'scripts', 'artifacts');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function waitForServer(base, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  const healthUrl = `${base.replace(/\/$/, '')}/api/health`;
  const rootUrl = `${base.replace(/\/$/, '')}/`;
  while (Date.now() < deadline) {
    try {
      // Try health endpoint first
      const res = await fetch(healthUrl, { timeout: 2000 }).catch(() => null);
      if (res && res.ok) return true;
      if (res) console.log('Health endpoint returned', res.status);

      // Fallback: try root page
      const root = await fetch(rootUrl, { timeout: 2000 }).catch(() => null);
      if (root && (root.ok || root.status === 200 || root.status === 304)) return true;
      if (root) console.log('Root endpoint returned', root.status);
    } catch (err) {
      console.log('waitForServer fetch error:', err?.message || err);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not become ready at ${base} after ${timeoutMs}ms`);
}

async function main() {
  console.log('Starting Duffel Stays E2E script');
  console.log('Using base URL:', BASE);

  // Wait for dev server to be ready
  try {
    await waitForServer(BASE, 45000);
    console.log('Server is ready');
  } catch (err) {
    console.error('Server not ready:', err.message);
    process.exit(1);
  }

  // Use dynamic future dates to avoid validation errors
  const now = new Date();
  const checkIn = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // +30 days
  const checkOut = new Date(checkIn.getTime() + 1000 * 60 * 60 * 24 * 7); // +7 nights
  const checkInStr = formatDate(checkIn);
  const checkOutStr = formatDate(checkOut);

  // 1) Search using test coordinates
  const searchUrl = `${BASE}/api/partners/duffel-stays?destination=-24.38,-128.32&checkIn=${encodeURIComponent(checkInStr)}&checkOut=${encodeURIComponent(checkOutStr)}&guests=2&rooms=1`;
  console.log('Searching:', searchUrl);

  const searchRes = await fetch(searchUrl);
  const searchText = await searchRes.text();
  let searchJson = null;
  try { searchJson = JSON.parse(searchText); } catch(_err) { console.error('Invalid JSON from search:', searchText.slice(0,500)); process.exit(1); }
  fs.writeFileSync(path.join(artifactsDir, 'search.json'), JSON.stringify(searchJson, null, 2));

  if (!searchJson || (!searchJson.offers && !searchJson.data)) {
    console.error('No offers/data returned. Response:', JSON.stringify(searchJson).slice(0,300));
    process.exit(1);
  }

  // Navigate response shape: try offers then data.results
  const first = (searchJson.offers || searchJson.data?.results?.flat() || [])[0];
  const searchResultId = first?.searchResultId || first?.id || null;
  console.log('Found searchResultId:', searchResultId);

  // 2) Rates
  if (!searchResultId) {
    console.warn('No search result id found; exiting early. Artifacts saved.');
    return;
  }

  const ratesRes = await fetch(`${BASE}/api/partners/duffel-stays/rates?searchResultId=${encodeURIComponent(searchResultId)}`);
  const ratesJson = await ratesRes.json();
  fs.writeFileSync(path.join(artifactsDir, 'rates.json'), JSON.stringify(ratesJson, null, 2));

  const firstRate = (ratesJson.rates || [])[0];
  const rateId = firstRate?.id || null;
  console.log('RateId:', rateId);

  // 3) Create quote
  let quoteJson = null;
  if (rateId) {
    const quoteRes = await fetch(`${BASE}/api/partners/duffel-stays/quotes`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ rateId })});
    quoteJson = await quoteRes.json();
    fs.writeFileSync(path.join(artifactsDir, 'quote.json'), JSON.stringify(quoteJson, null, 2));
  } else {
    console.warn('No rateId; cannot create quote');
  }

  const quoteId = quoteJson?.quote?.id || quoteJson?.quote?.quote_id || quoteJson?.quote?.id || null;
  console.log('QuoteId:', quoteId);

  // 4) Create booking (test guest)
  let bookingJson = null;
  if (quoteId) {
    const bookingRes = await fetch(`${BASE}/api/partners/duffel-stays/bookings`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ quote_id: quoteId, phone_number: '+15555555555', email: 'tester@example.com', guests: [{ given_name: 'Alpha', family_name: 'Tester', born_on: '1990-01-01' }] }) });
    const bookingText = await bookingRes.text();
    try { bookingJson = JSON.parse(bookingText); } catch(_err) { console.error('Invalid booking JSON:', bookingText); }
    fs.writeFileSync(path.join(artifactsDir, 'booking.json'), JSON.stringify(bookingJson?.booking || bookingJson || { error: bookingText }, null, 2));
  } else {
    console.warn('No quoteId; using mock booking artifact');
  }

  // 5) Use Playwright to open confirmation page, take screenshot, and record video
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ recordVideo: { dir: artifactsDir, size: { width: 1280, height: 720 } } });
  const page = await context.newPage();
  await page.goto(`${BASE}/test/duffel-stays/confirmation`);
  await page.waitForTimeout(1500);
  const screenshotPath = path.join(artifactsDir, 'confirmation.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Saved screenshot to', screenshotPath);
  await context.close();

  // find the recorded video file (Playwright writes to artifactsDir with generated name)
  const files = await fs.promises.readdir(artifactsDir);
  const videoFile = files.find(f => f.endsWith('.webm') || f.endsWith('.mp4')) || null;
  if (videoFile) {
    const videoPath = path.join(artifactsDir, videoFile);
    console.log('Saved video to', videoPath);
  } else {
    console.warn('No video file found in', artifactsDir);
  }
  await browser.close();

  console.log('E2E finished. Artifacts in', artifactsDir);
}

main().catch((err) => { console.error('E2E failed:', err); process.exit(1); });