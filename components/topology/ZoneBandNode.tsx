'use client';

import type { NodeProps } from '@xyflow/react';
import type { TopologyZone } from '@/types/topology';
import { ZONE_CONFIG } from '@/lib/zoneConfig';

export function ZoneBandNode({ data }: NodeProps) {
  const zoneData = data as unknown as TopologyZone;
  const cfg = ZONE_CONFIG[zoneData.zone];

  return (
    <div
      className="pointer-events-none select-none"
      style={{
        width: zoneData.width,
        height: zoneData.height,
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: 12,
        boxShadow: `inset 0 0 40px ${cfg.bgColor}`,
      }}
    >
      <div className="flex items-start justify-between px-4 py-2 h-full">
        <div>
          <div
            className="text-[9px] font-bold tracking-widest uppercase mb-0.5"
            style={{ color: cfg.color, fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            {zoneData.layerLabel}
          </div>
          <div className="text-[10px] text-slate-500">{zoneData.label}</div>
        </div>
        <div
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: cfg.bgColor,
            border: `1px solid ${cfg.borderColor}`,
            color: cfg.color,
          }}
        >
          {cfg.shortLabel}
        </div>
      </div>
    </div>
  );
}
