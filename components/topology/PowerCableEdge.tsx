'use client';

import { useInternalNode, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { TopologyEdge } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';

type Side = 'left' | 'right' | 'top' | 'bottom';

interface AttachPoint {
  x: number;
  y: number;
  side: Side;
}

/**
 * Choose which wall a cable exits/enters based on node relative positions.
 *
 * @param forcedHorizontal  True for cross-building cables — forces left/right
 *                          exits so the horizontal run precedes the vertical drop.
 */
function computeAttachments(
  sx: number, sy: number, sw: number, sh: number,
  tx: number, ty: number, tw: number, th: number,
  forcedHorizontal = false
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
    // Cross-building cable: always exit/enter from the side walls so the
    // orthogonal router emits a horizontal run at source Y, then drops/rises
    // vertically to the target level — classic SLD cross-building routing.
    srcSide = dx > 0 ? 'right' : 'left';
    tgtSide = dx > 0 ? 'left' : 'right';
  } else if (adx > ady) {
    // Primarily horizontal
    srcSide = dx > 0 ? 'right' : 'left';
    tgtSide = dx > 0 ? 'left' : 'right';
  } else {
    // Primarily vertical (or equal) — standard SLD downward / upward flow
    srcSide = dy > 0 ? 'bottom' : 'top';
    tgtSide = dy > 0 ? 'top' : 'bottom';
  }

  const wallPoint = (nx: number, ny: number, nw: number, nh: number, side: Side): AttachPoint => {
    switch (side) {
      case 'left':   return { x: nx,          y: ny + nh / 2, side };
      case 'right':  return { x: nx + nw,     y: ny + nh / 2, side };
      case 'top':    return { x: nx + nw / 2, y: ny,          side };
      case 'bottom': return { x: nx + nw / 2, y: ny + nh,     side };
    }
  };

  return {
    src: wallPoint(sx, sy, sw, sh, srcSide),
    tgt: wallPoint(tx, ty, tw, th, tgtSide),
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

  const edgeData = data as unknown as TopologyEdge;
  const cfg = STATUS_CONFIG[edgeData?.status ?? 'operational'];
  const isMv = edgeData?.edgeType === 'mv';
  const activeColor = isMv ? '#f472b6' : cfg.color;
  const isOperational = edgeData?.status === 'operational';
  const isFault = edgeData?.status === 'fault';
  const isInvestigation = edgeData?.status === 'investigation';

  // ── Compute smart attachment points ───────────────────────────────────────────────
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
      isCrossBuilding
    );
    const built = buildOrthogonalPath(src.x, src.y, src.side, tgt.x, tgt.y);
    edgePath = built.d;
    labelX = built.labelX;
    labelY = built.labelY;
  } else {
    // Node measurements not yet available — straight line fallback
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    labelX = (sourceX + targetX) / 2;
    labelY = (sourceY + targetY) / 2;
  }

  // ── Visual styling ─────────────────────────────────────────────────────────────────
  const pathId = `flow-path-${id}`;
  const strokeColor = selected ? activeColor : `${activeColor}cc`;
  const strokeWidth = selected ? 3 : isMv ? 2.5 : 2;
  const dashArray = isFault || isInvestigation ? '6 3' : undefined;
  const glowFilter = `drop-shadow(0 0 4px ${isMv ? 'rgba(244,114,182,0.4)' : cfg.glowColor})`;
  const dashAnimation = isFault
    ? 'dash-march 0.55s linear infinite'
    : isInvestigation
    ? 'dash-march-slow 1.2s linear infinite'
    : undefined;

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

      {/* Animated power-flow dot on operational cables */}
      {isOperational && (
        <circle r="4" fill={activeColor}
          style={{ filter: `drop-shadow(0 0 5px ${activeColor})` }}>
          <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {/* Cable label at bezier midpoint */}
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
              border: `1px solid ${selected ? activeColor : isMv ? 'rgba(244,114,182,0.40)' : cfg.borderColor}`,
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
