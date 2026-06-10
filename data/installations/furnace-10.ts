import type { SiteInstallation } from '@/types/topology';

/**
 * Furnace 10 Building — LV distribution from real single-line diagram.
 *
 * Source drawing: SMT-5250 CNRBE-PMEP18-AB-XXX — Power Distribution System Riser Plan
 *
 * Power hierarchy:
 *   TR1.1 / TR1.2 / TR1.3 (utility building, 2500 kVA each)
 *     → TR-DP1.1 / TR-DP1.2 / TR-DP1.3  (PFC 1500 kVAr panels, Furnace 10, IP31 Form 4B TYPE6)
 *       → F1-MDP-1 … F1-MDP-9, F1-HOT-DP, F1-GEN-DP, F1-GEN-UP,
 *         F1-COLD-DP, F1-UO-DP, F1-MZ-DP, HOT-10, MHO-10, FH10,
 *         WE&FH10.1–10.4, CAF10.1–10.2, TC10.1–10.2
 *
 * Building floor levels (from riser plan):
 *   -8.590 m (basement), 0.00 m (ground), +5.135 m, +11.935 m …up to +42.170 m
 */
export const furnace10Installation: SiteInstallation = {
  id: 'furnace-10',
  label: 'Furnace 10 Building',
  nodes: [

    // ── Tier 1: PFC / Main incoming panels ──────────────────────────────────────
    // These receive 400 V LV supply from TR1.1/1.2/1.3 in the Utility Building.
    {
      id: 'TR-DP1-1',
      name: 'TR-DP1.1 — PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 12,
      layout: { building: 'furnace-10', branchIndex: 0 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 electrical room',
        gridRef: 'TR-DP1.1',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_DP1_1.STATUS', osapiensAssetId: 'AST-TR-DP1-1' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC with 1 500 kVAr harmonic filter. Fed from TR1.1 (Utility Building, 2 500 kVA).',
        manufacturer: 'TBC',
      },
      troubleshootingSteps: [
        { id: 'trdp11-1', text: 'Check main ACB Q0 (ON/OFF/TRIP) and PFC relay — reactive compensation active.' },
        { id: 'trdp11-2', text: 'Measure busbar voltage: 400 V ±5%.' },
        { id: 'trdp11-3', text: 'If PFC capacitor trip — check cooling and capacitor fuses.' },
      ],
      docs: [
        {
          id: 'doc-trdp11-sld',
          title: 'SLD — Furnace 10 LV Distribution (TR-DP1.x)',
          type: 'drawing',
          url: '/cinernet/docs/SMT-5255.pdf',
          author: 'Engineering dept.',
          date: '2025-12-01',
          revision: 'Rev. 2',
        },
        {
          id: 'doc-trdp11-comm',
          title: 'Commissioning Record — TR-DP1.1 First Energisation',
          type: 'commissioning',
          author: 'M. Nowak',
          date: '2026-04-11',
          content: `TR-DP1.1 PFC PANEL — COMMISSIONING RECORD
Asset: TR-DP1.1 — PFC Panel 1 500 kVAr, Furnace 10 electrical room
Date: 11 April 2026
Commissioning engineer: M. Nowak

PRE-ENERGISATION CHECKS:
✓ Panel delivery inspection — no transport damage
✓ Busbar torque verified — all connections at rated torque
✓ PFC controller (Nokian Capacitor) settings programmed:
   Target power factor: cos φ = 0.97
   Response delay: 20 s per step
   Harmonic filter enabled (5th + 7th harmonics)
✓ ACB Q0 settings: 1 600 A rating, overload 100%, short-circuit delay 300 ms
✓ Insulation test 500 V DC: L1=840MΩ, L2=910MΩ, L3=875MΩ — pass

ENERGISATION SEQUENCE:
09:42 — Supply cable LV-TR11-DP11 energised from TR1.1 LV busbar
09:44 — Busbar voltage: L1-L2=401V, L2-L3=400V, L3-L1=402V — within tolerance
09:50 — PFC relay auto-switched capacitor bank 1 (step 1) — power factor improved to 0.96
10:05 — All 12 outgoing MCCBs tested individually — all operate correctly
10:20 — 2-hour load soak test completed — temperature rise normal

STATUS: PASSED — panel handed over to operations 11 April 2026`,
        },
      ],
    },
    {
      id: 'TR-DP1-2',
      name: 'TR-DP1.2 — PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 10,
      layout: { building: 'furnace-10', branchIndex: 1 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 electrical room',
        gridRef: 'TR-DP1.2',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_DP1_2.STATUS', osapiensAssetId: 'AST-TR-DP1-2' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC 1 500 kVAr. Fed from TR1.2 (Utility Building).',
      },
      troubleshootingSteps: [
        { id: 'trdp12-1', text: 'Check main ACB Q0 and PFC relay.' },
        { id: 'trdp12-2', text: 'Measure busbar voltage: 400 V ±5%.' },
      ],
    },
    {
      id: 'TR-DP1-3',
      name: 'TR-DP1.3 — PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 10,
      layout: { building: 'furnace-10', branchIndex: 2 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 electrical room',
        gridRef: 'TR-DP1.3',
      },
      externalRefs: { scadaTag: 'LOMMEL.TR_DP1_3.STATUS', osapiensAssetId: 'AST-TR-DP1-3' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC 1 500 kVAr. Fed from TR1.3 (Utility Building).',
      },
      troubleshootingSteps: [
        { id: 'trdp13-1', text: 'Check main ACB Q0 and PFC relay.' },
        { id: 'trdp13-2', text: 'Measure busbar voltage: 400 V ±5%.' },
      ],
    },

    // ── Tier 2: Main Distribution Panels (F1-MDP) ────────────────────────────────
    {
      id: 'F1-MDP-1',
      name: 'F1-MDP-1 — Main Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 16,
      layout: { building: 'furnace-10', branchIndex: 0 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — electrical room ground floor',
        gridRef: 'F1-MDP-1',
      },
      externalRefs: { scadaTag: 'LOMMEL.F1_MDP1.STATUS', osapiensAssetId: 'AST-F1-MDP-1' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. General distribution panel for Furnace 10 ground floor.',
      },
      troubleshootingSteps: [
        { id: 'f1mdp1-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'f1mdp1-2', text: 'Measure busbar voltage L1-L2-L3.' },
      ],
      docs: [
        {
          id: 'doc-f1mdp1-layout',
          title: 'Furnace 10 — Panel Location Drawing',
          type: 'drawing',
          url: '/cinernet/docs/LAY-5246.pdf',
          author: 'Engineering dept.',
          date: '2026-01-20',
          revision: 'Rev. 1',
        },
        {
          id: 'doc-f1mdp1-op',
          title: 'Operating Instructions — F1-MDP Distribution Panels',
          type: 'protocol',
          author: 'Maintenance dept.',
          date: '2026-04-12',
          revision: 'Rev. 1',
          content: `OPERATING INSTRUCTIONS — F1-MDP DISTRIBUTION PANELS
Applies to: F1-MDP-1 through F1-MDP-9 (Furnace 10 Ground Floor)
Revision: 1 — April 2026

NORMAL OPERATION:
• Main ACB Q0 should be ON (green indicator). Check every shift start.
• Busbar voltage L1/L2/L3: 400 V ±5%. Measure monthly at Q0 downstream terminals.
• All outgoing MCCBs should be ON unless circuit is decommissioned (tagged + locked).
• Panel interior temperature max 45 °C. Check ventilation louvres are unobstructed.

ISOLATION PROCEDURE (for maintenance on downstream circuit):
1. Identify the specific outgoing MCCB to be isolated (see circuit schedule on panel door).
2. Inform shift supervisor — record in shift log.
3. Switch MCCB to OFF position.
4. Apply LOTO: insert locking hasp into MCCB handle; attach personal padlock.
5. Attach isolation tag: "CIRCUIT ISOLATED — DO NOT RE-ENERGISE".
6. Verify absence of voltage at downstream terminals with approved test meter.

RE-ENERGISATION AFTER MAINTENANCE:
1. Receive confirmation from authorised maintenance person that work is complete.
2. Confirm all personnel are clear of the circuit.
3. Remove LOTO and isolation tag.
4. Switch MCCB to ON position — check load current on ammeter if fitted.
5. Record re-energisation time and operator name in shift log.

EMERGENCY:
• If smoke, burning smell, or fire: open main ACB Q0 IMMEDIATELY, evacuate.
• If MCCB trips repeatedly: DO NOT reset more than once. Investigate fault cause.
• Emergency contact: Shift Supervisor ext. 2100 / Site Emergency 2999`,
        },
      ],
    },
    {
      id: 'F1-MDP-9',
      name: 'F1-MDP-9 — Main Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 20,
      layout: { building: 'furnace-10', branchIndex: 1 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — main electrical room',
        gridRef: 'F1-MDP-9',
      },
      externalRefs: { scadaTag: 'LOMMEL.F1_MDP9.STATUS', osapiensAssetId: 'AST-F1-MDP-9' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, PROCESS. Higher form factor — larger distribution section.',
      },
      troubleshootingSteps: [
        { id: 'f1mdp9-1', text: 'Check ACB Q0 — ON/OFF/TRIP.' },
        { id: 'f1mdp9-2', text: 'Measure busbar voltage L1-L2-L3.' },
      ],
    },
    {
      id: 'F1-HOT-DP',
      name: 'F1-HOT-DP — Hot Zone Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 14,
      layout: { building: 'furnace-10', branchIndex: 2 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 hot zone',
        gridRef: 'F1-HOT-DP',
      },
      externalRefs: { scadaTag: 'LOMMEL.F1_HOT_DP.STATUS', osapiensAssetId: 'AST-F1-HOT-DP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, PROCESS. Hot zone feeder distribution.',
      },
      troubleshootingSteps: [
        { id: 'f1hot-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'f1hot-2', text: 'Verify hot zone equipment isolation before working near furnace.' },
      ],
    },
    {
      id: 'F1-GEN-DP',
      name: 'F1-GEN-DP — Generator Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 10,
      layout: { building: 'furnace-10', branchIndex: 3 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — generator feed section',
        gridRef: 'F1-GEN-DP',
      },
      externalRefs: { scadaTag: 'LOMMEL.F1_GEN_DP.STATUS', osapiensAssetId: 'AST-F1-GEN-DP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, PROCESS. Generator-backed distribution for furnace critical loads.',
      },
      troubleshootingSteps: [
        { id: 'f1gendp-1', text: 'Check ATS status — confirm mains or generator source active.' },
        { id: 'f1gendp-2', text: 'Check ACB Q0 — ON/OFF/TRIP.' },
      ],
    },
    {
      id: 'F1-GEN-UP',
      name: 'F1-GEN-UP — UPS Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 6,
      layout: { building: 'furnace-10', branchIndex: 4 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — UPS room',
        gridRef: 'F1-GEN-UP',
      },
      externalRefs: { scadaTag: 'LOMMEL.F1_GEN_UP.STATUS', osapiensAssetId: 'AST-F1-GEN-UP' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. UPS-backed panel for Furnace 10 instrumentation and control.',
      },
      troubleshootingSteps: [
        { id: 'f1genup-1', text: 'Check UPS bypass position — on-line or bypass mode.' },
        { id: 'f1genup-2', text: 'Verify UPS battery health — minimum autonomy 15 min.' },
      ],
    },
    {
      id: 'HOT-10',
      name: 'HOT-10 — Hot Zone Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 8,
      layout: { building: 'furnace-10', branchIndex: 5 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-elevated',
        floor: 'Elevated',
        elevation: '+5.135 m',
        area: 'Furnace 10 — hot zone elevated level',
        gridRef: 'HOT-10',
      },
      externalRefs: { scadaTag: 'LOMMEL.HOT10.STATUS', osapiensAssetId: 'AST-HOT-10' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. Hot zone distribution at +5.135 m level.',
      },
      troubleshootingSteps: [
        { id: 'hot10-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'hot10-2', text: 'Use heat-rated PPE when working near furnace at elevated level.' },
      ],
    },
    {
      id: 'MHO-10',
      name: 'MHO-10 — Mechanical Hot Zone Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 6,
      layout: { building: 'furnace-10', branchIndex: 6 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — mechanical hot zone',
        gridRef: 'MHO-10',
      },
      externalRefs: { scadaTag: 'LOMMEL.MHO10.STATUS', osapiensAssetId: 'AST-MHO-10' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. Mechanical services hot zone distribution.',
      },
      troubleshootingSteps: [
        { id: 'mho10-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
      ],
    },
    {
      id: 'FH10',
      name: 'FH10 — Field Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 4,
      layout: { building: 'furnace-10', branchIndex: 7 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — field services',
        gridRef: 'FH10',
      },
      externalRefs: { scadaTag: 'LOMMEL.FH10.STATUS', osapiensAssetId: 'AST-FH10' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'fh10-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
      ],
    },
    {
      id: 'F1-MDP-9-HOT',
      name: 'F1-MDP-9 (HOT) — HOT-10 Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 12,
      layout: { building: 'furnace-10', branchIndex: 8 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — hot zone main supply',
        gridRef: 'F1-MDP-9-HOT',
      },
      externalRefs: { scadaTag: 'LOMMEL.F1_MDP9_HOT.STATUS' },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP55, Form 2B, PROCESS — weatherproof rating for hot zone environment.',
      },
      troubleshootingSteps: [
        { id: 'f1mdp9hot-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'f1mdp9hot-2', text: 'Verify IP55 enclosure seal — condensation risk in hot zone.' },
      ],
    },

    // ── Tier 3: Process loads (motors, fans, pumps) ──────────────────────────────
    // Fed from Tier 2 cabinets. Visible at activeTier === 3.
    // These sit at the base of the cascade: a fault on MAIN-HV-CELL-04 / TR-01 reaches here
    // through TR1.x → TR-DP1.x → F1-MDP-x / F1-HOT-DP → these loads.

    {
      id: 'PUMP-F10-COOL-1',
      name: 'Furnace Cooling Water Pump — P10.01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'furnace-10', branchIndex: 0 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — cooling water pump room',
        gridRef: 'P10.01',
      },
      externalRefs: { scadaTag: 'LOMMEL.F10.P1001.STATUS', osapiensAssetId: 'AST-P10-01' },
      specs: {
        voltage: '400 V',
        power: '22 kW',
        current: '42 A',
        protection: 'IP55',
        manufacturer: 'ABB',
        notes: 'Furnace primary cooling circuit pump. Duty/standby pair (P10.01/P10.02).',
      },
      troubleshootingSteps: [
        { id: 'p1001-1', text: 'Check starter/VFD status — FAULT LED or HMI alarm code.' },
        { id: 'p1001-2', text: 'Verify cooling water flow: minimum 12 m³/h at 3 bar.' },
        { id: 'p1001-3', text: 'Check motor thermistor — resistance < 1 kΩ (OK), > 3 kΩ (overtemp).' },
        { id: 'p1001-4', text: 'If no power: trace upstream to F1-MDP-1 → TR-DP1.1 → TR 1.1 → F10 MV Panel.' },
      ],
    },
    {
      id: 'PUMP-F10-COOL-2',
      name: 'Furnace Cooling Water Pump — P10.02 (Standby)',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'furnace-10', branchIndex: 1 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — cooling water pump room',
        gridRef: 'P10.02',
      },
      externalRefs: { scadaTag: 'LOMMEL.F10.P1002.STATUS', osapiensAssetId: 'AST-P10-02' },
      specs: {
        voltage: '400 V',
        power: '22 kW',
        current: '42 A',
        protection: 'IP55',
        manufacturer: 'ABB',
        notes: 'Standby cooling pump — automatic switchover on P10.01 failure.',
      },
      troubleshootingSteps: [
        { id: 'p1002-1', text: 'Verify ATS (auto-transfer) relay — standby mode active.' },
        { id: 'p1002-2', text: 'Check motor thermistor and manual isolator position.' },
        { id: 'p1002-3', text: 'If both pumps off: cooling circuit fault — escalate to process engineer.' },
      ],
    },
    {
      id: 'CAF10-1',
      name: 'Furnace Cooling Air Fan — CAF10.01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'furnace-10', branchIndex: 5 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-elevated',
        floor: 'Elevated',
        elevation: '+5.135 m',
        area: 'Furnace 10 — hot zone mezzanine, cooling air supply',
        gridRef: 'CAF10.01',
      },
      externalRefs: { scadaTag: 'LOMMEL.F10.CAF1001.STATUS', osapiensAssetId: 'AST-CAF10-01' },
      specs: {
        voltage: '400 V',
        power: '11 kW',
        current: '22 A',
        protection: 'IP55',
        manufacturer: 'Ziehl-Abegg',
        notes: 'Primary crown cooling air fan. Interlocked with furnace temperature — stops at ΔT < 30 °C.',
      },
      troubleshootingSteps: [
        { id: 'caf1001-1', text: 'Check HOT-10 cabinet outgoing breaker — tripped or open.' },
        { id: 'caf1001-2', text: 'Verify interlock relay — confirm furnace temp above start threshold.' },
        { id: 'caf1001-3', text: 'Check VFD speed reference signal (4–20 mA loop from DCS).' },
        { id: 'caf1001-4', text: 'If no power: check HOT-10 → F1-HOT-DP → TR-DP1.3 → TR 1.3 → F10 MV Panel.' },
      ],
    },
    {
      id: 'CAF10-2',
      name: 'Furnace Cooling Air Fan — CAF10.02',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'furnace-10', branchIndex: 6 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-elevated',
        floor: 'Elevated',
        elevation: '+5.135 m',
        area: 'Furnace 10 — hot zone mezzanine, cooling air exhaust',
        gridRef: 'CAF10.02',
      },
      externalRefs: { scadaTag: 'LOMMEL.F10.CAF1002.STATUS', osapiensAssetId: 'AST-CAF10-02' },
      specs: {
        voltage: '400 V',
        power: '11 kW',
        current: '22 A',
        protection: 'IP55',
        manufacturer: 'Ziehl-Abegg',
        notes: 'Secondary crown cooling air fan — exhaust side.',
      },
      troubleshootingSteps: [
        { id: 'caf1002-1', text: 'Check HOT-10 cabinet outgoing breaker for CAF10.02 circuit.' },
        { id: 'caf1002-2', text: 'Inspect fan blades for obstruction — high vibration = blade damage.' },
      ],
    },
    {
      id: 'DRIVE-F10-BATCH-1',
      name: 'Batch Charger Drive Motor — M10.BCH.01',
      assetType: 'motor',
      layer: 'load',
      status: 'operational',
      displayTier: 3,
      layout: { building: 'furnace-10', branchIndex: 3 },
      physicalLocation: {
        building: 'furnace-10',
        zone: 'furnace-10-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 10 — batch charging end wall',
        gridRef: 'M10.BCH.01',
      },
      externalRefs: { scadaTag: 'LOMMEL.F10.BCH01.STATUS', osapiensAssetId: 'AST-BCH10-01' },
      specs: {
        voltage: '400 V',
        power: '30 kW',
        current: '57 A',
        protection: 'IP54',
        manufacturer: 'Siemens',
        notes: 'Batch charger pusher drive — VFD controlled via PROFIBUS. Critical: loss of batch feed stops furnace.',
      },
      troubleshootingSteps: [
        { id: 'bch01-1', text: 'Check Sinamics VFD fault code on drive display.' },
        { id: 'bch01-2', text: 'Verify PROFIBUS communication — PLC heartbeat signal.' },
        { id: 'bch01-3', text: 'Check motor encoder — loss of feedback causes F0007 fault.' },
        { id: 'bch01-4', text: 'If no power: check F1-GEN-DP outgoing breaker Q-BCH01.' },
        { id: 'bch01-5', text: 'CRITICAL: Notify process supervisor immediately — batch gap > 15 min risks furnace temperature drop.' },
      ],
    },
  ],

  edges: [
    // Cross-building feeders from Utility Building transformers are in site-feeders.ts.
    // Internal Furnace 10 distribution:

    {
      id: 'LV-DP11-MDP1',
      name: 'LV Feed TR-DP1.1 → F1-MDP-1',
      source: 'TR-DP1-1',
      target: 'F1-MDP-1',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', notes: 'Internal busway / cable from PFC panel to distribution panel.' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-DP12-MDP9',
      name: 'LV Feed TR-DP1.2 → F1-MDP-9',
      source: 'TR-DP1-2',
      target: 'F1-MDP-9',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-DP13-HOT-DP',
      name: 'LV Feed TR-DP1.3 → F1-HOT-DP',
      source: 'TR-DP1-3',
      target: 'F1-HOT-DP',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-MDP9-GEN-DP',
      name: 'LV Feed F1-MDP-9 → F1-GEN-DP',
      source: 'F1-MDP-9',
      target: 'F1-GEN-DP',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-MDP9-GEN-UP',
      name: 'LV Feed F1-MDP-9 → F1-GEN-UP',
      source: 'F1-MDP-9',
      target: 'F1-GEN-UP',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-HOT-DP-HOT10',
      name: 'LV Feed F1-HOT-DP → HOT-10',
      source: 'F1-HOT-DP',
      target: 'HOT-10',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', installationType: 'Riser to +5.135 m level' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-MDP1-MHO10',
      name: 'LV Feed F1-MDP-1 → MHO-10',
      source: 'F1-MDP-1',
      target: 'MHO-10',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-MDP1-FH10',
      name: 'LV Feed F1-MDP-1 → FH10',
      source: 'F1-MDP-1',
      target: 'FH10',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [],
    },
    {
      id: 'LV-MDP9-MDP9HOT',
      name: 'LV Feed F1-MDP-9 → F1-MDP-9 (HOT)',
      source: 'F1-MDP-9',
      target: 'F1-MDP-9-HOT',
      edgeType: 'power',
      status: 'operational',
      specs: {
        voltage: '400 V',
        notes: 'Hot zone main supply section fed from F1-MDP-9 busbar.',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'mdp9-hot-1', text: 'Check outgoing MCCB Q-HOT in F1-MDP-9 — ON/OFF/TRIP.' },
      ],
    },

    // ── Tier 3 load connections ───────────────────────────────────────────────────
    {
      id: 'LOAD-MDP1-PUMP1',
      name: 'Circuit F1-MDP-1 → Cooling Pump P10.01',
      source: 'F1-MDP-1',
      target: 'PUMP-F10-COOL-1',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', crossSection: '4×6 mm²', notes: 'MCCB Q-P1001, 40 A' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-p1001-1', text: 'Check MCCB Q-P1001 in F1-MDP-1 — tripped or open.' },
        { id: 'e-p1001-2', text: 'Measure voltage at starter input terminals.' },
      ],
    },
    {
      id: 'LOAD-MDP9-PUMP2',
      name: 'Circuit F1-MDP-9 → Cooling Pump P10.02',
      source: 'F1-MDP-9',
      target: 'PUMP-F10-COOL-2',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', crossSection: '4×6 mm²', notes: 'MCCB Q-P1002, 40 A' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-p1002-1', text: 'Check MCCB Q-P1002 in F1-MDP-9.' },
      ],
    },
    {
      id: 'LOAD-HOT10-CAF1',
      name: 'Circuit HOT-10 → Cooling Fan CAF10.01',
      source: 'HOT-10',
      target: 'CAF10-1',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', crossSection: '4×4 mm²', notes: 'MCCB Q-CAF01, 20 A — riser +5.135 m' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-caf1-1', text: 'Check MCCB Q-CAF01 in HOT-10 cabinet.' },
        { id: 'e-caf1-2', text: 'Verify VFD control power (24 V DC) from HOT-10 panel.' },
      ],
    },
    {
      id: 'LOAD-HOT10-CAF2',
      name: 'Circuit HOT-10 → Cooling Fan CAF10.02',
      source: 'HOT-10',
      target: 'CAF10-2',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', crossSection: '4×4 mm²', notes: 'MCCB Q-CAF02, 20 A — riser +5.135 m' },
      route: { pathType: 'riser', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-caf2-1', text: 'Check MCCB Q-CAF02 in HOT-10 cabinet.' },
      ],
    },
    {
      id: 'LOAD-GENDP-DRIVE1',
      name: 'Circuit F1-GEN-DP → Batch Charger Drive M10.BCH.01',
      source: 'F1-GEN-DP',
      target: 'DRIVE-F10-BATCH-1',
      edgeType: 'power',
      status: 'operational',
      specs: { voltage: '400 V', crossSection: '4×16 mm²', notes: 'MCCB Q-BCH01, 63 A — VFD Sinamics S120' },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'e-bch1-1', text: 'Check MCCB Q-BCH01 in F1-GEN-DP — tripped or open.' },
        { id: 'e-bch1-2', text: 'Check VFD input voltage at Sinamics terminals.' },
        { id: 'e-bch1-3', text: 'Inspect DC bus fuses inside the drive cabinet.' },
      ],
    },

    // ── Tier 3 control circuit — PROFIBUS fieldbus runs parallel to the power
    //    cable in the same tray (rendered as a separated parallel lane).
    {
      id: 'FB-GENDP-DRIVE1',
      name: 'PROFIBUS F1-GEN-DP → Batch Charger Drive M10.BCH.01',
      source: 'F1-GEN-DP',
      target: 'DRIVE-F10-BATCH-1',
      edgeType: 'fieldbus',
      status: 'operational',
      specs: {
        crossSection: 'PROFIBUS DP — 1×2×0.64 mm² shielded twisted pair',
        notes: 'VFD speed reference and status telegrams (PPO type 4). Runs in same tray as power circuit Q-BCH01.',
        installationType: 'Cable tray — segregated control compartment',
      },
      route: { pathType: 'cable-tray', spansBuildings: false },
      troubleshootingSteps: [
        { id: 'fb-bch1-1', text: 'Check PROFIBUS bus termination — both end resistors ON.' },
        { id: 'fb-bch1-2', text: 'Verify PLC master heartbeat — slave address 12 responding.' },
        { id: 'fb-bch1-3', text: 'Inspect connector shield continuity at drive end.' },
      ],
    },
  ],
};
