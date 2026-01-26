/**
 * Playwright-powered scraper for zenivatravel.com residences (Airbnbs).
 * Grabs the listing page, visits each property, and captures title, location, description, and images.
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-chromium");

const LIST_URL = "https://www.zenivatravel.com/properties-1-1";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseWidthFromUrl(url) {
  // Wix static URLs often contain /w_720 or /w_168; pull the first width-like token
  const m = url.match(/\/w_(\d{2,5})/);
  return m ? parseInt(m[1], 10) : null;
}

function filterImages(imgs) {
  const filtered = imgs.filter((src) => {
    if (!src.includes("static.wixstatic.com/media")) return false;
    if (/logo|favicon|icon|placeholder/i.test(src)) return false;
    const w = parseWidthFromUrl(src);
    if (w !== null && w < 280) return false; // drop tiny assets like the logo 168w
    return true;
  });
  return filtered.length ? filtered : imgs; // fallback to originals if all filtered out
}

async function extractLinks(page) {
  const anchors = await page.$$eval('a[href*="/properties-1-1/"]', (els) =>
    Array.from(new Set(els.map((a) => a.href.split("?")[0])))
  );
  return anchors.filter((u) => /properties-1-1\//.test(u));
}

async function scrapeProperty(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });

  const data = await page.evaluate(() => {
    const og = (name) => document.querySelector(`meta[property="og:${name}"]`)?.getAttribute("content") || null;
    const getHeadingText = (label) => {
      const h = Array.from(document.querySelectorAll("h1,h2,h3,h4")).find((el) =>
        el.textContent && el.textContent.toLowerCase().includes(label)
      );
      if (!h) return null;
      // try next sibling first for concise info
      const next = h.nextElementSibling;
      if (next && next.textContent) return next.textContent.trim();
      const block = h.closest("section") || h.parentElement;
      return block ? block.innerText.trim() : h.innerText.trim();
    };

    const title = document.querySelector("h1")?.innerText.trim() || og("title") || document.title;
    const desc = og("description") || getHeadingText("property description") || "";
    const locText = getHeadingText("property location") || "";

    const imgs = Array.from(document.querySelectorAll("img"))
      .map((img) => img.getAttribute("src") || "")
      .filter((src) => src.includes("static.wixstatic.com/media"));

    const hero = og("image");
    if (hero) imgs.unshift(hero);

    return { title, description: desc, location: locText, images: Array.from(new Set(imgs)) };
  });

  const title = data.title || "Residence";
  const id = slugify(title) || slugify(url.split("/").pop());
  const images = filterImages(data.images || []);
  const thumbnail = images[0] || null;

  return {
    id,
    title,
    url,
    location: (data.location || "").split("\n")[0].trim(),
    description: data.description || "",
    thumbnail,
    images,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log("Fetching listing:", LIST_URL);
  await page.goto(LIST_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  const links = await extractLinks(page);
  console.log(`Found ${links.length} property links`);

  const results = [];
  for (const url of links) {
    try {
      console.log("→", url);
      const detailPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const item = await scrapeProperty(detailPage, url);
      await detailPage.close();
      results.push(item);
    } catch (err) {
      console.error("Failed", url, err.message);
    }
  }

  await browser.close();

  const outPath = path.join(__dirname, "..", "src", "data", "airbnbs.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log("Saved", results.length, "entries to", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});