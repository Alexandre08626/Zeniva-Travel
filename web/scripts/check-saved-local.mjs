import { chromium } from 'playwright-chromium';

(async () => {
  try {
    const base = 'http://localhost:3000';
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${base}/test/duffel-stays/confirmation`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Body length:', text.length);
    console.log('Snippet:', text.slice(0, 2000));
    const storage = await page.evaluate(() => localStorage.getItem('zeniva_documents_store_v1'));
    console.log('Local storage:', storage ? storage.slice(0, 800) : 'empty');
    const has = text.includes('Saved locally on this device') || text.includes('Saved locally');
    console.log('Has saved locally notice:', has);
    await browser.close();
  } catch (err) {
    console.error('Error checking page:', err);
    process.exit(1);
  }
})();