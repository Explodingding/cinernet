import type { TopologyEdgeInput } from '@/types/topology';

/**
 * Cross-building LV feeders (400 V) from Utility Building transformers
 * to the PFC panels and main panels in the Furnace and Batch House buildings.
 *
 * Source: SMT-5250 CNRBE-PMEP18-AB-XXX — Power Distribution System Riser Plan
 *
 * The 35 kV MV cables between panels are modelled inside utility.ts.
 * These are the 400 V LV outgoing cables from the transformer secondary
 * terminals to the first distribution panel in each building.
 */
export const siteFeederEdges: TopologyEdgeInput[] = [

  // ── Utility Building → Furnace 10: TR1.1 → TR-DP1.1 ────────────────────────
  {
    id: 'LV-TR1-1-TO-DP1-1',
    name: 'LV Feeder TR1.1 → TR-DP1.1 (Furnace 10)',
    source: 'TR1-1',
    target: 'TR-DP1-1',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      notes: 'LV output from TR1.1 (2500 kVA, Utility Building) to TR-DP1.1 PFC panel (Furnace 10). Underground cross-building cable run.',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-10',
    },
    troubleshootingSteps: [
      { id: 'tr1-dp11-1', text: 'Measure LV voltage at TR1.1 secondary terminals.' },
      { id: 'tr1-dp11-2', text: 'Measure voltage at TR-DP1.1 incoming terminals — expected 395–405 V.' },
      { id: 'tr1-dp11-3', text: 'Check ACB in TR-DP1.1 — confirm not tripped.' },
    ],
  },

  // ── Utility Building → Furnace 10: TR1.2 → TR-DP1.2 ────────────────────────
  {
    id: 'LV-TR1-2-TO-DP1-2',
    name: 'LV Feeder TR1.2 → TR-DP1.2 (Furnace 10)',
    source: 'TR1-2',
    target: 'TR-DP1-2',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      notes: 'LV output from TR1.2 (2500 kVA, Utility Building) to TR-DP1.2 PFC panel (Furnace 10).',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-10',
    },
    troubleshootingSteps: [
      { id: 'tr2-dp12-1', text: 'Measure LV voltage at TR1.2 secondary terminals.' },
      { id: 'tr2-dp12-2', text: 'Measure voltage at TR-DP1.2 incoming — 400 V ±5%.' },
    ],
  },

  // ── Utility Building → Furnace 10: TR1.3 → TR-DP1.3 ────────────────────────
  {
    id: 'LV-TR1-3-TO-DP1-3',
    name: 'LV Feeder TR1.3 → TR-DP1.3 (Furnace 10)',
    source: 'TR1-3',
    target: 'TR-DP1-3',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      notes: 'LV output from TR1.3 (2500 kVA, Utility Building) to TR-DP1.3 PFC panel (Furnace 10).',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-10',
    },
    troubleshootingSteps: [
      { id: 'tr3-dp13-1', text: 'Measure LV voltage at TR1.3 secondary terminals.' },
      { id: 'tr3-dp13-2', text: 'Measure voltage at TR-DP1.3 incoming — 400 V ±5%.' },
    ],
  },

  // ── Utility Building → Furnace 20: TR2.1 → TR-DP2.1 ────────────────────────
  {
    id: 'LV-TR2-1-TO-DP2-1',
    name: 'LV Feeder TR2.1 → TR-DP2.1 (Furnace 20)',
    source: 'TR2-1',
    target: 'TR-DP2-1',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      notes: 'LV output from TR2.1 (2500 kVA, Utility Building) to TR-DP2.1 PFC panel (Furnace 20).',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-20',
    },
    troubleshootingSteps: [
      { id: 'tr21-dp21-1', text: 'Measure LV voltage at TR2.1 secondary terminals.' },
      { id: 'tr21-dp21-2', text: 'Measure voltage at TR-DP2.1 incoming — 400 V ±5%.' },
    ],
  },

  // ── Utility Building → Furnace 20: TR2.2 → TR-DP2.2 ────────────────────────
  {
    id: 'LV-TR2-2-TO-DP2-2',
    name: 'LV Feeder TR2.2 → TR-DP2.2 (Furnace 20)',
    source: 'TR2-2',
    target: 'TR-DP2-2',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      notes: 'LV output from TR2.2 (2500 kVA) to TR-DP2.2 PFC panel (Furnace 20).',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-20',
    },
    troubleshootingSteps: [
      { id: 'tr22-dp22-1', text: 'Measure voltage at TR2.2 secondary and TR-DP2.2 incoming.' },
    ],
  },

  // ── Utility Building → Furnace 20: TR2.3 → TR-DP2.3 ────────────────────────
  {
    id: 'LV-TR2-3-TO-DP2-3',
    name: 'LV Feeder TR2.3 → TR-DP2.3 (Furnace 20)',
    source: 'TR2-3',
    target: 'TR-DP2-3',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      notes: 'LV output from TR2.3 (2500 kVA) to TR-DP2.3 PFC panel (Furnace 20).',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'furnace-20',
    },
    troubleshootingSteps: [
      { id: 'tr23-dp23-1', text: 'Measure voltage at TR2.3 secondary and TR-DP2.3 incoming.' },
    ],
  },

  // ── Utility Building → Batch House: UT-MDP → BH-MDP ────────────────────────
  {
    id: 'LV-FEED-BH-MDP',
    name: 'LV Feeder UT-MDP → BH-MDP (Batch House)',
    source: 'UT-MDP',
    target: 'BH-MDP',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      installationType: 'Underground + cable tray',
      notes: 'Utility building main distribution panel feeds Batch House main panel.',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'batch-house',
    },
    troubleshootingSteps: [
      { id: 'feed-bh-1', text: 'Measure voltage at UT-MDP outgoing Q-BH and BH-MDP incoming terminals.' },
      { id: 'feed-bh-2', text: 'Check underground cable route — joint pit if voltage drop > 2 V.' },
    ],
  },
];
