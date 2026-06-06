'use client';

import { BUILDINGS, MAP_COLUMN_ORDER } from '@/data/buildings';

interface BuildingColumnGuidesProps {
  visible: boolean;
}

/** Fixed column labels — not React Flow nodes (avoids overlap with assets) */
export function BuildingColumnGuides({ visible }: BuildingColumnGuidesProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      <div className="relative w-full h-full min-w-[1280px]">
        {MAP_COLUMN_ORDER.map((id, i) => {
          const cfg = BUILDINGS[id];
          const leftPct = [14, 50, 86][i];
          return (
            <div
              key={id}
              className="absolute top-0 bottom-0"
              style={{
                left: `${leftPct}%`,
                transform: 'translateX(-50%)',
                width: '28%',
              }}
            >
              <div
                className="absolute inset-0 rounded-xl mx-2"
                style={{
                  background: cfg.bgColor,
                  border: `1px solid ${cfg.borderColor}`,
                  opacity: 0.35,
                }}
              />
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
                style={{
                  background: 'rgba(10, 15, 26, 0.85)',
                  border: `1px solid ${cfg.borderColor}`,
                  color: cfg.color,
                }}
              >
                {cfg.shortLabel} — {cfg.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
