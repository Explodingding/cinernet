import type { SiteInstallation } from '@/types/topology';
import {
  mainHvPanelCells,
  mainFeedTransformers,
  buildMainPanelEdges,
} from './main-hv-panel';

/**
 * Utility Building — central electrical hub for the Lommel site.
 *
 * Source drawings:
 *   SMT-5255  CNRBE-PMEP20-AB-XXX  HV Distribution System Riser Plan (26 kV)
 *   SMT-5250  CNRBE-PMEP18-AB-XXX  Power Distribution System Riser Plan (400 V)
 *   LAY-5246  CNRBE-PMEP20-UB-000  Utility Building Ground Floor (0.00 level)
 *
 * Ground floor (0 m) — 26 kV MAIN PANEL cells 1–11 (UG03) with feeder transformers
 * TR-01…TR-04 above the lineup; compressor bays and generator rooms UG24–25.
 */
export const utilityInstallation: SiteInstallation = {
  id: 'utility',
  label: 'Utility Building',
  nodes: [

    // ── 26 kV MAIN PANEL lineup (cells 1–11) + feeder transformers TR-01…04 ───
    ...mainHvPanelCells,
    ...mainFeedTransformers,

    // ── TR Spare + TR Compressor LV ─────────────────────────────────────────────
    {
      id: 'TR-SPARE',
    position: { x: 0, y: 0 },
      name: 'TR Spare — 3 150 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'investigation',
      displayTier: 2,
      subsystem: 'lv-400v',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG09 (TR-S)',
        gridRef: '66-15-020c-1',
      },
      specs: {
        voltage: '26 kV / 400 V',
        power: '3 150 kVA',
        notes: 'Spare transformer — standby for main feeder transformer replacement. Fed from MAIN PANEL Cell 11 tie position.',
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
Asset: TR-SPARE — 3 150 kVA 26 kV / 400 V spare transformer
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
    position: { x: 0, y: 2240 },
      name: 'TR Compressor LV — 3 150 kVA',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 2,
      subsystem: 'lv-400v',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG10 (TR-C)',
        gridRef: '66-15-020c-2',
      },
      specs: {
        voltage: '26 kV / 400 V',
        power: '3 150 kVA',
        notes: 'Legacy compressor auxiliary transformer — superseded by TR-02 utility feeder at Tier 1.',
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
    position: { x: 0, y: 2280 },
      name: 'TR Compressor-1 (UT-COMP 4.6-1)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      circuitCount: 0,
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG15',
        gridRef: '66-15-020d-1',
      },
      specs: {
        voltage: '26 kV / 6 kV',
        notes: 'Feeds Turbo Compressor-1 Panel at 6 kV. Cable from F10 MV Panel 66-15-014f-5: 3(1×95)mm² 26 kV EXeCG, 32 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c1-1', text: 'Check 6 kV output to Turbo Compressor-1 Panel (66-15-014l-1).' },
        { id: 'tr-c1-2', text: 'LV cable from TR to panel: 3(1×120)mm² 6/10 kV EXeCGB, 56 m.' },
      ],
    },
    {
      id: 'TR-COMP-2',
    position: { x: 0, y: 2320 },
      name: 'TR Compressor-2 (UT-COMP 4.6-2)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG16',
        gridRef: '66-15-020d-2',
      },
      specs: {
        voltage: '26 kV / 6 kV',
        notes: 'Cable from F10 MV Panel 66-15-014f-6: 3(1×95)mm² 26 kV EXeCG, 31 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c2-1', text: 'Check 6 kV output to Turbo Compressor-2 Panel (66-15-014l-4).' },
      ],
    },
    {
      id: 'TR-COMP-3',
    position: { x: 0, y: 2360 },
      name: 'TR Compressor-3 (UT-COMP 4.6-3)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG17',
        gridRef: '66-15-020d-4',
      },
      specs: {
        voltage: '26 kV / 6 kV',
        notes: 'Cable from F20 MV Panel 66-15-014f-16: 3(1×95)mm² 26 kV EXeCG, 36 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c3-1', text: 'Check 6 kV output to Turbo Compressor-3 Panel.' },
      ],
    },
    {
      id: 'TR-COMP-4',
    position: { x: 0, y: 2400 },
      name: 'TR Compressor-4 (UT-COMP 4.6-4)',
      assetType: 'transformer',
      layer: 'transformer',
      status: 'operational',
      displayTier: 3,
      subsystem: 'lv-6kv',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Transformer bay UG18',
        gridRef: '66-15-020d-3',
      },
      specs: {
        voltage: '26 kV / 6 kV',
        notes: 'Cable from F20 MV Panel 66-15-014e-3: 3(1×95)mm² 26 kV EXeCG, 22 m.',
      },
      troubleshootingSteps: [
        { id: 'tr-c4-1', text: 'Check 6 kV output to Turbo Compressor-4 Panel.' },
      ],
    },

    // ── Utility LV Panels (400 V) — Tier 1 ──────────────────────────────────────
    {
      id: 'TR-DPC',
    position: { x: 0, y: 2440 },
      name: 'TR-DPC PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 8,
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: 'TR-DPC',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC with 1500 kVAr harmonic filter. Fed from TR-02 (Utility feeder transformer).',
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
    position: { x: 0, y: 2180 },
      name: 'UT-MDP — Utility Main Distribution Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 18,
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: 'UT-MDP',
      },
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
    position: { x: 0, y: 2220 },
      name: 'UT-UDP — Utility UPS Distribution Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 6,
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Mid power panels room UG03',
        gridRef: 'UT-UDP',
      },
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
    position: { x: 0, y: 2260 },
      name: 'Safety Loads Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 4,
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Safety panel room',
        gridRef: 'SAFETY-PANEL',
      },
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
    position: { x: 0, y: 2300 },
      name: 'Generator Synchronization Panel',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator synchronize room UG24',
        gridRef: 'GEN-SYNC',
      },
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
    position: { x: 0, y: 2340 },
      name: 'Generator-1 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-1',
      },
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
    position: { x: 0, y: 1020 },
      name: 'Generator-2 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-2',
      },
      specs: { voltage: '400 V AC', power: '2 250 kVA', notes: 'Diesel standby generator.' },
      troubleshootingSteps: [
        { id: 'gen2-1', text: 'Check diesel fuel level — minimum 50%.' },
        { id: 'gen2-2', text: 'Verify coolant and oil.' },
      ],
    },
    {
      id: 'GEN-3',
    position: { x: 0, y: 1060 },
      name: 'Generator-3 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-3',
      },
      specs: { voltage: '400 V AC', power: '2 250 kVA', notes: 'Diesel standby generator.' },
      troubleshootingSteps: [
        { id: 'gen3-1', text: 'Check diesel fuel level — minimum 50%.' },
      ],
    },
    {
      id: 'GEN-4',
    position: { x: 0, y: 1100 },
      name: 'Generator-4 — 2 250 kVA Standby',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      subsystem: 'generator',
      physicalLocation: {
        building: 'utility',
        zone: 'utility-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Generator room UG25',
        gridRef: 'GEN-4',
      },
      specs: { voltage: '400 V AC', power: '2 250 kVA', notes: 'Diesel standby generator.' },
      troubleshootingSteps: [
        { id: 'gen4-1', text: 'Check diesel fuel level — minimum 50%.' },
      ],
    },
  
  {
    id: 'TR-DP',
    name: 'TR-DP 1.2 PFC WITH HARMONIC FILTER 1500kVAr',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y1-5.5-LVR',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Elevated (+5.5m)',
      elevation: '5.5 m',
      area: 'Low voltage room',
      gridRef: 'Y1',
    },
    position: { x: 425, y: 540 },
  },
  {
    id: 'UT-COMP4-1',
    name: '4 BAR COMPRESSOR UT-COMP4-1 264 kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y2-0.0-CPH',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'Compressorhal',
      gridRef: 'Y2',
    },
    position: { x: 2700, y: 1540 },
  },
  {
    id: 'UT-DRY4-1',
    name: '4 BAR DRYER  UT-DRY4-1 58.5kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y2-0.0-CPH',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'Compressorhal',
      gridRef: 'Y2',
    },
    position: { x: 2745, y: 1540 },
  },
  {
    id: 'TR-DP1',
    name: 'TR-DP1 PFC WITH HARMONIC FILTER 1500kVAr',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y1-5.5-LVR',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Elevated (+5.5m)',
      elevation: '5.5 m',
      area: 'Low voltage room',
      gridRef: 'Y1',
    },
    position: { x: 290, y: 1540 },
  },
  {
    id: 'UT-COMP7-1',
    name: '7 BAR COMPRESSOR UT-COMP7-1 ZT355VSD+ 2X354,3A',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y3-0.0-CPH',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'Compressorhal',
      gridRef: 'Y3',
    },
    position: { x: 2790, y: 1540 },
  },
  {
    id: '7',
    name: '7 BAR COMPRESSOR UT_COMP7-2 ZT355VSD+ 2X354.4A',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y3-0.0-CPH',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'Compressorhal',
      gridRef: 'Y3',
    },
    position: { x: 3066, y: 1540 },
  },
  {
    id: 'SAFETY',
    name: 'SAFETY PANEL 400V/230V',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y1-0.0-STR',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'Safety Transformer Room',
      gridRef: 'Y1',
    },
    position: { x: 5950, y: 1540 },
  },
  {
    id: 'PANEL-4',
    name: 'UTILITY EMERGENCY LIFT PANEL-4 UT-LP4',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y1-0.0-CRR',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'CRR',
      gridRef: 'Y1',
    },
    position: { x: 6200, y: 1540 },
  },
  {
    id: 'UT-FMCC',
    name: 'UTILITY Smoke exhaust fan 4x15kW (UT-FMCC)',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y1-5.5-LVR',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Elevated (+5.5m)',
      elevation: '5.5 m',
      area: 'Low voltage room',
      gridRef: 'Y1',
    },
    position: { x: 658, y: 1540 },
  },
  {
    id: 'F1-OC-UDP',
    name: 'F1-OC-UDP (OVEN COMMAND) 92.80kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y1-9.0-BFC',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Elevated (+9.0m)',
      elevation: '9.0 m',
      area: 'Batch & Furnace Control Room',
      gridRef: 'Y1',
    },
    position: { x: 10200, y: 1540 },
  },
  {
    id: 'UT-MCC',
    name: 'UT-MCC.2 607.04kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-Y3-5.5-FSS',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Elevated (+5.5m)',
      elevation: '5.5 m',
      area: 'FSS',
      gridRef: 'Y3',
    },
    position: { x: 11200, y: 1540 },
  },
  {
    id: 'UT-UP',
    name: 'UT-UP 41,80kW',
    assetType: 'panel',
    layer: 'lv-panel',
    status: 'operational',
    specs: {
      location: 'UTB-A2-0.0-UTW',
    },
    physicalLocation: {
      building: 'utility',
      zone: 'utility-ground',
      floor: 'Ground Floor',
      elevation: '0.0 m',
      area: 'UTW',
      gridRef: 'A2',
    },
    position: { x: 7200, y: 1620 },
  },
],

  edges: [

    // ── 26 kV MAIN PANEL busbar + feeder risers (cells 1–11 → TR-01…04) ────────
    ...buildMainPanelEdges(),

    // ── HV incoming from external Substation is in substation.ts ─────────────────

    // ── TR-02 (Utility) → LV distribution chain ────────────────────────────────
    {
      id: 'LV-TR02-TO-UTMDP',
      name: 'LV Feed TR-02 → UT-MDP',
      source: 'TR-02',
      target: 'UT-MDP',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        notes: 'Main utility LV distribution — TR-02 secondary to UT-MDP incoming.',
      },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'tr02-utmdp-1', text: 'Measure voltage at TR-02 LV busbar and UT-MDP incoming — 400 V ±5%.' },
      ],
    },
    {
      id: 'LV-TR02-TO-DPC',
      name: 'LV Feed TR-02 → TR-DPC',
      source: 'TR-02',
      target: 'TR-DPC',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        notes: 'TR-DPC PFC panel fed from TR-02 utility feeder transformer.',
      },
      route: { pathType: 'internal', spansBuildings: false },
      troubleshootingSteps: [],
    },

    // ── Tier 2/3 legacy transformer bays (fed from panel tie cell) ───────────────
    {
      id: 'HV-CELL05-TO-COMP-LV',
      name: '26 kV feeder Cell 5 → TR Compressor LV',
      source: 'MAIN-HV-CELL-05',
      target: 'TR-COMP-LV',
      edgeType: 'hv',
      status: 'operational',
      specs: { voltage: '26 kV', notes: 'Legacy compressor LV transformer bay — Tier 2 detail.' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'HV-CELL11-TO-TR-SPARE',
      name: '26 kV feeder Cell 11 → TR Spare',
      source: 'MAIN-HV-CELL-11',
      target: 'TR-SPARE',
      edgeType: 'hv',
      status: 'investigation',
      specs: { voltage: '26 kV', notes: 'Spare transformer bay — normally isolated.' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'HV-CELL11-COMP1',
      name: '26 kV feeder Cell 11 → TR Compressor-1',
      source: 'MAIN-HV-CELL-11',
      target: 'TR-COMP-1',
      edgeType: 'hv',
      status: 'operational',
      specs: { voltage: '26 kV', notes: '6 kV compressor transformer — Tier 3 detail.' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'HV-CELL11-COMP2',
      name: '26 kV feeder Cell 11 → TR Compressor-2',
      source: 'MAIN-HV-CELL-11',
      target: 'TR-COMP-2',
      edgeType: 'hv',
      status: 'operational',
      specs: { voltage: '26 kV', notes: '6 kV compressor transformer — Tier 3 detail.' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'HV-CELL11-COMP3',
      name: '26 kV feeder Cell 11 → TR Compressor-3',
      source: 'MAIN-HV-CELL-11',
      target: 'TR-COMP-3',
      edgeType: 'hv',
      status: 'operational',
      specs: { voltage: '26 kV', notes: '6 kV compressor transformer — Tier 3 detail.' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'HV-CELL11-COMP4',
      name: '26 kV feeder Cell 11 → TR Compressor-4',
      source: 'MAIN-HV-CELL-11',
      target: 'TR-COMP-4',
      edgeType: 'hv',
      status: 'operational',
      specs: { voltage: '26 kV', notes: '6 kV compressor transformer — Tier 3 detail.' },
      route: { pathType: 'riser', spansBuildings: false },
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
