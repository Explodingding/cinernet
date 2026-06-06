import type { BuildingId, TopologyNodeInput, TopologyNode } from '@/types/topology';

// ─── Floor bands (Y axis — higher elevation = lower Y number = higher on screen) ─────

export interface FloorBandConfig {
  id: FloorBandId;
  label: string;
  elevLabel: string;
  yCenter: number;
  height: number;
}

export const FLOOR_BANDS: FloorBandConfig[] = [
  { id: 'elevated', label: 'Level +5 m',     elevLabel: 'Mezzanine · +5 m', yCenter: 140, height: 200 },
  { id: 'ground',   label: 'Ground floor',    elevLabel: 'Ground · 0 m',     yCenter: 490, height: 300 },
  { id: 'basement', label: 'Basement',        elevLabel: 'Basement · −3 m',  yCenter: 860, height: 200 },
];

export type FloorBandId = 'elevated' | 'ground' | 'basement';

export const FLOOR_BAND_MAP = Object.fromEntries(
  FLOOR_BANDS.map((b) => [b.id, b])
) as Record<FloorBandId, FloorBandConfig>;

// ─── Building columns (X axis) ────────────────────────────────────────────────────────

export interface BuildingColConfig {
  id: BuildingId;
  xCenter: number;
  width: number;
}

export const BUILDING_COLS: BuildingColConfig[] = [
  { id: 'furnace-10',   xCenter: 300,  width: 440 },
  { id: 'utility',      xCenter: 760,  width: 440 },
  { id: 'batch-house',  xCenter: 1250, width: 520 },
];

export const BUILDING_COL_MAP = Object.fromEntries(
  BUILDING_COLS.map((c) => [c.id, c])
) as Record<BuildingId, BuildingColConfig>;

// ─── Helpers ──────────────────────────────────────────────────────────────────────────

/** Parse elevation strings like '−3 m', '+5 m', '0 m' → number (metres) */
export function parseElevationM(str: string): number {
  const cleaned = str
    .replace('\u2212', '-')   // em dash minus sign → hyphen
    .replace(/\s*m\s*$/i, '')
    .replace(/^\+/, '');
  return parseFloat(cleaned) || 0;
}

export function getFloorBandId(elevM: number): FloorBandId {
  if (elevM >= 3)    return 'elevated';
  if (elevM >= -0.5) return 'ground';
  return 'basement';
}

// ─── Layout ───────────────────────────────────────────────────────────────────────────

/** Scope passed at runtime — determines whether TB grid or physical map is used */
export type LayoutScope = 'overview' | BuildingId;

const NODE_SLOT_SPACING = 200; // horizontal gap between nodes in the same cell

/** Batch House terminal-box compact grid (only in BH detail view) */
const TB_GRID_COLS = 4;
const TB_GRID_COL_W = 170;
const TB_GRID_ROW_H = 90;

type CellKey = string;
function cellKey(building: BuildingId, band: FloorBandId): CellKey {
  return `${building}::${band}`;
}

export function layoutNodes(
  nodes: TopologyNodeInput[],
  scope: LayoutScope = 'overview'
): TopologyNode[] {
  if (nodes.length === 0) return [];

  // Separate TB grid nodes (building-detail) from physically-placed nodes
  const tbNodes = nodes.filter((n) => n.mapScope === 'building-detail');
  const physNodes = nodes.filter((n) => n.mapScope !== 'building-detail');

  // ── Pass 1: count nodes per (building × floor band) for centering ──────────────────
  const cellCounts: Record<CellKey, number> = {};
  const slotAssign: Record<string, { slotIdx: number; bandId: FloorBandId }> = {};

  for (const n of physNodes) {
    if (n.positionOverride) continue;
    const elevM = parseElevationM(n.physicalLocation.elevation);
    const bandId = getFloorBandId(elevM);
    const key = cellKey(n.physicalLocation.building, bandId);
    const slot = cellCounts[key] ?? 0;
    slotAssign[n.id] = { slotIdx: slot, bandId };
    cellCounts[key] = slot + 1;
  }

  // ── Pass 2: compute positions ─────────────────────────────────────────────────────
  return nodes.map((n): TopologyNode => {
    // Manual override
    if (n.positionOverride) {
      const { layout: _l, positionOverride, mapScope: _m, ...rest } = n;
      return { ...rest, position: positionOverride };
    }

    const { layout: _layout, positionOverride: _pos, mapScope: _mapScope, ...rest } = n;
    const col = BUILDING_COL_MAP[n.physicalLocation.building];

    // ── TB grid in Batch House detail view ──────────────────────────────────────────
    if (n.mapScope === 'building-detail') {
      const tbIdx = tbNodes.findIndex((t) => t.id === n.id);
      const i = Math.max(0, tbIdx);
      const colIdx = i % TB_GRID_COLS;
      const rowIdx = Math.floor(i / TB_GRID_COLS);
      const gridWidth = (TB_GRID_COLS - 1) * TB_GRID_COL_W;
      const band = FLOOR_BAND_MAP['ground'];
      // In BH detail, DC-BH-01 (non-TB) is placed at the top of the ground band;
      // TB grid starts below that anchor point.
      const tbGridTop = band.yCenter - band.height / 2 + 120;
      return {
        ...rest,
        position: {
          x: col.xCenter - gridWidth / 2 + colIdx * TB_GRID_COL_W,
          y: tbGridTop + rowIdx * TB_GRID_ROW_H,
        },
      };
    }

    // ── Physical map placement ───────────────────────────────────────────────────────
    const sa = slotAssign[n.id];
    if (!sa) {
      // Fallback: centre of building column at ground floor
      return { ...rest, position: { x: col.xCenter, y: FLOOR_BAND_MAP.ground.yCenter } };
    }

    const band = FLOOR_BAND_MAP[sa.bandId];
    const count = cellCounts[cellKey(n.physicalLocation.building, sa.bandId)] ?? 1;

    // In BH detail view, anchor the feeding cabinet at top of ground band
    if (scope === 'batch-house' && sa.bandId === 'ground' && tbNodes.length > 0) {
      const anchorY = band.yCenter - band.height / 2 + 30;
      const xOffset = (sa.slotIdx - (count - 1) / 2) * NODE_SLOT_SPACING;
      return { ...rest, position: { x: col.xCenter + xOffset, y: anchorY } };
    }

    const xOffset = (sa.slotIdx - (count - 1) / 2) * NODE_SLOT_SPACING;
    return {
      ...rest,
      position: { x: col.xCenter + xOffset, y: band.yCenter },
    };
  });
}

export { cellKey };
