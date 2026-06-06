import type { BuildingId, TopologyLayer, TopologyNodeInput, TopologyNode } from '@/types/topology';

/** Horizontal centre of each building column on the canvas */
const COLUMN_X: Record<BuildingId, number> = {
  'furnace-10': 200,
  utility: 560,
  'batch-house': 960,
};

/** Power-flow layers — bottom (MV root) to top (loads) */
const LAYER_Y: Record<TopologyLayer, number> = {
  'mv-feed': 880,
  'mv-switchgear': 720,
  transformer: 560,
  'lv-panel': 400,
  cabinet: 240,
  junction: 80,
  load: -80,
};

const BRANCH_SPACING = 200;
const TB_GRID_COLS = 4;
const TB_GRID_COL_W = 190;
const TB_GRID_ROW_H = 96;

export type LayoutScope = 'overview' | BuildingId;

function layoutBatchHouseTerminalGrid(branchIndex: number) {
  const i = Math.max(0, branchIndex - 1);
  const col = i % TB_GRID_COLS;
  const row = Math.floor(i / TB_GRID_COLS);
  const gridWidth = (TB_GRID_COLS - 1) * TB_GRID_COL_W;
  return {
    x: COLUMN_X['batch-house'] - gridWidth / 2 + col * TB_GRID_COL_W,
    y: LAYER_Y.junction + row * TB_GRID_ROW_H,
  };
}

function layoutNode(node: TopologyNodeInput, scope: LayoutScope): TopologyNode {
  if (node.positionOverride) {
    const { layout: _l, positionOverride, mapScope: _m, ...rest } = node;
    return { ...rest, position: positionOverride };
  }

  const building = node.layout.building;
  const branch = node.layout.branchIndex ?? 0;
  let x = COLUMN_X[building];
  let y = LAYER_Y[node.layer];

  if (building === 'utility') {
    x = COLUMN_X.utility;
  } else if (node.mapScope === 'building-detail' && building === 'batch-house') {
    ({ x, y } = layoutBatchHouseTerminalGrid(branch));
  } else if (branch > 0) {
    x = COLUMN_X[building] + (branch - 1) * BRANCH_SPACING - BRANCH_SPACING / 2;
  }

  const { layout: _layout, positionOverride: _pos, mapScope: _mapScope, ...rest } = node;
  return {
    ...rest,
    position: { x, y },
  };
}

export function layoutNodes(
  nodes: TopologyNodeInput[],
  scope: LayoutScope = 'overview'
): TopologyNode[] {
  return nodes.map((n) => layoutNode(n, scope));
}

export { COLUMN_X, LAYER_Y };
