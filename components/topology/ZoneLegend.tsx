'use client';

import { BUILDINGS, MAP_COLUMN_ORDER } from '@/data/buildings';
import type { BuildingFilter } from '@/lib/topologyFilters';

interface ZoneLegendProps {
  buildingFilter: BuildingFilter;
}

export function ZoneLegend({ buildingFilter }: ZoneLegendProps) {
  const isOverview = buildingFilter === 'all';

  return (
    <div
      className="absolute left-3 bottom-3 z-10 pointer-events-none max-w-[240px]"
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
          Map legend
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5">
          {isOverview
            ? 'Three building columns · power flows upward'
            : `${BUILDINGS[buildingFilter].label} — detail view`}
        </div>
      </div>

      {isOverview && (
        <div className="px-3 py-2 flex flex-col gap-1.5 border-b border-white/5">
          {MAP_COLUMN_ORDER.map((id) => (
            <div key={id} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{
                  background: BUILDINGS[id].color,
                  boxShadow: `0 0 6px ${BUILDINGS[id].color}60`,
                }}
              />
              <span className="text-[10px] text-slate-400 leading-tight">
                {BUILDINGS[id].shortLabel} — {BUILDINGS[id].label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="px-3 py-2">
        <div className="text-[9px] text-slate-600 leading-relaxed">
          {isOverview
            ? 'Batch House terminal boxes collapse to one node here. Select Batch House to open the TB grid.'
            : 'Tap any asset or cable for specs, commissioning data, and troubleshooting steps.'}
        </div>
        <div className="mt-1.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-600">Click</span>
            <span className="text-[9px] text-slate-500">→ select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-600">Double-click</span>
            <span className="text-[9px] text-slate-500">→ open details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
