/**
 * Import Batch House terminal box commissioning CSV → Cinernet JSON.
 *
 * Usage: npm run import:tb
 * Source: data/source/all_TB_commissioning_items.csv (or project-root CSV)
 * Output: data/imported/batch-house-terminal-boxes.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SOURCE_CANDIDATES = [
  path.join(root, 'data/source/all_TB_commissioning_items.csv'),
  path.join(root, 'all_TB_commissioning_items.csv'),
];

const OUTPUT = path.join(root, 'data/imported/batch-house-terminal-boxes.json');

const PLC_GROUPS = new Set(['di', 'do', 'io']);

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

function parseBool(v) {
  return String(v).toLowerCase() === 'true';
}

function itemSignalLayer(group) {
  return PLC_GROUPS.has(group) ? 'plc' : 'power';
}

function mapRow(header, row) {
  const idx = (name) => header.indexOf(name);
  const itemGroup = row[idx('ItemGroup')];
  return {
    title: row[idx('Title')],
    itemId: row[idx('ItemID')],
    itemGroup,
    equipmentClass: row[idx('EquipmentClass')],
    functionalRole: row[idx('FunctionalRole')],
    physicalRow: row[idx('PhysicalRow')],
    drawingReference: row[idx('DrawingReference')],
    status: row[idx('Status')],
    found: parseBool(row[idx('Found')]),
    labelOk: parseBool(row[idx('LabelOK')]),
    cableMarkerOk: parseBool(row[idx('CableMarkerOK')]),
    continuityOk: parseBool(row[idx('ContinuityOK')]),
    peOk: parseBool(row[idx('PEOK')]),
    loopOk: parseBool(row[idx('LoopOK')]),
    notes: row[idx('Notes')] || undefined,
    relatedCable: row[idx('RelatedCable')] || undefined,
    relatedLoop: row[idx('RelatedLoop')] || undefined,
    signalLayer: itemSignalLayer(itemGroup),
  };
}

function buildSummary(tbId, project, items) {
  const byGroup = {};
  for (const item of items) {
    byGroup[item.itemGroup] = (byGroup[item.itemGroup] || 0) + 1;
  }
  const drawingReferences = [...new Set(items.map((i) => i.drawingReference).filter(Boolean))];
  const powerItemCount = items.filter((i) => i.signalLayer === 'power').length;
  const plcItemCount = items.filter((i) => i.signalLayer === 'plc').length;
  return {
    terminalBoxId: tbId,
    project,
    itemCount: items.length,
    byGroup,
    drawingReferences,
    powerItemCount,
    plcItemCount,
  };
}

function powerChecklistSteps(items, tbId) {
  return items
    .filter((i) => i.signalLayer === 'power')
    .slice(0, 12)
    .map((item, n) => ({
      id: `${tbId}-${item.itemId}-${n}`,
      text: `[${item.itemGroup}] ${item.itemId} — ${item.physicalRow} (${item.drawingReference})`,
    }));
}

function buildNode(tbId, project, items, branchIndex) {
  const summary = buildSummary(tbId, project, items);
  const powerSteps = powerChecklistSteps(items, tbId);
  const anyFault = items.some(
    (i) => i.signalLayer === 'power' && i.status.toLowerCase().includes('fault')
  );
  const anyOpen = items.some(
    (i) =>
      i.signalLayer === 'power' &&
      (i.status === 'Not checked' || !i.continuityOk)
  );

  return {
    id: tbId,
    name: `Terminal Box ${tbId}`,
    assetType: 'junction-box',
    layer: 'junction',
    status: anyFault ? 'fault' : anyOpen ? 'investigation' : 'operational',
    layout: { building: 'batch-house', branchIndex },
    mapScope: 'building-detail',
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-ground',
      floor: 'Ground',
      elevation: '0 m',
      area: `${project} — terminal box ${tbId}`,
      gridRef: tbId,
    },
    specs: {
      location: summary.drawingReferences.slice(0, 3).join('; '),
      notes: `${summary.itemCount} items (${summary.powerItemCount} power / ${summary.plcItemCount} PLC)`,
    },
    troubleshootingSteps: powerSteps.length
      ? powerSteps
      : [{ id: `${tbId}-placeholder`, text: 'Import power commissioning steps from CSV.' }],
    terminalBox: { summary, items },
  };
}

function main() {
  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    console.error('CSV not found. Expected one of:', SOURCE_CANDIDATES);
    process.exit(1);
  }

  const text = fs.readFileSync(source, 'utf8').trim();
  const lines = text.split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine).map((r) => mapRow(header, r));

  const byTerminalBox = new Map();
  for (let i = 1; i < lines.length; i++) {
    const raw = parseCsvLine(lines[i]);
    const tbId = raw[header.indexOf('TerminalBox')];
    const project = raw[header.indexOf('Project')];
    const item = mapRow(header, raw);
    if (!byTerminalBox.has(tbId)) byTerminalBox.set(tbId, { project, items: [] });
    byTerminalBox.get(tbId).items.push(item);
  }

  const sortedIds = [...byTerminalBox.keys()].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return na - nb || a.localeCompare(b);
  });

  const nodes = sortedIds.map((tbId, i) => {
    const { project, items } = byTerminalBox.get(tbId);
    return buildNode(tbId, project, items, i + 1);
  });

  const meta = {
    importedAt: new Date().toISOString(),
    sourceFile: path.relative(root, source),
    rowCount: rows.length,
    terminalBoxCount: nodes.length,
    plcItemCount: rows.filter((r) => r.signalLayer === 'plc').length,
    powerItemCount: rows.filter((r) => r.signalLayer === 'power').length,
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify({ meta, nodes }, null, 2), 'utf8');

  console.log(`Imported ${meta.rowCount} rows → ${meta.terminalBoxCount} terminal boxes`);
  console.log(`  Power-layer items: ${meta.powerItemCount}`);
  console.log(`  PLC-layer items (stored, map later): ${meta.plcItemCount}`);
  console.log(`Written: ${path.relative(root, OUTPUT)}`);
}

main();
