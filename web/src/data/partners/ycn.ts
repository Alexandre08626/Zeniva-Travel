import fs from 'fs';
import path from 'path';

let data: Array<any> = [];
try {
  const p = path.join(process.cwd(), 'src', 'data', 'ycn_packages.json');
  if (fs.existsSync(p)) {
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
} catch (err) {
  // ignore — data will be empty
  console.error('ycn data load error', err);
}

export default data;

export function getYcnPackages() {
  return data;
}
