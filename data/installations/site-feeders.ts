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

  // Furnace 20 feeders (TR2.x → TR-DP2.x) are frozen with the Phase 2 scope —
  // restore them when furnace-20.ts is re-added to SITE_INSTALLATIONS.

  // ── Utility Building → Batch House: UT-MDP → DC-BH-01 ──────────────────────
  {
    id: 'LV-FEED-BH-DC01',
    name: 'LV Feeder UT-MDP → DC-BH-01 (Batch House)',
    source: 'UT-MDP',
    target: 'DC-BH-01',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      crossSection: '4×185 mm² Cu',
      installationType: 'Underground + cable tray',
      notes: 'Utility main distribution panel (UT-MDP) feeds Batch House distribution cabinet DC-BH-01 — main incoming supply for batch hall + cullet tower subsystem.',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'batch-house',
    },
    troubleshootingSteps: [
      { id: 'feed-bh-1', text: 'Measure voltage at UT-MDP outgoing Q-BH and DC-BH-01 incoming terminals.' },
      { id: 'feed-bh-2', text: 'Check underground cable route — joint pit if voltage drop > 2 V.' },
    ],
  },
];
