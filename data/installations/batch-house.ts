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
      name: 'Distribution Cabinet BH-01',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      layout: { building: 'batch-house', branchIndex: 0, feederLanding: true },
      physicalLocation: {
        building: 'batch-house',
        zone: 'batch-house-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Batch hall — main LV feed',
        gridRef: 'BH-DC-01',
      },
      externalRefs: { osapiensAssetId: 'AST-BH-DC-01' },
      specs: { voltage: '400V AC', current: '250 A', manufacturer: 'Rittal' },
      troubleshootingSteps: [
        { id: 'dcbh1', text: 'Check breaker Q1 (ON).' },
        { id: 'dcbh2', text: 'Measure output bus: 400 V ±2%.' },
      ],
    },
    {
      id: 'BH-TB-SUMMARY',
      name: '20 terminal boxes',
      assetType: 'junction-box',
      layer: 'junction',
      status: 'investigation',
      mapScope: 'overview-only',
      layout: { building: 'batch-house', branchIndex: 0 },
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
          text: 'Use the Batch House filter above to view individual terminal boxes.',
        },
      ],
    },
    // ── Cullet Tower subsystem (inside the Batch House block) ────────────────
    {
      id: 'CT-DC-01',
      name: 'Cullet Tower Distribution Cabinet',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 6,
      layout: { building: 'batch-house', branchIndex: 1 },
      physicalLocation: {
        building: 'batch-house',
        zone: 'cullet-tower-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Cullet Tower — ground level switchroom',
        gridRef: 'CT-DC-01',
      },
      externalRefs: { scadaTag: 'LOMMEL.CT_DC01.STATUS', osapiensAssetId: 'AST-CT-DC-01' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        current: '160 A',
        manufacturer: 'Rittal',
        notes: 'IP54 — dusty environment (cullet handling). Sub-distribution fed from DC-BH-01.',
      },
      troubleshootingSteps: [
        { id: 'ctdc-1', text: 'Check incoming MCCB from DC-BH-01 — ON/OFF/TRIP.' },
        { id: 'ctdc-2', text: 'Inspect cabinet filters — cullet dust ingress blocks ventilation.' },
      ],
    },
    {
      id: 'CT-CRUSHER-1',
      name: 'Cullet Crusher — CR-CT-01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'batch-house', branchIndex: 0 },
      physicalLocation: {
        building: 'batch-house',
        zone: 'cullet-tower-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Cullet Tower — crusher level',
        gridRef: 'CR-CT-01',
      },
      externalRefs: { scadaTag: 'LOMMEL.CT.CR01.STATUS', osapiensAssetId: 'AST-CT-CR-01' },
      specs: {
        voltage: '400 V',
        power: '45 kW',
        current: '85 A',
        protection: 'IP55',
        manufacturer: 'Siemens',
        notes: 'Cullet crusher main drive — soft-start. High inertia load; check start sequence on trip.',
      },
      troubleshootingSteps: [
        { id: 'ctcr-1', text: 'Check soft-starter fault LED and thermal overload relay.' },
        { id: 'ctcr-2', text: 'Inspect crusher jaw for jammed oversize cullet before restart.' },
        { id: 'ctcr-3', text: 'If no power: trace CT-DC-01 → DC-BH-01 → UT-MDP (Utility).' },
      ],
    },
    {
      id: 'CT-CONV-1',
      name: 'Cullet Return Conveyor — CV-CT-01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'batch-house', branchIndex: 1 },
      physicalLocation: {
        building: 'batch-house',
        zone: 'cullet-tower-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Cullet Tower — return conveyor gallery',
        gridRef: 'CV-CT-01',
      },
      externalRefs: { scadaTag: 'LOMMEL.CT.CV01.STATUS', osapiensAssetId: 'AST-CT-CV-01' },
      specs: {
        voltage: '400 V',
        power: '7.5 kW',
        current: '15 A',
        protection: 'IP55',
        manufacturer: 'SEW-Eurodrive',
        notes: 'Belt conveyor returning crushed cullet to the batch mixing line.',
      },
      troubleshootingSteps: [
        { id: 'ctcv-1', text: 'Check belt-drift and pull-cord safety switches — both must be reset.' },
        { id: 'ctcv-2', text: 'Verify gearbox motor MCCB in CT-DC-01.' },
      ],
    },
    ...importedNodes,
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
