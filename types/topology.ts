export type AssetType =
  | 'mv-feed'
  | 'mv-switchgear'
  | 'transformer'
  | 'panel'
  | 'cabinet'
  | 'junction-box'
  | 'motor';

/** Vertical layer in the power-flow tree (0 = root / MV base at bottom). */
export type TopologyLayer =
  | 'mv-feed'
  | 'mv-switchgear'
  | 'transformer'
  | 'lv-panel'
  | 'cabinet'
  | 'junction'
  | 'load';

export type LocationZone =
  | 'basement-mv'
  | 'substation'
  | 'hall-a-ground'
  | 'hall-a-mezzanine'
  | 'hall-b-ground'
  | 'hall-c-ground';

export type Status = 'operational' | 'investigation' | 'fault';

export type EdgeType = 'power' | 'plc' | 'mv';

export interface ExternalRefs {
  scadaTag?: string;
  osapiensAssetId?: string;
}

export interface PhysicalLocation {
  zone: LocationZone;
  floor: string;
  elevation: string;
  area: string;
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
  installationType?: string;
  notes?: string;
}

export interface TopologyNode {
  id: string;
  name: string;
  assetType: AssetType;
  layer: TopologyLayer;
  status: Status;
  specs: DeviceSpecs;
  physicalLocation: PhysicalLocation;
  troubleshootingSteps: TroubleshootingStep[];
  position: { x: number; y: number };
  externalRefs?: ExternalRefs;
  upstreamHint?: string;
}

export interface TopologyEdge {
  id: string;
  name: string;
  source: string;
  target: string;
  edgeType: EdgeType;
  status: Status;
  specs: CableSpecs;
  troubleshootingSteps: TroubleshootingStep[];
  externalRefs?: ExternalRefs;
  upstreamHint?: string;
}

/** Background band grouping nodes by physical zone / elevation. */
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
