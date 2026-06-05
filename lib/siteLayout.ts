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
  const baseX = BUILDING_X[node.layout.building];
  const branch = node.layout.branchIndex ?? 0;
  const x =
    node.layout.building === 'utility'
      ? baseX
      : baseX + (branch - 1) * BRANCH_SPACING;
  return {
    ...node,
    position: { x, y: LAYER_Y[node.layer] },
  };
}

export function layoutNodes(nodes: TopologyNodeInput[]) {
  return nodes.map(layoutNode);
}
