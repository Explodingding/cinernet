import type { BuildingId, TopologyLayer, TopologyNodeInput, TopologyNode } from '@/types/topology';
import { MAP_COLUMN_ORDER } from '@/data/buildings';

// ─── Electrical hierarchy (determines Y within each floor band) ───────────────
//
//  Power flows upward on screen: upstream = lower Y = bottom of band.
//  Rank 0 = most upstream (grid feed), rank 6 = most downstream (load).

const LAYER_RANK: Record<TopologyLayer, number> = {
  'mv-feed':       0,
  'mv-switchgear': 1,
  'transformer':   2,
  'lv-panel':      3,
  'cabinet':       4,
  'junction':      5,
  'load':          6,
};

/**
 * Vertical gap between adjacent hierarchy rows (px).
 *
 * Node cards are ≈130 px tall.  A spacing of 180 px leaves ≈50 px of clear
 * canvas between adjacent rows — enough to see cable lines clearly.
 */
const ROW_SPACING = 180;

/**
 * Which ranks appear within each floor band.
 * Used to centre the hierarchy inside the band.
 *
 * Elevated includes cabinet (rank 4) because HOT-10/HOT-20/HOT-20 are
 * cabinet-layer nodes physically located at +5 m.
 */
const BAND_RANK_RANGE: Record<FloorBandId, { min: number; max: number }> = {
  elevated: { min: 4, max: 6 },  // cabinet + junction + load at +5 m
  ground:   { min: 1, max: 6 },  // mv-switchgear → load at ground level
  basement: { min: 0, max: 0 },  // mv-feed only (basement / substation)
};

/** Y position of a node given its layer and the floor band it sits in */
function getLayerY(layer: TopologyLayer, bandId: FloorBandId): number {
  const rank = LAYER_RANK[layer];
  const band = FLOOR_BAND_MAP[bandId];
  const { min, max } = BAND_RANK_RANGE[bandId];
  const midRank = (min + max) / 2;
  // Higher rank → higher on screen → smaller Y
  return band.yCenter + (midRank - rank) * ROW_SPACING;
}

// ─── Floor bands (coarse Y positioning by physical elevation) ─────────────────
//
//  All Y values are recomputed for ROW_SPACING = 180.
//
//  Elevated (+5 m)  ranks 4–6, midRank=5, yCenter=240:
//    cabinet(4)=420  junction(5)=240  load(6)=60
//    band spans ≈ −20 to 500  → h=520
//
//  Ground (0 m)  ranks 1–6, midRank=3.5, yCenter=1100:
//    mv-sw(1)=1550  tr(2)=1370  lv-panel(3)=1190
//    cabinet(4)=1010  junction(5)=830  load(6)=650
//    band spans ≈ 550 to 1650  → h=1100
//
//  Basement (−8 m)  rank 0, yCenter=1850:
//    mv-feed(0)=1850   band spans ≈ 1740 to 1960  → h=220

export interface FloorBandConfig {
  id: FloorBandId;
  label: string;
  elevLabel: string;
  yCenter: number;
  height: number;
}

export const FLOOR_BANDS: FloorBandConfig[] = [
  { id: 'elevated', label: 'Level +5 m',  elevLabel: 'Mezzanine · +5 m', yCenter: 240,  height: 540  },
  { id: 'ground',   label: 'Ground floor', elevLabel: 'Ground · 0 m',     yCenter: 1100, height: 1120 },
  { id: 'basement', label: 'Basement',     elevLabel: 'Basement · −8 m',  yCenter: 1850, height: 240  },
];

export type FloorBandId = 'elevated' | 'ground' | 'basement';

export const FLOOR_BAND_MAP = Object.fromEntries(
  FLOOR_BANDS.map((b) => [b.id, b])
) as Record<FloorBandId, FloorBandConfig>;

// ─── Building column layout ───────────────────────────────────────────────────

export interface BuildingColConfig {
  id: BuildingId;
  xCenter: number;
  width: number;
}

/** Horizontal spacing between adjacent branch slots within a building (px) */
const NODE_SLOT_SPACING = 200;

/** Inner horizontal padding on each side of a building column (px) */
const BUILDING_PAD_X = 60;

/** Horizontal gap between adjacent building column backgrounds (px) */
const BUILDING_GAP = 80;

/**
 * Compute building column layout from the full node catalog.
 *
 * Call with ALL node inputs (not just the currently-visible tier) so the
 * canvas width is stable and does not reflow when the user switches tiers.
 *
 * Each building's width = (maxBranchIndex + 1) × NODE_SLOT_SPACING + 2 × BUILDING_PAD_X.
 * Buildings are arranged left-to-right in MAP_COLUMN_ORDER.
 */
export function computeBuildingCols(allNodes: TopologyNodeInput[]): BuildingColConfig[] {
  // Find the maximum branchIndex used in each building
  const maxBranch: Partial<Record<BuildingId, number>> = {};
  for (const n of allNodes) {
    if (n.positionOverride || n.mapScope === 'building-detail') continue;
    const b  = n.physicalLocation.building;
    const bi = n.layout?.branchIndex ?? 0;
    if ((maxBranch[b] ?? -1) < bi) maxBranch[b] = bi;
  }

  // Position buildings left to right
  let xLeft = 0;
  return MAP_COLUMN_ORDER.map((bid) => {
    const maxBi  = maxBranch[bid as BuildingId] ?? 0;
    const width  = (maxBi + 1) * NODE_SLOT_SPACING + BUILDING_PAD_X * 2;
    const xCenter = xLeft + width / 2;
    xLeft += width + BUILDING_GAP;
    return { id: bid as BuildingId, xCenter, width };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse elevation strings like '−3 m', '+5 m', '0 m' → metres */
export function parseElevationM(str: string): number {
  const cleaned = str
    .replace('\u2212', '-')  // Unicode minus → ASCII hyphen
    .replace(/\s*m\s*$/i, '')
    .replace(/^\+/, '');
  return parseFloat(cleaned) || 0;
}

export function getFloorBandId(elevM: number): FloorBandId {
  if (elevM >= 3)    return 'elevated';
  if (elevM >= -0.5) return 'ground';
  return 'basement';
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export type LayoutScope = 'overview' | BuildingId;

/** Batch House TB compact grid constants */
const TB_GRID_COLS  = 4;
const TB_GRID_COL_W = 170;
const TB_GRID_ROW_H = 90;

/**
 * Fallback x-slot cell key: building × floor band × layer.
 * Used to auto-assign a branchIndex for nodes that don't declare one.
 */
function xCell(b: BuildingId, band: FloorBandId, layer: TopologyLayer): string {
  return `${b}::${band}::${layer}`;
}

/**
 * Position all nodes on the canvas.
 *
 * @param nodes          Filtered node inputs for the current view.
 * @param scope          Layout scope ('overview' or a building id).
 * @param buildingCols   Pre-computed column layout (from computeBuildingCols).
 *                       If omitted, computed from `nodes` — use the pre-computed
 *                       version to avoid jarring width changes when switching tiers.
 */
export function layoutNodes(
  nodes: TopologyNodeInput[],
  scope: LayoutScope = 'overview',
  buildingCols?: BuildingColConfig[]
): TopologyNode[] {
  if (nodes.length === 0) return [];

  const tbNodes   = nodes.filter((n) => n.mapScope === 'building-detail');
  const physNodes = nodes.filter((n) => n.mapScope !== 'building-detail');

  // Resolve building column layout
  const cols    = buildingCols ?? computeBuildingCols(nodes);
  const colMap  = Object.fromEntries(cols.map((c) => [c.id, c])) as Record<BuildingId, BuildingColConfig>;

  // Auto-assign branchIndex for nodes that don't declare one
  const autoSlotCounters: Record<string, number> = {};
  const autoSlot: Record<string, number> = {};
  for (const n of physNodes) {
    if (n.positionOverride || n.layout?.branchIndex !== undefined) continue;
    const bandId = getFloorBandId(parseElevationM(n.physicalLocation.elevation));
    const key    = xCell(n.physicalLocation.building, bandId, n.layer);
    const slot   = autoSlotCounters[key] ?? 0;
    autoSlot[n.id] = slot;
    autoSlotCounters[key] = slot + 1;
  }

  return nodes.map((n): TopologyNode => {
    if (n.positionOverride) {
      const { layout: _l, positionOverride, mapScope: _m, ...rest } = n;
      return { ...rest, position: positionOverride };
    }

    const { layout: _layout, positionOverride: _pos, mapScope: _mapScope, ...rest } = n;
    const col = colMap[n.physicalLocation.building];

    // ── Batch House TB grid (building-detail nodes) ───────────────────────────
    if (n.mapScope === 'building-detail') {
      const idx    = Math.max(0, tbNodes.findIndex((t) => t.id === n.id));
      const colIdx = idx % TB_GRID_COLS;
      const rowIdx = Math.floor(idx / TB_GRID_COLS);
      const gridW  = (TB_GRID_COLS - 1) * TB_GRID_COL_W;
      const gBand  = FLOOR_BAND_MAP.ground;
      const tbTop  = gBand.yCenter - gBand.height / 2 + 120;
      return {
        ...rest,
        position: {
          x: col.xCenter - gridW / 2 + colIdx * TB_GRID_COL_W,
          y: tbTop + rowIdx * TB_GRID_ROW_H,
        },
      };
    }

    // ── Physical hierarchy placement ─────────────────────────────────────────
    const bandId = getFloorBandId(parseElevationM(n.physicalLocation.elevation));
    const bi     = n.layout?.branchIndex ?? autoSlot[n.id] ?? 0;

    // Anchor from the left edge of the building column
    const x = col.xCenter - col.width / 2 + BUILDING_PAD_X + bi * NODE_SLOT_SPACING;
    const y = getLayerY(n.layer, bandId);

    if (scope !== 'overview' && scope !== n.physicalLocation.building) {
      // In BH detail, pin the feeding cabinet above the TB grid
      if (tbNodes.length > 0 && bandId === 'ground') {
        return {
          ...rest,
          position: { x, y: FLOOR_BAND_MAP.ground.yCenter - FLOOR_BAND_MAP.ground.height / 2 + 30 },
        };
      }
    }

    return { ...rest, position: { x, y } };
  });
}
