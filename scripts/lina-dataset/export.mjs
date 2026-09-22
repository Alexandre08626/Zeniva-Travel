#!/usr/bin/env node
// Export Lina conversations from Supabase (lina_training_turns) into a
// fine-tuning dataset (ShareGPT / chat_template JSONL, ready for Axolotl or Unsloth).
//
// Usage (from repo root):
//   node scripts/lina-dataset/export.mjs [--min-rating 4] [--since 2026-01-01] [--source lina,lina-stream]
//                                        [--out scripts/lina-dataset/out] [--val 0.05] [--include-unrated]
//
// Env: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY — reads web/.env.local if present.

import { createClient } from "../../web/node_modules/@supabase/supabase-js/dist/index.mjs";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ---------- args ----------
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] === undefined ? "true" : arr[i + 1]]);
    return acc;
  }, [])
);
const MIN_RATING = args["min-rating"] ? Number(args["min-rating"]) : null;
const INCLUDE_UNRATED = args["include-unrated"] === "true" || MIN_RATING === null;
const SINCE = args.since || null;
const SOURCES = args.source ? args.source.split(",") : null;
const OUT_DIR = join(ROOT, args.out || "scripts/lina-dataset/out");
const VAL_RATIO = Number(args.val ?? 0.05);

// ---------- env ----------
for (const f of ["web/.env.local", "web/.env", ".env"]) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ---------- PII scrubbing (clients are real people — never ship raw PII into weights) ----------
const scrub = (t) =>
  String(t || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]")
    .replace(/\b(?:\d[ -]?){13,19}\b/g, "[CARD]")
    .replace(/(\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g, "[PHONE]")
    .replace(/\b\d{3}[- ]?\d{3}[- ]?\d{3}\b/g, "[SIN]")
    .replace(/https?:\/\/\S*(token|key|session|auth)=\S*/gi, "[URL]");

// Replies produced when every provider failed — pure noise for training
const BAD_REPLY = /temporarily unavailable|n'ai pas pu répondre|Je n'ai pas pu|rate limit|error/i;

const DEFAULT_SYSTEM =
  "Tu es Lina, l'assistante de voyage IA de Zeniva Travel (zenivatravel.com). Tu aides les voyageurs à planifier et réserver des voyages complets. Réponds dans la langue du client.";

// ---------- fetch ----------
async function fetchAll() {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    let q = db
      .from("lina_training_turns")
      .select("id, created_at, session_id, source, mode, provider, agency_id, system_prompt, history, prompt, reply, rating, reviewed_reply, exclude")
      .eq("exclude", false)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (SINCE) q = q.gte("created_at", SINCE);
    if (SOURCES) q = q.in("source", SOURCES);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

// ---------- build samples ----------
function toSample(row) {
  const reply = scrub((row.reviewed_reply || row.reply || "").trim());
  const prompt = scrub((row.prompt || "").trim());
  if (!prompt || reply.length < 20) return null;
  if (!row.reviewed_reply && BAD_REPLY.test(reply)) return null;
  if (MIN_RATING !== null) {
    if (row.rating === null && !INCLUDE_UNRATED) return null;
    if (row.rating !== null && row.rating < MIN_RATING) return null;
  }

  const history = (Array.isArray(row.history) ? row.history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .map((m) => ({ from: m.role === "user" ? "human" : "gpt", value: scrub(m.content) }));

  return {
    id: row.id,
    session_id: row.session_id,
    source: row.source,
    mode: row.mode,
    rating: row.rating,
    reviewed: Boolean(row.reviewed_reply),
    conversations: [
      { from: "system", value: scrub(row.system_prompt || DEFAULT_SYSTEM) },
      ...history,
      { from: "human", value: prompt },
      { from: "gpt", value: reply },
    ],
  };
}

const rows = await fetchAll();
const seen = new Set();
const samples = [];
const stats = { rows: rows.length, kept: 0, dropped_empty_or_error: 0, dropped_dup: 0, dropped_rating: 0, by_source: {}, by_mode: {}, reviewed: 0 };

for (const row of rows) {
  const s = toSample(row);
  if (!s) {
    if (MIN_RATING !== null && row.rating !== null && row.rating < MIN_RATING) stats.dropped_rating++;
    else stats.dropped_empty_or_error++;
    continue;
  }
  const key = createHash("sha1").update(JSON.stringify(s.conversations.slice(1))).digest("hex");
  if (seen.has(key)) { stats.dropped_dup++; continue; }
  seen.add(key);
  samples.push(s);
  stats.kept++;
  stats.by_source[s.source] = (stats.by_source[s.source] || 0) + 1;
  stats.by_mode[s.mode || "unknown"] = (stats.by_mode[s.mode || "unknown"] || 0) + 1;
  if (s.reviewed) stats.reviewed++;
}

// Split by session so a conversation never leaks across train/val
const sessions = [...new Set(samples.map((s) => s.session_id))].sort(() => Math.random() - 0.5);
const valSessions = new Set(sessions.slice(0, Math.floor(sessions.length * VAL_RATIO)));
const train = samples.filter((s) => !valSessions.has(s.session_id));
const val = samples.filter((s) => valSessions.has(s.session_id));

mkdirSync(OUT_DIR, { recursive: true });
const jsonl = (arr) => arr.map((s) => JSON.stringify({ conversations: s.conversations })).join("\n") + "\n";
writeFileSync(join(OUT_DIR, "train.jsonl"), jsonl(train));
writeFileSync(join(OUT_DIR, "val.jsonl"), jsonl(val));
writeFileSync(join(OUT_DIR, "stats.json"), JSON.stringify({ ...stats, train: train.length, val: val.length, generated_at: new Date().toISOString() }, null, 2));

console.log(`Lina dataset → ${OUT_DIR}`);
console.log(`  rows in DB      : ${stats.rows}`);
console.log(`  kept            : ${stats.kept}  (train ${train.length} / val ${val.length}, human-reviewed ${stats.reviewed})`);
console.log(`  dropped         : ${stats.dropped_empty_or_error} empty/error, ${stats.dropped_dup} duplicates, ${stats.dropped_rating} low rating`);
console.log(`  by source       : ${JSON.stringify(stats.by_source)}`);
if (stats.kept < 500) console.log(`\n  ⚠ ${stats.kept} samples is too few for a fine-tune. Target: 3 000+ (ideally rated ≥4).`);
