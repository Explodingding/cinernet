import type { TopologyEdgeInput, TopologyNodeInput } from '@/types/topology';
import { MAIN_HV_PANEL_LINEUP } from '@/lib/siteLayout';

const CELL_COUNT = MAIN_HV_PANEL_LINEUP.cellCount;

function cellNode(cellNumber: number, notes: string): TopologyNodeInput {
  const padded = String(cellNumber).padStart(2, '0');
  return {
    id: `MAIN-HV-CELL-${padded}`,
    name: `26kV Main Panel - Cell ${cellNumber}`,
    assetType: 'hv-switchgear',
    layer: 'hv-switchgear',
    status: 'operational',
    displayTier: 1,
    subsystem: 'hv',
    position: {
      x: 100 + (cellNumber * 80),
      y: 2500,
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground',
      elevation: '0 m',
      area: `26 kV MAIN PANEL — cubicle ${cellNumber} (UG03 switchgear lineup)`,
      gridRef: `66-15-014a-${cellNumber}`,
    },
    specs: {
      voltage: '26 kV (future 30 kV)',
      current: '1 250 A',
      manufacturer: 'Siemens VCB-3AH5',
      notes,
    },
    troubleshootingSteps: [
      { id: `cell${cellNumber}-vcb`, text: `Check VCB position indicators on Cell ${cellNumber}.` },
      { id: `cell${cellNumber}-bus`, text: 'Verify busbar voltage 26 kV ±5% before operating adjacent cubicles.' },
    ],
  };
}

/** Cells 1–11 — contiguous 26 kV MAIN PANEL lineup at Utility ground floor (0 m). */
export const mainHvPanelCells: TopologyNodeInput[] = [];

function feederTransformer(
  id: string,
  name: string,
  lineupIndex: number,
  specs: TopologyNodeInput['specs'],
  opts: Pick<TopologyNodeInput, 'displayTier' | 'troubleshootingSteps' | 'docs'> &
    Partial<Pick<TopologyNodeInput, 'status'>>
): TopologyNodeInput {
  return {
    id,
    name,
    assetType: 'transformer',
    layer: 'transformer',
    status: opts.status ?? 'operational',
    displayTier: opts.displayTier ?? 1,
    subsystem: 'lv-400v',
    position: {
      x: 100 + ((lineupIndex + 1) * 80),
      y: 2000,
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground',
      elevation: '0 m',
      area: 'Transformer bay — above 26 kV MAIN PANEL feeder cell',
      gridRef: id,
    },
    specs,
    troubleshootingSteps: opts.troubleshootingSteps,
    docs: opts.docs,
  };
}

export const mainFeedTransformers: TopologyNodeInput[] = [];

/** Internal busbar + feeder edges within the MAIN PANEL lineup. */
export function buildMainPanelEdges(): TopologyEdgeInput[] {
  return [];
}
