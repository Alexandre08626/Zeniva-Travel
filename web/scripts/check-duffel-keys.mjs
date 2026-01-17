#!/usr/bin/env node
import process from 'process';
import fs from 'fs';
import path from 'path';

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const obj = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim();
    obj[k] = v;
  }
  return obj;
}

// Check web/.env.local or repo .env.local
const envPaths = [
  path.resolve(process.cwd(), 'web', '.env.local'),
  path.resolve(process.cwd(), '.env.local'),
];
let env = {};
let found = null;
for (const p of envPaths) {
  if (fs.existsSync(p)) { env = loadEnv(p); found = p; break; }
}
const key = env.DUFFEL_STAYS_API_KEY || env.DUFFEL_API_KEY || process.env.DUFFEL_STAYS_API_KEY || process.env.DUFFEL_API_KEY;
if (!key) {
  console.error('ERROR: DUFFEL_STAYS_API_KEY is not set. Copy .env.example to .env.local and set DUFFEL_STAYS_API_KEY to a duffel_test_ key.');
  process.exit(1);
}
if (!key.startsWith('duffel_test_')) {
  console.warn('WARNING: The Duffel key does not look like a test key. For local tests and the Duffel review use a key starting with duffel_test_.');
  console.warn('Current value (truncated):', key.slice(0, 20) + '...');
  process.exit(2);
}
if (found) console.log('Loaded env from', found);
console.log('OK: Duffel test key present.');
process.exit(0);
