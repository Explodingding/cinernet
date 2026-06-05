'use client';

import { ZONE_CONFIG } from '@/lib/zoneConfig';
import type { LocationZone } from '@/types/topology';

const LEGEND_ZONES: LocationZone[] = [
  'basement-mv',
  'substation',
  'hall-a-ground',
  'hall-a-mezzanine',
  'hall-b-ground',
  'hall-c-ground',
];

export function ZoneLegend() {
  return (
    <div
      className="absolute left-3 bottom-3 z-10 pointer-events-none max-w-[200px]"
      style={{
        background: 'rgba(10, 15, 26, 0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="px-3 py-2 border-b border-white/5">
        <div className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
          Physical zones
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5">Floor · elevation · area</div>
      </div>
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {LEGEND_ZONES.map((zone) => {
          const cfg = ZONE_CONFIG[zone];
          return (
            <div key={zone} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
              />
              <span className="text-[10px] text-slate-400 leading-tight">{cfg.label}</span>
            </div>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-white/5">
        <div className="text-[9px] text-slate-600">
          ↑ Power flow · tree grows upward from MV root
        </div>
      </div>
    </div>
  );
}
