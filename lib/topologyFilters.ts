import type {
  BuildingId,
  EdgeType,
  TopologyEdge,
  TopologyNode,
  TopologyNodeInput,
} from '@/types/topology';
import type { LayoutScope } from '@/lib/siteLayout';
import { layoutNodes } from '@/lib/siteLayout';

export type BuildingFilter = BuildingId | 'all';

/** The three progressive disclosure tiers. */
export type DepthTier = 1 | 2 | 3;

/**
 * Which TopologyLayer values become visible at each tier.
 * Higher tiers accumulate lower-tier layers.
 */
const TIER_LAYERS: Record<DepthTier, Set<TopologyNodeInput['layer']>> = {
  1: new Set(['mv-feed', 'mv-switchgear', 'transformer', 'lv-panel']),
  2: new Set(['mv-feed', 'mv-switchgear', 'transformer', 'lv-panel', 'cabinet']),
  3: new Set(['mv-feed', 'mv-switchgear', 'transformer', 'lv-panel', 'cabinet', 'junction', 'load']),
};

function toLayoutScope(building: BuildingFilter): LayoutScope {
  return building === 'all' ? 'overview' : building;
}

/** Returns true when a node should appear at the given depth tier */
function nodeVisibleAtTier(n: TopologyNodeInput, tier: DepthTier): boolean {
  const nodeTier = n.displayTier ?? 1;
  if (nodeTier > tier) return false;
  return TIER_LAYERS[tier].has(n.layer);
}

/** Hide building-detail nodes on full-site overview; apply depth tier */
export function filterMapNodes(
  nodes: TopologyNodeInput[],
  edges: TopologyEdge[],
  building: BuildingFilter,
  tier: DepthTier
): TopologyNodeInput[] {
  const tierFiltered = nodes.filter((n) => nodeVisibleAtTier(n, tier));

  if (building === 'all') {
    return tierFiltered.filter((n) => n.mapScope !== 'building-detail');
  }

  const inBuilding = tierFiltered.filter(
    (n) =>
      n.physicalLocation.building === building && n.mapScope !== 'overview-only'
  );
  const visibleIds = new Set(inBuilding.map((n) => n.id));

  // Keep remote endpoints of cross-building edges visible
  const remoteIds = new Set<string>();
  for (const e of edges) {
    if (!e.route?.spansBuildings) continue;
    if (e.route.fromBuilding !== building && e.route.toBuilding !== building) continue;
    if (!visibleIds.has(e.source)) remoteIds.add(e.source);
    if (!visibleIds.has(e.target)) remoteIds.add(e.target);
  }

  const remotes = nodes.filter((n) => remoteIds.has(n.id));
  return [...inBuilding, ...remotes];
}

export function filterMapEdges(
  nodes: TopologyNode[],
  edges: TopologyEdge[],
  building: BuildingFilter,
  visibleEdgeTypes: Set<EdgeType>
): TopologyEdge[] {
  const visibleIds = new Set(nodes.map((n) => n.id));

  return edges.filter((e) => {
    // Both endpoints must be visible
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return false;
    // Cable type must be toggled on
    if (!visibleEdgeTypes.has(e.edgeType)) return false;

    if (building !== 'all' && e.route?.spansBuildings) {
      return (
        e.route.fromBuilding === building ||
        e.route.toBuilding === building ||
        visibleIds.has(e.source) ||
        visibleIds.has(e.target)
      );
    }
    return true;
  });
}

export function prepareMapTopology(
  nodeInputs: TopologyNodeInput[],
  edges: TopologyEdge[],
  building: BuildingFilter,
  tier: DepthTier,
  visibleEdgeTypes: Set<EdgeType>,
  statusOverrides: {
    nodes: Record<string, TopologyNode['status']>;
    edges: Record<string, TopologyNode['status']>;
  }
): { nodes: TopologyNode[]; edges: TopologyEdge[] } {
  const filteredInputs = filterMapNodes(nodeInputs, edges, building, tier).map((n) => ({
    ...n,
    status: statusOverrides.nodes[n.id] ?? n.status,
  }));

  const scope = toLayoutScope(building);
  const nodes = layoutNodes(filteredInputs, scope);

  const layoutedEdges = edges.map((e) => ({
    ...e,
    status: (statusOverrides.edges[e.id] ?? e.status) as TopologyEdge['status'],
  }));

  const visibleEdges = filterMapEdges(nodes, layoutedEdges, building, visibleEdgeTypes);

  return { nodes, edges: visibleEdges };
}

/** Returns all EdgeType values present in a set of edges */
export function getUsedEdgeTypes(edges: TopologyEdge[]): Set<EdgeType> {
  const used = new Set<EdgeType>();
  for (const e of edges) used.add(e.edgeType);
  return used;
}

/** @deprecated use prepareMapTopology */
export function filterTopologyByBuilding(
  nodes: TopologyNode[],
  edges: TopologyEdge[],
  building: BuildingFilter
): { nodes: TopologyNode[]; edges: TopologyEdge[] } {
  if (building === 'all') return { nodes, edges };

  const nodeIds = new Set(
    nodes.filter((n) => n.physicalLocation.building === building).map((n) => n.id)
  );

  const filteredEdges = edges.filter((e) => {
    const sourceIn = nodeIds.has(e.source);
    const targetIn = nodeIds.has(e.target);
    if (sourceIn && targetIn) return true;
    if (e.route?.spansBuildings) {
      return (
        e.route.fromBuilding === building ||
        e.route.toBuilding === building ||
        sourceIn ||
        targetIn
      );
    }
    return sourceIn || targetIn;
  });

  const edgeNodeIds = new Set<string>();
  filteredEdges.forEach((e) => {
    edgeNodeIds.add(e.source);
    edgeNodeIds.add(e.target);
  });

  const filteredNodes = nodes.filter(
    (n) => n.physicalLocation.building === building || edgeNodeIds.has(n.id)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}
