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

/** Choose which wall each node's cable exits/enters based on relative positions */
function computeAttachments(
  sx: number, sy: number, sw: number, sh: number,
  tx: number, ty: number, tw: number, th: number
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

  if (adx > ady * 1.4) {
    // Primarily horizontal — exit/enter from side walls
    srcSide = dx > 0 ? 'right' : 'left';
    tgtSide = dx > 0 ? 'left' : 'right';
  } else if (ady > adx * 1.4) {
    // Primarily vertical — exit/enter from top/bottom
    srcSide = dy > 0 ? 'bottom' : 'top';
    tgtSide = dy > 0 ? 'top' : 'bottom';
  } else {
    // Diagonal (cross-building + cross-floor) — exit from side, enter from top/bottom
    srcSide = dx > 0 ? 'right' : 'left';
    tgtSide = dy > 0 ? 'top' : 'bottom';
  }

  const wallPoint = (nx: number, ny: number, nw: number, nh: number, side: Side): AttachPoint => {
    switch (side) {
      case 'left':   return { x: nx,        y: ny + nh / 2, side };
      case 'right':  return { x: nx + nw,   y: ny + nh / 2, side };
      case 'top':    return { x: nx + nw / 2, y: ny,        side };
      case 'bottom': return { x: nx + nw / 2, y: ny + nh,   side };
    }
  };

  return {
    src: wallPoint(sx, sy, sw, sh, srcSide),
    tgt: wallPoint(tx, ty, tw, th, tgtSide),
  };
}

/** Build a cubic bezier SVG path whose control points respect the exit/entry directions */
function buildBezierPath(
  sx: number, sy: number, srcSide: Side,
  tx: number, ty: number, tgtSide: Side
): { d: string; labelX: number; labelY: number } {
  const dist = Math.hypot(tx - sx, ty - sy);
  const offset = Math.max(60, Math.min(260, dist * 0.42));

  const ctrl = (x: number, y: number, side: Side, off: number) => {
    switch (side) {
      case 'right':  return [x + off, y] as const;
      case 'left':   return [x - off, y] as const;
      case 'bottom': return [x, y + off] as const;
      case 'top':    return [x, y - off] as const;
    }
  };

  const [c1x, c1y] = ctrl(sx, sy, srcSide, offset);
  const [c2x, c2y] = ctrl(tx, ty, tgtSide, offset);

  // Bezier midpoint at t=0.5: B(0.5) = (P0 + 3P1 + 3P2 + P3) / 8
  const labelX = (sx + 3 * c1x + 3 * c2x + tx) / 8;
  const labelY = (sy + 3 * c1y + 3 * c2y + ty) / 8;

  return {
    d: `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`,
    labelX,
    labelY,
  };
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
    const { src, tgt } = computeAttachments(sp.x, sp.y, sw, sh, tp.x, tp.y, tw, th);
    const built = buildBezierPath(src.x, src.y, src.side, tgt.x, tgt.y, tgt.side);
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
