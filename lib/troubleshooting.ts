/** When a root-cause asset is marked resolved, downstream nodes/edges inherit operational status. */
export const RESOLVE_CASCADE: Record<
  string,
  { nodes: string[]; edges: string[] }
> = {
  'DC-A1': {
    nodes: ['JB-A1', 'M-PUMP-A1'],
    edges: ['PC-A1', 'PC-M01'],
  },
};

export function getCascadeTargets(rootId: string): {
  nodes: string[];
  edges: string[];
} {
  return RESOLVE_CASCADE[rootId] ?? { nodes: [], edges: [] };
}
