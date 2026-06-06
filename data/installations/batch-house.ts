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
    {
      id: 'DC-BH-01',
      name: 'Distribution Cabinet BH-01',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      layout: { building: 'batch-house', branchIndex: 0 },
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
    ...importedNodes,
  ],
  edges: [
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
