import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env var.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "residence-photos";
const baseDir = path.join(process.cwd(), "public", "residence-photos", "residences");

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function uploadFile(fullPath) {
  const relative = path.relative(baseDir, fullPath).split(path.sep).join("/");
  const storagePath = `residences/${relative}`;
  const fileBuffer = fs.readFileSync(fullPath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType: undefined,
    });

  if (error) {
    throw new Error(`${storagePath}: ${error.message}`);
  }
}

async function main() {
  if (!fs.existsSync(baseDir)) {
    console.error(`Base directory not found: ${baseDir}`);
    process.exit(1);
  }

  const files = listFiles(baseDir).sort();
  if (files.length === 0) {
    console.log("No files found to upload.");
    return;
  }

  console.log(`Uploading ${files.length} files to ${BUCKET}/residences/...`);

  for (const file of files) {
    await uploadFile(file);
    console.log(`Uploaded: ${path.relative(baseDir, file)}`);
  }

  console.log("Upload complete.");
}

main().catch((err) => {
  console.error("Upload failed:", err.message);
  process.exit(1);
});
