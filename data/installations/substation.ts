import type { SiteInstallation } from '@/types/topology';

/**
 * External Distribution Building (Substation) — absolute root of site power.
 *
 * Operated by Fluvius / grid operator — outside Cinerglass operational scope.
 * Dual 26 kV feeders enter here and export via three parallel underground
 * cables to the Utility Building basement HV switchgear:
 *   Track 1 — 1× main incoming cable  (GRID-FEED-A → MAIN-HV-CELL-01)
 *   Track 2 — 2× redundant cables     (GRID-FEED-B → CELL-02 / CELL-03, parallel pair)
 *
 * Nominal voltage: 26 kV (Belgian HV classification >25 kV; future upgrade to 30 kV).
 */
export const substationInstallation: SiteInstallation = {
  id: 'substation',
  label: 'Distribution Building — External',
  nodes: [
    {
      id: 'GRID-FEED-A',
    position: { x: 0, y: 0 },
      name: 'Fluvius Grid Feeder A (H05/H06)',
      assetType: 'hv-feed',
      layer: 'hv-feed',
      status: 'operational',
      displayTier: 1,
      subsystem: 'hv',
      allowFaultInjection: false,
      physicalLocation: {
        building: 'substation',
        zone: 'substation-hv',
        floor: 'Basement',
        elevation: '−3 m',
        area: 'Distribution Building — Fluvius interface cubicle A',
        gridRef: 'H05/H06',
      },
      specs: {
        voltage: '26 kV (future 30 kV)',
        notes: 'Primary grid intake — EAXECWB 3×1×630/26 kV, 5.5 km from Fluvius substation. External asset — no internal fault simulation.',
        manufacturer: 'Schneider Electric GHA 40.5-31-12',
      },
      troubleshootingSteps: [
        { id: 'gfa-1', text: 'Contact Fluvius grid operator for upstream outage — do not operate external switchgear.' },
        { id: 'gfa-2', text: 'Verify SICAM-Q100 energy quality at grid interface (read-only).' },
      ],
    },
    {
      id: 'GRID-FEED-B',
    position: { x: 0, y: 0 },
      name: 'Fluvius Grid Feeder B (H07/H08)',
      assetType: 'hv-feed',
      layer: 'hv-feed',
      status: 'operational',
      displayTier: 1,
      subsystem: 'hv',
      allowFaultInjection: false,
      physicalLocation: {
        building: 'substation',
        zone: 'substation-hv',
        floor: 'Basement',
        elevation: '−3 m',
        area: 'Distribution Building — Fluvius interface cubicle B',
        gridRef: 'H07/H08',
      },
      specs: {
        voltage: '26 kV (future 30 kV)',
        notes: 'Redundant grid intake — spare core included. Feeds Track 2 twin cables to Utility basement.',
        manufacturer: 'Schneider Electric GHA 40.5-31-12',
      },
      troubleshootingSteps: [
        { id: 'gfb-1', text: 'Contact Fluvius for upstream status before isolating redundant path.' },
      ],
    },
  ],

  edges: [
    // Track 1 — single main incoming cable
    {
      id: 'HV-SUPPLY-MAIN',
      name: 'HV Supply Main — Feeder A → MAIN PANEL Cell 1',
      source: 'GRID-FEED-A',
      target: 'MAIN-HV-CELL-01',
      edgeType: 'hv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240) mm² 26 kV EXeCG',
        voltage: '26 kV',
        length: '5.5 km',
        notes: 'Track 1 — main incoming. Reference 66-15-014a-3. Nominal 26 kV, rated 30 kV.',
      },
      route: {
        pathType: 'underground',
        spansBuildings: true,
        fromBuilding: 'substation',
        toBuilding: 'utility',
      },
      troubleshootingSteps: [
        { id: 'hv-main-1', text: 'Measure voltage at Utility MAIN incomer — 26 kV ±5%.' },
      ],
    },
    // Track 2 — redundant twin cables (parallel pair, same source→target)
    {
      id: 'HV-SUPPLY-BKUP-A',
      name: 'HV Supply Backup A — Feeder B → MAIN PANEL Cell 2',
      source: 'GRID-FEED-B',
      target: 'MAIN-HV-CELL-02',
      edgeType: 'hv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240) mm² 26 kV EXeCG',
        voltage: '26 kV',
        length: '5.5 km',
        notes: 'Track 2 — redundant cable A. Reference 66-15-014a-4.',
      },
      route: {
        pathType: 'underground',
        spansBuildings: true,
        fromBuilding: 'substation',
        toBuilding: 'utility',
      },
      troubleshootingSteps: [],
    },
    {
      id: 'HV-SUPPLY-BKUP-B',
      name: 'HV Supply Backup B — Feeder B → MAIN PANEL Cell 3',
      source: 'GRID-FEED-B',
      target: 'MAIN-HV-CELL-03',
      edgeType: 'hv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240)+(1×240 spare) mm² 26 kV EXeCG',
        voltage: '26 kV',
        length: '5.5 km',
        notes: 'Track 2 — redundant cable B with spare core.',
      },
      route: {
        pathType: 'underground',
        spansBuildings: true,
        fromBuilding: 'substation',
        toBuilding: 'utility',
      },
      troubleshootingSteps: [],
    },
  ],
};
