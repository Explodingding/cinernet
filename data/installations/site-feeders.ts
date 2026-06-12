import type { TopologyEdgeInput } from '@/types/topology';

/**
 * Cross-building LV feeders (400 V) from Utility Building feeder transformers
 * to the first distribution panel in each remote building.
 *
 * Source: SMT-5250 CNRBE-PMEP18-AB-XXX — Power Distribution System Riser Plan
 */
export const siteFeederEdges: TopologyEdgeInput[] = [

//   // ── Utility → Furnace 10: TR-01 → TR-DP1.1 ─────────────────────────────────
  // {
    // id: 'LV-TR01-TO-DP1-1',
    // name: 'LV Feeder TR-01 → TR-DP1.1 (Furnace 10)',
    // source: 'TR-01',
    // target: 'TR-DP1-1',
    // edgeType: 'power',
    // status: 'operational',
    // specs: {
      // voltage: '400 V AC',
      // notes: 'LV output from TR-01 (MAIN PANEL Cell 4 feeder) to TR-DP1.1 PFC panel (Furnace 10).',
    // },
    // route: {
      // pathType: 'underground',
      // spansBuildings: true,
      // fromBuilding: 'utility',
      // toBuilding: 'furnace-10',
    // },
    // troubleshootingSteps: [
      // { id: 'tr01-dp11-1', text: 'Measure LV voltage at TR-01 secondary terminals.' },
      // { id: 'tr01-dp11-2', text: 'Measure voltage at TR-DP1.1 incoming terminals — expected 395–405 V.' },
      // { id: 'tr01-dp11-3', text: 'Check ACB in TR-DP1.1 — confirm not tripped.' },
    ],
  },

  // ── Utility → Batch House: TR-03 → DC-BH-01 ────────────────────────────────
  {
    id: 'LV-TR03-TO-BH-DC01',
    name: 'LV Feeder TR-03 → DC-BH-01 (Batch House)',
    source: 'TR-03',
    target: 'DC-BH-01',
    edgeType: 'power',
    status: 'operational',
    specs: {
      voltage: '400 V AC',
      crossSection: '4×185 mm² Cu',
      installationType: 'Underground + cable tray',
      notes: 'TR-03 (MAIN PANEL Cell 8 feeder) → Batch House main incoming cabinet DC-BH-01.',
    },
    route: {
      pathType: 'underground',
      spansBuildings: true,
      fromBuilding: 'utility',
      toBuilding: 'batch-house',
    },
    troubleshootingSteps: [
      { id: 'tr03-bh-1', text: 'Measure voltage at TR-03 LV busbar and DC-BH-01 incoming terminals.' },
      { id: 'tr03-bh-2', text: 'Check underground cable route — joint pit if voltage drop > 2 V.' },
    ],
  },
];
