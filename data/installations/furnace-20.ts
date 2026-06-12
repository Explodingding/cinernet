import type { SiteInstallation } from '@/types/topology';

/**
 * Furnace 20 Building — LV distribution from real single-line diagram.
 *
 * Source drawing: SMT-5250 CNRBE-PMEP18-AB-XXX — Power Distribution System Riser Plan
 *
 * Power hierarchy:
 *   TR2.1 / TR2.2 / TR2.3 (utility building, 2500 kVA each) + TR-DPS (spare)
 *     → TR-DP2.1 / TR-DP2.2 / TR-DP2.3 / TR-DPS  (PFC 1500 kVAr panels, IP31 Form 4B TYPE6)
 *       → F2-MDP-1 … F2-MDP-9, F2-HOT-DP, F2-GEN-DP, F2-GEN-UP,
 *         F2-COLD-DP, F2-UO-DP, F2-MZ-DP, HOT-20, MHO-20, FH20,
 *         WE&FH20.1–20.4, CAF20.1–20.2, TC20.1–20.2,
 *         SIPAC-11 … SIPAC-24
 *
 * Note: SIPAC panels (SIPAC-11 to SIPAC-24) are process interface cabinets —
 *       IP31, Form 2B, PROCESS classification.
 */
export const furnace20Installation: SiteInstallation = {
  id: 'furnace-20',
  label: 'Furnace 20 Building',
  nodes: [],
    },
    {
      id: 'TR-DP2-2',
    position: { x: 0, y: 1820 },
      name: 'TR-DP2.2 — PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 10,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 electrical room',
        gridRef: 'TR-DP2.2',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC 1 500 kVAr. Fed from TR2.2 (Utility Building).',
      },
      troubleshootingSteps: [
        { id: 'trdp22-1', text: 'Check main ACB Q0 and PFC relay.' },
        { id: 'trdp22-2', text: 'Measure busbar voltage: 400 V ±5%.' },
      ],
    },
    {
      id: 'TR-DP2-3',
    position: { x: 0, y: 1860 },
      name: 'TR-DP2.3 — PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'operational',
      displayTier: 1,
      circuitCount: 10,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 electrical room',
        gridRef: 'TR-DP2.3',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. PFC 1 500 kVAr. Fed from TR2.3 (Utility Building).',
      },
      troubleshootingSteps: [
        { id: 'trdp23-1', text: 'Check main ACB Q0 and PFC relay.' },
        { id: 'trdp23-2', text: 'Measure busbar voltage: 400 V ±5%.' },
      ],
    },
    {
      id: 'TR-DPS',
    position: { x: 0, y: 1900 },
      name: 'TR-DPS — Spare PFC Panel (1 500 kVAr)',
      assetType: 'panel',
      layer: 'lv-panel',
      status: 'investigation',
      displayTier: 1,
      circuitCount: 0,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 electrical room — spare position',
        gridRef: 'TR-DPS',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B TYPE6, PROCESS. Spare PFC panel — fed from TR-DPS transformer. Normally isolated.',
      },
      troubleshootingSteps: [
        { id: 'trdps-1', text: 'Spare panel — confirm isolation before any work.' },
        { id: 'trdps-2', text: 'Check incoming isolator is OPEN — MV supply available but LV disconnected.' },
      ],
    },

    // ── Tier 2: Main Distribution Panels (F2-MDP) ────────────────────────────────
    {
      id: 'F2-MDP-1',
    position: { x: 0, y: 1940 },
      name: 'F2-MDP-1 — Main Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 16,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — electrical room ground floor',
        gridRef: 'F2-MDP-1',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'f2mdp1-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'f2mdp1-2', text: 'Measure busbar voltage L1-L2-L3.' },
      ],
    },
    {
      id: 'F2-MDP-9',
    position: { x: 0, y: 1680 },
      name: 'F2-MDP-9 — Main Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 20,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — main electrical room',
        gridRef: 'F2-MDP-9',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'f2mdp9-1', text: 'Check ACB Q0 — ON/OFF/TRIP.' },
      ],
    },
    {
      id: 'F2-HOT-DP',
    position: { x: 0, y: 1720 },
      name: 'F2-HOT-DP — Hot Zone Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 14,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 hot zone',
        gridRef: 'F2-HOT-DP',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'f2hot-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'f2hot-2', text: 'Use heat-rated PPE when working near furnace.' },
      ],
    },
    {
      id: 'F2-GEN-DP',
    position: { x: 0, y: 1760 },
      name: 'F2-GEN-DP — Generator Distribution Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 10,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — generator feed section',
        gridRef: 'F2-GEN-DP',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 4B, PROCESS. Generator-backed critical loads.',
      },
      troubleshootingSteps: [
        { id: 'f2gendp-1', text: 'Check ATS status — mains or generator source active.' },
        { id: 'f2gendp-2', text: 'Check ACB Q0 — ON/OFF/TRIP.' },
      ],
    },
    {
      id: 'HOT-20',
    position: { x: 0, y: 1800 },
      name: 'HOT-20 — Hot Zone Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 8,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-elevated',
        floor: 'Elevated',
        elevation: '+5.135 m',
        area: 'Furnace 20 — hot zone elevated level',
        gridRef: 'HOT-20',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'hot20-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
        { id: 'hot20-2', text: 'Use heat-rated PPE when working at elevated level near furnace.' },
      ],
    },
    {
      id: 'FH20',
    position: { x: 0, y: 1840 },
      name: 'FH20 — Field Panel',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      circuitCount: 4,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — field services',
        gridRef: 'FH20',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'fh20-1', text: 'Check MCCB Q0 — ON/OFF/TRIP.' },
      ],
    },

    // ── Tier 2: SIPAC Process Interface Cabinets ─────────────────────────────────
    // SIPAC-11 to SIPAC-14 = Furnace 20, set 1; SIPAC-21 to SIPAC-24 = set 2
    {
      id: 'SIPAC-11',
    position: { x: 3950, y: 1040 },
      name: 'SIPAC-11 — Process Interface Cabinet',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — SIPAC row',
        gridRef: 'SIPAC-11',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. Process interface cabinet — SCADA I/O and field instrumentation.',
      },
      troubleshootingSteps: [
        { id: 'sipac11-1', text: 'Check incoming MCB — ON/OFF/TRIP.' },
        { id: 'sipac11-2', text: 'Verify SCADA comms — Profibus/PROFINET link healthy.' },
      ],
    },
    {
      id: 'SIPAC-12',
    position: { x: 3995, y: 1040 },
      name: 'SIPAC-12 — Process Interface Cabinet',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'operational',
      displayTier: 2,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — SIPAC row',
        gridRef: 'SIPAC-12',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS.',
      },
      troubleshootingSteps: [
        { id: 'sipac12-1', text: 'Check incoming MCB — ON/OFF/TRIP.' },
      ],
    },
    {
      id: 'SIPAC-21',
    position: { x: 0, y: 1880 },
      name: 'SIPAC-21 — Process Interface Cabinet',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'investigation',
      displayTier: 2,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — SIPAC row (Phase 2)',
        gridRef: 'SIPAC-21',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. HOLD — Admin building design ongoing per SMT-5250.',
      },
      troubleshootingSteps: [
        { id: 'sipac21-1', text: 'Status: HOLD — Admin building design still ongoing.' },
        { id: 'sipac21-2', text: 'Do not energise until design confirmation received.' },
      ],
    },
    {
      id: 'SIPAC-22',
    position: { x: 0, y: 1920 },
      name: 'SIPAC-22 — Process Interface Cabinet',
      assetType: 'cabinet',
      layer: 'cabinet',
      status: 'investigation',
      displayTier: 2,
      physicalLocation: {
        building: 'furnace-20',
        zone: 'furnace-20-ground',
        floor: 'Ground',
        elevation: '0 m',
        area: 'Furnace 20 — SIPAC row (Phase 2)',
        gridRef: 'SIPAC-22',
      },
      specs: {
        voltage: '400 V / 230 V 50 Hz',
        notes: 'IP31, Form 2B, PROCESS. HOLD — Admin building design ongoing.',
      },
      troubleshootingSteps: [
        { id: 'sipac22-1', text: 'Status: HOLD — do not energise.' },
      ],
    },
  ],

  edges: [],
};
