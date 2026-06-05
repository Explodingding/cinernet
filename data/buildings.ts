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
    description: 'Central electrical hub — MV switchgear, transformers, main LV panels',
    role: 'Site power hub (between Furnace 10 & 20)',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  'furnace-10': {
    id: 'furnace-10',
    label: 'Furnace 10 Building',
    shortLabel: 'F10',
    description: 'Melting furnace hall — field distribution and process loads',
    role: 'Production furnace hall',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.06)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  'batch-house': {
    id: 'batch-house',
    label: 'Batch House',
    shortLabel: 'BH',
    description: 'Batch preparation — mixers, conveyors, dosing equipment',
    role: 'Raw material batch plant',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.06)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
};

export const SITE_BUILDING_ORDER: BuildingId[] = ['utility', 'furnace-10', 'batch-house'];
