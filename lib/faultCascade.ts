import type { TopologyNode, TopologyEdge } from '@/types/topology';

export type DerivedStatus = 'derived-fault' | 'derived-investigation';

/**
 * Map of nodeId → derived status for nodes that are downstream of a fault or
 * investigation node.  Computed at render time — never stored, never modifies
 * source data.
 *
 * Algorithm: directed BFS following edges source → target (power-flow direction).
 * Starts from every node whose stored status is 'fault' or 'investigation'.
 * Reachable nodes inherit a derived status that is visually softer than the
 * real status — the technician sees "affected by upstream fault", not a
 * confirmed local fault.
 */
export type DerivedStatuses = Map<string, DerivedStatus>;

export function computeDerivedStatuses(
  nodes: TopologyNode[],
  edges: TopologyEdge[]
): DerivedStatuses {
  const result: DerivedStatuses = new Map();

  // Build adjacency list: source → [target, ...]
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.source);
    if (list) list.push(e.target);
    else adj.set(e.source, [e.target]);
  }

  // BFS from each fault / investigation node, propagating downstream
  for (const node of nodes) {
    if (node.status !== 'fault' && node.status !== 'investigation') continue;

    const derivedStatus: DerivedStatus =
      node.status === 'fault' ? 'derived-fault' : 'derived-investigation';

    const queue: string[] = adj.get(node.id) ?? [];
    const visited = new Set<string>([node.id]);

    let head = 0;
    while (head < queue.length) {
      const id = queue[head++];
      if (visited.has(id)) continue;
      visited.add(id);

      // Only upgrade severity: derived-fault > derived-investigation
      const existing = result.get(id);
      if (!existing || existing === 'derived-investigation') {
        result.set(id, derivedStatus);
      }

      const children = adj.get(id) ?? [];
      for (const child of children) {
        if (!visited.has(child)) queue.push(child);
      }
    }
  }

  return result;
}
