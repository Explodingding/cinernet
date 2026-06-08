import type { TopologyZone } from '@/types/topology';

/**
 * Background bands drawn on the canvas — one per electrical hierarchy layer.
 * Width extended to cover all 4 building columns:
 *   F10 (xCenter=300) | Utility (xCenter=820) | F20 (xCenter=1370) | Batch House (xCenter=1870)
 *   Total canvas span ~2200 px.
 */
export const topologyZones: TopologyZone[] = [
  {
    id: 'band-mv-feed',
    zone: 'utility-basement-mv',
    label: 'Utility Building — 35 kV incoming (Fluvius)',
    layerLabel: 'MV Feed — Grid',
    position: { x: -20, y: 800 },
    width: 2200,
    height: 110,
  },
  {
    id: 'band-mv-sw',
    zone: 'utility-basement-mv',
    label: 'Utility — 35 kV MV switchgear (MAIN MV / F10 MV / F20 MV panels)',
    layerLabel: 'MV Switchgear',
    position: { x: -20, y: 660 },
    width: 2200,
    height: 110,
  },
  {
    id: 'band-transformer',
    zone: 'utility-ground',
    label: 'Utility — transformer bays (TR1.x / TR2.x / TR-COMP, 35/0.4 kV)',
    layerLabel: 'Transformer',
    position: { x: -20, y: 520 },
    width: 2200,
    height: 110,
  },
  {
    id: 'band-lv-panel',
    zone: 'utility-ground',
    label: 'LV distribution panels — TR-DP PFC, UT-MDP, BH-MDP (400 V)',
    layerLabel: 'LV Distribution Panel',
    position: { x: -20, y: 380 },
    width: 2200,
    height: 110,
  },
  {
    id: 'band-cabinets',
    zone: 'furnace-10-ground',
    label: 'Furnace 10 · Furnace 20 · Batch House — field distribution cabinets',
    layerLabel: 'Distribution Cabinets',
    position: { x: -20, y: 220 },
    width: 2200,
    height: 110,
  },
  {
    id: 'band-junction',
    zone: 'furnace-10-ground',
    label: 'Field junction boxes — by building & elevation',
    layerLabel: 'Junction Boxes',
    position: { x: -20, y: 60 },
    width: 2200,
    height: 110,
  },
  {
    id: 'band-loads',
    zone: 'batch-house-ground',
    label: 'Motors, generators & loads — end devices',
    layerLabel: 'Loads / Devices',
    position: { x: -20, y: -100 },
    width: 2200,
    height: 110,
  },
];
