#!/usr/bin/env node
/**
 * YCN Miami broker listings importer.
 * Parses the GoDaddy-hosted page which uses data-aid attributes:
 *   MENU_SECTION{s}_ITEM{i}_TITLE  → yacht name (h4 heading)
 *   MENU_SECTION{s}_ITEM{i}_PRICE  → destination (e.g. "Haulover", "Key West")
 *   MENU_SECTION{s}_ITEM{i}_DESC   → description with prices, amenities, calendar/media links
 *   MENU_SECTION{s}_ITEM{i}_IMAGE  → yacht image (data-srclazy attribute)
 *
 * Usage: node scripts/import-ycn.js
 */

const fs = require('fs');
const path = require('path');

async function fetchText(url) {
  if (typeof fetch === 'undefined') {
    const nodeFetch = await import('node-fetch');
    return (await nodeFetch.default(url)).text();
  }
  return (await fetch(url)).text();
}

function extractListings(html) {
  const listings = [];

  // Find all MENU_SECTION*_ITEM*_TITLE elements (yacht names) - these are in h4 tags
  // Pattern: data-aid="MENU_SECTION0_ITEM0_TITLE" ... >43ft Leopard Power Cat (2017)</h4>
  const titleRegex = /data-aid="MENU_SECTION(\d+)_ITEM(\d+)_TITLE"[^>]*>([^<]+)<\/h4>/gi;
  
  // PRICE contains destination (confusing GoDaddy naming)
  const priceRegex = /data-aid="MENU_SECTION(\d+)_ITEM(\d+)_PRICE"[^>]*>([^<]+)<\/div>/gi;
  
  // DESC contains description with prices, amenities, links - spans multiple lines
  const descRegex = /data-aid="MENU_SECTION(\d+)_ITEM(\d+)_DESC"[^>]*>([\s\S]*?)(?:<\/div><\/div><\/div><\/div>|$)/gi;
  
  // IMAGE tag (thumbnail + srcset variants)
  const imageTagRegex = /<img[^>]*data-aid="MENU_SECTION(\d+)_ITEM(\d+)_IMAGE"[^>]*>/gi;

  // Collect all titles (yacht names)
  const titles = {};
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    const key = `${match[1]}_${match[2]}`;
    titles[key] = match[3].trim();
  }
  console.log('Found', Object.keys(titles).length, 'yacht titles');

  // Collect all destinations (confusingly labeled PRICE in the HTML)
  const destinations = {};
  while ((match = priceRegex.exec(html)) !== null) {
    const key = `${match[1]}_${match[2]}`;
    destinations[key] = match[3].trim();
  }
  console.log('Found', Object.keys(destinations).length, 'destinations');

  // Collect all descriptions
  const descriptions = {};
  while ((match = descRegex.exec(html)) !== null) {
    const key = `${match[1]}_${match[2]}`;
    descriptions[key] = match[3];
  }
  console.log('Found', Object.keys(descriptions).length, 'descriptions');

  // Collect thumbnails + galleries
  const thumbs = {};
  const galleries = {};
  while ((match = imageTagRegex.exec(html)) !== null) {
    const section = match[1];
    const item = match[2];
    const key = `${section}_${item}`;
    const tag = match[0];

    const srclazyMatch = tag.match(/data-srclazy="([^"]+)"/i);
    const srcsetLazyMatch = tag.match(/data-srcsetlazy="([^"]+)"/i) || tag.match(/srcset="([^"]+)"/i);

    if (srclazyMatch) {
      const raw = srclazyMatch[1];
      const url = raw.startsWith('//') ? 'https:' + raw : raw;
      thumbs[key] = url;
    }

    if (srcsetLazyMatch) {
      const variants = srcsetLazyMatch[1]
        .split(',')
        .map((p) => p.trim().split(' ')[0])
        .filter(Boolean);

      variants.forEach((u) => {
        const normalized = u.startsWith('//') ? 'https:' + u : u;
        if (normalized.includes('wsimg.com')) {
          if (!galleries[key]) galleries[key] = [];
          if (!galleries[key].includes(normalized)) galleries[key].push(normalized);
        }
      });
    }
  }
  console.log('Found', Object.keys(thumbs).length, 'images');

  // Merge into listings
  for (const key of Object.keys(titles)) {
    const title = titles[key];
    const destination = destinations[key] || '';
    const descHtml = descriptions[key] || '';
    const thumbnail = thumbs[key] || null;

    // Parse prices from description (e.g. "4 hrs $1,700 all in")
    const prices = [];
    const priceMatches = descHtml.match(/\d+\s*hrs?\s+\$[\d,]+[^<]*/gi) || [];
    priceMatches.forEach(p => prices.push(p.replace(/<[^>]+>/g, '').trim()));

    // Also capture "24 hrs", "1 week", "Day trip" prices
    const extraPrices = descHtml.match(/(24\s*hrs?|1\s*week|Day\s*trip)[^<]*\$[\d,]+[^<]*/gi) || [];
    extraPrices.forEach(p => {
      const clean = p.replace(/<[^>]+>/g, '').trim();
      if (!prices.includes(clean)) prices.push(clean);
    });

    // Extract calendar link
    const calMatch = descHtml.match(/href="(http:\/\/calendar\.ycn\.miami\/[^"]+)"/i);
    const calendar = calMatch ? calMatch[1] : null;

    // Extract media link
    const mediaMatch = descHtml.match(/href="(http:\/\/media\.ycn\.miami\/[^"]+)"/i);
    const media = mediaMatch ? mediaMatch[1] : null;

    // Extract amenities (emoji lines)
    const amenities = [];
    const emojiLines = descHtml.match(/(?:👨🏻‍✈️|🧊|🏄🏼‍♀️|📍|🛥️|🚤)[^<]+/gi) || [];
    emojiLines.forEach(line => amenities.push(line.trim()));

    // Extract beds/baths/sleeps info
    const specsMatch = descHtml.match(/(\d+\s*beds?\s*\|\s*\d+\s*baths?\s*\|\s*\d+\s*sleeps?[^<]*)/i);
    const specs = specsMatch ? specsMatch[1].trim() : null;

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    listings.push({
      id: slug,
      title,
      destination,
      prices,
      calendar,
      media,
      amenities,
      specs,
      thumbnail,
      images: galleries[key] && galleries[key].length ? galleries[key] : [],
    });
  }

  return listings;
}

async function fetchMediaImages(mediaUrl) {
  if (!mediaUrl) return [];
  try {
    const html = await fetchText(mediaUrl);
    const imgUrls = [];
    // Match wsimg.com images (GoDaddy CDN) and other yacht images
    const imgRegex = /https?:\/\/[^"'\s>]+\.(?:jpe?g|png|webp)/gi;
    let m;
    while ((m = imgRegex.exec(html)) !== null) {
      const url = m[0].replace(/:\/rs=.+$/, ''); // strip GoDaddy resize params
      // Filter out Google icons and tracking pixels
      if (!imgUrls.includes(url) && 
          !url.includes('gstatic.com') && 
          !url.includes('google.com') &&
          !url.includes('favicon') &&
          url.includes('wsimg.com')) {
        imgUrls.push(url);
      }
    }
    return imgUrls.slice(0, 10); // limit to 10 images
  } catch (e) {
    console.log('Could not fetch media page:', mediaUrl);
    return [];
  }
}

async function run() {
  try {
    const url = 'http://ycn.miami/brokers';
    console.log('Fetching', url);
    const html = await fetchText(url);

    // Save HTML for debugging
    const dbgPath = path.join(__dirname, 'ycn-brokers.html');
    fs.writeFileSync(dbgPath, html, 'utf8');
    console.log('Saved HTML to', dbgPath);

    const listings = extractListings(html);
    console.log('Found', listings.length, 'listings');

    // Fetch images from media pages only if we have none from the listing card
    for (const item of listings) {
      if ((!item.images || item.images.length === 0) && item.media) {
        console.log('Fetching media for:', item.title);
        const fetched = await fetchMediaImages(item.media);
        if (fetched.length) item.images = fetched;
      }

      // Ensure we always have at least the thumbnail as a single-image gallery
      if ((!item.images || item.images.length === 0) && item.thumbnail) {
        item.images = [item.thumbnail];
      }
    }

    // Write output
    const outDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'ycn_packages.json');
    fs.writeFileSync(outPath, JSON.stringify(listings, null, 2), 'utf8');
    console.log('Wrote', outPath, 'with', listings.length, 'items');
  } catch (err) {
    console.error('Import failed', err);
    process.exit(2);
  }
}

run();
