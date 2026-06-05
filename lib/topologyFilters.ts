import type { BuildingId, TopologyEdge, TopologyNode } from '@/types/topology';

export type BuildingFilter = BuildingId | 'all';

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
