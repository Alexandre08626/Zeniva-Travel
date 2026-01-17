import { chromium } from 'playwright-chromium';

(async () => {
  try {
    const base = process.env.LINA_BASE_URL || 'http://localhost:3000';
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Open confirmation page which auto-saves
    await page.goto(`${base}/test/duffel-stays/confirmation`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Open documents page and inspect docId occurrences
    await page.goto(`${base}/documents`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Pull out all links that include docId query param and count duplicates
    const counts = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="docId="]'));
      const ids = anchors.map(a => {
        try {
          const url = new URL(a.href);
          return url.searchParams.get('docId');
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      const c = {};
      for (const id of ids) c[id] = (c[id] || 0) + 1;
      return { counts: c, totalLinks: anchors.length };
    });

    console.log('Docs page docId counts:', counts);

    const duplicates = Object.entries(counts.counts).filter(([,v]) => v > 1);
    if (duplicates.length > 0) {
      console.error('Duplicate docId keys found:', duplicates);
      await browser.close();
      process.exit(2);
    }

    console.log('No duplicate docId values found. ✅');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
})();