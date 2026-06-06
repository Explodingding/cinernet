import type { BuildingId, LocationZone, TopologyLayer, TopologyNodeInput } from '@/types/topology';

const LAYER_Y: Record<TopologyLayer, number> = {
  'mv-feed': 820,
  'mv-switchgear': 680,
  transformer: 540,
  'lv-panel': 400,
  cabinet: 240,
  junction: 80,
  load: -80,
};

const BUILDING_X: Record<BuildingId, number> = {
  utility: 520,
  'furnace-10': 200,
  'batch-house': 840,
};

const BRANCH_SPACING = 168;

export function layoutNode(node: TopologyNodeInput) {
  if (node.positionOverride) {
    const { layout: _layout, positionOverride, ...rest } = node;
    return { ...rest, position: positionOverride };
  }

  const baseX = BUILDING_X[node.layout.building];
  const branch = node.layout.branchIndex ?? 0;

  let x =
    node.layout.building === 'utility'
      ? baseX
      : baseX + (branch - 1) * BRANCH_SPACING;
  let y = LAYER_Y[node.layer];

  /* Grid layout when many terminal boxes share one building branch */
  if (node.layer === 'junction' && node.layout.building === 'batch-house' && branch > 0) {
    const cols = 5;
    const col = (branch - 1) % cols;
    const row = Math.floor((branch - 1) / cols);
    x = 480 + col * BRANCH_SPACING;
    y = LAYER_Y.junction + row * 72;
  }

  const { layout: _layout, positionOverride: _pos, ...rest } = node;
  return { ...rest, position: { x, y } };
}

export function layoutNodes(nodes: TopologyNodeInput[]) {
  return nodes.map(layoutNode);
}
