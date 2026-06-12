import type { SiteInstallation, TopologyNodeInput } from '@/types/topology';
import importedTb from '../imported/batch-house-terminal-boxes.json';

const importedNodes = importedTb.nodes as TopologyNodeInput[];

/**
 * Batch House + Cullet Tower — combined process-peripheral block.
 *
 * The Cullet Tower is modelled as a SUBSYSTEM inside the batch-house building
 * block (physicalLocation.building = 'batch-house', area = Cullet Tower):
 * one distribution cabinet (CT-DC-01, Tier 2) fed from DC-BH-01, plus its
 * crusher/conveyor loads (Tier 3).  The crusher runs a power + PLC parallel
 * pair in the same tray — rendered as separated parallel lanes.
 *
 * Terminal boxes come from the CSV import; full-site view shows a summary
 * node, the Batch House building filter expands the TB grid.
 */
export const batchHouseInstallation: SiteInstallation = {
  id: 'batch-house',
  label: 'Batch House + Cullet Tower',
  nodes: [
    {
      id: 'DC-BH-01',
    position: { x: 0, y: 0 },
      name: 'Distribution Cabinet BH-01',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      physicalLocation: {
        building: 'batch-house',
        zone: 'batch-house-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Batch hall — main LV feed',
        gridRef: 'BH-DC-01',
      },
      specs: { voltage: '400V AC', current: '250 A', manufacturer: 'Rittal' },
      troubleshootingSteps: [
        { id: 'dcbh1',
    position: { x: 0, y: 0 }, text: 'Check breaker Q1 (ON).' },
        { id: 'dcbh2',
    position: { x: 0, y: 0 }, text: 'Measure output bus: 400 V ±2%.' },
      ],
    },
    {
      id: 'BH-TB-SUMMARY',
    position: { x: 0, y: 0 },
      name: '20 terminal boxes',
      assetType: 'junction-box',
      layer: 'junction',
      status: 'investigation',
      mapScope: 'overview-only',
      physicalLocation: {
        building: 'batch-house',
        zone: 'batch-house-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Batch House — field terminal boxes',
        gridRef: 'BH-TB-ALL',
      },
      specs: {
        notes: `${importedTb.meta.terminalBoxCount} TBs imported — select Batch House to expand grid`,
      },
      troubleshootingSteps: [
        {
          id: 'bh-tb-hint',
    position: { x: 0, y: 0 },
          text: 'Use the Batch House filter above to view individual terminal boxes.',
        },
      ],
    },
    // ── Cullet Tower subsystem (inside the Batch House block) ────────────────
    {
      id: 'CT-DC-01',
    position: { x: 0, y: 0 },
      name: 'Cullet Tower Distribution Cabinet',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 6,
      physicalLocation: {
        building: 'batch-house',
        zone: 'cullet-tower-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Cullet Tower — ground level switchroom',
        gridRef: 'CT-DC-01',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        current: '160 A',
        manufacturer: 'Rittal',
        notes: 'IP54 — dusty environment (cullet handling). Sub-distribution fed from DC-BH-01.',
      },
      troubleshootingSteps: [
        { id: 'ctdc-1',
    position: { x: 0, y: 0 }, text: 'Check incoming MCCB from DC-BH-01 — ON/OFF/TRIP.' },
        { id: 'ctdc-2',
    position: { x: 0, y: 0 }, text: 'Inspect cabinet filters — cullet dust ingress blocks ventilation.' },
      ],
    },
    {
      id: 'CT-CRUSHER-1',
    position: { x: 0, y: 0 },
      name: 'Cullet Crusher — CR-CT-01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      physicalLocation: {
        building: 'batch-house',
        zone: 'cullet-tower-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Cullet Tower — crusher level',
        gridRef: 'CR-CT-01',
      },
      specs: {
        voltage: '400 V',
        power: '45 kW',
        current: '85 A',
        protection: 'IP55',
        manufacturer: 'Siemens',
        notes: 'Cullet crusher main drive — soft-start. High inertia load; check start sequence on trip.',
      },
      troubleshootingSteps: [
        { id: 'ctcr-1',
    position: { x: 0, y: 0 }, text: 'Check soft-starter fault LED and thermal overload relay.' },
        { id: 'ctcr-2',
    position: { x: 0, y: 0 }, text: 'Inspect crusher jaw for jammed oversize cullet before restart.' },
        { id: 'ctcr-3',
    position: { x: 0, y: 0 }, text: 'If no power: trace CT-DC-01 → DC-BH-01 → UT-MDP (Utility).' },
      ],
    },
    {
      id: 'CT-CONV-1',
    position: { x: 0, y: 0 },
      name: 'Cullet Return Conveyor — CV-CT-01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      physicalLocation: {
        building: 'batch-house',
        zone: 'cullet-tower-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Cullet Tower — return conveyor gallery',
        gridRef: 'CV-CT-01',
      },
      specs: {
        voltage: '400 V',
        power: '7.5 kW',
        current: '15 A',
        protection: 'IP55',
        manufacturer: 'SEW-Eurodrive',
        notes: 'Belt conveyor returning crushed cullet to the batch mixing line.',
      },
      troubleshootingSteps: [
        { id: 'ctcv-1',
    position: { x: 0, y: 0 }, text: 'Check belt-drift and pull-cord safety switches — both must be reset.' },
        { id: 'ctcv-2',
    position: { x: 0, y: 0 }, text: 'Verify gearbox motor MCCB in CT-DC-01.' },
      ],
    },
    ...importedNodes,
  
  {
    id: 'BH-MDP',
    name: 'BH-MDP 400V-230V 50Hz',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-0.0-GPR',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'Ground Level Panel Room',
    },
    position: { x: 5450, y: 1200.0 },
  },
  {
    id: 'BH-UDP',
    name: 'BH-UDP 400V/230V 50Hz',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-12.0-CPC',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+12.0m)',
      elevation: '12.0 m',
      area: 'CPC',
    },
    position: { x: 9950, y: 600.0 },
  },
  {
    id: 'BH-DP1',
    name: 'BH-DP1 18.43kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-0.0',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: 1200.0 },
  },
  {
    id: 'BH-DP2',
    name: 'BH-DP2 18.99kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-5.1',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+5.1m)',
      elevation: '5.1 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: 945.0 },
  },
  {
    id: 'BH-DP3',
    name: 'BH-DP3 7.08kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-12.0',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+12.0m)',
      elevation: '12.0 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: 600.0 },
  },
  {
    id: 'BH-DP4',
    name: 'BH-DP4 23.76kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-17.5',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+17.5m)',
      elevation: '17.5 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: 325.0 },
  },
  {
    id: 'BH-DP5',
    name: 'BH-DP5 1.36kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-22.8',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+22.8m)',
      elevation: '22.8 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: 60.0 },
  },
  {
    id: 'BH-DP6',
    name: 'BH-DP6 1.36kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-27.8',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+27.8m)',
      elevation: '27.8 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: -190.0 },
  },
  {
    id: 'BH-DP7',
    name: 'BH-DP7 46.62kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-32.5',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+32.5m)',
      elevation: '32.5 m',
      area: 'UNKNOWN',
    },
    position: { x: 1950, y: -425.0 },
  },
  {
    id: 'LAHTI',
    name: 'LAHTI MCC05 82kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'BAH-12.0-CPC',
    },
    physicalLocation: {
      building: 'batch-house',
      zone: 'batch-house-elevated',
      floor: 'Elevated (+12.0m)',
      elevation: '12.0 m',
      area: 'CPC',
    },
    position: { x: 10175, y: 450.0 },
  },
],
  edges: [
    // ── Cullet Tower subsystem feeders ────────────────────────────────────────
    {
      id: 'LV-BH-TO-CT',
      name: 'LV Feed DC-BH-01 → CT-DC-01 (Cullet Tower)',
      source: 'DC-BH-01',
      target: 'CT-DC-01',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V AC',
        crossSection: '4×70 mm² Cu',
        notes: 'Sub-distribution feed for the Cullet Tower switchroom.',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'bh-ct-1', text: 'Check outgoing MCCB Q-CT in DC-BH-01.' },
      ],
    },
    {
      id: 'LOAD-CT-CRUSHER',
      name: 'Circuit CT-DC-01 → Cullet Crusher CR-CT-01',
      source: 'CT-DC-01',
      target: 'CT-CRUSHER-1',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        crossSection: '4×25 mm²',
        notes: 'MCCB Q-CR01, 100 A — soft-starter cubicle.',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-ctcr-1', text: 'Check MCCB Q-CR01 in CT-DC-01.' },
      ],
    },
    {
      id: 'PLC-CT-CRUSHER',
      name: 'PLC Control CT-DC-01 → Cullet Crusher CR-CT-01',
      source: 'CT-DC-01',
      target: 'CT-CRUSHER-1',
      edgeType: 'plc',
      status: 'operational',
      specs: {
        crossSection: '12×0.75 mm² control multicore',
        notes: 'Start/stop, soft-starter status, jam detection. Runs in same tray as power circuit.',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'plc-ctcr-1', text: 'Check 24 V DC control supply and interposing relays in CT-DC-01.' },
      ],
    },
    {
      id: 'LOAD-CT-CONV',
      name: 'Circuit CT-DC-01 → Return Conveyor CV-CT-01',
      source: 'CT-DC-01',
      target: 'CT-CONV-1',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        crossSection: '4×4 mm²',
        notes: 'MCCB Q-CV01, 20 A.',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-ctcv-1', text: 'Check MCCB Q-CV01 in CT-DC-01.' },
      ],
    },

    {
      id: 'PC-BH-SUMMARY',
      name: 'Feeders DC-BH-01 → terminal boxes',
      source: 'DC-BH-01',
      target: 'BH-TB-SUMMARY',
      edgeType: 'power',
      status: 'operational',
      specs: {
        crossSection: 'Various',
        notes: 'Summary link — expand Batch House view for per-TB feeders',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'PC-BH-TB10',
      name: 'Feeder DC-BH-01 → TB10',
      source: 'DC-BH-01',
      target: 'TB10',
      edgeType: 'power',
      status: 'operational',
      specs: {
        crossSection: 'FILL from as-built',
        length: 'FILL m',
        voltage: '400V AC',
        notes: 'Link other TB feeders when cable tags are added to CSV RelatedCable column',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
  ],
};

export const batchHouseImportMeta = importedTb.meta;
