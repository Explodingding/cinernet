import type {
  BuildingId,
  TopologyLayer,
  TopologyNodeInput,
  TopologyNode,
  TopologyEdgeInput,
} from '@/types/topology';
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
 * Node cards are ≈130 px tall. A spacing of 180 px leaves ≈50 px of clear
 * canvas between adjacent rows — enough to see cable lines clearly.
 */
const ROW_SPACING = 180;

/**
 * Which ranks appear within each floor band.
 * Used to centre the hierarchy inside the band.
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

/** Horizontal space allocated per leaf node (px). */
const NODE_SLOT_SPACING = 200;

/** Inner horizontal padding on each side of a building column (px). */
const BUILDING_PAD_X = 60;

/** Horizontal gap between adjacent building column backgrounds (px). */
const BUILDING_GAP = 80;

// ─── Tree layout constants ─────────────────────────────────────────────────────

/**
 * Horizontal space allocated per leaf node (same as NODE_SLOT_SPACING).
 * An internal node with N leaf descendants gets N × LEAF_WIDTH px so that
 * parents always centre exactly over their children.
 */
const LEAF_WIDTH = NODE_SLOT_SPACING; // 200 px

/**
 * Gap between distinct root-level subtrees within one building column.
 * Applied once between each pair of adjacent root trees.
 */
const SUBTREE_GAP = 60;

// ─── Tree layout helpers ───────────────────────────────────────────────────────

/**
 * Build within-building directed adjacency maps from a set of edges.
 *
 * Cross-building edges (route.spansBuildings === true) are excluded.
 * Edges whose endpoints belong to different buildings are also excluded.
 *
 * Returns:
 *   adj  — source → [targets]  (downstream / children)
 *   radj — target → [sources]  (upstream / parents)
 */
function buildBuildingAdjacency(
  nodeMap: Map<string, TopologyNodeInput>,
  edges: TopologyEdgeInput[]
): { adj: Map<string, string[]>; radj: Map<string, string[]> } {
  const adj  = new Map<string, string[]>();
  const radj = new Map<string, string[]>();

  for (const e of edges) {
    if (e.route?.spansBuildings) continue;

    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (!src || !tgt) continue;
    if (src.physicalLocation.building !== tgt.physicalLocation.building) continue;

    const fwd = adj.get(e.source)  ?? []; fwd.push(e.target); adj.set(e.source, fwd);
    const rev = radj.get(e.target) ?? []; rev.push(e.source); radj.set(e.target, rev);
  }

  return { adj, radj };
}

/**
 * Compute the leaf count for every node in a building's visible set.
 *
 * Leaf count = number of visible-leaf descendants reachable within the same
 * building.  Leaf nodes (no visible children) always have a count of 1.
 *
 * The result is the horizontal footprint in leaf units:
 * an internal node with count N needs N × LEAF_WIDTH px to fit all
 * its children and centre over them symmetrically.
 *
 * Includes cycle detection — nodes in cycles are treated as leaves.
 */
function computeLeafCounts(
  bNodeIds: Set<string>,
  adj: Map<string, string[]>
): Map<string, number> {
  const memo     = new Map<string, number>();
  const visiting = new Set<string>();

  function count(id: string): number {
    if (memo.has(id)) return memo.get(id)!;
    if (visiting.has(id)) return 1; // cycle → treat as leaf
    visiting.add(id);

    const children = (adj.get(id) ?? []).filter((cid) => bNodeIds.has(cid));
    const n =
      children.length === 0
        ? 1
        : children.reduce((s, cid) => s + count(cid), 0);

    visiting.delete(id);
    memo.set(id, n);
    return n;
  }

  for (const id of bNodeIds) count(id);
  return memo;
}

/**
 * Top-down tree walk that assigns an X coordinate to every reachable node.
 *
 * Each root is given [cursor, cursor + leafCount × LEAF_WIDTH].
 * Within that range the node is placed at the horizontal midpoint, and
 * each child is recursively given a proportional sub-range.
 *
 * @param roots      Nodes with no visible parent in this building
 * @param bNodeIds   Set of all visible node IDs in the building
 * @param adj        Within-building adjacency (source → targets)
 * @param leafCounts Pre-computed leaf counts
 * @param startX     Left edge of the total tree area
 * @returns          nodeId → absolute X centre coordinate
 */
function assignTreeX(
  roots: TopologyNodeInput[],
  bNodeIds: Set<string>,
  adj: Map<string, string[]>,
  leafCounts: Map<string, number>,
  startX: number
): Map<string, number> {
  const xPos = new Map<string, number>();

  function walk(id: string, xLeft: number, xRight: number): void {
    xPos.set(id, (xLeft + xRight) / 2);

    const children = (adj.get(id) ?? []).filter((cid) => bNodeIds.has(cid));
    if (children.length === 0) return;

    // Divide [xLeft, xRight] proportionally by each child's leaf count.
    // The total child width equals xRight - xLeft exactly (no extra gaps within
    // a subtree — gaps only appear between root-level trees).
    let cursor = xLeft;
    for (const cid of children) {
      const childWidth = (leafCounts.get(cid) ?? 1) * LEAF_WIDTH;
      walk(cid, cursor, cursor + childWidth);
      cursor += childWidth;
    }
  }

  let cursor = startX;
  for (const root of roots) {
    const rootWidth = (leafCounts.get(root.id) ?? 1) * LEAF_WIDTH;
    walk(root.id, cursor, cursor + rootWidth);
    cursor += rootWidth + SUBTREE_GAP;
  }

  return xPos;
}

/**
 * Compute building column widths from visible nodes and edges.
 *
 * When edges are provided the width is derived from the tree structure:
 *   width = totalLeaves × LEAF_WIDTH + (numRoots − 1) × SUBTREE_GAP + 2 × BUILDING_PAD_X
 *
 * When edges are omitted the legacy branchIndex-based width is used.
 *
 * Call with the nodes that are currently visible (i.e. already filtered by
 * tier/building) so that each tier gets tightly-fitted column widths.
 */
export function computeBuildingCols(
  visibleNodes: TopologyNodeInput[],
  edges?: TopologyEdgeInput[]
): BuildingColConfig[] {
  const physNodes = visibleNodes.filter(
    (n) => !n.positionOverride && n.mapScope !== 'building-detail'
  );

  // ── Tree-based widths ──────────────────────────────────────────────────────
  if (edges) {
    const nodeMap           = new Map(physNodes.map((n) => [n.id, n]));
    const { adj, radj }     = buildBuildingAdjacency(nodeMap, edges);

    let xLeft = 0;
    return MAP_COLUMN_ORDER.map((bid) => {
      const bNodes = physNodes.filter((n) => n.physicalLocation.building === bid);

      let width: number;
      if (bNodes.length === 0) {
        // Placeholder column — reserve a single slot so background stripe shows
        width = LEAF_WIDTH + BUILDING_PAD_X * 2;
      } else {
        const bNodeIds   = new Set(bNodes.map((n) => n.id));
        const leafCounts = computeLeafCounts(bNodeIds, adj);

        const roots      = bNodes.filter(
          (n) => (radj.get(n.id) ?? []).every((pid) => !bNodeIds.has(pid))
        );

        const totalLeaves = roots.reduce((s, r) => s + (leafCounts.get(r.id) ?? 1), 0);
        const gapCount    = Math.max(0, roots.length - 1);
        const treeWidth   = totalLeaves * LEAF_WIDTH + gapCount * SUBTREE_GAP;

        width = Math.max(treeWidth + BUILDING_PAD_X * 2, LEAF_WIDTH + BUILDING_PAD_X * 2);
      }

      const xCenter = xLeft + width / 2;
      xLeft += width + BUILDING_GAP;
      return { id: bid as BuildingId, xCenter, width };
    });
  }

  // ── Legacy branchIndex-based widths (no edges provided) ───────────────────
  const maxBranch: Partial<Record<BuildingId, number>> = {};
  for (const n of physNodes) {
    const b  = n.physicalLocation.building;
    const bi = n.layout?.branchIndex ?? 0;
    if ((maxBranch[b] ?? -1) < bi) maxBranch[b] = bi;
  }

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
 * Used to auto-assign a branchIndex for nodes that don't declare one
 * when no edges are provided.
 */
function xCell(b: BuildingId, band: FloorBandId, layer: TopologyLayer): string {
  return `${b}::${band}::${layer}`;
}

/**
 * Position all nodes on the canvas.
 *
 * ## Tree-based layout (when `edges` is provided — recommended)
 *
 * Uses a two-pass algorithm:
 *  1. **Bottom-up** — compute the leaf-count footprint of every node's subtree.
 *     Leaf count N means the node needs N × LEAF_WIDTH pixels.
 *  2. **Top-down** — walk from roots, assigning each node an X equal to the
 *     centre of its allocated horizontal range.  Children divide the range
 *     proportionally so parents are always centred over their children.
 *
 * The main power backbone (MV feed → switchgear) anchors at the building
 * column centre-line and branches spread symmetrically left and right.
 *
 * ## Legacy layout (no `edges`)
 *
 * Falls back to the original `branchIndex`-based sequential left-alignment.
 *
 * @param nodes          Filtered node inputs for the current view.
 * @param scope          Layout scope ('overview' or a building id).
 * @param buildingCols   Pre-computed column layout.  If omitted, computed from
 *                       `nodes` + `edges` internally.
 * @param edges          Full edge set for tree structure analysis.
 */
export function layoutNodes(
  nodes: TopologyNodeInput[],
  scope: LayoutScope = 'overview',
  buildingCols?: BuildingColConfig[],
  edges?: TopologyEdgeInput[]
): TopologyNode[] {
  if (nodes.length === 0) return [];

  const tbNodes   = nodes.filter((n) => n.mapScope === 'building-detail');
  const physNodes = nodes.filter((n) => n.mapScope !== 'building-detail');

  // Resolve building column layout
  const cols   = buildingCols ?? computeBuildingCols(nodes, edges);
  const colMap = Object.fromEntries(cols.map((c) => [c.id, c])) as Record<BuildingId, BuildingColConfig>;

  // ── Compute tree-based X positions ────────────────────────────────────────
  let treeX: Map<string, number> | null = null;

  if (edges) {
    const nodeMap       = new Map(physNodes.map((n) => [n.id, n]));
    const { adj, radj } = buildBuildingAdjacency(nodeMap, edges);

    treeX = new Map<string, number>();

    for (const bid of MAP_COLUMN_ORDER) {
      const col = colMap[bid as BuildingId];
      if (!col) continue;

      const bNodes   = physNodes.filter((n) => n.physicalLocation.building === bid);
      if (bNodes.length === 0) continue;

      const bNodeIds = new Set(bNodes.map((n) => n.id));

      // Leaf counts from the VISIBLE set (tight per-tier sizing)
      const leafCounts = computeLeafCounts(bNodeIds, adj);

      // Roots = nodes with no visible parent in the same building
      const roots = bNodes.filter(
        (n) => (radj.get(n.id) ?? []).every((pid) => !bNodeIds.has(pid))
      );

      if (roots.length === 0) continue;

      // Total horizontal space needed for all root subtrees + inter-root gaps
      const totalLeaves = roots.reduce((s, r) => s + (leafCounts.get(r.id) ?? 1), 0);
      const gapCount    = Math.max(0, roots.length - 1);
      const treeWidth   = totalLeaves * LEAF_WIDTH + gapCount * SUBTREE_GAP;
      const treeStartX  = col.xCenter - treeWidth / 2;

      // Walk the tree and collect X positions
      const xMap = assignTreeX(roots, bNodeIds, adj, leafCounts, treeStartX);
      for (const [id, x] of xMap) treeX.set(id, x);

      // Any visible node not reached by the tree walk (isolated, no edges at all)
      for (const n of bNodes) {
        if (!treeX.has(n.id)) treeX.set(n.id, col.xCenter);
      }
    }
  }

  // ── Legacy auto-slot fallback ─────────────────────────────────────────────
  const autoSlotCounters: Record<string, number> = {};
  const autoSlot: Record<string, number>         = {};

  if (!edges) {
    for (const n of physNodes) {
      if (n.positionOverride || n.layout?.branchIndex !== undefined) continue;
      const bandId = getFloorBandId(parseElevationM(n.physicalLocation.elevation));
      const key    = xCell(n.physicalLocation.building, bandId, n.layer);
      const slot   = autoSlotCounters[key] ?? 0;
      autoSlot[n.id] = slot;
      autoSlotCounters[key] = slot + 1;
    }
  }

  // ── Position every node ────────────────────────────────────────────────────
  return nodes.map((n): TopologyNode => {
    // positionOverride always wins
    if (n.positionOverride) {
      const { layout: _l, positionOverride, mapScope: _m, ...rest } = n;
      return { ...rest, position: positionOverride };
    }

    const { layout: _layout, positionOverride: _pos, mapScope: _mapScope, ...rest } = n;
    const col = colMap[n.physicalLocation.building];

    if (!col) {
      // Building not in column map — place off-canvas
      return { ...rest, position: { x: -9999, y: -9999 } };
    }

    // ── Batch House TB grid (building-detail nodes) ──────────────────────────
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

    // ── Y position (always from layer × floor band) ──────────────────────────
    const bandId = getFloorBandId(parseElevationM(n.physicalLocation.elevation));
    const y      = getLayerY(n.layer, bandId);

    // ── X position ─────────────────────────────────────────────────────────
    let x: number;

    if (treeX?.has(n.id)) {
      // ① Tree-based centering (preferred path when edges provided)
      x = treeX.get(n.id)!;
    } else if (n.layout?.branchIndex !== undefined) {
      // ② Manual branchIndex hint (legacy / positionOverride-adjacent)
      x =
        col.xCenter -
        col.width / 2 +
        BUILDING_PAD_X +
        n.layout.branchIndex * NODE_SLOT_SPACING;
    } else if (autoSlot[n.id] !== undefined) {
      // ③ Auto-assigned slot (legacy no-edges path)
      x =
        col.xCenter -
        col.width / 2 +
        BUILDING_PAD_X +
        autoSlot[n.id] * NODE_SLOT_SPACING;
    } else {
      // ④ Last resort: building centre
      x = col.xCenter;
    }

    // ── Building-detail scope: pin feeding node above the TB grid ───────────
    if (scope !== 'overview' && scope !== n.physicalLocation.building) {
      if (tbNodes.length > 0 && bandId === 'ground') {
        return {
          ...rest,
          position: {
            x,
            y: FLOOR_BAND_MAP.ground.yCenter - FLOOR_BAND_MAP.ground.height / 2 + 30,
          },
        };
      }
    }

    return { ...rest, position: { x, y } };
  });
}
