import type { BuildingId } from '@/types/topology';

export interface BuildingConfig {
  id: BuildingId;
  label: string;
  shortLabel: string;
  description: string;
  /** Approximate role on site */
  role: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const BUILDINGS: Record<BuildingId, BuildingConfig> = {
  utility: {
    id: 'utility',
    label: 'Utility Building',
    shortLabel: 'UTL',
    description: 'Central electrical hub — 35 kV MV switchgear, transformers, main LV panels, 4× generators',
    role: 'Site power hub — houses MAIN MV, F10 MV and F20 MV panels',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  'furnace-10': {
    id: 'furnace-10',
    label: 'Furnace 10 Building',
    shortLabel: 'F10',
    description: 'Melting furnace hall — TR-DP1.x PFC panels, F1-MDP distribution, process loads up to +42 m',
    role: 'Production furnace hall (Phase 1)',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.06)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  'furnace-20': {
    id: 'furnace-20',
    label: 'Furnace 20 Building',
    shortLabel: 'F20',
    description: 'Melting furnace hall — TR-DP2.x PFC panels, F2-MDP distribution, SIPAC panels, process loads',
    role: 'Production furnace hall (Phase 2)',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  'batch-house': {
    id: 'batch-house',
    label: 'Batch House',
    shortLabel: 'BH',
    description: 'Batch preparation — BH-MDP, BH-UDP, mixers, conveyors, dosing equipment',
    role: 'Raw material batch plant',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.06)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
};

export const SITE_BUILDING_ORDER: BuildingId[] = ['utility', 'furnace-10', 'furnace-20', 'batch-house'];

/** Left-to-right column order on the map canvas: F10 | Utility | F20 | Batch House */
export const MAP_COLUMN_ORDER: BuildingId[] = ['furnace-10', 'utility', 'furnace-20', 'batch-house'];
