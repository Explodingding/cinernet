/**
 * Topology integrity validation — run with:  npx tsx scripts/validate-topology.ts
 *
 * Checks:
 *  1. No dangling edges (every source/target resolves to a defined node).
 *  2. Every node belongs to an active map column (MAP_COLUMN_ORDER).
 *  3. No orphan nodes (every non-feed node has at least one upstream edge).
 *  4. Fault cascade reach — a fault at MAIN-HV-CELL-01 must propagate
 *     cross-building into BOTH Furnace-10 loads AND Batch House / Cullet
 *     Tower loads via the BFS in lib/faultCascade.ts.
 *
 * Exits non-zero on any failure — suitable as a CI gate.
 */
import { topologyNodeInputs, topologyEdges } from '../data/mockTopology';
import { MAP_COLUMN_ORDER } from '../data/buildings';
import { computeDerivedStatuses } from '../lib/faultCascade';
import { assignParallelIndices } from '../lib/parallelEdges';
import { layoutNodes, computeBuildingCols } from '../lib/siteLayout';
import type { TopologyNode } from '../types/topology';

let failures = 0;
const fail = (msg: string) => { failures++; console.error(`  ✗ ${msg}`); };
const pass = (msg: string) => console.log(`  ✓ ${msg}`);

const nodeIds = new Set(topologyNodeInputs.map((n) => n.id));

// ── 1. Dangling edges ──────────────────────────────────────────────────────────
console.log('\n[1] Dangling edge check');
let dangling = 0;
for (const e of topologyEdges) {
  if (!nodeIds.has(e.source)) { fail(`edge ${e.id}: source '${e.source}' does not exist`); dangling++; }
  if (!nodeIds.has(e.target)) { fail(`edge ${e.id}: target '${e.target}' does not exist`); dangling++; }
}
if (dangling === 0) pass(`all ${topologyEdges.length} edges resolve to defined nodes`);

// ── 2. Active-column membership ────────────────────────────────────────────────
console.log('\n[2] Building column membership');
const activeCols = new Set<string>(MAP_COLUMN_ORDER);
const offColumn = topologyNodeInputs.filter(
  (n) => !activeCols.has(n.physicalLocation.building)
);
if (offColumn.length === 0) {
  pass(`all ${topologyNodeInputs.length} nodes sit in active columns [${MAP_COLUMN_ORDER.join(' | ')}]`);
} else {
  for (const n of offColumn) fail(`node ${n.id} in inactive building '${n.physicalLocation.building}'`);
}

// ── 3. Orphan check (non-feed nodes need an upstream edge) ─────────────────────
console.log('\n[3] Orphan node check');
const fedIds = new Set(topologyEdges.map((e) => e.target));
const sourceIds = new Set(topologyEdges.map((e) => e.source));
const orphans = topologyNodeInputs.filter(
  (n) =>
    n.layer !== 'hv-feed' &&            // grid intake has no upstream by definition
    n.physicalLocation.building !== undefined &&
    !fedIds.has(n.id) &&
    !sourceIds.has(n.id) &&             // generators feed INTO the grid (source-only is OK)
    n.mapScope !== 'building-detail'    // TB grid nodes link via summary
);
if (orphans.length === 0) pass('no disconnected equipment outside the TB import grid');
else for (const n of orphans) fail(`orphan node: ${n.id} (${n.name})`);

// ── 4. Cross-building fault cascade reach ──────────────────────────────────────
console.log('\n[4] Fault cascade reach from MAIN-HV-CELL-01');
const faultedNodes = topologyNodeInputs.map((n) => ({
  ...n,
  position: { x: 0, y: 0 },
  status: n.id === 'MAIN-HV-CELL-01' ? ('fault' as const) : ('operational' as const),
})) as TopologyNode[];

const derived = computeDerivedStatuses(faultedNodes, topologyEdges);

const mustReach: Record<string, string> = {
  'MAIN-HV-CELL-04': 'Main panel F10 feeder cell',
  'TR-01':           'Furnace 10 feeder transformer',
  'TR-DP1-1':        'Furnace-10 PFC panel (cross-building)',
  'F1-MDP-1':        'Furnace-10 distribution cabinet',
  'PUMP-F10-COOL-1': 'Furnace-10 end load',
  'TR-02':           'Utility feeder transformer',
  'UT-MDP':          'Utility LV distribution',
  'TR-03':           'Batch House feeder transformer',
  'DC-BH-01':        'Batch House cabinet (cross-building)',
  'CT-DC-01':        'Cullet Tower sub-cabinet',
  'CT-CRUSHER-1':    'Cullet Tower end load',
  'BH-TB-SUMMARY':   'Batch House terminal boxes',
};

for (const [id, label] of Object.entries(mustReach)) {
  if (derived.get(id) === 'derived-fault') pass(`${id} — ${label}`);
  else fail(`${id} (${label}) NOT reached by cascade — broken power path upstream`);
}
console.log(`  …cascade reached ${derived.size} downstream elements in total`);

// ── 5. HV supply path — Substation → MAIN PANEL incomer cells ─────────────────
console.log('\n[5] HV supply path from external Substation');
const hvSupplyTargets: Record<string, string> = {
  'HV-SUPPLY-MAIN':   'MAIN-HV-CELL-01',
  'HV-SUPPLY-BKUP-A': 'MAIN-HV-CELL-02',
  'HV-SUPPLY-BKUP-B': 'MAIN-HV-CELL-03',
};
const hvSupply = topologyEdges.filter((e) => e.id in hvSupplyTargets);
if (hvSupply.length === 3) pass('3 HV supply edges defined (Track 1 + Track 2 twin)');
else fail(`expected 3 HV supply edges, found ${hvSupply.length}`);

for (const e of hvSupply) {
  if (e.edgeType === 'hv') pass(`${e.id} — edgeType 'hv'`);
  else fail(`${e.id} — expected edgeType 'hv', got '${e.edgeType}'`);
  if (e.route?.spansBuildings && e.route.fromBuilding === 'substation' && e.route.toBuilding === 'utility') {
    pass(`${e.id} — cross-building substation → utility`);
  } else {
    fail(`${e.id} — missing spansBuildings route substation → utility`);
  }
  const expected = hvSupplyTargets[e.id];
  if (e.target === expected) pass(`${e.id} — terminates at ${expected}`);
  else fail(`${e.id} — expected target ${expected}, got ${e.target}`);
}

const bkupPair = hvSupply.filter((e) => e.source === 'GRID-FEED-B');
if (bkupPair.length === 2) pass('Track 2 — 2 parallel cables from GRID-FEED-B to Cells 2 & 3');
else fail(`Track 2 — expected 2 parallel cables from GRID-FEED-B, found ${bkupPair.length}`);

// ── 6. Main panel lineup layout ───────────────────────────────────────────────
console.log('\n[6] 26 kV MAIN PANEL lineup layout');
const laidOut = layoutNodes(
  topologyNodeInputs,
  'overview',
  computeBuildingCols(topologyNodeInputs, topologyEdges),
  topologyEdges
);
const cellNodes = laidOut.filter((n) => n.id.startsWith('MAIN-HV-CELL-'));
if (cellNodes.length === 11) pass('11 main panel cells positioned');
else fail(`expected 11 main panel cells, found ${cellNodes.length}`);

const cellYs = cellNodes.map((n) => n.position.y);
const ySpread = Math.max(...cellYs) - Math.min(...cellYs);
if (ySpread < 2) pass('Cells 1–11 aligned on a single horizontal row');
else fail(`main panel cells not aligned (Y spread ${ySpread.toFixed(1)} px)`);

const cell04 = laidOut.find((n) => n.id === 'MAIN-HV-CELL-04');
const tr01 = laidOut.find((n) => n.id === 'TR-01');
if (cell04 && tr01 && tr01.position.y < cell04.position.y) {
  pass('TR-01 positioned above feeder Cell 4');
} else {
  fail('TR-01 not vertically above MAIN-HV-CELL-04');
}

const gridA = laidOut.find((n) => n.id === 'GRID-FEED-A');
const cell01 = laidOut.find((n) => n.id === 'MAIN-HV-CELL-01');
if (gridA && cell01 && Math.abs(gridA.position.y - cell01.position.y) < 4) {
  pass('Substation GRID-FEED-A aligned with MAIN-HV-CELL-01 incomer row');
} else {
  fail(`Substation incomer Y misaligned (Δy=${gridA && cell01 ? Math.abs(gridA.position.y - cell01.position.y).toFixed(1) : 'n/a'} px)`);
}

const trDp = laidOut.find((n) => n.id === 'TR-DP1-1');
if (tr01 && trDp && Math.abs(tr01.position.y - trDp.position.y) < 4) {
  pass('TR-DP1-1 feeder landing aligned with TR-01 riser height');
} else {
  fail('TR-DP1-1 not aligned with TR-01 for cross-building LV feeder');
}

const dcBh = laidOut.find((n) => n.id === 'DC-BH-01');
const tr03 = laidOut.find((n) => n.id === 'TR-03');
if (tr03 && dcBh && Math.abs(tr03.position.y - dcBh.position.y) < 4) {
  pass('DC-BH-01 feeder landing aligned with TR-03 riser height');
} else {
  fail('DC-BH-01 not aligned with TR-03 for cross-building LV feeder');
}

if (cell04 && trDp && trDp.position.x < cell04.position.x) {
  pass('Furnace-10 incoming panel sits west of Cell 4 feeder cubicle');
} else {
  fail('F10 feeder landing not west of MAIN-HV-CELL-04');
}

const augmented = assignParallelIndices(topologyEdges, laidOut);
const bkupAug = augmented.filter(
  (e) => e.source === 'GRID-FEED-B' && (e.target === 'MAIN-HV-CELL-02' || e.target === 'MAIN-HV-CELL-03')
);
if (bkupAug.length === 2) pass('GRID-FEED-B twin incomers routed to Cells 2 & 3');
else fail('GRID-FEED-B incomer pair incomplete');

// ── Result ─────────────────────────────────────────────────────────────────────
console.log(failures === 0
  ? '\nTOPOLOGY VALID — all checks passed.\n'
  : `\nTOPOLOGY INVALID — ${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
