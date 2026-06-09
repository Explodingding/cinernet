import type { TopologyEdge, TopologyNode } from '@/types/topology';

/** Pixel gap between adjacent parallel cable lanes */
export const PARALLEL_LANE_SPACING = 14;

type AugmentedEdge = TopologyEdge & {
  parallelIndex: number;
  totalParallel: number;
  parallelBothEnds: boolean;
};

/**
 * Pre-processes an edge array and injects deterministic parallel-lane metadata
 * into every edge so that `PowerCableEdge` can offset co-linear cables without
 * needing to inspect sibling edges at render-time.
 *
 * Two grouping strategies, evaluated in priority order:
 *
 *  1. **Exact pair** (`source + target`): multiple explicitly-defined cables
 *     between the same two nodes (e.g. a power + control pair).
 *     → `parallelBothEnds = true` — offset applied symmetrically at both
 *       the source wall AND the target wall so the two cables stay parallel
 *       for their entire length.
 *
 *  2. **Source fan-out** (`source + dominant exit direction`): several cables
 *     leaving the same node in the same compass direction (the common case —
 *     e.g. a distribution cabinet driving 5 load motors).
 *     → `parallelBothEnds = false` — offset applied only at the source wall,
 *       so the cables fan out immediately and each one arrives at its own
 *       target node's natural centre.
 *
 * Single-cable paths always get `parallelIndex=0, totalParallel=1` and are
 * never visually altered.
 */
export function assignParallelIndices(
  edges: TopologyEdge[],
  nodes: TopologyNode[]
): AugmentedEdge[] {
  // Centre positions (top-left corner + approx half-dimensions)
  const pos = new Map(
    nodes.map((n) => [
      n.id,
      { x: n.position.x + 88, y: n.position.y + 48 },
    ])
  );

  // ── Pass A: count exact source→target pairs ──────────────────────────────
  const pairCount: Record<string, number> = {};
  const pairSeq:   Record<string, number> = {};
  for (const e of edges) {
    const k = `${e.source}__${e.target}`;
    pairCount[k] = (pairCount[k] ?? 0) + 1;
  }

  // ── Pass B: group fan-out corridors (edges NOT in a pair group) ──────────
  //   Key: `<sourceId>_<H|V>` where H/V is the dominant exit direction.
  const fanGroups: Record<string, string[]> = {};
  for (const e of edges) {
    if (pairCount[`${e.source}__${e.target}`] > 1) continue;
    const k = fanKey(e, pos);
    (fanGroups[k] = fanGroups[k] ?? []).push(e.id);
  }

  // ── Assign indices ────────────────────────────────────────────────────────
  return edges.map((e): AugmentedEdge => {
    const pk = `${e.source}__${e.target}`;

    if (pairCount[pk] > 1) {
      const idx = pairSeq[pk] ?? 0;
      pairSeq[pk] = idx + 1;
      return {
        ...e,
        parallelIndex:    idx,
        totalParallel:    pairCount[pk],
        parallelBothEnds: true,
      };
    }

    const fk    = fanKey(e, pos);
    const group = fanGroups[fk] ?? [e.id];
    return {
      ...e,
      parallelIndex:    group.indexOf(e.id),
      totalParallel:    group.length,
      parallelBothEnds: false,
    };
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fanKey(
  e: TopologyEdge,
  pos: Map<string, { x: number; y: number }>
): string {
  const dir = exitDir(pos.get(e.source), pos.get(e.target), e.route?.spansBuildings);
  return `${e.source}_${dir}`;
}

/** Dominant exit direction from source toward target. */
function exitDir(
  src: { x: number; y: number } | undefined,
  tgt: { x: number; y: number } | undefined,
  spansBuildings?: boolean
): 'H' | 'V' {
  if (spansBuildings) return 'H';
  if (!src || !tgt) return 'V';
  return Math.abs(tgt.x - src.x) > Math.abs(tgt.y - src.y) ? 'H' : 'V';
}
