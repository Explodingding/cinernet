'use client';

import type { NodeProps } from '@xyflow/react';
import { BUILDINGS } from '@/data/buildings';
import type { BuildingId } from '@/types/topology';
import type { FloorBandId, FloorBandConfig, BuildingColConfig } from '@/lib/siteLayout';
import { FLOOR_BANDS } from '@/lib/siteLayout';

export interface BackgroundCellData {
  buildingId: BuildingId;
  floorBandId: FloorBandId;
  width: number;
  height: number;
  /** Show building label — true for the topmost occupied cell in each column */
  showBuildingLabel: boolean;
  /** Show floor label — true for the leftmost building column */
  showFloorLabel: boolean;
}

// After the SLD Y-flip (basement = top of canvas, elevated = bottom), the
// "topmost" band on screen is the one with the SMALLEST yCenter:
//   basement (yCenter≈220)  <  ground (yCenter≈1320)  <  elevated (yCenter≈2640)
//
// The building label is rendered inside the topmost OCCUPIED band for each
// building column.  Utility is the only building with basement nodes
// (DISTRIB-BLDG), so it shows its label in the basement stripe.
// All other buildings start at the ground stripe.
const BUILDING_TOP_BAND: Record<BuildingId, FloorBandId> = {
  'furnace-10':   'ground',    // F10 starts at ground (no basement nodes)
  utility:        'basement',  // Utility has DISTRIB-BLDG at −8 m → topmost stripe
  'furnace-20':   'ground',    // F20 starts at ground
  'batch-house':  'ground',    // BH has no basement nodes
  'cullet-tower': 'ground',    // Cullet Tower — future scope
  warehouse:      'ground',    // Warehouse — placeholder
};

/**
 * Build background grid cells for all building × floor-band combinations.
 * Pass the result of `computeBuildingCols(allNodes)` from siteLayout so the
 * background stripes always match the actual node layout.
 */
export function buildBackgroundCells(cols: BuildingColConfig[]) {
  const leftmostBuildingId = cols[0]?.id;

  return cols.flatMap((col: BuildingColConfig) =>
    FLOOR_BANDS.map((band: FloorBandConfig) => ({
      id: `__bg-${col.id}-${band.id}`,
      type: 'backgroundCell',
      position: {
        x: col.xCenter - col.width / 2,
        y: band.yCenter - band.height / 2,
      },
      data: {
        buildingId: col.id,
        floorBandId: band.id,
        width: col.width,
        height: band.height,
        showBuildingLabel: BUILDING_TOP_BAND[col.id] === band.id,
        showFloorLabel: col.id === leftmostBuildingId,
      } satisfies BackgroundCellData,
      selectable: false,
      draggable: false,
      focusable: false,
      zIndex: -2,
    }))
  );
}

export function BackgroundCellNode({ data }: NodeProps) {
  const cellData = data as unknown as BackgroundCellData;
  const { buildingId, floorBandId, width, height, showBuildingLabel, showFloorLabel } = cellData;

  const building = BUILDINGS[buildingId];
  const band = FLOOR_BANDS.find((b) => b.id === floorBandId)!;

  const isBasement = floorBandId === 'basement';
  const bgOpacity = isBasement ? 0.07 : 0.04;
  const borderOpacity = isBasement ? 0.18 : 0.12;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        background: `rgba(${hexToRgb(building.color)}, ${bgOpacity})`,
        border: `1px solid rgba(${hexToRgb(building.color)}, ${borderOpacity})`,
        borderRadius: 12,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      {/* Building column label — top of topmost band */}
      {showBuildingLabel && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            background: 'rgba(10, 15, 26, 0.88)',
            border: `1px solid ${building.borderColor}`,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: building.color,
          }}
        >
          {building.shortLabel} — {building.label}
        </div>
      )}

      {/* Floor / elevation label — left edge of leftmost column */}
      {showFloorLabel && (
        <div
          style={{
            position: 'absolute',
            left: -106,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 100,
            textAlign: 'right',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(148,163,184,0.7)',
            }}
          >
            {band.label}
          </div>
          <div
            style={{
              fontSize: 8,
              color: 'rgba(100,116,139,0.6)',
              marginTop: 2,
            }}
          >
            {band.elevLabel}
          </div>
        </div>
      )}

      {/* Right edge rule */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: 1,
          background: `linear-gradient(to bottom, transparent, rgba(${hexToRgb(building.color)}, 0.2), transparent)`,
          borderRadius: 1,
        }}
      />
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
