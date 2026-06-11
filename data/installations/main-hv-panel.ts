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
    layout: {
      building: 'utility',
      lineupGroup: 'main-hv-panel',
      lineupIndex: cellNumber - 1,
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground',
      elevation: '0 m',
      area: `26 kV MAIN PANEL — cubicle ${cellNumber} (UG03 switchgear lineup)`,
      gridRef: `66-15-014a-${cellNumber}`,
    },
    externalRefs: {
      scadaTag: `LOMMEL.MAIN_HV.CELL_${padded}.STATUS`,
      osapiensAssetId: `AST-MAIN-HV-CELL-${padded}`,
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
export const mainHvPanelCells: TopologyNodeInput[] = Array.from({ length: CELL_COUNT }, (_, i) => {
  const n = i + 1;
  const roleNotes: Record<number, string> = {
    1: 'MAIN SUPPLY-1 — Track 1 incomer from Fluvius Distribution Building (GRID-FEED-A).',
    2: 'MAIN SUPPLY-2A — Track 2 redundant cable A from Distribution Building (GRID-FEED-B).',
    3: 'MAIN SUPPLY-2B — Track 2 redundant cable B (parallel pair with Cell 2).',
    4: 'FUR 10 — outgoing feeder cubicle to TR-01 / Furnace 10 supply.',
    5: 'Bus section / metering between F10 and Utility feeder positions.',
    6: 'Utility services feeder — outgoing to TR-02 (UT-MDP / TR-DPC).',
    7: 'Bus section between Utility and Batch House feeder positions.',
    8: 'Batch House feeder — outgoing to TR-03 (DC-BH-01 incoming).',
    9: 'Bus section — Furnace 20 reserve feeder bay.',
    10: 'FUR 20 — outgoing feeder cubicle to TR-04 (future scope, normally isolated).',
    11: 'RING 10-20 — bus end / tie cubicle to F10 & F20 HV switchgear sections.',
  };
  return cellNode(n, roleNotes[n] ?? `Main panel cubicle ${n} on the 26 kV busbar.`);
});

function feederTransformer(
  id: string,
  name: string,
  lineupIndex: number,
  specs: TopologyNodeInput['specs'],
  opts: Pick<TopologyNodeInput, 'displayTier' | 'externalRefs' | 'troubleshootingSteps' | 'docs'> &
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
    layout: {
      building: 'utility',
      lineupGroup: 'main-hv-panel',
      lineupIndex,
      feederRole: 'main-feed',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground',
      elevation: '0 m',
      area: 'Transformer bay — above 26 kV MAIN PANEL feeder cell',
      gridRef: id,
    },
    externalRefs: opts.externalRefs,
    specs,
    troubleshootingSteps: opts.troubleshootingSteps,
    docs: opts.docs,
  };
}

export const mainFeedTransformers: TopologyNodeInput[] = [
  feederTransformer(
    'TR-01',
    'Transformer TR 01 — Furnace 10',
    3,
    {
      voltage: '26 kV / 400 V',
      power: '2 500 kVA',
      notes: 'Fed from MAIN PANEL Cell 4. LV output → TR-DP1.1 PFC panel (Furnace 10).',
    },
    {
      externalRefs: { scadaTag: 'LOMMEL.TR01.STATUS', osapiensAssetId: 'AST-TR-01' },
      troubleshootingSteps: [
        { id: 'tr01-1', text: 'Check winding temperature — max 80 °C (thermistor).' },
        { id: 'tr01-2', text: 'Measure LV output: 395–405 V before energising F10 PFC panel.' },
      ],
    }
  ),
  feederTransformer(
    'TR-02',
    'Transformer TR 02 — Utility',
    5,
    {
      voltage: '26 kV / 400 V',
      power: '3 150 kVA',
      notes: 'Fed from MAIN PANEL Cell 6. LV output → UT-MDP and TR-DPC utility distribution.',
    },
    {
      externalRefs: { scadaTag: 'LOMMEL.TR02.STATUS', osapiensAssetId: 'AST-TR-02' },
      troubleshootingSteps: [
        { id: 'tr02-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr02-2', text: 'Verify LV feeds to UT-MDP and TR-DPC — 400 V ±5%.' },
      ],
    }
  ),
  feederTransformer(
    'TR-03',
    'Transformer TR 03 — Batch House',
    7,
    {
      voltage: '26 kV / 400 V',
      power: '2 500 kVA',
      notes: 'Fed from MAIN PANEL Cell 8. LV output → DC-BH-01 (Batch House main incoming).',
    },
    {
      externalRefs: { scadaTag: 'LOMMEL.TR03.STATUS', osapiensAssetId: 'AST-TR-03' },
      troubleshootingSteps: [
        { id: 'tr03-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr03-2', text: 'Measure LV at DC-BH-01 incoming — 400 V ±5%.' },
      ],
    }
  ),
  feederTransformer(
    'TR-04',
    'Transformer TR 04 — Future Scope / F20',
    9,
    {
      voltage: '26 kV / 400 V',
      power: '2 500 kVA',
      notes: 'Fed from MAIN PANEL Cell 10. Reserved for Furnace 20 — cubicle normally isolated.',
    },
    {
      displayTier: 3,
      status: 'investigation',
      externalRefs: { scadaTag: 'LOMMEL.TR04.STATUS', osapiensAssetId: 'AST-TR-04' },
      troubleshootingSteps: [
        { id: 'tr04-1', text: 'Future scope — do not energise until F20 commissioning plan approved.' },
      ],
    }
  ),
];

/** Internal busbar + feeder edges within the MAIN PANEL lineup. */
export function buildMainPanelEdges(): TopologyEdgeInput[] {
  const edges: TopologyEdgeInput[] = [];

  // Contiguous busbar — cells 1 → 2 → … → 11
  for (let i = 1; i < CELL_COUNT; i++) {
    const from = `MAIN-HV-CELL-${String(i).padStart(2, '0')}`;
    const to = `MAIN-HV-CELL-${String(i + 1).padStart(2, '0')}`;
    edges.push({
      id: `HV-BUS-${String(i).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      name: `26 kV busbar — Cell ${i} ↔ Cell ${i + 1}`,
      source: from,
      target: to,
      edgeType: 'hv',
      status: 'operational',
      specs: { voltage: '26 kV', notes: 'Internal busbar connection within MAIN PANEL lineup.' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    });
  }

  const feeders: { cell: number; tr: string; label: string }[] = [
    { cell: 4, tr: 'TR-01', label: 'Furnace 10' },
    { cell: 6, tr: 'TR-02', label: 'Utility' },
    { cell: 8, tr: 'TR-03', label: 'Batch House' },
    { cell: 10, tr: 'TR-04', label: 'Furnace 20 (future)' },
  ];

  for (const { cell, tr, label } of feeders) {
    const cellId = `MAIN-HV-CELL-${String(cell).padStart(2, '0')}`;
    edges.push({
      id: `HV-CELL${cell}-TO-${tr}`,
      name: `26 kV feeder Cell ${cell} → ${tr} (${label})`,
      source: cellId,
      target: tr,
      edgeType: 'power',
      status: tr === 'TR-04' ? 'investigation' : 'operational',
      specs: {
        voltage: '26 kV',
        crossSection: '3(1×95) mm² 26 kV EXeCG',
        notes: `Vertical riser from MAIN PANEL Cell ${cell} to ${tr} — orthogonal feeder run.`,
      },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    });
  }

  return edges;
}
