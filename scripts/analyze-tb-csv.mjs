import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, '..', 'all_TB_commissioning_items.csv');
const text = fs.readFileSync(csvPath, 'utf8').trim();
const lines = text.split(/\r?\n/);

function parseCsvLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

const header = parseCsvLine(lines[0]);
const idx = (name) => header.indexOf(name);
const rows = lines.slice(1).map(parseCsvLine);

const tbs = new Set();
const groups = {};
const projects = new Set();
const classes = {};

for (const r of rows) {
  tbs.add(r[idx('TerminalBox')]);
  projects.add(r[idx('Project')]);
  const g = r[idx('ItemGroup')];
  groups[g] = (groups[g] || 0) + 1;
  const c = r[idx('EquipmentClass')];
  classes[c] = (classes[c] || 0) + 1;
}

console.log('Rows:', rows.length);
console.log('Projects:', [...projects]);
console.log('Terminal boxes:', tbs.size, [...tbs].sort().join(', '));
console.log('ItemGroup counts:', groups);
console.log('EquipmentClass counts:', classes);
console.log(
  'Rows with RelatedCable:',
  rows.filter((r) => r[idx('RelatedCable')]?.trim()).length
);
console.log(
  'Rows with RelatedLoop:',
  rows.filter((r) => r[idx('RelatedLoop')]?.trim()).length
);
