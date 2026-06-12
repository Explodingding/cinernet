import type { EdgeType } from '@/types/topology';

/**
 * CABLE_COLOR_MAP — single source of truth for cable/edge-type colors.
 *
 * Consumed by:
 *   • components/topology/PowerCableEdge.tsx — canvas stroke / glow / label
 *   • components/layout/TopBar.tsx           — cable filter legend pills
 *
 * Status colors (fault red, investigation amber, derived-fault cascade) are
 * defined separately in lib/statusConfig.ts and ALWAYS override these base
 * colors on the canvas — cable-type color only shows on healthy circuits.
 *
 * Palette is tuned for the dark slate-900 canvas: every color must stay
 * legible at 2 px stroke width and must not collide with the status palette
 * (#f87171 fault red, #fbbf24 investigation amber).
 */
export interface CableColorConfig {
  /** Base stroke + legend color (hex) */
  color: string;
  /** Drop-shadow glow for the canvas line */
  glowColor: string;
  /** Full label shown in the filter dropdown */
  label: string;
  /** Compact badge label */
  shortLabel: string;
}

export const CABLE_COLOR_MAP: Record<EdgeType, CableColorConfig> = {
  hv: {
    color: '#f472b6',                      // magenta — 26 kV high voltage (Belgian HV >25 kV)
    glowColor: 'rgba(244, 114, 182, 0.40)',
    label: 'High Voltage (26 kV)',
    shortLabel: 'HV',
  },
  power: {
    color: '#059669',                      // green — 400 V LV power
    glowColor: 'rgba(52, 211, 153, 0.35)',
    label: 'LV Power',
    shortLabel: 'Power',
  },
  plc: {
    color: '#2563eb',                      // blue — PLC / control
    glowColor: 'rgba(96, 165, 250, 0.40)',
    label: 'Control (PLC)',
    shortLabel: 'PLC',
  },
  signal: {
    color: '#7c3aed',                      // violet — instrument signal
    glowColor: 'rgba(167, 139, 250, 0.40)',
    label: 'Instrument',
    shortLabel: 'Signal',
  },
  fieldbus: {
    color: '#c026d3',                      // pink — PROFIBUS / PROFINET
    glowColor: 'rgba(240, 171, 252, 0.40)',
    label: 'Fieldbus',
    shortLabel: 'Fieldbus',
  },
  ethernet: {
    color: '#0d9488',                      // teal — network / supervisory
    glowColor: 'rgba(45, 212, 191, 0.40)',
    label: 'Network',
    shortLabel: 'Network',
  },
};
