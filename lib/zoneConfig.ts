import type { AssetType, BuildingId, LocationZone, TopologyLayer } from '@/types/topology';

export interface ZoneConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  building: BuildingId;
}

export const ZONE_CONFIG: Record<LocationZone, ZoneConfig> = {
  'substation-hv': {
    label: 'Substation — HV (26 kV)',
    shortLabel: 'SUB HV',
    color: '#e879f9',
    bgColor: 'rgba(232, 121, 249, 0.06)',
    borderColor: 'rgba(232, 121, 249, 0.25)',
    building: 'substation',
  },
  'utility-basement-hv': {
    label: 'Utility — Basement HV (−3 m)',
    shortLabel: 'UTL B1',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.06)',
    borderColor: 'rgba(244, 114, 182, 0.25)',
    building: 'utility',
  },
  'utility-ground': {
    label: 'Utility — Ground Level',
    shortLabel: 'UTL G',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
    building: 'utility',
  },
  'furnace-10-ground': {
    label: 'Furnace 10 — Ground Floor',
    shortLabel: 'F10 G',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.06)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
    building: 'furnace-10',
  },
  'furnace-10-elevated': {
    label: 'Furnace 10 — Elevated (+5 m)',
    shortLabel: 'F10 +5',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.06)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    building: 'furnace-10',
  },
  'furnace-20-ground': {
    label: 'Furnace 20 — Ground Floor',
    shortLabel: 'F20 G',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    building: 'furnace-20',
  },
  'furnace-20-elevated': {
    label: 'Furnace 20 — Elevated (+5 m)',
    shortLabel: 'F20 +5',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.06)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
    building: 'furnace-20',
  },
  'batch-house-ground': {
    label: 'Batch House — Ground Floor',
    shortLabel: 'BH G',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.06)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
    building: 'batch-house',
  },
  'cullet-tower-ground': {
    label: 'Cullet Tower — Ground Floor',
    shortLabel: 'CT G',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.04)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
    building: 'cullet-tower',
  },
  'warehouse-ground': {
    label: 'Warehouse — Ground Floor',
    shortLabel: 'WH G',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.03)',
    borderColor: 'rgba(100, 116, 139, 0.1)',
    building: 'warehouse',
  },
};

export const LAYER_LABELS: Record<TopologyLayer, string> = {
  'hv-feed': 'HV Incoming (26 kV)',
  'hv-switchgear': 'HV Switchgear Room',
  transformer: 'Transformer',
  'lv-panel': 'LV Distribution Panel',
  cabinet: 'Distribution Cabinets',
  junction: 'Junction Boxes',
  load: 'Loads / Devices',
};

export interface AssetConfig {
  label: string;
  shortLabel: string;
}

export const ASSET_CONFIG: Record<AssetType, AssetConfig> = {
  'hv-feed': { label: 'HV Feed (26 kV)', shortLabel: 'HV' },
  'hv-switchgear': { label: 'HV Switchgear', shortLabel: 'SW' },
  transformer: { label: 'Transformer', shortLabel: 'TR' },
  panel: { label: 'Distribution Panel', shortLabel: 'MDP' },
  cabinet: { label: 'Dist. Cabinet', shortLabel: 'DC' },
  'junction-box': { label: 'Junction Box', shortLabel: 'JB' },
  motor: { label: 'Motor / Load', shortLabel: 'M' },
};

export const SPEC_LABELS: Record<string, string> = {
  voltage: 'Voltage',
  current: 'Max. current',
  power: 'Power',
  protection: 'IP rating',
  manufacturer: 'Manufacturer',
  location: 'Location',
  notes: 'Notes',
  crossSection: 'Cross-section',
  maxLoad: 'Max load',
  length: 'Length',
  installationType: 'Installation',
  floor: 'Floor',
  elevation: 'Elevation',
  area: 'Area / Zone',
  building: 'Building',
  gridRef: 'Grid reference',
};
