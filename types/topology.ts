import type { TerminalBoxDetail } from '@/types/terminalBox';

export type AssetType =
  | 'mv-feed'
  | 'mv-switchgear'
  | 'transformer'
  | 'panel'
  | 'cabinet'
  | 'junction-box'
  | 'motor';

export type BuildingId =
  | 'utility'
  | 'furnace-10'
  | 'furnace-20'
  | 'batch-house'
  | 'cullet-tower'
  | 'warehouse';

export type TopologyLayer =
  | 'mv-feed'
  | 'mv-switchgear'
  | 'transformer'
  | 'lv-panel'
  | 'cabinet'
  | 'junction'
  | 'load';

/** Visual zone stripe — maps to building + elevation band */
export type LocationZone =
  | 'utility-basement-mv'
  | 'utility-ground'
  | 'furnace-10-ground'
  | 'furnace-10-elevated'
  | 'furnace-20-ground'
  | 'furnace-20-elevated'
  | 'batch-house-ground'
  | 'cullet-tower-ground'
  | 'warehouse-ground';

export type Status = 'operational' | 'investigation' | 'fault';

export type EdgeType =
  | 'mv'        // Medium-voltage power
  | 'power'     // LV power cable
  | 'plc'       // PLC / control signal
  | 'signal'    // Analogue / digital instrument signal
  | 'fieldbus'  // Profibus, PROFINET, EtherCAT, etc.
  | 'ethernet'; // Network / supervisory

export interface ExternalRefs {
  scadaTag?: string;
  osapiensAssetId?: string;
}

export interface PhysicalLocation {
  building: BuildingId;
  zone: LocationZone;
  floor: string;
  elevation: string;
  area: string;
  gridRef?: string;
}

export interface NodeLayout {
  building: BuildingId;
  /** Horizontal slot within a building branch (0 = centre / first) */
  branchIndex?: number;
}

export interface CableRoute {
  pathType: 'cable-tray' | 'underground' | 'riser' | 'overhead' | 'internal';
  spansBuildings?: boolean;
  fromBuilding?: BuildingId;
  toBuilding?: BuildingId;
}

export interface TroubleshootingStep {
  id: string;
  text: string;
}

export interface DeviceSpecs {
  voltage?: string;
  current?: string;
  power?: string;
  protection?: string;
  location?: string;
  manufacturer?: string;
  notes?: string;
}

export interface CableSpecs {
  crossSection?: string;
  maxLoad?: string;
  length?: string;
  voltage?: string;
  power?: string;
  installationType?: string;
  notes?: string;
}

/** Node input without canvas position — layout is computed from building + layer */
export interface TopologyNodeInput {
  id: string;
  name: string;
  assetType: AssetType;
  layer: TopologyLayer;
  status: Status;
  specs: DeviceSpecs;
  physicalLocation: PhysicalLocation;
  layout: NodeLayout;
  troubleshootingSteps: TroubleshootingStep[];
  externalRefs?: ExternalRefs;
  upstreamHint?: string;
  /** Populated from CSV import — internal terminals & commissioning items */
  terminalBox?: TerminalBoxDetail;
  /** building-detail nodes (e.g. TB grid) hidden on full-site overview */
  mapScope?: 'site' | 'building-detail' | 'overview-only';
  /**
   * Minimum depth tier at which this node is shown.
   * Tier 1 = site overview (MV lines, transformers, main panels)
   * Tier 2 = building detail (+ distribution cabinets, sub-panels)
   * Tier 3 = circuit detail (+ individual loads, motors, drives)
   * Defaults to 1 if omitted — no breaking change for existing nodes.
   */
  displayTier?: 1 | 2 | 3;
  /** Shown as a badge on panel/cabinet cards when downstream circuits are not yet individually modelled */
  circuitCount?: number;
  positionOverride?: { x: number; y: number };
  /**
   * Electrical subsystem classification — drives accent colour and the voltage badge
   * on transformer cards.
   *   mv        — 35 kV switchgear / MV feed (amber)
   *   lv-400v   — Standard 400 V supply chain (teal/green)  ← primary focus
   *   lv-6kv    — 6 kV compressor transformers (purple)
   *   lv-boost  — Electrode boosting transformers (violet)
   *   generator — Standby generator system (orange)
   * Nodes without this field fall back to the zone colour accent.
   */
  subsystem?: 'mv' | 'lv-400v' | 'lv-6kv' | 'lv-boost' | 'generator';
}

export interface TopologyNode extends Omit<TopologyNodeInput, 'layout' | 'positionOverride'> {
  position: { x: number; y: number };
}

export interface TopologyEdgeInput {
  id: string;
  name: string;
  source: string;
  target: string;
  edgeType: EdgeType;
  status: Status;
  specs: CableSpecs;
  troubleshootingSteps: TroubleshootingStep[];
  route?: CableRoute;
  externalRefs?: ExternalRefs;
  upstreamHint?: string;
  /**
   * Injected at render-time by `assignParallelIndices` — never set in data files.
   * Used by PowerCableEdge to laterally offset co-linear cables so they render
   * as distinct parallel lines rather than a single merged stroke.
   */
  parallelIndex?: number;
  totalParallel?: number;
  /** True when source and target are the same pair (offset both ends).
   *  False for fan-out groups (offset source end only). */
  parallelBothEnds?: boolean;
}

export type TopologyEdge = TopologyEdgeInput;

export interface SiteInstallation {
  id: BuildingId;
  label: string;
  nodes: TopologyNodeInput[];
  edges: TopologyEdgeInput[];
}

export interface TopologyZone {
  id: string;
  zone: LocationZone;
  label: string;
  layerLabel: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export function isTopologyEdge(
  item: TopologyNode | TopologyEdge
): item is TopologyEdge {
  return 'source' in item;
}
