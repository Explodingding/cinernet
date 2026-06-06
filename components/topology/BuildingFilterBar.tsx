'use client';

import { BUILDINGS, SITE_BUILDING_ORDER } from '@/data/buildings';
import type { BuildingId } from '@/types/topology';
import type { BuildingFilter } from '@/lib/topologyFilters';

export type { BuildingFilter };

interface BuildingFilterBarProps {
  activeBuilding: BuildingFilter;
  onBuildingChange: (building: BuildingFilter) => void;
}

export function BuildingFilterBar({
  activeBuilding,
  onBuildingChange,
}: BuildingFilterBarProps) {
  const filters: { id: BuildingFilter; label: string; color?: string }[] = [
    { id: 'all', label: 'Full site', color: '#64748b' },
    ...SITE_BUILDING_ORDER.map((id) => ({
      id,
      label: BUILDINGS[id].shortLabel,
      color: BUILDINGS[id].color,
    })),
  ];

  return (
    <div
      className="flex items-center gap-2 px-3 md:px-5 py-2 shrink-0 overflow-x-auto min-h-[44px]"
      style={{
        background: 'rgba(8, 13, 22, 0.75)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mr-1 shrink-0">
        Building:
      </span>

      {filters.map((f) => {
        const isActive = activeBuilding === f.id;
        const cfg = f.id !== 'all' ? BUILDINGS[f.id as BuildingId] : null;
        return (
          <button
            key={f.id}
            onClick={() => onBuildingChange(f.id)}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-full text-[11px] font-semibold transition-all duration-150 shrink-0"
            style={{
              background: isActive
                ? `rgba(${f.color ? hexToRgb(f.color) : '100,116,139'}, 0.15)`
                : 'rgba(30, 41, 59, 0.5)',
              border: isActive
                ? `1px solid ${f.color ?? '#64748b'}`
                : '1px solid rgba(255,255,255,0.06)',
              color: isActive ? (f.color ?? '#e2e8f0') : '#64748b',
            }}
            title={cfg?.description ?? 'Show all three buildings'}
          >
            {f.id !== 'all' && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: f.color ?? '#64748b' }}
              />
            )}
            {f.id === 'all' ? f.label : BUILDINGS[f.id as BuildingId].label}
          </button>
        );
      })}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
