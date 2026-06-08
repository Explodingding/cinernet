import type { SiteInstallation, TopologyNodeInput } from '@/types/topology';
import importedTb from '../imported/batch-house-terminal-boxes.json';

const importedNodes = importedTb.nodes as TopologyNodeInput[];

/**
 * Batch House — distribution cabinet + terminal boxes from CSV import.
 * Full-site view shows a summary node; open Batch House filter for the TB grid.
 */
export const batchHouseInstallation: SiteInstallation = {
  id: 'batch-house',
  label: 'Batch House',
  nodes: [
    // ── Tier 1: Main distribution panels (real tags from SMT-5250) ──────────────
    {
      id: 'BH-MDP',
      name: 'BH-MDP — Batch House Main Distribution Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 18,
      layout: { building: 'batch-house', branchIndex: 0 },
      physicalLocation: {
        building: 'batch-house',
        zone: 'batch-house-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Batch House — main electrical room',
        gridRef: 'BH-MDP',
      },
      externalRefs: { scadaTag: 'LOMMEL.BH_MDP.STATUS', osapiensAssetId: 'AST-BH-MDP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, MEP. Main LV distribution for Batch House. Feeds all batch equipment and terminal boxes.',
        manufacturer: 'TBC',
      },
      troubleshootingSteps: [
        { id: 'bhmdp-1', text: 'Check main ACB Q0 — ON/OFF/TRIP.' },
        { id: 'bhmdp-2', text: 'Measure busbar voltage L1-L2-L3 (400 V ±5%).' },
        { id: 'bhmdp-3', text: 'Check all outgoing MCCBs — identify tripped circuit.' },
      ],
    },
    {
      id: 'BH-UDP',
      name: 'BH-UDP — Batch House UPS Distribution Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 6,
      layout: { building: 'batch-house', branchIndex: 1 },
      physicalLocation: {
        building: 'batch-house',
        zone: 'batch-house-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Batch House — UPS panel room',
        gridRef: 'BH-UDP',
      },
      externalRefs: { scadaTag: 'LOMMEL.BH_UDP.STATUS', osapiensAssetId: 'AST-BH-UDP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, MEP. UPS-backed distribution for Batch House instrumentation and control.',
      },
      troubleshootingSteps: [
        { id: 'bhudp-1', text: 'Check UPS bypass position — on-line or bypass mode.' },
        { id: 'bhudp-2', text: 'Verify UPS battery health — minimum autonomy 15 min.' },
      ],
    },
    {
      id: 'DC-BH-01',
      name: 'Distribution Cabinet BH-01',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      layout: { building: 'batch-house', branchIndex: 0 },
      physicalLocation: {
        building: 'batch-house',
        zone: 'batch-house-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Batch hall — terminal box feed cabinet',
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
    ...importedNodes,
  ],
  edges: [
    {
      id: 'LV-BH-MDP-TO-DC',
      name: 'LV Feed BH-MDP → DC-BH-01',
      source: 'BH-MDP',
      target: 'DC-BH-01',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', notes: 'Internal feed from main distribution panel to terminal box cabinet.' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
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
