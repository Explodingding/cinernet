'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { TopologyNode, AssetType } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { ZONE_CONFIG, ASSET_CONFIG } from '@/lib/zoneConfig';

function AssetIcon({ type, color }: { type: AssetType; color: string }) {
  const s = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'mv-feed':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill={color} fillOpacity={0.2} {...s} />
        </svg>
      );
    case 'mv-switchgear':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" {...s} />
          <line x1="8" y1="5" x2="8" y2="19" {...s} strokeWidth={1} />
          <line x1="16" y1="5" x2="16" y2="19" {...s} strokeWidth={1} />
          <circle cx="5" cy="12" r="1.2" fill={color} />
          <circle cx="12" cy="12" r="1.2" fill={color} />
          <circle cx="19" cy="12" r="1.2" fill={color} />
        </svg>
      );
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
        </svg>
      );
    case 'junction-box':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="7" width="14" height="10" rx="2" {...s} />
          <line x1="12" y1="2" x2="12" y2="7" {...s} />
          <line x1="12" y1="17" x2="12" y2="22" {...s} />
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

export function DeviceNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TopologyNode & { compact?: boolean };
  const compact = Boolean(nodeData.compact);
  const cfg = STATUS_CONFIG[nodeData.status];
  const zoneCfg = ZONE_CONFIG[nodeData.physicalLocation.zone];

  const animation =
    nodeData.status === 'fault'
      ? 'fault-pulse 1.6s ease-in-out infinite'
      : nodeData.status === 'investigation'
        ? 'investigation-pulse 3s ease-in-out infinite'
        : 'none';

  const baseShadow = selected
    ? `0 0 0 2px ${cfg.color}60, 0 0 22px ${cfg.glowColor}, 0 4px 20px rgba(0,0,0,0.6)`
    : `0 0 8px ${cfg.glowColor}, 0 4px 16px rgba(0,0,0,0.5)`;

  const width = compact ? 148 : 176;
  const minHeight = compact ? 72 : 96;

  return (
    <div
      className="flex"
      style={{
        width,
        minHeight,
        animation,
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
    >
      <div
        className="shrink-0 rounded-l-[10px]"
        style={{
          width: compact ? 4 : 5,
          background: `linear-gradient(to bottom, ${zoneCfg.color}, ${zoneCfg.color}44)`,
          boxShadow: `0 0 8px ${zoneCfg.color}40`,
        }}
      />

      <div
        className="flex-1 rounded-r-[10px] overflow-hidden"
        style={{
          background: 'rgba(10, 15, 26, 0.96)',
          border: `1.5px solid ${selected ? cfg.color : cfg.borderColor}`,
          borderLeft: 'none',
          boxShadow: baseShadow,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${cfg.color} 0%, ${cfg.color}44 100%)`,
          }}
        />

        <div className={compact ? 'px-2 py-1.5' : 'px-2.5 py-2'}>
          <div className="flex items-center gap-1.5 mb-0.5">
            {!compact && <AssetIcon type={nodeData.assetType} color={cfg.color} />}
            <span
              className="text-[11px] font-bold tracking-widest truncate"
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                color: cfg.color,
                fontSize: compact ? 10 : 11,
              }}
            >
              {nodeData.id}
            </span>
          </div>

          {!compact && (
            <div className="text-[10px] font-medium text-slate-200 leading-snug mb-1.5 line-clamp-2">
              {nodeData.name}
            </div>
          )}

          {!compact && (
            <div
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold mb-1.5"
              style={{
                background: zoneCfg.bgColor,
                border: `1px solid ${zoneCfg.borderColor}`,
                color: zoneCfg.color,
              }}
            >
              {nodeData.physicalLocation.elevation} · {nodeData.physicalLocation.floor}
            </div>
          )}

          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{
              background: cfg.bgColor,
              border: `1px solid ${cfg.borderColor}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
            <span
              className="text-[9px] font-semibold tracking-wider uppercase"
              style={{ color: cfg.color, fontSize: compact ? 8 : 9 }}
            >
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Bottom} style={{ bottom: -4 }} />
      <Handle type="source" position={Position.Top} style={{ top: -4 }} />
    </div>
  );
}
