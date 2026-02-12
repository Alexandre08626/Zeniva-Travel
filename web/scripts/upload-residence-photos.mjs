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
  console.error(
    "Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).",
    "Loaded env from:",
    envPath || "none"
  );
  process.exit(1);
}

const bucket = "residence-photos";
const projectRoot = process.cwd();
const packagesPath = path.resolve(projectRoot, "web", "src", "data", "airbnbs.json");

const residences = [
  {
    id: "coastal-hide-away",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Itrip",
      "Floride",
      "Fort Lauderdale",
      "1 (Coastal Hide Away)",
      "Photo"
    ),
    remotePrefix: "residences/coastal-hide-away",
  },
  {
    id: "daiquiri",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Itrip",
      "Floride",
      "Fort Lauderdale",
      "2 (Daiquiri)",
      "Photo"
    ),
    remotePrefix: "residences/daiquiri",
  },
  {
    id: "tropical-breeze",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Itrip",
      "Floride",
      "Fort Lauderdale",
      "3 (Tropical Breeze)",
      "Description",
      "Photo"
    ),
    remotePrefix: "residences/tropical-breeze",
  },
  {
    id: "the-palms",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Itrip",
      "Floride",
      "Fort Lauderdale",
      "4 (The Palms)",
      "Photo"
    ),
    remotePrefix: "residences/the-palms",
  },
  {
    id: "villa-rio",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Itrip",
      "Floride",
      "Fort Lauderdale",
      "6 (Villa Rio)",
      "Photo"
    ),
    remotePrefix: "residences/villa-rio",
  },
  {
    id: "central-tropical-villa",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Vlad Soumin ( Owner )",
      "Proprieter",
      "Central Tropical Villa Heated Pool Close to Beach",
      "Photo"
    ),
    remotePrefix: "residences/central-tropical-villa",
  },
  {
    id: "heated-pool-spacious-home-7-min-to-beach-bbq",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Vlad Soumin ( Owner )",
      "Proprieter",
      "Heated Pool-Spacious Home 7 Min to Beach, BBQ",
      "Photo"
    ),
    remotePrefix: "residences/heated-pool-spacious-home-7-min-to-beach-bbq",
  },
  {
    id: "spacious-6br-villa-resort-style-pool-golf-course",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Vlad Soumin ( Owner )",
      "Proprieter",
      "Spacious 6BR Villa Resort Style Pool Golf Course",
      "Photo"
    ),
    remotePrefix: "residences/spacious-6br-villa-resort-style-pool-golf-course",
  },
  {
    id: "stylish-tropical-villa-with-pool-trampoline",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Vlad Soumin ( Owner )",
      "Proprieter",
      "Stylish Tropical Villa with Pool Trampoline",
      "Photo"
    ),
    remotePrefix: "residences/stylish-tropical-villa-with-pool-trampoline",
  },
  {
    id: "tranquil-7bd-villa-pool-bbq",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Vlad Soumin ( Owner )",
      "Proprieter",
      "Tranquil 7BD Villa-Pool-BBQ",
      "Photo"
    ),
    remotePrefix: "residences/tranquil-7bd-villa-pool-bbq",
  },
  {
    id: "ultimate-villa-heated-pool-playground",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Floride",
      "Vlad Soumin ( Owner )",
      "Proprieter",
      "Ultimate Villa Heated Pool Playground",
      "Photo"
    ),
    remotePrefix: "residences/ultimate-villa-heated-pool-playground",
  },
  {
    id: "bora-bora-royal-beach-villa-with-pool",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Polynesie Francaise",
      "Pearl Resort",
      "BORA BORA",
      "Hotel",
      "Photos",
      "Rooms",
      "Royal Beach Villa with pool"
    ),
    remotePrefix: "residences/bora-bora-royal-beach-villa-with-pool",
  },
  {
    id: "bora-bora-garden-villa-with-pool",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Polynesie Francaise",
      "Pearl Resort",
      "BORA BORA",
      "Hotel",
      "Photos",
      "Rooms",
      "Garden Villa with pool"
    ),
    remotePrefix: "residences/bora-bora-garden-villa-with-pool",
  },
  {
    id: "bora-bora-beach-villa-with-pool",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Polynesie Francaise",
      "Pearl Resort",
      "BORA BORA",
      "Hotel",
      "Photos",
      "Rooms",
      "Beach Villa with Pool"
    ),
    remotePrefix: "residences/bora-bora-beach-villa-with-pool",
  },
  {
    id: "bora-bora-overwater-bungalow",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Polynesie Francaise",
      "Pearl Resort",
      "BORA BORA",
      "Hotel",
      "Photos",
      "Rooms",
      "Overwater Bungalow"
    ),
    remotePrefix: "residences/bora-bora-overwater-bungalow",
  },
  {
    id: "bora-bora-suite-with-pool",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Polynesie Francaise",
      "Pearl Resort",
      "BORA BORA",
      "Hotel",
      "Photos",
      "Rooms",
      "End of Pontoon Overwater Suite with Pool"
    ),
    remotePrefix: "residences/bora-bora-suite-with-pool",
  },
  {
    id: "bora-bora-pool-overwater-villa",
    localDir: path.resolve(
      projectRoot,
      "..",
      "Zeniva Travel",
      "Proprieté",
      "Polynesie Francaise",
      "Pearl Resort",
      "BORA BORA",
      "Hotel",
      "Photos",
      "Rooms",
      "Pool Overwater Villa"
    ),
    remotePrefix: "residences/bora-bora-pool-overwater-villa",
  },
];

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

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
  if (ext === ".avif") return "image/avif";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function readPackageData() {
  if (!fs.existsSync(packagesPath)) {
    throw new Error(`Missing airbnbs file: ${packagesPath}`);
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

  for (const residence of residences) {
    const files = listImageFiles(residence.localDir);
    if (files.length === 0) {
      console.warn(`No images found for ${residence.id} at ${residence.localDir}`);
      continue;
    }

    const urls = [];
    let failed = false;
    for (const name of files) {
      const localPath = path.join(residence.localDir, name);
      const remotePath = `${residence.remotePrefix}/${name}`;
      const fileBody = fs.readFileSync(localPath);
      try {
        await uploadWithRetry(bucket, remotePath, fileBody, getContentType(name));
      } catch (uploadError) {
        console.error(
          `Upload failed for ${residence.id}/${name}: ${uploadError.message || uploadError}`
        );
        failed = true;
        break;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(remotePath);
      urls.push(data.publicUrl);
      console.log(`Uploaded ${residence.id}: ${name}`);
    }

    if (failed) {
      console.warn(`Skipping JSON update for ${residence.id} due to upload errors.`);
      continue;
    }

    const target = packages.find((item) => item.id === residence.id);
    if (!target) {
      console.warn(`No airbnbs entry found for ${residence.id}; skipping JSON update.`);
      continue;
    }

    target.thumbnail = urls[0];
    target.images = urls;
    updateSummary.push({ id: residence.id, count: urls.length });
  }

  writePackageData(packages);
  console.log("\nUpdated airbnbs.json:");
  updateSummary.forEach((row) => console.log(`- ${row.id}: ${row.count} images`));
}

uploadAll().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
