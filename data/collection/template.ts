/**
 * DATA COLLECTION TEMPLATE — Lommel partial site MVP
 *
 * Copy this file or fill in a spreadsheet matching these fields, then paste
 * into the matching file under data/installations/.
 *
 * Minimum per building for a demo branch:
 *   1× distribution cabinet
 *   1–2× junction boxes
 *   1–2× loads (motors or drives)
 *   cables linking each step
 *
 * Utility building additionally needs:
 *   MV incoming, MV switchgear, transformer, main LV panel
 *   + feeder cables to each remote building
 */

import type { SiteInstallation, TopologyEdgeInput, TopologyNodeInput } from '@/types/topology';

/** Example empty node — replace every FILL field */
export const EXAMPLE_NODE: TopologyNodeInput = {
  id: 'FILL-TAG', // e.g. DC-F10-01 — from site drawing / asset register
  name: 'FILL — readable name',
  assetType: 'cabinet', // mv-feed | mv-switchgear | transformer | panel | cabinet | junction-box | motor
  layer: 'cabinet', // mv-feed | mv-switchgear | transformer | lv-panel | cabinet | junction | load
  status: 'operational', // operational | investigation | fault
  layout: {
    building: 'furnace-10', // utility | furnace-10 | batch-house
    branchIndex: 0, // 0 = first column, 1 = second, etc.
  },
  physicalLocation: {
    building: 'furnace-10',
    zone: 'furnace-10-ground', // see LocationZone in types/topology.ts
    floor: 'Ground', // Basement B1 | Ground | Mezzanine | Roof
    elevation: '0 m', // −3 m | 0 m | +5 m | +12 m
    area: 'FILL — room / column / line reference',
    gridRef: 'FILL-GRID', // optional — column K-12, bay T1, etc.
  },
  specs: {
    voltage: '400V AC',
    current: 'FILL',
    power: 'FILL',
    manufacturer: 'FILL',
    location: 'FILL — free text',
  },
  externalRefs: {
    scadaTag: 'FILL.SCADATAG', // optional
    osapiensAssetId: 'FILL-OSAP', // optional
  },
  troubleshootingSteps: [
    { id: 'step-1', text: 'FILL — first check for technician' },
  ],
};

/** Example feeder between buildings */
export const EXAMPLE_FEEDER: TopologyEdgeInput = {
  id: 'PC-FEED-XX',
  name: 'Feeder Utility → FILL building',
  source: 'MDP-01',
  target: 'FILL-TARGET-CABINET',
  edgeType: 'power',
  status: 'operational',
  specs: {
    crossSection: '4×35 mm²',
    length: 'FILL m',
    voltage: '400V AC',
    installationType: 'FILL — tray / underground / riser',
  },
  route: {
    pathType: 'underground',
    spansBuildings: true,
    fromBuilding: 'utility',
    toBuilding: 'furnace-10',
  },
  troubleshootingSteps: [],
};

/** Empty installation shell */
export const EXAMPLE_INSTALLATION: SiteInstallation = {
  id: 'furnace-10',
  label: 'Furnace 10 Building',
  nodes: [],
  edges: [],
};

/**
 * CHECKLIST — what to gather from drawings / walkdown (per building):
 *
 * □ Asset tag (ID on drawing)
 * □ Asset type (transformer, panel, cabinet, JB, motor)
 * □ Physical: building, floor, elevation, area description
 * □ Upstream device (what feeds it)
 * □ Downstream devices (what it feeds)
 * □ Cable tag, length, cross-section (if known)
 * □ Breaker / fuse to check first (for troubleshooting steps)
 * □ SCADA tag (if available)
 * □ osapiens asset ID (if available)
 */
