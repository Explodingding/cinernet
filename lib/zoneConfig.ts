import type { AssetType, LocationZone, TopologyLayer } from '@/types/topology';

export interface ZoneConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const ZONE_CONFIG: Record<LocationZone, ZoneConfig> = {
  'basement-mv': {
    label: 'Basement — MV Switchgear',
    shortLabel: 'B1 MV',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.06)',
    borderColor: 'rgba(244, 114, 182, 0.25)',
  },
  substation: {
    label: 'Substation — Ground Level',
    shortLabel: 'SS',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.06)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  'hall-a-ground': {
    label: 'Hall A — Ground Floor',
    shortLabel: 'A0',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.06)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  'hall-a-mezzanine': {
    label: 'Hall A — Mezzanine (+5 m)',
    shortLabel: 'A+5',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.06)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  'hall-b-ground': {
    label: 'Hall B — Ground Floor',
    shortLabel: 'B0',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.06)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  'hall-c-ground': {
    label: 'Hall C — Ground Floor',
    shortLabel: 'C0',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.06)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
};

export const LAYER_LABELS: Record<TopologyLayer, string> = {
  'mv-feed': 'MV Incoming',
  'mv-switchgear': 'MV Switchgear Room',
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
  'mv-feed': { label: 'MV Feed', shortLabel: 'MV' },
  'mv-switchgear': { label: 'MV Switchgear', shortLabel: 'SW' },
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
};
