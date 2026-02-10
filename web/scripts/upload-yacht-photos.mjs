import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const obj = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    obj[key] = val;
  }
  return obj;
}

function resolveEnv() {
  const envPaths = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "web", ".env.local"),
    path.resolve(process.cwd(), "..", "web", ".env.local"),
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      return { env: loadEnv(p), path: p };
    }
  }
  return { env: {}, path: null };
}

const { env, path: envPath } = resolveEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).",
    "Loaded env from:", envPath || "none");
  process.exit(1);
}

const bucket = "yacht-photos";
const localDir = path.resolve(process.cwd(), "web", "public", "yachts", "52ft-prestige-500-fly-2017");
const remotePrefix = "yachts/52ft-prestige-500-fly-2017";
const outputListPath = path.resolve(process.cwd(), "prestige-images-supabase.txt");

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Failed to list buckets: ${error.message}`);
  }
  const exists = (buckets || []).some((b) => b.name === bucket);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, { public: true });
    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
  }
}

async function uploadAll() {
  await ensureBucket();
  const files = fs.readdirSync(localDir)
    .filter((name) => name.toLowerCase().endsWith(".jpg"))
    .sort();

  const urls = [];
  for (const name of files) {
    const localPath = path.join(localDir, name);
    const remotePath = `${remotePrefix}/${name}`;
    const fileBody = fs.readFileSync(localPath);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(remotePath, fileBody, { upsert: true, contentType: "image/jpeg" });
    if (uploadError) {
      throw new Error(`Upload failed for ${name}: ${uploadError.message}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(remotePath);
    urls.push(data.publicUrl);
    console.log(`Uploaded ${name}`);
  }

  const lines = urls.map((u, i) => {
    const suffix = i === urls.length - 1 ? "" : ",";
    return `      "${u}"${suffix}`;
  });
  fs.writeFileSync(outputListPath, lines.join("\n"), "utf8");
  console.log(`\nWrote URL list to ${outputListPath}`);
}

uploadAll().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
