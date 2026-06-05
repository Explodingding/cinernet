/** When a root-cause asset is marked resolved, downstream nodes/edges inherit operational status. */
export const RESOLVE_CASCADE: Record<
  string,
  { nodes: string[]; edges: string[] }
> = {
  'DC-F10-01': {
    nodes: ['JB-F10-01', 'M-F10-PUMP'],
    edges: ['PC-F10-JB1', 'PC-F10-M01'],
  },
};

export function getCascadeTargets(rootId: string): {
  nodes: string[];
  edges: string[];
} {
  return RESOLVE_CASCADE[rootId] ?? { nodes: [], edges: [] };
}
