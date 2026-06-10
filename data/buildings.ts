import type { BuildingId } from '@/types/topology';

export interface BuildingConfig {
  id: BuildingId;
  label: string;
  shortLabel: string;
  description: string;
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
    role: 'Production furnace hall (Phase 1 — active)',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.06)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  'furnace-20': {
    id: 'furnace-20',
    label: 'Furnace 20 Building',
    shortLabel: 'F20',
    description: 'Melting furnace hall — TR-DP2.x PFC panels, F2-MDP distribution, SIPAC panels, process loads',
    role: 'Production furnace hall (Phase 2 — future scope)',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.04)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
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
  'cullet-tower': {
    id: 'cullet-tower',
    label: 'Cullet Tower',
    shortLabel: 'CT',
    description: 'Cullet return system — crushers, conveyors, screening equipment',
    role: 'Recycled glass (cullet) processing — grouped with Batch House',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.04)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  warehouse: {
    id: 'warehouse',
    label: 'Warehouse',
    shortLabel: 'WH',
    description: 'Site warehouse and ancillary services — placeholder, no electrical data yet',
    role: 'Logistics and storage — future scope',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.03)',
    borderColor: 'rgba(100, 116, 139, 0.1)',
  },
};

/**
 * Active building list (logical order — used for dropdowns / filters).
 *
 * HYPER-FOCUSED SCOPE (stakeholder pivot, June 2026): only the three core
 * facility areas are active.  Furnace-20 and Warehouse are frozen — their
 * BUILDINGS configs remain above (the BuildingId type requires all keys)
 * but they are excluded from every order list, so they never render.
 * The Cullet Tower is modelled as a subsystem INSIDE the Batch House block.
 */
export const SITE_BUILDING_ORDER: BuildingId[] = [
  'utility',
  'furnace-10',
  'batch-house',
];

/**
 * Physical left-to-right column order on the map canvas:
 *
 *   Furnace-10  |  Utility (centre)  |  Batch House + Cullet Tower
 *  ←Left                                                     Right→
 *
 * F10 is the active production hall — left wing.
 * Utility is the electrical spine — centre column.
 * Batch House (with the Cullet Tower subsystem inside its block) — right wing.
 */
export const MAP_COLUMN_ORDER: BuildingId[] = [
  'furnace-10',
  'utility',
  'batch-house',
];
