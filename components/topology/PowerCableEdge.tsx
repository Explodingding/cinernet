'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { TopologyEdge } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';

export function PowerCableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as TopologyEdge;
  const cfg = STATUS_CONFIG[edgeData?.status ?? 'operational'];
  const isMv = edgeData?.edgeType === 'mv';
  const mvColor = '#f472b6';
  const activeColor = isMv ? mvColor : cfg.color;
  const isOperational = edgeData?.status === 'operational';
  const isFault = edgeData?.status === 'fault';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const pathId = `flow-path-${id}`;
  const strokeColor = selected ? activeColor : activeColor + 'cc';
  const strokeWidth = selected ? 3 : isMv ? 2.5 : 2;
  const dashArray = isOperational && !isMv ? undefined : isOperational && isMv ? undefined : '6 3';
  const filterStyle = `drop-shadow(0 0 4px ${isMv ? 'rgba(244,114,182,0.4)' : cfg.glowColor})`;

  const dashAnimation = isFault
    ? 'dash-march 0.55s linear infinite'
    : edgeData?.status === 'investigation'
    ? 'dash-march-slow 1.2s linear infinite'
    : undefined;

  return (
    <>
      {/* Wider invisible hit area */}
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={28}
        fill="none"
        className="react-flow__edge-interaction"
      />

      {/* Glow layer for selected */}
      {selected && (
        <path
          d={edgePath}
          stroke={activeColor}
          strokeWidth={6}
          fill="none"
          style={{ filter: `blur(3px)`, opacity: 0.4 }}
        />
      )}

      {/* Main path */}
      <path
        id={pathId}
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        fill="none"
        style={{
          filter: filterStyle,
          animation: dashAnimation,
        }}
      />

      {/* Animated energy dot for operational edges */}
      {isOperational && (
        <circle
          r="4"
          fill={activeColor}
          style={{ filter: `drop-shadow(0 0 5px ${activeColor})` }}
        >
          <animateMotion
            dur="2.2s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {/* Edge label */}
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
            className="px-2 py-1.5 min-h-[36px] min-w-[48px] flex items-center justify-center rounded text-[9px] font-bold tracking-wider cursor-pointer select-none"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              background: selected
                ? `rgba(10, 15, 26, 0.98)`
                : 'rgba(10, 15, 26, 0.85)',
              color: activeColor,
              border: `1px solid ${selected ? activeColor : isMv ? 'rgba(244,114,182,0.45)' : cfg.borderColor}`,
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
