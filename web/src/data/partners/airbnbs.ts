import fs from 'fs';
import path from 'path';

let data: Array<any> = [];
try {
  const p = path.join(process.cwd(), 'src', 'data', 'airbnbs.json');
  if (fs.existsSync(p)) {
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('airbnbs data load error', err);
}

export default data;

export function getAirbnbs() {
  return data;
}
