import type { TopologyEdgeInput } from '@/types/topology';

/** Cross-building LV feeders from Utility MDP to field installations */
export const siteFeederEdges: TopologyEdgeInput[] = [
  {
    id: 'PC-FEED-F10',
    name: 'Feeder Utility → Furnace 10',
    source: 'MDP-01',
    target: 'DC-F10-01',
    edgeType: 'power',
    status: 'investigation',
    specs: {
      crossSection: '4×35 mm²',
      maxLoad: '100 A',
      length: '95 m',
      voltage: '400V AC',
      installationType: 'YKY — underground + cable ladder',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-10',
    },
    troubleshootingSteps: [
      { id: 'feedf10-1', text: 'Measure voltage at MDP-01 Q-F10 and DC-F10-01 input.' },
      { id: 'feedf10-2', text: 'Check underground joint pit UT-12 if drop > 2 V.' },
    ],
  },
  {
    id: 'PC-FEED-BH',
    name: 'Feeder Utility → Batch House',
    source: 'MDP-01',
    target: 'DC-BH-01',
    edgeType: 'power',
    status: 'operational',
    specs: {
      crossSection: '4×35 mm²',
      maxLoad: '100 A',
      length: '72 m',
      voltage: '400V AC',
      installationType: 'YKY — cable tray',
    },
    route: {
      pathType: 'cable-tray',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'batch-house',
    },
    troubleshootingSteps: [],
  },
];
