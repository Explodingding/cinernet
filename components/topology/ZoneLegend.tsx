'use client';

import { ZONE_CONFIG } from '@/lib/zoneConfig';
import { BUILDINGS, SITE_BUILDING_ORDER } from '@/data/buildings';
import type { LocationZone } from '@/types/topology';

const LEGEND_ZONES: LocationZone[] = [
  'utility-basement-mv',
  'utility-ground',
  'furnace-10-ground',
  'furnace-10-elevated',
  'batch-house-ground',
];

export function ZoneLegend() {
  return (
    <div
      className="absolute left-3 bottom-3 z-10 pointer-events-none max-w-[220px]"
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
          Buildings & zones
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5">Stripe colour = physical location</div>
      </div>
      <div className="px-3 py-2 flex flex-col gap-1.5 border-b border-white/5">
        {SITE_BUILDING_ORDER.map((id) => (
          <div key={id} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{
                background: BUILDINGS[id].color,
                boxShadow: `0 0 6px ${BUILDINGS[id].color}60`,
              }}
            />
            <span className="text-[10px] text-slate-400 leading-tight">{BUILDINGS[id].label}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {LEGEND_ZONES.map((zone) => {
          const cfg = ZONE_CONFIG[zone];
          return (
            <div key={zone} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0 opacity-70"
                style={{ background: cfg.color }}
              />
              <span className="text-[9px] text-slate-500 leading-tight">{cfg.shortLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-white/5">
        <div className="text-[9px] text-slate-600">
          ↑ Power flow · Utility hub at centre bottom
        </div>
      </div>
    </div>
  );
}
