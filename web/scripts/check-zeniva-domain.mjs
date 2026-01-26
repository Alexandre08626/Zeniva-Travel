import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = ["zeniva", "ca"].join(".");
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  ".vercel",
  "dist",
  "build",
  "out",
  "coverage",
  ".cache",
]);

async function walk(dir, results) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await walk(fullPath, results);
      continue;
    }

    if (!entry.isFile()) continue;

    let content;
    try {
      content = await fs.readFile(fullPath, "utf8");
    } catch {
      continue;
    }

    if (content.includes(TARGET)) {
      results.push(fullPath);
    }
  }
}

const matches = [];
await walk(ROOT, matches);

if (matches.length > 0) {
  console.error(`Found ${TARGET} in ${matches.length} file(s):`);
  for (const file of matches) {
    console.error(`- ${path.relative(ROOT, file)}`);
  }
  process.exit(1);
}

console.log(`No ${TARGET} references found.`);
