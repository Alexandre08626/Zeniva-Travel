const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!base) {
  throw new Error("Missing SUPABASE_URL");
}

const ids = [
  "modern-loft-with-d102",
  "loft-elegante-condo-c102",
  "cozy-loft-steps-from-beach-with-pool-c101",
];

const root = path.join(process.cwd(), "public", "residence-photos", "residences");
const out = [];

for (const id of ids) {
  const dir = path.join(root, id);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(avif|jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b));

  const urls = files.map(
    (f) =>
      `${base}/storage/v1/object/public/residence-photos/residences/${id}/${encodeURIComponent(f)}`
  );

  out.push(`ID ${id}`);
  out.push(`    "thumbnail": "${urls[0]}",`);
  out.push("    \"images\": [");

  urls.forEach((url, index) => {
    const suffix = index === urls.length - 1 ? "" : ",";
    out.push(`      "${url}"${suffix}`);
  });

  out.push("    ]");
  out.push("");
}

fs.writeFileSync(path.join(process.cwd(), "temp-holbox-images.txt"), out.join("\n"));
