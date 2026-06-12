import os

site_layout_path = r'C:\Users\lukasz.klimowski\Documents\cinernet\lib\siteLayout.ts'

with open(site_layout_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to keep everything from the imports down to the FLOOR_BANDS map.
# Then replace computeBuildingCols and layoutNodes.

NEW_CONTENT = """import type {
  BuildingId,
  TopologyLayer,
  TopologyNodeInput,
  TopologyNode,
  TopologyEdgeInput,
  TopologyEdge,
} from '@/types/topology';
import { MAP_COLUMN_ORDER } from '@/data/buildings';

export const MAIN_HV_PANEL_LINEUP = {
  group: 'main-hv-panel' as const,
  cellCount: 11,
  cellSpacing: 108,
  bottomInset: 64,
  feederLift: 210,
  feederCells: {
    furnace10: 3,
    utility: 5,
    batchHouse: 7,
    furnace20: 9,
  } as const,
};

export interface FloorBandConfig {
  id: FloorBandId;
  label: string;
  elevLabel: string;
  yCenter: number;
  height: number;
}

export const FLOOR_BANDS: FloorBandConfig[] = [
  { id: 'elevated', label: 'Level +5 m',   elevLabel: 'Mezzanine \\u00b7 +5 m', yCenter:  240, height:  440 },
  { id: 'ground',   label: 'Ground floor', elevLabel: 'Ground \\u00b7 0 m',     yCenter: 1200, height: 1400 },
  { id: 'basement', label: 'Basement',     elevLabel: 'Basement \\u00b7 \u22123 m',  yCenter: 2150, height:  500 },
];

export type FloorBandId = 'elevated' | 'ground' | 'basement';

export const FLOOR_BAND_MAP = Object.fromEntries(
  FLOOR_BANDS.map((b) => [b.id, b])
) as Record<FloorBandId, FloorBandConfig>;

export interface BuildingColConfig {
  id: BuildingId;
  xCenter: number;
  width: number;
}

export function parseElevationM(str: string): number {
  const cleaned = str
    .replace('\u2212', '-')
    .replace(/\\s*m\\s*$/i, '')
    .replace(/^\\+/, '');
  return parseFloat(cleaned) || 0;
}

export function getFloorBandId(elevM: number): FloorBandId {
  if (elevM >= 3)    return 'elevated';
  if (elevM >= -0.5) return 'ground';
  return 'basement';
}

export type LayoutScope = 'overview' | BuildingId;

export function computeBuildingCols(
  visibleNodes: TopologyNodeInput[],
  edges?: TopologyEdgeInput[]
): BuildingColConfig[] {
  const physNodes = visibleNodes.filter((n) => n.mapScope !== 'building-detail');
  
  return MAP_COLUMN_ORDER.map((bid) => {
    const bNodes = physNodes.filter((n) => n.physicalLocation.building === bid);
    
    if (bNodes.length === 0) {
      return { id: bid as BuildingId, xCenter: 0, width: 300 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    for (const n of bNodes) {
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.x > maxX) maxX = n.position.x;
    }

    const PADDING = 100;
    const width = Math.max(300, (maxX - minX) + PADDING * 2);
    const xCenter = (minX + maxX) / 2;

    return { id: bid as BuildingId, xCenter, width };
  });
}

export function layoutNodes(
  nodes: TopologyNodeInput[],
  scope: LayoutScope = 'overview',
  buildingCols?: BuildingColConfig[],
  edges?: TopologyEdgeInput[]
): TopologyNode[] {
  return nodes.map((n) => {
    const { mapScope: _m, ...rest } = n;
    return rest as TopologyNode;
  });
}
"""

with open(site_layout_path, 'w', encoding='utf-8') as f:
    f.write(NEW_CONTENT)
