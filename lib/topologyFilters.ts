import type { BuildingId, TopologyEdge, TopologyNode, TopologyNodeInput } from '@/types/topology';
import type { LayoutScope } from '@/lib/siteLayout';
import { layoutNodes } from '@/lib/siteLayout';

export type BuildingFilter = BuildingId | 'all';

function toLayoutScope(building: BuildingFilter): LayoutScope {
  return building === 'all' ? 'overview' : building;
}

/** Hide building-detail nodes (e.g. TB grid) on full-site overview */
export function filterMapNodes(
  nodes: TopologyNodeInput[],
  edges: TopologyEdge[],
  building: BuildingFilter
): TopologyNodeInput[] {
  if (building === 'all') {
    return nodes.filter((n) => n.mapScope !== 'building-detail');
  }

  const inBuilding = nodes.filter(
    (n) =>
      n.physicalLocation.building === building && n.mapScope !== 'overview-only'
  );
  const visibleIds = new Set(inBuilding.map((n) => n.id));

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
  building: BuildingFilter
): TopologyEdge[] {
  const visibleIds = new Set(nodes.map((n) => n.id));

  return edges.filter((e) => {
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return false;
    if (building !== 'all') {
      const touchesBuilding =
        e.route?.spansBuildings &&
        (e.route.fromBuilding === building ||
          e.route.toBuilding === building ||
          visibleIds.has(e.source) ||
          visibleIds.has(e.target));
      if (e.route?.spansBuildings) return touchesBuilding;
    }
    return true;
  });
}

export function prepareMapTopology(
  nodeInputs: TopologyNodeInput[],
  edges: TopologyEdge[],
  building: BuildingFilter,
  statusOverrides: { nodes: Record<string, TopologyNode['status']>; edges: Record<string, TopologyNode['status']> }
): { nodes: TopologyNode[]; edges: TopologyEdge[] } {
  const filteredInputs = filterMapNodes(nodeInputs, edges, building).map((n) => ({
    ...n,
    status: statusOverrides.nodes[n.id] ?? n.status,
  }));

  const scope = toLayoutScope(building);
  const nodes = layoutNodes(filteredInputs, scope);

  const layoutedEdges = edges.map((e) => ({
    ...e,
    status: (statusOverrides.edges[e.id] ?? e.status) as TopologyEdge['status'],
  }));

  const visibleEdges = filterMapEdges(nodes, layoutedEdges, building);

  return { nodes, edges: visibleEdges };
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
