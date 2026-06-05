/** When a root-cause asset is marked resolved, downstream nodes/edges inherit operational status. */
export const RESOLVE_CASCADE: Record<
  string,
  { nodes: string[]; edges: string[] }
> = {
  'DC-A1': {
    nodes: ['JB-01', 'Motor-Pump-01'],
    edges: ['PC-04', 'PC-06'],
  },
};

export function getCascadeTargets(rootId: string): {
  nodes: string[];
  edges: string[];
} {
  return RESOLVE_CASCADE[rootId] ?? { nodes: [], edges: [] };
}
