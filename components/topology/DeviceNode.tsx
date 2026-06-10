'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { TopologyNode, AssetType } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { ZONE_CONFIG, ASSET_CONFIG } from '@/lib/zoneConfig';
import type { DerivedStatus } from '@/lib/faultCascade';

function AssetIcon({ type, color }: { type: AssetType; color: string }) {
  const s = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'hv-feed':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill={color} fillOpacity={0.2} {...s} />
        </svg>
      );
    case 'hv-switchgear':
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

// ─── Subsystem colour palette ─────────────────────────────────────────────────
const SUBSYSTEM_ACCENT: Record<string, { color: string; label: string }> = {
  hv:        { color: '#f59e0b', label: '26 kV' },
  'lv-400v': { color: '#22d3ee', label: '400 V' },
  'lv-6kv':  { color: '#a78bfa', label: '6 kV' },
  'lv-boost':{ color: '#e879f9', label: 'Boost' },
  generator: { color: '#fb923c', label: 'GEN' },
};

/** Derive a short output-voltage label for transformer cards */
function transformerVoltageLabel(subsystem?: string): string | null {
  if (!subsystem) return null;
  if (subsystem === 'lv-400v') return '26 → 400 V';
  if (subsystem === 'lv-6kv')  return '26 → 6 kV';
  if (subsystem === 'lv-boost') return '26 → Boost';
  return null;
}

export function DeviceNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TopologyNode & {
    compact?: boolean;
    highlighted?: boolean;
    opened?: boolean;
    derivedStatus?: DerivedStatus | null;
    subsystem?: string;
  };
  const compact = Boolean(nodeData.compact);
  const derivedStatus = nodeData.derivedStatus ?? null;
  const cfg = STATUS_CONFIG[nodeData.status];
  const zoneCfg = ZONE_CONFIG[nodeData.physicalLocation.zone];

  // Subsystem accent — overrides zone colour for left bar when present
  const subsysAccent = nodeData.subsystem
    ? (SUBSYSTEM_ACCENT[nodeData.subsystem] ?? null)
    : nodeData.layer === 'hv-feed' || nodeData.layer === 'hv-switchgear'
      ? SUBSYSTEM_ACCENT['hv']
      : null;
  const accentColor = subsysAccent?.color ?? zoneCfg.color;

  // Voltage label shown inside transformer cards
  const voltageLabel = nodeData.layer === 'transformer'
    ? transformerVoltageLabel(nodeData.subsystem)
    : null;

  // Derived status colours — derived-fault gets a stronger red so the cascade
  // path stands out clearly even on dark backgrounds.
  const derivedColor = derivedStatus === 'derived-fault' ? '#f87171' : '#fbbf24';

  const animation =
    nodeData.status === 'fault'
      ? 'fault-pulse 1.6s ease-in-out infinite'
      : nodeData.status === 'investigation'
        ? 'investigation-pulse 3s ease-in-out infinite'
        : derivedStatus === 'derived-fault'
          ? 'investigation-pulse 2.2s ease-in-out infinite'
          : 'none';

  const baseShadow = selected
    ? `0 0 0 2px ${cfg.color}60, 0 0 22px ${cfg.glowColor}, 0 4px 20px rgba(0,0,0,0.6)`
    : derivedStatus === 'derived-fault'
      ? `0 0 0 1.5px #f8717155, 0 0 18px rgba(248,113,113,0.30), 0 4px 16px rgba(0,0,0,0.5)`
      : derivedStatus === 'derived-investigation'
        ? `0 0 0 1.5px #fbbf2430, 0 0 10px rgba(251,191,36,0.15), 0 4px 16px rgba(0,0,0,0.5)`
        : `0 0 8px ${cfg.glowColor}30, 0 4px 16px rgba(0,0,0,0.5)`;

  const borderColor = selected
    ? cfg.color
    : derivedStatus === 'derived-fault'
      ? '#f8717155'
      : derivedStatus === 'derived-investigation'
        ? '#fbbf2430'
        : cfg.borderColor;

  const circuitCount = (nodeData as unknown as { circuitCount?: number }).circuitCount;
  const showCircuitBadge =
    circuitCount !== undefined && circuitCount > 0 &&
    ['lv-panel', 'cabinet'].includes(nodeData.layer);
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
          background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}44)`,
          boxShadow: `0 0 8px ${accentColor}40`,
        }}
      />

      <div
        className="flex-1 rounded-r-[10px] overflow-hidden"
        style={{
          background: 'rgba(10, 15, 26, 0.96)',
          border: `1.5px solid ${borderColor}`,
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
              className="font-bold tracking-widest truncate flex-1"
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                color: cfg.color,
                fontSize: compact ? 10 : 11,
              }}
            >
              {nodeData.id}
            </span>
            {subsysAccent && (
              <span
                className="shrink-0 rounded px-1 text-[7px] font-bold tracking-widest"
                style={{
                  background: `${accentColor}18`,
                  border: `1px solid ${accentColor}35`,
                  color: accentColor,
                  fontFamily: 'var(--font-jetbrains-mono)',
                }}
              >
                {subsysAccent.label}
              </span>
            )}
          </div>

          {!compact && (
            <div className="text-[10px] font-medium text-slate-200 leading-snug mb-1.5 line-clamp-2">
              {nodeData.name}
            </div>
          )}

          {!compact && (
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <div
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold"
                style={{
                  background: zoneCfg.bgColor,
                  border: `1px solid ${zoneCfg.borderColor}`,
                  color: zoneCfg.color,
                }}
              >
                {nodeData.physicalLocation.elevation} · {nodeData.physicalLocation.floor}
              </div>
              {voltageLabel && (
                <div
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide"
                  style={{
                    background: `${accentColor}14`,
                    border: `1px solid ${accentColor}40`,
                    color: accentColor,
                    fontFamily: 'var(--font-jetbrains-mono)',
                  }}
                >
                  {voltageLabel}
                </div>
              )}
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

          {/* Circuit-count badge — shown when downstream nodes are hidden at current tier */}
          {showCircuitBadge && !compact && (
            <div
              className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider"
              style={{
                background: 'rgba(148,163,184,0.07)',
                border: '1px solid rgba(148,163,184,0.15)',
                color: '#64748b',
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {circuitCount} circuits
            </div>
          )}

          {/* Derived fault indicator — upstream fault is propagating here */}
          {derivedStatus && !compact && (
            <div
              className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider"
              style={{
                background: derivedStatus === 'derived-fault'
                  ? 'rgba(248,113,113,0.07)'
                  : 'rgba(251,191,36,0.07)',
                border: `1px solid ${derivedStatus === 'derived-fault' ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'}`,
                color: derivedStatus === 'derived-fault' ? '#fca5a5' : '#fde68a',
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              upstream {derivedStatus === 'derived-fault' ? 'fault' : 'issue'}
            </div>
          )}
        </div>
      </div>

      {/* All four walls registered so React Flow resolves edge endpoints;
          visual path is overridden in PowerCableEdge via useInternalNode */}
      <Handle type="target" position={Position.Top}    id="t-top"    style={{ top: -4,     opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="t-bottom" style={{ bottom: -4,  opacity: 0 }} />
      <Handle type="target" position={Position.Left}   id="t-left"   style={{ left: -4,    opacity: 0 }} />
      <Handle type="target" position={Position.Right}  id="t-right"  style={{ right: -4,   opacity: 0 }} />
      <Handle type="source" position={Position.Top}    id="s-top"    style={{ top: -4,     opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ bottom: -4,  opacity: 0 }} />
      <Handle type="source" position={Position.Left}   id="s-left"   style={{ left: -4,    opacity: 0 }} />
      <Handle type="source" position={Position.Right}  id="s-right"  style={{ right: -4,   opacity: 0 }} />
    </div>
  );
}
