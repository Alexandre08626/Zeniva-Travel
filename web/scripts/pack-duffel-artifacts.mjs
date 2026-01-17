import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const artifactsDir = path.resolve(process.cwd(), 'scripts', 'artifacts');
const outPath = path.join(artifactsDir, `duffel-artifacts-${Date.now()}.zip`);

if (!fs.existsSync(artifactsDir)) {
  console.error('No artifacts directory found:', artifactsDir);
  process.exit(1);
}

const output = fs.createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('Created', outPath, 'size', archive.pointer(), 'bytes');
});
archive.on('error', (err) => { throw err; });
archive.pipe(output);
archive.directory(artifactsDir, false);
archive.finalize();
