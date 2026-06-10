'use client';

import { useInternalNode, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { TopologyEdge } from '@/types/topology';
import type { DerivedStatus } from '@/lib/faultCascade';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { CABLE_COLOR_MAP } from '@/lib/cableColors';

/** Pixel gap between adjacent parallel cable lanes */
const LANE_SPACING = 14;

type Side = 'left' | 'right' | 'top' | 'bottom';

interface AttachPoint {
  x: number;
  y: number;
  side: Side;
}

/**
 * Choose which wall a cable exits/enters and apply independent lateral offsets
 * to the source and target attachment points.
 *
 * @param forcedHorizontal  True for cross-building cables — forces left/right exits.
 * @param srcOffset         Perpendicular pixel offset on the SOURCE wall.
 *                          Top/bottom walls: shifts X (cables fan side-by-side).
 *                          Left/right walls: shifts Y (cables stack above/below).
 * @param tgtOffset         Same convention, applied on the TARGET wall.
 *                          Pass 0 for fan-out cables (source-only separation);
 *                          pass the same value as srcOffset for exact pair cables.
 */
function computeAttachments(
  sx: number, sy: number, sw: number, sh: number,
  tx: number, ty: number, tw: number, th: number,
  forcedHorizontal = false,
  srcOffset = 0,
  tgtOffset = 0
): { src: AttachPoint; tgt: AttachPoint } {
  const sCX = sx + sw / 2;
  const sCY = sy + sh / 2;
  const tCX = tx + tw / 2;
  const tCY = ty + th / 2;
  const dx = tCX - sCX;
  const dy = tCY - sCY;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  let srcSide: Side;
  let tgtSide: Side;

  if (forcedHorizontal) {
    srcSide = dx > 0 ? 'right' : 'left';
    tgtSide = dx > 0 ? 'left' : 'right';
  } else if (adx > ady) {
    srcSide = dx > 0 ? 'right' : 'left';
    tgtSide = dx > 0 ? 'left' : 'right';
  } else {
    srcSide = dy > 0 ? 'bottom' : 'top';
    tgtSide = dy > 0 ? 'top' : 'bottom';
  }

  const wallPoint = (
    nx: number, ny: number, nw: number, nh: number,
    side: Side, offset: number
  ): AttachPoint => {
    switch (side) {
      case 'left':   return { x: nx,          y: ny + nh / 2 + offset, side };
      case 'right':  return { x: nx + nw,     y: ny + nh / 2 + offset, side };
      case 'top':    return { x: nx + nw / 2 + offset, y: ny,          side };
      case 'bottom': return { x: nx + nw / 2 + offset, y: ny + nh,     side };
    }
  };

  return {
    src: wallPoint(sx, sy, sw, sh, srcSide, srcOffset),
    tgt: wallPoint(tx, ty, tw, th, tgtSide, tgtOffset),
  };
}

/**
 * Build a strict 90-degree orthogonal SVG path (all segments horizontal or
 * vertical — no curves).  This produces the clean "L-shape" / "Z-shape" lines
 * seen on professional electrical single-line diagrams.
 *
 * Routing rules:
 *   • Vertical exit (top/bottom): go to vertical midpoint, turn horizontal
 *     to target X, then continue to target — V → H → V
 *   • Horizontal exit (left/right): go to horizontal midpoint, turn vertical
 *     to target Y, then continue to target — H → V → H
 *   • Degenerate (same X or same Y): single straight segment
 *
 * The cable label is placed at the centre of the longest segment.
 */
function buildOrthogonalPath(
  sx: number, sy: number, srcSide: Side,
  tx: number, ty: number
): { d: string; labelX: number; labelY: number } {
  type Pt = [number, number];
  const pts: Pt[] = [[sx, sy]];

  const straightH = Math.abs(ty - sy) < 1;
  const straightV = Math.abs(tx - sx) < 1;
  const isHExit   = srcSide === 'left' || srcSide === 'right';

  if (straightH || straightV) {
    // Perfectly horizontal or vertical — single segment
    pts.push([tx, ty]);
  } else if (isHExit) {
    // H → V → H: run horizontal to midpoint, drop/rise to target Y, finish
    const midX = (sx + tx) / 2;
    pts.push([midX, sy], [midX, ty], [tx, ty]);
  } else {
    // V → H → V: drop/rise to midpoint, run horizontal to target X, finish
    const midY = (sy + ty) / 2;
    pts.push([sx, midY], [tx, midY], [tx, ty]);
  }

  // Build the SVG path string
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');

  // Place the label at the centre of the longest segment
  let maxLen = -1;
  let labelX = (sx + tx) / 2;
  let labelY = (sy + ty) / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const len = Math.abs(ax - bx) + Math.abs(ay - by);
    if (len > maxLen) {
      maxLen = len;
      labelX = (ax + bx) / 2;
      labelY = (ay + by) / 2;
    }
  }

  return { d, labelX, labelY };
}

export function PowerCableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const edgeData = data as unknown as TopologyEdge & {
    derivedStatus?: DerivedStatus | null;
  };

  const cfg          = STATUS_CONFIG[edgeData?.status ?? 'operational'];
  const cable        = CABLE_COLOR_MAP[edgeData?.edgeType ?? 'power'];
  const isMv         = edgeData?.edgeType === 'mv';
  const isOperational   = edgeData?.status === 'operational';
  const isFault         = edgeData?.status === 'fault';
  const isInvestigation = edgeData?.status === 'investigation';

  const derivedStatus = edgeData?.derivedStatus ?? null;
  const isDerivFault  = derivedStatus === 'derived-fault';
  const isDerivInv    = derivedStatus === 'derived-investigation';

  // ── Lane offsets for parallel cables ──────────────────────────────────────────────
  // parallelIndex / totalParallel / parallelBothEnds are injected by
  // assignParallelIndices (lib/parallelEdges.ts) in page.tsx before the edges
  // are passed to React Flow.
  //
  // Fan-out case (parallelBothEnds = false): offset source wall only, so cables
  //   splay out of the source node like wires from a terminal block, while each
  //   cable still arrives at its own target's natural centre.
  // Pair case (parallelBothEnds = true): same offset on both walls, keeping the
  //   two cables perfectly parallel for their entire run.
  const parallelIndex   = edgeData?.parallelIndex   ?? 0;
  const totalParallel   = edgeData?.totalParallel   ?? 1;
  const bothEnds        = edgeData?.parallelBothEnds ?? false;

  const laneOffset = totalParallel > 1
    ? (parallelIndex - (totalParallel - 1) / 2) * LANE_SPACING
    : 0;

  const srcOffset = laneOffset;
  const tgtOffset = bothEnds ? laneOffset : 0;

  // ── Compute smart attachment points ────────────────────────────────────────────────
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  const sp = sourceNode?.internals?.positionAbsolute;
  const tp = targetNode?.internals?.positionAbsolute;
  const sw = sourceNode?.measured?.width;
  const sh = sourceNode?.measured?.height;
  const tw = targetNode?.measured?.width;
  const th = targetNode?.measured?.height;

  if (sp && tp && sw && sh && tw && th) {
    const isCrossBuilding = edgeData?.route?.spansBuildings === true;
    const { src, tgt } = computeAttachments(
      sp.x, sp.y, sw, sh,
      tp.x, tp.y, tw, th,
      isCrossBuilding,
      srcOffset,
      tgtOffset
    );
    const built = buildOrthogonalPath(src.x, src.y, src.side, tgt.x, tgt.y);
    edgePath = built.d;
    labelX = built.labelX;
    labelY = built.labelY;
  } else {
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    labelX = (sourceX + targetX) / 2;
    labelY = (sourceY + targetY) / 2;
  }

  // ── Visual styling ──────────────────────────────────────────────────────────────────
  // Priority: actual fault > derived-fault cascade > investigation > derived-
  // investigation > base cable-type color from the shared CABLE_COLOR_MAP.
  // Healthy circuits render in their cable-type color so the canvas always
  // matches the TopBar filter legend.
  const activeColor =
    isFault              ? '#ef4444'
    : isDerivFault       ? '#f87171'
    : isInvestigation    ? '#fbbf24'
    : isDerivInv         ? '#fde68a'
    : cable.color;

  const pathId = `flow-path-${id}`;

  const strokeColor = selected ? activeColor : `${activeColor}cc`;
  const strokeWidth =
    selected                      ? 3
    : isMv                        ? 2.5
    : isFault || isDerivFault     ? 2.5
    : 2;

  // Actual fault: fast marching red dashes.
  // Derived fault: slower marching lighter-red dashes (upstream cascade indicator).
  // Investigation: slow amber dashes.
  const dashArray =
    isFault || isInvestigation ? '6 3'
    : isDerivFault             ? '10 5'
    : undefined;

  const dashAnimation =
    isFault       ? 'dash-march 0.55s linear infinite'
    : isDerivFault ? 'dash-march 1.4s linear infinite'
    : isInvestigation ? 'dash-march-slow 1.2s linear infinite'
    : undefined;

  const glowFilter =
    isFault || isDerivFault
      ? `drop-shadow(0 0 6px rgba(239,68,68,0.65))`
      : isInvestigation || isDerivInv
        ? `drop-shadow(0 0 5px rgba(251,191,36,0.5))`
        : `drop-shadow(0 0 4px ${cable.glowColor})`;

  return (
    <>
      {/* Invisible wide hit area for easy clicking */}
      <path d={edgePath} stroke="transparent" strokeWidth={28} fill="none"
        className="react-flow__edge-interaction" />

      {/* Glow halo when selected */}
      {selected && (
        <path d={edgePath} stroke={activeColor} strokeWidth={8} fill="none"
          style={{ filter: 'blur(4px)', opacity: 0.35 }} />
      )}

      {/* Red glow halo for fault-cascade edges (even when not selected) */}
      {(isFault || isDerivFault) && !selected && (
        <path d={edgePath} stroke="#ef4444" strokeWidth={6} fill="none"
          style={{ filter: 'blur(5px)', opacity: isDerivFault ? 0.2 : 0.35 }} />
      )}

      {/* Main cable line */}
      <path
        id={pathId}
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        fill="none"
        style={{ filter: glowFilter, animation: dashAnimation }}
      />

      {/* Animated power-flow dot — only on operational cables with no cascade */}
      {isOperational && !isDerivFault && !isDerivInv && (
        <circle r="4" fill={activeColor}
          style={{ filter: `drop-shadow(0 0 5px ${activeColor})` }}>
          <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {/* Cable label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          <div
            className="px-2 py-1 flex items-center justify-center rounded text-[9px] font-bold tracking-wider cursor-pointer select-none"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              background: selected ? 'rgba(10, 15, 26, 0.98)' : 'rgba(10, 15, 26, 0.82)',
              color: activeColor,
              border: `1px solid ${
                selected                  ? activeColor
                : isFault || isDerivFault ? 'rgba(239,68,68,0.50)'
                : isInvestigation || isDerivInv ? cfg.borderColor
                : cable.glowColor
              }`,
              backdropFilter: 'blur(4px)',
              textShadow: selected ? `0 0 8px ${cfg.color}` : 'none',
              boxShadow: selected ? `0 0 8px ${cfg.glowColor}` : 'none',
            }}
          >
            {id}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
