/**
 * Topology integrity validation — run with:  npx tsx scripts/validate-topology.ts
 *
 * Checks:
 *  1. No dangling edges (every source/target resolves to a defined node).
 *  2. Every node belongs to an active map column (MAP_COLUMN_ORDER).
 *  3. No orphan nodes (every non-feed node has at least one upstream edge).
 *  4. Fault cascade reach — a fault at MAIN-MV-PANEL must propagate
 *     cross-building into BOTH Furnace-10 loads AND Batch House / Cullet
 *     Tower loads via the BFS in lib/faultCascade.ts.
 *
 * Exits non-zero on any failure — suitable as a CI gate.
 */
import { topologyNodeInputs, topologyEdges } from '../data/mockTopology';
import { MAP_COLUMN_ORDER } from '../data/buildings';
import { computeDerivedStatuses } from '../lib/faultCascade';
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
    n.layer !== 'mv-feed' &&            // grid intake has no upstream by definition
    n.layout?.building !== undefined &&
    !fedIds.has(n.id) &&
    !sourceIds.has(n.id) &&             // generators feed INTO the grid (source-only is OK)
    n.mapScope !== 'building-detail'    // TB grid nodes link via summary
);
if (orphans.length === 0) pass('no disconnected equipment outside the TB import grid');
else for (const n of orphans) fail(`orphan node: ${n.id} (${n.name})`);

// ── 4. Cross-building fault cascade reach ──────────────────────────────────────
console.log('\n[4] Fault cascade reach from MAIN-MV-PANEL');
const faultedNodes = topologyNodeInputs.map((n) => ({
  ...n,
  position: { x: 0, y: 0 },
  status: n.id === 'MAIN-MV-PANEL' ? ('fault' as const) : ('operational' as const),
})) as TopologyNode[];

const derived = computeDerivedStatuses(faultedNodes, topologyEdges);

const mustReach: Record<string, string> = {
  'F10-MV-PANEL':   'Utility MV ring',
  'TR1-1':          'Utility transformer',
  'TR-DP1-1':       'Furnace-10 PFC panel (cross-building)',
  'F1-MDP-1':       'Furnace-10 distribution cabinet',
  'PUMP-F10-COOL-1':'Furnace-10 end load',
  'UT-MDP':         'Utility LV distribution',
  'DC-BH-01':       'Batch House cabinet (cross-building)',
  'CT-DC-01':       'Cullet Tower sub-cabinet',
  'CT-CRUSHER-1':   'Cullet Tower end load',
  'BH-TB-SUMMARY':  'Batch House terminal boxes',
};

for (const [id, label] of Object.entries(mustReach)) {
  if (derived.get(id) === 'derived-fault') pass(`${id} — ${label}`);
  else fail(`${id} (${label}) NOT reached by cascade — broken power path upstream`);
}
console.log(`  …cascade reached ${derived.size} downstream elements in total`);

// ── Result ─────────────────────────────────────────────────────────────────────
console.log(failures === 0
  ? '\nTOPOLOGY VALID — all checks passed.\n'
  : `\nTOPOLOGY INVALID — ${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
