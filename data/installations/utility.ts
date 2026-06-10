import type { SiteInstallation } from '@/types/topology';

/**
 * Utility Building — central electrical hub for the Lommel site.
 *
 * Source drawings:
 *   SMT-5255  CNRBE-PMEP20-AB-XXX  MV Distribution System Riser Plan (35 kV)
 *   SMT-5250  CNRBE-PMEP18-AB-XXX  Power Distribution System Riser Plan (400 V)
 *   LAY-5246  CNRBE-PMEP20-UB-000  Utility Building Ground Floor (0.00 level)
 *
 * Physical layout (ground floor, room UG03 / UG24–25):
 *   MAIN MV PANEL | F10 MV PANEL | F20 MV PANEL  (all in utility building per LAY-5246)
 *   TR-COMP.4 | TR1.2 | TR-COMP.1 | TR-COMP.2 | TR-COMP.3 | TR1.3 | TR-C | TR1.1
 *   TR-S | TR2.1 | TR2.3 | TR2.2
 *   Generator room UG25 / Sync room UG24
 */
export const utilityInstallation: SiteInstallation = {
  id: 'utility',
  label: 'Utility Building',
  nodes: [

    // ── MV Supply — 35 kV from Fluvius ──────────────────────────────────────────
    {
      id: 'DISTRIB-BLDG',
      name: 'Ciner Glass Distribution Building',
      assetType: 'mv-feed',
      layer: 'mv-feed',
      status: 'operational',
      displayTier: 1,
      subsystem: 'mv',
      layout: { building: 'utility' },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-basement-mv',
        floor: 'Basement',
        elevation: '−3 m',
        area: 'Distribution Building — Fluvius interface (substation basement)',
        gridRef: 'DISTRIB-BLDG',
      },
      externalRefs: { scadaTag: 'LOMMEL.MV.DISTRIB_BLDG', osapiensAssetId: 'AST-DISTRIB-BLDG' },
      specs: {
        voltage: '35 kV (26–30 kV)',
        notes: 'Schneider GHA 40.5-31-12 switchgear — 2× incoming feeders from Fluvius. EAXECWB 3×1×630/35 kV, 5.5 km',
        manufacturer: 'Schneider Electric',
      },
      troubleshootingSteps: [
        { id: 'distrib-1', text: 'Verify Fluvius feed status — check H05/H06 (feeder 1) and H07/H08 (feeder 2) at distribution building.' },
        { id: 'distrib-2', text: 'Check SICAM-Q100 energy quality analyser readings at grid interface.' },
      ],
    },

    // ── Main MV Panel — 35 kV Utility Building ──────────────────────────────────
    {
      id: 'MAIN-MV-PANEL',
      name: 'Main MV Panel',
      assetType: 'mv-switchgear',
      layer: 'mv-switchgear',
      status: 'operational',
      displayTier: 1,
      subsystem: 'mv',
      layout: { building: 'utility', branchIndex: 0 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-basement-mv',
        floor: 'Basement',
        elevation: '−3 m',
        area: 'Main substation room — basement level',
        gridRef: '66-15-014a',
      },
      externalRefs: { scadaTag: 'LOMMEL.MAIN_MV.STATUS', osapiensAssetId: 'AST-MAIN-MV' },
      specs: {
        voltage: '35 kV (26–30 kV)',
        current: '1 250 A',
        manufacturer: 'Siemens VCB-3AH5',
        notes: 'Un:26-30kV Ur:36kV Ir:1250A Ik:25kA/3s. 2× incoming supplies (MAIN SUPPLY-1 / MAIN SUPPLY-2). SICAM-Q100 energy analyser.',
      },
      troubleshootingSteps: [
        { id: 'mmv-1', text: 'Check VCB status on incomer cubicles (P1/P2 indicators).' },
        { id: 'mmv-2', text: 'Verify busbar voltage: 26–30 kV nominal.' },
        { id: 'mmv-3', text: 'Confirm both MAIN SUPPLY-1 and MAIN SUPPLY-2 are healthy before isolating one feeder.' },
      ],
      docs: [
        {
          id: 'doc-mmv-sld',
          title: 'SLD — Main MV Switchgear Utility Building',
          type: 'drawing',
          url: '/cinernet/docs/SMT-5250.pdf',
          author: 'P. Smith / Siemens',
          date: '2025-11-14',
          revision: 'Rev. 3',
        },
        {
          id: 'doc-mmv-panel-loc',
          title: 'Electrical Panel Locations — Utility Building',
          type: 'drawing',
          url: '/cinernet/docs/panel-locations.pdf',
          author: 'Engineering dept.',
          date: '2026-03-18',
          revision: 'Model 5.5',
        },
        {
          id: 'doc-mmv-comm',
          title: 'Commissioning Record — Initial Energisation',
          type: 'commissioning',
          author: 'P. Smith',
          date: '2026-04-10',
          content: `MAIN MV PANEL — First Energisation Record
Date: 10 April 2026
Engineer: P. Smith (Siemens Service)
Witnessed by: J. Kowalski (Cinernet)

CHECKS PERFORMED:
✓ Busbar continuity test — all three phases confirmed
✓ Insulation resistance (phase-to-earth): L1 = 2 840 MΩ, L2 = 3 110 MΩ, L3 = 2 970 MΩ (all > 1 000 MΩ — pass)
✓ VCB operating mechanism tested (5 close/open cycles each cubicle)
✓ Protection relay settings uploaded and verified (SIPROTEC 7SJ85)
✓ Earth fault protection tested at 10 % of rated current
✓ Interlocking logic verified — no simultaneous close of main/tie breakers
✓ SICAM-Q100 energy analyser commissioned and reading correctly

ENERGISATION SEQUENCE:
08:14 — MAIN SUPPLY-1 energised at 28.4 kV
08:17 — Busbar voltage stable, all outgoing VCBs confirmed open
08:22 — F10 feeder VCB closed; secondary voltage at TR1-1 confirmed
08:35 — F20 feeder VCB closed; secondary voltage at TR2-1 confirmed
08:41 — Commissioning complete, system handed over to operations

STATUS: PASSED — panel ready for service`,
        },
      ],
    },

    // ── F10 MV Panel — 35 kV (physically in Utility Building) ──────────────────
    {
      id: 'F10-MV-PANEL',
      name: 'Furnace 10 Main MV Panel',
      assetType: 'mv-switchgear',
      layer: 'mv-switchgear',
      status: 'operational',
      displayTier: 1,
      subsystem: 'mv',
      layout: { building: 'utility', branchIndex: 1 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: '66-15-014d/e/f',
      },
      externalRefs: { scadaTag: 'LOMMEL.F10_MV.STATUS', osapiensAssetId: 'AST-F10-MV' },
      specs: {
        voltage: '35 kV',
        current: '1 250 A',
        manufacturer: 'Siemens VCB-3AH5',
        notes: 'Fed from MAIN MV PANEL via 2×3(1×240)+(1×240 spare) 35 kV cable 459 m. Outgoing feeders to TR1.1/1.2/1.3, TR-SPARE, TR-COMP-LV, TR-COMP-1/2, TR-BOOSTING 1.1–1.4, WAREHOUSE, RING 10-20.',
      },
      troubleshootingSteps: [
        { id: 'f10mv-1', text: 'Check incoming feeder 66-15-014b-5 VCB status.' },
        { id: 'f10mv-2', text: 'Verify busbar continuity — ring 10-20 tie breaker position.' },
      ],
    },

    // ── F20 MV Panel — 35 kV (physically in Utility Building) ──────────────────
    {
      id: 'F20-MV-PANEL',
      name: 'Furnace 20 Main MV Panel',
      assetType: 'mv-switchgear',
      layer: 'mv-switchgear',
      status: 'operational',
      displayTier: 1,
      subsystem: 'mv',
      layout: { building: 'utility', branchIndex: 2 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: '66-15-014d/e/f (F20 section)',
      },
      externalRefs: { scadaTag: 'LOMMEL.F20_MV.STATUS', osapiensAssetId: 'AST-F20-MV' },
      specs: {
        voltage: '35 kV',
        current: '1 250 A',
        manufacturer: 'Siemens VCB-3AH5',
        notes: 'Fed from MAIN MV PANEL via 2×3(1×240)+(1×240 spare) 35 kV cable. Outgoing feeders to TR2.1/2.2/2.3, TR-DPS, TR-COMP-3/4, TR-BOOSTING 2.1–2.4, RING 20-10.',
      },
      troubleshootingSteps: [
        { id: 'f20mv-1', text: 'Check incoming feeder 66-15-014b-6 VCB status.' },
        { id: 'f20mv-2', text: 'Verify ring 20-10 tie breaker — normally open during single-feed operation.' },
      ],
    },

    // ── Furnace 10 Transformers (2 500 kVA each, 35/0.4 kV) ────────────────────
    {
      id: 'TR1-1',
      name: 'TR 1.1 — 2 500 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 0 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG06',
        gridRef: '66-15-020b-1',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR1_1.STATUS', osapiensAssetId: 'AST-TR1-1' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '2 500 kVA',
        notes: 'Cable from F10 MV Panel: 3(1×95)mm² 35 kV EXeCG, 134 m. LV output → TR-DP1.1 PFC panel (Furnace 10).',
      },
      troubleshootingSteps: [
        { id: 'tr1-1-1', text: 'Check winding temperature — max 80 °C (thermistor).' },
        { id: 'tr1-1-2', text: 'Measure LV output on 400 V busbar: 395–405 V.' },
      ],
      docs: [
        {
          id: 'doc-tr11-protocol',
          title: 'Annual Maintenance Protocol — Power Transformer',
          type: 'protocol',
          author: 'Maintenance dept.',
          date: '2026-04-15',
          revision: 'Rev. 1',
          content: `TR1-1 ANNUAL MAINTENANCE PROTOCOL
Asset: 2 500 kVA 35 kV / 400 V oil-immersed transformer
Frequency: Annual (April)
Required qualifications: HV-authorised electrician

PRE-WORK (de-energised, locked-out, earthed):
1. Confirm LOTO: MV VCB open and locked, LV ACB open, earthing switches closed.
2. Visually inspect oil level in conservator — refill if below MIN mark.
3. Check for oil leaks at gaskets, bushings, drain valve — record any findings.
4. Clean HV / LV bushings with dry cloth; inspect for tracking or cracks.
5. Tighten HV cable lugs and LV busbar bolts (torque: HV 120 N·m, LV 80 N·m).
6. Test Buchholz relay: hand-actuate float — alarm and trip relays must respond.
7. Inspect silica-gel breather — replace if > 2/3 pink (saturated).
8. Check oil temperature thermometer calibration (test at 20 °C reference).
9. Measure insulation resistance (winding-to-earth and winding-to-winding) — min 1 000 MΩ.
10. Perform turns-ratio test on all tap positions — deviation < 0.5%.

POST-WORK:
11. Remove all earthing, close guards, restore LOTO in reverse order.
12. Re-energise at off-load tap changer position per operating schedule.
13. Verify oil temperature stabilises within ±5 °C of ambient after 30 min.

Sign-off required by: Maintenance Engineer + Shift Supervisor`,
        },
      ],
    },
    {
      id: 'TR1-2',
      name: 'TR 1.2 — 2 500 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 1 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG07',
        gridRef: '66-15-020b-2',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR1_2.STATUS', osapiensAssetId: 'AST-TR1-2' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '2 500 kVA',
        notes: 'Cable from F10 MV Panel: 3(1×95)mm² 35 kV EXeCG, 39 m. LV output → TR-DP1.2 PFC panel.',
      },
      troubleshootingSteps: [
        { id: 'tr1-2-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr1-2-2', text: 'Measure LV output 400 V ±5%.' },
      ],
    },
    {
      id: 'TR1-3',
      name: 'TR 1.3 — 2 500 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 2 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG08',
        gridRef: '66-15-020b-3',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR1_3.STATUS', osapiensAssetId: 'AST-TR1-3' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '2 500 kVA',
        notes: 'Cable from F10 MV Panel: 3(1×95)mm² 35 kV EXeCG, 28 m. LV output → TR-DP1.3 PFC panel.',
      },
      troubleshootingSteps: [
        { id: 'tr1-3-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr1-3-2', text: 'Measure LV output 400 V ±5%.' },
      ],
    },

    // ── Furnace 20 Transformers (2 500 kVA each, 35/0.4 kV) ────────────────────
    {
      id: 'TR2-1',
      name: 'TR 2.1 — 2 500 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 3 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG12',
        gridRef: '66-15-020b-4',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR2_1.STATUS', osapiensAssetId: 'AST-TR2-1' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '2 500 kVA',
        notes: 'Cable from F20 MV Panel: 3(1×95)mm² 35 kV EXeCG, 128 m. LV output → TR-DP2.1 PFC panel (Furnace 20).',
      },
      troubleshootingSteps: [
        { id: 'tr2-1-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr2-1-2', text: 'Measure LV output 400 V ±5%.' },
      ],
    },
    {
      id: 'TR2-2',
      name: 'TR 2.2 — 2 500 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 4 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG13',
        gridRef: '66-15-020b-5',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR2_2.STATUS', osapiensAssetId: 'AST-TR2-2' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '2 500 kVA',
        notes: 'Cable from F20 MV Panel: 3(1×95)mm² 35 kV EXeCG. LV output → TR-DP2.2 PFC panel.',
      },
      troubleshootingSteps: [
        { id: 'tr2-2-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr2-2-2', text: 'Measure LV output 400 V ±5%.' },
      ],
    },
    {
      id: 'TR2-3',
      name: 'TR 2.3 — 2 500 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 5 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG14',
        gridRef: '66-15-020b-6',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR2_3.STATUS', osapiensAssetId: 'AST-TR2-3' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '2 500 kVA',
        notes: 'Cable from F20 MV Panel: 3(1×95)mm² 35 kV EXeCG. LV output → TR-DP2.3 PFC panel.',
      },
      troubleshootingSteps: [
        { id: 'tr2-3-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr2-3-2', text: 'Measure LV output 400 V ±5%.' },
      ],
    },

    // ── TR Spare + TR Compressor LV ─────────────────────────────────────────────
    {
      id: 'TR-SPARE',
      name: 'TR Spare — 3 150 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'investigation',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 6 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG09 (TR-S)',
        gridRef: '66-15-020c-1',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_SPARE.STATUS', osapiensAssetId: 'AST-TR-SPARE' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '3 150 kVA',
        notes: 'Spare transformer — standby for TR1.x or TR2.x replacement. Cable from F10 MV Panel: 3(1×95)mm² 35 kV EXeCG, 21 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-spare-1', text: 'Confirm spare transformer is on isolator before energisation.' },
        { id: 'tr-spare-2', text: 'Check MV cubicle 66-15-020c-1 — open position confirmed.' },
      ],
      docs: [
        {
          id: 'doc-tr-spare-fault',
          title: 'Fault Investigation Report — TR-SPARE',
          type: 'fault-report',
          author: 'J. Kowalski',
          date: '2026-05-15',
          revision: 'Open',
          content: `FAULT INVESTIGATION REPORT
Asset: TR-SPARE — 3 150 kVA 35 kV / 400 V spare transformer
Report No.: FIR-2026-012
Date opened: 15 May 2026
Reported by: J. Kowalski (Shift Supervisor)
Status: UNDER INVESTIGATION

OBSERVATION:
During routine weekly patrol (14 May 2026, 22:40), operator noticed unusually warm
surface temperature on the LV bushing cluster of TR-SPARE. Infrared scan performed
at 23:15 confirmed Phase L2 bushing at 67 °C vs. ambient 21 °C (ΔT = 46 K).
Normal operating ΔT for this asset at no-load: < 5 K.

IMMEDIATE ACTIONS TAKEN:
- Transformer isolated (MV VCB and LV ACB opened, earth switches closed) at 23:30.
- LOTO applied: tag ref LOTO-2026-0112.
- SCADA alarm suppressed; status changed to INVESTIGATION.

ROOT CAUSE INVESTIGATION (in progress):
• Initial hypothesis: loose or corroded contact at L2 bushing terminal.
• Oil sample taken 15/05 — awaiting dissolved gas analysis (DGA) from lab.
• Insulation resistance measured: L1=2800 MΩ, L2=48 MΩ (significantly low), L3=2950 MΩ.
• Low L2 insulation resistance suggests possible winding fault or moisture ingress.

NEXT STEPS:
□ ABB service engineer on-site — scheduled 4 June 2026 (ticket ABB-2026-0421)
□ DGA results expected by 30 May 2026
□ Potential repair: rewind L2 coil or replace complete LV winding assembly

IMPACT:
TR-SPARE is the site hot-standby for TR1.x and TR2.x transformers. While it remains
offline, there is no standby capacity for a main transformer failure. Risk accepted by
Plant Manager (ref.: risk waiver RW-2026-008) pending repair.`,
        },
      ],
    },
    {
      id: 'TR-COMP-LV',
      name: 'TR Compressor LV — 3 150 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 1,
      subsystem: 'lv-400v',
      layout: { building: 'utility', branchIndex: 7 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG10 (TR-C)',
        gridRef: '66-15-020c-2',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_COMP_LV.STATUS', osapiensAssetId: 'AST-TR-COMP-LV' },
      specs: {
        voltage: '35 kV / 400 V',
        power: '3 150 kVA',
        notes: 'LV supply for turbo compressor auxiliaries and utility distribution. Cable from F10 MV Panel: 3(1×95)mm² 35 kV EXeCG, 50 m. LV output → TR-DPC PFC panel.',
      },
      troubleshootingSteps: [
        { id: 'tr-comp-lv-1', text: 'Check winding temperature — max 80 °C.' },
        { id: 'tr-comp-lv-2', text: 'Verify LV output to TR-DPC: 400 V ±5%.' },
      ],
    },

    // ── Turbo Compressor MV Transformers (35 → 6 kV) — Tier 3 ──────────────────
    // displayTier 3: hidden until "All systems" view is selected — 6 kV subsystem
    // is deferred from the primary 400 V focus.
    {
      id: 'TR-COMP-1',
      name: 'TR Compressor-1 (UT-COMP 4.6-1)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      circuitCount: 0,
      layout: { building: 'utility', branchIndex: 8 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG15',
        gridRef: '66-15-020d-1',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_COMP1.STATUS', osapiensAssetId: 'AST-TR-COMP-1' },
      specs: {
        voltage: '35 kV / 6 kV',
        notes: 'Feeds Turbo Compressor-1 Panel at 6 kV. Cable from F10 MV Panel 66-15-014f-5: 3(1×95)mm² 35 kV EXeCG, 32 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c1-1', text: 'Check 6 kV output to Turbo Compressor-1 Panel (66-15-014l-1).' },
        { id: 'tr-c1-2', text: 'LV cable from TR to panel: 3(1×120)mm² 6/10 kV EXeCGB, 56 m.' },
      ],
    },
    {
      id: 'TR-COMP-2',
      name: 'TR Compressor-2 (UT-COMP 4.6-2)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      layout: { building: 'utility', branchIndex: 9 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG16',
        gridRef: '66-15-020d-2',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_COMP2.STATUS', osapiensAssetId: 'AST-TR-COMP-2' },
      specs: {
        voltage: '35 kV / 6 kV',
        notes: 'Cable from F10 MV Panel 66-15-014f-6: 3(1×95)mm² 35 kV EXeCG, 31 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c2-1', text: 'Check 6 kV output to Turbo Compressor-2 Panel (66-15-014l-4).' },
      ],
    },
    {
      id: 'TR-COMP-3',
      name: 'TR Compressor-3 (UT-COMP 4.6-3)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      layout: { building: 'utility', branchIndex: 10 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG17',
        gridRef: '66-15-020d-4',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_COMP3.STATUS', osapiensAssetId: 'AST-TR-COMP-3' },
      specs: {
        voltage: '35 kV / 6 kV',
        notes: 'Cable from F20 MV Panel 66-15-014f-16: 3(1×95)mm² 35 kV EXeCG, 36 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c3-1', text: 'Check 6 kV output to Turbo Compressor-3 Panel.' },
      ],
    },
    {
      id: 'TR-COMP-4',
      name: 'TR Compressor-4 (UT-COMP 4.6-4)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      layout: { building: 'utility', branchIndex: 11 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG18',
        gridRef: '66-15-020d-3',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_COMP4.STATUS', osapiensAssetId: 'AST-TR-COMP-4' },
      specs: {
        voltage: '35 kV / 6 kV',
        notes: 'Cable from F20 MV Panel 66-15-014e-3: 3(1×95)mm² 35 kV EXeCG, 22 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c4-1', text: 'Check 6 kV output to Turbo Compressor-4 Panel.' },
      ],
    },

    // ── Utility LV Panels (400 V) — Tier 1 ──────────────────────────────────────
    {
      id: 'TR-DPC',
      name: 'TR-DPC PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 8,
      layout: { building: 'utility', branchIndex: 0 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: 'TR-DPC',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_DPC.STATUS', osapiensAssetId: 'AST-TR-DPC' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC with 1500 kVAr harmonic filter. Fed from TR-COMP-LV (TR-C).',
        manufacturer: 'TBC',
      },
      troubleshootingSteps: [
        { id: 'trdpc-1', text: 'Check main ACB status — ON/OFF/TRIP.' },
        { id: 'trdpc-2', text: 'Verify PFC capacitor bank — reactive power compensation active.' },
        { id: 'trdpc-3', text: 'Measure busbar voltage L1-L2-L3 (400 V ±5%).' },
      ],
    },
    {
      id: 'UT-MDP',
      name: 'UT-MDP — Utility Main Distribution Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 18,
      layout: { building: 'utility', branchIndex: 1 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: 'UT-MDP',
      },
      externalRefs: { scadaTag: 'LOMMEL.UT_MDP.STATUS', osapiensAssetId: 'AST-UT-MDP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, MEP classification. Main LV distribution for utility building services.',
        manufacturer: 'TBC',
      },
      troubleshootingSteps: [
        { id: 'utmdp-1', text: 'Check main ACB Q0 — ON/OFF/TRIP.' },
        { id: 'utmdp-2', text: 'Measure current on L1/L2/L3 at Q0 output.' },
        { id: 'utmdp-3', text: 'Check all outgoing MCCBs — identify tripped circuit.' },
      ],
    },
    {
      id: 'UT-UDP',
      name: 'UT-UDP — Utility UPS Distribution Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 6,
      layout: { building: 'utility', branchIndex: 2 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: 'UT-UDP',
      },
      externalRefs: { scadaTag: 'LOMMEL.UT_UDP.STATUS', osapiensAssetId: 'AST-UT-UDP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, MEP. UPS-backed distribution for critical utility building services.',
      },
      troubleshootingSteps: [
        { id: 'utudp-1', text: 'Check UPS bypass status — confirm UPS is on-line before switching.' },
        { id: 'utudp-2', text: 'Verify UPS battery autonomy — minimum 15 min at rated load.' },
      ],
    },
    {
      id: 'SAFETY-PANEL',
      name: 'Safety Loads Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 4,
      layout: { building: 'utility', branchIndex: 3 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Safety panel room',
        gridRef: 'SAFETY-PANEL',
      },
      externalRefs: { scadaTag: 'LOMMEL.SAFETY_PANEL.STATUS' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. Emergency / safety loads — fire suppression, emergency lighting, ESD circuits.',
      },
      troubleshootingSteps: [
        { id: 'safety-1', text: 'DO NOT isolate without fire safety officer authorisation.' },
        { id: 'safety-2', text: 'Check ATS (Automatic Transfer Switch) status — generator backup active?' },
      ],
    },

    // ── Generator System — Tier 2 ────────────────────────────────────────────────
    {
      id: 'GEN-SYNC',
      name: 'Generator Synchronization Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      layout: { building: 'utility', branchIndex: 4 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator synchronize room UG24',
        gridRef: 'GEN-SYNC',
      },
      externalRefs: { scadaTag: 'LOMMEL.GEN_SYNC.STATUS', osapiensAssetId: 'AST-GEN-SYNC' },
      specs: {
        voltage: '400 V',
        notes: 'Synchronization panel for 4× standby generators (GEN-1 to GEN-4). Controls parallel operation and load sharing.',
      },
      troubleshootingSteps: [
        { id: 'gensync-1', text: 'Check synchroscope — frequency and phase angle match before closing.' },
        { id: 'gensync-2', text: 'Verify load-sharing relay — equal current distribution across running generators.' },
      ],
    },
    {
      id: 'GEN-1',
      name: 'Generator-1 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      layout: { building: 'utility', branchIndex: 0 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-1',
      },
      externalRefs: { scadaTag: 'LOMMEL.GEN1.STATUS', osapiensAssetId: 'AST-GEN-1' },
      specs: {
        voltage: '400 V AC',
        power: '2 250 kVA',
        notes: 'Diesel standby generator. Automatic start on mains failure. Run test required weekly.',
      },
      troubleshootingSteps: [
        { id: 'gen1-1', text: 'Check diesel fuel level — minimum 50% for 8-hour run.' },
        { id: 'gen1-2', text: 'Verify coolant temperature and engine oil pressure.' },
        { id: 'gen1-3', text: 'Check battery charger — start batteries healthy.' },
      ],
    },
    {
      id: 'GEN-2',
      name: 'Generator-2 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      layout: { building: 'utility', branchIndex: 1 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-2',
      },
      externalRefs: { scadaTag: 'LOMMEL.GEN2.STATUS', osapiensAssetId: 'AST-GEN-2' },
      specs: { voltage: '400 V AC', power: '2 250 kVA', notes: 'Diesel standby generator.' },
      troubleshootingSteps: [
        { id: 'gen2-1', text: 'Check diesel fuel level — minimum 50%.' },
        { id: 'gen2-2', text: 'Verify coolant and oil.' },
      ],
    },
    {
      id: 'GEN-3',
      name: 'Generator-3 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      layout: { building: 'utility', branchIndex: 2 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-3',
      },
      externalRefs: { scadaTag: 'LOMMEL.GEN3.STATUS', osapiensAssetId: 'AST-GEN-3' },
      specs: { voltage: '400 V AC', power: '2 250 kVA', notes: 'Diesel standby generator.' },
      troubleshootingSteps: [
        { id: 'gen3-1', text: 'Check diesel fuel level — minimum 50%.' },
      ],
    },
    {
      id: 'GEN-4',
      name: 'Generator-4 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      layout: { building: 'utility', branchIndex: 3 },
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-4',
      },
      externalRefs: { scadaTag: 'LOMMEL.GEN4.STATUS', osapiensAssetId: 'AST-GEN-4' },
      specs: { voltage: '400 V AC', power: '2 250 kVA', notes: 'Diesel standby generator.' },
      troubleshootingSteps: [
        { id: 'gen4-1', text: 'Check diesel fuel level — minimum 50%.' },
      ],
    },
  ],

  edges: [

    // ── 35 kV Supply — Distribution Building → Main MV Panel ────────────────────
    {
      id: 'MV-SUPPLY-1',
      name: 'MV Supply-1 — Fluvius to Main MV Panel',
      source: 'DISTRIB-BLDG',
      target: 'MAIN-MV-PANEL',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240) mm² 35 kV EXeCG',
        voltage: '35 kV',
        notes: 'EAXECWB 3×1×630/35-np 20.8/36 kV, 5.5 km from Fluvius. Reference 66-15-014a-3.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-SUPPLY-2',
      name: 'MV Supply-2 — Fluvius to Main MV Panel',
      source: 'DISTRIB-BLDG',
      target: 'MAIN-MV-PANEL',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240)+(1×240 spare) mm² 35 kV EXeCG',
        voltage: '35 kV',
        notes: 'EAXECWB 3×1×630/35+(1×630 spare)-np 20.8/36 kV, 5.5 km. Reference 66-15-014a-4.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── Main MV Panel → F10 MV Panel ────────────────────────────────────────────
    {
      id: 'MV-MAIN-TO-F10',
      name: 'MV Feeder Main → F10 MV Panel',
      source: 'MAIN-MV-PANEL',
      target: 'F10-MV-PANEL',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240)+(1×240 spare) mm² 35 kV EXeCG',
        length: '459 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014b-5 → 66-15-014d-1. Dual cable run with spare core.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'mv-f10-1', text: 'Check VCB 66-15-014b-5 position and lockout status.' },
      ],
    },

    // ── Main MV Panel → F20 MV Panel ────────────────────────────────────────────
    {
      id: 'MV-MAIN-TO-F20',
      name: 'MV Feeder Main → F20 MV Panel',
      source: 'MAIN-MV-PANEL',
      target: 'F20-MV-PANEL',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '2×3(1×240)+(1×240 spare) mm² 35 kV EXeCG',
        voltage: '35 kV',
        notes: 'Reference 66-15-014b-6 → 66-15-014d-3.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── F10 MV Panel → TR1.1 / 1.2 / 1.3 ──────────────────────────────────────
    {
      id: 'MV-F10-TR1-1',
      name: 'MV Cable F10 MV Panel → TR 1.1',
      source: 'F10-MV-PANEL',
      target: 'TR1-1',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '134 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-1 → 66-15-020b-1.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F10-TR1-2',
      name: 'MV Cable F10 MV Panel → TR 1.2',
      source: 'F10-MV-PANEL',
      target: 'TR1-2',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '39 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-2 → 66-15-020b-2.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F10-TR1-3',
      name: 'MV Cable F10 MV Panel → TR 1.3',
      source: 'F10-MV-PANEL',
      target: 'TR1-3',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '28 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-3 → 66-15-020b-3.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F10-TR-SPARE',
      name: 'MV Cable F10 MV Panel → TR Spare',
      source: 'F10-MV-PANEL',
      target: 'TR-SPARE',
      edgeType: 'mv',
      status: 'investigation',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '21 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-4 → 66-15-020c-1. Normally isolated — spare transformer.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F10-COMP-LV',
      name: 'MV Cable F10 MV Panel → TR Compressor LV',
      source: 'F10-MV-PANEL',
      target: 'TR-COMP-LV',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '50 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-7 → 66-15-020c-2.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── F20 MV Panel → TR2.1 / 2.2 / 2.3 ──────────────────────────────────────
    {
      id: 'MV-F20-TR2-1',
      name: 'MV Cable F20 MV Panel → TR 2.1',
      source: 'F20-MV-PANEL',
      target: 'TR2-1',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '128 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-13 → 66-15-020b-4.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F20-TR2-2',
      name: 'MV Cable F20 MV Panel → TR 2.2',
      source: 'F20-MV-PANEL',
      target: 'TR2-2',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-14 → 66-15-020b-5.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F20-TR2-3',
      name: 'MV Cable F20 MV Panel → TR 2.3',
      source: 'F20-MV-PANEL',
      target: 'TR2-3',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-15 → 66-15-020b-6.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── Compressor transformer feeders (35 kV) ─────────────────────────────────
    {
      id: 'MV-F10-COMP1',
      name: 'MV Cable F10 MV Panel → TR Compressor-1',
      source: 'F10-MV-PANEL',
      target: 'TR-COMP-1',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '32 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-5 → 66-15-020d-1.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F10-COMP2',
      name: 'MV Cable F10 MV Panel → TR Compressor-2',
      source: 'F10-MV-PANEL',
      target: 'TR-COMP-2',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '31 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-6 → 66-15-020d-2.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F20-COMP3',
      name: 'MV Cable F20 MV Panel → TR Compressor-3',
      source: 'F20-MV-PANEL',
      target: 'TR-COMP-3',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '36 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014f-16 → 66-15-020d-4.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'MV-F20-COMP4',
      name: 'MV Cable F20 MV Panel → TR Compressor-4',
      source: 'F20-MV-PANEL',
      target: 'TR-COMP-4',
      edgeType: 'mv',
      status: 'operational',
      specs: {
        crossSection: '3(1×95) mm² 35 kV EXeCG',
        length: '22 m',
        voltage: '35 kV',
        notes: 'Reference 66-15-014e-3 → 66-15-020d-3.',
      },
      route: { pathType: 'underground', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── TR Compressor LV → TR-DPC ────────────────────────────────────────────────
    {
      id: 'LV-COMP-LV-TO-DPC',
      name: 'LV Feed TR Compressor LV → TR-DPC',
      source: 'TR-COMP-LV',
      target: 'TR-DPC',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', notes: 'TR-DPC PFC panel fed from TR Compressor LV (TR-C).' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── Utility LV distribution chain: TR-DPC → UT-MDP → UT-UDP ─────────────────
    {
      id: 'LV-DPC-TO-UTMDP',
      name: 'LV Feed TR-DPC → UT-MDP',
      source: 'TR-DPC',
      target: 'UT-MDP',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        notes: 'Utility main distribution panel fed from TR-DPC PFC busbar section.',
      },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'dpc-utmdp-1', text: 'Check outgoing MCCB Q-MDP in TR-DPC — ON/OFF/TRIP.' },
        { id: 'dpc-utmdp-2', text: 'Measure voltage at UT-MDP incoming terminals — 400 V ±5%.' },
      ],
    },
    {
      id: 'LV-UTMDP-TO-UTUDP',
      name: 'LV Feed UT-MDP → UT-UDP (UPS)',
      source: 'UT-MDP',
      target: 'UT-UDP',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        notes: 'UPS distribution panel mains input — UPS rectifier fed from UT-MDP.',
      },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'utmdp-udp-1', text: 'Check UPS input MCCB in UT-MDP and UPS rectifier status.' },
      ],
    },

    // ── Generator system connections ─────────────────────────────────────────────
    {
      id: 'GEN-SYNC-TO-SAFETY',
      name: 'Generator Sync → Safety Panel',
      source: 'GEN-SYNC',
      target: 'SAFETY-PANEL',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', notes: 'Generator sync panel feeds safety loads during mains failure.' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'GEN1-TO-SYNC',
      name: 'Generator-1 → Sync Panel',
      source: 'GEN-1',
      target: 'GEN-SYNC',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', power: '2 250 kVA', notes: 'Generator output to synchronization panel.' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'GEN2-TO-SYNC',
      name: 'Generator-2 → Sync Panel',
      source: 'GEN-2',
      target: 'GEN-SYNC',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', power: '2 250 kVA' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'GEN3-TO-SYNC',
      name: 'Generator-3 → Sync Panel',
      source: 'GEN-3',
      target: 'GEN-SYNC',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', power: '2 250 kVA' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'GEN4-TO-SYNC',
      name: 'Generator-4 → Sync Panel',
      source: 'GEN-4',
      target: 'GEN-SYNC',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', power: '2 250 kVA' },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },
  ],
};
