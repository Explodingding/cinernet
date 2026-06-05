'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { TopologyNode, AssetType } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';

/* ── Asset SVG icons ── */
function AssetIcon({ type, color }: { type: AssetType; color: string }) {
  const s = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (type) {
    case 'transformer':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="12" r="5" {...s} />
          <circle cx="16" cy="12" r="5" {...s} />
          <line x1="1" y1="12" x2="3" y2="12" {...s} />
          <line x1="21" y1="12" x2="23" y2="12" {...s} />
        </svg>
      );
    case 'panel':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" {...s} />
          <line x1="3" y1="9" x2="21" y2="9" {...s} strokeWidth={1} />
          <line x1="12" y1="9" x2="12" y2="21" {...s} strokeWidth={1} />
          <circle cx="7.5" cy="6" r="1.2" fill={color} />
          <circle cx="12" cy="6" r="1.2" fill={color} />
          <circle cx="16.5" cy="6" r="1.2" fill={color} />
        </svg>
      );
    case 'cabinet':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="2" width="16" height="20" rx="2" {...s} />
          <line x1="12" y1="2" x2="12" y2="22" {...s} strokeWidth={0.8} strokeDasharray="2 2" />
          <circle cx="9.5" cy="12" r="1.5" fill={color} />
          <circle cx="14.5" cy="12" r="1.5" fill={color} />
          <line x1="4" y1="7" x2="20" y2="7" {...s} strokeWidth={0.8} />
        </svg>
      );
    case 'junction-box':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="7" width="14" height="10" rx="2" {...s} />
          <line x1="1" y1="10" x2="5.5" y2="10" {...s} />
          <line x1="1" y1="14" x2="5.5" y2="14" {...s} />
          <line x1="18.5" y1="10" x2="23" y2="10" {...s} />
          <line x1="18.5" y1="14" x2="23" y2="14" {...s} />
        </svg>
      );
    case 'motor':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" {...s} />
          <path d="M8 15 L8 9 L12 13.5 L16 9 L16 15" {...s} fill="none" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Node component ── */
export function DeviceNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TopologyNode;
  const cfg = STATUS_CONFIG[nodeData.status];

  const animation =
    nodeData.status === 'fault'
      ? 'fault-pulse 1.6s ease-in-out infinite'
      : nodeData.status === 'investigation'
      ? 'investigation-pulse 3s ease-in-out infinite'
      : 'none';

  const baseShadow = selected
    ? `0 0 0 2px ${cfg.color}60, 0 0 22px ${cfg.glowColor}, 0 4px 20px rgba(0,0,0,0.6)`
    : `0 0 8px ${cfg.glowColor}, 0 4px 16px rgba(0,0,0,0.5)`;

  return (
    <div
      style={{
        width: 196,
        minHeight: 88,
        background: 'rgba(10, 15, 26, 0.96)',
        border: `1.5px solid ${selected ? cfg.color : cfg.borderColor}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: baseShadow,
        animation,
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        touchAction: 'manipulation',
      }}
    >
      {/* Status bar at top */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${cfg.color} 0%, ${cfg.color}44 100%)`,
        }}
      />

      <div className="px-3 py-2.5">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1.5">
          <AssetIcon type={nodeData.assetType} color={cfg.color} />
          <span
            className="text-[11px] font-bold tracking-widest"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              color: cfg.color,
              textShadow: `0 0 8px ${cfg.color}80`,
            }}
          >
            {nodeData.id}
          </span>
        </div>

        {/* Node name */}
        <div className="text-[11px] font-medium text-slate-200 leading-snug mb-2">
          {nodeData.name}
        </div>

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{
            background: cfg.bgColor,
            border: `1px solid ${cfg.borderColor}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: cfg.color }}
          />
          <span
            className="text-[9px] font-semibold tracking-wider uppercase"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ left: -4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: -4 }}
      />
    </div>
  );
}
