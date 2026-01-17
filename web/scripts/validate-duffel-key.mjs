import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Simple .env.local parser (no external deps required)
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const obj = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    obj[key] = val;
  }
  return obj;
}

// Check common locations: repo root or web/
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), 'web', '.env.local'),
  path.resolve(process.cwd(), '..', 'web', '.env.local'),
];
let env = {};
let foundPath = null;
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    env = loadEnv(p);
    foundPath = p;
    break;
  }
}
const key = env.DUFFEL_STAYS_API_KEY || env.DUFFEL_API_KEY || process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
if (!key) {
  console.error('DUFFEL key not found in .env.local (checked web/.env.local and repo .env.local)');
  process.exit(1);
}
if (foundPath) console.log('Loaded env from', foundPath);

(async function() {
  try {
    const res = await fetch('https://api.duffel.com/stays/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({ data: { rooms:1, location: { radius:100, geographic_coordinates: { latitude:-24.38, longitude:-128.32 } }, check_in_date: '2025-06-10', check_out_date: '2025-06-17', guests: [{ type: 'adult' }, { type: 'adult' }] } })
    });

    console.log('Response status:', res.status);
    const text = await res.text();
    try {
      console.log('Body (json):', JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
      console.log('Body (text):', text.slice(0, 1000));
    }
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(2);
  }
})();
