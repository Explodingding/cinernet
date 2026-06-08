import type { BuildingId, TopologyLayer, TopologyNodeInput, TopologyNode } from '@/types/topology';

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

/** Vertical gap between adjacent hierarchy rows (px) */
const ROW_SPACING = 80;

/**
 * Which ranks appear within each floor band.
 * Used to centre the hierarchy inside the band.
 * Ground floor: mv-switchgear (1) through load (6) after MV-SW is corrected to 0m.
 */
const BAND_RANK_RANGE: Record<FloorBandId, { min: number; max: number }> = {
  elevated: { min: 5, max: 6 },  // junction + load only
  ground:   { min: 1, max: 6 },  // mv-switchgear → load
  basement: { min: 0, max: 0 },  // mv-feed only
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
//  Band centers and heights are sized to contain all hierarchy rows with padding.
//
//  Elevated (+5m): junction=220, load=140 → band y: 80–300  → center 190, h 220
//  Ground   (0m):  mv-sw=860, …, load=460 → band y: 390–930 → center 660, h 540
//  Basement (−3m): mv-feed=1100            → band y: 1030–1170→ center 1100, h 140

export interface FloorBandConfig {
  id: FloorBandId;
  label: string;
  elevLabel: string;
  yCenter: number;
  height: number;
}

export const FLOOR_BANDS: FloorBandConfig[] = [
  { id: 'elevated', label: 'Level +5 m',   elevLabel: 'Mezzanine · +5 m', yCenter: 190,  height: 220 },
  { id: 'ground',   label: 'Ground floor',  elevLabel: 'Ground · 0 m',     yCenter: 660,  height: 540 },
  { id: 'basement', label: 'Basement',      elevLabel: 'Basement · −3 m',  yCenter: 1100, height: 140 },
];

export type FloorBandId = 'elevated' | 'ground' | 'basement';

export const FLOOR_BAND_MAP = Object.fromEntries(
  FLOOR_BANDS.map((b) => [b.id, b])
) as Record<FloorBandId, FloorBandConfig>;

// ─── Building columns (X axis) ────────────────────────────────────────────────

export interface BuildingColConfig {
  id: BuildingId;
  xCenter: number;
  width: number;
}

export const BUILDING_COLS: BuildingColConfig[] = [
  { id: 'furnace-10',  xCenter: 300,  width: 440 },
  { id: 'utility',     xCenter: 820,  width: 580 },
  { id: 'furnace-20',  xCenter: 1370, width: 440 },
  { id: 'batch-house', xCenter: 1870, width: 440 },
];

export const BUILDING_COL_MAP = Object.fromEntries(
  BUILDING_COLS.map((c) => [c.id, c])
) as Record<BuildingId, BuildingColConfig>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse elevation strings like '−3 m', '+5 m', '0 m' → metres */
export function parseElevationM(str: string): number {
  const cleaned = str
    .replace('\u2212', '-')  // em-dash → hyphen
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

/** Horizontal gap between sibling nodes at the same (building, floor, layer) */
const NODE_SLOT_SPACING = 240;

/** Batch House TB compact grid constants */
const TB_GRID_COLS  = 4;
const TB_GRID_COL_W = 170;
const TB_GRID_ROW_H = 90;

/**
 * X-slot cell key: building × floor band × layer.
 * Nodes sharing the same key are siblings and spread out horizontally.
 */
function xCell(b: BuildingId, band: FloorBandId, layer: TopologyLayer): string {
  return `${b}::${band}::${layer}`;
}

export function layoutNodes(
  nodes: TopologyNodeInput[],
  scope: LayoutScope = 'overview'
): TopologyNode[] {
  if (nodes.length === 0) return [];

  const tbNodes  = nodes.filter((n) => n.mapScope === 'building-detail');
  const physNodes = nodes.filter((n) => n.mapScope !== 'building-detail');

  // ── Pass 1: count horizontal siblings per (building × floor band × layer) ──
  const cellCounts: Record<string, number> = {};
  const slotAssign: Record<string, { slotIdx: number; bandId: FloorBandId }> = {};

  for (const n of physNodes) {
    if (n.positionOverride) continue;
    const bandId = getFloorBandId(parseElevationM(n.physicalLocation.elevation));
    const key = xCell(n.physicalLocation.building, bandId, n.layer);
    const slot = cellCounts[key] ?? 0;
    slotAssign[n.id] = { slotIdx: slot, bandId };
    cellCounts[key] = slot + 1;
  }

  // ── Pass 2: compute canvas positions ──────────────────────────────────────
  return nodes.map((n): TopologyNode => {
    if (n.positionOverride) {
      const { layout: _l, positionOverride, mapScope: _m, ...rest } = n;
      return { ...rest, position: positionOverride };
    }

    const { layout: _layout, positionOverride: _pos, mapScope: _mapScope, ...rest } = n;
    const col = BUILDING_COL_MAP[n.physicalLocation.building];

    // ── Batch House TB grid (detail view only) ────────────────────────────────
    if (n.mapScope === 'building-detail') {
      const idx      = Math.max(0, tbNodes.findIndex((t) => t.id === n.id));
      const colIdx   = idx % TB_GRID_COLS;
      const rowIdx   = Math.floor(idx / TB_GRID_COLS);
      const gridW    = (TB_GRID_COLS - 1) * TB_GRID_COL_W;
      const gBand    = FLOOR_BAND_MAP.ground;
      const tbTop    = gBand.yCenter - gBand.height / 2 + 120;
      return {
        ...rest,
        position: {
          x: col.xCenter - gridW / 2 + colIdx * TB_GRID_COL_W,
          y: tbTop + rowIdx * TB_GRID_ROW_H,
        },
      };
    }

    // ── Physical hierarchy placement ─────────────────────────────────────────
    const sa = slotAssign[n.id];
    if (!sa) {
      return { ...rest, position: { x: col.xCenter, y: FLOOR_BAND_MAP.ground.yCenter } };
    }

    const bnd   = FLOOR_BAND_MAP[sa.bandId];
    const count = cellCounts[xCell(n.physicalLocation.building, sa.bandId, n.layer)] ?? 1;
    const xOff  = (sa.slotIdx - (count - 1) / 2) * NODE_SLOT_SPACING;

    // In BH detail, pin the feeding cabinet above the TB grid
    if (scope === 'batch-house' && sa.bandId === 'ground' && tbNodes.length > 0) {
      return {
        ...rest,
        position: { x: col.xCenter + xOff, y: bnd.yCenter - bnd.height / 2 + 30 },
      };
    }

    // Y = layer position within band (upstream = bottom of band = higher Y)
    return {
      ...rest,
      position: { x: col.xCenter + xOff, y: getLayerY(n.layer, sa.bandId) },
    };
  });
}
