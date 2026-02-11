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
const projectRoot = process.cwd();
const packagesPath = path.resolve(projectRoot, "web", "src", "data", "ycn_packages.json");

const yachts = [
  {
    id: "48ft-sailing-catamaran-1990-2020",
    localDir: path.resolve(projectRoot, "web", "public", "yachts", "BUBBLE", "Video", "Photo"),
    remotePrefix: "yachts/48ft-sailing-catamaran-1990-2020",
  },
  {
    id: "50ft-azimut-50-fly-2017",
    localDir: path.resolve(projectRoot, "web", "public", "yachts", "KILAUEA", "Photo"),
    remotePrefix: "yachts/50ft-azimut-50-fly-2017",
  },
  {
    id: "60-azimut-fly-2015",
    localDir: path.resolve(projectRoot, "web", "public", "yachts", "TRIFECTA", "Photo"),
    remotePrefix: "yachts/60-azimut-fly-2015",
  },
  {
    id: "118-azimut-grande-36-metri-2025",
    localDir: path.resolve(projectRoot, "web", "public", "yachts", "TYCOON", "Photo"),
    remotePrefix: "yachts/118-azimut-grande-36-metri-2025",
  },
  {
    id: "52ft-prestige-500-fly-2017",
    localDir: path.resolve(projectRoot, "web", "public", "yachts", "WHISKEY & WAVES", "Photo"),
    remotePrefix: "yachts/52ft-prestige-500-fly-2017",
  },
];

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

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

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function readPackageData() {
  if (!fs.existsSync(packagesPath)) {
    throw new Error(`Missing ycn packages file: ${packagesPath}`);
  }
  const raw = fs.readFileSync(packagesPath, "utf8");
  return JSON.parse(raw);
}

function writePackageData(data) {
  fs.writeFileSync(packagesPath, JSON.stringify(data, null, 2), "utf8");
}

function listImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => allowedExtensions.has(path.extname(name).toLowerCase()))
    .sort();
}

async function uploadWithRetry(bucketName, remotePath, fileBody, contentType, maxAttempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(remotePath, fileBody, { upsert: true, contentType });
    if (!error) return;
    lastError = error;
    const delayMs = 1000 * attempt;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw lastError;
}

async function uploadAll() {
  await ensureBucket();
  const packages = readPackageData();
  const updateSummary = [];

  for (const yacht of yachts) {
    const files = listImageFiles(yacht.localDir);
    if (files.length === 0) {
      console.warn(`No images found for ${yacht.id} at ${yacht.localDir}`);
      continue;
    }

    const urls = [];
    let failed = false;
    for (const name of files) {
      const localPath = path.join(yacht.localDir, name);
      const remotePath = `${yacht.remotePrefix}/${name}`;
      const fileBody = fs.readFileSync(localPath);
      try {
        await uploadWithRetry(bucket, remotePath, fileBody, getContentType(name));
      } catch (uploadError) {
        console.error(`Upload failed for ${yacht.id}/${name}: ${uploadError.message || uploadError}`);
        failed = true;
        break;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(remotePath);
      urls.push(data.publicUrl);
      console.log(`Uploaded ${yacht.id}: ${name}`);
    }

    if (failed) {
      console.warn(`Skipping JSON update for ${yacht.id} due to upload errors.`);
      continue;
    }

    const target = packages.find((item) => item.id === yacht.id);
    if (!target) {
      console.warn(`No package entry found for ${yacht.id}; skipping JSON update.`);
      continue;
    }

    target.thumbnail = urls[0];
    target.images = urls;
    updateSummary.push({ id: yacht.id, count: urls.length });
  }

  writePackageData(packages);
  console.log("\nUpdated ycn_packages.json:");
  updateSummary.forEach((row) => console.log(`- ${row.id}: ${row.count} images`));
}

uploadAll().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
